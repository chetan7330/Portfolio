import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('built HTML exposes social metadata and a valid PNG without JavaScript', async () => {
 const html = await readFile('dist/index.html', 'utf8');
 assert(!html.includes('__SITE_URL__'));
 const url = html.match(/property="og:url" content="([^"]+)"/)[1];
 assert(url.startsWith('https://'));
 const image = html.match(/property="og:image" content="([^"]+)"/)[1];
 assert.equal(image, url + 'assets/portfolio-preview.png');
 const png = await readFile('dist/assets/portfolio-preview.png');
 assert.equal(png.subarray(1,4).toString(), 'PNG');
 assert.equal(png.readUInt32BE(16), 1200);
 assert.equal(png.readUInt32BE(20), 630);
});
