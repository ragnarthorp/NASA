// Sjóorrusta á Svölum: leikmaðurinn felur skipin sín og skiptist á skotum við tölvuna.
// Skip mega ekki snertast, hvorki á hlið né horn. Tölvan sér ekki skip leikmannsins:
// hún metur hvar skip geta enn leynst og velur af handahófi í hlutfalli við líkurnar,
// og eltir skip sem hún hefur hitt. Hún er því hvorki alvitur né heimsk.
(function () {
  'use strict';
  window.THRAUTIR = window.THRAUTIR || {};

  var DALKAR = 'ABCDEFGHIJ';

  window.THRAUTIR.sjoorrusta = function (r, kassi, api) {
    var el = api.el;
    var th = r.thraut;
    var N = th.staerd || 5;
    var LENGDIR = (th.skip || [2, 1]).slice().sort(function (a, b) { return b - a; });

    function heiti(i) { return DALKAR[i % N] + (Math.floor(i / N) + 1); }
    function xy(i) { return [i % N, Math.floor(i / N)]; }

    // Allar mögulegar staðsetningar skips af lengd L
    function stadsetningar(L) {
      var ut = [];
      for (var y = 0; y < N; y++) for (var x = 0; x < N; x++) {
        if (x + L <= N) ut.push(svid(x, y, L, false));
        if (L > 1 && y + L <= N) ut.push(svid(x, y, L, true));
      }
      return ut;
    }
    function svid(x, y, L, lodrett) {
      var a = [];
      for (var k = 0; k < L; k++) a.push(lodrett ? (y + k) * N + x : y * N + x + k);
      return a;
    }
    // Snerting: reitir sem liggja saman á hlið eða horni (eða sami reitur)
    function snertir(a, b) {
      return a.some(function (i) {
        var p = xy(i);
        return b.some(function (j) { var q = xy(j); return Math.abs(p[0] - q[0]) <= 1 && Math.abs(p[1] - q[1]) <= 1; });
      });
    }
    function nagrannar(reitir) {
      var ut = [];
      reitir.forEach(function (i) {
        var p = xy(i);
        for (var dy = -1; dy <= 1; dy++) for (var dx = -1; dx <= 1; dx++) {
          var x = p[0] + dx, y = p[1] + dy;
          if (x >= 0 && y >= 0 && x < N && y < N && reitir.indexOf(y * N + x) < 0 && ut.indexOf(y * N + x) < 0) ut.push(y * N + x);
        }
      });
      return ut;
    }
    function slembiFloti() {
      for (var t = 0; t < 500; t++) {
        var floti = [], ok = true;
        for (var s = 0; s < LENGDIR.length && ok; s++) {
          var val = stadsetningar(LENGDIR[s]).filter(function (p) {
            return floti.every(function (f) { return !snertir(f.reitir, p); });
          });
          if (!val.length) ok = false;
          else floti.push({ lengd: LENGDIR[s], reitir: val[Math.floor(Math.random() * val.length)], hittir: [] });
        }
        if (ok) return floti;
      }
      return null;
    }

    // Viðmót
    var skilabod = el('p', { 'class': 'sjo-skilabod', 'aria-live': 'polite' });
    var bordin = el('div', { 'class': 'sjo-bordin' });
    var verkfaeri = el('div', { 'class': 'sjo-verkfaeri' });
    var hula = el('div', { 'class': 'sjo-hula', hidden: '' });
    kassi.appendChild(el('div', { 'class': 'sjoorrusta' }, [skilabod, verkfaeri, bordin, hula]));

    var stig, minnFloti, tolvuFloti, valid, lodrett, forskodun;
    var skotMin, skotTolvu, omogMin, omogTolvu, minnUmferd, sidastaTolvuskot;

    function nyrLeikur(halda) {
      stig = 'rada';
      if (!halda) minnFloti = LENGDIR.map(function (L) { return { lengd: L, reitir: null, hittir: [] }; });
      else minnFloti.forEach(function (f) { f.hittir = []; });
      valid = minnFloti.findIndex(function (f) { return !f.reitir; });
      lodrett = false;
      forskodun = null;
      hula.hidden = true;
      teikna();
    }

    // Staðsetning skips leikmannsins þar sem smellt er (efst/vinstra horn skipsins)
    function stadaSkips(i) {
      if (valid < 0) return null;
      var p = xy(i), L = minnFloti[valid].lengd;
      var x = p[0], y = p[1];
      if (lodrett) y = Math.min(y, N - L); else x = Math.min(x, N - L);
      var reitir = svid(x, y, L, lodrett && L > 1);
      var ok = minnFloti.every(function (f, k) { return k === valid || !f.reitir || !snertir(f.reitir, reitir); });
      return { reitir: reitir, ok: ok };
    }

    function smelltRada(i) {
      var fyrir = minnFloti.findIndex(function (f) { return f.reitir && f.reitir.indexOf(i) >= 0; });
      if (fyrir >= 0) {  // taka skip upp aftur
        minnFloti[fyrir].reitir = null;
        valid = fyrir;
        return teikna();
      }
      var s = stadaSkips(i);
      if (!s) return;
      if (!s.ok) { skilabod.className = 'sjo-skilabod villa'; skilabod.textContent = 'Skipin mega ekki snertast, ekki heldur á horn.'; return; }
      minnFloti[valid].reitir = s.reitir;
      valid = minnFloti.findIndex(function (f) { return !f.reitir; });
      forskodun = null;
      teikna();
    }

    function byrjaOrrustu() {
      tolvuFloti = slembiFloti();
      skotMin = {}; skotTolvu = {};
      omogMin = {}; omogTolvu = {};
      sidastaTolvuskot = null;
      minnUmferd = true;
      stig = 'orrusta';
      skilabod.className = 'sjo-skilabod';
      skilabod.textContent = 'Þú byrjar. Skjóttu á haf tölvunnar!';
      teikna();
    }

    function sokkid(f) { return f.hittir.length === f.lengd; }

    function skjota(floti, skot, omog, i) {
      var f = floti.filter(function (x) { return x.reitir.indexOf(i) >= 0; })[0];
      if (!f) { skot[i] = 'mis'; return 'mis'; }
      skot[i] = 'hitt';
      f.hittir.push(i);
      if (!sokkid(f)) return 'hitt';
      nagrannar(f.reitir).forEach(function (j) { if (!skot[j]) omog[j] = true; });
      return 'sokkid';
    }

    var ORD = { mis: 'Skvamp! Ekkert þar.', hitt: 'Hæft!', sokkid: 'Hæft og sökkt!' };

    function smelltSkjota(i) {
      if (!minnUmferd || stig !== 'orrusta' || skotMin[i] || omogMin[i]) return;
      var nidur = skjota(tolvuFloti, skotMin, omogMin, i);
      skilabod.className = 'sjo-skilabod ' + (nidur === 'mis' ? '' : 'gott');
      skilabod.textContent = 'Þú skaust á ' + heiti(i) + '. ' + ORD[nidur];
      if (tolvuFloti.every(sokkid)) return lok(true);
      minnUmferd = false;
      teikna();
      setTimeout(tolvanSkytur, 900);
    }

    // Tölvan: vegur hvern óskotinn reit eftir því hve margar staðsetningar óhæfðra skipa ná yfir hann
    function tolvanVelur() {
      var opnirHittir = Object.keys(skotTolvu).map(Number).filter(function (i) {
        return skotTolvu[i] === 'hitt' && !minnFloti.some(function (f) { return sokkid(f) && f.reitir.indexOf(i) >= 0; });
      });
      var sokkin = minnFloti.filter(sokkid);
      var vigt = {};
      minnFloti.filter(function (f) { return !sokkid(f); }).forEach(function (f) {
        stadsetningar(f.lengd).forEach(function (p) {
          var lagleg = p.every(function (i) { return !skotTolvu[i] || opnirHittir.indexOf(i) >= 0; }) &&
            sokkin.every(function (s) { return !snertir(s.reitir, p); });
          if (!lagleg) return;
          if (opnirHittir.length && !opnirHittir.every(function (i) { return p.indexOf(i) >= 0; })) return;
          p.forEach(function (i) { if (!skotTolvu[i]) vigt[i] = (vigt[i] || 0) + 1; });
        });
      });
      var reitir = Object.keys(vigt).map(Number);
      if (!reitir.length) {
        for (var i = 0; i < N * N; i++) if (!skotTolvu[i] && !omogTolvu[i]) reitir.push(i), vigt[i] = 1;
      }
      var summa = reitir.reduce(function (s, i) { return s + vigt[i]; }, 0);
      var hlutur = Math.random() * summa;
      for (var k = 0; k < reitir.length; k++) {
        hlutur -= vigt[reitir[k]];
        if (hlutur <= 0) return reitir[k];
      }
      return reitir[reitir.length - 1];
    }

    function tolvanSkytur() {
      if (stig !== 'orrusta' || !kassi.isConnected) return;
      var i = tolvanVelur();
      sidastaTolvuskot = i;
      var nidur = skjota(minnFloti, skotTolvu, omogTolvu, i);
      skilabod.className = 'sjo-skilabod ' + (nidur === 'mis' ? '' : 'slaemt');
      skilabod.textContent = 'Tölvan skaut á ' + heiti(i) + '. ' + ORD[nidur] + (nidur === 'mis' ? ' Þín umferð.' : '');
      if (minnFloti.every(sokkid)) return lok(false);
      minnUmferd = true;
      teikna();
    }

    function lok(sigur) {
      stig = 'lokid';
      teikna();
      if (sigur) {
        skilabod.className = 'sjo-skilabod gott';
        skilabod.textContent = 'Þú sökktir öllum skipum tölvunnar!';
        if (!api.leyst) { setTimeout(api.leysa, 1200); return; }
      }
      hula.textContent = '';
      hula.appendChild(el('div', {}, [
        el('h3', { text: sigur ? 'Sigur!' : 'Tölvan vann' }),
        el('p', { text: sigur ? 'Viltu spila aftur?' : 'Tölvan sökkti skipunum þínum á undan. Reyndu aftur!' }),
        el('button', { type: 'button', 'class': 'adal', text: 'Ný orrusta', onclick: function () { nyrLeikur(true); } })
      ]));
      hula.hidden = false;
      hula.querySelector('button').focus();
    }

    // Teikning
    function bord(titill, smell, flokkar) {
      var grid = el('div', { 'class': 'sjo-bord', role: 'grid', 'aria-label': titill });
      grid.appendChild(el('span', { 'class': 'sjo-merki' }));
      for (var x = 0; x < N; x++) grid.appendChild(el('span', { 'class': 'sjo-merki', text: DALKAR[x] }));
      for (var y = 0; y < N; y++) {
        grid.appendChild(el('span', { 'class': 'sjo-merki', text: String(y + 1) }));
        for (x = 0; x < N; x++) {
          var i = y * N + x;
          var f = flokkar(i);
          grid.appendChild(el('button', {
            type: 'button', 'class': 'sjo-reitur ' + f.flokkur, 'aria-label': heiti(i) + (f.lysing ? ', ' + f.lysing : ''),
            disabled: f.virkt ? null : '', 'data-i': String(i),
            onclick: (function (i) { return function () { smell(i); }; })(i)
          }));
        }
      }
      return el('div', { 'class': 'sjo-bord-kassi' }, [el('h4', { text: titill }), grid]);
    }

    function minnFlokkur(i) {
      var f = minnFloti.filter(function (x) { return x.reitir && x.reitir.indexOf(i) >= 0; })[0];
      var c = [];
      var lysing = '';
      if (f) { c.push('skip'); lysing = 'þitt skip'; if (stig !== 'rada' && sokkid(f)) c.push('sokkid'); }
      if (stig === 'rada' && forskodun && forskodun.reitir.indexOf(i) >= 0) c.push(forskodun.ok ? 'forskodun' : 'forskodun-ekki');
      if (stig !== 'rada') {
        if (skotTolvu[i]) { c.push(skotTolvu[i]); lysing += (lysing ? ', ' : '') + (skotTolvu[i] === 'hitt' ? 'hæft' : 'skot sem geigaði'); }
        if (i === sidastaTolvuskot) c.push('sidast');
      }
      return { flokkur: c.join(' '), virkt: stig === 'rada', lysing: lysing };
    }

    function tolvuFlokkur(i) {
      var c = [], lysing = '';
      var f = tolvuFloti.filter(function (x) { return x.reitir.indexOf(i) >= 0; })[0];
      if (skotMin[i]) { c.push(skotMin[i]); lysing = skotMin[i] === 'hitt' ? 'hæft' : 'skot sem geigaði'; }
      if (f && sokkid(f)) c.push('skip', 'sokkid');
      else if (f && stig === 'lokid') c.push('skip', 'synt');
      if (omogMin[i] && !skotMin[i]) { c.push('omog'); lysing = 'getur ekki verið skip'; }
      return { flokkur: c.join(' '), virkt: stig === 'orrusta' && minnUmferd && !skotMin[i] && !omogMin[i], lysing: lysing };
    }

    function teikna() {
      bordin.textContent = '';
      verkfaeri.textContent = '';
      if (stig === 'rada') {
        var buid = minnFloti.every(function (f) { return f.reitir; });
        skilabod.className = 'sjo-skilabod';
        skilabod.textContent = buid ? 'Skipin eru falin. Byrjaðu orrustuna!' :
          'Smelltu á hafið til að fela ' + (minnFloti[valid].lengd > 1 ? 'tveggja reita skipið' : 'eins reits skipið') + '. Skipin mega ekki snertast.';
        verkfaeri.appendChild(el('button', { type: 'button', text: lodrett ? '↕ Lóðrétt' : '↔ Lárétt', disabled: valid >= 0 && minnFloti[valid].lengd > 1 ? null : '', onclick: function () { lodrett = !lodrett; teikna(); } }));
        verkfaeri.appendChild(el('button', { type: 'button', text: '🎲 Raða af handahófi', onclick: function () { minnFloti = slembiFloti(); valid = -1; teikna(); } }));
        verkfaeri.appendChild(el('button', { type: 'button', 'class': 'adal', text: 'Byrja orrustu', disabled: buid ? null : '', 'data-fokus': '', onclick: byrjaOrrustu }));
        var b = bord('Hafið þitt', smelltRada, minnFlokkur);
        b.addEventListener('pointerover', function (e) {
          var t = e.target.closest('.sjo-reitur');
          var nytt = t ? stadaSkips(+t.getAttribute('data-i')) : null;
          if (JSON.stringify(nytt) !== JSON.stringify(forskodun)) { forskodun = nytt; teiknaForskodun(b); }
        });
        b.addEventListener('pointerleave', function () { forskodun = null; teiknaForskodun(b); });
        bordin.appendChild(b);
        bordin.classList.add('rada');
        return;
      }
      bordin.classList.remove('rada');
      bordin.appendChild(bord('Haf tölvunnar', smelltSkjota, tolvuFlokkur));
      bordin.appendChild(bord('Hafið þitt', function () {}, minnFlokkur));
      bordin.firstChild.classList.toggle('virkt', stig === 'orrusta' && minnUmferd);
    }

    function teiknaForskodun(b) {
      b.querySelectorAll('.sjo-reitur').forEach(function (r) {
        var i = +r.getAttribute('data-i');
        r.classList.remove('forskodun', 'forskodun-ekki');
        if (forskodun && forskodun.reitir.indexOf(i) >= 0) r.classList.add(forskodun.ok ? 'forskodun' : 'forskodun-ekki');
      });
    }

    nyrLeikur(false);
    if (api.leyst) {
      skilabod.textContent = '✓ Þú hefur þegar unnið orrustuna. Feldu skipin til að spila aftur.';
    }
  };
})();
