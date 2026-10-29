// Myndagáta í Mýri: mynd birtist í slembibútum á meðan teljari telur niður.
// Skrifa þarf nafn borgarinnar áður en tíminn rennur út, annars kemur önnur mynd.
// Hástafir, broddar og bil skipta ekki máli (París = paris = PARIS).
(function () {
  'use strict';
  window.THRAUTIR = window.THRAUTIR || {};

  function hreinsa(s) {
    return String(s).toLowerCase()
      .replace(/ð/g, 'd').replace(/þ/g, 'th').replace(/æ/g, 'ae')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]/g, '');
  }
  function stokka(listi) {
    var a = listi.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  window.THRAUTIR.myndagata = function (r, kassi, api) {
    var el = api.el;
    var th = r.thraut;
    var TIMI = th.timi || 10;
    var D = th.dalkar || 6, R = th.radir || 4;
    var nr = -1, mynd, byrjun = null, rod = [], synt = 0, rammi = null, buid = false;

    var img = el('img', { alt: 'Póstkort sem birtist í bútum' });
    var hula = el('div', { 'class': 'gata-hula' });
    var spjald = el('div', { 'class': 'gata-spjald' }, [img, hula]);
    var tala = el('b', { 'class': 'gata-tala', text: String(TIMI) });
    var teljari = el('div', { 'class': 'gata-teljari', 'aria-live': 'off' }, [tala, el('span', { text: 'sek.' })]);
    var inn = el('input', { type: 'text', autocomplete: 'off', 'aria-label': 'Nafn borgarinnar', placeholder: 'Hvaða borg er þetta?', disabled: '' });
    var byrjaTakki = el('button', { type: 'button', 'class': 'adal', text: 'Byrja', 'data-fokus': '' });
    var form = el('form', { 'class': 'svar' }, [inn, el('button', { type: 'submit', 'class': 'adal', text: 'Svara' })]);
    var svorun = el('p', { 'class': 'svorun', 'aria-live': 'polite' });

    kassi.appendChild(el('div', { 'class': 'myndagata' }, [
      el('div', { 'class': 'gata-svid' }, [spjald, teljari]),
      el('div', { 'class': 'gata-stjorn thraut-svaedi' }, [byrjaTakki, form]),
      svorun
    ]));

    function nyMynd() {
      var val = [];
      th.myndir.forEach(function (m, i) { if (i !== nr) val.push(i); });
      nr = val[Math.floor(Math.random() * val.length)];
      mynd = th.myndir[nr];
      img.src = mynd.mynd;
      spjald.style.aspectRatio = (mynd.breidd || 3) + ' / ' + (mynd.haed || 2);
      hula.textContent = '';
      hula.style.gridTemplateColumns = 'repeat(' + D + ', 1fr)';
      for (var i = 0; i < D * R; i++) hula.appendChild(el('span', { 'class': 'gata-butur' }));
      rod = stokka(Array.from({ length: D * R }, function (_, i) { return i; }));
      synt = 0;
      tala.textContent = String(TIMI);
      teljari.style.setProperty('--hlutfall', 1);
      teljari.classList.remove('naestum', 'uti');
    }

    function byrja() {
      byrjaTakki.hidden = true;
      form.hidden = false;
      inn.disabled = false;
      inn.value = '';
      inn.focus();
      svorun.className = 'svorun';
      svorun.textContent = '';
      byrjun = performance.now();
      rammi = requestAnimationFrame(tikk);
    }

    // Bútarnir birtast jafnt og þétt svo síðasti kemur rétt áður en tíminn rennur út
    function tikk(nu) {
      if (!kassi.isConnected) return;
      var lidid = (nu - byrjun) / 1000;
      var eftir = Math.max(0, TIMI - lidid);
      var aEftir = Math.min(rod.length, Math.floor(lidid / (TIMI * 0.95) * rod.length) + 1);
      while (synt < aEftir) hula.children[rod[synt++]].classList.add('synt');
      tala.textContent = String(Math.ceil(eftir));
      teljari.style.setProperty('--hlutfall', eftir / TIMI);
      teljari.classList.toggle('naestum', eftir <= 3);
      if (eftir <= 0) return ofSeint();
      rammi = requestAnimationFrame(tikk);
    }

    function stoppa() {
      if (rammi) cancelAnimationFrame(rammi);
      rammi = null;
      byrjun = null;
    }

    function ofSeint() {
      stoppa();
      inn.disabled = true;
      teljari.classList.add('uti');
      svorun.className = 'svorun rangt';
      svorun.textContent = 'Of seint! Þokan leggst aftur yfir…';
      setTimeout(function () {
        if (!kassi.isConnected || buid) return;
        nyMynd();
        form.hidden = true;
        byrjaTakki.hidden = false;
        byrjaTakki.textContent = 'Reyna við nýja mynd';
        byrjaTakki.focus();
        svorun.textContent = 'Of seint! Hér er nýtt póstkort.';
      }, 1500);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (byrjun == null || buid) return;
      var svar = hreinsa(inn.value);
      if (!svar) return;
      if (mynd.svor.some(function (s) { return hreinsa(s) === svar; })) {
        stoppa();
        buid = !api.leyst;
        Array.prototype.forEach.call(hula.children, function (b) { b.classList.add('synt'); });
        svorun.className = 'svorun rett';
        svorun.textContent = 'Rétt! Þetta er ' + mynd.svor[0] + '.';
        inn.disabled = true;
        if (!api.leyst) setTimeout(api.leysa, 1200);
        else setTimeout(function () { nyMynd(); form.hidden = true; byrjaTakki.hidden = false; byrjaTakki.textContent = 'Önnur mynd'; }, 1800);
        return;
      }
      svorun.className = 'svorun rangt';
      svorun.textContent = 'Nei, ekki ' + inn.value.trim() + '. Haltu áfram!';
      inn.select();
      form.classList.remove('hristast');
      void form.offsetWidth;
      form.classList.add('hristast');
    });

    byrjaTakki.addEventListener('click', byrja);
    api.dialog.addEventListener('close', stoppa, { once: true });

    form.hidden = true;
    nyMynd();
    if (api.leyst) {
      svorun.className = 'svorun rett';
      svorun.textContent = '✓ Mýri er leyst. Þú mátt samt spreyta þig á fleiri póstkortum.';
    }
  };
})();
