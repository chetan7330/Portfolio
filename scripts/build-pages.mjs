import { execFileSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const base = '/Portfolio/';
execFileSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--base', base], {
  stdio: 'inherit', env: { ...process.env, VITE_STATIC_SITE: 'true' },
});
const portfolio = JSON.parse(await readFile('data/portfolio.json', 'utf8'), (_key, value) =>
  typeof value === 'string' && value.startsWith('/assets/') ? base + value.slice(1) : value,
);
await mkdir('dist/api', { recursive: true });
await writeFile('dist/api/portfolio.json', JSON.stringify(portfolio));
const site = 'https://chetankrishna.in/';
await writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${site}sitemap.xml\n`);
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${site}</loc></url></urlset>\n`);
await writeFile('dist/.nojekyll', '');
