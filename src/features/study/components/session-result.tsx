import { Check, ArrowRight } from "lucide-react";
import type { View } from "../types";
export function SessionResult({
  total,
  correct: sessionCorrect,
  go,
}: {
  total: number;
  correct: number;
  go: (view: View) => void;
}) {
  return (
    <section className="completion card">
      <span className="completion-icon">
        <Check size={40} />
      </span>
      <h2>{total ? "演習結果" : "出題対象の問題はありません"}</h2>
      <p>
        {total
          ? `${total}問に取り組み、${sessionCorrect}問正解しました。`
          : "この分野の新しい問題と、今復習する問題はありません。"}
      </p>
      <p>復習期限を迎えた問題は、学習ホームから再度出題されます。</p>
      <button className="primary" onClick={() => go("home")}>
        学習ホームへ <ArrowRight size={16} />
      </button>
      <button className="text-link" onClick={() => go("library")}>
        ライブラリから自由に練習する
      </button>
    </section>
  );
}
