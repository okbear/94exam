import type { CSSProperties } from "react";
import { ChevronRight } from "lucide-react";
export function DailyGoal({
  count: todayCount,
  goal,
  onSettings,
}: {
  count: number;
  goal: number;
  onSettings: () => void;
}) {
  return (
    <aside className="daily-panel">
      <div className="section-heading">
        <h3>今日の進捗</h3>
        <span className="small-sun">☀</span>
      </div>
      <div
        className="goal-ring"
        style={
          {
            "--progress": `${Math.min(100, (todayCount / goal) * 100)}%`,
          } as CSSProperties
        }
      >
        <div>
          <strong>
            {todayCount}
            <small> / {goal}</small>
          </strong>
          <span>問 学習しました</span>
        </div>
      </div>
      <p className="goal-copy">
        {todayCount >= goal
          ? "目標達成"
          : "あと" + (goal - todayCount) + "問で目標達成"}
      </p>
      <div className="divider" />
      <button className="text-link" onClick={() => onSettings()}>
        学習目標を変更 <ChevronRight size={14} />
      </button>
    </aside>
  );
}
