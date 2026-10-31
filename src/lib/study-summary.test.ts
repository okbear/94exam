import { describe, it, expect } from "vitest";
import { emptyData, Rating, recordReview, type Review } from "./study";
import { getStudySummary } from "./study-summary";
const review = (at: string, correct = true): Review => ({
  questionId: "base-1",
  at,
  correct,
  grade: correct ? Rating.Good : Rating.Again,
});
describe("study summary", () => {
  it("returns zero counts and seven calendar days without any history", () => {
    const summary = getStudySummary(
      emptyData(),
      new Date("2026-10-31T15:01:00Z"),
    );
    expect(summary).toMatchObject({
      todayCount: 0,
      learned: 0,
      mastered: 0,
      due: 0,
      accuracy: 0,
      streak: 0,
      activityMax: 10,
    });
    expect(summary.activity).toHaveLength(7);
    expect(summary.activity[0].day).toBe("2026-10-26");
    expect(summary.activity[6]).toEqual({
      day: "2026-11-01",
      count: 0,
      label: "今日",
    });
  });
  it("counts all answers, separates Japan calendar days, and uses the same counts for chart and streak", () => {
    const data = emptyData();
    data.reviews = [
      review("2026-10-29T15:01:00Z"),
      review("2026-10-30T15:01:00Z"),
      review("2026-10-31T14:59:00Z", false),
      review("2026-10-31T15:01:00Z"),
    ];
    const summary = getStudySummary(data, new Date("2026-10-31T16:00:00Z"));
    expect(summary.todayCount).toBe(1);
    expect(summary.accuracy).toBe(75);
    expect(summary.streak).toBe(3);
    expect(summary.activity.slice(-3).map((d) => d.count)).toEqual([1, 2, 1]);
  });
  it("continues yesterday’s streak until the first answer today and stops at gaps", () => {
    const data = emptyData();
    data.reviews = [
      review("2026-10-29T03:00:00Z"),
      review("2026-10-30T03:00:00Z"),
      review("2026-10-31T03:00:00Z"),
    ];
    expect(getStudySummary(data, new Date("2026-11-01T03:00:00Z")).streak).toBe(
      3,
    );
    expect(getStudySummary(data, new Date("2026-11-02T03:00:00Z")).streak).toBe(
      0,
    );
  });
  it("counts learned cards independently from total answers and respects review due dates", async () => {
    const now = new Date("2026-11-01T00:00:00Z");
    const data = await recordReview(
      emptyData(),
      "base-1",
      true,
      Rating.Easy,
      now,
    );
    expect(getStudySummary(data, now)).toMatchObject({
      learned: 1,
      mastered: 1,
      due: 0,
      accuracy: 100,
    });
    const due = new Date(data.cards["base-1"].dueAt);
    expect(getStudySummary(data, due).due).toBe(1);
  });
});
