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

  // [Prófefni] Blönduð tenging
  await page.click('#tab-blond');
  await page.check('input[name=mix-shape][value=B]');
  await page.click('[data-example]');
  out = await text('[data-out]');
  for (const re of [/= 90 Ω/, /0,1 A/, /3 V/, /2 V/, /4 V/, /lögmál Kirchhoffs/]) assert.match(out, re);
  await page.check('input[name=mix-shape][value=F]');
  await page.click('[data-example]');
  assert.match(await text('[data-out]'), /= 7,5 Ω/);
  await page.fill('#c-mixed-R3', '0');
  assert.match(await text('#c-mixed-R3-msg'), /stærra en núll/);
  assert.ok(!/7,5 Ω/.test(await text('[data-out]')));
  ok('[Prófefni] Blönduð tenging: reiknivél með sýnidæmum');
  await page.click('#tab-hlid');

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
  // Hjálpartæki: lögmál Ohms og einingabreytir í dæmi
  assert.equal(await page.locator('#p-su-2-tool-ohm').isHidden(), true);
  await page.click('#p-su-2 [aria-controls="p-su-2-tool-ohm"]');
  assert.match(await text('#p-su-2-tool-ohm'), /Gefið/);
  await page.click('#p-su-2 [aria-controls="p-su-2-tool-conv"]');
  await page.selectOption('#p-su-2-conv-q', 'R');
  await page.fill('#p-su-2-conv-v', '2,2');
  await page.selectOption('#p-su-2-conv-u', 'kΩ');
  const conv = await text('#p-su-2-tool-conv [data-conv-out]');
  assert.match(conv, /2200 Ω/); assert.match(conv, /0,0022 MΩ/);
  await page.fill('#p-su-2-conv-v', 'x');
  assert.match(await text('#p-su-2-conv-msg'), /ekki tala/);
  assert.equal(await page.locator('#p-su-2-sol').isHidden(), true, 'hjálpartæki sýna ekki lausn');
  await page.click('#p-su-2 [aria-controls="p-su-2-tool-calc"]');
  await page.fill('#p-su-2-calc-in', '9 / (1000 + 2000)');
  assert.equal(await text('#p-su-2-calc-out'), '= 0,003');
  await page.press('#p-su-2-calc-in', 'Enter');
  assert.match(await text('#p-su-2 [data-calc-hist]'), /9 \/ \(1000 \+ 2000\) = 0,003/);
  await page.click('#p-su-2 [data-calc-key="×"]');
  for (const k of ['1', '0', '0', '0']) await page.click(`#p-su-2 [data-calc-key="${k}"]`);
  await page.click('#p-su-2 [data-calc-key="="]');
  assert.equal(await page.inputValue('#p-su-2-calc-in'), '3');
  await page.fill('#p-su-2-calc-in', '5/0');
  assert.match(await text('#p-su-2-calc-out'), /núlli/);
  await page.click('#p-su-2 [data-calc-key="C"]');
  assert.equal(await page.inputValue('#p-su-2-calc-in'), '');
  assert.equal(await page.locator('#p-su-2-I-fb').innerText(), '', 'Enter í reiknivél sendir ekki svar');
  ok('Hjálpartæki: lögmál Ohms, einingabreytir og reiknivél í hverju dæmi');
  await page.click('[data-topic=prof]');
  const profCount = await page.locator('article.ex').count();
  assert.ok(profCount >= 30, 'prófefni ' + profCount);
  assert.equal(await page.locator('article.ex .tag-prof').count(), profCount);
  await page.fill('#p-pf-r5-U1', '120'); await page.fill('#p-pf-r5-R1', '23');
  await page.click('#p-pf-r5 button[type=submit]');
  assert.match(await text('#p-pf-r5-R1-fb'), /120 V/);
  await page.fill('#p-pf-b1-RH', '90'); await page.fill('#p-pf-b1-IH', '100'); await page.selectOption('#p-pf-b1-IH-unit', 'mA');
  await page.fill('#p-pf-b1-U_2_3', '3'); await page.fill('#p-pf-b1-I_2', '66,7'); await page.selectOption('#p-pf-b1-I_2-unit', 'mA');
  await page.fill('#p-pf-b1-I_3', '0,0333'); await page.fill('#p-pf-b1-U_1', '2'); await page.fill('#p-pf-b1-U_4', '4');
  await page.click('#p-pf-b1 button[type=submit]');
  assert.match(await text('#p-pf-b1 [data-overall]'), /Allt rétt/);
  ok('[Prófefni] æfingar: merking, sía, endurgjöf og blönduð tenging');
  await page.click('[data-topic=all]');
  // Sía og framvinda
  await page.click('[data-topic=seriesU]');
  assert.equal(await page.locator('article.ex').count(), await page.evaluate(() => Exercises.practice().filter((e) => e.topic === 'seriesU').length));
  assert.match(await text('[data-stats]'), /3 af \d+/);
  await page.goto(URL + '#yfirlit');
  assert.match(await text('[data-progress]'), /3 \/ \d+/);
  ok('Æfingar: mat, endurgjöf, einingar, krossaspurning, vísbending, lausn, framvinda');

  // Endurstilling með staðfestingu
  await page.click('[data-reset]');
  assert.equal(await page.locator('#confirm').isVisible(), true);
  await page.click('#confirm button[value=cancel]');
  assert.match(await text('[data-progress]'), /3 \/ \d+/);
  await page.click('[data-reset]');
  await page.click('#confirm-ok');
  await page.waitForFunction(() => /ekki leyst neinar/.test(document.querySelector('[data-progress]').innerText), null, { timeout: 2000 });
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('rafmagn-undirbuningur-v1')).exams.length), 0);
  ok('Endurstilling framvindu með staðfestingu');

  // Prófhamur
  await page.goto(URL + '#profhamur');
  await page.click('[data-start]');
  assert.match(await text('h1'), /Spurning 1 af 10/);
  assert.equal(await page.locator('[data-act=hint], [data-act=solution], .reveal-hint, .reveal-solution').count(), 0);
  assert.equal(await page.locator('article.ex [data-tool], .reveal-tool').count(), 0, 'engin hjálpartæki í prófham');
  // Svara fyrstu spurningu, fara áfram og til baka
  const firstInput = page.locator('article.ex input[data-key]').first();
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

  // PDF-skrár fylgja og „Sækja PDF“ vísar á þær
  const fs = require('fs');
  for (const f of ['glosur', 'formulublad', 'minnisblad']) assert.ok(fs.statSync(path.resolve(__dirname, '..', 'pdf', f + '.pdf')).size > 10000, f + '.pdf');
  assert.equal(await page.getAttribute('a[data-pdf=glosur]', 'href'), 'pdf/glosur.pdf');
  ok('PDF-skrár glósa og formúlublaðs eru til og tengdar');

  // Inni í Claude-artifact: prenthnappar bjóða PDF í gegnum downloads í stað prentglugga
  // Einfaldur vefþjónn svo fetch() virki eins og í artifact (file:// leyfir það ekki).
  const root = path.resolve(__dirname, '..');
  const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.pdf': 'application/pdf' };
  const server = require('http').createServer((req, res) => {
    const f = path.join(root, decodeURIComponent(req.url.split('?')[0]).replace(/^\/$/, '/index.html'));
    if (req.url === '/frame.html') { res.writeHead(200, { 'Content-Type': 'text/html' }); res.end('<!doctype html><iframe id="f" src="/index.html#formulublad" style="width:1100px;height:800px"></iframe>'); return; }
    if (!f.startsWith(root) || !fs.existsSync(f)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
    res.end(fs.readFileSync(f));
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const HTTP = 'http://127.0.0.1:' + server.address().port + '/index.html';
  const ctx = await browser.newContext();
  const ap = await ctx.newPage();
  ap.on('pageerror', (e) => errors.push(e.message));
  await ap.addInitScript(() => {
    window.__saved = []; window.__printed = 0;
    window.print = () => { window.__printed++; };
    window.claude = { use: (n) => Promise.resolve(n === 'downloads' ? { save: (req) => { window.__saved.push({ filename: req.filename, size: req.data.size, type: req.data.constructor.name }); return Promise.resolve({ status: 'saved' }); } } : null) };
  });
  await ap.goto(HTTP + '#glosur');
  await ap.click('[data-print]');
  await ap.waitForFunction(() => window.__saved.length === 1);
  let saved = await ap.evaluate(() => window.__saved);
  assert.match(saved[0].filename, /Glósur.*\.pdf$/); assert.ok(saved[0].size > 10000);
  assert.match(await ap.locator('#toast').innerText(), /vistað/);
  await ap.goto(HTTP + '#yfirlit');
  await ap.evaluate(() => { window.__saved = []; });
  await ap.click('[data-print-sheet]');
  await ap.waitForFunction(() => window.__saved.length === 1 && window.__saved[0].filename.startsWith('Formúlublað'));
  await ap.click('a[data-pdf=glosur]');
  await ap.waitForFunction(() => window.__saved.length === 2);
  assert.equal(await ap.evaluate(() => window.__printed), 0, 'enginn prentgluggi inni í artifact');
  await ctx.close();
  // Í ramma þar sem window.claude birtist seint: Prenta býður samt PDF og opnar ekki prentglugga.
  const ctx2 = await browser.newContext();
  const fp = await ctx2.newPage();
  await fp.addInitScript(() => {
    window.__saved = []; window.__printed = 0;
    window.print = () => { window.__printed++; };
    setTimeout(() => { window.claude = { use: (n) => Promise.resolve(n === 'downloads' ? { save: (req) => { window.__saved.push(req.filename); return Promise.resolve({ status: 'saved' }); } } : null) }; }, 600);
  });
  await fp.goto(HTTP.replace('index.html', 'frame.html'));
  const frame = fp.frameLocator('#f');
  await frame.locator('[data-print]').click();
  const fr = fp.frames().find((f) => f.url().includes('index.html'));
  await fr.waitForFunction(() => window.__saved.length === 1);
  assert.equal(await fr.evaluate(() => window.__printed), 0);
  await ctx2.close();
  server.close();
  ok('Inni í artifact: Prenta og Sækja PDF vista PDF-skjal í stað prentglugga');

  assert.deepEqual(errors, [], 'engar villur í vafra');
  ok('Engar JavaScript-villur');
  await browser.close();
})().catch((e) => { console.error('✗', e.message); process.exit(1); });
