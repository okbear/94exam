import { questions } from "./questions";
import { describe, expect, it } from "vitest";
import {
  emptyData,
  dayKey,
  makeQueue,
  previews,
  Rating,
  recordReview,
  restoreData,
} from "./study";
const now = new Date("2026-11-01T00:00:00Z");
describe("FSRS scheduling and persistence", () => {
  it("schedules incorrect answers sooner than remembered answers", async () => {
    const p = await previews(emptyData(), "base-1", now);
    expect(Date.parse(p[0].card.dueAt)).toBeLessThan(
      Date.parse(p[2].card.dueAt),
    );
    expect(Date.parse(p[2].card.dueAt)).toBeLessThanOrEqual(
      Date.parse(p[3].card.dueAt),
    );
  });
  it("forces Again on incorrect answers and records the actual correctness", async () => {
    const data = await recordReview(
      emptyData(),
      "base-1",
      false,
      Rating.Easy,
      now,
    );
    expect(data.reviews[0]).toMatchObject({
      correct: false,
      grade: Rating.Again,
    });
    expect(makeQueue(data, undefined, now)).not.toContain("base-1");
    expect(
      makeQueue(data, undefined, new Date(now.getTime() + 11 * 60000))[0],
    ).toBe("base-1");
  });
  it("keeps future reviews out of the queue and orders due reviews before new cards", async () => {
    let data = await recordReview(emptyData(), "tax-3", true, Rating.Good, now);
    expect(makeQueue(data, undefined, now)).not.toContain("tax-3");
    const future = new Date(Date.parse(data.cards["tax-3"].dueAt) + 1000);
    expect(makeQueue(data, undefined, future)[0]).toBe("tax-3");
    expect(
      makeQueue(data, "社会保険", future).every(
        (id) =>
          questions.find((question) => question.id === id)?.category ===
          "社会保険",
      ),
    ).toBe(true);
  });
  it("restores serialized dates and can schedule another review", async () => {
    const data = await recordReview(
      emptyData(),
      "base-1",
      true,
      Rating.Good,
      now,
    );
    const restored = restoreData(JSON.stringify(data));
    expect(restored).toEqual(data);
    const next = await recordReview(
      restored,
      "base-1",
      true,
      Rating.Good,
      new Date(data.cards["base-1"].dueAt),
    );
    expect(next.cards["base-1"].reps).toBe(2);
    expect(next.reviews).toHaveLength(2);
  });
  it("rejects malformed backups", () => {
    expect(() => restoreData("{}")).toThrow();
    expect(() =>
      restoreData(JSON.stringify({ ...emptyData(), goal: -1 })),
    ).toThrow();
    expect(() =>
      restoreData(
        JSON.stringify({ ...emptyData(), cards: { fake: { dueAt: "bad" } } }),
      ),
    ).toThrow();
  });
  it("tracks calendar days in Japan across UTC midnight", () => {
    expect(dayKey(new Date("2026-10-31T15:00:00Z"))).toBe("2026-11-01");
  });
});
