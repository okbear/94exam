import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const questions = JSON.parse(await readFile(new URL("../src/data/questions-exam-2026.json", import.meta.url)));
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  for (const width of [360, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "問題ライブラリ", exact: true }).click();
    await page.getByLabel("問題を検索").fill("正誤");
    assert.equal(await page.locator(".library-row").count(), 37); // 36 new questions plus the earlier combination question
    const sample = width === 360 ? questions : questions.filter((q) => /-(base|tax|law)-(1|6)$/.test(q.id));
    for (const q of sample) {
      await page.getByLabel("問題を検索").fill(q.title);
      await page.getByRole("button", { name: `${q.title}を解く`, exact: true }).click();
      await page.getByRole("heading", { name: q.title, exact: true }).waitFor();
      assert.equal(await page.locator(".question-prompt").textContent(), q.prompt);
      const answers = page.locator(".answers > button.answer:not(.answer-unknown)");
      assert.equal(await answers.count(), 4);
      await answers.nth(q.answer).click();
      await page.getByRole("heading", { name: "正解", exact: true }).waitFor();
      assert.equal(await page.locator(".explanation > p").textContent(), q.explanation);
      assert.equal(await page.locator(".explanation > p").evaluate((el) => getComputedStyle(el).whiteSpace), "pre-line");
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      if (q.id === "exam-tax-6") {
        await page.screenshot({ path: `/private/tmp/94exam-exam-${width}.png`, fullPage: true });
      }
      await page.getByRole("button", { name: "ホームへ戻る", exact: true }).click();
      await page.getByRole("button", { name: "問題ライブラリ", exact: true }).click();
    }
    const q = questions[0];
    await page.getByLabel("問題を検索").fill(q.title);
    await page.getByRole("button", { name: `${q.title}を解く`, exact: true }).click();
    await page.locator(".answers > button.answer:not(.answer-unknown)").nth((q.answer + 1) % 4).click();
    await page.getByRole("heading", { name: "不正解", exact: true }).waitFor();
    assert.equal(await page.locator(".answers > button.correct").count(), 1);
    assert.deepEqual(errors, []);
    await page.close();
  }
  console.log("Exam questions passed: True/false search, all 36 answers at 360px, representative desktop answers, individual explanations and incorrect-answer feedback.");
} finally {
  await browser.close();
}
