import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const base = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3002";
let analyticsSource;
if (process.env.ANALYTICS_SCRIPT_FILE) {
  analyticsSource = await readFile(process.env.ANALYTICS_SCRIPT_FILE, "utf8");
} else {
  const response = await fetch(
    "https://94exam.vercel.app/_vercel/insights/script.js",
  );
  assert.ok(response.ok, "The deployed Analytics script must be available");
  assert.ok(response.headers.get("content-type")?.includes("javascript"));
  analyticsSource = await response.text();
}
const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    window.cspViolations = [];
    document.addEventListener("securitypolicyviolation", (e) =>
      window.cspViolations.push({
        directive: e.effectiveDirective,
        uri: e.blockedURI,
      }),
    );
  });
  const pageviews = [];
  // Serve the real Analytics script, and keep all measurement traffic inside this test.
  await context.route(base + "/_vercel/insights/**", async (route) => {
    if (new URL(route.request().url()).pathname.endsWith("/script.js")) {
      await route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: analyticsSource,
      });
    } else {
      pageviews.push(route.request());
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "{}",
      });
    }
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  function checkHeaders(response) {
    assert.equal(response.status(), 200);
    const headers = response.headers();
    assert.equal(headers["cache-control"], "private, no-store");
    const csp = headers["content-security-policy"];
    const nonce = csp.match(/'nonce-([a-f0-9]{32})'/)?.[1];
    assert.ok(nonce, "Production policy must include a nonce");
    assert.ok(csp.includes("'strict-dynamic'"));
    assert.ok(
      !csp
        .split("; ")
        .find((d) => d.startsWith("script-src"))
        .includes("unsafe-"),
    );
    assert.ok(csp.includes("connect-src 'self'"));
    return nonce;
  }
  const initialPageview = page.waitForResponse((r) =>
    r.url().includes("/_vercel/insights/view"),
  );
  const firstNonce = checkHeaders(await page.goto(base));
  await page.getByRole("button", { name: "演習を開始" }).waitFor();
  assert.equal(
    await page.locator('meta[property="csp-nonce"]').getAttribute("content"),
    firstNonce,
  );
  const scriptNonces = await page
    .locator('script[type="module"][src]')
    .evaluateAll((s) => s.map((s) => s.nonce));
  assert.ok(scriptNonces.length > 0);
  assert.ok(scriptNonces.every((nonce) => nonce === firstNonce));
  await page.waitForFunction(() => window.vai === true);
  await initialPageview;
  assert.ok(
    pageviews.some(
      (request) =>
        request.url().endsWith("/view") && request.method() === "POST",
    ),
  );
  assert.deepEqual(await page.evaluate(() => window.cspViolations), []);
  const secondNonce = checkHeaders(await page.reload());
  assert.notEqual(
    firstNonce,
    secondNonce,
    "Each response must get a fresh nonce",
  );
  await page.getByRole("button", { name: "演習を開始" }).click();
  await page.locator(".calculator-toggle").click();
  const calculator = page.getByRole("dialog", { name: "四則演算の電卓" });
  for (const name of ["2", "足す", "3", "計算する"])
    await calculator.getByRole("button", { name, exact: true }).click();
  assert.equal(await page.getByLabel("電卓の表示").textContent(), "5");
  assert.deepEqual(await page.evaluate(() => window.cspViolations), []);
  assert.deepEqual(errors, []);

  await context.route(base + "/?csp-test=1", async (route) => {
    const response = await route.fetch();
    const nonce = checkHeaders(response);
    const attack = `<script>window.untrustedInline=true</script><script src="/csp-untrusted.js"></script><img src="data:image/png,broken" onerror="window.untrustedEvent=true"><script nonce="${nonce}">try{eval('window.untrustedEval=true')}catch(e){window.evalBlocked=true}</script>`;
    await route.fulfill({
      response,
      body: (await response.text()).replace("<body>", "<body>" + attack),
    });
  });
  await context.route(base + "/csp-untrusted.js", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/javascript",
      body: "window.untrustedExternal=true",
    }),
  );
  await page.goto(base + "/?csp-test=1");
  await page.waitForFunction(
    () => window.evalBlocked === true && window.cspViolations.length >= 3,
  );
  assert.deepEqual(
    await page.evaluate(() => [
      window.untrustedInline,
      window.untrustedExternal,
      window.untrustedEvent,
      window.untrustedEval,
    ]),
    [undefined, undefined, undefined, undefined],
  );
  const violations = await page.evaluate(() => window.cspViolations);
  assert.ok(
    violations.some(
      (v) => v.directive === "script-src-elem" && v.uri === "inline",
    ),
  );
  assert.ok(violations.some((v) => v.directive === "script-src-attr"));
  assert.ok(violations.some((v) => v.uri === "eval"));
  console.log(
    "Production CSP checks passed: fresh matching nonces, no HTML caching, hydration, real Analytics pageview, calculator; injected inline/external/event scripts and eval blocked.",
  );
} finally {
  await browser.close();
}
