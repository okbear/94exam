import type { StudySummary } from "../../../lib/study-summary";
export function ActivityChart({ summary }: { summary: StudySummary }) {
  return (
    <section className="card activity-panel">
      <h3>直近7日間の回答数</h3>
      <div className="activity-chart">
        {summary.activity.map((day) => (
          <div className="activity-day" key={day.day}>
            <strong>
              {day.count}
              <small>問</small>
            </strong>
            <div className="bar-track">
              <span
                style={{
                  height: `${(day.count / summary.activityMax) * 100}%`,
                }}
              />
            </div>
            <small>{day.label}</small>
          </div>
        ))}
      </div>
    </section>
  );
}
