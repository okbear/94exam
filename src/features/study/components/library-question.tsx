import { Bookmark, ArrowRight } from "lucide-react";
import { difficultyInfo, type Question } from "../../../lib/questions";
import { intervalLabel, type SavedCard } from "../../../lib/study";
export function LibraryQuestion({
  question: q,
  card,
  attempts,
  bookmarked,
  onBookmark,
  onStart,
}: {
  question: Question;
  card?: SavedCard;
  attempts?: { correct: number; total: number };
  bookmarked: boolean;
  onBookmark: () => void;
  onStart: () => void;
}) {
  return (
    <div className="library-row">
      <button
        className={bookmarked ? "icon-button bookmarked" : "icon-button"}
        aria-label={bookmarked ? "ブックマークを解除" : "ブックマークに追加"}
        aria-pressed={bookmarked}
        onClick={() => onBookmark()}
      >
        <Bookmark size={18} />
      </button>
      <button className="library-question" onClick={() => onStart()}>
        <small>
          {difficultyInfo[q.difficulty].label} ·{" "}
          {q.knowledgeRequired
            ? "知識＋計算"
            : q.kind === "calculation"
              ? "計算"
              : "知識"}{" "}
          · {q.category}{q.referenceMaterials ? " · 別資料あり" : ""}
        </small>
        <span>{q.prompt}</span>
      </button>
      <div className="library-due">
        <b>
          {attempts
            ? `正解 ${attempts.correct}回 / 回答 ${attempts.total}回`
            : "未回答"}
        </b>
        {card && (
          <span>
            {Date.parse(card.dueAt) <= Date.now()
              ? "復習のタイミング"
              : `次回の復習 ${intervalLabel(card.dueAt)}`}
          </span>
        )}
      </div>
      <button
        className="icon-button"
        aria-label="この問題を解く"
        onClick={() => onStart()}
      >
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
