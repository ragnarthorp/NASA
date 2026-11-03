/* Glósur — útskýring, formúla, tengimynd og reiknað dæmi fyrir hvert atriði. */
(function (root) {
  'use strict';
  const Views = root.Views = root.Views || {};
  const UI = root.UI, S = UI.S, F = UI.F, Explain = root.Explain;

  const SECTIONS = [
    ['takn', 'Tákn og einingar'], ['ohm', 'Lögmál Ohms'], ['radtenging', 'Raðtenging'],
    ['hlidtenging', 'Hliðtenging'], ['einingar', 'Einingabreytingar'], ['mistok', 'Algeng mistök'],
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

    let h = '<div class="section-head"><div><p class="eyebrow">Glósur</p><h1>Glósur: rað- og hliðtenging</h1>' +
      '<p class="lead">Stuttar glósur með formúlum, tengimyndum og reiknuðum dæmum. Þær eru prentvænar og nýtast vel í prófinu.</p></div>' +
      '<div class="actions no-print"><button type="button" class="btn-primary" data-print>Prenta glósur</button><a class="btn" href="#formulublad">Formúlublað (1 síða)</a></div></div>';
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
      '</ul>');

    return h + '</div></div>';
  }

  Views.glosur = {
    render: render,
    mount: function (el) {
      el.addEventListener('click', function (e) {
        if (e.target.closest('[data-print]')) root.print();
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
