const { chromium } = require('playwright');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({channel:'chrome'});
 try {
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.clock.install({time:new Date('2026-09-05T12:00:00Z')});
  await page.clock.pauseAt(new Date('2026-09-05T12:00:01Z'));
  await page.goto(process.env.TEST_URL || 'http://127.0.0.1:3000');
  const avatar=page.locator('.hero-buddy');
  await avatar.locator('img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));

  assert.equal(await avatar.locator('button').count(),0);
  assert.equal(await page.locator('.hero-greeting').count(),0);
  assert.equal((await avatar.locator('.hello-tag').innerText()).replace(/\s+/g,' '),'👋 Hello!');
  const moods=['hello','code','coffee','code']; const times=[2400,4200,2400,4200];
  for(let step=0;step<12;step++) {
   assert.equal(await avatar.getAttribute('data-mood'),moods[step%4],`step ${step}`);
   assert.equal(await avatar.getAttribute('data-step'),String(step));
   await page.clock.runFor(times[step%4]);
  }
  assert.equal(await avatar.getAttribute('data-complete'),'true');
  assert.equal(await avatar.getAttribute('data-mood'),'code');
  await page.clock.runFor(60000);
  assert.equal(await avatar.getAttribute('data-step'),'12');
  await page.reload();
  assert.equal(await avatar.getAttribute('data-step'),'0');
  await avatar.locator('img').evaluateAll(images=>Promise.all(images.map(i=>i.decode())));
  await page.clock.runFor(7100);
  await page.screenshot({path:'/private/tmp/avatar-sipping-desktop.png'});
  for(const width of [320,390,768,1440]) {
   await page.setViewportSize({width,height:900});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width}`);
  }
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.waitForFunction(()=>document.querySelector('.hero-buddy').dataset.mood==='code');
  assert.deepEqual(errors,[]);
  console.log('PASS: exactly three hello/code/sip/code cycles, stops coding, refresh restarts, no controls, reduced motion and responsive layout.');
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exit(1)});
