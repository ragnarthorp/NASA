// Ferjuþrautin í Kyndiklefanum: úlfurinn, lambið og heyið.
// Draugurinn rær og báturinn ber hann og eitt annað. Ef úlfur og lamb, eða lamb og hey,
// eru skilin eftir á bakka án draugsins er eitthvað étið og byrja þarf upp á nýtt.
(function () {
  'use strict';
  window.THRAUTIR = window.THRAUTIR || {};

  var HLUTIR = [
    { id: 'ulfur', heiti: 'Úlfurinn', merki: '🐺' },
    { id: 'lamb', heiti: 'Lambið', merki: '🐑' },
    { id: 'hey', heiti: 'Heyið', merki: '🌾' }
  ];
  var AT = [['ulfur', 'lamb', 'Úlfurinn át lambið!'], ['lamb', 'hey', 'Lambið át heyið!']];

  window.THRAUTIR.ferja = function (r, kassi, api) {
    var el = api.el;
    var hvar, batur, farthegi, ferdir, buid, roir;

    var vinstri = el('div', { 'class': 'ferja-bakki vinstri', 'aria-label': 'Þessi bakki' });
    var haegri = el('div', { 'class': 'ferja-bakki haegri', 'aria-label': 'Hinn bakkinn' });
    var batSaeti = el('div', { 'class': 'bat-saeti' });
    var batEl = el('div', { 'class': 'bat' }, [el('span', { 'class': 'ferjumadur', text: '👻', title: 'Draugurinn' }), batSaeti]);
    var a = el('div', { 'class': 'ferja-a' }, [batEl]);
    var roa = el('button', { type: 'button', 'class': 'adal', text: 'Róa yfir', 'data-fokus': '' });
    var ferdirEl = el('span', { 'class': 'ferja-ferdir' });
    var svorun = el('p', { 'class': 'svorun', 'aria-live': 'polite' });
    var aftur = el('button', { type: 'button', text: 'Byrja aftur', hidden: '' });

    kassi.appendChild(el('div', { 'class': 'ferja' }, [
      el('div', { 'class': 'ferja-svid' }, [vinstri, a, haegri]),
      el('div', { 'class': 'ferja-stjorn thraut-svaedi' }, [roa, aftur, ferdirEl]),
      el('p', { 'class': 'leidbeining thraut-svaedi', text: 'Smellið á dýr eða hey á sama bakka og báturinn til að setja það um borð. Smellið svo á „Róa yfir“. Það sem er í bátnum fer sjálfkrafa í land hinum megin. Draugurinn má líka róa einn.' }),
      svorun
    ]));

    function nyrLeikur() {
      hvar = { ulfur: 'v', lamb: 'v', hey: 'v' };
      batur = 'v';
      farthegi = null;
      ferdir = 0;
      buid = false;
      roir = false;
      aftur.hidden = true;
      roa.disabled = false;
      svorun.className = 'svorun';
      svorun.textContent = '';
      teikna();
    }

    function hlutur(h, ibat) {
      return el('button', {
        type: 'button', 'class': 'ferja-hlutur' + (ibat ? ' ibat' : ''), 'data-id': h.id,
        'aria-label': h.heiti + (ibat ? ' (í bátnum)' : ''),
        disabled: buid || roir || (!ibat && (hvar[h.id] !== batur || farthegi)) ? '' : null,
        onclick: function () { smella(h.id); }
      }, [el('span', { 'class': 'merki', text: h.merki }), el('small', { text: h.heiti })]);
    }

    function teikna() {
      vinstri.textContent = '';
      haegri.textContent = '';
      batSaeti.textContent = '';
      HLUTIR.forEach(function (h) {
        if (farthegi === h.id) batSaeti.appendChild(hlutur(h, true));
        else (hvar[h.id] === 'v' ? vinstri : haegri).appendChild(hlutur(h, false));
      });
      a.classList.toggle('haegri', batur === 'h');
      ferdirEl.textContent = 'Ferðir: ' + ferdir;
    }

    function smella(id) {
      if (buid || roir) return;
      if (farthegi === id) farthegi = null;
      else if (!farthegi && hvar[id] === batur) farthegi = id;
      svorun.textContent = '';
      teikna();
    }

    function roaYfir() {
      if (buid || roir) return;
      roir = true;
      roa.disabled = true;
      var fra = batur;
      batur = batur === 'v' ? 'h' : 'v';
      if (farthegi) hvar[farthegi] = batur;
      ferdir++;
      teikna();
      // Athuga bakkann sem draugurinn fór frá
      var eftir = HLUTIR.filter(function (h) { return hvar[h.id] === fra && farthegi !== h.id; }).map(function (h) { return h.id; });
      var etid = AT.filter(function (x) { return eftir.indexOf(x[0]) >= 0 && eftir.indexOf(x[1]) >= 0; })[0];
      setTimeout(function () {
        if (!kassi.isConnected) return;
        roir = false;
        if (etid) return etidUpp(etid, fra);
        // Farþeginn fer sjálfkrafa í land þegar komið er yfir
        farthegi = null;
        roa.disabled = false;
        teikna();
        if (HLUTIR.every(function (h) { return hvar[h.id] === 'h'; })) sigur();
      }, 900);
    }

    function etidUpp(etid, bakki) {
      buid = true;
      teikna();
      var bakkaEl = bakki === 'v' ? vinstri : haegri;
      var bradin = bakkaEl.querySelector('[data-id="' + etid[1] + '"]');
      if (bradin) bradin.classList.add('etid');
      bakkaEl.classList.add('hristast');
      svorun.className = 'svorun rangt';
      svorun.textContent = etid[2] + ' Draugurinn mátti ekki skilja þau eftir saman.';
      aftur.hidden = false;
      aftur.focus();
    }

    function sigur() {
      buid = true;
      roa.disabled = true;
      teikna();
      svorun.className = 'svorun rett';
      svorun.textContent = 'Allt komst heilt yfir á ' + ferdir + ' ferðum!' + (ferdir === 7 ? ' Fullkomið, færri ferðir duga ekki.' : '');
      if (!api.leyst) setTimeout(api.leysa, 1300);
      else { aftur.hidden = false; aftur.textContent = 'Spila aftur'; }
    }

    roa.addEventListener('click', roaYfir);
    aftur.addEventListener('click', function () { aftur.textContent = 'Byrja aftur'; nyrLeikur(); roa.focus(); });

    nyrLeikur();
    if (api.leyst) {
      svorun.className = 'svorun rett';
      svorun.textContent = '✓ Kyndiklefinn er leystur. Þið megið samt ferja aftur til gamans.';
    }
  };
})();
