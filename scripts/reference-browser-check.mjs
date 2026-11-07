import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const questions = JSON.parse(await readFile(new URL("../src/data/questions-cases-2026.json", import.meta.url)));
const standard = JSON.parse(await readFile(new URL("../src/data/questions-standard-2026.json", import.meta.url)));
const recall = JSON.parse(await readFile(new URL("../src/data/questions-recall-2026.json", import.meta.url)));
const referenceQuestions = [...questions, ...standard, ...recall].filter((q) => q.referenceMaterials);
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  for (const width of [360, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "問題ライブラリ", exact: true }).click();
    await page.getByRole("button", { name: "すべて", exact: true }).first().click();
    await page.getByLabel("問題を検索").fill("別資料");
    assert.equal(await page.locator(".library-row").count(), referenceQuestions.length);
    for (const id of ["case-c3", "case-c5", "case-c7", "case-c14", "case-c15", "case-c16", "recall-18", "calc-19"]) {
      const q = referenceQuestions.find((q) => q.id === id);
      await page.getByLabel("問題を検索").fill(q.title);
      await page.getByRole("button", { name: "この問題を解く", exact: true }).click();
      await page.getByRole("heading", { name: "QUESTION 01", exact: true }).waitFor();
      assert.equal(await page.getByRole("heading", { name: q.title, exact: true }).count(), 0);
      const details = page.locator(".reference-material");
      assert.equal(await details.count(), q.referenceMaterials.length);
      for (let index = 0; index < q.referenceMaterials.length; index++) {
        const panel = details.nth(index);
        assert.equal(await panel.getAttribute("open"), null);
        await panel.locator("summary").click();
        assert.equal(await panel.locator("table").isVisible(), true);
        assert.equal(await panel.locator("tbody tr").count(), q.referenceMaterials[index].rows.length);
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      if (id === "case-c15") await page.screenshot({ path: `/private/tmp/94exam-reference-${width}.png`, fullPage: true });
      await page.getByLabel("解答の数値").fill(String(q.answer));
      await page.getByRole("button", { name: "回答する", exact: true }).click();
      await page.getByRole("heading", { name: "正解", exact: true }).waitFor();
      assert.equal(await page.locator(".formula").textContent(), q.formula);
      assert.equal(await page.locator(".explanation p").first().textContent(), q.explanation);
      await page.getByRole("button", { name: "ホームへ戻る", exact: true }).click();
      await page.getByRole("button", { name: "問題ライブラリ", exact: true }).click();
    }
    await page.getByLabel("問題を検索").fill("賃金支払いの正誤の組合せ");
    await page.getByLabel("この問題を解く", { exact: true }).click();
    await page.getByRole("button", { name: "A アとイ", exact: true }).click();
    await page.getByRole("heading", { name: "正解", exact: true }).waitFor();
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log("Reference questions: search, collapsed tables, mobile overflow, 8 calculations and combination choices passed at 360/1440px.");
} finally {
  await browser.close();
}
