import { describe, expect, it } from "vitest";
import verdictData from "./fixtures/exam-verdicts-2026.json";
import { categories, examQuestions, questions } from "./questions";

type Verdict = { format: string; truth?: boolean[]; falseIndex?: number };
const verdicts: Record<string, Verdict> = verdictData;

describe("exam-style original true/false questions", () => {
  it("adds ten questions per category with complete individual explanations", () => {
    expect(examQuestions).toHaveLength(60);
    expect(questions).toHaveLength(172);
    for (const category of categories) {
      expect(examQuestions.filter((q) => q.category === category), category).toHaveLength(10);
    }
    const positions = [0, 0, 0, 0];
    for (const q of examQuestions) {
      expect(q.kind).toBe("knowledge");
      const host = new URL(q.source!).hostname;
      expect(["mhlw.go.jp", "nenkin.go.jp", "nta.go.jp", "kyoukaikenpo.or.jp"]
        .some((domain) => host === domain || host.endsWith(`.${domain}`)), q.id).toBe(true);
      expect(q.explanation.split("\n"), q.id).toHaveLength(5);
      expect(q.explanation.length, q.id).toBeGreaterThan(100);
      positions[q.answer]++;
    }
    expect(positions).toEqual([15, 15, 15, 15]);
    expect(new Set(questions.map((q) => q.prompt)).size).toBe(questions.length);
    expect(new Set(questions.map((q) => q.title)).size).toBe(questions.length);
  });

  it("matches every combination and every per-statement verdict to the reviewed truth ledger", () => {
    expect(Object.keys(verdicts).sort()).toEqual(examQuestions.map((q) => q.id).sort());
    let pairs = 0;
    let singles = 0;
    for (const q of examQuestions) {
      if (q.kind !== "knowledge") throw new Error(q.id);
      const verdict = verdicts[q.id];
      if (verdict.format === "pair") {
        pairs++;
        const truth = verdict.truth!;
        expect(truth.filter(Boolean), q.id).toHaveLength(2);
        const letters = [..."アイウエ"];
        const correctPair = letters.filter((_, i) => truth[i]).join("と");
        expect(q.choices[q.answer], q.id).toBe(correctPair);
        q.choices.forEach((choice, i) => {
          const labels = choice.split("と");
          expect(labels, q.id).toHaveLength(2);
          expect(new Set(labels).size, q.id).toBe(2);
          expect(labels.every((letter) => truth[letters.indexOf(letter)]), q.id).toBe(i === q.answer);
        });
        letters.forEach((letter, i) => {
          expect(q.prompt, q.id).toContain(`\n${letter}：`);
          expect(q.explanation, q.id).toContain(`\n${letter}：${truth[i] ? "○" : "×"} `);
        });
      } else {
        singles++;
        expect(q.answer, q.id).toBe(verdict.falseIndex);
        [..."ABCD"].forEach((letter, i) => {
          expect(q.explanation, q.id).toContain(`\n${letter}：${i === verdict.falseIndex ? "×" : "○"} `);
        });
      }
    }
    expect([pairs, singles]).toEqual([36, 24]);
  });

  it("checks the numeric boundary cases underlying the authored judgements", () => {
    const byId = (id: string) => examQuestions.find((q) => q.id === id)!;
    const week = [9, 8, 8, 8, 8, 3];
    const dailyOvertime = week.reduce((sum, hours) => sum + Math.max(0, hours - 8), 0);
    const weeklyExtra = Math.max(0, week.reduce((sum, hours) => sum + Math.min(8, hours), 0) - 40);
    expect(dailyOvertime + weeklyExtra).toBe(4);
    expect(byId("exam-time-2").explanation).toContain("＝4時間");
    const requiredBreak = (hours: number) => hours > 8 ? 60 : hours > 6 ? 45 : 0;
    expect([6, 6.5, 8, 8.25].map(requiredBreak)).toEqual([0, 45, 45, 60]);
    expect(32 >= 40 * .75 && 16 >= 20 * .75).toBe(true);
    expect(643800 * .005).toBe(3219);
    expect(byId("exam-bonus-3").explanation).toContain("3,219円");
    expect(160000 - 150000).toBe(10000);
    expect(byId("exam-tax-4").explanation).toContain("月15万円");
    expect(12000 / 2).toBe(6000);
    expect(300000 / 10).toBe(30000);
    const averageWage = Math.max(360000 / 90, (360000 / 45) * .6);
    expect(averageWage).toBe(4800);
    expect(byId("exam-base-8").explanation).toContain("今回は4,800円");
    const transportPerMonth = 72000 / 6;
    expect(transportPerMonth).toBe(12000);
    expect(byId("exam-ins-7").explanation).toContain("月12,000円");
    expect(4000 - (9 - 7) * 1610).toBe(780);
    expect(byId("exam-tax-9").explanation).toContain("780円");
    expect(402600 + 10400).toBe(413000);
    expect(byId("exam-bonus-7").explanation).toContain("413,000円");
  });
});
