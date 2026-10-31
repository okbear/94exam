import { Check, X } from "lucide-react";
import { questions } from "../../../lib/questions";
import type { Review } from "../../../lib/study";
import { ratingLabels } from "../labels";
export function RecentHistory({ reviews }: { reviews: Review[] }) {
  return (
    <section className="card history-panel">
      <h3>最近の学習</h3>
      {reviews.length ? (
        reviews
          .slice(-10)
          .reverse()
          .map((r, i) => (
            <div className="history-row" key={i}>
              <span
                className={r.correct ? "result-dot good" : "result-dot bad"}
              >
                {r.correct ? <Check size={15} /> : <X size={15} />}
              </span>
              <b>{questions.find((q) => q.id === r.questionId)?.title}</b>
              <span>{ratingLabels[r.grade]}</span>
              <small>
                {new Intl.DateTimeFormat("ja-JP", {
                  month: "numeric",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "Asia/Tokyo",
                }).format(new Date(r.at))}
              </small>
            </div>
          ))
      ) : (
        <p className="empty-message">回答履歴はまだありません。</p>
      )}
    </section>
  );
}
