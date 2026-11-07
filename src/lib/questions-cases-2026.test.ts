import { describe, expect, it } from "vitest";
import { caseQuestions, parseQuestion, questions, standardQuestions, recallQuestions } from "./questions";

describe("original case and reference-material questions", () => {
  it("includes 8 case knowledge problems and 16 case calculations with references", () => {
    expect(standardQuestions).toHaveLength(69);
    expect(recallQuestions).toHaveLength(24);
    expect(caseQuestions).toHaveLength(24);
    expect(questions).toHaveLength(177);
    expect(caseQuestions.filter((q) => q.kind === "knowledge")).toHaveLength(8);
    expect(caseQuestions.filter((q) => q.referenceMaterials)).toHaveLength(16);
    for (const q of caseQuestions) {
      expect(q.source).toMatch(/^https:\/\/(www\.)?(mhlw\.go\.jp|check-roudou\.mhlw\.go\.jp|startup-roudou\.mhlw\.go\.jp|jsite\.mhlw\.go\.jp|nenkin\.go\.jp|nta\.go\.jp|kyoukaikenpo\.or\.jp)\//);
      expect(q.explanation.length, q.id).toBeGreaterThan(60);
    }
  });

  it("independently checks all calculations, including minute boundaries, table edges and tax truncation", () => {
    const expected = [
      258000 + 14000 + 12000 - 24000 - 3300 - 4000,
      (250000 / 20) * 3,
      ((80 + 130 + 30) / 60) * 1920 * 1.25,
      ((50 + 150 - 20) / 60) * 1800 * .25,
      280000, // average of the two eligible months maps to this grade
      300000, // exactly 290,000 belongs to the next interval
      4710, // 254,000: inclusive lower edge, 2026 monthly table, one dependent
      342000 * .005,
      ((252000 + 18000 + 18000) / 160) * (6.5 * 1.25 + 2 * .25),
      2000 * (9 * 1.35 + ((240 - 24) / 60) * .25),
      2400 * (2 * 1.25 + 2 * 1.75),
      ((324000 + 334000 + 314000) / (31 + 31 + 28)) * .6 * 4,
      Math.min(11600 / 2, 280000 / 10 - 26000),
      Math.floor((580000 - 85520) * .06126),
      (() => {
        const bonus = 800000;
        const insurance = bonus * (.04925 + .00115 + .0915 + .005);
        return bonus - insurance - Math.floor((bonus - insurance) * .06126);
      })(),
      270000 + 20000 + 12000 - 37000 - 6220 - 11000,
    ];
    expected.forEach((answer, index) => {
      const q = caseQuestions.find((q) => q.id === `case-c${index + 1}`)!;
      expect(q.answer, q.id).toBeCloseTo(answer, 6);
    });
  });

  it("keeps the public table excerpts consistent with their boundary cases", () => {
    const grade = caseQuestions.find((q) => q.id === "case-c6")!.referenceMaterials![0];
    const select = (value: number) => grade.rows.find((row) =>
      value >= Number(row[0].replaceAll(",", "")) && value < Number(row[1].replaceAll(",", ""))
    )?.[2];
    expect(select(289999)).toBe("280,000");
    expect(select(290000)).toBe("300,000");
    const tax = caseQuestions.find((q) => q.id === "case-c7")!.referenceMaterials![0];
    expect(tax.rows[2]).toEqual(["254,000", "257,000", "6,320", "4,710"]);
    const rate = caseQuestions.find((q) => q.id === "case-c14")!.referenceMaterials![1];
    expect(rate.rows[1]).toEqual(["260,000", "309,000", "6.126%"]);
  });

  it("rejects malformed reference tables and copies valid data", () => {
    const q = caseQuestions.find((q) => q.id === "case-c1")!;
    const material = q.referenceMaterials![0];
    const malformed = [
      [], null, [null], [{ ...material, title: "" }],
      [{ ...material, columns: [] }], [{ ...material, rows: [["wrong width"]] }],
      [{ ...material, rows: [[null, "x", "y"]] }],
      [{ ...material, source: "javascript:alert(1)" }],
    ];
    for (const referenceMaterials of malformed) {
      expect(() => parseQuestion({ ...q, referenceMaterials })).toThrow(/別資料/);
    }
    const parsed = parseQuestion(q);
    expect(parsed.referenceMaterials).toEqual(q.referenceMaterials);
    expect(parsed.referenceMaterials![0].rows).not.toBe(material.rows);
  });
});
