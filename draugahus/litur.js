// Litaþraut á Rafmagnstöflunni: slembilitur birtist og nemandinn stillir rauða, græna og bláa
// ljósið (0–255) svo hans litur verði eins. Rammi litareitsins færist frá rauðu yfir í grænt
// eftir því hve nálægt hann er, og mælir með nál sýnir það líka.
(function () {
  'use strict';
  window.THRAUTIR = window.THRAUTIR || {};

  var RASIR = [
    { k: 'r', heiti: 'Rautt', litur: '#e5484d' },
    { k: 'g', heiti: 'Grænt', litur: '#46a758' },
    { k: 'b', heiti: 'Blátt', litur: '#3e63dd' }
  ];

  function slembi() { return 30 + Math.floor(Math.random() * 196); }
  function rgb(c) { return 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')'; }

  window.THRAUTIR.litur = function (r, kassi, api) {
    var el = api.el;
    var SKEKKJA = r.thraut.skekkja || 20;
    var markmid, minn, buid = false, sidastaFjarlaegd = null;

    var markReitur = el('div', { 'class': 'lita-reitur' });
    var minnReitur = el('div', { 'class': 'lita-reitur' });
    var minnRammi = el('div', { 'class': 'lita-rammi' }, [minnReitur]);
    var nal = el('div', { 'class': 'maelir-nal' });
    var stefna = el('span', { 'class': 'lita-stefna', 'aria-live': 'polite' });
    var maelir = el('div', { 'class': 'maelir', role: 'meter', 'aria-label': 'Nálægð', 'aria-valuemin': '0', 'aria-valuemax': '100' }, [
      el('div', { 'class': 'maelir-skali' }), nal, el('span', { 'class': 'maelir-texti', text: 'NÁLÆGÐ' })
    ]);
    var sledar = {};
    var gildi = {};
    var svorun = el('p', { 'class': 'svorun', 'aria-live': 'polite' });

    var stjorn = el('div', { 'class': 'lita-sledar thraut-svaedi' }, RASIR.map(function (rs) {
      var inn = el('input', { type: 'range', min: '0', max: '255', step: '1', 'aria-label': rs.heiti, 'data-fokus': rs.k === 'r' ? '' : null });
      var tala = el('output', { 'class': 'lita-tala' });
      sledar[rs.k] = inn;
      gildi[rs.k] = tala;
      inn.addEventListener('input', function () { minn[rs.k] = +inn.value; uppfaera(); });
      inn.addEventListener('change', athuga);
      return el('label', { 'class': 'lita-sledi', style: '--rasarlitur:' + rs.litur }, [el('span', { text: rs.heiti }), inn, tala]);
    }));

    kassi.appendChild(el('div', { 'class': 'litathraut' }, [
      el('div', { 'class': 'tafla' }, [
        el('figure', {}, [el('div', { 'class': 'lita-rammi fastur' }, [markReitur]), el('figcaption', { text: 'Liturinn' })]),
        el('div', { 'class': 'tafla-midja' }, [maelir, stefna]),
        el('figure', {}, [minnRammi, el('figcaption', { text: 'Ykkar litur' })])
      ]),
      stjorn,
      svorun
    ]));

    function nyrLitur() {
      markmid = { r: slembi(), g: slembi(), b: slembi() };
      minn = { r: 128, g: 128, b: 128 };
      // Byrja ekki of nálægt réttum lit
      if (fjarlaegd() < 80) return nyrLitur();
      RASIR.forEach(function (rs) { sledar[rs.k].value = minn[rs.k]; });
      markReitur.style.background = rgb(markmid);
      sidastaFjarlaegd = null;
      buid = false;
      uppfaera();
    }

    function fjarlaegd() {
      return Math.sqrt(Math.pow(minn.r - markmid.r, 2) + Math.pow(minn.g - markmid.g, 2) + Math.pow(minn.b - markmid.b, 2));
    }

    function uppfaera() {
      minnReitur.style.background = rgb(minn);
      RASIR.forEach(function (rs) {
        gildi[rs.k].textContent = String(minn[rs.k]);
        // Sleðinn sýnir hvaða litir fást með því að breyta þessum lit einum
        var fra = { r: minn.r, g: minn.g, b: minn.b }, til = { r: minn.r, g: minn.g, b: minn.b };
        fra[rs.k] = 0; til[rs.k] = 255;
        sledar[rs.k].style.background = 'linear-gradient(90deg,' + rgb(fra) + ',' + rgb(til) + ')';
      });
      var d = fjarlaegd();
      // 0 = langt frá (150 eða meira), 1 = innan skekkjunnar
      var nalaegd = Math.max(0, Math.min(1, (150 - d) / (150 - SKEKKJA)));
      var hue = Math.round(nalaegd * 125);                     // 0 = rautt, 125 = grænt
      minnRammi.style.setProperty('--rammi', 'hsl(' + hue + ' 75% 50%)');
      nal.style.transform = 'rotate(' + (-60 + nalaegd * 120) + 'deg)';
      maelir.setAttribute('aria-valuenow', String(Math.round(nalaegd * 100)));
      if (sidastaFjarlaegd != null && Math.abs(d - sidastaFjarlaegd) >= 1) {
        stefna.textContent = d < sidastaFjarlaegd ? '▲ Nær' : '▼ Fjær';
        stefna.className = 'lita-stefna ' + (d < sidastaFjarlaegd ? 'naer' : 'fjaer');
      }
      sidastaFjarlaegd = d;
    }

    function athuga() {
      if (buid || fjarlaegd() > SKEKKJA) return;
      buid = true;
      minnRammi.classList.add('rett');
      stefna.textContent = '';
      svorun.className = 'svorun rett';
      svorun.textContent = 'Liturinn passar! Rafmagnstaflan suðar og ljósin loga.';
      if (!api.leyst) setTimeout(api.leysa, 1200);
      else {
        var takki = el('button', { type: 'button', text: 'Nýr litur', onclick: function () { takki.remove(); minnRammi.classList.remove('rett'); svorun.textContent = ''; nyrLitur(); } });
        svorun.after(takki);
      }
    }

    nyrLitur();
    if (api.leyst) {
      svorun.className = 'svorun rett';
      svorun.textContent = '✓ Rafmagnstaflan er leyst. Hér er nýr litur til gamans.';
    }
  };
})();
