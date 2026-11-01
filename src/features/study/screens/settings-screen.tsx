import { TargetDateForm } from "../components/target-date-form";
import { ArrowUpRight } from "lucide-react";
import { questions, edition } from "../../../lib/questions";
import { PageTitle } from "../components/page-title";
import { BackupControls } from "../components/backup-controls";
type Props = {
  goal: number;
  targetDate: string | null;
  setTargetDate: (date: string | null) => void;
  setGoal: (goal: number) => void;
  exportData: () => void;
  importData: (file?: File) => Promise<void>;
  onReset: () => void;
};
export function SettingsScreen({
  goal,
  targetDate,
  setTargetDate,
  setGoal,
  exportData,
  importData,
  onReset,
}: Props) {
  return (
    <>
      <PageTitle
        title="学習の設定"
        description="学習目標・バックアップ・教材情報を管理します。"
      />
      <section className="card settings-panel">
        <h3>目標期日</h3>
        <p>
          残り日数に合わせて復習間隔を調整します。変更すると、長すぎる既存の復習予定も前倒しします。
        </p>
        <TargetDateForm
          key={targetDate ?? "unset"}
          targetDate={targetDate}
          onSave={setTargetDate}
        />
        <div className="divider" />
        <h3>1日の学習目標</h3>
        <p>毎日取り組みたい問題数を設定します。</p>
        <label className="goal-input">
          1日{" "}
          <select
            value={goal}
            onChange={(e) => setGoal(Number(e.target.value))}
          >
            {[
              5,
              10,
              15,
              20,
              30,
              ...(![5, 10, 15, 20, 30].includes(goal) ? [goal] : []),
            ].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>{" "}
          問
        </label>
        <div className="divider" />
        <BackupControls exportData={exportData} importData={importData} />
        <div className="divider" />
        <h3>2026年度版・教材の基準</h3>
        <p>
          初級・中級・上級に分類したオリジナル問題
          {questions.length}
          問です。基本用語と単純計算を初級、条件の判断と複数手順の計算を中級、例外・上限と総合演習を上級としています。法令基準日は2026年9月1日、調査確認日は2026年11月1日です。
        </p>
        <p>
          2026年度の雇用保険料率、介護保険料率、子ども・子育て支援金を反映。健康保険の医療分は都道府県・保険者で異なるため、計算条件を問題ごとに明記しています。
        </p>
        <a
          className="source-link"
          href={edition.sourceGuide}
          target="_blank"
          rel="noreferrer"
        >
          厚生労働省の制度解説を確認 <ArrowUpRight size={13} />
        </a>
        <div className="divider" />
        <h3>復習のしくみ</h3>
        <p>
          FSRS-7で記憶の安定度と難易度を更新し、目標保持率90%で復習時期を計算します。個人の履歴によるパラメータ学習は行っていません。正誤と自己評価で、問題ごとの復習間隔が変わります。目標期日を設定すると、FSRSの推定より長くならない範囲で、残り日数に応じた上限を適用します。「できた」と「余裕」には異なる上限を使います。目標期日当日以降は通常の間隔に戻ります。
        </p>
        <div className="divider" />
        <h3>学習履歴のリセット</h3>
        <p>
          回答履歴は50,000件まで保存できます。上限に達した場合は、バックアップを書き出してからリセットしてください。回答履歴・復習予定・ブックマークを削除します。目標期日と学習目標は保持します。先にバックアップを書き出すことをおすすめします。
        </p>
        <button className="danger-button" onClick={onReset}>
          学習履歴をリセット
        </button>
      </section>
    </>
  );
}
