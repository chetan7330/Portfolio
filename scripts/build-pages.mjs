import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { createGithubFeed } from '../server.mjs';

const base = '/Portfolio/';
execFileSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--base', base], {
  stdio: 'inherit', env: { ...process.env, VITE_STATIC_SITE: 'true' },
});
const portfolio = JSON.parse(await readFile('data/portfolio.json', 'utf8'), (_key, value) =>
  typeof value === 'string' && value.startsWith('/assets/') ? base + value.slice(1) : value,
);
const github = await createGithubFeed()();
await mkdir('dist/api', { recursive: true });
await writeFile('dist/api/portfolio.json', JSON.stringify(portfolio));
await writeFile('dist/api/github.json', JSON.stringify(github));
await writeFile('dist/.nojekyll', '');
