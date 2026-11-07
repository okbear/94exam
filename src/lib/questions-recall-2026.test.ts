import { describe, it, expect } from "vitest";
import { questions, recallQuestions, standardQuestions } from "./questions";
describe("knowledge-applied calculation questions", () => {
  it("retains the 24 practice problems and identifies those that require rules from memory", () => {
    expect(questions).toHaveLength(177);
    expect(standardQuestions).toHaveLength(69);
    expect(recallQuestions).toHaveLength(24);
    for (const q of recallQuestions) {
      expect(q.kind).toBe("calculation");
      if (q.id === "recall-18" || q.id === "recall-23") {
        expect(q.knowledgeRequired).toBeUndefined();
        expect(q.referenceMaterials).toHaveLength(1);
      } else {
        expect(q.knowledgeRequired).toBe(true);
      }
      expect(q.source).toMatch(/^https:\/\//);
      expect(q.prompt, q.id).not.toMatch(
        /[%％]|1\.25|1\.35|1\.50|1\.75|573万円|150万円|1,000円未満/,
      );
      expect(q.formula, q.id).toBeTruthy();
      expect(q.explanation.length, q.id).toBeGreaterThan(40);
    }
  });
  it("independently verifies each correct answer, including time thresholds and statutory caps", () => {
    const expected = [
      1800 * 1.25 * 8,
      1600 * 0.25 * 3,
      2000 * 1.35 * 6,
      1800 * 1.5 * 4,
      1600 * 1.6 * 3,
      2400 * 1.5 * 5,
      2000 * 1.75 * 2,
      2000 * 1.25 * 2 + 2000 * 1.5 * 4,
      1600 + 1600 * 1.25,
      1800 * 1.25 * 8,
      1800 * 6,
      ((240000 + 12000 + 20000) / 160) * 1.25 * 6,
      ((256000 + 16000) / 160) * 1.25 * 8,
      9800 * 0.6 * 3,
      (930000 / 93) * 0.6 * 2,
      Math.min(12400 / 2, 300000 / 10),
      Math.min((9000 / 2) * 6, 210000 / 10),
      (340000 * 0.183) / 2,
      Math.floor(753890 / 1000) * 1000,
      (Math.floor(882900 / 1000) * 1000 * 0.183) / 2,
      (Math.min(980000 + 820000, 1500000) * 0.183) / 2,
      Math.min(630000, 5730000 - 5480000),
      (320000 * 0.0023) / 2,
      (310000 + 16000 + 14000) * 0.005,
    ];
    for (const [index, value] of expected.entries()) {
      const q = recallQuestions.find((q) => q.id === `recall-${index + 1}`)!;
      expect(q.answer, q.id).toBeCloseTo(value, 5);
    }
  });
});
