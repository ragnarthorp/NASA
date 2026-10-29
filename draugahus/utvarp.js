// Útvarpsþrautin: hlustað er á lagbút og heiti lagsins raðað saman úr stafaflísum.
// Stöðvarnar opnast ein af annarri og þegar öll lögin eru fundin er herbergið leyst.
(function () {
  'use strict';
  window.THRAUTIR = window.THRAUTIR || {};

  // Stigagjöf eins og í Scrabble, prentuð í horn flísanna
  var STIG = { A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3, N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10 };

  function stokka(listi) {
    var a = listi.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Aðrar flísaþrautir nota sömu hjálparföll
  window.THRAUTIR.flisar = { STIG: STIG, stokka: stokka };

  window.THRAUTIR.utvarp = function (r, kassi, api) {
    var el = api.el;
    var log = r.thraut.log;
    var fundin = api.leyst ? log.length : Math.min(api.framvinda(), log.length);
    var stod = Math.min(fundin, log.length - 1);
    var hljod = new Audio();
    hljod.preload = 'auto';
    var lag, flisar, reitir, rangar;

    // Mynd af útvarpinu með skífu sem lýsir meðan lagið spilast
    var skifa = el('div', { 'class': 'skifa' });
    var mynd = el('div', { 'class': 'utvarp-mynd' }, [
      el('img', { src: r.thraut.mynd, alt: 'Gamalt útvarp þakið köngulóarvef' }), skifa
    ]);
    api.efni.insertBefore(el('div', { 'class': 'utvarp-haus' }, [mynd]), api.efni.firstChild);

    var stodvar = el('div', { 'class': 'stodvar', role: 'group', 'aria-label': 'Stöðvar' });
    var spila = el('button', { type: 'button', 'class': 'adal', 'data-fokus': '' });
    var aftur = el('button', { type: 'button', text: '↺ Aftur' });
    var lykkja = el('button', { type: 'button', 'class': 'lykkja', 'aria-pressed': 'false', text: '🔁 Endurtaka' });
    var bord = el('div', { 'class': 'bord', 'aria-label': 'Heiti lagsins' });
    var rekki = el('div', { 'class': 'rekki', 'aria-label': 'Stafaflísar' });
    var profa = el('button', { type: 'button', 'class': 'adal', text: 'Prófa' });
    var hreinsa = el('button', { type: 'button', text: 'Taka allar til baka' });
    var svorun = el('p', { 'class': 'svorun', 'aria-live': 'polite' });
    var visbending = el('p', { 'class': 'visbending', hidden: '' });
    var radari = el('div', { 'class': 'radari' }, [bord, rekki, el('div', { 'class': 'takkar' }, [profa, hreinsa])]);

    kassi.appendChild(el('div', { 'class': 'utvarp thraut-svaedi' }, [
      stodvar,
      el('div', { 'class': 'spilari' }, [spila, aftur, lykkja]),
      radari, svorun, visbending
    ]));

    // Hljóð
    function uppfaeraSpila() {
      var spilar = !hljod.paused;
      spila.textContent = spilar ? '❚❚ Stöðva' : '▶ Spila';
      skifa.classList.toggle('lysir', spilar);
    }
    hljod.addEventListener('play', uppfaeraSpila);
    hljod.addEventListener('pause', uppfaeraSpila);
    hljod.addEventListener('ended', uppfaeraSpila);
    function spilaLag() {
      var p = hljod.play();
      if (p && p.catch) p.catch(function () { uppfaeraSpila(); });
    }
    spila.addEventListener('click', function () { if (hljod.paused) spilaLag(); else hljod.pause(); });
    aftur.addEventListener('click', function () { hljod.currentTime = 0; spilaLag(); });
    lykkja.addEventListener('click', function () {
      hljod.loop = !hljod.loop;
      lykkja.setAttribute('aria-pressed', String(hljod.loop));
    });
    api.dialog.addEventListener('close', function () { hljod.pause(); }, { once: true });

    // Stöðvar 1–5: fundnar, núverandi eða læstar
    function teiknaStodvar() {
      stodvar.textContent = '';
      log.forEach(function (l, i) {
        var stada = i < fundin ? 'fundin' : i === fundin ? 'opin' : 'laest';
        stodvar.appendChild(el('button', {
          type: 'button',
          'class': 'stod ' + stada + (i === stod ? ' valin' : ''),
          disabled: stada === 'laest' ? '' : null,
          'aria-current': i === stod ? 'true' : 'false',
          title: stada === 'fundin' ? l.heiti + ' · ' + l.flytjandi : stada === 'laest' ? 'Læst' : 'Stöð ' + (i + 1),
          onclick: function () { veljaStod(i, true); }
        }, [el('span', { 'class': 'numer', text: String(i + 1) }), el('span', { 'class': 'merki', text: stada === 'fundin' ? '✓' : stada === 'laest' ? '🔒' : '♪' })]));
      });
    }

    function veljaStod(i, spilaStrax) {
      stod = i;
      lag = log[i];
      hljod.pause();
      hljod.src = lag.hljod;
      rangar = 0;
      svorun.textContent = '';
      svorun.className = 'svorun';
      visbending.hidden = true;
      teiknaStodvar();
      if (i < fundin) {
        radari.hidden = true;
        svorun.className = 'svorun rett';
        svorun.textContent = '✓ ' + lag.heiti + ' · ' + lag.flytjandi;
      } else {
        radari.hidden = false;
        nyttLag();
      }
      if (spilaStrax) spilaLag(); else uppfaeraSpila();
    }

    // Flísar og reitir
    function nyttLag() {
      var stafir = lag.heiti.toUpperCase().replace(/[^A-ZÁÐÉÍÓÚÝÞÆÖ]/g, '').split('');
      var rod = stafir.map(function (s, i) { return { id: i, stafur: s, halli: (Math.random() * 6 - 3).toFixed(1) }; });
      var rett = stafir.join('');
      do { flisar = stokka(rod); } while (flisar.length > 1 && flisar.map(function (f) { return f.stafur; }).join('') === rett);
      reitir = stafir.map(function () { return null; });
      teiknaBord();
    }

    function flis(f, i) {
      return el('button', {
        type: 'button', 'class': 'flis', style: '--halli:' + f.halli + 'deg',
        'aria-label': f.stafur + (i == null ? '' : ', í reit ' + (i + 1)),
        onclick: function () { if (i == null) setja(f); else taka(i); }
      }, [el('span', { text: f.stafur }), el('small', { text: String(STIG[f.stafur] || 1) })]);
    }

    function teiknaBord() {
      bord.textContent = '';
      var n = 0;
      lag.heiti.toUpperCase().split(/\s+/).forEach(function (ord) {
        var ordEl = el('div', { 'class': 'ord' });
        ord.replace(/[^A-ZÁÐÉÍÓÚÝÞÆÖ]/g, '').split('').forEach(function () {
          var i = n++;
          var reitur = el('div', { 'class': 'reitur' + (rangar && reitir[i] && reitir[i].rett ? ' rettur' : '') });
          if (reitir[i]) reitur.appendChild(flis(reitir[i].flis, i));
          ordEl.appendChild(reitur);
        });
        bord.appendChild(ordEl);
      });
      rekki.textContent = '';
      flisar.forEach(function (f) {
        var notud = reitir.some(function (x) { return x && x.flis === f; });
        rekki.appendChild(notud ? el('span', { 'class': 'flis tom', 'aria-hidden': 'true' }) : flis(f, null));
      });
      profa.disabled = reitir.some(function (x) { return !x; });
    }

    function setja(f) {
      var i = reitir.indexOf(null);
      if (i < 0) return;
      reitir[i] = { flis: f };
      teiknaBord();
    }
    function taka(i) {
      reitir[i] = null;
      teiknaBord();
    }
    hreinsa.addEventListener('click', function () {
      reitir = reitir.map(function () { return null; });
      teiknaBord();
    });

    profa.addEventListener('click', function () {
      var rett = lag.heiti.toUpperCase().replace(/[^A-ZÁÐÉÍÓÚÝÞÆÖ]/g, '');
      var svar = reitir.map(function (x) { return x.flis.stafur; }).join('');
      if (svar === rett) {
        fundin = Math.max(fundin, stod + 1);
        api.vistaFramvindu(fundin);
        if (fundin >= log.length) { hljod.pause(); api.leysa(); return; }
        svorun.className = 'svorun rett';
        svorun.textContent = '✓ ' + lag.heiti + ' · ' + lag.flytjandi + '. Næsta stöð er opin.';
        radari.hidden = true;
        teiknaStodvar();
        var naesta = el('button', { type: 'button', 'class': 'adal', text: 'Stilla á stöð ' + (fundin + 1) + ' →', onclick: function () { naesta.remove(); veljaStod(fundin, true); } });
        svorun.after(naesta);
        naesta.focus();
        return;
      }
      // Rangt: merkja stafi sem eru á réttum stað
      rangar++;
      var graenar = 0;
      reitir.forEach(function (x, i) { x.rett = x.flis.stafur === rett[i]; if (x.rett) graenar++; });
      teiknaBord();
      svorun.className = 'svorun rangt';
      svorun.textContent = 'Útvarpið suðar… ' + (graenar ? 'Grænu flísarnar eru á réttum stað.' : 'Engin flís er á réttum stað.');
      radari.classList.remove('hristast');
      void radari.offsetWidth;
      radari.classList.add('hristast');
      if (rangar >= 2) {
        visbending.hidden = false;
        visbending.textContent = '💡 Flytjandi: ' + lag.flytjandi;
      }
    });

    // Lyklaborð: stafur setur flís, Backspace tekur þá síðustu
    function aLyklabord(e) {
      if (!kassi.isConnected || radari.hidden || !reitir || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Backspace') {
        for (var i = reitir.length - 1; i >= 0; i--) if (reitir[i]) { e.preventDefault(); return taka(i); }
        return;
      }
      if (e.key.length !== 1) return;
      var s = e.key.toUpperCase();
      var f = flisar.filter(function (x) {
        return x.stafur === s && !reitir.some(function (y) { return y && y.flis === x; });
      })[0];
      if (f) { e.preventDefault(); setja(f); }
    }
    // Hlustað á allt skjalið því fókus tapast þegar flísar eru teiknaðar upp á nýtt
    document.addEventListener('keydown', aLyklabord);
    api.dialog.addEventListener('close', function () { document.removeEventListener('keydown', aLyklabord); }, { once: true });

    if (api.leyst) {
      // Allt fundið: hægt að hlusta aftur á hvaða stöð sem er
      radari.hidden = true;
      svorun.className = 'svorun rett';
      svorun.textContent = '✓ Þið funduð öll lögin. Smellið á stöð til að hlusta aftur.';
      stod = -1;
      teiknaStodvar();
      uppfaeraSpila();
    } else {
      veljaStod(stod, false);
    }
  };
})();
