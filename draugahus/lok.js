// Lokaherbergið (Smíðaskemman): skilaboð til hópsins, hnappur til að ljúka húsinu,
// skírteini með öllum herbergjunum og tímanum sem húsinu lauk, og fagnaðarlæti.
(function () {
  'use strict';
  window.THRAUTIR = window.THRAUTIR || {};

  var SKRAUT = ['🎃', '👻', '✨', '🦇', '⭐'];

  window.THRAUTIR.lok = function (r, kassi, api) {
    var el = api.el;
    var th = r.thraut;

    var texti = el('div', { 'class': 'lok-texti' }, (th.malsgreinar || []).map(function (m) { return el('p', { text: m }); }));
    var takki = el('button', { type: 'button', 'class': 'adal lok-takki', text: 'Við kláruðum! 🎉', 'data-fokus': '' });
    var skirteiniKassi = el('div', {});
    kassi.appendChild(el('div', { 'class': 'lok' }, [
      texti,
      el('div', { 'class': 'thraut-svaedi lok-hnappar' }, [takki]),
      skirteiniKassi
    ]));

    // Herbergin í þeirri röð sem þau eru leyst: jarðhæð, efri hæð, kjallari
    function herbergin() {
      var listi = [];
      window.HUS.haedir.slice().sort(function (a, b) { return (a.krefst ? 1 : 0) - (b.krefst ? 1 : 0); })
        .forEach(function (h) { h.herbergi.forEach(function (x) { listi.push({ heiti: x.heiti, haed: h.heiti }); }); });
      return listi;
    }

    function timi(ms) {
      var d = new Date(ms);
      var man = ['janúar', 'febrúar', 'mars', 'apríl', 'maí', 'júní', 'júlí', 'ágúst', 'september', 'október', 'nóvember', 'desember'];
      return d.getDate() + '. ' + man[d.getMonth()] + ' ' + d.getFullYear() + ', kl. ' +
        String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
    }

    function skirteini(ms) {
      skirteiniKassi.textContent = '';
      skirteiniKassi.appendChild(el('div', { 'class': 'skirteini' }, [
        el('span', { 'class': 'skirteini-yfir', text: 'Skírteini' }),
        el('h3', { text: 'Við sluppum úr Draugahúsinu' }),
        el('p', { 'class': 'skirteini-timi', text: timi(ms) }),
        el('ul', {}, herbergin().map(function (x) {
          return el('li', {}, [el('span', { text: '✓' }), document.createTextNode(' ' + x.heiti)]);
        })),
        el('p', { 'class': 'skirteini-fot', text: 'Öll ' + herbergin().length + ' herbergin leyst · Sýnið kennaranum' })
      ]));
    }

    function fagna() {
      var lag = el('div', { 'class': 'fagnadur', 'aria-hidden': 'true' });
      for (var i = 0; i < 46; i++) {
        lag.appendChild(el('span', {
          text: SKRAUT[i % SKRAUT.length],
          style: 'left:' + (Math.random() * 100).toFixed(1) + '%;animation-delay:' + (Math.random() * 1.6).toFixed(2) + 's;' +
            'animation-duration:' + (2.6 + Math.random() * 2).toFixed(2) + 's;font-size:' + Math.round(18 + Math.random() * 22) + 'px;' +
            '--sveifla:' + Math.round(Math.random() * 120 - 60) + 'px'
        }));
      }
      api.efni.appendChild(lag);
      setTimeout(function () { lag.remove(); }, 6500);
    }

    if (api.leyst) {
      // Húsið er þegar klárað: sýna skírteinið með upphaflega tímanum og leyfa að fagna aftur
      skirteini(api.framvinda() || Date.now());
      takki.textContent = 'Fagna aftur 🎉';
      takki.addEventListener('click', fagna);
    } else {
      takki.addEventListener('click', function () {
        var nu = Date.now();
        api.vistaFramvindu(nu);
        skirteini(nu);
        fagna();
        api.leysa();
      });
    }
  };
})();
