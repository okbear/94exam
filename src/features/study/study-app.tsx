import { StorageRecovery } from "./components/storage-recovery";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { getStudySummary } from "../../lib/study-summary";
import { useStudyData } from "./hooks/use-study-data";
import { useStudySession } from "./hooks/use-study-session";
import type {
  DifficultyFilter,
  Genre,
  LibraryFilters,
  StartStudy,
  View,
} from "./types";
import { StudyLayout } from "./components/study-layout";
import { HelpDialog } from "./components/help-dialog";
import { HomeScreen } from "./screens/home-screen";
import { StudyScreen } from "./screens/study-screen";
import { LibraryScreen } from "./screens/library-screen";
import { StatisticsScreen } from "./screens/statistics-screen";
import { SettingsScreen } from "./screens/settings-screen";

export function StudyApp() {
  const store = useStudyData();
  const session = useStudySession(store.data, store.setData, store.setNotice);
  const [view, setView] = useState<View>("home");
  const [help, setHelp] = useState(false);
  const [difficulty, setDifficulty] = useState<DifficultyFilter>("all");
  const [kind, setKind] = useState<Genre>("all");
  const [filters, setFilters] = useState<LibraryFilters>({
    category: "all",
    search: "",
    onlyBookmarks: false,
  });
  const [, tick] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => tick((v) => v + 1), 30000);
    return () => window.clearInterval(timer);
  }, []);
  const summary = getStudySummary(store.data);
  function go(view: View) {
    setView(view);
    setHelp(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  const start: StartStudy = (category, questionId) => {
    session.start(
      kind,
      category,
      questionId,
      difficulty === "all" ? undefined : difficulty,
    );
    go("study");
  };
  return (
    <StudyLayout
      view={view}
      due={summary.due}
      go={go}
      onHelp={() => setHelp(true)}
    >
      {store.notice && (
        <div className="notice" role="status">
          {store.notice}
          <button aria-label="通知を閉じる" onClick={() => store.setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {store.recoveryRequired && (
        <StorageRecovery
          exportOriginalData={store.exportOriginalData}
          importData={store.importData}
          onReset={store.reset}
        />
      )}
      {!store.recoveryRequired && (
        <>
          {view === "home" && (
            <HomeScreen
              data={store.data}
              ready={store.ready}
              setTargetDate={store.setTargetDate}
              summary={summary}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              kind={kind}
              setKind={setKind}
              start={start}
              go={go}
              onHelp={() => setHelp(true)}
            />
          )}
          {view === "study" && (
            <StudyScreen
              data={store.data}
              session={session}
              bookmark={store.bookmark}
              go={go}
            />
          )}
          {view === "library" && (
            <LibraryScreen
              data={store.data}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              kind={kind}
              setKind={setKind}
              filters={filters}
              onFiltersChange={setFilters}
              bookmark={store.bookmark}
              start={start}
            />
          )}
          {view === "stats" && (
            <StatisticsScreen data={store.data} summary={summary} />
          )}
          {view === "settings" && (
            <SettingsScreen
              goal={store.data.goal}
              targetDate={store.data.targetDate}
              setTargetDate={store.setTargetDate}
              setGoal={store.setGoal}
              exportData={store.exportData}
              importData={store.importData}
              onReset={store.reset}
            />
          )}
          {help && <HelpDialog onClose={() => setHelp(false)} />}
        </>
      )}
    </StudyLayout>
  );
}
