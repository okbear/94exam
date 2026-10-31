import { Bookmark, ArrowRight } from "lucide-react";
import type { Question } from "../../../lib/questions";
import { intervalLabel, type SavedCard } from "../../../lib/study";
export function LibraryQuestion({
  question: q,
  card,
  bookmarked,
  onBookmark,
  onStart,
}: {
  question: Question;
  card?: SavedCard;
  bookmarked: boolean;
  onBookmark: () => void;
  onStart: () => void;
}) {
  return (
    <div className="library-row">
      <button
        className={bookmarked ? "icon-button bookmarked" : "icon-button"}
        aria-label={`${q.title}のブックマーク`}
        onClick={() => onBookmark()}
      >
        <Bookmark size={18} />
      </button>
      <button className="library-question" onClick={() => onStart()}>
        <small>
          {q.kind === "calculation" ? "計算" : "知識"} · {q.category}
        </small>
        <b>{q.title}</b>
        <span>{q.prompt}</span>
      </button>
      <span className="library-due">
        {card
          ? Date.parse(card.dueAt) <= Date.now()
            ? "復習のタイミング"
            : intervalLabel(card.dueAt)
          : "未学習"}
      </span>
      <button
        className="icon-button"
        aria-label={`${q.title}を解く`}
        onClick={() => onStart()}
      >
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
