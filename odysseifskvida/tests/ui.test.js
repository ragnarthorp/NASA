/* Viðmótspróf með Playwright (iPad-hermun). Keyrsla: node --test tests/ui.test.js
   Notar WebKit ef það er uppsett (ODY_BROWSER=webkit), annars Chromium. Hermun kemur ekki í stað prófunar á iPad. */
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

let pw;
try { pw = require('playwright'); } catch (e) { pw = null; }
const { start } = require('./server.js');

const DATA = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'odysseifskvida.json'), 'utf8'));
const S = id => DATA.sections.find(s => s.id === id);
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'ody-ui-'));

const LANDSCAPE = { viewport: { width: 1194, height: 834 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' };
const PORTRAIT = Object.assign({}, LANDSCAPE, { viewport: { width: 834, height: 1194 } });

let browser, server, URL0;
test.before(async () => {
  if (!pw) return;
  const kind = process.env.ODY_BROWSER || 'chromium';
  browser = await pw[kind].launch();
  server = await start();
  URL0 = server.url;
});
test.after(async () => { if (browser) await browser.close(); if (server) server.srv.close(); });

async function open(opts) {
  const ctx = await browser.newContext(Object.assign({ acceptDownloads: true }, opts && opts.device || LANDSCAPE));
  if (opts && opts.init) await ctx.addInitScript(opts.init);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(URL0);
  await page.waitForSelector('html[data-ready="1"]');
  page.errors = errors;
  return { ctx, page };
}
async function reload(page) { await idle(page); await page.reload(); await page.waitForSelector('html[data-ready="1"]'); }
async function goto(page, id) {
  await page.evaluate(id => { const b = document.createElement('button'); b.dataset.goto = id; document.body.appendChild(b); b.click(); b.remove(); }, id);
  await page.waitForFunction(id => window.__ody.state.sectionId === id, id);
}
/* Setur textaval eins og notandi gerði með valhandföngum (stafastaðsetningar innan eininga). */
async function select(page, a, ao, b, bo) {
  await page.evaluate(([a, ao, b, bo]) => {
    const pt = (id, off) => {
      const el = document.getElementById('u-' + id);
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let n, left = off;
      while ((n = w.nextNode())) { if (left <= n.length) return [n, left]; left -= n.length; }
      throw new Error('offset');
    };
    const r = document.createRange();
    r.setStart(...pt(a, ao)); r.setEnd(...pt(b, bo));
    const s = getSelection(); s.removeAllRanges(); s.addRange(r);
  }, [a, ao, b, bo]);
  await page.waitForTimeout(150);
}
async function saveDownload(page, clickSel) {
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click(clickSel)]);
  const p = path.join(TMP, dl.suggestedFilename());
  await dl.saveAs(p);
  return p;
}
const idle = page => page.evaluate(() => window.__ody.idle());
const notes = page => page.evaluate(() => window.__ody.state.notes);
const savedLabel = page => page.textContent('#saveStatus');

const skip = !pw && 'Playwright er ekki uppsett';

test('tómt ástand, efnisyfirlit og kaflaskipti', { skip }, async () => {
  const { ctx, page } = await open();
  assert.equal(await page.textContent('#noteCount'), '0');
  assert.match(await page.textContent('#article h1'), /Ódysseifskviða/);
  await page.click('#btnToc');
  const items = await page.$$eval('#tocList button', bs => bs.map(b => b.textContent));
  assert.equal(items.length, 28);
  assert.ok(items.some(t => t.includes('XXIV') && t.includes('Friður')));
  await page.click('#tocList [data-goto="thattur-12"]');
  assert.equal(await page.textContent('#secTitle'), 'Sírenur, Skylla og naut Helíosar');
  assert.ok(!(await page.isVisible('#tocDlg')));
  await page.click('.chapnav .next');
  assert.equal(await page.textContent('#secTitle'), 'Heim til Íþöku');
  await page.click('.chapnav .prev');
  assert.equal(await page.textContent('#secTitle'), 'Sírenur, Skylla og naut Helíosar');
  // tilvitnun og heimildarlína eru aðgreindar einingar
  assert.ok(await page.$('#article .qblock blockquote.u'));
  assert.ok(await page.$('#article .qblock p.u.src'));
  await page.click('#btnNotes');
  assert.match(await page.textContent('#noteList'), /Engar glósur enn/);
  assert.deepEqual(page.errors, []);
  await ctx.close();
});

test('val yfir efnisgreinar og síðuskil → endurvinnsla → vistun → endurhleðsla', { skip }, async () => {
  const { ctx, page } = await open();
  await goto(page, 'thattur-02');
  const s = S('thattur-02');
  const u7 = s.units.filter(u => u.pages[0].pdfPage === 7).at(-1), u8 = s.units.find(u => u.pages[0].pdfPage === 8);
  await select(page, u7.id, u7.text.length - 30, u8.id, 25);
  assert.ok(await page.isVisible('#selbar'));
  const info = await page.textContent('#sbInfo');
  assert.match(info, /Bls\. 7–8/);
  assert.match(info, new RegExp(`Efnisgreinar ${u7.n}–${u8.n}`));
  await page.click('#sbRecycle');
  assert.ok(await page.isVisible('#editorDlg'));
  const expected = u7.text.slice(-30).trim() + '\n\n' + u8.text.slice(0, 25).trim();
  assert.equal(await page.inputValue('#edBody'), expected);
  assert.equal(await page.textContent('#edSrc'), expected);
  assert.ok(await page.isChecked('input[name="edType"][value="endurvinnsla"]'));
  assert.ok(await page.isVisible('#edGuide'));
  assert.match(await page.textContent('#edGuide'), /Lýstu aðalatriðinu með þínum orðum/);
  await page.fill('#edBody', 'Þingið leysist upp. Ernir boða að Ódysseifur sé á heimleið – ð þ æ ö.');
  await page.click('#edSave');
  await page.waitForFunction(() => /Vistað í þessu tæki/.test(document.getElementById('saveStatus').textContent));
  let ns = await notes(page);
  assert.equal(ns.length, 1);
  assert.equal(ns[0].type, 'endurvinnsla');
  assert.deepEqual(ns[0].anchor.pdfPages, [7, 8]);
  assert.equal(ns[0].anchor.quote, expected, 'upprunalegt val varðveitt');
  assert.equal(ns[0].insertedText, expected);
  assert.equal(await page.textContent('#noteCount'), '1');
  // frumtextinn er óbreyttur
  assert.equal(await page.textContent('#u-' + u7.id), u7.text);
  await reload(page);
  ns = await notes(page);
  assert.equal(ns.length, 1);
  assert.equal(ns[0].body, 'Þingið leysist upp. Ernir boða að Ódysseifur sé á heimleið – ð þ æ ö.');
  assert.equal(await page.evaluate(() => window.__ody.state.sectionId), 'thattur-02', 'lestrarstaður munaður');
  await page.click('#btnNotes');
  const card = await page.textContent('#noteList .note-card');
  assert.match(card, /Endurvinnsla/);
  assert.match(card, /II\. þáttur · Bls\. 7–8/);
  assert.deepEqual(page.errors, []);
  await ctx.close();
});

test('óbreytt endurvinnsla vistast sem Tilvitnun; Glósa við efnisgrein; skarandi glósur', { skip }, async () => {
  const { ctx, page } = await open();
  await goto(page, 'thattur-01');
  const u = S('thattur-01').units[1];
  await select(page, u.id, 0, u.id, 40);
  await page.click('#sbRecycle');
  await page.click('#edSave');
  await page.waitForFunction(() => window.__ody.state.notes.length === 1);
  let ns = await notes(page);
  assert.equal(ns[0].type, 'tilvitnun');
  await page.waitForFunction(() => /Tilvitnun/.test(document.getElementById('toast').textContent));
  // varaleið: hnappur við efnisgrein (sama efnisgrein → skarast)
  await page.click(`.nb[data-note-unit="${u.id}"]`);
  assert.equal(await page.textContent('#edSrc'), u.text);
  assert.equal(await page.inputValue('#edBody'), '');
  await page.check('input[name="edType"][value="spurning"]', { force: true });
  await page.fill('#edBody', 'Hvers vegna fara biðlarnir ekki?');
  await page.click('#edSave');
  await page.waitForFunction(() => window.__ody.state.notes.length === 2);
  ns = await notes(page);
  assert.equal(ns[1].type, 'spurning');
  assert.equal(ns[1].anchor.quote, u.text);
  assert.equal(await page.getAttribute(`.nb[data-note-unit="${u.id}"]`, 'aria-label'), `Glósa við efnisgrein ${u.n} (2 glósur fyrir)`);
  // „Skrifa eigin glósu“ opnar tóman ritreit
  await select(page, u.id, 5, u.id, 20);
  await page.click('#sbOwn');
  assert.equal(await page.inputValue('#edBody'), '');
  assert.ok(!(await page.isVisible('#edGuide')));
  await page.click('#edCancel');
  assert.ok(!(await page.isVisible('#editorDlg')));
  assert.equal((await notes(page)).length, 2);
  await ctx.close();
});

test('val í valmynd eða öðrum viðmótshlutum verður ekki glósa', { skip }, async () => {
  const { ctx, page } = await open();
  await goto(page, 'thattur-01');
  await page.evaluate(() => { const t = document.querySelector('.dt-main').firstChild; const r = document.createRange(); r.setStart(t, 0); r.setEnd(t, 10); getSelection().removeAllRanges(); getSelection().addRange(r); });
  await page.waitForTimeout(200);
  assert.ok(!(await page.isVisible('#selbar')));
  // val sem byrjar í efstu stiku og nær inn í texta er heldur ekki tekið gilt
  await page.evaluate(() => { const r = document.createRange(); r.setStart(document.querySelector('.dt-main').firstChild, 0); r.setEnd(document.querySelector('#article [data-unit]').firstChild, 10); getSelection().removeAllRanges(); getSelection().addRange(r); });
  await page.waitForTimeout(200);
  assert.ok(!(await page.isVisible('#selbar')));
  // kaflaheiti (ekki textaeining) eitt og sér
  await page.evaluate(() => { const t = document.getElementById('secTitle').firstChild; const r = document.createRange(); r.setStart(t, 0); r.setEnd(t, 5); getSelection().removeAllRanges(); getSelection().addRange(r); });
  await page.waitForTimeout(200);
  assert.ok(!(await page.isVisible('#selbar')));
  await ctx.close();
});

test('tengingar haldast við leturstækkun, stillingar og endurhleðslu', { skip }, async () => {
  const { ctx, page } = await open();
  await goto(page, 'thattur-05');
  const u = S('thattur-05').units[0];
  const st = u.text.indexOf('Seifur sendir'), en = st + 'Seifur sendir Hermes'.length;
  await select(page, u.id, st, u.id, en);
  const before = await page.evaluate(() => window.__ody.anchorFromSelection());
  await page.click('#sbOwn');
  await page.fill('#edBody', 'Hermes er sendiboði.');
  await page.click('#edSave');
  await page.waitForFunction(() => window.__ody.state.notes.length === 1);
  await page.click('#btnSettings');
  for (let i = 0; i < 6; i++) await page.click('#fsUp');
  await page.check('input[name="font"][value="sans"]', { force: true });
  await page.check('input[name="theme"][value="dokkt"]', { force: true });
  await page.check('input[name="width"][value="mjor"]', { force: true });
  assert.equal(await page.textContent('#fsValue'), '26 px');
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 900, height: 700 });
  await select(page, u.id, st, u.id, en);
  const after = await page.evaluate(() => window.__ody.anchorFromSelection());
  assert.deepEqual(after.start, before.start);
  assert.deepEqual(after.end, before.end);
  assert.equal(after.quote, 'Seifur sendir Hermes');
  await reload(page);
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'dokkt');
  assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--fs').trim()), '26px');
  const n = (await notes(page))[0];
  assert.deepEqual(n.anchor.start, before.start);
  assert.ok(!n.orphan);
  const hl = await page.evaluate(() => (CSS.highlights && CSS.highlights.get('ody-notes')) ? [...CSS.highlights.get('ody-notes')].map(r => r.toString()) : null);
  if (hl) assert.deepEqual(hl, ['Seifur sendir Hermes']);
  // endurstilla
  await page.click('#btnSettings');
  await page.click('#btnResetSettings');
  assert.equal(await page.textContent('#fsValue'), '20 px');
  assert.equal(await page.evaluate(() => document.documentElement.dataset.theme), 'ljost');
  await ctx.close();
});

test('glósuspjald: sía, breyta, eyða með afturköllun og fara á textastað', { skip }, async () => {
  const { ctx, page } = await open();
  for (const [sid, type] of [['thattur-01', 'athugasemd'], ['thattur-09', 'spurning'], ['thattur-01', 'endursogn']]) {
    await goto(page, sid);
    const u = S(sid).units[2];
    await page.click(`.nb[data-note-unit="${u.id}"]`);
    await page.check(`input[name="edType"][value="${type}"]`, { force: true });
    await page.fill('#edBody', `Glósa (${type}) við ${sid}`);
    await page.click('#edSave');
  }
  await page.waitForFunction(() => window.__ody.state.notes.length === 3);
  await page.click('#btnNotes');
  // röð í textanum: I, I, IX
  const locs = await page.$$eval('#noteList .nc-loc', e => e.map(x => x.textContent));
  assert.match(locs[0], /^I\. þáttur/); assert.match(locs[1], /^I\. þáttur/); assert.match(locs[2], /^IX\. þáttur/);
  await page.selectOption('#fSection', 'thattur-01');
  assert.equal(await page.$$eval('#noteList .note-card', e => e.length), 2);
  await page.selectOption('#fType', 'endursogn');
  assert.equal(await page.$$eval('#noteList .note-card', e => e.length), 1);
  assert.match(await page.textContent('#filterInfo'), /Sýni 1 af 3/);
  await page.selectOption('#fSection', ''); await page.selectOption('#fType', '');
  // breyta tegund og texta
  await page.click('#noteList .note-card:nth-child(3) button:has-text("Breyta")');
  assert.equal(await page.textContent('#edTitle'), 'Breyta glósu');
  await page.check('input[name="edType"][value="athugasemd"]', { force: true });
  await page.fill('#edBody', 'Breytt glósa um Kýklópinn.');
  await page.click('#edSave');
  await page.waitForFunction(() => window.__ody.state.notes.some(n => n.body === 'Breytt glósa um Kýklópinn.' && n.type === 'athugasemd'));
  // eyða og afturkalla
  const id = (await notes(page))[0].id;
  await page.click(`[data-note="${id}"] button:has-text("Eyða")`);
  assert.equal((await notes(page)).length, 2);
  await page.click('#toast button:has-text("Afturkalla")');
  await page.waitForFunction(id => window.__ody.state.notes.some(n => n.id === id), id);
  await reload(page);
  assert.equal((await notes(page)).length, 3, 'afturköllun vistuð');
  // fara á textastað í öðrum kafla
  const S9u2 = S('thattur-09').units[2].text;
  await goto(page, 'formali');
  if (!(await page.isVisible('#notesPanel'))) await page.click('#btnNotes');
  await page.click('#noteList .note-card:nth-child(3) button:has-text("Fara á textastað")');
  await page.waitForFunction(() => window.__ody.state.sectionId === 'thattur-09');
  await page.waitForFunction(() => (CSS.highlights && CSS.highlights.has('ody-flash')) || !!document.querySelector('.u-row.flash'));
  if (await page.evaluate(() => !!(CSS.highlights && CSS.highlights.has('ody-flash')))) {
    const r = await page.evaluate(() => [...CSS.highlights.get("ody-flash")][0].toString());
    assert.equal(r, S9u2, 'auðkenndur staður er nákvæmlega glósutextinn');
  }
  assert.equal(await page.textContent(`#u-${S('thattur-09').units[2].id}`), S('thattur-09').units[2].text, 'texti óbreyttur');
  await ctx.close();
});

test('útflutningur: Markdown og PDF með öllum glósum', { skip }, async () => {
  const { ctx, page } = await open();
  const long = 'Löng glósa með ð, þ, æ og ö. '.repeat(300) + 'LOKAORÐ';
  for (const sid of ['thattur-01', 'thattur-24', 'nofn']) {
    await goto(page, sid);
    await page.click(`.nb[data-note-unit="${S(sid).units[0].id}"]`);
    await page.fill('#edBody', sid === 'thattur-24' ? long : `Glósa við ${sid}`);
    await page.click('#edSave');
  }
  await page.waitForFunction(() => window.__ody.state.notes.length === 3);
  await page.click('#btnNotes');
  await page.click('#btnExport');
  await page.check('input[name="exFormat"][value="md"]', { force: true });
  await page.click('#exBuild');
  await page.waitForSelector('#fileDlg[open]');
  assert.match(await page.textContent('#fileInfo'), /Markdown-skrá með 3 glósum/);
  const mdPath = await saveDownload(page, '#fileDownload');
  assert.match(path.basename(mdPath), /^odysseifskvida-glosur-\d{4}-\d{2}-\d{2}\.md$/);
  const md = fs.readFileSync(mdPath, 'utf8').replace(/^﻿/, '');
  assert.equal((md.match(/### Glósa \d/g) || []).length, 3);
  assert.match(md, /## I\. þáttur — Aþena kemur til Íþöku/);
  assert.match(md, /## Helstu nöfn/);
  assert.match(md, /Tegund: Athugasemd/);
  assert.match(md, /> „Guðirnir sitja/);
  assert.ok(md.includes('LOKAORÐ'));
  await page.click('#fileDlg [data-close]');
  // PDF, aðeins núverandi sía, án frumtexta
  await page.selectOption('#fSection', 'thattur-24');
  await page.click('#btnExport');
  await page.check('input[name="exFormat"][value="pdf"]', { force: true });
  await page.check('input[name="exScope"][value="filter"]', { force: true });
  await page.uncheck('#exQuote', { force: true });
  await page.click('#exBuild');
  await page.waitForSelector('#fileDlg[open]', { timeout: 20000 });
  assert.match(await page.textContent('#fileInfo'), /PDF-skjal með 1 glósu/);
  const pdfPath = await saveDownload(page, '#fileDownload');
  const buf = fs.readFileSync(pdfPath);
  assert.equal(buf.slice(0, 5).toString(), '%PDF-');
  try {
    const txt = execFileSync('pdftotext', ['-enc', 'UTF-8', pdfPath, '-'], { stdio: ['ignore', 'pipe', 'ignore'] }).toString().replace(/\s+/g, ' ');
    assert.match(txt, /XXIV\. þáttur — Friður/);
    assert.match(txt, /LOKAORÐ/);
    assert.ok(!/Valinn frumtexti/.test(txt));
    assert.match(txt, /Sía: XXIV\. þáttur/);
  } catch (e) { if (e.code !== 'ENOENT') throw e; }
  assert.deepEqual(page.errors, []);
  await ctx.close();
});

test('vinnuskrá: vista, hafna röngum/skemmdum skrám, opna rétta með staðfestingu', { skip }, async () => {
  const { ctx, page } = await open();
  await goto(page, 'thattur-03');
  for (const i of [0, 1]) {
    await page.click(`.nb[data-note-unit="${S('thattur-03').units[i].id}"]`);
    await page.fill('#edBody', `Glósa ${i} – Nestor í Pýlos`);
    await page.click('#edSave');
  }
  await page.waitForFunction(() => window.__ody.state.notes.length === 2);
  await page.click('#btnNotes');
  await page.click('#btnSaveWf');
  const wfPath = await saveDownload(page, '#fileDownload');
  await page.click('#fileDlg [data-close]');
  const wf = JSON.parse(fs.readFileSync(wfPath, 'utf8'));
  assert.equal(wf.format, 'odysseifskvida-vinnuskra');
  assert.equal(wf.document.id, 'odysseifskvida-endursogn');
  assert.equal(wf.notes.length, 2);
  const before = await notes(page);

  const tryImport = async (name, content) => {
    const p = path.join(TMP, name); fs.writeFileSync(p, content);
    await page.setInputFiles('#fileInput', p);
    await page.waitForSelector('#confirmDlg[open]');
    return page.textContent('#confirmDlg');
  };
  let t = await tryImport('skemmd.json', '{"format": "odysseifskvida-vinnu');
  assert.match(t, /skemmd/); assert.match(t, /Núverandi vinna er óbreytt/);
  await page.click('#cfActions button');
  t = await tryImport('annad.json', JSON.stringify(Object.assign({}, wf, { document: Object.assign({}, wf.document, { id: 'annad-skjal' }) })));
  assert.match(t, /annað skjal/); await page.click('#cfActions button');
  t = await tryImport('utgafa.json', JSON.stringify(Object.assign({}, wf, { document: Object.assign({}, wf.document, { version: 'sha256-0000000000000000' }) })));
  assert.match(t, /aðra útgáfu/); await page.click('#cfActions button');
  assert.deepEqual(await notes(page), before, 'rangar skrár breyta engu');

  // rétt skrá með einni glósu → staðfesting, öryggisafrit í boði, hætta við breytir engu
  const one = Object.assign({}, wf, { notes: [Object.assign({}, wf.notes[1], { body: 'Úr vinnuskrá: ð þ æ ö' })] });
  t = await tryImport('rett.json', JSON.stringify(one));
  assert.match(t, /inniheldur 1 glósu/);
  assert.match(t, /Í þessu tæki eru nú 2 glósur/);
  assert.ok(await page.isVisible('#cfActions button:has-text("Vista öryggisafrit fyrst")'));
  await page.click('#cfActions button:has-text("Hætta við")');
  assert.deepEqual(await notes(page), before);
  await tryImport('rett2.json', JSON.stringify(one));
  await page.click('#cfActions button:has-text("Vista öryggisafrit fyrst")');
  await page.waitForSelector('#fileDlg[open]');
  const backup = await saveDownload(page, '#fileDownload');
  assert.equal(JSON.parse(fs.readFileSync(backup, 'utf8')).notes.length, 2);
  await page.click('#fileDlg [data-close]');
  await page.waitForSelector('#confirmDlg[open]');
  await page.click('#cfActions button:has-text("Skipta út glósum")');
  await page.waitForFunction(() => window.__ody.state.notes.length === 1);
  assert.equal((await notes(page))[0].body, 'Úr vinnuskrá: ð þ æ ö');
  await reload(page);
  assert.equal((await notes(page))[0].body, 'Úr vinnuskrá: ð þ æ ö');
  await ctx.close();
});

test('vistunarvilla: IndexedDB og localStorage óvirk', { skip }, async () => {
  const init = () => {
    Object.defineProperty(window, 'indexedDB', { get() { throw new Error('lokað'); } });
    Object.defineProperty(window, 'localStorage', { get() { throw new Error('lokað'); } });
  };
  const { ctx, page } = await open({ init });
  assert.ok(await page.isVisible('.banner.error[role="alert"]'));
  assert.match(await page.textContent('.banner.error'), /Ekki er hægt að vista í þessu tæki/);
  await goto(page, 'thattur-01');
  await page.click(`.nb[data-note-unit="${S('thattur-01').units[0].id}"]`);
  await page.fill('#edBody', 'Glósa sem ekki vistast');
  await page.click('#edSave');
  await page.waitForFunction(() => window.__ody.state.notes.length === 1);
  await page.waitForTimeout(200);
  assert.doesNotMatch(await savedLabel(page), /Vistað í þessu tæki/);
  await page.waitForFunction(() => /vistun í tækinu mistókst/.test(document.getElementById('toast').textContent));
  assert.ok(await page.isVisible('.banner.error button:has-text("Vista vinnuskrá")'));
  await ctx.close();
});

test('vistunarvilla við skrif í IndexedDB', { skip }, async () => {
  const init = () => {
    const orig = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = function () { if (window.__failSave) throw new DOMException('Fullt', 'QuotaExceededError'); return orig.apply(this, arguments); };
  };
  const { ctx, page } = await open({ init });
  await goto(page, 'thattur-01');
  await page.evaluate(() => { window.__failSave = true; });
  await page.click(`.nb[data-note-unit="${S('thattur-01').units[0].id}"]`);
  await page.fill('#edBody', 'x');
  await page.click('#edSave');
  await page.waitForSelector('.banner.error');
  assert.match(await page.textContent('.banner.error'), /Ekki tókst að vista í þessu tæki/);
  assert.match(await savedLabel(page), /Ekki tókst að vista/);
  assert.equal((await notes(page)).length, 1, 'glósan týnist ekki úr minni');
  await page.evaluate(() => { window.__failSave = false; });
  await page.click(`.nb[data-note-unit="${S('thattur-01').units[1].id}"]`);
  await page.fill('#edBody', 'y');
  await page.click('#edSave');
  await page.waitForFunction(() => /Vistað í þessu tæki/.test(document.getElementById('saveStatus').textContent));
  assert.ok(!(await page.$('.banner.error')), 'villuborði hverfur eftir vel heppnaða vistun');
  await reload(page);
  assert.equal((await notes(page)).length, 2);
  await ctx.close();
});

test('ritdrög vistast og má halda áfram eftir endurhleðslu', { skip }, async () => {
  const { ctx, page } = await open();
  await goto(page, 'thattur-06');
  const u = S('thattur-06').units[0];
  await select(page, u.id, 0, u.id, 30);
  await page.click('#sbRecycle');
  await page.fill('#edBody', 'Hálfskrifuð endursögn um Násíku');
  await page.waitForFunction(() => window.__ody.state.draft && window.__ody.state.draft.body === 'Hálfskrifuð endursögn um Násíku');
  await reload(page);
  assert.ok(await page.isVisible('.banner[data-id="draft"]'));
  await page.click('.banner[data-id="draft"] button:has-text("Halda áfram")');
  assert.equal(await page.inputValue('#edBody'), 'Hálfskrifuð endursögn um Násíku');
  assert.equal(await page.textContent('#edSrc'), u.text.slice(0, 30).trim());
  await page.click('#edSave');
  await page.waitForFunction(() => window.__ody.state.notes.length === 1);
  assert.equal((await notes(page))[0].type, 'endurvinnsla');
  await reload(page);
  assert.ok(!(await page.isVisible('.banner[data-id="draft"]')));
  await ctx.close();
});

test('iPad lóðrétt og lárétt: glósuspjald og breidd lestrartexta', { skip }, async () => {
  const L = await open({ device: LANDSCAPE });
  await goto(L.page, 'thattur-01');
  await L.page.click('#btnNotes');
  assert.ok(!(await L.page.$eval('#notesPanel', e => e.classList.contains('overlay'))), 'hliðarspjald í láréttri stöðu');
  const art = await L.page.$eval('#article', e => e.getBoundingClientRect().toJSON());
  const pan = await L.page.$eval('#notesPanel', e => e.getBoundingClientRect().toJSON());
  assert.ok(art.right <= pan.left + 1, 'texti og spjald skarast ekki');
  assert.ok(art.width >= 560, `lestrardálkur ${art.width}px`);
  await L.ctx.close();
  const P = await open({ device: PORTRAIT });
  await goto(P.page, 'thattur-01');
  const w0 = await P.page.$eval('#article', e => e.getBoundingClientRect().width);
  await P.page.click('#btnNotes');
  assert.ok(await P.page.$eval('#notesPanel', e => e.classList.contains('overlay')), 'yfirlagsspjald í lóðréttri stöðu');
  const w1 = await P.page.$eval('#article', e => e.getBoundingClientRect().width);
  assert.equal(w1, w0, 'lestrartexti heldur breidd');
  assert.ok(w0 >= 640, `breidd ${w0}`);
  await P.page.click('#btnCloseNotes');
  assert.ok(!(await P.page.isVisible('#notesPanel')));
  await P.ctx.close();
});

test('ritspjald við lága sýnilega hæð (opið skjályklaborð)', { skip }, async () => {
  for (const vp of [{ width: 1194, height: 380 }, { width: 834, height: 760 }, { width: 390, height: 420 }]) {
    const { ctx, page } = await open({ device: Object.assign({}, LANDSCAPE, { viewport: vp }) });
    await goto(page, 'thattur-01');
    const u = S('thattur-01').units[0];
    await select(page, u.id, 0, u.id, u.text.length);
    await page.click('#sbRecycle');
    const save = await page.$eval('#edSave', e => e.getBoundingClientRect().toJSON());
    const ta = await page.$eval('#edBody', e => e.getBoundingClientRect().toJSON());
    assert.ok(save.bottom <= vp.height && save.top >= 0, `Vista sýnilegt við ${vp.width}×${vp.height}`);
    const cancel = await page.$eval('#edCancel', e => e.getBoundingClientRect().toJSON());
    assert.ok(cancel.bottom <= vp.height, 'Hætta við sýnilegt');
    assert.ok(ta.height >= 60, 'ritreitur hefur hæð');
    await page.$eval('#edBody', e => e.scrollIntoView({ block: 'nearest' }));
    const ta2 = await page.$eval('#edBody', e => e.getBoundingClientRect().toJSON());
    assert.ok(ta2.top < vp.height && ta2.bottom > 0, 'ritreitur sýnilegur');
    await ctx.close();
  }
});

test('aðgengi: heiti hnappa, snertifletir og lyklaborð', { skip }, async () => {
  const { ctx, page } = await open();
  await goto(page, 'thattur-01');
  await page.click('#btnNotes');
  const bad = await page.$$eval('button', bs => bs.filter(b => b.offsetParent !== null).map(b => {
    const r = b.getBoundingClientRect();
    const name = (b.getAttribute('aria-label') || b.textContent || '').trim();
    return { name, w: Math.round(r.width), h: Math.round(r.height) };
  }).filter(b => !b.name || b.w < 44 || b.h < 44));
  assert.deepEqual(bad, []);
  // vafraaðdráttur leyfður
  const vp = await page.getAttribute('meta[name="viewport"]', 'content');
  assert.ok(!/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(\.0)?\b/.test(vp));
  // lyklaborð: Glósa við efnisgrein með Enter
  await page.focus(`.nb[data-note-unit="${S('thattur-01').units[0].id}"]`);
  await page.keyboard.press('Enter');
  assert.ok(await page.isVisible('#editorDlg'));
  assert.equal(await page.evaluate(() => document.activeElement.id), 'edBody');
  await page.keyboard.press('Escape');
  assert.ok(!(await page.isVisible('#editorDlg')));
  await ctx.close();
});
