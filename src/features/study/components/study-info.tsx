import type { QuestionKind } from "../../../lib/questions";
export function StudyInfo({ kind }: { kind: QuestionKind }) {
  return (
    <aside className="study-aside card">
      <h3>出題情報</h3>
      <dl className="exam-details">
        <div>
          <dt>対象</dt>
          <dd>給与計算実務能力検定2級</dd>
        </div>
        <div>
          <dt>年度</dt>
          <dd>2026年度版</dd>
        </div>
        <div>
          <dt>法令基準日</dt>
          <dd>2026年9月1日</dd>
        </div>
        <div>
          <dt>ジャンル</dt>
          <dd>{kind === "calculation" ? "計算問題" : "知識問題"}</dd>
        </div>
      </dl>
      <div className="divider" />
      <h3>復習の評価</h3>
      <p>
        誤答は「もう一度」として記録します。正答時は理解度を選択してください。評価に応じて次回の復習日を計算します。
      </p>
    </aside>
  );
}
