import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const build = JSON.parse(
  await readFile(
    new URL("../.vercel/output/config.json", import.meta.url),
    "utf8",
  ),
);
const policy = build.routes.find((route) => route.headers?.["X-Frame-Options"]);
assert.ok(
  policy,
  "Security headers must be emitted into the Vercel deployment output",
);
const headers = Object.fromEntries(
  Object.entries(policy.headers).map(([key, value]) => [
    key.toLowerCase(),
    value,
  ]),
);
const base = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000";
const key = "kyuyo-study-v2";
const original = "{broken-original-history";
const backup = {
  version: 2,
  targetDate: null,
  cards: {},
  reviews: [],
  bookmarks: [],
  goal: 10,
};
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const context = await browser.newContext();
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const response = await page.goto(base);
  const responseHeaders = response.headers();
  for (const [key, value] of Object.entries(headers))
    assert.equal(responseHeaders[key], value);
  assert.ok(responseHeaders["content-security-policy"].includes("script-src "));
  assert.equal(responseHeaders["cache-control"], "private, no-store");
  await page.evaluate(
    ({ key, original }) => localStorage.setItem(key, original),
    { key, original },
  );
  await page.reload();
  await page
    .getByRole("heading", { name: "保存データを読み込めませんでした" })
    .waitFor();
  assert.equal(
    await page.evaluate((key) => localStorage.getItem(key), key),
    original,
  );
  await page.getByRole("button", { name: "設定", exact: true }).first().click();
  await page
    .getByRole("heading", { name: "保存データを読み込めませんでした" })
    .waitFor();
  assert.equal(
    await page.getByRole("button", { name: "演習を開始" }).count(),
    0,
  );
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: "元データを書き出す" }).click();
  const download = await pending;
  assert.equal(await readFile(await download.path(), "utf8"), original);
  const input = page.locator('input[type="file"]');
  await input.setInputFiles({
    name: "large.json",
    mimeType: "application/json",
    buffer: Buffer.alloc(8 * 1024 * 1024 + 1, 32),
  });
  await page
    .getByRole("status")
    .getByText("バックアップは8MB以下のファイルを選んでください。", {
      exact: true,
    })
    .waitFor();
  assert.equal(
    await page.evaluate((key) => localStorage.getItem(key), key),
    original,
  );
  await input.setInputFiles({
    name: "bad.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ ...backup, cards: [] })),
  });
  await page
    .getByRole("status")
    .getByText("学習データの形式が正しくありません。", { exact: true })
    .waitFor();
  page.once("dialog", (d) => d.dismiss());
  await input.setInputFiles({
    name: "valid.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify(backup)),
  });
  assert.equal(
    await page.evaluate((key) => localStorage.getItem(key), key),
    original,
  );
  page.once("dialog", (d) => d.accept());
  await input.setInputFiles({
    name: "valid.json",
    mimeType: "application/json",
    buffer: Buffer.from(JSON.stringify({ ...backup, extra: "discard" })),
  });
  await page
    .getByRole("button", { name: "学習履歴をリセット", exact: true })
    .waitFor();
  assert.deepEqual(
    JSON.parse(await page.evaluate((key) => localStorage.getItem(key), key)),
    backup,
  );
  await page.reload();
  await page.getByRole("button", { name: "演習を開始" }).waitFor();
  await page.evaluate(
    ({ key, original }) => localStorage.setItem(key, original),
    { key, original },
  );
  await page.reload();
  page.once("dialog", (d) => d.accept());
  await page.getByRole("button", { name: "保存データを削除して再開" }).click();
  await page.getByRole("button", { name: "演習を開始" }).waitFor();
  assert.deepEqual(
    JSON.parse(await page.evaluate((key) => localStorage.getItem(key), key)),
    backup,
  );
  for (const raw of ["", "null"]) {
    await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
      key,
      raw,
    });
    await page.reload();
    await page
      .getByRole("heading", { name: "保存データを読み込めませんでした" })
      .waitFor();
    assert.equal(
      await page.evaluate((key) => localStorage.getItem(key), key),
      raw,
    );
  }
  // Even same-origin framing is prohibited by the deployed policy.
  await page.evaluate((base) => {
    const f = document.createElement("iframe");
    f.src = base + "/";
    document.body.append(f);
  }, base);
  await page.waitForFunction(() => {
    const frame = document.querySelector("iframe");
    try {
      return frame.contentDocument === null;
    } catch {
      return true;
    }
  });
  assert.deepEqual(errors, []);
  console.log(
    "Security browser checks passed: recovery, original export, rejected/cancelled imports, restore, reset, frame blocking.",
  );
} finally {
  await browser.close();
}
