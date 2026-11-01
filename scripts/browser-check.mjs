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
const calculatorToggle = page.locator(".calculator-toggle");
assert.equal(await calculatorToggle.getAttribute("aria-expanded"), "false");
const tools = page.locator(".question-tools");
assert.ok(await tools.locator(".question-edition").isVisible());
assert.equal(await calculatorToggle.getAttribute("aria-haspopup"), "dialog");

assert.equal(
  await page.getByRole("dialog", { name: "四則演算の電卓" }).count(),
  0,
);
await calculatorToggle.click();
const calculator = page.getByRole("dialog", { name: "四則演算の電卓" });
async function calculatorKeys(values) {
  for (const value of values)
    await calculator.getByRole("button", { name: value, exact: true }).click();
}
await calculatorKeys([
  "2",
  "5",
  "0",
  "0",
  "0",
  "0",
  "足す",
  "2",
  "0",
  "0",
  "0",
  "0",
  "足す",
  "1",
  "0",
  "0",
  "0",
  "0",
  "引く",
  "5",
  "5",
  "0",
  "0",
  "0",
  "計算する",
]);
assert.equal(await page.getByLabel("電卓の表示").textContent(), "225000");
await calculatorToggle.click();
assert.equal(await calculator.count(), 0);
await calculatorToggle.click();
assert.equal(await page.getByLabel("電卓の表示").textContent(), "225000");
await calculatorKeys(["クリア", "1", "割る", "0", "計算する"]);
assert.equal(
  await page.getByLabel("電卓の表示").textContent(),
  "0では割れません",
);
await calculatorKeys(["クリア"]);
await page.getByLabel("電卓の表示").focus();
await page.keyboard.type("2+3*4");
await page.keyboard.press("Enter");
assert.equal(await page.getByLabel("電卓の表示").textContent(), "14");
await page.setViewportSize({ width: 390, height: 844 });
assert.ok(
  (
    await calculator
      .getByRole("button", { name: "7", exact: true })
      .boundingBox()
  ).height >= 48,
);
assert.ok(
  await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  ),
);
await page
  .locator(".question-prompt")
  .evaluate((element) => element.scrollIntoView({ block: "start" }));
const calculatorBox = await calculator.boundingBox();
assert.ok(calculatorBox.width <= 320, "Calculator should have compact width");
const triggerBox = await calculatorToggle.boundingBox();
const toolsBox = await tools.boundingBox();
assert.ok(
  Math.abs(triggerBox.x + triggerBox.width - toolsBox.x - toolsBox.width) < 2,
  "Calculator trigger should align to the right",
);
const promptBox = await page.locator(".question-prompt").boundingBox();
assert.ok(
  promptBox.y >= 0 && promptBox.y + promptBox.height <= calculatorBox.y,
  "Problem should be readable above popup",
);
assert.ok(
  calculatorBox.y + calculatorBox.height <= 844,
  "Popup must fit viewport",
);
await page.screenshot({
  path: "/private/tmp/94exam-mobile-calculator.png",
  fullPage: false,
});
await calculator.getByRole("button", { name: "電卓を閉じる" }).click();
assert.equal(await calculator.count(), 0);
assert.ok(
  await calculatorToggle.evaluate(
    (element) => element === document.activeElement,
  ),
);
await calculatorToggle.click();
await page.keyboard.press("Escape");
assert.equal(await calculator.count(), 0);
await page.setViewportSize({ width: 1440, height: 1100 });
await calculatorToggle.click();
const beforeDrag = await calculator.boundingBox();
const dragHandle = await page.locator(".calculator-popup-header").boundingBox();
await page.mouse.move(dragHandle.x + 55, dragHandle.y + 20);
await page.mouse.down();
await page.mouse.move(dragHandle.x - 80, dragHandle.y - 100, { steps: 5 });
await page.mouse.up();
const afterDrag = await calculator.boundingBox();
assert.ok(
  afterDrag.x < beforeDrag.x && afterDrag.y < beforeDrag.y,
  "Popup can be moved by its header",
);
await calculatorToggle.click();
await page.setViewportSize({ width: 1440, height: 1100 });
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
await page.locator("input[type=file]").setInputFiles({
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
