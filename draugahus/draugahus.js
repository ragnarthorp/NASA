// Vél draugahússins: teiknar hæðirnar, heldur utan um hvað er leyst
// og opnar herbergi og hæðir eftir reglunum í hus.js.
// Slóðin ?allt opnar allt (til að prófa).
(function () {
  'use strict';

  var HUS = window.HUS;
  var LYKILL = 'draugahus-v1';
  var SVG = 'http://www.w3.org/2000/svg';
  var alltOpid = /[?&]allt\b/.test(location.search);

  var leyst = lesa();
  var herbergi = {};
  var oll = [];
  HUS.haedir.forEach(function (h) {
    h.herbergi.forEach(function (r) { r.haed = h; herbergi[r.id] = r; oll.push(r); });
  });

  function lesa() {
    try { return JSON.parse(localStorage.getItem(LYKILL)) || {}; } catch (e) { return {}; }
  }
  function vista() {
    try { localStorage.setItem(LYKILL, JSON.stringify(leyst)); } catch (e) { /* vafri leyfir ekki geymslu */ }
  }

  // Reglur um opnun
  function uppfyllt(krefst) {
    return alltOpid || (krefst || []).every(function (id) { return leyst[id]; });
  }
  function haedOpin(h) { return uppfyllt(h.krefst); }
  function stada(r) {
    if (leyst[r.id]) return 'leyst';
    return haedOpin(r.haed) && uppfyllt(r.krefst) ? 'opid' : 'laest';
  }
  function heitiLista(ids) {
    return ids.map(function (id) { return herbergi[id].heiti; }).join(' og ');
  }

  // Hjálparföll fyrir DOM
  function el(tag, attr, born) {
    var e = document.createElement(tag);
    for (var k in attr || {}) {
      if (attr[k] == null) continue;
      if (k === 'text') e.textContent = attr[k];
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attr[k]);
      else e.setAttribute(k, attr[k]);
    }
    (born || []).forEach(function (b) { if (b) e.appendChild(b); });
    return e;
  }
  function svg(tag, attr) {
    var e = document.createElementNS(SVG, tag);
    for (var k in attr || {}) e.setAttribute(k, attr[k]);
    return e;
  }
  function rammi(svaedi) {
    var xs = svaedi.map(function (p) { return p[0]; });
    var ys = svaedi.map(function (p) { return p[1]; });
    var x = Math.min.apply(null, xs), y = Math.min.apply(null, ys);
    return { x: x, y: y, w: Math.max.apply(null, xs) - x, h: Math.max.apply(null, ys) - y };
  }

  // Teikning
  var husEl = document.getElementById('hus');

  function teikna(nyopnud) {
    nyopnud = nyopnud || {};
    husEl.textContent = '';
    HUS.haedir.forEach(function (h) {
      var opin = haedOpin(h);
      var fjoldi = h.herbergi.filter(function (r) { return leyst[r.id]; }).length;
      var mynd = svg('svg', { viewBox: '0 0 ' + h.breidd + ' ' + h.haed, role: 'img', 'aria-label': h.heiti });
      mynd.appendChild(svg('image', { href: h.mynd, width: h.breidd, height: h.haed }));

      h.herbergi.forEach(function (r) {
        var s = stada(r);
        var g = svg('g', { 'class': 'herb ' + s + (nyopnud[r.id] ? ' nyopid' : ''), 'data-id': r.id });
        if (opin) {
          g.setAttribute('tabindex', '0');
          g.setAttribute('role', 'button');
          g.setAttribute('aria-label', r.heiti + (s === 'laest' ? ' (læst)' : s === 'leyst' ? ' (leyst)' : ''));
        }
        var title = svg('title');
        title.textContent = s === 'laest' ? r.heiti + ': leysið fyrst ' + heitiLista(r.krefst || []) : r.heiti;
        g.appendChild(title);
        g.appendChild(svg('polygon', { points: r.svaedi.map(function (p) { return p.join(','); }).join(' ') }));
        if (s !== 'opid') {
          var b = rammi(r.svaedi);
          var t = svg('text', { x: b.x + b.w / 2, y: b.y + b.h / 2, 'class': 'merki' });
          t.textContent = s === 'laest' ? '🔒' : '';
          g.appendChild(t);
        }
        mynd.appendChild(g);
      });

      var skilabod = h.krefst ? 'Leysið ' + heitiLista(h.krefst) + ' til að opna ' + h.heiti.toLowerCase() : '';
      husEl.appendChild(el('section', {
        'class': 'haed ' + (opin ? 'opin' : 'laest') + (nyopnud[h.id] ? ' nyopin' : ''),
        id: 'haed-' + h.id
      }, [
        el('h2', {}, [
          document.createTextNode(h.heiti + ' '),
          el('small', { text: opin ? fjoldi + ' af ' + h.herbergi.length + ' leyst' : '🔒 Læst' })
        ]),
        el('div', { 'class': 'mynd', 'data-skilabod': skilabod }, [mynd])
      ]));
    });

    var fj = oll.filter(function (r) { return leyst[r.id]; }).length;
    document.getElementById('stika').style.width = (100 * fj / oll.length) + '%';
    document.getElementById('talning').textContent = fj + ' / ' + oll.length + ' herbergi';
  }

  function opnaHerbergi(id) {
    var r = herbergi[id];
    if (!r || stada(r) === 'laest') return;
    var dlg = document.getElementById('herbergi');
    var efni = document.getElementById('herbergiEfni');
    efni.textContent = '';
    var serthraut = window.THRAUTIR && window.THRAUTIR[r.thraut.tegund];
    dlg.className = 'tegund-' + r.thraut.tegund;

    // Nærmynd af herberginu úr hæðarmyndinni, nema þrautin hafi sína eigin mynd eða afþakki hana
    if (!r.thraut.mynd && r.thraut.naermynd !== false) {
      var b = rammi(r.svaedi);
      var skurdur = svg('svg', { viewBox: [b.x, b.y, b.w, b.h].join(' '), 'class': 'skurdur', preserveAspectRatio: 'xMidYMid slice', 'aria-hidden': 'true' });
      skurdur.appendChild(svg('image', { href: r.haed.mynd, width: r.haed.breidd, height: r.haed.haed }));
      efni.appendChild(skurdur);
    }

    var kassi = el('div', { 'class': 'efni' });
    efni.appendChild(kassi);
    var fyrirsogn = el('h2', { 'class': 'kennari-gat', text: r.heiti });
    kassi.appendChild(fyrirsogn);
    // Kennaralykill: fimm hröð smell á heiti herbergisins
    fimmSmellir(fyrirsogn, function () {
      if (leyst[r.id] || kassi.querySelector('.kennari')) return;
      var k = lykilform('Leysa herbergið', function () { leysa(r, kassi); });
      fyrirsogn.after(k.kassi);
      k.fokus();
    });
    kassi.appendChild(el('p', { 'class': 'spurning', text: r.thraut.spurning }));

    if (serthraut) {
      // Sérþraut fær hjálparföll og vistar eigin framvindu (t.d. hve mörg lög eru fundin)
      var lykill = r.id + '#framvinda';
      serthraut(r, kassi, {
        el: el,
        dialog: dlg,
        efni: efni,
        leyst: !!leyst[r.id],
        framvinda: function () { return leyst[lykill] || 0; },
        vistaFramvindu: function (n) { leyst[lykill] = n; vista(); },
        leysa: function () { leysa(r, kassi); }
      });
    } else if (leyst[r.id]) {
      kassi.appendChild(el('p', { 'class': 'svorun rett', text: '✓ Þið hafið þegar leyst þetta herbergi.' }));
    } else {
      kassi.appendChild(thrautarform(r, kassi));
    }
    dlg.showModal();
    var fyrsta = kassi.querySelector('[data-fokus],input,.valkostir button');
    if (fyrsta) fyrsta.focus();
  }

  function thrautarform(r, kassi) {
    var th = r.thraut;
    var tilraunir = 0;
    var svorun = el('p', { 'class': 'svorun', 'aria-live': 'polite' });
    var hlutar = el('div', {});

    function athuga(svar) {
      if (rettSvar(th, svar)) return leysa(r, kassi);
      tilraunir++;
      svorun.className = 'svorun rangt';
      svorun.textContent = 'Draugurinn hristir höfuðið… reynið aftur.';
      kassi.classList.remove('hristast');
      void kassi.offsetWidth;
      kassi.classList.add('hristast');
      if (tilraunir === 2 && th.visbending) hlutar.appendChild(el('p', { 'class': 'visbending', text: '💡 ' + th.visbending }));
    }

    if (th.tegund === 'val') {
      hlutar.appendChild(el('div', { 'class': 'valkostir' }, th.valkostir.map(function (v, i) {
        return el('button', { type: 'button', text: v, onclick: function () { athuga(i); } });
      })));
    } else {
      var inn = el('input', { type: 'text', autocomplete: 'off', 'aria-label': 'Svar', inputmode: th.tegund === 'tala' ? 'decimal' : 'text' });
      hlutar.appendChild(el('form', { 'class': 'svar', onsubmit: function (e) { e.preventDefault(); athuga(inn.value); } }, [
        inn, el('button', { 'class': 'adal', text: 'Svara' })
      ]));
    }
    hlutar.appendChild(svorun);
    return hlutar;
  }

  function hreinsa(s) {
    return String(s).toLowerCase().replace(/[.!?]+$/, '').replace(/\s+/g, ' ').trim();
  }
  function rettSvar(th, svar) {
    if (th.tegund === 'val') return svar === th.rett;
    if (th.tegund === 'tala') {
      var n = parseFloat(String(svar).replace(',', '.').replace('−', '-'));
      return !isNaN(n) && Math.abs(n - th.svar) <= (th.skekkja || 0);
    }
    return th.svor.some(function (s) { return hreinsa(s) === hreinsa(svar); });
  }

  function leysa(r, kassi) {
    var adurHerb = {}, adurHaed = {};
    oll.forEach(function (x) { adurHerb[x.id] = stada(x); });
    HUS.haedir.forEach(function (h) { adurHaed[h.id] = haedOpin(h); });

    leyst[r.id] = true;
    vista();

    var nyopnud = {}, nyttHerb = [], nyHaed = null;
    oll.forEach(function (x) {
      if (adurHerb[x.id] === 'laest' && stada(x) === 'opid') { nyopnud[x.id] = true; nyttHerb.push(x.heiti); }
    });
    HUS.haedir.forEach(function (h) {
      if (!adurHaed[h.id] && haedOpin(h)) { nyopnud[h.id] = true; nyHaed = h; }
    });

    kassi.querySelectorAll('form,.valkostir,.visbending,.svorun,.thraut-svaedi,.kennari').forEach(function (e) { e.remove(); });
    var lokid = oll.every(function (x) { return leyst[x.id]; });
    var texti = lokid ? '🎃 Þið leystuð öll herbergin og sluppuð úr draugahúsinu!'
      : nyHaed ? '✓ Rétt! Brak heyrist í stiganum… ' + nyHaed.heiti + ' hefur opnast.'
      : nyttHerb.length ? '✓ Rétt! Dyr opnast: ' + nyttHerb.join(', ') + '.'
      : '✓ Rétt!';
    kassi.appendChild(el('p', { 'class': 'svorun rett', text: texti }));
    kassi.appendChild(el('button', { 'class': 'adal', text: 'Áfram', onclick: function () { document.getElementById('herbergi').close(); } }));

    teikna(nyopnud);
    if (nyHaed) {
      document.getElementById('herbergi').addEventListener('close', function () {
        document.getElementById('haed-' + nyHaed.id).scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, { once: true });
    }
  }

  // Kennaralykill og kennaraspjald
  var kennari = false;  // lykillinn hefur verið sleginn inn í þessari heimsókn

  function fimmSmellir(stak, adgerd) {
    var fjoldi = 0, sidast = 0;
    stak.addEventListener('click', function () {
      var nu = Date.now();
      fjoldi = nu - sidast < 700 ? fjoldi + 1 : 1;
      sidast = nu;
      if (fjoldi >= 5) { fjoldi = 0; adgerd(); }
    });
  }

  function lykilform(takkatexti, adgerd) {
    var inn = el('input', { type: 'password', inputmode: 'numeric', autocomplete: 'off', 'aria-label': 'Kennaralykill', placeholder: 'Kennaralykill', hidden: kennari ? '' : null });
    var svar = el('p', { 'class': 'svorun', 'aria-live': 'polite' });
    var form = el('form', { 'class': 'svar', onsubmit: function (e) {
      e.preventDefault();
      if (kennari || window.THRAUTIR.hengilas.fingrafar(inn.value.trim()) === HUS.kennaralykill) {
        kennari = true;
        return adgerd();
      }
      svar.className = 'svorun rangt';
      svar.textContent = 'Rangur lykill.';
      inn.select();
    } }, [inn, el('button', { type: 'submit', 'class': 'adal', text: takkatexti })]);
    var kassi = el('div', { 'class': 'kennari' }, [el('b', { text: '🔑 Kennari' }), form, svar]);
    return { kassi: kassi, fokus: function () { (kennari ? form.querySelector('button') : inn).focus(); } };
  }

  // Leysir herbergi beint (án þrautar) og teiknar húsið með nýopnuðum herbergjum
  function leysaBeint(ids) {
    var adurHerb = {}, adurHaed = {}, nyopnud = {};
    oll.forEach(function (x) { adurHerb[x.id] = stada(x); });
    HUS.haedir.forEach(function (h) { adurHaed[h.id] = haedOpin(h); });
    ids.forEach(function (id) { leyst[id] = true; });
    vista();
    oll.forEach(function (x) { if (adurHerb[x.id] === 'laest' && stada(x) === 'opid') nyopnud[x.id] = true; });
    HUS.haedir.forEach(function (h) { if (!adurHaed[h.id] && haedOpin(h)) nyopnud[h.id] = true; });
    teikna(nyopnud);
  }

  function opnaSpjald() {
    var dlg = document.getElementById('herbergi');
    var efni = document.getElementById('herbergiEfni');
    efni.textContent = '';
    dlg.className = 'tegund-kennari';
    var kassi = el('div', { 'class': 'efni' }, [el('h2', { text: 'Kennaraspjald' })]);
    efni.appendChild(kassi);
    var listi = el('div', { 'class': 'spjald-listi' });

    function teiknaSpjald() {
      listi.textContent = '';
      listi.appendChild(el('button', { type: 'button', 'class': 'adal', text: 'Leysa allt húsið', onclick: function () {
        leysaBeint(oll.map(function (x) { return x.id; })); teiknaSpjald();
      } }));
      // Hæðirnar í þeirri röð sem þær eru leystar: jarðhæð, efri hæð, kjallari
      HUS.haedir.slice().sort(function (a, b) { return (a.krefst ? 1 : 0) - (b.krefst ? 1 : 0); }).forEach(function (h) {
        var oleyst = h.herbergi.filter(function (x) { return !leyst[x.id]; });
        listi.appendChild(el('div', { 'class': 'spjald-haed' }, [
          el('div', { 'class': 'spjald-haus' }, [
            el('h3', { text: h.heiti }),
            el('button', { type: 'button', 'class': 'litill', text: 'Leysa alla hæðina', disabled: oleyst.length ? null : '', onclick: function () {
              leysaBeint(h.herbergi.map(function (x) { return x.id; })); teiknaSpjald();
            } })
          ]),
          el('ul', {}, h.herbergi.map(function (x) {
            var s = stada(x);
            return el('li', {}, [
              el('span', { 'class': 'spjald-stada ' + s, text: s === 'leyst' ? 'Leyst' : s === 'opid' ? 'Opið' : 'Læst' }),
              el('span', { 'class': 'spjald-heiti', text: x.heiti }),
              el('button', { type: 'button', 'class': 'litill', text: 'Leysa', disabled: s === 'leyst' ? '' : null, onclick: function () { leysaBeint([x.id]); teiknaSpjald(); } })
            ]);
          }))
        ]));
      });
    }

    if (kennari) {
      kassi.appendChild(listi);
      teiknaSpjald();
    } else {
      var k = lykilform('Opna spjaldið', function () { k.kassi.remove(); kassi.appendChild(listi); teiknaSpjald(); });
      kassi.appendChild(k.kassi);
      dlg.showModal();
      k.fokus();
      return;
    }
    dlg.showModal();
  }
  var titill = document.querySelector('.top h1');
  titill.classList.add('kennari-gat');
  fimmSmellir(titill, opnaSpjald);

  // Atburðir
  husEl.addEventListener('click', function (e) {
    var g = e.target.closest('.herb');
    if (g) opnaHerbergi(g.getAttribute('data-id'));
  });
  husEl.addEventListener('keydown', function (e) {
    var g = e.target.closest && e.target.closest('.herb');
    if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); opnaHerbergi(g.getAttribute('data-id')); }
  });
  // Tveggja smella staðfesting (confirm() virkar ekki alls staðar)
  var byrjaUpp = document.getElementById('byrjaUpp');
  var stadfestaTimi = null;
  byrjaUpp.addEventListener('click', function () {
    if (!stadfestaTimi) {
      byrjaUpp.textContent = 'Smelltu aftur til að eyða framvindu';
      stadfestaTimi = setTimeout(function () { stadfestaTimi = null; byrjaUpp.textContent = 'Byrja upp á nýtt'; }, 4000);
      return;
    }
    clearTimeout(stadfestaTimi);
    stadfestaTimi = null;
    byrjaUpp.textContent = 'Byrja upp á nýtt';
    leyst = {};
    vista();
    teikna();
    skrunaAdVirkri();
  });

  // Skruna að fyrstu hæð þar sem eitthvað er óleyst
  function skrunaAdVirkri() {
    var h = HUS.haedir.filter(function (h) {
      return haedOpin(h) && h.herbergi.some(function (r) { return stada(r) === 'opid'; });
    })[0];
    if (h) document.getElementById('haed-' + h.id).scrollIntoView({ block: 'start' });
  }

  teikna();
  skrunaAdVirkri();
})();
