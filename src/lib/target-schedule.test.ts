import { describe, it, expect } from "vitest";
import {
  isTargetDate,
  getTargetStatus,
  earliestTargetDate,
  changeTargetDate,
  limitReviewToTarget,
  reconcileTargetSchedule,
} from "./target-schedule";
import {
  emptyData,
  previews,
  recordReview,
  restoreData,
  Rating,
  type SavedCard,
  makeQueue,
  intervalLabel,
} from "./study";
const day = 86400000;
const now = new Date("2026-10-31T15:00:00Z"); // November 1, midnight in Japan.
const target = "2026-11-22";
function longCard(): SavedCard {
  return {
    cardId: "base-1",
    stability: 100,
    stabilityFast: 80,
    difficulty: 2,
    state: 2,
    scheduleStatus: "review",
    dueAt: new Date(now.getTime() + 54 * day).toISOString(),
    lastReviewAt: now.toISOString(),
    reps: 5,
    lapses: 0,
    scheduledDays: 54,
    learningStep: 0,
  };
}
describe("target deadline scheduling", () => {
  it("validates actual calendar dates and counts days in Japan", () => {
    expect(isTargetDate("2026-02-29")).toBe(false);
    expect(isTargetDate("2028-02-29")).toBe(true);
    expect(isTargetDate("2026-13-01")).toBe(false);
    expect(isTargetDate("11/22/2026")).toBe(false);
    expect(getTargetStatus(target, now)).toEqual({
      phase: "upcoming",
      daysRemaining: 21,
    });
    expect(earliestTargetDate(now)).toBe("2026-11-02");
    expect(getTargetStatus("2026-11-01", now).phase).toBe("today");
    expect(getTargetStatus("2026-10-31", now).phase).toBe("past");
  });
  it("caps Good and Easy separately while preserving the FSRS memory state", () => {
    const card = longCard();
    const good = limitReviewToTarget(card, target, Rating.Good, now);
    const easy = limitReviewToTarget(card, target, Rating.Easy, now);
    expect(Date.parse(good.dueAt) - now.getTime()).toBeCloseTo(4.2 * day);
    expect(Date.parse(easy.dueAt) - now.getTime()).toBe(7 * day);
    expect(easy.stability).toBe(card.stability);
    expect(good.difficulty).toBe(card.difficulty);
    expect(good.scheduledDays).toBeCloseTo(4.2);
    expect(card.scheduledDays).toBe(54);
  });
  it("keeps short FSRS intervals and ordinary learning without an upcoming target", () => {
    const card = {
      ...longCard(),
      dueAt: new Date(now.getTime() + 60000).toISOString(),
      scheduledDays: 1 / 1440,
    };
    expect(limitReviewToTarget(card, target, Rating.Again, now)).toBe(card);
    expect(limitReviewToTarget(card, null, Rating.Easy, now)).toBe(card);
    expect(limitReviewToTarget(card, "2026-11-01", Rating.Easy, now)).toBe(
      card,
    );
  });
  it("shortens caps near the target and never schedules on or beyond the target date", () => {
    const lastDay = new Date("2026-11-21T14:59:00Z");
    const result = limitReviewToTarget(
      longCard(),
      target,
      Rating.Easy,
      lastDay,
    );
    expect(Date.parse(result.dueAt) - lastDay.getTime()).toBe(20000);
    expect(Date.parse(result.dueAt)).toBeLessThan(
      Date.parse("2026-11-22T00:00:00+09:00"),
    );
    expect(intervalLabel(result.dueAt, lastDay)).toBe("20秒後");
  });
  it("brings existing 54-day reviews forward on registration and rechecks earlier dates", () => {
    const data = {
      ...emptyData(),
      cards: { "base-1": longCard() },
      reviews: [
        {
          questionId: "base-1",
          at: now.toISOString(),
          correct: true,
          grade: Rating.Easy,
        },
      ],
    };
    const scheduled = changeTargetDate(data, target, now);
    expect(scheduled.targetDate).toBe(target);
    expect(scheduled.cards["base-1"].scheduledDays).toBe(7);
    const earlier = changeTargetDate(scheduled, "2026-11-04", now);
    expect(earlier.cards["base-1"].scheduledDays).toBe(1);
    expect(changeTargetDate(earlier, null, now).cards["base-1"]).toEqual(
      earlier.cards["base-1"],
    );
    expect(() => changeTargetDate(data, "2026-10-31", now)).toThrow();
    expect(() => changeTargetDate(data, "2026-11-01", now)).toThrow();
  });
  it("makes newly overdue reviews available immediately and does not postpone existing due cards", () => {
    const data = {
      ...emptyData(),
      cards: { "base-1": longCard() },
      reviews: [
        {
          questionId: "base-1",
          at: now.toISOString(),
          correct: true,
          grade: Rating.Easy,
        },
      ],
    };
    const later = new Date(now.getTime() + 5 * day);
    const updated = changeTargetDate(data, "2026-11-07", later);
    expect(makeQueue(updated, undefined, later)[0]).toBe("base-1");
    expect(reconcileTargetSchedule(updated, later).cards["base-1"]).toEqual(
      updated.cards["base-1"],
    );
  });
  it("uses the same target-capped dates for previews and recorded reviews", async () => {
    const data = {
      ...emptyData(),
      targetDate: target,
      cards: { "base-1": longCard() },
    };
    const options = await previews(data, "base-1", now);
    const good = options.find((o) => o.grade === Rating.Good)!.card;
    const easy = options.find((o) => o.grade === Rating.Easy)!.card;
    expect(Date.parse(good.dueAt)).toBeLessThan(Date.parse(easy.dueAt));
    const recorded = await recordReview(data, "base-1", true, Rating.Easy, now);
    expect(recorded.cards["base-1"].dueAt).toBe(easy.dueAt);
    expect(Date.parse(easy.dueAt)).toBeLessThanOrEqual(now.getTime() + 7 * day);
    expect(restoreData(JSON.stringify(recorded)).targetDate).toBe(target);
  });
  it("rejects backups with missing or malformed target dates in the current schema", () => {
    expect(() =>
      restoreData(JSON.stringify({ ...emptyData(), targetDate: "2026-02-30" })),
    ).toThrow();
    const missing: Partial<ReturnType<typeof emptyData>> = emptyData();
    delete missing.targetDate;
    expect(() => restoreData(JSON.stringify(missing))).toThrow();
  });
});
