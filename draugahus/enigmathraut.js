// Dulmálsvélin í Hátúni: nemendur líma inn dulmál og vélin (enigma.js) skilar textanum.
// Stafirnir birtast einn af öðrum og snúðagluggarnir snúast með, eins og á alvöru vél.
// Þegar textinn passar við lausnina (fingrafar) er herbergið leyst.
(function () {
  'use strict';
  window.THRAUTIR = window.THRAUTIR || {};

  window.THRAUTIR.enigma = function (r, kassi, api) {
    var el = api.el;
    var th = r.thraut;
    var stilling = th.stilling || {};
    var upphaf = (stilling.stada || 'AAA').split('');
    var keyrsla = null;

    var gluggar = upphaf.map(function (c) { return el('span', { 'class': 'snudur', text: c }); });
    var lampar = el('div', { 'class': 'lampar', 'aria-hidden': 'true' });
    'QWERTZUIO ASDFGHJK PYXCVBNML'.split(' ').forEach(function (rod) {
      lampar.appendChild(el('div', {}, rod.split('').map(function (c) { return el('span', { 'data-s': c, text: c }); })));
    });
    var inn = el('textarea', { 'class': 'dulmal-inn', rows: '4', spellcheck: 'false', autocomplete: 'off', 'aria-label': 'Dulmál', placeholder: 'Límið dulmálið hér, t.d. ABCDE FGHIJ…', 'data-fokus': '' });
    var takki = el('button', { type: 'submit', 'class': 'adal', text: 'Afkóða' });
    var ut = el('output', { 'class': 'dulmal-ut', 'aria-live': 'off' });
    var svorun = el('p', { 'class': 'svorun', 'aria-live': 'polite' });

    // Eftir að textinn er fundinn: skilaboð og reitur fyrir kóðann frá kennaranum
    var kodi = el('input', { type: 'text', inputmode: 'numeric', autocomplete: 'off', 'aria-label': 'Kóði frá kennara', placeholder: 'Kóði' });
    var kodaSvorun = el('p', { 'class': 'svorun', 'aria-live': 'polite' });
    var kodaKassi = el('div', { 'class': 'svindl thraut-svaedi', hidden: '' }, [
      el('p', { 'class': 'aminning', text: th.eftir || '' }),
      el('form', { 'class': 'svar', onsubmit: function (e) {
        e.preventDefault();
        var reyna = kodi.value.trim().toUpperCase();
        if (reyna && window.THRAUTIR.hengilas.fingrafar(reyna) === th.kodi) {
          kodaSvorun.className = 'svorun rett';
          kodaSvorun.textContent = 'Kóðinn passar!';
          if (!api.leyst) setTimeout(api.leysa, 900);
        } else {
          kodaSvorun.className = 'svorun rangt';
          kodaSvorun.textContent = 'Þessi kóði opnar ekki kjallarann.';
        }
      } }, [kodi, el('button', { type: 'submit', 'class': 'adal', text: 'Opna' })]),
      kodaSvorun
    ]);

    // Kóðakassinn er efst svo nemendur missi ekki af honum
    kassi.appendChild(el('div', { 'class': 'enigma' }, [
      kodaKassi,
      el('div', { 'class': 'enigma-vel' }, [
        el('div', { 'class': 'enigma-haus' }, [
          el('b', { text: 'ENIGMA' }),
          el('div', { 'class': 'snudagluggar', 'aria-label': 'Staða snúða' }, gluggar)
        ]),
        lampar
      ]),
      el('form', { 'class': 'enigma-form thraut-svaedi', onsubmit: afkoda }, [
        el('label', { 'class': 'enigma-merki', text: 'ENIGMA – límið kóðann hér inn' }),
        inn,
        el('div', { 'class': 'takkar' }, [takki])
      ]),
      ut, svorun
    ]));

    function afkoda(e) {
      e.preventDefault();
      var dulmal = inn.value.toUpperCase().replace(/[^A-Z]/g, '');
      if (!dulmal) {
        svorun.className = 'svorun rangt';
        svorun.textContent = 'Límið fyrst dulmálið inn í reitinn.';
        return;
      }
      var texti = window.ENIGMA.dulkoda(dulmal, stilling);
      // Staða snúðanna eftir hvern staf, til að sýna þá snúast
      var stodur = [];
      for (var k = 1; k <= dulmal.length; k++) {
        stodur.push(stadaEftir(dulmal.slice(0, k)));
      }
      birta(texti, stodur);
    }

    // Finnur stöðu snúðanna eftir n stafi með því að keyra vélina á A-stöfum
    function stadaEftir(hluti) {
      var stada = upphaf.map(function (c) { return c.charCodeAt(0) - 65; });
      var hak = { I: 16, II: 4, III: 21, IV: 9, V: 25 };
      var nofn = stilling.snudar || ['I', 'II', 'III'];
      for (var i = 0; i < hluti.length; i++) {
        if (stada[1] === hak[nofn[1]]) { stada[0] = (stada[0] + 1) % 26; stada[1] = (stada[1] + 1) % 26; }
        else if (stada[2] === hak[nofn[2]]) stada[1] = (stada[1] + 1) % 26;
        stada[2] = (stada[2] + 1) % 26;
      }
      return stada.map(function (n) { return String.fromCharCode(65 + n); });
    }

    function birta(texti, stodur) {
      if (keyrsla) clearInterval(keyrsla);
      ut.textContent = '';
      svorun.className = 'svorun';
      svorun.textContent = '';
      takki.disabled = true;
      var i = 0;
      var hradi = Math.max(8, Math.min(40, 4000 / texti.length));
      keyrsla = setInterval(function () {
        if (!kassi.isConnected) return clearInterval(keyrsla);
        var gamall = lampar.querySelector('.lysir');
        if (gamall) gamall.classList.remove('lysir');
        if (i >= texti.length) {
          clearInterval(keyrsla);
          keyrsla = null;
          takki.disabled = false;
          return lokid(texti);
        }
        ut.textContent += texti[i];
        if (i === 0) ut.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        stodur[i].forEach(function (c, k) { gluggar[k].textContent = c; });
        var lampi = lampar.querySelector('[data-s="' + texti[i] + '"]');
        if (lampi) lampi.classList.add('lysir');
        i++;
      }, hradi);
    }

    function lokid(texti) {
      upphaf.forEach(function (c, k) { gluggar[k].textContent = c; });
      if (window.THRAUTIR.hengilas.fingrafar(texti) === th.lausn) {
        svorun.className = 'svorun rett';
        svorun.textContent = 'Dulmálið er leyst!';
        ut.classList.add('rett');
        if (th.kodi) {
          api.vistaFramvindu(1);
          if (!api.leyst) synaKoda();
        } else if (!api.leyst) setTimeout(api.leysa, 1200);
      } else {
        svorun.className = 'svorun rangt';
        svorun.textContent = 'Þetta lítur ekki út eins og rétti textinn. Athugið hvort dulmálið sé rétt inn slegið.';
      }
    }

    function synaKoda() {
      kodaKassi.hidden = false;
      kodi.focus({ preventScroll: true });
      kodaKassi.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    api.dialog.addEventListener('close', function () { if (keyrsla) clearInterval(keyrsla); }, { once: true });
    // Textinn var fundinn í fyrri heimsókn: sýna kóðareitinn strax
    if (!api.leyst && th.kodi && api.framvinda() >= 1) {
      svorun.className = 'svorun rett';
      svorun.textContent = 'Þið hafið þegar afkóðað söguna.';
      synaKoda();
    }
    if (api.leyst) {
      svorun.className = 'svorun rett';
      svorun.textContent = '✓ Hátún er leyst. Vélin virkar áfram, bæði til að dulkóða og afkóða.';
    }
  };
})();
