// Skeiðklukka í Melum: ræsa og stöðva eftir nákvæmlega `markmid` sekúndur án þess að sjá
// tímann. Takist það ekki má fá svindlkóða hjá kennara. Kóðinn er geymdur sem fingrafar
// (sama aðferð og í hengilas.js).
(function () {
  'use strict';
  window.THRAUTIR = window.THRAUTIR || {};

  function snid(t) { return t.toFixed(2).replace('.', ','); }

  window.THRAUTIR.skeidklukka = function (r, kassi, api) {
    var el = api.el;
    var th = r.thraut;
    var MARKMID = th.markmid || 10;
    var SKEKKJA = th.skekkja == null ? 0.005 : th.skekkja;
    var byrjun = null, besta = null, tilraunir = 0, buid = !!api.leyst;

    var skjar = el('div', { 'class': 'klukka-skjar', 'aria-live': 'polite', text: snid(0) });
    var hringur = el('div', { 'class': 'klukka-hringur' });
    var takki = el('button', { type: 'button', 'class': 'klukka-takki', 'data-fokus': '', text: 'Ræsa' });
    var klukka = el('div', { 'class': 'klukka' }, [
      el('div', { 'class': 'klukka-krona' }),
      el('div', { 'class': 'klukka-skifa' }, [hringur, skjar, takki])
    ]);
    var nidurstada = el('p', { 'class': 'svorun', 'aria-live': 'polite' });
    var bestaEl = el('p', { 'class': 'klukka-besta' });

    var kodi = el('input', { type: 'text', autocomplete: 'off', 'aria-label': 'Svindlkóði', placeholder: 'Svindlkóði' });
    var kodaSvorun = el('p', { 'class': 'svorun', 'aria-live': 'polite' });
    var kodaForm = el('form', { 'class': 'svar', onsubmit: function (e) {
      e.preventDefault();
      if (buid) return;
      var reyna = kodi.value.trim().toUpperCase();
      if (reyna && window.THRAUTIR.hengilas.fingrafar(reyna) === th.svindlkodi) {
        kodaSvorun.className = 'svorun rett';
        kodaSvorun.textContent = 'Kóðinn virkar!';
        klara();
      } else {
        kodaSvorun.className = 'svorun rangt';
        kodaSvorun.textContent = 'Þessi kóði virkar ekki.';
      }
    } }, [kodi, el('button', { type: 'submit', text: 'Nota kóða' })]);

    kassi.appendChild(el('div', { 'class': 'skeidklukka' }, [
      klukka, nidurstada, bestaEl,
      el('div', { 'class': 'svindl thraut-svaedi' }, [
        th.aminning ? el('p', { 'class': 'aminning', text: th.aminning }) : null,
        kodaForm, kodaSvorun
      ])
    ]));

    function klara() {
      buid = true;
      takki.disabled = true;
      klukka.classList.add('nad');
      if (!api.leyst) setTimeout(api.leysa, 1100);
    }

    takki.addEventListener('click', function () {
      if (buid && !api.leyst) return;
      if (byrjun == null) {
        byrjun = performance.now();
        takki.textContent = 'Stöðva';
        skjar.textContent = '?,??';
        klukka.classList.add('gengur');
        klukka.classList.remove('nad');
        nidurstada.textContent = '';
        return;
      }
      var t = (performance.now() - byrjun) / 1000;
      byrjun = null;
      tilraunir++;
      klukka.classList.remove('gengur');
      takki.textContent = 'Reyna aftur';
      skjar.textContent = snid(t);
      var fra = Math.abs(t - MARKMID);
      if (besta == null || fra < Math.abs(besta - MARKMID)) besta = t;
      bestaEl.textContent = 'Tilraunir: ' + tilraunir + ' · Besta: ' + snid(besta) + ' s (' + snid(Math.abs(besta - MARKMID)) + ' s frá)';
      if (fra < SKEKKJA) {
        nidurstada.className = 'svorun rett';
        nidurstada.textContent = 'Nákvæmlega ' + snid(MARKMID) + ' sekúndur! Ótrúlegt!';
        klukka.classList.add('nad');
        if (!api.leyst) klara();
        return;
      }
      nidurstada.className = 'svorun rangt';
      nidurstada.textContent = snid(t) + ' sekúndur, ' + snid(fra) + ' s of ' + (t < MARKMID ? 'stutt' : 'langt') + '.';
    });

    if (api.leyst) {
      nidurstada.className = 'svorun rett';
      nidurstada.textContent = '✓ Melar eru leystir. Þú mátt samt reyna aftur til gamans.';
      buid = false;
    }
  };
})();
