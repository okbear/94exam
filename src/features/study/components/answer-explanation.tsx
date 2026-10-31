import { Check, RotateCcw, ArrowUpRight } from "lucide-react";
import type { Question } from "../../../lib/questions";
import {
  Rating,
  intervalLabel,
  type Grade,
  type SavedCard,
} from "../../../lib/study";
import { ratingLabels } from "../labels";
type Props = {
  question: Question;
  correct: boolean;
  options: { grade: Grade; card: SavedCard }[];
  busy: boolean;
  onGrade: (grade: Grade) => Promise<void>;
};
export function AnswerExplanation({
  question: q,
  correct,
  options,
  busy,
  onGrade,
}: Props) {
  return (
    <div className="explanation" aria-live="polite">
      <h3 className={correct ? "text-green" : "text-orange"}>
        {correct ? <Check size={21} /> : <RotateCcw size={20} />}{" "}
        {correct ? "正解" : "不正解"}
      </h3>
      {q.formula && <div className="formula">{q.formula}</div>}
      <p>{q.explanation}</p>
      {q.source && (
        <a
          className="source-link"
          href={q.source}
          target="_blank"
          rel="noreferrer"
        >
          公的な解説を確認する <ArrowUpRight size={13} />
        </a>
      )}
      <div className="rating-heading" tabIndex={-1}>
        {correct
          ? "理解度を選択して次の問題へ進んでください。"
          : "次回は短い間隔で復習します。"}
      </div>
      <div className="ratings">
        {options
          .filter((o) => correct || o.grade === Rating.Again)
          .map((o) => (
            <button
              disabled={busy}
              className={`rating rating-${o.grade}`}
              key={o.grade}
              onClick={() => void onGrade(o.grade)}
            >
              <b>{ratingLabels[o.grade]}</b>
              <small>{intervalLabel(o.card.dueAt)}</small>
            </button>
          ))}
      </div>
    </div>
  );
}
