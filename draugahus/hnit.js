// Hnitaþraut í Geymsludóti: punktur birtist á slembistað á loftmynd og nemandinn skrifar
// hnit hans í gráðum, mínútum og sekúndum. Punktur nemandans birtist og lína er dregin á
// milli. Eftir `umferdir` punkta þarf heildarlengd línanna að vera undir `hamark`, mælt í
// hliðum eins reits (ein bogamínúta), annars er byrjað upp á nýtt.
(function () {
  'use strict';
  window.THRAUTIR = window.THRAUTIR || {};

  var SVG = 'http://www.w3.org/2000/svg';
  var K = 960;               // stærð kortsins í SVG-einingum
  var SPASS = 70;            // pláss fyrir merkingar

  function svg(tag, attr, texti) {
    var e = document.createElementNS(SVG, tag);
    for (var k in attr) e.setAttribute(k, attr[k]);
    if (texti != null) e.textContent = texti;
    return e;
  }
  function gms(sek) {
    var g = Math.floor(sek / 3600), m = Math.floor(sek % 3600 / 60), s = Math.round(sek % 60);
    return g + '°' + String(m).padStart(2, '0') + '′' + String(s).padStart(2, '0') + '″';
  }

  window.THRAUTIR.hnit = function (r, kassi, api) {
    var el = api.el;
    var th = r.thraut;
    var N0 = (th.nordur[0] * 60 + th.nordur[1]) * 60, N1 = (th.nordur[2] * 60 + th.nordur[3]) * 60;
    var V0 = (th.vestur[0] * 60 + th.vestur[1]) * 60, V1 = (th.vestur[2] * 60 + th.vestur[3]) * 60;
    var REITIR = (N1 - N0) / 60;   // fjöldi reita á hlið
    var UMF = th.umferdir || 5, HAMARK = th.hamark || 5;
    var umferd, mark, heild, saga, buid;

    // Kortið: loftmynd, hnitanet, merkingar og lag fyrir punkta
    function xAf(v) { return (V1 - v) / (V1 - V0) * K; }   // vestlæg lengd: hærri tala lengra til vinstri
    function yAf(n) { return (N1 - n) / (N1 - N0) * K; }
    var kort = svg('svg', { viewBox: [-170, -SPASS + 10, K + 170 + 90, K + SPASS].join(' '), 'class': 'hnit-kort', role: 'img', 'aria-label': 'Loftmynd með hnitaneti' });
    kort.appendChild(svg('image', { href: th.mynd, x: 0, y: 0, width: K, height: K }));
    var net = svg('g', { 'class': 'hnit-net' });
    for (var i = 0; i <= REITIR; i++) {
      var p = i * K / REITIR;
      net.appendChild(svg('line', { x1: p, y1: 0, x2: p, y2: K }));
      net.appendChild(svg('line', { x1: 0, y1: p, x2: K, y2: p }));
      // Smástrik fyrir hverjar 10 sekúndur á jöðrunum
      if (i < REITIR) for (var t = 1; t < 6; t++) {
        var q = p + t * K / REITIR / 6, l = t === 3 ? 14 : 8;
        net.appendChild(svg('line', { 'class': 'strik', x1: q, y1: 0, x2: q, y2: l }));
        net.appendChild(svg('line', { 'class': 'strik', x1: 0, y1: q, x2: l, y2: q }));
      }
      if (i % 2 === 0) {
        var bm = th.nordur[2] * 60 + th.nordur[3] - i, lm = th.vestur[2] * 60 + th.vestur[3] - i;
        net.appendChild(svg('text', { 'class': 'merking', x: -10, y: p + 9, 'text-anchor': 'end' }, Math.floor(bm / 60) + '°' + String(bm % 60).padStart(2, '0') + '′N'));
        net.appendChild(svg('text', { 'class': 'merking', x: p, y: -16, 'text-anchor': 'middle' }, Math.floor(lm / 60) + '°' + String(lm % 60).padStart(2, '0') + '′V'));
      }
    }
    net.appendChild(svg('rect', { x: 0, y: 0, width: K, height: K, 'class': 'rammi' }));
    kort.appendChild(net);
    var punktar = svg('g', {});
    kort.appendChild(punktar);

    // Innsláttur
    function reitur(merki, max, ph) {
      return el('label', { 'class': 'hnit-reitur' }, [
        el('input', { type: 'text', inputmode: 'numeric', autocomplete: 'off', maxlength: '3', placeholder: ph, 'aria-label': ph, 'data-max': String(max) }),
        el('span', { text: merki })
      ]);
    }
    function lina(heiti) {
      return el('div', { 'class': 'hnit-lina' }, [el('b', { text: heiti }), reitur('°', 180, 'gr'), reitur('′', 59, 'mín'), reitur('″', 59, 'sek')]);
    }
    var nLina = lina('N'), vLina = lina('V');
    var form = el('form', { 'class': 'hnit-form thraut-svaedi' }, [
      nLina, vLina,
      el('button', { type: 'submit', 'class': 'adal', text: 'Merkja punkt' })
    ]);
    var stadaEl = el('div', { 'class': 'hnit-stada' });
    var stika = el('div', { 'class': 'hnit-stika' }, [el('span')]);
    var sagaEl = el('ol', { 'class': 'hnit-saga' });
    var svorun = el('p', { 'class': 'svorun', 'aria-live': 'polite' });
    var aftur = el('button', { type: 'button', text: 'Byrja upp á nýtt', hidden: '', onclick: function () { nyrLeikur(); } });

    kassi.appendChild(el('div', { 'class': 'hnit' }, [
      el('div', { 'class': 'hnit-kort-kassi' }, [kort]),
      el('div', { 'class': 'hnit-hlid' }, [stadaEl, stika, form, svorun, aftur, sagaEl])
    ]));
    form.querySelector('input').setAttribute('data-fokus', '');

    // Fara sjálfkrafa í næsta reit þegar tveir stafir eru komnir (eða þrír í gráðum)
    var reitirAllir = form.querySelectorAll('input');
    reitirAllir.forEach(function (inn, k) {
      inn.addEventListener('input', function () {
        inn.value = inn.value.replace(/[^0-9]/g, '');
        if (inn.value.length >= 2 && reitirAllir[k + 1]) reitirAllir[k + 1].focus();
      });
    });

    function lesa(linaEl) {
      var v = Array.prototype.map.call(linaEl.querySelectorAll('input'), function (x) { return x.value === '' ? NaN : +x.value; });
      if (v.some(isNaN)) return { villa: 'Fyllið út gráður, mínútur og sekúndur.' };
      if (v[1] > 59 || v[2] > 59) return { villa: 'Mínútur og sekúndur eru frá 0 upp í 59.' };
      return { sek: (v[0] * 60 + v[1]) * 60 + v[2] };
    }

    function nyrLeikur() {
      umferd = 0; heild = 0; saga = []; buid = false;
      punktar.textContent = '';
      sagaEl.textContent = '';
      svorun.className = 'svorun';
      svorun.textContent = '';
      aftur.hidden = true;
      form.hidden = false;
      nyttMark();
    }

    function nyttMark() {
      var bil = 20;  // ekki of nálægt jaðrinum (sekúndur)
      mark = {
        n: N0 + bil + Math.floor(Math.random() * (N1 - N0 - 2 * bil)),
        v: V0 + bil + Math.floor(Math.random() * (V1 - V0 - 2 * bil))
      };
      Array.prototype.forEach.call(punktar.querySelectorAll('.nytt'), function (x) { x.classList.remove('nytt'); });
      var g = svg('g', { 'class': 'mark nytt' });
      g.appendChild(svg('circle', { cx: xAf(mark.v), cy: yAf(mark.n), r: 26, 'class': 'bylgja' }));
      g.appendChild(svg('circle', { cx: xAf(mark.v), cy: yAf(mark.n), r: 11 }));
      punktar.appendChild(g);
      reitirAllir.forEach(function (x) { x.value = ''; });
      uppfaeraStodu();
    }

    function uppfaeraStodu() {
      stadaEl.textContent = buid ? '' : 'Punktur ' + Math.min(umferd + 1, UMF) + ' af ' + UMF + ' · Heildarlengd: ' + heild.toFixed(2).replace('.', ',') + ' af hámarki ' + HAMARK;
      var hlutfall = Math.min(1, heild / HAMARK);
      stika.firstChild.style.width = (hlutfall * 100) + '%';
      stika.classList.toggle('haetta', hlutfall > 0.7);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (buid) return;
      var n = lesa(nLina), v = lesa(vLina);
      if (n.villa || v.villa) {
        svorun.className = 'svorun rangt';
        svorun.textContent = n.villa || v.villa;
        return;
      }
      var d = Math.sqrt(Math.pow(n.sek - mark.n, 2) + Math.pow(v.sek - mark.v, 2)) / 60;
      heild += d;
      umferd++;
      // Teikna punkt nemandans og línu á milli (punktur utan korts er festur við jaðarinn)
      var x = Math.max(0, Math.min(K, xAf(v.sek))), y = Math.max(0, Math.min(K, yAf(n.sek)));
      var g = svg('g', { 'class': 'giskun' });
      g.appendChild(svg('line', { x1: xAf(mark.v), y1: yAf(mark.n), x2: x, y2: y }));
      g.appendChild(svg('circle', { cx: x, cy: y, r: 10 }));
      g.appendChild(svg('text', { x: (xAf(mark.v) + x) / 2 + 12, y: (yAf(mark.n) + y) / 2 - 10 }, d.toFixed(2).replace('.', ',')));
      punktar.insertBefore(g, punktar.querySelector('.mark.nytt'));
      sagaEl.appendChild(el('li', {}, [
        el('span', { text: 'Rétt: N ' + gms(mark.n) + ' V ' + gms(mark.v) }),
        el('b', { text: d.toFixed(2).replace('.', ',') })
      ]));
      var utan = n.sek < N0 || n.sek > N1 || v.sek < V0 || v.sek > V1;
      svorun.className = 'svorun ' + (d < 0.5 ? 'rett' : 'rangt');
      svorun.textContent = (utan ? 'Punkturinn lenti utan kortsins! ' : '') + 'Fjarlægð: ' + d.toFixed(2).replace('.', ',') + (d < 0.25 ? ' Mjög nákvæmt!' : '');

      if (heild >= HAMARK) return lok(false);
      if (umferd >= UMF) return lok(true);
      nyttMark();
      reitirAllir[0].focus();
    });

    function lok(tokst) {
      buid = true;
      form.hidden = true;
      uppfaeraStodu();
      var h = heild.toFixed(2).replace('.', ',');
      if (tokst) {
        svorun.className = 'svorun rett';
        svorun.textContent = 'Heildarlengdin var ' + h + ', undir ' + HAMARK + '. Draugurinn er sáttur!';
        if (!api.leyst) setTimeout(api.leysa, 1400);
        else { aftur.hidden = false; aftur.textContent = 'Spila aftur'; }
      } else {
        svorun.className = 'svorun rangt';
        svorun.textContent = 'Heildarlengdin er orðin ' + h + ', það er ' + HAMARK + ' eða meira. Byrjið upp á nýtt með nýjum punktum.';
        aftur.hidden = false;
        aftur.textContent = 'Byrja upp á nýtt';
        aftur.focus();
      }
    }

    nyrLeikur();
    if (api.leyst) {
      svorun.className = 'svorun rett';
      svorun.textContent = '✓ Geymsludót er leyst. Þið megið samt æfa ykkur á fleiri punktum.';
    }
  };
})();
