import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://127.0.0.1:3000/", { waitUntil: "networkidle" });
await page.screenshot({
  path: "/private/tmp/94exam-desktop.png",
  fullPage: true,
});
await page.getByRole("button", { name: "計算問題" }).first().click();
await page.getByRole("button", { name: "演習を開始" }).click();
await page.getByRole("button", { name: /225,000円/ }).click();
await page.getByRole("button", { name: "答えを確認する" }).click();
await page.getByRole("heading", { name: "正解", exact: true }).waitFor();
await page.getByRole("button", { name: /できた/ }).click();
assert.equal(
  await page.evaluate(
    () => JSON.parse(localStorage.getItem("kyuyo-study-v1")).reviews.length,
  ),
  1,
);
await page.reload({ waitUntil: "networkidle" });
await page.getByRole("button", { name: "設定", exact: true }).click();
await page.getByRole("heading", { name: "2026年度版・教材の基準" }).waitFor();
assert.equal(
  await page.evaluate(
    () => JSON.parse(localStorage.getItem("kyuyo-study-v1")).reviews.length,
  ),
  1,
);
await page.getByRole("button", { name: "問題ライブラリ", exact: true }).click();
await page.getByRole("button", { name: "知識問題" }).click();
assert.ok((await page.locator(".library-row").count()) > 20);
await page.getByLabel("問題を検索").fill("年末調整");
await page.getByText("一致する問題がありません。").waitFor();
await page.getByLabel("問題を検索").fill("2026");
assert.ok((await page.locator(".library-row").count()) >= 3);
await page.getByRole("button", { name: "学習ホーム", exact: true }).click();
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({
  path: "/private/tmp/94exam-mobile.png",
  fullPage: true,
});
for (const width of [360, 390, 430, 768, 1440]) {
  await page.setViewportSize({ width, height: 900 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    `overflow at ${width}`,
  );
}
await page.setViewportSize({ width: 390, height: 844 });
await page.getByRole("button", { name: "知識問題" }).first().click();
await page.getByRole("button", { name: "演習を開始" }).click();
await page.getByRole("button", { name: /通貨払い/ }).click();
await page.getByRole("button", { name: "答えを確認する" }).click();
await page.getByRole("heading", { name: "不正解", exact: true }).waitFor();
assert.equal(await page.locator(".rating").count(), 1);
await page.screenshot({
  path: "/private/tmp/94exam-mobile-study.png",
  fullPage: true,
});
await page.getByRole("button", { name: /もう一度.*分後/ }).click();
assert.equal(
  await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("kyuyo-study-v1")).reviews.at(-1).grade,
  ),
  1,
);
// Finish a complete session after the component/state split.
for (let i = 0; i < 9; i++) {
  await page.locator(".answer").first().click();
  await page.getByRole("button", { name: "答えを確認する" }).click();
  await page.locator(".rating").first().click();
}
await page.getByRole("heading", { name: "演習結果", exact: true }).waitFor();
await page.getByText(/10問に取り組み/).waitFor();
assert.equal(
  await page.evaluate(
    () => JSON.parse(localStorage.getItem("kyuyo-study-v1")).reviews.length,
  ),
  11,
);
await page.getByRole("button", { name: "学習ホームへ", exact: true }).click();
await page.getByRole("button", { name: "学習の記録", exact: true }).click();
assert.equal(await page.locator(".history-row").count(), 10);
assert.equal(await page.locator(".activity-day").count(), 7);
await page.getByRole("button", { name: "問題ライブラリ", exact: true }).click();
// Filters survive leaving and reopening the library.
assert.equal(await page.getByLabel("問題を検索").inputValue(), "2026");
await page.getByLabel("問題を検索").fill("");
await page.locator(".library-row .icon-button").first().click();
await page.getByRole("button", { name: "保存した問題" }).click();
assert.equal(await page.locator(".library-row").count(), 1);
await page.getByRole("button", { name: "設定", exact: true }).click();
await page.getByRole("combobox").selectOption("15");
const backup = await page.evaluate(() =>
  localStorage.getItem("kyuyo-study-v1"),
);
assert.equal(JSON.parse(backup).goal, 15);
const download = page.waitForEvent("download");
await page.getByRole("button", { name: "書き出す", exact: true }).click();
assert.match((await download).suggestedFilename(), /^kyuyo-study-.*\.json$/);
page.on("dialog", (dialog) => dialog.accept());
await page
  .getByRole("button", { name: "学習履歴をリセット", exact: true })
  .click();
assert.equal(
  await page.evaluate(
    () => JSON.parse(localStorage.getItem("kyuyo-study-v1")).reviews.length,
  ),
  0,
);
await page
  .locator("input[type=file]")
  .setInputFiles({
    name: "backup.json",
    mimeType: "application/json",
    buffer: Buffer.from(backup),
  });
await page.getByText("学習データを復元しました。", { exact: true }).waitFor();
assert.equal(
  await page.evaluate(
    () => JSON.parse(localStorage.getItem("kyuyo-study-v1")).reviews.length,
  ),
  11,
);
await page.getByRole("button", { name: "学習ホーム", exact: true }).click();
await page.getByRole("button", { name: "出題・教材について" }).click();
await page.getByRole("dialog").waitFor();
await page.keyboard.press("Escape");
assert.equal(await page.getByRole("dialog").count(), 0);
assert.deepEqual(errors, []);
console.log(
  "Browser checks passed: desktop/mobile, genre filtering, correct/incorrect review scheduling, persistence, edition metadata, search, responsive widths; no runtime errors.",
);
await browser.close();
