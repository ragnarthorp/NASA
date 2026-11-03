/*
 * Vafrapróf (Playwright + Chromium). Keyrt með: node tests/ui.e2e.js
 * Prófar reiknivélar, æfingar, prófham og að formúlublaðið prentist á eina A4-síðu.
 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const assert = require('node:assert/strict');
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  const text = (sel) => page.locator(sel).innerText();
  let step = 0;
  const ok = (msg) => console.log('✓', ++step, msg);

  await page.goto(URL + '#reiknivelar:ohm');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // Lögmál Ohms: 9 V og 1 kΩ → 9 mA
  await page.check('input[name=ohm-find][value=I]');
  await page.fill('#c-ohm-U', '9');
  await page.fill('#c-ohm-R', '1');
  await page.selectOption('#c-ohm-R-unit', 'kΩ');
  let out = await text('[data-out]');
  assert.match(out, /0,009 A \(= 9 mA\)/);
  assert.match(out, /1 kΩ = 1000 Ω/);
  ok('Ohm: 9 V / 1 kΩ = 9 mA');

  // Ógilt inntak: engin gömul niðurstaða
  await page.fill('#c-ohm-R', 'abc');
  out = await text('[data-out]');
  assert.ok(!/9 mA/.test(out));
  assert.match(await text('#c-ohm-R-msg'), /er ekki tala/);
  assert.equal(await page.getAttribute('#c-ohm-R', 'aria-invalid'), 'true');
  await page.fill('#c-ohm-R', '0');
  assert.match(await text('#c-ohm-R-msg'), /stærra en núll/);
  await page.fill('#c-ohm-R', '1,5');
  assert.match(await text('[data-out]'), /0,006 A \(= 6 mA\)/);
  ok('Ohm: ógilt inntak hafnað, komma samþykkt');

  // Raðtenging
  await page.click('#tab-rad');
  await page.fill('#c-series-U', '12');
  await page.fill('#c-series-R0', '100');
  await page.fill('#c-series-R1', '200');
  out = await text('[data-out]');
  for (const re of [/300 Ω/, /0,04 A \(= 40 mA\)/, /= 4 V/, /= 8 V/, /Summa spennufallanna er jöfn/]) assert.match(out, re);
  assert.match(await page.locator('[data-diagram] svg').getAttribute('aria-label'), /R2 = 200 Ω/);
  await page.click('[data-add]');
  assert.equal(await page.locator('.r-row').count(), 3);
  assert.ok(!/300 Ω \(/.test(await text('[data-out]')));
  assert.match(await text('[data-out]'), /Sláðu inn/);
  await page.fill('#c-series-R2', '300');
  assert.match(await text('[data-out]'), /600 Ω/);
  for (let i = 0; i < 3; i++) await page.click('[data-add]');
  assert.equal(await page.locator('.r-row').count(), 6);
  assert.equal(await page.locator('[data-add]').count(), 0, 'hámark 6');
  for (let i = 0; i < 4; i++) await page.click('[data-remove="2"]');
  assert.equal(await page.locator('.r-row').count(), 2);
  assert.equal(await page.locator('[data-remove]').count(), 0, 'lágmark 2');
  await page.click('[data-clear]');
  assert.equal(await page.inputValue('#c-series-U'), '');
  await page.click('[data-example]');
  assert.match(await text('[data-out]'), /300 Ω/);
  ok('Raðtenging: útreikningar, bæta við/fjarlægja, hreinsa, dæmi');

  // Hliðtenging
  await page.click('#tab-hlid');
  await page.click('[data-clear]');
  await page.fill('#c-parallel-U', '12');
  await page.fill('#c-parallel-R0', '100');
  await page.fill('#c-parallel-R1', '200');
  out = await text('[data-out]');
  for (const re of [/≈ 66,6667 Ω/, /0,12 A/, /0,06 A/, /0,18 A/, /Formúlan góða/, /Summa greinastraumanna/]) assert.match(out, re);
  await page.click('[data-add]');
  await page.fill('#c-parallel-R0', '300'); await page.fill('#c-parallel-R1', '300'); await page.fill('#c-parallel-R2', '300');
  out = await text('[data-out]');
  assert.match(out, /= 100 Ω/);
  assert.ok(!/Formúlan góða/.test(out));
  await page.fill('#c-parallel-U', 'Infinity');
  assert.match(await text('#c-parallel-U-msg'), /Óendanlegt/);
  assert.ok(!/100 Ω/.test(await text('[data-out]')));
  ok('Hliðtenging: 66,6667 Ω, greinastraumar, 3×300 Ω = 100 Ω, ógilt inntak');

  // Stillingar vistast
  await page.reload();
  assert.equal(await page.getAttribute('#tab-hlid', 'aria-selected'), 'true');
  assert.equal(await page.inputValue('#c-parallel-R2'), '300');
  ok('Reiknivélagildi vistast í localStorage');

  // Æfingar
  await page.goto(URL + '#aefingar:all');
  const cards = await page.locator('article.ex').count();
  assert.ok(cards >= 24);
  assert.ok(!/0,04 A/.test(await text('#p-su-1')), 'rétt svar ekki sýnilegt fyrirfram');
  assert.equal(await page.locator('#p-su-1-sol').isHidden(), true);
  await page.fill('#p-su-1-RH', '300');
  await page.fill('#p-su-1-I', '40'); await page.selectOption('#p-su-1-I-unit', 'mA');
  await page.fill('#p-su-1-U1', '4');
  await page.fill('#p-su-1-U2', '9');
  await page.click('#p-su-1 button[type=submit]');
  assert.match(await text('#p-su-1 [data-overall]'), /3 af 4 rétt/);
  assert.match(await text('#p-su-1-U2-fb'), /✗/);
  await page.fill('#p-su-1-U2', '8');
  await page.click('#p-su-1 button[type=submit]');
  assert.match(await text('#p-su-1 [data-overall]'), /Allt rétt/);
  assert.match(await text('#p-su-1 [data-status]'), /Leyst/);
  // Röng eining og algeng mistök
  await page.fill('#p-ohm-4-I', '9');
  await page.click('#p-ohm-4 button[type=submit]');
  assert.match(await text('#p-ohm-4-I-fb'), /einingin/);
  await page.fill('#p-pr-1-RH', '300');
  await page.click('#p-pr-1 button[type=submit]');
  assert.match(await text('#p-pr-1-RH-fb'), /raðtengingu/);
  await page.fill('#p-pr-1-RH', '66,7');
  await page.click('#p-pr-1 button[type=submit]');
  assert.match(await text('#p-pr-1-RH-fb'), /Rétt/);
  // Krossaspurning, vísbending, lausn
  await page.check('#p-c-1 input[value="0"]');
  await page.click('#p-c-1 button[type=submit]');
  assert.match(await text('#p-c-1 [data-mc-fb]'), /hliðtengingu/);
  await page.click('#p-c-1 [data-act=hint]');
  assert.equal(await page.locator('#p-c-1-hint').isVisible(), true);
  await page.click('#p-c-1 [data-act=solution]');
  assert.equal(await page.locator('#p-c-1-sol').isVisible(), true);
  // Sía og framvinda
  await page.click('[data-topic=seriesU]');
  assert.equal(await page.locator('article.ex').count(), 5);
  assert.match(await text('[data-stats]'), /2 af 36/);
  await page.goto(URL + '#yfirlit');
  assert.match(await text('[data-progress]'), /2 \/ 36/);
  ok('Æfingar: mat, endurgjöf, einingar, krossaspurning, vísbending, lausn, framvinda');

  // Endurstilling með staðfestingu
  await page.click('[data-reset]');
  assert.equal(await page.locator('#confirm').isVisible(), true);
  await page.click('#confirm button[value=cancel]');
  assert.match(await text('[data-progress]'), /2 \/ 36/);
  await page.click('[data-reset]');
  await page.click('#confirm-ok');
  await page.waitForFunction(() => /ekki leyst neinar/.test(document.querySelector('[data-progress]').innerText), null, { timeout: 2000 });
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('rafmagn-undirbuningur-v1')).exams.length), 0);
  ok('Endurstilling framvindu með staðfestingu');

  // Prófhamur
  await page.goto(URL + '#profhamur');
  await page.click('[data-start]');
  assert.match(await text('h1'), /Spurning 1 af 10/);
  assert.equal(await page.locator('[data-act=hint], [data-act=solution], .reveal').count(), 0);
  // Svara fyrstu spurningu, fara áfram og til baka
  const firstInput = page.locator('article.ex input[type=text]').first();
  const hasText = await firstInput.count();
  if (hasText) await firstInput.fill('1'); else await page.locator('article.ex input[type=radio]').first().check();
  await page.click('[data-next]');
  assert.match(await text('h1'), /Spurning 2 af 10/);
  await page.click('[data-goto="0"]');
  if (hasText) assert.equal(await firstInput.inputValue(), '1');
  else assert.equal(await page.locator('article.ex input[type=radio]').first().isChecked(), true);
  await page.reload();
  assert.match(await text('h1'), /Spurning 1 af 10/);
  ok('Prófhamur: engar vísbendingar, svör haldast við flakk og endurhleðslu');
  // Svara öllu rétt nema fyrstu með réttum gildum úr bankanum
  const ids = await page.evaluate(() => Store.state.exam.ids);
  for (let i = 0; i < ids.length; i++) {
    await page.click(`[data-goto="${i}"]`);
    await page.evaluate((id) => {
      const ex = Exercises.byId[id];
      const card = document.querySelector('article.ex');
      if (ex.type === 'mc') { card.querySelectorAll('input[type=radio]')[ex.options.findIndex((o) => o.correct)].click(); return; }
      ex.answers.forEach((a) => {
        const el = card.querySelector(`input[data-key="${a.key}"]`);
        el.value = Calc.formatNumber(Calc.fromSI(a.value, a.units[0]), 4);
        el.dispatchEvent(new Event('input', { bubbles: true }));
      });
    }, ids[i]);
  }
  await page.click('[data-submit]');
  await page.click('#confirm-ok');
  await page.waitForSelector('[data-new]');
  assert.match(await text('main'), /Niðurstöður æfingaprófs/);
  assert.match(await text('main'), /10 \/ 10/);
  assert.match(await text('main'), /ekki opinbera prófið/);
  assert.match(await text('main'), /Allir efnisflokkar í lagi/);
  assert.ok((await page.locator('details.sol').count()) === 10);
  ok('Prófhamur: skil, 10/10, útreikningar sýndir');
  await page.click('[data-new]');
  await page.click('[data-submit]');
  assert.match(await text('#confirm-text'), /eftir að svara 10 spurningum/);
  await page.click('#confirm-ok');
  await page.waitForSelector('[data-new]');
  assert.match(await text('main'), /0 \/ 10/);
  assert.match(await text('main'), /Gagnlegt væri að æfa betur/);
  ok('Prófhamur: autt próf gefur 0/10 og ábendingar um efnisflokka');

  // Formúlublað á eina A4-síðu
  await page.goto(URL + '#formulublad');
  await page.emulateMedia({ media: 'print' });
  const pdf = await page.pdf({ format: 'A4', preferCSSPageSize: true });
  if (process.env.SHOT_DIR) require('fs').writeFileSync(process.env.SHOT_DIR + '/test-sheet.pdf', pdf);
  const pages = (pdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  assert.equal(pages, 1, 'formúlublaðið er ' + pages + ' síður');
  await page.screenshot({ path: process.env.SHOT_DIR ? process.env.SHOT_DIR + '/print-sheet.png' : '/dev/null', fullPage: true }).catch(() => {});
  const hidden = await page.evaluate(() => getComputedStyle(document.querySelector('.site-head')).display);
  assert.equal(hidden, 'none');
  await page.emulateMedia({ media: 'screen' });
  ok('Formúlublað: ein A4-síða, valmynd falin í prentun');

  // Glósur prentast
  await page.goto(URL + '#glosur');
  await page.emulateMedia({ media: 'print' });
  const notesPdf = await page.pdf({ format: 'A4', preferCSSPageSize: true });
  const np = (notesPdf.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
  console.log('  glósur í prentun:', np, 'síður');
  await page.emulateMedia({ media: 'screen' });
  ok('Glósur prentast');

  assert.deepEqual(errors, [], 'engar villur í vafra');
  ok('Engar JavaScript-villur');
  await browser.close();
})().catch((e) => { console.error('✗', e.message); process.exit(1); });
