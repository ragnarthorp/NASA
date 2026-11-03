/* Glósur — útskýring, formúla, tengimynd og reiknað dæmi fyrir hvert atriði. */
(function (root) {
  'use strict';
  const Views = root.Views = root.Views || {};
  const UI = root.UI, S = UI.S, F = UI.F, Explain = root.Explain;

  const P = '<span class="tag tag-prof">[Prófefni]</span> ';
  const SECTIONS = [
    ['takn', 'Tákn og einingar'], ['ohm', 'Lögmál Ohms'], ['kirchhoff', '[Prófefni] Lögmál Kirchhoffs og mælar'],
    ['radtenging', 'Raðtenging'], ['rad-meira', '[Prófefni] Raðtenging í æfingunum'],
    ['hlidtenging', 'Hliðtenging'], ['hlid-meira', '[Prófefni] Hliðtenging í æfingunum'],
    ['blondud', '[Prófefni] Blönduð tenging'], ['einingar', 'Einingabreytingar'], ['mistok', 'Algeng mistök'], ['ord', '[Prófefni] Orð úr námsefninu'],
  ];

  function ohmTriangle() {
    return '<svg class="ohm-triangle" viewBox="0 0 220 180" role="img" aria-label="Þríhyrningur lögmáls Ohms: U efst, I og R neðst. Huldu stærðina sem þú leitar að: U = I · R, I = U / R, R = U / I.">' +
      '<title>Þríhyrningur lögmáls Ohms</title>' +
      '<path d="M110 10 L210 170 L10 170 Z" fill="#e4edfb" stroke="#13284a" stroke-width="3" stroke-linejoin="round"/>' +
      '<line x1="52" y1="102" x2="168" y2="102" stroke="#13284a" stroke-width="3"/>' +
      '<line x1="110" y1="102" x2="110" y2="170" stroke="#13284a" stroke-width="3"/>' +
      '<text x="110" y="82" text-anchor="middle" font-size="38" font-style="italic" font-family="Georgia,serif" fill="#13284a">U</text>' +
      '<text x="72" y="152" text-anchor="middle" font-size="34" font-style="italic" font-family="Georgia,serif" fill="#13284a">I</text>' +
      '<text x="148" y="152" text-anchor="middle" font-size="34" font-style="italic" font-family="Georgia,serif" fill="#13284a">R</text>' +
      '<text x="110" y="140" text-anchor="middle" font-size="22" fill="#13284a">·</text></svg>';
  }

  function section(id, title, tone, inner) {
    return '<section class="card note-section ' + (tone ? 'tone-' + tone : '') + '" id="' + id + '" aria-labelledby="' + id + '-h"><h2 id="' + id + '-h">' + title + '</h2>' + inner + '</section>';
  }
  function example(title, html) { return '<div class="example"><h4>' + title + '</h4>' + html + '</div>'; }

  function render() {
    const ohmEx = Explain.ohm('I', { U: 9, R: 1000 }, { U: 'V', R: 'kΩ' });
    const serEx = Explain.series(12, [100, 200]);
    const parEx = Explain.parallel(12, [100, 200]);
    const par3 = Explain.parallel(null, [300, 300, 300]);
    const T1 = { s: [{ name: 1, R: 20 }, { p: [{ name: 2, R: 45 }, { name: 3, R: 90 }] }, { name: 4, R: 40 }] };
    const T2 = { p: [{ name: 1, R: 40 }, { s: [{ name: 2, R: 20 }, { name: 3, R: 60 }] }, { name: 4, R: 50 }] };
    const T3 = { p: [{ name: 1, R: 12 }, { s: [{ name: 2, R: 12 }, { p: [{ name: 3, R: 12 }, { s: [{ name: 4, R: 12 }, { name: 5, R: 12 }] }] }] }] };
    const mix1 = Explain.network(9, T1);
    const lab = function (t) { const o = {}; root.Calc.leaves(t).forEach(function (l) { o[l.name] = root.Calc.formatIn(l.R, 'Ω'); }); return o; };

    let h = '<div class="section-head"><div><p class="eyebrow">Glósur</p><h1>Glósur: rað- og hliðtenging</h1>' +
      '<p class="lead">Stuttar glósur með formúlum, tengimyndum og reiknuðum dæmum. Þær eru prentvænar og nýtast vel í prófinu.</p></div>' +
      '<div class="actions no-print">' + UI.pdfLink('glosur', 'Sækja glósur sem PDF', 'btn-primary') + '<button type="button" data-print>Prenta glósur</button>' + '<a class="btn" href="#formulublad">Formúlublað (1 síða)</a></div></div>';
    h += '<div class="notes-layout"><nav class="toc" aria-label="Efnisyfirlit glósa"><ol>' +
      SECTIONS.map(function (s) { return '<li><a href="#glosur:' + s[0] + '">' + s[1] + '</a></li>'; }).join('') + '</ol></nav><div class="stack">';

    h += section('takn', 'Tákn og einingar', '',
      '<div class="table-wrap"><table><thead><tr><th scope="col">Tákn</th><th scope="col">Stærð</th><th scope="col">Eining</th><th scope="col">Dæmi</th></tr></thead><tbody>' +
      '<tr><td class="math">' + S('U') + '</td><td>Spenna</td><td>volt (V)</td><td>12 V rafhlaða</td></tr>' +
      '<tr><td class="math">' + S('I') + '</td><td>Straumur</td><td>amper (A)</td><td>0,04 A = 40 mA</td></tr>' +
      '<tr><td class="math">' + S('R') + '</td><td>Viðnám</td><td>ohm (Ω)</td><td>2,2 kΩ = 2200 Ω</td></tr>' +
      '</tbody></table></div>' +
      '<p style="margin-top:12px"><strong>H í undirskrift táknar heild.</strong> ' + S('R', 'H') + ' er heildarviðnám, ' + S('I', 'H') + ' heildarstraumur og ' + S('U', 'H') + ' heildarspenna (spenna spennugjafans). ' +
      'Tölur í undirskrift vísa í einstök viðnám: ' + S('U', 2) + ' er spennufallið yfir ' + S('R', 2) + ' og ' + S('I', 2) + ' straumurinn í gegnum ' + S('R', 2) + '.</p>' +
      '<p>Á þessum vef er <strong>U</strong> alltaf notað fyrir spennu.</p>');

    h += section('ohm', 'Lögmál Ohms', 'ohm',
      '<p>Lögmál Ohms tengir saman spennu, straum og viðnám. Það gildir bæði um eitt viðnám og um heila rás (þá með heildarstærðum ' + S('U', 'H') + ', ' + S('I', 'H') + ' og ' + S('R', 'H') + ').</p>' +
      '<div class="formula"><span>' + S('U') + ' = ' + S('I') + ' · ' + S('R') + '</span><span>' + S('I') + ' = ' + F(S('U'), S('R')) + '</span><span>' + S('R') + ' = ' + F(S('U'), S('I')) + '</span></div>' +
      '<div class="grid grid-2" style="align-items:center"><div>' +
      '<h3>Hvernig vel ég formúlu?</h3><p>Finndu fyrst hvaða tvær stærðir eru gefnar og hverja þú átt að finna. Veldu svo útgáfuna þar sem óþekkta stærðin stendur ein vinstra megin.</p>' +
      '<div class="table-wrap"><table class="choose-table"><thead><tr><th scope="col">Gefið</th><th scope="col">Óþekkt</th><th scope="col">Formúla</th></tr></thead><tbody>' +
      '<tr><td>' + S('I') + ' og ' + S('R') + '</td><td>Spenna ' + S('U') + '</td><td class="math">' + S('U') + ' = ' + S('I') + ' · ' + S('R') + '</td></tr>' +
      '<tr><td>' + S('U') + ' og ' + S('R') + '</td><td>Straumur ' + S('I') + '</td><td class="math">' + S('I') + ' = ' + S('U') + ' / ' + S('R') + '</td></tr>' +
      '<tr><td>' + S('U') + ' og ' + S('I') + '</td><td>Viðnám ' + S('R') + '</td><td class="math">' + S('R') + ' = ' + S('U') + ' / ' + S('I') + '</td></tr>' +
      '</tbody></table></div>' +
      '<p class="small muted" style="margin-top:8px">Minnisregla: huldu stærðina sem þú leitar að í þríhyrningnum. Það sem eftir stendur er formúlan (hlið við hlið = margfalda, hvort ofan á öðru = deila).</p></div>' +
      '<div>' + ohmTriangle() + '</div></div>' +
      UI.diagram({ kind: 'series', U: '9 V', R: ['1 kΩ'], I: '?' }, 'Einföld rás: 9 V spennugjafi og 1 kΩ viðnám.') +
      example('Reiknað dæmi: 9 V og 1 kΩ', '<p>Finndu strauminn þegar ' + S('U') + ' = 9 V og ' + S('R') + ' = 1 kΩ.</p>' + UI.steps(ohmEx.steps)));

    h += section('kirchhoff', P + 'Lögmál Kirchhoffs og mælar', 'prof',
      '<p>Í námsefninu eru reglurnar um rað- og hliðtengingu kallaðar <strong>lögmál Kirchhoffs</strong>. Þau eru rökrétt framhald af lögmáli Ohms og eiga við hvernig straumur dreifist og hvernig spenna skiptist í rás.</p>' +
      '<div class="grid grid-2">' +
      '<div class="formula-box"><h4>1. lögmál Kirchhoffs — straumur</h4><p style="margin:0 0 6px">„Summa strauma sem streyma að greinipunkti er jöfn summu þeirra strauma sem streyma frá honum.“</p>' +
      '<div class="formula"><span>' + S('I', 'H') + ' = ' + S('I', 1) + ' + ' + S('I', 2) + ' + ' + S('I', 3) + ' + …</span></div><p class="small" style="margin:0">Á við <strong>hliðtengingu</strong>.</p></div>' +
      '<div class="formula-box"><h4>2. lögmál Kirchhoffs — spenna</h4><p style="margin:0 0 6px">„Summa spennufalla í lokaðri straumrás er jöfn spennugjafaspennunni.“</p>' +
      '<div class="formula"><span>' + S('U', 'H') + ' = ' + S('U', 1) + ' + ' + S('U', 2) + ' + ' + S('U', 3) + ' + …</span></div><p class="small" style="margin:0">Á við <strong>raðtengingu</strong>.</p></div></div>' +
      '<p>Í blandaðri tengingu eru bæði lögmálin notuð, hvort á sinn hluta rásarinnar.</p>' +
      '<h3>Mælar</h3><div class="table-wrap"><table><thead><tr><th scope="col">Mælir</th><th scope="col">Mælir</th><th scope="col">Tenging</th></tr></thead><tbody>' +
      '<tr><td><strong>Straummælir (A)</strong>, ampermælir</td><td>straum</td><td><strong>Raðtengdur</strong> — straumurinn þarf að fara í gegnum mælinn.</td></tr>' +
      '<tr><td><strong>Spennumælir (V)</strong>, voltmælir</td><td>spennu / spennufall</td><td><strong>Hliðtengdur</strong> yfir íhlutinn sem á að mæla.</td></tr>' +
      '<tr><td><strong>Viðnámsmælir (Ω)</strong>, ohmmælir</td><td>viðnám</td><td>Tengdur yfir mótstöðuna þegar <strong>enginn straumur</strong> er á rásinni.</td></tr>' +
      '</tbody></table></div>' +
      example('Dæmi úr æfingunum (2.1.1, dæmi 1): kemur niðurstaðan heim við 2. lögmál Kirchhoffs?',
        '<p>10 Ω, 15 Ω og 23 Ω í raðtengingu við 24 V: ' + S('R', 'H') + ' = 48 Ω og ' + S('I') + ' = 24 V / 48 Ω = 0,5 A.</p>' +
        '<p class="math">' + S('U', 1) + ' = 0,5 · 10 = 5 V, ' + S('U', 2) + ' = 0,5 · 15 = 7,5 V, ' + S('U', 3) + ' = 0,5 · 23 = 11,5 V</p>' +
        '<p style="margin:0">5 V + 7,5 V + 11,5 V = 24 V = spennugjafaspennan. ✓ Já, niðurstaðan kemur heim við 2. lögmál Kirchhoffs.</p>'));

    h += section('radtenging', 'Raðtenging', 'series',
      '<p><span class="tag tag-series">Raðtenging</span> Viðnámin eru tengd hvert á eftir öðru, svo straumurinn hefur aðeins <strong>eina leið</strong>. Þess vegna fer <strong>sami straumur</strong> um öll viðnámin, en spenna spennugjafans <strong>skiptist</strong> á milli þeirra.</p>' +
      '<div class="formula"><span>' + S('R', 'H') + ' = ' + S('R', 1) + ' + ' + S('R', 2) + ' + … + ' + S('R', 'n') + '</span></div>' +
      '<div class="formula"><span>' + S('U', 'H') + ' = ' + S('U', 1) + ' + ' + S('U', 2) + ' + … + ' + S('U', 'n') + '</span></div>' +
      '<div class="formula"><span>' + S('I', 'H') + ' = ' + S('I', 1) + ' = ' + S('I', 2) + ' = … = ' + S('I', 'n') + '</span></div>' +
      UI.diagram({ kind: 'series', U: '12 V', R: ['100 Ω', '200 Ω'], I: '0,04 A', drops: ['4 V', '8 V'] }, 'Raðtenging: sami straumur, 0,04 A, fer um bæði viðnámin. Spennuföllin 4 V og 8 V leggjast saman í 12 V.') +
      '<h3>Vinnuröð</h3><ol class="workorder">' +
      '<li>Leggja viðnámin saman: ' + S('R', 'H') + ' = ' + S('R', 1) + ' + ' + S('R', 2) + ' + …</li>' +
      '<li>Reikna heildarstraum: ' + S('I', 'H') + ' = ' + S('U', 'H') + ' / ' + S('R', 'H') + '</li>' +
      '<li>Reikna spennufall yfir hvert viðnám: ' + S('U', 1) + ' = ' + S('I', 'H') + ' · ' + S('R', 1) + ' o.s.frv.</li>' +
      '<li>Athuga að summa spennufalla sé jöfn spennu spennugjafans: ' + S('U', 1) + ' + ' + S('U', 2) + ' + … = ' + S('U', 'H') + '</li></ol>' +
      example('Reiknað dæmi: 12 V, 100 Ω og 200 Ω í raðtengingu', UI.steps(serEx.steps)));

    h += section('rad-meira', P + 'Raðtenging í æfingunum', 'prof',
      '<p>Í æfingadæmunum (2.1.1) eru fleiri gerðir af spurningum en bara „finndu R_H, I og spennuföllin“. Þessar koma oftast fyrir:</p>' +
      '<div class="table-wrap"><table><thead><tr><th scope="col">Gerð</th><th scope="col">Aðferð</th><th scope="col">Dæmi úr námsefninu</th></tr></thead><tbody>' +
      '<tr><td><strong>Jafnstórar mótstöður</strong></td><td>' + S('R', 'H') + ' = ' + S('n') + ' · ' + S('R') + ' og ' + S('U', 'R') + ' = ' + S('U', 'H') + ' / ' + S('n') + '</td><td>3 × 30 Ω við 90 V: ' + S('R', 'H') + ' = 90 Ω, 30 V yfir hverja</td></tr>' +
      '<tr><td><strong>Óþekkt mótstaða</strong></td><td>' + S('R', 4) + ' = ' + S('R', 'H') + ' − (' + S('R', 1) + ' + ' + S('R', 2) + ' + ' + S('R', 3) + ')</td><td>1260 − (120 + 560 + 220) = 360 Ω</td></tr>' +
      '<tr><td><strong>Út frá mælalestri</strong></td><td>' + S('U', 1) + ' = ' + S('U') + ' − ' + S('U', 2) + ', svo ' + S('R', 1) + ' = ' + S('U', 1) + ' / ' + S('I') + '</td><td>10 V, 20 mA, 5,6 V yfir R₂: ' + S('R', 1) + ' = 4,4 V / 0,02 A = 220 Ω</td></tr>' +
      '<tr><td><strong>Fellimótstaða</strong></td><td>Spennan sem þarf að fella: ' + S('U', 'R') + ' = ' + S('U') + ' − ' + S('U', 'tæki') + '; ' + S('R') + ' = ' + S('U', 'R') + ' / ' + S('I') + '</td><td>110 V ljóskastari, 10 A, á 230 V: 120 V / 10 A = 12 Ω</td></tr>' +
      '<tr><td><strong>Fjöldi tækja í röð</strong></td><td>' + S('n') + ' = ' + S('U') + ' / ' + S('U', 'tæki') + '; sami straumur um öll</td><td>1,8 V LED á 9 V: 5 stk., 25 mA</td></tr>' +
      '<tr><td><strong>Hámarks- og lágmarksstraumur</strong></td><td>Reikna ' + S('I', 'H') + ' = ' + S('U') + ' / ' + S('R', 'H') + ' og bera saman við mörkin</td><td>Pera 450 Ω, 13–20 mA: með 500 Ω fellimótstöðu verður ' + S('I') + ' ≈ 25 mA → peran brennur</td></tr>' +
      '</tbody></table></div>' +
      '<p style="margin-top:12px"><strong>Til að muna:</strong> Í raðtengdri rás fellur alltaf mest spenna yfir stærsta viðnámið (1 kΩ og 20 Ω við 51 V: 50 V og 1 V). Ef ein mótstaða í raðtengingu rofnar stöðvast straumurinn í allri rásinni.</p>' +
      example('Fellimótstaða skref fyrir skref (2.1.1, dæmi 7)', UI.steps([
        { title: 'Spennufall yfir fellimótstöðuna', html: ['Peran er gerð fyrir 9 V og spennugjafinn gefur 24 V: ' + S('U', 'R1') + ' = 24 V − 9 V = 15 V'] },
        { title: 'Straumur', html: ['Sami straumur fer um bæði: 20 mA = 0,02 A'] },
        { title: 'Viðnám fellimótstöðunnar', html: [S('R', 1) + ' = ' + F('15 V', '0,02 A') + ' = 750 Ω'] },
        { title: 'Athugun', html: [S('R', 'H') + ' = 750 Ω + 450 Ω = 1200 Ω og ' + F('24 V', '1200 Ω') + ' = 0,02 A ✓'] },
      ])));

    h += section('hlidtenging', 'Hliðtenging', 'parallel',
      '<p><span class="tag tag-parallel">Hliðtenging</span> Hvert viðnám er í sinni <strong>grein</strong> og allar greinarnar eru tengdar á milli sömu tveggja punkta. Þess vegna er <strong>sama spenna</strong> yfir hverri grein, en straumurinn <strong>skiptist</strong> á milli greinanna. Hver ný grein er ný leið fyrir strauminn, svo heildarviðnámið minnkar.</p>' +
      '<div class="formula"><span>' + F('1', S('R', 'H')) + ' = ' + F('1', S('R', 1)) + ' + ' + F('1', S('R', 2)) + ' + … + ' + F('1', S('R', 'n')) + '</span></div>' +
      '<div class="formula"><span>' + S('I', 'H') + ' = ' + S('I', 1) + ' + ' + S('I', 2) + ' + … + ' + S('I', 'n') + '</span></div>' +
      '<div class="formula"><span>' + S('U', 'H') + ' = ' + S('U', 1) + ' = ' + S('U', 2) + ' = … = ' + S('U', 'n') + '</span></div>' +
      '<div class="formula-box"><h4>Formúlan góða — fyrir tvö viðnám</h4><div class="formula"><span>' + S('R', 'H') + ' = ' + F(S('R', 1) + ' · ' + S('R', 2), S('R', 1) + ' + ' + S('R', 2)) + '</span></div>' +
      '<p class="small" style="margin:0">Gildir aðeins fyrir <strong>nákvæmlega tvö</strong> viðnám. Fyrir þrjú eða fleiri notarðu andhverfuformúluna (eða formúluna góðu tvisvar, tvö viðnám í einu).</p></div>' +
      UI.diagram({ kind: 'parallel', U: '12 V', R: ['100 Ω', '200 Ω'], I: '0,18 A', currents: ['0,12 A', '0,06 A'] }, 'Hliðtenging: sama spenna, 12 V, yfir báðum greinum. Greinastraumarnir 0,12 A og 0,06 A leggjast saman í 0,18 A.') +
      '<h3>Vinnuröð</h3><ol class="workorder">' +
      '<li>Finna heildarviðnám með ' + F('1', S('R', 'H')) + ' = ' + F('1', S('R', 1)) + ' + ' + F('1', S('R', 2)) + ' + … og snúa við (eða formúlunni góðu fyrir tvö viðnám).</li>' +
      '<li>Nota spennu spennugjafans yfir hverja grein: ' + S('U', 1) + ' = ' + S('U', 2) + ' = ' + S('U', 'H') + '.</li>' +
      '<li>Reikna straum í hverri grein: ' + S('I', 1) + ' = ' + S('U', 'H') + ' / ' + S('R', 1) + ' o.s.frv.</li>' +
      '<li>Leggja greinastrauma saman: ' + S('I', 'H') + ' = ' + S('I', 1) + ' + ' + S('I', 2) + ' + …</li>' +
      '<li>Athuga að ' + S('I', 'H') + ' = ' + S('U', 'H') + ' / ' + S('R', 'H') + '.</li></ol>' +
      example('Reiknað dæmi: 12 V, 100 Ω og 200 Ω í hliðtengingu', UI.steps(parEx.steps)) +
      example('Reiknað dæmi: þrjú 300 Ω viðnám í hliðtengingu', UI.diagram({ kind: 'parallel', U: '', R: ['300 Ω', '300 Ω', '300 Ω'] }) + UI.steps(par3.steps) +
        '<p class="small">Hér má ekki nota formúluna góðu beint á öll þrjú viðnámin. Athugaðu: ' + S('n') + ' jafnstór viðnám í hliðtengingu gefa ' + S('R', 'H') + ' = ' + S('R') + ' / ' + S('n') + ', hér 300 Ω / 3 = 100 Ω.</p>'));

    h += section('hlid-meira', P + 'Hliðtenging í æfingunum', 'prof',
      '<div class="table-wrap"><table><thead><tr><th scope="col">Gerð</th><th scope="col">Aðferð</th><th scope="col">Dæmi úr námsefninu (2.2.1)</th></tr></thead><tbody>' +
      '<tr><td><strong>Jafnstórar mótstöður</strong></td><td>' + S('R', 'H') + ' = ' + S('R') + ' / ' + S('n') + ' og ' + S('I', 'R') + ' = ' + S('I', 'H') + ' / ' + S('n') + '</td><td>Fjórar 20 Ω: 5 Ω. Fimm 100 Ω: 20 Ω</td></tr>' +
      '<tr><td><strong>Hve mörg álög?</strong></td><td>' + S('n') + ' = ' + S('R') + ' / ' + S('R', 'H') + '</td><td>800 Ω álög, ' + S('R', 'H') + ' ≥ 40 Ω: 20 stk.</td></tr>' +
      '<tr><td><strong>Bæta við mótstöðu til að ná ' + S('R', 'H') + '</strong></td><td>' + F('1', S('R', 3)) + ' = ' + F('1', S('R', 'H')) + ' − ' + F('1', S('R', 1)) + ' − ' + F('1', S('R', 2)) + '</td><td>20 Ω og 40 Ω, ' + S('R', 'H') + ' = 10 Ω: ' + S('R', 3) + ' = 40 Ω</td></tr>' +
      '<tr><td><strong>Óþekkt grein út frá straumum</strong></td><td>' + S('I', 3) + ' = ' + S('I', 'H') + ' − ' + S('I', 1) + ' − ' + S('I', 2) + ', svo ' + S('R', 3) + ' = ' + S('U') + ' / ' + S('I', 3) + ' (1. lögmál Kirchhoffs)</td><td>240 V, 14,4 A, 100 Ω og 60 Ω: ' + S('I', 3) + ' = 8 A, ' + S('R', 3) + ' = 30 Ω</td></tr>' +
      '<tr><td><strong>Ný grein bætist við</strong></td><td>Hinar greinarnar breytast ekki; ' + S('I', 'H') + ' eykst um straum nýju greinarinnar</td><td>20 Ω við 240 V bætir 12 A við: 26,4 A</td></tr>' +
      '<tr><td><strong>Grein rofnar</strong></td><td>Hinar greinarnar breytast ekki; ' + S('I', 'H') + ' minnkar</td><td>10, 20, 40 Ω við 10 V: 1,75 A → 1,5 A þegar 40 Ω rofnar</td></tr>' +
      '</tbody></table></div>' +
      '<div class="grid grid-2" style="margin-top:12px"><div><h3>Hvers vegna eru tæki hliðtengd við net?</h3><ul><li>Hvert tæki fær <strong>fulla netspennu</strong> (t.d. 230 V), sem það er gert fyrir.</li><li>Greinarnar eru <strong>óháðar</strong>: ef slökkt er á einu tæki eða það bilar halda hin áfram.</li><li>Í raðtengingu myndi spennan skiptast á milli tækjanna og eitt bilað tæki stöðvaði öll hin.</li></ul></div>' +
      '<div><h3>Hvar fer mestur straumur?</h3><p>Um <strong>minnsta viðnámið</strong>, því ' + S('I') + ' = ' + S('U') + ' / ' + S('R') + ' með sama ' + S('U') + '. Dæmi: 5 Ω, 1000 Ω og 2000 Ω við 230 V gefa 46 A, 0,23 A og 0,115 A. Heildarstraumurinn er 46,345 A, svo munurinn á honum og stærsta greinastraumnum er aðeins 0,345 A.</p></div></div>' +
      example('Bæta við mótstöðu svo R_H verði 10 Ω (2.2.1, dæmi 5)', UI.steps([
        { title: 'Andhverfurnar leggjast saman', html: [F('1', S('R', 'H')) + ' = ' + F('1', S('R', 1)) + ' + ' + F('1', S('R', 2)) + ' + ' + F('1', S('R', 3)) + ' ⇒ ' + F('1', S('R', 3)) + ' = ' + F('1', S('R', 'H')) + ' − ' + F('1', S('R', 1)) + ' − ' + F('1', S('R', 2))] },
        { title: 'Setja inn', html: [F('1', S('R', 3)) + ' = ' + F('1', '10') + ' − ' + F('1', '20') + ' − ' + F('1', '40') + ' = 0,1 − 0,05 − 0,025 = 0,025'] },
        { title: 'Snúa við', html: [S('R', 3) + ' = ' + F('1', '0,025') + ' = 40 Ω'] },
      ])));

    h += section('blondud', P + 'Blönduð tenging', 'prof',
      '<p>Í flestum rásum eru mótstöður bæði raðtengdar og hliðtengdar. Þá eru bæði lögmál Kirchhoffs notuð: <strong>sami straumur</strong> í raðtengdum hluta og <strong>sama spenna</strong> yfir hliðtengdum hluta.</p>' +
      '<h3>Vinnuröð</h3><ol class="workorder">' +
      '<li>Greina rásina: hvaða mótstöður eru raðtengdar og hverjar hliðtengdar?</li>' +
      '<li>Reikna <strong>innstu hópana fyrst</strong> saman í eitt viðnám, t.d. ' + S('R', '2,3') + ' fyrir hliðtengdar ' + S('R', 2) + ' og ' + S('R', 3) + '.</li>' +
      '<li>Halda áfram út á við þar til ' + S('R', 'H') + ' er fundið.</li>' +
      '<li>Reikna ' + S('I', 'H') + ' = ' + S('U', 'H') + ' / ' + S('R', 'H') + '.</li>' +
      '<li>Vinna til baka inn í rásina: í raðtengdum hluta ' + S('U') + ' = ' + S('I') + ' · ' + S('R') + ', í hliðtengdum hluta ' + S('I') + ' = ' + S('U') + ' / ' + S('R') + '.</li>' +
      '<li>Athuga með lögmálum Kirchhoffs að spennuföll og straumar stemmi.</li></ol>' +
      UI.diagram({ kind: 'network', U: '9 V', tree: T1, labels: lab(T1), I: '0,1 A' }, 'Sýnidæmi 1: R₂ og R₃ eru hliðtengdar; sá hópur er raðtengdur við R₁ og R₄.') +
      example('Sýnidæmi 1: R₁ + (R₂ ‖ R₃) + R₄ við 9 V', UI.steps(mix1.steps)) +
      '<div class="grid grid-2" style="margin-top:14px">' +
      '<div>' + UI.diagram({ kind: 'network', U: '8,7 V', tree: T2, labels: lab(T2) }, 'Sýnidæmi 2: þrjár hliðtengdar greinar; í miðgreininni eru R₂ og R₃ raðtengdar.') +
      '<p class="small">' + S('R', '2,3') + ' = 20 + 60 = 80 Ω; ' + F('1', S('R', 'H')) + ' = ' + F('1', '40') + ' + ' + F('1', '80') + ' + ' + F('1', '50') + ' ⇒ ' + S('R', 'H') + ' ≈ 17,4 Ω; ' + S('I', 'H') + ' ≈ 0,5 A; ' + S('I', '2,3') + ' = 8,7 / 80 ≈ 0,109 A; ' + S('U', 2) + ' ≈ 2,18 V og ' + S('U', 3) + ' ≈ 6,53 V.</p></div>' +
      '<div>' + UI.diagram({ kind: 'network', U: '7,5 V', tree: T3, labels: lab(T3) }, 'Sýnidæmi 3: fimm 12 Ω mótstöður.') +
      '<p class="small">' + S('R', '4,5') + ' = 24 Ω; ' + S('R', '3,4,5') + ' = ' + F('1', F('1', '12') + ' + ' + F('1', '24')) + ' = 8 Ω; ' + S('R', '2,3,4,5') + ' = 12 + 8 = 20 Ω; ' + S('R', 'H') + ' = ' + F('1', F('1', '12') + ' + ' + F('1', '20')) + ' = 7,5 Ω; ' + S('I', 'H') + ' = 1 A.</p></div></div>' +
      '<p style="margin-top:10px">Öll þrjú sýnidæmin eru í <a href="#aefingar:mixed">æfingunum</a> með skref-fyrir-skref lausn, og <a href="#reiknivelar:blond">reiknivélin</a> leysir þessar gerðir rása.</p>');

    h += section('einingar', 'Einingabreytingar', '',
      '<div class="formula"><span>1 A = 1.000 mA</span><span>1 kΩ = 1.000 Ω</span></div>' +
      '<p>Breyttu alltaf í <strong>samræmdar einingar</strong> — volt (V), amper (A) og ohm (Ω) — <strong>áður</strong> en þú reiknar. Þá kemur svarið líka í V, A eða Ω.</p>' +
      '<div class="table-wrap"><table><thead><tr><th scope="col">Breyting</th><th scope="col">Aðferð</th><th scope="col">Dæmi</th></tr></thead><tbody>' +
      '<tr><td>mA → A</td><td>Deila með 1000</td><td>250 mA = 0,25 A</td></tr>' +
      '<tr><td>A → mA</td><td>Margfalda með 1000</td><td>0,04 A = 40 mA</td></tr>' +
      '<tr><td>kΩ → Ω</td><td>Margfalda með 1000</td><td>4,7 kΩ = 4700 Ω</td></tr>' +
      '<tr><td>Ω → kΩ</td><td>Deila með 1000</td><td>680 Ω = 0,68 kΩ</td></tr>' +
      '</tbody></table></div>' +
      example('Reiknað dæmi: 5 V yfir 2,5 kΩ', UI.steps([
        { title: 'Breyta í Ω', html: ['2,5 kΩ = 2,5 · 1000 Ω = 2500 Ω'] },
        { title: 'Lögmál Ohms', html: [S('I') + ' = ' + F('5 V', '2500 Ω') + ' = 0,002 A'] },
        { title: 'Breyta í mA ef það hentar', html: ['0,002 A = 0,002 · 1000 mA = 2 mA'] },
      ])) +
      '<p class="small muted" style="margin-top:12px">Í innsláttarreitum á þessum vef er bæði komma og punktur tugabrotsmerki. Skrifaðu því eitt þúsund sem 1000, ekki 1.000.</p>');

    h += section('mistok', 'Algeng mistök', '',
      '<ul class="pitfalls">' +
      '<li><strong>Gleyma að breyta einingum.</strong> 20 mA er 0,02 A, ekki 20 A. 1 kΩ er 1000 Ω.</li>' +
      '<li><strong>Í raðtengingu er straumurinn sá sami</strong> í öllum viðnámum — hann skiptist ekki.</li>' +
      '<li><strong>Í hliðtengingu er spennan sú sama</strong> yfir hverri grein — hún skiptist ekki.</li>' +
      '<li><strong>Heildarviðnám jákvæðra viðnáma í hliðtengingu er minna en minnsta einstaka viðnámið.</strong> Ef ' + S('R', 'H') + ' verður stærra, er eitthvað rangt.</li>' +
      '<li><strong>Heildarviðnám tveggja eða fleiri jákvæðra viðnáma í raðtengingu er stærra en hvert einstakt viðnám.</strong></li>' +
      '<li><strong>Ekki má nota tveggja viðnáma formúluna beint á þrjú viðnám.</strong> ' + F(S('R', 1) + ' · ' + S('R', 2) + ' · ' + S('R', 3), S('R', 1) + ' + ' + S('R', 2) + ' + ' + S('R', 3)) + ' er rangt.</li>' +
      '<li><strong>Gleyma að snúa við.</strong> Andhverfuformúlan gefur ' + F('1', S('R', 'H')) + '. Í lokin þarf ' + S('R', 'H') + ' = 1 / (summan).</li>' +
      '<li><strong>Námunda of snemma.</strong> Haltu fullri nákvæmni í reiknivélinni og námundaðu aðeins lokasvarið.</li>' +
      '<li><strong>Rugla saman margföldun og deilingu</strong> í lögmáli Ohms. Athugaðu: meira viðnám á að gefa minni straum.</li>' +
      '<li>' + P + '<strong>Blönduð tenging: að byrja utan frá.</strong> Reiknaðu alltaf innstu hópana fyrst og notaðu svo rétta reglu fyrir hvern hluta.</li>' +
      '<li>' + P + '<strong>Rugla saman nýju heildarviðnámi og nýrri mótstöðu.</strong> Ef ' + S('R', 'H') + ' á að verða 10 Ω er nýja mótstaðan ekki 10 Ω; reiknaðu hana með andhverfunum.</li>' +
      '<li>' + P + '<strong>Fellimótstaða: nota alla spennuna.</strong> Fellimótstaðan fær aðeins afganginn, ' + S('U') + ' − ' + S('U', 'tæki') + '.</li>' +
      '</ul>');

    h += section('ord', P + 'Orð úr námsefninu', 'prof',
      '<div class="table-wrap"><table><thead><tr><th scope="col">Orð</th><th scope="col">Merking</th></tr></thead><tbody>' +
      '<tr><td><strong>Mótstaða</strong></td><td>Íhlutur með ákveðið viðnám (' + S('R') + ', mælt í Ω). „Mótstöðurnar eru raðtengdar.“</td></tr>' +
      '<tr><td><strong>Álag</strong></td><td>Tæki sem tekur straum, t.d. pera eða ljóskastari.</td></tr>' +
      '<tr><td><strong>Spennugjafaspenna</strong></td><td>Spenna spennugjafans, ' + S('U', 'H') + ' eða ' + S('U') + '.</td></tr>' +
      '<tr><td><strong>Spennufall</strong></td><td>Spenna yfir einstaka mótstöðu, t.d. ' + S('U', 'R1') + ' eða ' + S('U', 1) + '.</td></tr>' +
      '<tr><td><strong>Greinistraumur</strong></td><td>Straumur í einni grein hliðtengingar, t.d. ' + S('I', 'R1') + ' eða ' + S('I', 1) + '.</td></tr>' +
      '<tr><td><strong>Greinipunktur</strong></td><td>Punktur þar sem straumurinn skiptist eða sameinast (1. lögmál Kirchhoffs).</td></tr>' +
      '<tr><td><strong>Lokuð straumrás</strong></td><td>Straumurinn kemst alla leið frá spennugjafanum, í gegnum íhlutina og til baka.</td></tr>' +
      '<tr><td><strong>Fellimótstaða</strong></td><td>Raðtengd mótstaða sem fellir spennuna svo tæki fái rétta spennu.</td></tr>' +
      '<tr><td><strong>Rásin rofnar</strong></td><td>Grein slitnar og enginn straumur fer um hana.</td></tr>' +
      '<tr><td><strong>1K Ω, 5.1kΩ</strong></td><td>Í námsefninu er stundum skrifað 1K Ω eða 5.1kΩ; það þýðir 1 kΩ = 1000 Ω og 5,1 kΩ = 5100 Ω.</td></tr>' +
      '<tr><td><strong>U<sub>R1</sub>, I<sub>R1</sub></strong></td><td>Námsefnið notar oft ' + S('U', 'R1') + ' og ' + S('I', 'R1') + '. Á þessum vef stendur oftast ' + S('U', 1) + ' og ' + S('I', 1) + ' — það er það sama.</td></tr>' +
      '</tbody></table></div>');

    return h + '</div></div>';
  }

  Views.glosur = {
    render: render,
    mount: function (el) {
      el.addEventListener('click', function (e) {
        if (e.target.closest('[data-print]')) UI.printOrSave('glosur');
      });
    },
    navigate: function (sub) {
      const t = sub && document.getElementById(sub);
      if (!t) return false;
      t.scrollIntoView();
      const h = t.querySelector('h2');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      return true;
    },
  };
})(typeof self !== 'undefined' ? self : this);
