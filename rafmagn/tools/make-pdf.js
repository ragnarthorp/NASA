/*
 * Býr til PDF-skjöl glósanna og formúlublaðsins úr vefnum sjálfum (Playwright + Chromium).
 * Keyrt með: npm run pdf  →  pdf/glosur.pdf og pdf/formulublad.pdf
 * Keyrðu aftur ef glósum eða formúlublaði er breytt.
 */
'use strict';
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
const OUT = path.resolve(__dirname, '..', 'pdf');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1100, height: 900 } });
  for (const [route, file, title] of [['glosur', 'glosur.pdf', 'Glósur'], ['formulublad', 'formulublad.pdf', 'Formúlublað']]) {
    await page.goto(URL + '#' + route);
    await page.reload();
    await page.emulateMedia({ media: 'print' });
    await page.pdf({
      path: path.join(OUT, file), format: 'A4', preferCSSPageSize: true, printBackground: true,
      displayHeaderFooter: route === 'glosur',
      headerTemplate: '<span></span>',
      footerTemplate: '<div style="width:100%;font-size:8px;color:#444;text-align:center;font-family:sans-serif">' + title + ' · rað- og hliðtenging · síða <span class="pageNumber"></span> af <span class="totalPages"></span></div>',
      margin: route === 'glosur' ? { top: '12mm', bottom: '14mm', left: '12mm', right: '12mm' } : undefined,
    });
    await page.emulateMedia({ media: 'screen' });
    console.log('✓', file);
  }
  // Minnisblað fyrir próf (sjálfstæð síða)
  await page.goto('file://' + path.resolve(__dirname, '..', 'minnisblad.html'));
  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: path.join(OUT, 'minnisblad.pdf'), format: 'A4', preferCSSPageSize: true, printBackground: true,
    displayHeaderFooter: true, headerTemplate: '<span></span>',
    footerTemplate: '<div style="width:100%;font-size:8px;color:#333;text-align:center;font-family:sans-serif">Minnisblað fyrir próf · síða <span class="pageNumber"></span> af <span class="totalPages"></span></div>',
  });
  console.log('✓', 'minnisblad.pdf');
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
