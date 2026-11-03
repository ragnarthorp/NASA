/* Formúlublað — ein A4-síða, læsileg í svart-hvítu. */
(function (root) {
  'use strict';
  const Views = root.Views = root.Views || {};
  const UI = root.UI, S = UI.S, F = UI.F, Diagrams = root.Diagrams;
  let printTimer = null;

  function render() {
    const R = function (i) { return S('R', i); };
    return '<div class="sheet-intro no-print section-head"><div><p class="eyebrow">Formúlublað</p><h1>Formúlublað</h1>' +
      '<p class="lead">Ein A4-síða með öllum lykilformúlum. Prentaðu blaðið eða vistaðu það sem PDF og taktu með í prófið.</p></div>' +
      '<div class="actions">' + UI.pdfLink('formulublad', 'Sækja formúlublaðið sem PDF', 'btn-primary') + '<button type="button" data-print>Prenta</button><a class="btn" href="#glosur">Til baka í glósur</a></div></div>' +
      '<article class="sheet" aria-label="Formúlublað til prentunar">' +
      '<h1>Formúlublað — rað- og hliðtenging viðnáma</h1>' +
      '<p class="sub"><strong>' + S('U') + '</strong> = spenna, volt (V) · <strong>' + S('I') + '</strong> = straumur, amper (A) · <strong>' + S('R') + '</strong> = viðnám, ohm (Ω) · <strong>H</strong> í undirskrift = heild, t.d. ' + S('R', 'H') + ', ' + S('I', 'H') + ', ' + S('U', 'H') + '</p>' +

      '<div class="cols">' +
      '<section><h2>Lögmál Ohms</h2>' +
      '<div class="formula"><span>' + S('U') + ' = ' + S('I') + ' · ' + S('R') + '</span><span>' + S('I') + ' = ' + F(S('U'), S('R')) + '</span><span>' + S('R') + ' = ' + F(S('U'), S('I')) + '</span></div>' +
      '<ul><li>Gefið ' + S('I') + ' og ' + S('R') + ' → ' + S('U') + ' = ' + S('I') + ' · ' + S('R') + '</li><li>Gefið ' + S('U') + ' og ' + S('R') + ' → ' + S('I') + ' = ' + S('U') + ' / ' + S('R') + '</li><li>Gefið ' + S('U') + ' og ' + S('I') + ' → ' + S('R') + ' = ' + S('U') + ' / ' + S('I') + '</li></ul></section>' +
      '<section><h2>Einingabreytingar</h2>' +
      '<div class="formula"><span>1 A = 1.000 mA</span><span>1 kΩ = 1.000 Ω</span></div>' +
      '<ul><li>mA → A: deila með 1000 (250 mA = 0,25 A)</li><li>A → mA: margfalda með 1000 (0,04 A = 40 mA)</li><li>kΩ → Ω: margfalda með 1000 (4,7 kΩ = 4700 Ω)</li>' +
      '<li>Breyta í V, A og Ω <strong>áður</strong> en reiknað er.</li></ul></section>' +
      '</div>' +

      '<section style="margin-top:3mm"><h2>Samanburður</h2><table><thead><tr><th scope="col"></th><th scope="col">Raðtenging</th><th scope="col">Hliðtenging</th></tr></thead><tbody>' +
      '<tr><th scope="row">Tengimynd</th><td><figure class="diagram">' + Diagrams.series({ U: '', R: ['', '', ''], I: '', aria: 'Raðtenging: þrjú viðnám á sömu leið.' }) + '</figure></td>' +
      '<td><figure class="diagram">' + Diagrams.parallel({ U: '', R: ['', '', ''], I: '', aria: 'Hliðtenging: þrjú viðnám, hvert í sinni grein.' }) + '</figure></td></tr>' +
      '<tr><th scope="row">Heildarviðnám</th><td>' + S('R', 'H') + ' = ' + R(1) + ' + ' + R(2) + ' + … + ' + R('n') + '</td><td>' + F('1', S('R', 'H')) + ' = ' + F('1', R(1)) + ' + ' + F('1', R(2)) + ' + … + ' + F('1', R('n')) + '</td></tr>' +
      '<tr><th scope="row">Straumur</th><td>sá sami: ' + S('I', 'H') + ' = ' + S('I', 1) + ' = ' + S('I', 2) + ' = … = ' + S('I', 'n') + '</td><td>leggst saman: ' + S('I', 'H') + ' = ' + S('I', 1) + ' + ' + S('I', 2) + ' + … + ' + S('I', 'n') + '</td></tr>' +
      '<tr><th scope="row">Spenna</th><td>leggst saman: ' + S('U', 'H') + ' = ' + S('U', 1) + ' + ' + S('U', 2) + ' + … + ' + S('U', 'n') + '</td><td>sú sama: ' + S('U', 'H') + ' = ' + S('U', 1) + ' = ' + S('U', 2) + ' = … = ' + S('U', 'n') + '</td></tr>' +
      '<tr><th scope="row">Stærð ' + S('R', 'H') + '</th><td>stærra en hvert einstakt viðnám</td><td>minna en minnsta viðnámið</td></tr>' +
      '<tr><th scope="row">Einstök viðnám</th><td>' + S('U', 1) + ' = ' + S('I', 'H') + ' · ' + R(1) + '</td><td>' + S('I', 1) + ' = ' + S('U', 'H') + ' / ' + R(1) + '</td></tr>' +
      '<tr><th scope="row">Vinnuröð</th><td>' + S('R', 'H') + ' → ' + S('I', 'H') + ' = ' + S('U', 'H') + '/' + S('R', 'H') + ' → ' + S('U', 1) + ' = ' + S('I', 'H') + '·' + R(1) + ' … → athuga ' + S('U', 1) + ' + ' + S('U', 2) + ' + … = ' + S('U', 'H') + '</td>' +
      '<td>' + S('R', 'H') + ' (1/R, snúa við!) → ' + S('I', 1) + ' = ' + S('U', 'H') + '/' + R(1) + ' … → ' + S('I', 'H') + ' = ' + S('I', 1) + ' + ' + S('I', 2) + ' + … → athuga ' + S('U', 'H') + '/' + S('R', 'H') + '</td></tr>' +
      '</tbody></table>' +
      '<div class="pair" style="margin-top:1.5mm"><div class="formula-box" style="margin:0"><h4>Formúlan góða — fyrir tvö viðnám (aðeins tvö!)</h4><div class="formula" style="margin:1mm 0 0"><span>' + S('R', 'H') + ' = ' + F(R(1) + ' · ' + R(2), R(1) + ' + ' + R(2)) + '</span></div></div>' +
      '<div class="formula-box prof-box" style="margin:0"><h4><span class="tag tag-prof">[Prófefni]</span> Lögmál Kirchhoffs</h4><p style="margin:0"><strong>1. (straumur, hliðt.):</strong> summa strauma að greinipunkti = summa strauma frá honum.<br><strong>2. (spenna, raðt.):</strong> summa spennufalla í lokaðri rás = spennugjafaspennan.</p></div></div></section>' +
      '<section class="prof-box" style="margin-top:2mm;padding:1.5mm 3mm"><h2 style="margin-bottom:1mm"><span class="tag tag-prof">[Prófefni]</span> Gerðir dæma í æfingunum</h2><div class="cols" style="gap:1mm 6mm"><ul>' +
      '<li><strong>Raðt., jafnstórar:</strong> ' + S('R', 'H') + ' = ' + S('n') + ' · ' + S('R') + ', ' + S('U', 'R') + ' = ' + S('U', 'H') + ' / ' + S('n') + '</li>' +
      '<li><strong>Óþekkt mótstaða:</strong> ' + S('R', 'x') + ' = ' + S('R', 'H') + ' − (summa hinna)</li>' +
      '<li><strong>Fellimótstaða:</strong> ' + S('R') + ' = (' + S('U') + ' − ' + S('U', 'tæki') + ') / ' + S('I') + '</li>' +
      '<li><strong>Tæki í röð:</strong> ' + S('n') + ' = ' + S('U') + ' / ' + S('U', 'tæki') + ' (sami straumur)</li>' +
      '<li><strong>Mælar:</strong> A raðtengdur, V hliðtengdur yfir íhlut</li></ul><ul>' +
      '<li><strong>Hliðt., jafnstórar:</strong> ' + S('R', 'H') + ' = ' + S('R') + ' / ' + S('n') + '; fjöldi álaga ' + S('n') + ' = ' + S('R') + ' / ' + S('R', 'H') + '</li>' +
      '<li><strong>Ná ákveðnu ' + S('R', 'H') + ':</strong> 1/' + S('R', 'x') + ' = 1/' + S('R', 'H') + ' − 1/' + R(1) + ' − 1/' + R(2) + '</li>' +
      '<li><strong>Óþekkt grein:</strong> ' + S('I', 'x') + ' = ' + S('I', 'H') + ' − (hinir), ' + S('R', 'x') + ' = ' + S('U') + ' / ' + S('I', 'x') + '</li>' +
      '<li><strong>Grein rofnar:</strong> hinar óbreyttar, ' + S('I', 'H') + ' minnkar</li>' +
      '<li><strong>Blönduð:</strong> innstu hópar fyrst → ' + S('R', 'H') + ' → ' + S('I', 'H') + ' → til baka: raðt. ' + S('U') + ' = ' + S('I') + '·' + S('R') + ', hliðt. ' + S('I') + ' = ' + S('U') + '/' + S('R') + '</li></ul></div></section>' +


      '<div class="cols" style="margin-top:2mm">' +
      '<section><h2>Gátlisti fyrir lausn dæma</h2><ol>' +
      '<li>Teikna rásina: rað-, hlið- eða blönduð tenging?</li><li>Skrifa gefnar stærðir og hvað á að finna.</li><li>Breyta í V, A og Ω.</li><li>Velja formúlu, setja inn tölur með einingum.</li><li>Námunda aðeins lokasvar; athuga hvort það sé skynsamlegt.</li></ol>' +
      '</section><section><h2>Helstu villur</h2><ul>' +
      '<li>Gleyma að breyta mA → A eða kΩ → Ω.</li><li>Gleyma að snúa við: 1/' + S('R', 'H') + ' er ekki ' + S('R', 'H') + '.</li><li>Formúlan góða notuð á þrjú viðnám.</li><li>Halda að straumur skiptist í raðtengingu eða spenna í hliðtengingu.</li><li>Hliðtenging: ' + S('R', 'H') + ' stærra en minnsta viðnám = villa.</li></ul></section>' +
      '</div>' +
      '</article>';
  }

  Views.formulublad = {
    render: render,
    mount: function (el, sub) {
      el.addEventListener('click', function (e) { if (e.target.closest('[data-print]')) UI.printOrSave('formulublad'); });
      if (sub === 'prenta') {
        history.replaceState(null, '', '#formulublad');
        if (!UI.inArtifact()) printTimer = setTimeout(function () { root.print(); }, 350);
      }
    },
    unmount: function () { clearTimeout(printTimer); },
  };
})(typeof self !== 'undefined' ? self : this);
