import { useState } from "react";
import { CalendarDays } from "lucide-react";
import { getTargetStatus } from "../../../lib/target-schedule";
import { TargetDateForm } from "./target-date-form";
export function TargetDateBanner({
  targetDate,
  ready,
  onSave,
}: {
  targetDate: string | null;
  ready: boolean;
  onSave: (date: string | null) => void;
}) {
  const [editing, setEditing] = useState(false);
  const status = getTargetStatus(targetDate);
  const heading =
    status.phase === "unset"
      ? "目標期日を設定しましょう"
      : status.phase === "upcoming"
        ? `目標期日まであと${status.daysRemaining}日`
        : status.phase === "today"
          ? "今日は目標期日です"
          : "目標期日を過ぎています";
  const description =
    status.phase === "unset"
      ? "目標期日を設定すると、残り日数に合わせて復習間隔を調整します。"
      : status.phase === "upcoming"
        ? `${targetDate?.replaceAll("-", "/")} ｜ 目標期日までに再復習できるよう、間隔を調整しています。`
        : "期日に合わせた復習間隔の調整は終了しています。次の目標期日を設定できます。";
  return (
    <section className="target-date-banner" aria-label="目標期日の設定">
      <div className="target-date-summary">
        <CalendarDays size={22} />
        <div>
          <h2>{heading}</h2>
          <p>{description}</p>
        </div>
        {!editing && (
          <button
            className={targetDate ? "secondary" : "primary"}
            disabled={!ready}
            onClick={() => setEditing(true)}
          >
            {targetDate ? "目標期日を変更" : "目標期日を設定"}
          </button>
        )}
      </div>
      {editing && (
        <TargetDateForm
          key={targetDate ?? "unset"}
          targetDate={targetDate}
          onSave={onSave}
          onCancel={() => setEditing(false)}
        />
      )}
    </section>
  );
}
