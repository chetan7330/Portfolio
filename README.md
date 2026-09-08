# Chetan Krishna — React portfolio

A JavaScript application built with **React, Vite, and Node.js**. React components render the portfolio from backend JSON and a live public GitHub feed. The original light and cobalt design includes a portrait-led hero, cursor-responsive artwork, and scroll-linked motion.

## Run

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run build
npm start
```

Open **http://127.0.0.1:3000**.

For development, stop the production server and run `npm run dev`. It starts the API on port 3000 and Vite on **http://127.0.0.1:5173**, with API requests proxied to Node.

For hosting, use `npm ci && npm run build` as the build command and `npm start` as the start command. Set `HOST=0.0.0.0` when the host requires an external listener; `PORT` defaults to 3000. This version requires a Node-capable host. GitHub Pages cannot run its backend. No deployment has been performed.

## Source

- `src/App.jsx`: React app, API states, hero, and contact.
- `src/PortfolioSections.jsx`: experience, filterable projects, GitHub feed, research, and biography.
- `src/Interactive.jsx`: navigation, project explorer, cursor tilt, and scroll motion.
- `src/useApi.js`: cancellable API requests and retry state.
- `src/ui.jsx`: shared links, icons, and section headings.
- `src/styles.css`: responsive presentation imported by the JavaScript entry point.
- `server.mjs`: backend API and production static asset server.

`index.html` is only Vite's small mounting shell; the website content and interactions are authored in React/JSX.

## Update content

Edit `data/portfolio.json` to update experience, projects, research, skills, contact information. The API reads it on every request; refresh the page to see content changes without rebuilding.

Public files are in `public/assets/`: `Resume-Chetan.pdf`, `images/photo.jpg`, and `documents/`. Rebuild after changing public files. Keep patent status as **published application**, not granted patent.

## Backend

- `GET /api/portfolio`: portfolio data.
- `GET /api/github`: up to six recently pushed, non-forked, non-archived public repositories from `chetan7330`. A five-minute in-memory cache shares concurrent requests. GitHub has a six-second timeout. Failures return cached data marked `stale`, or `unavailable` if nothing was fetched. Failed requests are retried after one minute.
- `GET /api/health`: health check.

No GitHub token is required. There is no admin editor, database, private-repository access, or writable API. The production server serves only the build's index and assets; it blocks `.env`, `.git`, source, tests, and direct data-file access.

## Accessibility and performance

Reduced-motion preferences disable scroll reveals, parallax, and cursor effects. Pointer and scroll updates use animation frames; cleanup removes listeners and observers. The current design does not load WebGL.

Keyboard navigation, native disclosures, announced filter counts, API retry states, and clipboard failure feedback are supported. Resume and email remain available without JavaScript.

## Verify

```sh
npm run build
npm test
# With npm start running, and Google Chrome installed:
npm run test:browser
```

`TEST_URL` can point browser tests at another local port. Browser tests use Playwright with Google Chrome. They check API rendering, cursor and scroll motion, reduced motion, filters, disclosures, clipboard, responsive widths, API retry, GitHub failure, and the no-JavaScript resume link.

## Interactive exploration

The Menu button opens section navigation. Each project artwork opens an explorer with implementation details, repository/website links, and previous/next navigation. Arrow keys browse projects; Escape closes the explorer and restores focus.

The sticky navigation tracks the current section with a reading-progress line. Portrait parallax, section reveals, cursor feedback, and artwork tilt respect reduced-motion settings.

## GitHub Pages deployment

The `main` branch contains the React source. `new-port-with-ani` currently contains the legacy HTML site and should not be used for this deployment.

In GitHub repository **Settings → Pages → Build and deployment → Source**, select **GitHub Actions** once. Push these changes to `main`, or run **Deploy portfolio to GitHub Pages** from the Actions tab. The workflow publishes `dist` at https://chetan7330.github.io/Portfolio/ on pushes to main, manual runs, and daily at 06:17 UTC. Pull requests run checks without publishing.

`npm run build:pages` builds with `/Portfolio/` as the asset base and creates static portfolio and public GitHub feed JSON files. This mode needs no backend. GitHub repository information is a deployment-time snapshot, not a live five-minute feed. If GitHub is unavailable during the build, the portfolio still deploys and its feed shows unavailable. Edit `data/portfolio.json` and push to update portfolio content.

Local Node development and `npm run build` continue to use the existing API. To verify Pages locally:

```sh
npm run build:pages
npx vite preview --base /Portfolio/ --port 4173
# In another terminal (Google Chrome required):
node tests/pages.cjs
```

## Tower container instance

The Docker image serves the React frontend and Node API together at `/` on port **3000**, as a non-root user. Only the compiled frontend, portfolio data and native Node server enter the runtime image; no npm dependencies are needed at runtime.

Image: `chetan-portfolio.central-india.cr.tower.cloud/portfolio:latest`

Add repository Actions secrets `TOWER_REGISTRY_USERNAME` and `TOWER_REGISTRY_PASSWORD` using registry credentials with push access. The container workflow tests pull requests without credentials; main pushes/manual runs build, smoke-test and publish both `latest` and an immutable full commit SHA tag. The registry must be reachable from GitHub-hosted runners.

For the container instance, use port 3000 and HTTP health path `/api/health`, configure private-registry pull credentials in Tower, and route the instance's domain to that port. Use a commit SHA tag for repeatable releases. No persistent volume is required. Outbound HTTPS allows the public GitHub feed to refresh.

```sh
docker build -t chetan-portfolio:local .
docker run --rm -p 3000:3000 chetan-portfolio:local
```

GitHub Pages deployment remains available until the container and its public domain are ready. Publishing an image does not create or update a container instance.

Primary website: https://chetankrishna.in/ (Tower Cloud container instance). Canonical and social-preview URLs use this domain for both builds.

### Automatic container deployment

After image publishing, the workflow can PATCH the existing container image, poll the returned operation for up to ten minutes, and check the public health endpoint. It deploys the full commit SHA tag, not the mutable `latest` tag. Failed operations and timeouts fail the workflow; no automatic rollback is attempted.

Configure these in the owner repository's Actions secrets and variables:
- Secret `TOWER_API_TOKEN`: a valid Tower bearer credential authorized to update this container. Registry credentials are not API credentials. A short-lived browser JWT is unsuitable for ongoing automation; configure a supported credential renewal flow before enabling it if required.
- Variable `TOWER_API_BASE_URL`: the confirmed external base URL exposing `containers/{name}/image` and `operations/{id}` for the instance's region (no trailing endpoint).
- Variable `TOWER_CONTAINER_NAME`: the exact instance name from Tower, not its DNS hostname.
- Variable `TOWER_AUTO_DEPLOY`: `true` only after the credential and regional API settings are verified. Otherwise publishing continues without deployment.

Test the deployment contract locally with `node --test scripts/deploy-container.test.mjs`. The contract was checked against the local Tower container-service implementation; production authentication and routing must be verified during setup.
