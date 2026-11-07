import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.goto(process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000/", {
  waitUntil: "networkidle",
});
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
assert.equal(
  (
    await calculator
      .getByRole("button", { name: "クリア", exact: true })
      .textContent()
  ).trim(),
  "C",
);
await calculatorKeys(["クリア", "1", "足す"]);
const copyButton = calculator.getByRole("button", {
  name: "コピー",
  exact: true,
});
await copyButton.click();
assert.equal(await copyButton.getAttribute("title"), "コピー");
await calculatorKeys(["クリア"]);
await calculatorKeys([
  "3",
  "0",
  "0",
  "0",
  "0",
  "0",
  "掛ける",
  "9",
  "小数点",
  "8",
  "5",
  "パーセント",
  "割る",
  "2",
  "計算する",
]);
assert.equal(await page.getByLabel("電卓の表示").textContent(), "14775");
await copyButton.click();
await calculator
  .locator('button[aria-label="コピー"][title="コピーしました"]')
  .waitFor();
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
  ).height >= 44,
);
for (const width of [360, 390, 430]) {
  await page.setViewportSize({ width, height: 844 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    `study screen overflow at ${width}`,
  );
}
await page.setViewportSize({ width: 390, height: 844 });
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
await calculatorToggle.click();
await page.getByRole("button", { name: "メモを開く" }).click();
const memoDialog = page.getByRole("dialog", { name: "途中計算・メモ" });
const calcDesktopBox = await calculator.boundingBox();
const memoDesktopBox = await memoDialog.boundingBox();
assert.ok(
  memoDesktopBox.x + memoDesktopBox.width <= calcDesktopBox.x,
  "Memo and calculator should not overlap on desktop",
);
const zIndexOf = (locator) =>
  locator.evaluate((el) => Number(getComputedStyle(el).zIndex));
assert.ok(
  (await zIndexOf(memoDialog)) > (await zIndexOf(calculator)),
  "Newly opened memo should be in front of calculator",
);
await calculator.getByLabel("電卓の表示").click();
assert.ok(
  (await zIndexOf(calculator)) > (await zIndexOf(memoDialog)),
  "Clicking calculator should bring it to front",
);
const memoInput = memoDialog.getByLabel("途中計算・メモ");
await memoInput.click();
assert.ok(
  (await zIndexOf(memoDialog)) > (await zIndexOf(calculator)),
  "Clicking memo should bring it back to front",
);
await calculatorToggle.click();
await memoInput.fill("250000 + 20000 = 270000");
assert.equal(await memoInput.inputValue(), "250000 + 20000 = 270000");
await memoDialog.locator(".question-memo-clear").click();
assert.equal(await memoInput.inputValue(), "");
await memoInput.fill("残らないメモ");
await page.getByLabel("解答の数値").fill("225000");
await page.getByRole("button", { name: "回答する", exact: true }).click();
await page.getByRole("heading", { name: "正解", exact: true }).waitFor();
await page.getByRole("button", { name: /できた/ }).click();
await page.getByText("QUESTION 02").waitFor();
assert.equal(await memoInput.inputValue(), "");
await memoDialog.getByRole("button", { name: "メモを閉じる" }).click();
assert.equal(await memoDialog.count(), 0);
await calculatorToggle.click();
assert.equal(await page.getByLabel("電卓の表示").textContent(), "0");
await calculatorToggle.click();
assert.equal(
  await page.evaluate(
    () => JSON.parse(localStorage.getItem("kyuyo-study-v2")).reviews.length,
  ),
  1,
);
await page.reload({ waitUntil: "networkidle" });
// Register a personal deadline and bring a pre-existing 54-day review forward.
const targetDates = await page.evaluate(() => {
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
  }).format(new Date());
  function after(days) {
    const date = new Date(today + "T00:00:00Z");
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
  }
  const data = JSON.parse(localStorage.getItem("kyuyo-study-v2"));
  data.cards["base-1"].dueAt = new Date(
    Date.now() + 54 * 86400000,
  ).toISOString();
  data.cards["base-1"].scheduledDays = 54;
  localStorage.setItem("kyuyo-study-v2", JSON.stringify(data));
  return { later: after(21), earlier: after(3) };
});
await page.reload({ waitUntil: "networkidle" });
await page
  .getByRole("heading", { name: "目標期日を設定しましょう", exact: true })
  .waitFor();
await page.getByRole("button", { name: "目標期日を設定", exact: true }).click();
await page.getByLabel("目標期日", { exact: true }).fill(targetDates.later);
await page.getByRole("button", { name: "目標期日を設定", exact: true }).click();
await page
  .getByRole("heading", { name: "目標期日まであと21日", exact: true })
  .waitFor();
const targetSchedule = await page.evaluate(() =>
  JSON.parse(localStorage.getItem("kyuyo-study-v2")),
);
assert.equal(targetSchedule.targetDate, targetDates.later);
assert.ok(
  Date.parse(targetSchedule.cards["base-1"].dueAt) < Date.now() + 7 * 86400000,
);
await page.reload({ waitUntil: "networkidle" });
await page
  .getByRole("heading", { name: "目標期日まであと21日", exact: true })
  .waitFor();
await page.getByRole("button", { name: "問題ライブラリ", exact: true }).click();
await page.getByLabel("問題を検索").fill("給与明細の基本");
const progressFilter = page.getByRole("group", { name: "回答状況" });
await progressFilter.getByRole("button", { name: "未回答", exact: true }).click();
await page.getByText("一致する問題がありません。").waitFor();
await progressFilter.getByRole("button", { name: "回答済み", exact: true }).click();
await page.getByText("正解 1回 / 回答 1回", { exact: true }).waitFor();
await progressFilter.getByRole("button", { name: "回答状況すべて" }).click();
await page.locator(".library-question").click();
await page.getByLabel("解答の数値").fill("225,000");
await page.getByRole("button", { name: "回答する", exact: true }).click();
assert.match(
  await page.getByRole("button", { name: /できた/ }).textContent(),
  /4日後/,
);
assert.match(
  await page.getByRole("button", { name: /余裕/ }).textContent(),
  /7日後/,
);
await page.getByRole("button", { name: "ホームへ戻る", exact: true }).click();

await page.getByRole("button", { name: "設定", exact: true }).click();
await page.getByRole("heading", { name: "2026年度版・教材の基準" }).waitFor();
assert.equal(
  await page.evaluate(
    () => JSON.parse(localStorage.getItem("kyuyo-study-v2")).reviews.length,
  ),
  1,
);
await page.getByRole("button", { name: "問題ライブラリ", exact: true }).click();
await page.getByLabel("問題を検索").fill("");
await page.getByRole("button", { name: "知識問題" }).click();
assert.ok((await page.locator(".library-row").count()) > 20);
await page.getByLabel("問題を検索").fill("年末調整");
await page.getByText("一致する問題がありません。").waitFor();
await page.getByLabel("問題を検索").fill("");
await progressFilter.getByRole("button", { name: "未回答", exact: true }).click();
assert.ok(await page.locator(".library-row").count() > 0);
await page.getByRole("button", { name: "この問題を解く", exact: true }).first().click();
await page.getByRole("heading", { name: "QUESTION 01", exact: true }).waitFor();
await page.getByRole("button", { name: "ホームへ戻る", exact: true }).click();
await page.getByRole("button", { name: "問題ライブラリ", exact: true }).click();
assert.equal(await progressFilter.getByRole("button", { name: "未回答", exact: true }).getAttribute("aria-pressed"), "true");
await progressFilter.getByRole("button", { name: "回答状況すべて" }).click();
await page.getByLabel("問題を検索").fill("2026");
assert.ok((await page.locator(".library-row").count()) >= 3);
await page.getByRole("button", { name: "設定", exact: true }).click();
await page.getByRole("combobox").selectOption("15");
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
await page.getByRole("heading", { name: "不正解", exact: true }).waitFor();
assert.equal(await page.locator(".rating").count(), 1);
await page.screenshot({
  path: "/private/tmp/94exam-mobile-study.png",
  fullPage: true,
});
await page.getByRole("button", { name: /もう一度.*12時間後/ }).click();
assert.equal(
  await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("kyuyo-study-v2")).reviews.at(-1).grade,
  ),
  1,
);
// Complete the configured 15-question session without an intermediate results screen.
await page.getByRole("button", { name: /わからない/ }).click();
await page.getByRole("heading", { name: "不正解", exact: true }).waitFor();
assert.equal(await page.locator(".rating").count(), 1);
await page.locator(".rating").first().click();
for (let i = 0; i < 13; i++) {
  await page.locator(".answer").first().click();
  await page.locator(".rating").first().click();
}
await page.getByRole("heading", { name: "演習結果", exact: true }).waitFor();
await page.getByText(/15問に取り組み/).waitFor();
assert.equal(
  await page.evaluate(
    () => JSON.parse(localStorage.getItem("kyuyo-study-v2")).reviews.length,
  ),
  16,
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
await page.getByLabel("目標期日", { exact: true }).fill(targetDates.earlier);
await page.getByRole("button", { name: "目標期日を保存", exact: true }).click();
const earlierSchedule = await page.evaluate(() =>
  JSON.parse(localStorage.getItem("kyuyo-study-v2")),
);
assert.equal(earlierSchedule.targetDate, targetDates.earlier);
assert.ok(
  Date.parse(earlierSchedule.cards["base-1"].dueAt) < Date.now() + 86400000,
);
await page.getByRole("button", { name: "目標期日を解除", exact: true }).click();
assert.equal(
  await page.evaluate(
    () => JSON.parse(localStorage.getItem("kyuyo-study-v2")).targetDate,
  ),
  null,
);
assert.equal(
  await page.getByLabel("目標期日", { exact: true }).inputValue(),
  "",
);
await page.getByLabel("目標期日", { exact: true }).fill(targetDates.later);
await page.getByRole("button", { name: "目標期日を設定", exact: true }).click();
await page.getByRole("combobox").selectOption("15");
const backup = await page.evaluate(() =>
  localStorage.getItem("kyuyo-study-v2"),
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
    () => JSON.parse(localStorage.getItem("kyuyo-study-v2")).reviews.length,
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
    () => JSON.parse(localStorage.getItem("kyuyo-study-v2")).targetDate,
  ),
  targetDates.later,
);
assert.equal(
  await page.evaluate(
    () => JSON.parse(localStorage.getItem("kyuyo-study-v2")).reviews.length,
  ),
  16,
);
await page.getByRole("button", { name: "学習ホーム", exact: true }).click();
await page.getByRole("button", { name: "出題・教材について" }).click();
await page.getByRole("dialog").waitFor();
await page.keyboard.press("Escape");
assert.equal(await page.getByRole("dialog").count(), 0);
await page
  .locator(".genre-options")
  .getByRole("button", { name: /すべて/ })
  .click();
const difficultyGroup = page.getByRole("group", {
  name: "難易度",
  exact: true,
});
await difficultyGroup.getByRole("button", { name: /上級/ }).click();
await page.getByRole("button", { name: "演習を開始", exact: true }).click();
assert.match(await page.locator(".question-edition").textContent(), /上級/);
await page.getByRole("button", { name: "ホームへ戻る", exact: true }).click();
assert.equal(
  await difficultyGroup
    .getByRole("button", { name: /上級/ })
    .getAttribute("aria-pressed"),
  "true",
);
await page.getByRole("button", { name: "問題ライブラリ", exact: true }).click();
await page.getByRole("button", { name: "保存した問題" }).click();
await difficultyGroup.getByRole("button", { name: /中級/ }).click();
assert.equal(await page.locator(".library-row").count(), 75);
for (const label of await page
  .locator(".library-question small")
  .allTextContents())
  assert.match(label, /中級/);
await page.getByRole("button", { name: "学習ホーム", exact: true }).click();
await difficultyGroup.getByRole("button", { name: /初級/ }).click();
for (const width of [360, 390, 430, 768, 1440]) {
  await page.setViewportSize({ width, height: 844 });
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    `difficulty selector overflow at ${width}`,
  );
}
assert.doesNotMatch(
  await page.locator("body").innerText(),
  /給与計算実務能力検定|[１２３123]級/,
);
assert.doesNotMatch(await page.title(), /給与計算実務能力検定|[１２３123]級/);
await page.getByRole("button", { name: "問題ライブラリ", exact: true }).click();
await page
  .getByRole("group", { name: "難易度", exact: true })
  .getByRole("button", { name: /中級/ })
  .click();
await page.getByLabel("問題を検索").fill("法定時間外労働の賃金を求める");
assert.equal(await page.locator(".library-row").count(), 1);
assert.match(
  await page.locator(".library-question small").textContent(),
  /知識＋計算/,
);
await page.locator(".library-question").click();
assert.equal(
  await page.locator(".question-meta .badge").textContent(),
  "知識＋計算",
);
assert.doesNotMatch(
  await page.locator(".question-prompt").textContent(),
  /25|1\.25|%|％/,
);
assert.equal(await page.locator(".explanation").count(), 0);
await page.setViewportSize({ width: 390, height: 844 });
await page.screenshot({
  path: "/private/tmp/94exam-knowledge-calculation.png",
  fullPage: true,
});
await page.getByLabel("解答の数値").fill("18000");
await page.getByRole("button", { name: "回答する", exact: true }).click();
await page.getByRole("heading", { name: "正解", exact: true }).waitFor();
assert.match(await page.locator(".explanation").textContent(), /25%/);
assert.match(await page.locator(".formula").textContent(), /1\.25/);
await page.getByRole("button", { name: /できた/ }).click();
assert.equal(
  await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem("kyuyo-study-v2")).reviews.at(-1)
        .questionId,
  ),
  "recall-1",
);
assert.deepEqual(errors, []);
console.log(
  "Browser checks passed: desktop/mobile, genre filtering, correct/incorrect review scheduling, persistence, edition metadata, search, responsive widths; no runtime errors.",
);
await browser.close();
