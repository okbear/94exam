import type { Grade, SavedCard, StudyData } from "./study";
const dayMs = 86_400_000;
const japaneseDate = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Tokyo",
});
export function isTargetDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const date = new Date(`${value}T00:00:00+09:00`);
  return Number.isFinite(date.getTime()) && japaneseDate.format(date) === value;
}
export function getTargetStatus(targetDate: string | null, now = new Date()) {
  if (!targetDate) return { phase: "unset" as const, daysRemaining: 0 };
  const today = japaneseDate.format(now);
  const daysRemaining = Math.round(
    (Date.parse(`${targetDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) /
      dayMs,
  );
  return {
    phase:
      daysRemaining > 0
        ? ("upcoming" as const)
        : daysRemaining === 0
          ? ("today" as const)
          : ("past" as const),
    daysRemaining,
  };
}
export function earliestTargetDate(now = new Date()) {
  const tomorrow = new Date(`${japaneseDate.format(now)}T00:00:00Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}
// These are app-specific ceilings layered over FSRS, not changes to its memory model.
const limits: Record<Grade, { days: number; fraction: number }> = {
  1: { days: 1, fraction: 1 / 8 },
  2: { days: 3, fraction: 1 / 8 },
  3: { days: 7, fraction: 1 / 5 },
  4: { days: 14, fraction: 1 / 3 },
};
export function limitReviewToTarget(
  card: SavedCard,
  targetDate: string | null,
  grade: Grade,
  reviewedAt: Date,
): SavedCard {
  if (!targetDate) return card;
  const remaining =
    Date.parse(`${targetDate}T00:00:00+09:00`) - reviewedAt.getTime();
  // On/after the target date, stop applying deadline limits and allow ordinary learning.
  if (remaining <= 0) return card;
  const limit = limits[grade];
  const delay = Math.min(limit.days * dayMs, remaining * limit.fraction);
  const due = Math.min(Date.parse(card.dueAt), reviewedAt.getTime() + delay);
  if (due === Date.parse(card.dueAt)) return card;
  return {
    ...card,
    dueAt: new Date(due).toISOString(),
    scheduledDays: Math.max(0, (due - reviewedAt.getTime()) / dayMs),
  };
}
export function reconcileTargetSchedule(
  data: StudyData,
  now = new Date(),
): StudyData {
  if (getTargetStatus(data.targetDate, now).phase !== "upcoming") return data;
  const latestGrade = new Map<string, Grade>();
  for (const review of data.reviews)
    latestGrade.set(review.questionId, review.grade);
  const cards = Object.fromEntries(
    Object.entries(data.cards).map(([id, card]) => {
      if (Date.parse(card.dueAt) <= now.getTime()) return [id, card];
      const anchor = card.lastReviewAt ? new Date(card.lastReviewAt) : now;
      return [
        id,
        limitReviewToTarget(
          card,
          data.targetDate,
          latestGrade.get(id) ?? 4,
          anchor,
        ),
      ];
    }),
  );
  return { ...data, cards };
}
export function changeTargetDate(
  data: StudyData,
  targetDate: string | null,
  now = new Date(),
): StudyData {
  if (
    targetDate !== null &&
    (!isTargetDate(targetDate) || targetDate < earliestTargetDate(now))
  )
    throw new Error("目標期日は明日以降の日付を指定してください。");
  // Changing/removing a deadline never postpones an already scheduled review.
  return reconcileTargetSchedule({ ...data, targetDate }, now);
}
