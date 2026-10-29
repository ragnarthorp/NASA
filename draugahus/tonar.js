// Tónaþraut í Langa ganginum: hljómstafir með hreinum sínustónum (Web Audio).
// „Hlusta“ spilar stefið. Nemendur leika það eftir: hver réttur tónn kveikir ljós,
// en rangur tónn slekkur öll ljósin aftur. Eftir þrjár misheppnaðar tilraunir
// blikka stafirnir með þegar stefið er spilað.
(function () {
  'use strict';
  window.THRAUTIR = window.THRAUTIR || {};

  var HALFTONAR = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, H: 11 };
  function tidni(nota) {
    var midi = 12 * (+nota.slice(1) + 1) + HALFTONAR[nota[0]];
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  var hljodkerfi = null;
  function kerfi() {
    if (!hljodkerfi) {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      hljodkerfi = new AC();
    }
    if (hljodkerfi.state === 'suspended') hljodkerfi.resume();
    return hljodkerfi;
  }

  // Hreinn tónn: sínusbylgja sem kviknar mjúklega og deyr út
  function spila(nota, lengd) {
    var ac = kerfi();
    if (!ac) return;
    var t = ac.currentTime;
    var osc = ac.createOscillator();
    var styrkur = ac.createGain();
    osc.type = 'sine';
    osc.frequency.value = tidni(nota);
    styrkur.gain.setValueAtTime(0.0001, t);
    styrkur.gain.exponentialRampToValueAtTime(0.35, t + 0.02);
    styrkur.gain.exponentialRampToValueAtTime(0.0001, t + (lengd || 1.2));
    osc.connect(styrkur).connect(ac.destination);
    osc.start(t);
    osc.stop(t + (lengd || 1.2) + 0.05);
  }

  window.THRAUTIR.tonar = function (r, kassi, api) {
    var el = api.el;
    var th = r.thraut;
    var notur = th.notur;
    var lag = th.lag;
    var komid = 0, misheppnad = 0, spilar = false, buid = false, timar = [];

    var ljos = el('div', { 'class': 'tonar-ljos', 'aria-label': 'Rétt leiknir tónar' }, lag.map(function () { return el('span'); }));
    var hlusta = el('button', { type: 'button', 'class': 'adal', text: '▶ Hlusta á stefið', 'data-fokus': '' });
    var stafir = el('div', { 'class': 'tonar-stafir', role: 'group', 'aria-label': 'Hljómstafir' });
    var svorun = el('p', { 'class': 'svorun', 'aria-live': 'polite' });

    notur.forEach(function (n, i) {
      var hlutfall = i / (notur.length - 1);
      stafir.appendChild(el('button', {
        type: 'button', 'class': 'tonn', 'data-nota': n,
        style: '--litur:hsl(' + Math.round(270 - hlutfall * 230) + ' 80% 60%);--haed:' + Math.round(100 - hlutfall * 45) + '%',
        'aria-label': 'Tónn ' + n[0] + (n[1] === '5' ? ' (hár)' : ''),
        onclick: function () { leika(i); }
      }, [el('span', { text: n[0] }), el('small', { text: String(i + 1 === 10 ? 0 : i + 1) })]));
    });

    kassi.appendChild(el('div', { 'class': 'tonar' }, [
      el('div', { 'class': 'tonar-haus thraut-svaedi' }, [hlusta, ljos]),
      stafir,
      el('p', { 'class': 'leidbeining thraut-svaedi', text: 'Smellið á stafina eða notið talnatakkana 1–0. Hvert ljós kviknar þegar réttur tónn er leikinn. Rangur tónn slekkur ljósin og þá þarf að byrja aftur.' }),
      svorun
    ]));

    function lysa(i, lengd) {
      var takki = stafir.children[i];
      takki.classList.add('hljomar');
      timar.push(setTimeout(function () { takki.classList.remove('hljomar'); }, lengd || 350));
    }

    function uppfaeraLjos(rangt) {
      Array.prototype.forEach.call(ljos.children, function (l, i) {
        l.className = i < komid ? 'kveikt' : rangt ? 'rangt' : '';
      });
    }

    function leika(i) {
      spila(notur[i], 1.4);
      lysa(i);
      if (buid || spilar) return;
      if (notur[i] === lag[komid]) {
        komid++;
        svorun.className = 'svorun';
        svorun.textContent = '';
        uppfaeraLjos();
        if (komid === lag.length) return leyst();
        return;
      }
      // Rangur tónn: ljósin slokkna (nema hann sé fyrsti tónn stefsins, þá er byrjað aftur á honum)
      var byrjarAftur = notur[i] === lag[0];
      if (komid > 0 || !byrjarAftur) misheppnad++;
      komid = byrjarAftur ? 1 : 0;
      uppfaeraLjos(!byrjarAftur);
      svorun.className = 'svorun rangt';
      svorun.textContent = byrjarAftur ? 'Byrjað aftur á fyrsta tóninum…' : 'Rangur tónn! Ljósin slokkna. Byrjið aftur.';
      if (misheppnad === 3) {
        svorun.textContent += ' Vísbending: nú blikka stafirnir með þegar þið hlustið.';
      }
    }

    function spilaStef() {
      if (spilar) return;
      spilar = true;
      hlusta.disabled = true;
      var bil = 650;
      lag.forEach(function (n, k) {
        timar.push(setTimeout(function () {
          var sidast = k === lag.length - 1;
          spila(n, sidast ? 2.2 : 1.1);
          if (misheppnad >= 3) lysa(notur.indexOf(n), sidast ? 900 : 500);
        }, k * bil + (k === lag.length - 1 ? 150 : 0)));
      });
      timar.push(setTimeout(function () { spilar = false; hlusta.disabled = false; }, lag.length * bil + 900));
    }
    hlusta.addEventListener('click', spilaStef);

    function leyst() {
      buid = true;
      svorun.className = 'svorun rett';
      svorun.textContent = 'Stefið hljómar í ganginum… ljósin loga öll!';
      ljos.classList.add('allt');
      // Endurtaka stefið sem sigursöng
      lag.forEach(function (n, k) {
        timar.push(setTimeout(function () { spila(n, 1.3); lysa(notur.indexOf(n), 450); }, 500 + k * 380));
      });
      if (!api.leyst) timar.push(setTimeout(api.leysa, 500 + lag.length * 380 + 600));
    }

    // Talnatakkar 1–0 leika stafina
    function aLyklabord(e) {
      if (!kassi.isConnected || e.ctrlKey || e.metaKey || e.altKey || !/^[0-9]$/.test(e.key)) return;
      var i = e.key === '0' ? 9 : +e.key - 1;
      if (i < notur.length) { e.preventDefault(); leika(i); }
    }
    document.addEventListener('keydown', aLyklabord);
    api.dialog.addEventListener('close', function () {
      document.removeEventListener('keydown', aLyklabord);
      timar.forEach(clearTimeout);
    }, { once: true });

    uppfaeraLjos();
    if (api.leyst) {
      buid = true;
      komid = lag.length;
      uppfaeraLjos();
      svorun.className = 'svorun rett';
      svorun.textContent = '✓ Gangurinn er leystur. Stafirnir hljóma enn ef þið viljið spila.';
    }
  };
})();
