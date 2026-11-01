import { useState, type FormEvent } from "react";
import { earliestTargetDate } from "../../../lib/target-schedule";
export function TargetDateForm({
  targetDate,
  onSave,
  onCancel,
}: {
  targetDate: string | null;
  onSave: (date: string | null) => boolean | void;
  onCancel?: () => void;
}) {
  const [draft, setDraft] = useState(targetDate ?? "");
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (onSave(draft) !== false) onCancel?.();
  }
  return (
    <form className="target-date-form" onSubmit={submit}>
      <label>
        目標期日
        <input
          autoFocus={!!onCancel}
          type="date"
          aria-label="目標期日"
          required
          min={earliestTargetDate()}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      </label>
      <div className="target-date-actions">
        <button className="primary" type="submit">
          {targetDate ? "目標期日を保存" : "目標期日を設定"}
        </button>
        {targetDate && (
          <button
            className="secondary"
            type="button"
            onClick={() => {
              if (onSave(null) !== false) {
                setDraft("");
                onCancel?.();
              }
            }}
          >
            目標期日を解除
          </button>
        )}
        {onCancel && (
          <button className="text-link" type="button" onClick={onCancel}>
            キャンセル
          </button>
        )}
      </div>
      <p className="target-date-hint">
        明日以降の日付を指定してください。このブラウザに保存されます。
      </p>
    </form>
  );
}
