// Stafaröð: hljóð spilast og nemendur smella á stafina í svarinu í réttri röð.
// Réttur stafur verður grænn og fer á sinn stað, en rangur stafur þýðir að byrja upp á nýtt.
(function () {
  'use strict';
  window.THRAUTIR = window.THRAUTIR || {};

  window.THRAUTIR.stafarod = function (r, kassi, api) {
    var el = api.el;
    var th = r.thraut;
    var hjalp = window.THRAUTIR.flisar;
    var STAFIR = /[^A-ZÁÐÉÍÓÚÝÞÆÖ]/g;
    var ord = th.svar.toUpperCase().split(/\s+/).map(function (o) { return o.replace(STAFIR, ''); });
    var rett = ord.join('');
    var komid = api.leyst ? rett.length : 0;   // hve margir stafir eru komnir rétt
    var notadar = {};                           // flísar sem eru komnar á sinn stað

    var hljod = new Audio(th.hljod);
    hljod.preload = 'auto';
    var spila = el('button', { type: 'button', 'class': 'adal', 'data-fokus': '' });
    var aftur = el('button', { type: 'button', text: '↺ Aftur' });
    var bord = el('div', { 'class': 'bord', 'aria-label': 'Svarið' });
    var rekki = el('div', { 'class': 'rekki thraut-svaedi', 'aria-label': 'Stafaflísar' });
    var svorun = el('p', { 'class': 'svorun', 'aria-live': 'polite' });
    var radari = el('div', { 'class': 'radari' }, [bord, rekki]);

    // Þegar þrautin er leyst hverfa flísarnar og leiðbeiningin en svarið stendur eftir
    kassi.appendChild(el('div', { 'class': 'stafarod' }, [
      el('div', { 'class': 'spilari' }, [spila, aftur]),
      el('p', { 'class': 'leidbeining thraut-svaedi', text: 'Smellið á stafina í svarinu í réttri röð. Ef þið smellið á rangan staf byrjið þið upp á nýtt.' }),
      radari, svorun
    ]));

    // Hljóð
    function uppfaeraSpila() { spila.textContent = hljod.paused ? '▶ Hlusta' : '❚❚ Stöðva'; }
    function spilaHljod() {
      var p = hljod.play();
      if (p && p.catch) p.catch(uppfaeraSpila);
    }
    ['play', 'pause', 'ended'].forEach(function (a) { hljod.addEventListener(a, uppfaeraSpila); });
    spila.addEventListener('click', function () { if (hljod.paused) spilaHljod(); else hljod.pause(); });
    aftur.addEventListener('click', function () { hljod.currentTime = 0; spilaHljod(); });
    api.dialog.addEventListener('close', function () { hljod.pause(); }, { once: true });
    uppfaeraSpila();

    // Flísar: stafirnir í svarinu og nokkrir villustafir, stokkað einu sinni
    var flisar = hjalp.stokka((rett + (th.aukastafir || '').toUpperCase()).split('').map(function (s, i) {
      return { id: i, stafur: s, halli: (Math.random() * 6 - 3).toFixed(1) };
    }));

    function flisEl(f, attr) {
      return el('button', Object.assign({
        type: 'button', 'class': 'flis', style: '--halli:' + f.halli + 'deg', 'aria-label': f.stafur
      }, attr || {}), [el('span', { text: f.stafur }), el('small', { text: String(hjalp.STIG[f.stafur] || 1) })]);
    }

    function teikna() {
      bord.textContent = '';
      var n = 0;
      ord.forEach(function (o) {
        bord.appendChild(el('div', { 'class': 'ord' }, o.split('').map(function (s) {
          var i = n++;
          return el('div', { 'class': 'reitur' + (i < komid ? ' rettur' : '') },
            i < komid ? [flisEl({ stafur: s, halli: 0 }, { tabindex: '-1', 'aria-hidden': 'true' })] : []);
        })));
      });
      rekki.textContent = '';
      flisar.forEach(function (f) {
        rekki.appendChild(notadar[f.id]
          ? el('span', { 'class': 'flis tom', 'aria-hidden': 'true' })
          : flisEl(f, { onclick: function (e) { velja(f, e.currentTarget); }, disabled: komid >= rett.length ? '' : null }));
      });
    }

    function velja(f, takki) {
      if (komid >= rett.length) return;
      if (f.stafur === rett[komid]) {
        notadar[f.id] = true;
        komid++;
        svorun.className = 'svorun';
        svorun.textContent = '';
        teikna();
        if (komid === rett.length) {
          hljod.pause();
          setTimeout(api.leysa, 700);
        }
        return;
      }
      // Rangur stafur: blikkar rauður og allt hreinsast
      takki.classList.add('rong');
      svorun.className = 'svorun rangt';
      svorun.textContent = 'Rangur stafur! Byrjið upp á nýtt.';
      radari.classList.remove('hristast');
      void radari.offsetWidth;
      radari.classList.add('hristast');
      komid = 0;
      notadar = {};
      setTimeout(teikna, 450);
    }

    // Lyklaborð: stafur velur fyrstu lausu flísina með þeim staf
    function aLyklabord(e) {
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1 || !kassi.isConnected) return;
      var s = e.key.toUpperCase();
      var f = flisar.filter(function (x) { return x.stafur === s && !notadar[x.id]; })[0];
      if (!f) return;
      e.preventDefault();
      velja(f, rekki.children[flisar.indexOf(f)]);
    }
    // Hlustað á allt skjalið því fókus tapast þegar flísar eru teiknaðar upp á nýtt
    document.addEventListener('keydown', aLyklabord);
    api.dialog.addEventListener('close', function () { document.removeEventListener('keydown', aLyklabord); }, { once: true });

    if (api.leyst) {
      svorun.className = 'svorun rett';
      svorun.textContent = '✓ ' + th.svar;
    }
    teikna();
  };
})();
