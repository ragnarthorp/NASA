// Hengilás: talnahjól sem snúast eins og á hengilás. Aðeins rétt talnaruna opnar lásinn.
// Rétta runan er ekki geymd sem texti heldur sem fingrafar (FNV-1a), svo hún sést ekki
// beint í kóðanum. Nýtt fingrafar fæst í vafranum með: THRAUTIR.hengilas.fingrafar('12345678')
(function () {
  'use strict';
  window.THRAUTIR = window.THRAUTIR || {};

  function fingrafar(runa) {
    var h = 0x811c9dc5;
    var s = 'draugahus:' + runa;
    for (var i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return ('0000000' + h.toString(16)).slice(-8);
  }

  function hengilas(r, kassi, api) {
    var el = api.el;
    var th = r.thraut;
    var fjoldi = th.fjoldi || 8;
    var gildi = [];
    for (var i = 0; i < fjoldi; i++) gildi.push(0);
    var opinn = !!api.leyst;

    if (th.tengill) {
      kassi.appendChild(el('a', { 'class': 'tengill-takki', href: th.tengill.slod, target: '_blank', rel: 'noopener', text: th.tengill.texti + ' ↗' }));
    }
    if (th.varaleid) {
      // Bekkjarkóði sem varaleið, með afritunarhnappi og tengli á forsíðu Classroom
      var kodiEl = el('span', { 'class': 'bekkjarkodi', text: th.varaleid.kodi });
      var afrita = el('button', { type: 'button', 'class': 'litill', text: 'Afrita' });
      afrita.addEventListener('click', function () {
        function velja() {
          var sv = document.createRange(); sv.selectNodeContents(kodiEl);
          var val = window.getSelection(); val.removeAllRanges(); val.addRange(sv);
          afrita.textContent = 'Valið. Ýtið á Ctrl+C';
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(th.varaleid.kodi).then(function () { afrita.textContent = 'Afritað ✓'; }, velja);
        } else velja();
      });
      kassi.appendChild(el('div', { 'class': 'varaleid' }, [
        el('p', { text: 'Virkar tengillinn ekki? Farið á Classroom, veljið + og „Taka þátt í námskeiði“ (Join class) og sláið inn bekkjarkóðann:' }),
        el('div', { 'class': 'varaleid-kodi' }, [kodiEl, afrita]),
        el('a', { href: th.varaleid.slod, target: '_blank', rel: 'noopener', text: 'Opna classroom.google.com ↗' })
      ]));
    }
    if (th.aminning) kassi.appendChild(el('p', { 'class': 'aminning', text: th.aminning }));

    var hjolin = el('div', { 'class': 'hjolin', role: 'group', 'aria-label': 'Talnahjól lássins' });
    var lasEl = el('div', { 'class': 'las' + (opinn ? ' opinn' : '') }, [
      el('div', { 'class': 'las-bolur' }, [
        el('span', { 'class': 'las-nagli n1' }), el('span', { 'class': 'las-nagli n2' }),
        el('span', { 'class': 'las-nagli n3' }), el('span', { 'class': 'las-nagli n4' }),
        el('div', { 'class': 'las-rauf' }, [hjolin]),
        el('div', { 'class': 'las-merki', text: r.heiti })
      ])
    ]);
    var svorun = el('p', { 'class': 'svorun', 'aria-live': 'polite' });
    kassi.appendChild(el('div', { 'class': 'hengilas' }, [
      lasEl,
      el('p', { 'class': 'leidbeining thraut-svaedi', text: 'Snúið hjólunum með örvunum, músarhjólinu eða með því að draga þau upp og niður. Það má líka smella á hjól og slá inn tölurnar.' }),
      svorun
    ]));

    function snua(i, skref) {
      if (opinn) return;
      gildi[i] = (gildi[i] + skref + 10) % 10;
      teiknaHjol(i, skref);
      athuga();
    }

    function teiknaHjol(i, skref) {
      var hjol = hjolin.children[i];
      var g = gildi[i];
      var tolur = hjol.querySelector('.tolur');
      tolur.children[0].textContent = (g + 9) % 10;
      tolur.children[1].textContent = g;
      tolur.children[2].textContent = (g + 1) % 10;
      hjol.querySelector('.hjol-gluggi').setAttribute('aria-valuenow', g);
      if (skref) {
        tolur.classList.remove('upp', 'nidur');
        void tolur.offsetWidth;
        tolur.classList.add(skref > 0 ? 'upp' : 'nidur');
      }
    }

    function athuga() {
      if (fingrafar(gildi.join('')) !== th.lykill) return;
      opinn = true;
      lasEl.classList.add('opinn');
      svorun.className = 'svorun rett';
      svorun.textContent = 'Klikk! Lásinn opnast.';
      if (!api.leyst) setTimeout(api.leysa, 1200);
    }

    gildi.forEach(function (g, i) {
      var gluggi = el('div', {
        'class': 'hjol-gluggi', tabindex: '0', role: 'spinbutton',
        'aria-label': 'Hjól ' + (i + 1), 'aria-valuemin': '0', 'aria-valuemax': '9', 'aria-valuenow': '0',
        'data-fokus': i === 0 ? '' : null
      }, [el('div', { 'class': 'tolur' }, [el('span', {}), el('b', {}), el('span', {})])]);

      gluggi.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowUp') { e.preventDefault(); snua(i, 1); }
        else if (e.key === 'ArrowDown') { e.preventDefault(); snua(i, -1); }
        else if (e.key === 'ArrowRight' && i < fjoldi - 1) { e.preventDefault(); hjolin.children[i + 1].querySelector('.hjol-gluggi').focus(); }
        else if (e.key === 'ArrowLeft' && i > 0) { e.preventDefault(); hjolin.children[i - 1].querySelector('.hjol-gluggi').focus(); }
        else if (/^[0-9]$/.test(e.key) && !opinn) {
          e.preventDefault();
          var nytt = +e.key;
          var skref = nytt === gildi[i] ? 0 : 1;
          gildi[i] = nytt;
          teiknaHjol(i, skref);
          if (i < fjoldi - 1) hjolin.children[i + 1].querySelector('.hjol-gluggi').focus();
          athuga();
        }
      });
      gluggi.addEventListener('wheel', function (e) {
        e.preventDefault();
        snua(i, e.deltaY > 0 ? 1 : -1);
      }, { passive: false });

      // Draga hjólið: ein tala fyrir hverja ~22 px
      var byrjunY = null;
      gluggi.addEventListener('pointerdown', function (e) {
        byrjunY = e.clientY;
        gluggi.setPointerCapture(e.pointerId);
      });
      gluggi.addEventListener('pointermove', function (e) {
        if (byrjunY == null) return;
        var d = byrjunY - e.clientY;
        if (Math.abs(d) >= 22) { snua(i, d > 0 ? 1 : -1); byrjunY = e.clientY; }
      });
      gluggi.addEventListener('pointerup', function () { byrjunY = null; });
      gluggi.addEventListener('pointercancel', function () { byrjunY = null; });

      hjolin.appendChild(el('div', { 'class': 'hjol' }, [
        el('button', { type: 'button', 'class': 'hjol-or', 'aria-label': 'Hjól ' + (i + 1) + ' upp', tabindex: '-1', text: '▲', onclick: function () { snua(i, 1); } }),
        gluggi,
        el('button', { type: 'button', 'class': 'hjol-or', 'aria-label': 'Hjól ' + (i + 1) + ' niður', tabindex: '-1', text: '▼', onclick: function () { snua(i, -1); } })
      ]));
      teiknaHjol(i, 0);
    });

    if (opinn) {
      svorun.className = 'svorun rett';
      svorun.textContent = '✓ Lásinn er opinn og efri hæðin líka.';
    }
  }

  hengilas.fingrafar = fingrafar;
  window.THRAUTIR.hengilas = hengilas;
})();
