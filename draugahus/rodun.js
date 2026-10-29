// Röðun í Móum: þrjár þrautir í röð. Í hverri eru jafnmörg hjól og atriðin og á hverju
// hjóli eru öll atriðin, eins og á talnalás. Þegar hjólin sýna rétta röð verður ljós
// þrautarinnar grænt og næsta þraut birtist.
(function () {
  'use strict';
  window.THRAUTIR = window.THRAUTIR || {};

  function stokka(listi) {
    var a = listi.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  window.THRAUTIR.rodun = function (r, kassi, api) {
    var el = api.el;
    var thrautir = r.thraut.thrautir;
    var leystar = api.leyst ? thrautir.length : Math.min(api.framvinda(), thrautir.length);
    var virk, hringur, stada, buin;

    var ljos = el('div', { 'class': 'ljosin', 'aria-label': 'Ljós' }, thrautir.map(function (t, i) {
      return el('span', { 'class': 'ljos', title: t.titill });
    }));
    var titill = el('h3', { 'class': 'rodun-titill' });
    var asFra = el('span', {}), asTil = el('span', {});
    var hjolin = el('div', { 'class': 'rodun-hjolin', role: 'group' });
    var svorun = el('p', { 'class': 'svorun', 'aria-live': 'polite' });
    var naesta = el('button', { type: 'button', 'class': 'adal', hidden: '', onclick: function () { byrja(leystar); } });
    var skapur = el('div', { 'class': 'skapur' }, [
      ljos,
      el('div', { 'class': 'skapur-andlit thraut-svaedi' }, [
        titill,
        el('div', { 'class': 'rodun-as', 'aria-hidden': 'true' }, [asFra, el('i'), asTil]),
        hjolin
      ])
    ]);
    kassi.appendChild(el('div', { 'class': 'rodun' }, [
      skapur,
      el('p', { 'class': 'leidbeining thraut-svaedi', text: 'Snúið hverju hjóli með örvunum, músarhjólinu eða með því að draga það. Með lyklaborði: örvar upp og niður snúa, örvar til hliðar færa á milli hjóla.' }),
      svorun, naesta
    ]));

    function uppfaeraLjos() {
      Array.prototype.forEach.call(ljos.children, function (l, i) {
        l.className = 'ljos ' + (i < leystar ? 'graent' : 'rautt') + (i === virk && i >= leystar ? ' virkt' : '');
      });
    }

    function byrja(n) {
      virk = n;
      buin = false;
      naesta.hidden = true;
      svorun.className = 'svorun';
      svorun.textContent = '';
      var t = thrautir[n];
      titill.textContent = 'Þraut ' + (n + 1) + ' af ' + thrautir.length + ': ' + t.titill;
      asFra.textContent = t.fra || '';
      asTil.textContent = t.til || '';
      // Sama runa á öllum hjólum, stokkuð svo hún sé ekki rétta röðin sjálf
      do { hringur = stokka(t.rod); } while (hringur.join() === t.rod.join());
      do { stada = t.rod.map(function () { return Math.floor(Math.random() * hringur.length); }); } while (rett());
      hjolin.textContent = '';
      hjolin.setAttribute('aria-label', t.titill);
      t.rod.forEach(function (x, i) { hjolin.appendChild(smidaHjol(i)); });
      teiknaAllt();
      uppfaeraLjos();
    }

    function teiknaAllt() { stada.forEach(function (x, i) { teiknaHjol(i, 0); }); }

    function rett() {
      var t = thrautir[virk];
      return stada.every(function (s, i) { return hringur[s] === t.rod[i]; });
    }

    function snua(i, skref) {
      if (buin) return;
      stada[i] = (stada[i] + skref + hringur.length) % hringur.length;
      teiknaHjol(i, skref);
      if (rett()) leyst();
    }

    function teiknaHjol(i, skref) {
      var hjol = hjolin.children[i];
      var n = hringur.length, s = stada[i];
      var tolur = hjol.querySelector('.tolur');
      tolur.children[0].textContent = hringur[(s + n - 1) % n];
      tolur.children[1].textContent = hringur[s];
      tolur.children[2].textContent = hringur[(s + 1) % n];
      hjol.querySelector('.hjol-gluggi').setAttribute('aria-valuetext', hringur[s]);
      if (skref) {
        tolur.classList.remove('upp', 'nidur');
        void tolur.offsetWidth;
        tolur.classList.add(skref > 0 ? 'upp' : 'nidur');
      }
    }

    function smidaHjol(i) {
      var gluggi = el('div', {
        'class': 'hjol-gluggi', tabindex: '0', role: 'spinbutton', 'aria-label': 'Sæti ' + (i + 1),
        'data-fokus': i === 0 ? '' : null
      }, [el('div', { 'class': 'tolur' }, [el('span'), el('b'), el('span')])]);
      gluggi.addEventListener('keydown', function (e) {
        var hjolLisi = hjolin.querySelectorAll('.hjol-gluggi');
        if (e.key === 'ArrowUp') { e.preventDefault(); snua(i, 1); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); snua(i, -1); }
        else if (e.key === 'ArrowRight' && hjolLisi[i + 1]) { e.preventDefault(); hjolLisi[i + 1].focus(); }
        else if (e.key === 'ArrowLeft' && hjolLisi[i - 1]) { e.preventDefault(); hjolLisi[i - 1].focus(); }
      });
      gluggi.addEventListener('wheel', function (e) { e.preventDefault(); snua(i, e.deltaY > 0 ? 1 : -1); }, { passive: false });
      var byrjunY = null;
      gluggi.addEventListener('pointerdown', function (e) { byrjunY = e.clientY; gluggi.setPointerCapture(e.pointerId); });
      gluggi.addEventListener('pointermove', function (e) {
        if (byrjunY == null) return;
        var d = byrjunY - e.clientY;
        if (Math.abs(d) >= 24) { snua(i, d > 0 ? 1 : -1); byrjunY = e.clientY; }
      });
      gluggi.addEventListener('pointerup', function () { byrjunY = null; });
      gluggi.addEventListener('pointercancel', function () { byrjunY = null; });

      var hjol = el('div', { 'class': 'hjol' }, [
        el('span', { 'class': 'saeti', text: String(i + 1) }),
        el('button', { type: 'button', 'class': 'hjol-or', tabindex: '-1', 'aria-label': 'Sæti ' + (i + 1) + ' upp', text: '▲', onclick: function () { snua(i, 1); } }),
        gluggi,
        el('button', { type: 'button', 'class': 'hjol-or', tabindex: '-1', 'aria-label': 'Sæti ' + (i + 1) + ' niður', text: '▼', onclick: function () { snua(i, -1); } })
      ]);
      return hjol;
    }

    function leyst() {
      buin = true;
      leystar = Math.max(leystar, virk + 1);
      api.vistaFramvindu(leystar);
      skapur.classList.add('rett');
      setTimeout(function () { skapur.classList.remove('rett'); }, 900);
      uppfaeraLjos();
      if (leystar >= thrautir.length) {
        svorun.className = 'svorun rett';
        svorun.textContent = 'Öll ljósin loga græn!';
        if (!api.leyst) setTimeout(api.leysa, 1000);
        return;
      }
      svorun.className = 'svorun rett';
      svorun.textContent = '✓ Rétt röð! Ljós ' + (virk + 1) + ' er orðið grænt.';
      naesta.textContent = 'Næsta þraut →';
      naesta.hidden = false;
      naesta.focus();
    }

    if (leystar >= thrautir.length) {
      virk = thrautir.length - 1;
      byrja(virk);
      stada = thrautir[virk].rod.map(function (x) { return hringur.indexOf(x); });
      teiknaAllt();
      buin = true;
      uppfaeraLjos();
      svorun.className = 'svorun rett';
      svorun.textContent = '✓ Öll ljósin loga græn.';
    } else {
      byrja(leystar);
    }
  };
})();
