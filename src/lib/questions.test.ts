import { difficultyGroups } from "./difficulty";
import { emptyData, makeQueue, recordReview, Rating } from "./study";
import { describe, it, expect } from "vitest";
import {
  questions,
  edition,
  difficulties,
  parseNumericAnswer,
  parseQuestion,
  parseQuestionBank,
} from "./questions";
describe("2026 difficulty-grouped question bank", () => {
  it("contains over 50 unique questions in both genres", () => {
    expect(questions.length).toBeGreaterThanOrEqual(50);
    expect(new Set(questions.map((q) => q.id)).size).toBe(questions.length);
    expect(
      questions.filter((q) => q.kind === "knowledge").length,
    ).toBeGreaterThanOrEqual(30);
    expect(
      questions.filter((q) => q.kind === "calculation").length,
    ).toBeGreaterThanOrEqual(20);
    expect(questions.every((q) => difficulties.includes(q.difficulty))).toBe(
      true,
    );
    expect(edition.legalAsOf).toBe("2026-09-01");
  });
  it("assigns every question exactly once and matches the three advertised groups", () => {
    const ids = Object.values(difficultyGroups).flat();
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(questions.map((q) => q.id).sort());
    expect(
      difficulties.map(
        (difficulty) =>
          questions.filter((q) => q.difficulty === difficulty).length,
      ),
    ).toEqual([46, 72, 54]);
    expect(questions.find((q) => q.id === "base-1")?.difficulty).toBe(
      "beginner",
    );
    expect(questions.find((q) => q.id === "calc-1")?.difficulty).toBe(
      "intermediate",
    );
    expect(questions.find((q) => q.id === "calc-19")?.difficulty).toBe(
      "advanced",
    );
  });
  it("combines difficulty, genre, category, and due-date filters", async () => {
    const now = new Date("2026-11-01T00:00:00Z");
    const data = await recordReview(
      emptyData(),
      "calc-19",
      true,
      Rating.Easy,
      now,
    );
    const queue = makeQueue(data, "給与の基礎", now, "calculation", "advanced");
    expect(queue).toEqual(["calc-16", "recall-12", "recall-13"]);
    const due = new Date(data.cards["calc-19"].dueAt);
    expect(
      makeQueue(data, "給与の基礎", due, "calculation", "advanced")[0],
    ).toBe("calc-19");
  });
  it("validates knowledge choices, calculation numeric answers, explanations, and edition scope", () => {
    for (const q of questions) {
      expect(q.explanation.length, q.id).toBeGreaterThan(15);
      expect(q.prompt, q.id).not.toMatch(/年末調整/);
      if (q.kind === "knowledge") {
        expect(q.choices, q.id).toHaveLength(4);
        expect(new Set(q.choices).size, q.id).toBe(4);
        expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
        expect(q.answer, q.id).toBeLessThan(4);
        expect(q.source, q.id).toMatch(/^https:\/\//);
      } else {
        expect(q.choices, q.id).toBeUndefined();
        expect(Number.isFinite(q.answer), q.id).toBe(true);
        expect(q.unit, q.id).toBe("円");
        expect(q.formula, q.id).toBeTruthy();
      }
    }
    expect(parseNumericAnswer("225000")).toBe(225000);
    expect(parseNumericAnswer("225,000円")).toBe(225000);
    expect(parseNumericAnswer("２２５，０００")).toBe(225000);
    expect(parseNumericAnswer("")).toBeNull();
    expect(parseNumericAnswer("abc")).toBeNull();
    expect(() => parseQuestion(null)).toThrow();
    expect(() => parseQuestion({ id: "bad" })).toThrow();
    expect(() =>
      parseQuestion({ ...questions[0], difficulty: "invalid" }),
    ).toThrow();
    expect(() =>
      parseQuestion({ ...questions[0], source: "http://insecure.example.com" }),
    ).toThrow();
    expect(() =>
      parseQuestionBank([questions[0], { ...questions[0] }]),
    ).toThrow();
  });
  it("independently checks multi-step and 2026 calculation answers", () => {
    const computed: Record<string, number> = {
      "calc-1": 1600 * (1 + 0.25 + 0.25) * 3,
      "calc-2": 2000 * 1.6 * 2,
      "calc-3": 2000 * 1.25 * 60 + 2000 * 1.5 * 5,
      "calc-4": (240000 / 160) * 1.5,
      "calc-5": (240000 + 16000) / 160,
      "calc-6": (900000 / 90) * 0.6,
      "calc-7": (300000 * 0.0162) / 2,
      "calc-8": (300000 * 0.0023) / 2,
      "calc-9": (280000 + 20000 + 10000) * 0.005,
      "calc-10": (320000 * 0.183) / 2,
      "calc-11": Math.floor(654780 / 1000) * 1000,
      "calc-12": (Math.floor(802600 / 1000) * 1000 * 0.183) / 2,
      "calc-13": (1500000 * 0.183) / 2,
      "calc-14": 5730000 - 5200000,
      "calc-15": Math.floor((600000 - 90000) * 0.04084),
      "calc-16":
        256000 + 16000 + 10000 + ((256000 + 16000) / 160) * 1.25 * 10 - 55000,
      "calc-17": 270000 + 4000 - 42000,
      "calc-18": (500000 * 0.0023) / 2,
      "calc-19":
        300000 -
        ((300000 * (0.0985 + 0.0162 + 0.183 + 0.0023)) / 2 + 300000 * 0.005) -
        6200 -
        12000,
    };
    for (const [id, expected] of Object.entries(computed)) {
      const q = questions.find((q) => q.id === id)!;
      expect(q.answer, id).toBeCloseTo(expected, 4);
    }
  });
});
