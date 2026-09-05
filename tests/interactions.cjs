const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const base = process.env.TEST_URL || "http://127.0.0.1:3000";
(async () => {
  const browser = await chromium.launch({
    channel: "chrome",
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
  });
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
      reducedMotion: "reduce",
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base);
    await page.locator(".project").first().waitFor();
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    const menu = page.getByRole("dialog", { name: "Explore the portfolio" });
    await menu.waitFor();
    assert.equal(
      await page.evaluate(() => document.body.style.overflow),
      "hidden",
    );
    await menu.getByRole("button", { name: "Projects", exact: false }).click();
    await menu.waitFor({ state: "hidden" });
    assert.equal(new URL(page.url()).hash, "#projects");
    await page
      .getByRole("button", { name: "Explore SimManCee", exact: true })
      .click();
    const explorer = page.getByRole("dialog", { name: "Project explorer" });
    await explorer.waitFor();
    await explorer
      .getByRole("heading", { name: "SimManCee", exact: true })
      .waitFor();
    await explorer
      .getByRole("button", { name: "Next project", exact: true })
      .click();
    await explorer
      .getByRole("heading", {
        name: "Post-HCT Survival Prediction",
        exact: true,
      })
      .waitFor();
    await page.keyboard.press("ArrowRight");
    await explorer
      .getByRole("heading", { name: "Student Record Management", exact: true })
      .waitFor();
    await page.keyboard.press("Escape");
    await explorer.waitFor({ state: "hidden" });
    assert.equal(
      await page.locator(":focus").getAttribute("aria-label"),
      "Explore SimManCee",
    );
    assert.equal(await page.evaluate(() => document.body.style.overflow), "");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await menu.waitFor();
    assert(await menu.evaluate((n) => n.scrollWidth <= innerWidth));
    await page.keyboard.press("Escape");
    await page
      .getByRole("button", { name: "Explore SimManCee", exact: true })
      .click();
    await explorer.waitFor();
    assert(await explorer.evaluate((n) => n.scrollWidth <= innerWidth));
    await explorer
      .getByRole("button", { name: "Next project", exact: true })
      .click();
    await explorer
      .getByRole("heading", {
        name: "Post-HCT Survival Prediction",
        exact: true,
      })
      .waitFor();
    await page.keyboard.press("Escape");
    assert.deepEqual(errors, []);
    console.log(
      "PASS: menu navigation, project explorer, next/previous keyboard navigation, Escape, focus restoration, scroll unlock, mobile dialogs, no page errors.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
