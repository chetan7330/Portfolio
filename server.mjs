import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, join, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

// One public account and one process: a bounded five-minute cache, with stale data on upstream failure.
export function createGithubFeed(fetcher = fetch, now = Date.now) {
  let cached = null,
    expires = 0,
    pending;
  return async function getFeed() {
    if (now() < expires)
      return (
        cached || { status: "unavailable", repositories: [], updatedAt: null }
      );
    if (pending) return pending;
    pending = (async () => {
      try {
        const response = await fetcher(
          "https://api.github.com/users/chetan7330/repos?sort=pushed&per_page=100&type=owner",
          {
            headers: {
              Accept: "application/vnd.github+json",
              "User-Agent": "chetan-portfolio",
              "X-GitHub-Api-Version": "2022-11-28",
            },
            signal: AbortSignal.timeout(6000),
          },
        );
        if (!response.ok) throw Error("GitHub unavailable");
        const data = await response.json();
        if (!Array.isArray(data)) throw Error("Invalid GitHub response");
        const repositories = data
          .filter(
            (repo) =>
              !repo.fork &&
              !repo.archived &&
              typeof repo.name === "string" &&
              /^https:\/\/github\.com\/chetan7330\//.test(repo.html_url),
          )
          .slice(0, 6)
          .map((repo) => ({
            name: repo.name,
            description:
              typeof repo.description === "string" ? repo.description : "",
            url: repo.html_url,
            language: repo.language || "Code",
            stars: Number.isFinite(repo.stargazers_count)
              ? repo.stargazers_count
              : 0,
            updatedAt: repo.pushed_at,
          }));
        cached = {
          status: "fresh",
          repositories,
          updatedAt: new Date(now()).toISOString(),
        };
        expires = now() + 300_000;
        return cached;
      } catch {
        expires = now() + 60_000;
        if (cached) cached = { ...cached, status: "stale" };
        return (
          cached || { status: "unavailable", repositories: [], updatedAt: null }
        );
      } finally {
        pending = null;
      }
    })();
    return pending;
  };
}

export function createPortfolioServer({
  fetcher = fetch,
  contentPath = join(root, "data/portfolio.json"),
} = {}) {
  const github = createGithubFeed(fetcher);
  return createServer(async (request, response) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    response.setHeader("X-Frame-Options", "DENY");
    const json = (status, data) => {
      response.writeHead(status, {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "no-store",
      });
      response.end(
        request.method === "HEAD" ? undefined : JSON.stringify(data),
      );
    };
    if (!["GET", "HEAD"].includes(request.method)) {
      response.setHeader("Allow", "GET, HEAD");
      return json(405, { error: "Method not allowed" });
    }
    let pathname;
    try {
      pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
    } catch {
      return json(400, { error: "Invalid URL" });
    }
    try {
      if (pathname === "/api/portfolio") {
        try {
          return json(200, JSON.parse(await readFile(contentPath, "utf8")));
        } catch {
          return json(503, {
            error: "Portfolio content is temporarily unavailable",
          });
        }
      }
      if (pathname === "/api/github") return json(200, await github());
      if (pathname === "/api/health") return json(200, { status: "ok" });
      if (pathname === "/") pathname = "/index.html";
      let file;
      if (pathname === "/index.html") file = join(root, "dist/index.html");
      else if (pathname.startsWith("/assets/")) {
        const assets = join(root, "dist/assets") + sep;
        file = resolve(root, "dist", "." + pathname);
        if (
          !file.startsWith(assets) ||
          pathname.includes("\\") ||
          pathname.includes("\0") ||
          !types[extname(file)]
        )
          return json(404, { error: "Not found" });
      } else return json(404, { error: "Not found" });
      const info = await stat(file);
      if (!info.isFile()) return json(404, { error: "Not found" });
      const body = request.method === "HEAD" ? null : await readFile(file);
      response.writeHead(200, {
        "Content-Type": types[extname(file)] || "application/octet-stream",
        "Content-Length": info.size,
        "Cache-Control": "no-cache",
      });
      response.end(body);
    } catch (error) {
      json(error.code === "ENOENT" ? 404 : 500, {
        error:
          error.code === "ENOENT" ? "Not found" : "Unable to serve request",
      });
    }
  });
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || "127.0.0.1";
  const server = createPortfolioServer();
  server.listen(port, host, () =>
    console.log(`Portfolio running at http://${host}:${port}`),
  );
  server.on("error", (error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
