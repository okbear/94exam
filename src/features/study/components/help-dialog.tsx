import { useEffect } from "react";
import { X, Leaf, ArrowRight, ArrowUpRight } from "lucide-react";
import { edition, questions } from "../../../lib/questions";
export function HelpDialog({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={() => onClose()}>
      <section
        className="modal card"
        role="dialog"
        aria-modal="true"
        aria-label="学び舎について"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key !== "Tab") return;
          const focusables =
            e.currentTarget.querySelectorAll<HTMLElement>("button, [href]");
          const first = focusables[0],
            last = focusables[focusables.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }}
      >
        <button
          autoFocus
          className="modal-close icon-button"
          aria-label="閉じる"
          onClick={() => onClose()}
        >
          <X size={20} />
        </button>
        <span className="mini-spark">
          <Leaf size={25} />
        </span>
        <h2>出題・教材について</h2>
        <p>
          給与の学び舎は、給与計算の知識と計算を難易度別に学ぶための演習サイトです。
        </p>
        <h3>復習方式：FSRS-7</h3>
        <p>
          FSRS-7が回答ごとに記憶の安定度・難易度を更新。「もう一度」は短い間隔で、「できた」「余裕」は長い間隔で出題します。復習期限を迎えた問題を新しい問題より優先します。目標期日を設定すると、残り日数に応じて復習間隔の上限を調整します。
        </p>
        <p>
          目標保持率は90%。復習時期は推定であり、記憶の定着を保証するものではありません。
        </p>
        <h3>2026年度版の収録問題</h3>
        <p>
          2026年度版のオリジナル問題{questions.length}
          問を収録。初級は基本知識・単純計算、中級は条件判断・複数手順の計算、上級は例外・上限・総合演習です。知識問題・計算問題や分野と組み合わせて選べます。難易度は当サイト独自の分類です。法令の基準日は2026年9月1日、調査確認日は2026年11月1日です。
        </p>
        <a
          className="source-link"
          href={edition.sourceGuide}
          target="_blank"
          rel="noreferrer"
        >
          厚生労働省の制度解説 <ArrowUpRight size={13} />
        </a>
        <br />
        <button className="primary" onClick={() => onClose()}>
          学習を続ける <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
}
