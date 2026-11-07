import { questions } from "./questions";
import { dayKey, type StudyData } from "./study";

export function getStudySummary(data: StudyData, now = new Date()) {
  const dailyCounts = new Map<string, number>();
  for (const review of data.reviews) {
    const day = dayKey(new Date(review.at));
    dailyCounts.set(day, (dailyCounts.get(day) ?? 0) + 1);
  }
  const today = dayKey(now);
  // Calendar arithmetic uses UTC on the Japanese date, independent of host timezone.
  const calendarDay = new Date(`${today}T00:00:00Z`);
  const activity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(calendarDay);
    date.setUTCDate(date.getUTCDate() - (6 - index));
    const day = date.toISOString().slice(0, 10);
    return {
      day,
      count: dailyCounts.get(day) ?? 0,
      label:
        index === 6 ? "今日" : `${date.getUTCMonth() + 1}/${date.getUTCDate()}`,
    };
  });
  let streak = 0;
  const cursor = new Date(calendarDay);
  if (!dailyCounts.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (dailyCounts.has(cursor.toISOString().slice(0, 10))) {
    streak++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  const cards = questions.flatMap(({ id }) => data.cards[id] ? [data.cards[id]] : []);
  return {
    todayCount: dailyCounts.get(today) ?? 0,
    learned: cards.length,
    mastered: cards.filter((card) => card.scheduleStatus === "review").length,
    due: cards.filter((card) => Date.parse(card.dueAt) <= now.getTime()).length,
    accuracy: data.reviews.length
      ? Math.round(
          (data.reviews.filter((r) => r.correct).length / data.reviews.length) *
            100,
        )
      : 0,
    streak,
    activity,
    activityMax: Math.max(10, ...activity.map((day) => day.count)),
  };
}
export type StudySummary = ReturnType<typeof getStudySummary>;
