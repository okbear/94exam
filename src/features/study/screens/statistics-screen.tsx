import { BookOpen, Target, Flame, ShieldCheck } from "lucide-react";
import type { StudyData } from "../../../lib/study";
import type { StudySummary } from "../../../lib/study-summary";
import { PageTitle } from "../components/page-title";
import { Stat } from "../components/stat";
import { ActivityChart } from "../components/activity-chart";
import { RecentHistory } from "../components/recent-history";
export function StatisticsScreen({
  data,
  summary,
}: {
  data: StudyData;
  summary: StudySummary;
}) {
  const { accuracy, streak, mastered } = summary;
  return (
    <>
      <PageTitle
        title="学習の記録"
        description="回答数・正答率・復習状況を確認できます。"
      />
      <section className="stats-grid">
        <Stat
          icon={<BookOpen size={18} />}
          label="総回答数"
          value={data.reviews.length}
          unit="回"
          sub="これまでの回答の合計"
          tone="green"
        />
        <Stat
          icon={<Target size={18} />}
          label="正答率"
          value={accuracy}
          unit="%"
          sub="すべての回答を集計"
          tone="blue"
        />
        <Stat
          icon={<Flame size={18} />}
          label="連続学習"
          value={streak}
          unit="日"
          sub="日本時間の日付で記録"
          tone="orange"
        />
        <Stat
          icon={<ShieldCheck size={18} />}
          label="復習段階の問題"
          value={mastered}
          unit="問"
          sub="FSRSの復習段階に到達"
          tone="pink"
        />
      </section>
      <ActivityChart summary={summary} />
      <RecentHistory reviews={data.reviews} />
    </>
  );
}
