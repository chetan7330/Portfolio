import { test } from "node:test";
import assert from "node:assert/strict";
import { createPortfolioServer, createGithubFeed } from "../server.mjs";

const repo = {
  name: "example",
  html_url: "https://github.com/chetan7330/example",
  language: "Go",
  stargazers_count: 2,
  pushed_at: "2026-09-01T00:00:00Z",
};

test("GitHub feed caches, shares concurrent fetches, filters, and marks stale results", async () => {
  let calls = 0,
    time = 1_000,
    fail = false;
  const feed = createGithubFeed(
    async () => {
      calls++;
      await new Promise((resolve) => setTimeout(resolve, 5));
      if (fail) throw Error("Offline");
      return {
        ok: true,
        json: async () => [
          repo,
          { ...repo, fork: true },
          { ...repo, html_url: "javascript:alert(1)" },
        ],
      };
    },
    () => time,
  );
  const [first, shared] = await Promise.all([feed(), feed()]);
  assert.equal(calls, 1);
  assert.deepEqual(first, shared);
  assert.equal(first.repositories.length, 1);
  await feed();
  assert.equal(calls, 1);
  time += 300_001;
  fail = true;
  assert.equal((await feed()).status, "stale");
  assert.equal((await feed()).repositories[0].name, "example");
  assert.equal(calls, 2);
  const unavailable = createGithubFeed(
    async () => ({ ok: false }),
    () => time,
  );
  assert.equal((await unavailable()).status, "unavailable");
});

test("HTTP serves API and assets, handles missing content, and blocks private files and mutations", async (t) => {
  const server = createPortfolioServer({
    fetcher: async () => ({ ok: true, json: async () => [repo] }),
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  const content = await (await fetch(base + "/api/portfolio")).json();
  assert.equal(content.profile.name, "Akula Chetan Krishna Sai");
  assert.equal(content.projects.length, 3);
  assert.match(content.research[1].kind, /Published patent application/);
  assert.equal(
    (await (await fetch(base + "/api/github")).json()).repositories[0].name,
    "example",
  );
  for (const path of ["/", "/assets/Resume-Chetan.pdf", "/api/health"])
    assert.equal((await fetch(base + path)).status, 200, path);
  for (const path of [
    "/.git/config",
    "/.env",
    "/data/portfolio.json",
    "/server.mjs",
    "/assets/%2e%2e%2fserver.mjs",
    "/vendor/../package.json",
    "/missing",
  ])
    assert.equal((await fetch(base + path)).status, 404, path);
  assert.equal(
    (await fetch(base + "/api/portfolio", { method: "POST" })).status,
    405,
  );
  assert.equal(
    (await fetch(base + "/api/portfolio", { method: "HEAD" })).headers.get(
      "content-type",
    ),
    "application/json; charset=utf-8",
  );
  const broken = createPortfolioServer({
    contentPath: "/nonexistent/portfolio.json",
  });
  await new Promise((resolve) => broken.listen(0, "127.0.0.1", resolve));
  t.after(() => new Promise((resolve) => broken.close(resolve)));
  assert.equal(
    (await fetch(`http://127.0.0.1:${broken.address().port}/api/portfolio`))
      .status,
    503,
  );
});
