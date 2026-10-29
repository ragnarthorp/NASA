// Orðla (Wordle) í Sandvík: giskað á leyniorð. Grænn stafur er á réttum stað,
// gulur er í orðinu en á öðrum stað og dökkur er ekki í orðinu.
// Ef tilraunirnar klárast kemur nýtt orð úr listanum.
(function () {
  'use strict';
  window.THRAUTIR = window.THRAUTIR || {};

  var STAFIR = 'AÁBDÐEÉFGHIÍJKLMNOÓPQRSTUÚVWXYÝZÞÆÖ';
  var LYKLAROD = [
    'QWERTYUIOPÐ'.split(''),
    'ASDFGHJKLÆ'.split(''),
    'ÁÉÍÓÚÝÖ'.split(''),
    ['ENTER'].concat('ZXCVBNMÞ'.split(''), ['⌫'])
  ];
  var RODUN = { rett: 3, til: 2, ekki: 1 };

  // Litar ágiskun eins og í Wordle, með réttri meðferð á tvöföldum stöfum
  function meta(gisk, ord) {
    var nidurstada = gisk.map(function () { return 'ekki'; });
    var eftir = {};
    ord.forEach(function (s, i) {
      if (gisk[i] === s) nidurstada[i] = 'rett';
      else eftir[s] = (eftir[s] || 0) + 1;
    });
    gisk.forEach(function (s, i) {
      if (nidurstada[i] !== 'rett' && eftir[s]) { nidurstada[i] = 'til'; eftir[s]--; }
    });
    return nidurstada;
  }

  window.THRAUTIR.ordla = function (r, kassi, api) {
    var el = api.el;
    var th = r.thraut;
    var TILRAUNIR = th.tilraunir || 6;
    var ord, rodir, nuna, lyklar, buid, upptekid, sidastaOrd = null;

    var bord = el('div', { 'class': 'ordla-bord', role: 'grid', 'aria-label': 'Ágiskanir', tabindex: '-1', 'data-fokus': '' });
    var lyklabord = el('div', { 'class': 'ordla-lyklar', 'aria-label': 'Lyklaborð' });
    var svorun = el('p', { 'class': 'svorun', 'aria-live': 'polite' });
    var nyttTakki = el('button', { type: 'button', 'class': 'adal', text: 'Nýtt orð', hidden: '', onclick: function () { nyttOrd(); } });

    kassi.appendChild(el('div', { 'class': 'ordla' }, [
      el('p', { 'class': 'leidbeining thraut-svaedi', text: 'Skrifið orð og ýtið á Enter. Grænn stafur er á réttum stað, gulur er í orðinu en á öðrum stað og dökkur er ekki í orðinu.' }),
      bord, svorun, nyttTakki,
      el('div', { 'class': 'thraut-svaedi' }, [lyklabord])
    ]));

    function nyttOrd() {
      var val = th.ord.filter(function (o) { return o !== sidastaOrd; });
      sidastaOrd = val[Math.floor(Math.random() * val.length)];
      ord = sidastaOrd.toUpperCase().split('');
      rodir = [];
      nuna = [];
      lyklar = {};
      buid = false;
      upptekid = false;
      nyttTakki.hidden = true;
      svorun.className = 'svorun';
      svorun.textContent = ord.length + ' stafa orð. Gangi ykkur vel!';
      teiknaBord();
      teiknaLykla();
    }

    function teiknaBord() {
      bord.textContent = '';
      bord.style.setProperty('--lengd', ord.length);
      for (var i = 0; i < TILRAUNIR; i++) {
        var rod = rodir[i];
        var stafir = rod ? rod.gisk : i === rodir.length ? nuna : [];
        var rodEl = el('div', { 'class': 'ordla-rod' + (i === rodir.length && !buid ? ' virk' : ''), role: 'row' });
        for (var j = 0; j < ord.length; j++) {
          rodEl.appendChild(el('div', {
            'class': 'ordla-reitur' + (stafir[j] ? ' fylltur' : '') + (rod ? ' ' + rod.mat[j] : ''),
            role: 'gridcell',
            style: rod && rod.ny ? 'animation-delay:' + (j * 0.18) + 's' : null,
            text: stafir[j] || ''
          }));
        }
        bord.appendChild(rodEl);
      }
      rodir.forEach(function (x) { x.ny = false; });
    }

    function teiknaLykla() {
      lyklabord.textContent = '';
      LYKLAROD.forEach(function (rod) {
        lyklabord.appendChild(el('div', { 'class': 'ordla-lyklarod' }, rod.map(function (k) {
          return el('button', {
            type: 'button',
            'class': 'lykill ' + (lyklar[k] || '') + (k.length > 1 ? ' breidur' : ''),
            'aria-label': k === '⌫' ? 'Eyða' : k === 'ENTER' ? 'Giska' : k,
            text: k === 'ENTER' ? 'Giska' : k,
            onclick: function () { innslattur(k); }
          });
        })));
      });
    }

    function hrista(texti) {
      svorun.className = 'svorun rangt';
      svorun.textContent = texti;
      var rodEl = bord.children[rodir.length];
      if (!rodEl) return;
      rodEl.classList.remove('hristast');
      void rodEl.offsetWidth;
      rodEl.classList.add('hristast');
    }

    function innslattur(k) {
      if (buid || upptekid) return;
      if (k === '⌫') { nuna.pop(); return teiknaBord(); }
      if (k === 'ENTER') return giska();
      if (nuna.length < ord.length && STAFIR.indexOf(k) >= 0) { nuna.push(k); teiknaBord(); }
    }

    function giska() {
      if (nuna.length < ord.length) return hrista('Orðið þarf að vera ' + ord.length + ' stafir.');
      var mat = meta(nuna, ord);
      rodir.push({ gisk: nuna, mat: mat, ny: true });
      nuna.forEach(function (s, i) {
        if ((RODUN[mat[i]] || 0) > (RODUN[lyklar[s]] || 0)) lyklar[s] = mat[i];
      });
      var rett = mat.every(function (m) { return m === 'rett'; });
      nuna = [];
      upptekid = true;
      svorun.className = 'svorun';
      svorun.textContent = '';
      teiknaBord();
      // Bíða eftir að flísarnar snúist áður en lyklaborð og niðurstaða birtast
      setTimeout(function () {
        upptekid = false;
        teiknaLykla();
        if (rett) {
          buid = true;
          teiknaBord();
          if (api.leyst) {
            svorun.className = 'svorun rett';
            svorun.textContent = '✓ Rétt! Orðið var ' + ord.join('') + '.';
            nyttTakki.hidden = false;
          } else {
            setTimeout(api.leysa, 500);
          }
        } else if (rodir.length >= TILRAUNIR) {
          buid = true;
          teiknaBord();
          svorun.className = 'svorun rangt';
          svorun.textContent = 'Tilraunirnar kláruðust. Orðið var ' + ord.join('') + '. Reynið við nýtt orð!';
          nyttTakki.hidden = false;
          nyttTakki.focus();
        }
      }, ord.length * 180 + 450);
    }

    // Lyklaborð tölvunnar
    function aLyklabord(e) {
      if (!kassi.isConnected || e.ctrlKey || e.metaKey || e.altKey) return;
      // Enter á öðrum hnöppum (t.d. „Nýtt orð“) fær að virka eðlilega, en ekki á lyklum skjályklaborðsins
      if (e.key === 'Enter' && e.target && e.target.tagName === 'BUTTON' && !e.target.classList.contains('lykill')) return;
      var k = e.key === 'Backspace' ? '⌫' : e.key === 'Enter' ? 'ENTER' : e.key.length === 1 ? e.key.toUpperCase() : null;
      if (!k) return;
      if (k === '⌫' || k === 'ENTER' || STAFIR.indexOf(k) >= 0) { e.preventDefault(); innslattur(k); }
    }
    document.addEventListener('keydown', aLyklabord);
    api.dialog.addEventListener('close', function () { document.removeEventListener('keydown', aLyklabord); }, { once: true });

    nyttOrd();
    if (api.leyst) {
      svorun.className = 'svorun rett';
      svorun.textContent = '✓ Þið hafið leyst Sandvík. Hér er nýtt orð til gamans.';
    }
  };
})();
