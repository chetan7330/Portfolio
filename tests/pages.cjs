const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async()=>{const browser=await chromium.launch({channel:'chrome'});try{
const page=await browser.newPage({reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(process.env.TEST_URL || 'http://127.0.0.1:4173/Portfolio/');
await page.locator('.project').first().waitFor();assert.equal(await page.locator('.project').count(),3);
const paths=await page.locator('img, a[href^="/Portfolio/"]').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('src')||n.getAttribute('href')));
for(const path of new Set(paths)){assert(path.startsWith('/Portfolio/'),path);const response=await page.request.get(new URL(path,page.url()).href);assert.equal(response.status(),200,path);assert(!response.headers()['content-type'].includes('text/html'),path);}
assert.deepEqual(errors,[]);console.log('PASS: static Pages content renders without backend; all local images and document links resolve under /Portfolio/.');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
