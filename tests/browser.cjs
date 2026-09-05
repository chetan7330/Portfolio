const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const base = process.env.TEST_URL || "http://127.0.0.1:3000";

(async () => {
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: [
      "--enable-webgl",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
    ],
  });
  try {
    const context = await browser.newContext({
      permissions: ["clipboard-read", "clipboard-write"],
      reducedMotion: "reduce",
      viewport: { width: 1504, height: 1046 },
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await context.request.get(base + "/api/portfolio");
    const data = await response.json();
    assert.equal(data.projects.length, 3);
    await page.goto(base);
    await page.locator(".project").first().waitFor();
    await page.locator(".avatar-pose").first().evaluate(img => img.decode());
    assert.equal(await page.locator(".project").count(), 3);
    assert.equal(await page.locator("canvas").count(), 0);

    await page
      .getByRole("button", { name: "Machine learning", exact: true })
      .click();
    assert.equal(await page.locator(".project:visible").count(), 1);
    assert.match(
      await page.locator(".project:visible h3").innerText(),
      /Post-HCT/,
    );
    await page.getByRole("button", { name: "All", exact: true }).click();
    const summary = page.locator(".project summary").first();
    await summary.focus();
    await page.keyboard.press("Enter");
    assert.equal(
      await page.locator(".project details").first().getAttribute("open"),
      "",
    );
    await page.keyboard.press("Enter");
    await page.locator("#copy-email").click();
    await page.waitForFunction(() =>
      document
        .querySelector("#copy-status")
        .textContent.includes("Email copied"),
    );
    assert.equal(
      await page.evaluate(() => navigator.clipboard.readText()),
      data.profile.email,
    );
    await page.evaluate(() =>
      Object.defineProperty(navigator, "clipboard", {
        configurable: true,
        value: { writeText: () => Promise.reject(Error("Denied")) },
      }),
    );
    await page.locator("#copy-email").click();
    await page.waitForFunction(() =>
      document
        .querySelector("#copy-status")
        .textContent.includes("Copy unavailable"),
    );
    const localLinks = await page
      .locator('a[href^="/"], a[href^="#"], img')
      .evaluateAll((nodes) =>
        nodes.map(
          (node) => node.getAttribute("href") || node.getAttribute("src"),
        ),
      );
    for (const link of new Set(localLinks)) {
      if (link.startsWith("#"))
        assert.equal(await page.locator(link).count(), 1, link);
      else
        assert.equal(
          (await context.request.get(base + link)).status(),
          200,
          link,
        );
    }
    for (const width of [1440, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 900 });
      assert(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `Overflow at ${width}`,
      );
    }
    await page.goto(base);
    await page.keyboard.press("Tab");
    assert.equal(await page.locator(":focus").innerText(), "Skip to content");
    await page.keyboard.press("Enter");
    assert.equal(new URL(page.url()).hash, "#main");
    assert.deepEqual(errors, []);

    const failure = await context.newPage();
    let fail = true;
    await failure.route("**/api/portfolio", (route) =>
      fail
        ? route.fulfill({ status: 503, json: { error: "Unavailable" } })
        : route.continue(),
    );
    await failure.route("**/api/github", (route) =>
      route.fulfill({ json: { status: "unavailable", repositories: [] } }),
    );
    await failure.goto(base);
    await failure.getByRole("button", { name: "Try again" }).waitFor();
    fail = false;
    await failure.getByRole("button", { name: "Try again" }).click();
    await failure.locator(".project").first().waitFor();
    await failure.getByRole("button", { name: "Retry GitHub" }).waitFor();
    await failure.close();

    const motion = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "no-preference" });
    await motion.goto(base);
    await motion.locator(".project").first().waitFor();
    await motion.mouse.move(100,100);
    await motion.waitForFunction(() => document.body.classList.contains("pointer-active"));
    await motion.close();
    const nojs = await browser.newContext({ javaScriptEnabled: false });
    const plain = await nojs.newPage();
    await plain.goto(base);
    await plain.locator("noscript a").first().waitFor({ state: "visible" });
    assert(await plain.locator("noscript a").first().isVisible());
    await nojs.close();
    console.log(
      "PASS: React API rendering; avatar, cursor feedback, reduced motion; filters; disclosures; clipboard success/failure; responsive widths 320–1504; API retry; GitHub outage; no-JS resume.",
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
