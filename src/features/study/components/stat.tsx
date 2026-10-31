import type { ReactNode } from "react";
export function Stat({
  icon,
  label,
  value,
  unit,
  sub,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  unit: string;
  sub: string;
  tone: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-label">
        <span className={`stat-icon ${tone}`}>{icon}</span>
        {label}
      </div>
      <div className="stat-value">
        {value}
        <small>{unit}</small>
      </div>
      <p>{sub}</p>
    </div>
  );
}
