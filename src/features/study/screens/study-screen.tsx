import type { StudyData } from "../../../lib/study";
import type { StudySession } from "../hooks/use-study-session";
import type { View } from "../types";
import { QuestionCard } from "../components/question-card";
import { SessionResult } from "../components/session-result";
import { StudyInfo } from "../components/study-info";
export function StudyScreen({
  data,
  session,
  bookmark,
  go,
}: {
  data: StudyData;
  session: StudySession;
  bookmark: (id: string) => void;
  go: (view: View) => void;
}) {
  const { question: q, queue, sessionCorrect } = session;
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>演習問題</h1>
          <p>解答を選択し、正誤を確認してください。</p>
        </div>
        <button className="secondary" onClick={() => go("home")}>
          ホームへ戻る
        </button>
      </div>
      {!q ? (
        <SessionResult total={queue.length} correct={sessionCorrect} go={go} />
      ) : (
        <div className="study-layout">
          <QuestionCard
            question={q}
            session={session}
            bookmarked={data.bookmarks.includes(q.id)}
            onBookmark={() => bookmark(q.id)}
          />
          <StudyInfo kind={q.kind} />
        </div>
      )}
    </>
  );
}
