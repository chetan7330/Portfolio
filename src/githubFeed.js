// Pure mapping from the GitHub repos API to the feed shape; shared by server.mjs and the static site.
export const GITHUB_REPOS_URL =
  "https://api.github.com/users/chetan7330/repos?sort=pushed&per_page=100&type=owner";

export function toGithubFeed(data, now = Date.now()) {
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
      description: typeof repo.description === "string" ? repo.description : "",
      url: repo.html_url,
      language: repo.language || "Code",
      stars: Number.isFinite(repo.stargazers_count) ? repo.stargazers_count : 0,
      updatedAt: repo.pushed_at,
    }));
  return { status: "fresh", repositories, updatedAt: new Date(now).toISOString() };
}
