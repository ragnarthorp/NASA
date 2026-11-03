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
      '<div class="actions"><button type="button" class="btn-primary" data-print>Prenta / vista sem PDF</button><a class="btn" href="#glosur">Til baka í glósur</a></div></div>' +
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
      '<tr><th scope="row">Heildarviðnám</th><td>' + S('R', 'H') + ' = ' + R(1) + ' + ' + R(2) + ' + … + ' + R('n') + '</td><td>' + F('1', S('R', 'H')) + ' = ' + F('1', R(1)) + ' + ' + F('1', R(2)) + ' + … + ' + F('1', R('n')) + '</td></tr>' +
      '<tr><th scope="row">Straumur</th><td>sá sami: ' + S('I', 'H') + ' = ' + S('I', 1) + ' = ' + S('I', 2) + ' = … = ' + S('I', 'n') + '</td><td>leggst saman: ' + S('I', 'H') + ' = ' + S('I', 1) + ' + ' + S('I', 2) + ' + … + ' + S('I', 'n') + '</td></tr>' +
      '<tr><th scope="row">Spenna</th><td>leggst saman: ' + S('U', 'H') + ' = ' + S('U', 1) + ' + ' + S('U', 2) + ' + … + ' + S('U', 'n') + '</td><td>sú sama: ' + S('U', 'H') + ' = ' + S('U', 1) + ' = ' + S('U', 2) + ' = … = ' + S('U', 'n') + '</td></tr>' +
      '<tr><th scope="row">Stærð ' + S('R', 'H') + '</th><td>stærra en hvert einstakt viðnám</td><td>minna en minnsta viðnámið</td></tr>' +
      '<tr><th scope="row">Einstök viðnám</th><td>' + S('U', 1) + ' = ' + S('I', 'H') + ' · ' + R(1) + '</td><td>' + S('I', 1) + ' = ' + S('U', 'H') + ' / ' + R(1) + '</td></tr>' +
      '</tbody></table>' +
      '<div class="formula-box"><h4>Formúlan góða — fyrir tvö viðnám (aðeins tvö!)</h4><div class="formula" style="margin:1mm 0 0"><span>' + S('R', 'H') + ' = ' + F(R(1) + ' · ' + R(2), R(1) + ' + ' + R(2)) + '</span></div></div></section>' +

      '<div class="pair">' +
      '<figure class="diagram">' + Diagrams.series({ U: '', R: ['', '', ''], I: '', aria: 'Raðtenging: þrjú viðnám á sömu leið.' }) + '<figcaption>Raðtenging — ein leið</figcaption></figure>' +
      '<figure class="diagram">' + Diagrams.parallel({ U: '', R: ['', '', ''], I: '', aria: 'Hliðtenging: þrjú viðnám, hvert í sinni grein.' }) + '<figcaption>Hliðtenging — margar greinar</figcaption></figure>' +
      '</div>' +

      '<div class="cols" style="margin-top:2mm">' +
      '<section><h2>Vinnuröð</h2><p style="margin:0 0 1mm"><strong>Raðtenging:</strong></p><ol>' +
      '<li>' + S('R', 'H') + ' = summa viðnáma</li><li>' + S('I', 'H') + ' = ' + S('U', 'H') + ' / ' + S('R', 'H') + '</li><li>' + S('U', 1) + ' = ' + S('I', 'H') + ' · ' + R(1) + ' o.s.frv.</li><li>Athuga: ' + S('U', 1) + ' + ' + S('U', 2) + ' + … = ' + S('U', 'H') + '</li></ol>' +
      '<p style="margin:1.5mm 0 1mm"><strong>Hliðtenging:</strong></p><ol>' +
      '<li>' + S('R', 'H') + ' með 1/R-formúlu (snúa við!)</li><li>' + S('U', 'H') + ' yfir hverja grein</li><li>' + S('I', 1) + ' = ' + S('U', 'H') + ' / ' + R(1) + ' o.s.frv.</li><li>' + S('I', 'H') + ' = ' + S('I', 1) + ' + ' + S('I', 2) + ' + …</li><li>Athuga: ' + S('I', 'H') + ' = ' + S('U', 'H') + ' / ' + S('R', 'H') + '</li></ol></section>' +
      '<section><h2>Gátlisti fyrir lausn dæma</h2><ol>' +
      '<li>Teikna eða skoða rásina: rað- eða hliðtenging?</li><li>Skrifa niður gefnar stærðir og hvað á að finna.</li><li>Breyta í V, A og Ω.</li><li>Velja formúlu og setja tölur inn með einingum.</li><li>Halda fullri nákvæmni, námunda aðeins lokasvar.</li><li>Athuga hvort svarið sé skynsamlegt og skrifa einingu.</li></ol>' +
      '<h2 style="margin-top:2.5mm">Helstu villur</h2><ul>' +
      '<li>Gleyma að breyta mA → A eða kΩ → Ω.</li><li>Gleyma að snúa við: 1/' + S('R', 'H') + ' er ekki ' + S('R', 'H') + '.</li><li>Formúlan góða notuð á þrjú viðnám.</li><li>Halda að straumur skiptist í raðtengingu eða spenna í hliðtengingu.</li><li>Hliðtenging: ' + S('R', 'H') + ' stærra en minnsta viðnám = villa.</li></ul></section>' +
      '</div>' +
      '<p class="foot">Formúlublað til undirbúnings fyrir próf í rað- og hliðtengingu viðnáma.</p>' +
      '</article>';
  }

  Views.formulublad = {
    render: render,
    mount: function (el, sub) {
      el.addEventListener('click', function (e) { if (e.target.closest('[data-print]')) root.print(); });
      if (sub === 'prenta') {
        history.replaceState(null, '', '#formulublad');
        printTimer = setTimeout(function () { root.print(); }, 350);
      }
    },
    unmount: function () { clearTimeout(printTimer); },
  };
})(typeof self !== 'undefined' ? self : this);
