import { describe, expect, it, vi } from "vitest";
import { emptyData, previews, recordReview, Rating } from "./study";
import {
  maxBackupBytes,
  maxReviews,
  readBackupFile,
  restoreData,
} from "./study-backup";
const now = new Date("2026-11-01T00:00:00.000Z");
const raw = (changes: Record<string, unknown>) =>
  JSON.stringify({ ...emptyData(), ...changes });
describe("backup trust boundary", () => {
  it("rejects oversized files before reading them", async () => {
    const text = vi.fn();
    await expect(
      readBackupFile({ size: maxBackupBytes + 1, text } as unknown as File),
    ).rejects.toThrow("8MB");
    expect(text).not.toHaveBeenCalled();
    expect(() => restoreData(" ".repeat(maxBackupBytes + 1))).toThrow("8MB");
    expect(() =>
      restoreData('"' + "あ".repeat(Math.ceil(maxBackupBytes / 3)) + '"'),
    ).toThrow("8MB");
  });
  it("rejects excessive collections and invalid container types", () => {
    for (const changes of [
      { cards: [] },
      { reviews: Array(maxReviews + 1).fill(null) },
      { bookmarks: Array(100).fill("base-1") },
      { bookmarks: ["base-1", "base-1"] },
      { reviews: [null] },
      { cards: { "base-1": null } },
    ])
      expect(() => restoreData(raw(changes))).toThrow();
    for (const value of [null, [], 1, "x"])
      expect(() => restoreData(JSON.stringify(value))).toThrow();
  });
  it("strips unknown data at every level", async () => {
    const data = await recordReview(
      emptyData(),
      "base-1",
      true,
      Rating.Good,
      now,
    );
    const input = JSON.stringify({
      ...data,
      extra: "discard",
      cards: { "base-1": { ...data.cards["base-1"], extra: "discard" } },
      reviews: [{ ...data.reviews[0], extra: "discard" }],
    });
    const restored = restoreData(input);
    expect(restored).toEqual(data);
    await expect(
      previews(restored, "base-1", new Date(data.cards["base-1"].dueAt)),
    ).resolves.toHaveLength(4);
    expect(Object.prototype).not.toHaveProperty("extra");
  });
  it("rejects invalid scheduler fields and coerced dates", async () => {
    const data = await recordReview(
      emptyData(),
      "base-1",
      true,
      Rating.Good,
      now,
    );
    for (const changes of [
      { learningStep: "0" },
      { learningStep: -1 },
      { learningStep: 100 },
      { reps: 0.5 },
      { difficulty: 11 },
      { dueAt: 2026 },
      { lastReviewAt: "2026-02-30T00:00:00.000Z" },
      { stability: 1e100 },
      { lapses: 10 },
    ])
      expect(() =>
        restoreData(
          JSON.stringify({
            ...data,
            cards: { "base-1": { ...data.cards["base-1"], ...changes } },
          }),
        ),
      ).toThrow();
    expect(() =>
      restoreData(
        raw({
          reviews: [
            { questionId: "base-1", at: 2026, correct: true, grade: 3 },
          ],
        }),
      ),
    ).toThrow();
  });
  it("preserves existing history when the review limit is reached", async () => {
    const data = {
      ...emptyData(),
      reviews: Array(maxReviews).fill({
        questionId: "base-1",
        at: now.toISOString(),
        correct: true,
        grade: 3,
      }),
    };
    await expect(
      recordReview(data, "base-1", true, Rating.Good, now),
    ).rejects.toThrow("50,000");
    expect(data.reviews).toHaveLength(maxReviews);
  });
});
