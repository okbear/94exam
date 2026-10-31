import { ArrowUpRight } from "lucide-react";
import { questions, edition } from "../../../lib/questions";
import { PageTitle } from "../components/page-title";
import { BackupControls } from "../components/backup-controls";
type Props = {
  goal: number;
  setGoal: (goal: number) => void;
  exportData: () => void;
  importData: (file?: File) => Promise<void>;
  onReset: () => void;
};
export function SettingsScreen({
  goal,
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
          2級の公式出題範囲をもとに作成したオリジナル問題
          {questions.length}
          問です。2026年11月試験を想定し、法令基準日は2026年9月1日。2026年11月1日に公的情報を調査しました。年末調整は収録対象に含めません。
        </p>
        <p>
          2026年度の雇用保険料率、介護保険料率、子ども・子育て支援金を反映。健康保険の医療分は都道府県・保険者で異なるため、計算条件を問題ごとに明記しています。
        </p>
        <a
          className="source-link"
          href={edition.officialExam}
          target="_blank"
          rel="noreferrer"
        >
          主催団体の試験案内を確認 <ArrowUpRight size={13} />
        </a>
        <div className="divider" />
        <h3>復習のしくみ</h3>
        <p>
          FSRS-7で記憶の安定度と難易度を更新し、目標保持率90%で復習時期を計算します。個人の履歴によるパラメータ学習は行っていません。正誤と自己評価で、問題ごとの復習間隔が変わります。
        </p>
        <div className="divider" />
        <h3>学習履歴のリセット</h3>
        <p>
          回答履歴・復習予定・ブックマークを削除します。先にバックアップを書き出すことをおすすめします。
        </p>
        <button className="danger-button" onClick={onReset}>
          学習履歴をリセット
        </button>
      </section>
    </>
  );
}
