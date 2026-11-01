import { TargetDateBanner } from "../components/target-date-banner";
import { DifficultySelector } from "../components/difficulty-selector";
import {
  CalendarDays,
  GraduationCap,
  ArrowRight,
  Target,
  RotateCcw,
  BookOpen,
  Flame,
  CircleHelp,
} from "lucide-react";
import { questions } from "../../../lib/questions";
import { makeQueue, type StudyData } from "../../../lib/study";
import type { StudySummary } from "../../../lib/study-summary";
import type { DifficultyFilter, Genre, StartStudy, View } from "../types";
import { sessionSize } from "../hooks/use-study-session";
import { GenreSelector } from "../components/genre-selector";
import { Stat } from "../components/stat";
import { CategoryList } from "../components/category-list";
import { DailyGoal } from "../components/daily-goal";
type Props = {
  data: StudyData;
  ready: boolean;
  setTargetDate: (date: string | null) => boolean | void;
  summary: StudySummary;
  difficulty: DifficultyFilter;
  setDifficulty: (difficulty: DifficultyFilter) => void;
  kind: Genre;
  setKind: (kind: Genre) => void;
  start: StartStudy;
  go: (view: View) => void;
  onHelp: () => void;
};
export function HomeScreen({
  data,
  ready,
  setTargetDate,
  summary,
  difficulty,
  setDifficulty,
  kind,
  setKind,
  start,
  go,
  onHelp,
}: Props) {
  const { todayCount, due, learned, accuracy, streak } = summary;
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>給与計算の演習</h1>
          <p>
            2026年度版 ／ 全{questions.length}問 ／ 法令基準日：2026年9月1日
          </p>
        </div>
        <div className="date-label">
          <CalendarDays size={16} />
          {ready
            ? new Intl.DateTimeFormat("ja-JP", {
                month: "long",
                day: "numeric",
                weekday: "short",
                timeZone: "Asia/Tokyo",
              }).format(new Date())
            : "今日の学習"}
        </div>
      </div>
      <TargetDateBanner
        targetDate={data.targetDate}
        ready={ready}
        onSave={setTargetDate}
      />
      <DifficultySelector
        value={difficulty}
        onChange={setDifficulty}
        kind={kind}
      />
      <section className="genre-selector" aria-label="問題ジャンル">
        <div>
          <GraduationCap size={18} />
          <span>出題ジャンル</span>
        </div>
        <GenreSelector
          value={kind}
          onChange={setKind}
          difficulty={difficulty}
          showUnit
        />
      </section>
      <section className="practice-start card" aria-label="演習を開始">
        <div>
          <h2>復習・新規問題を解く</h2>
          <p>復習期限を迎えた問題を優先して、1回最大10問出題します。</p>
          <span className="session-count">
            今回の出題：
            {Math.min(
              sessionSize,
              makeQueue(
                data,
                undefined,
                new Date(),
                kind === "all" ? undefined : kind,
                difficulty === "all" ? undefined : difficulty,
              ).length,
            )}
            問
          </span>
        </div>
        <button className="primary" disabled={!ready} onClick={() => start()}>
          演習を開始 <ArrowRight size={17} />
        </button>
      </section>
      <div className="mobile-goal">
        <span>
          <Target size={16} />
          今日の目標
        </span>
        <b>
          {todayCount}
          <small> / {data.goal}問</small>
        </b>
        <div className="progress-track">
          <span
            style={{
              width: `${Math.min(100, (todayCount / data.goal) * 100)}%`,
            }}
          />
        </div>
      </div>
      <section className="stats-grid">
        <Stat
          icon={<RotateCcw size={18} />}
          label="復習待ち"
          value={due}
          unit="問"
          sub={due ? "復習期限を迎えた問題" : "期限を迎えた問題なし"}
          tone="green"
        />
        <Stat
          icon={<BookOpen size={18} />}
          label="学習した問題"
          value={learned}
          unit={`/ ${questions.length} 問`}
          sub="回答済みの問題数"
          tone="blue"
        />
        <Stat
          icon={<Target size={18} />}
          label="これまでの正答率"
          value={accuracy}
          unit="%"
          sub={
            data.reviews.length
              ? `${data.reviews.length}回の回答から集計`
              : "回答後に集計します"
          }
          tone="orange"
        />
        <Stat
          icon={<Flame size={18} />}
          label="連続学習"
          value={streak}
          unit="日"
          sub="日本時間で集計"
          tone="pink"
        />
      </section>
      <div className="dashboard-bottom">
        <CategoryList
          data={data}
          difficulty={difficulty}
          kind={kind}
          start={start}
          onLibrary={() => go("library")}
        />
        <DailyGoal
          count={todayCount}
          goal={data.goal}
          onSettings={() => go("settings")}
        />
      </div>
      <div className="edition-note">
        <span>復習方式：FSRS-7 ／ 目標保持率：90%</span>
        <button className="text-link" onClick={() => onHelp()}>
          出題・教材について <CircleHelp size={14} />
        </button>
      </div>
    </>
  );
}
