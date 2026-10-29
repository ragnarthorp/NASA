// Skotleikur í Salnum: nöfn falla niður og bogmaðurinn vinstra megin skýtur örvum
// þvert á fallið. Rétt nafn lækkar teljarann um einn, rangt nafn hækkar hann um einn,
// og eftir of mörg röng skot byrjar leikurinn upp á nýtt. Teljari í 0 leysir þrautina.
(function () {
  'use strict';
  window.THRAUTIR = window.THRAUTIR || {};

  var LETUR = 'Cinzel, Georgia, "Times New Roman", serif';
  var GULL = '#f2c46b';
  var RAUTT = '#e2725b';

  function slembi(a, b) { return a + Math.random() * (b - a); }
  function velja(listi) { return listi[Math.floor(Math.random() * listi.length)]; }

  window.THRAUTIR.skotleikur = function (r, kassi, api) {
    var el = api.el;
    var th = r.thraut;
    var BYRJUN = th.teljari || 10;
    var LIF = th.lif || 3;

    // Viðmót: stigatafla, leikvöllur og hulu með skilaboðum
    var teljariEl = el('b', { 'class': 'tafla-tala' });
    var skildir = el('div', { 'class': 'skildir', 'aria-label': 'Röng skot' });
    var canvas = el('canvas', { 'class': 'vollur', role: 'img', 'aria-label': 'Leikvöllur: nöfn falla niður og bogi vinstra megin' });
    var hulaTitill = el('h3', {});
    var hulaTexti = el('p', {});
    var hulaTakki = el('button', { type: 'button', 'class': 'adal', 'data-fokus': '' });
    var hula = el('div', { 'class': 'hula' }, [el('div', {}, [hulaTitill, hulaTexti, hulaTakki])]);
    var vollurKassi = el('div', { 'class': 'vallar-kassi' }, [canvas, hula]);

    kassi.appendChild(el('div', { 'class': 'skotleikur' }, [
      el('div', { 'class': 'stigatafla' }, [
        el('div', { 'class': 'tafla-reitur' }, [el('span', { text: 'Teljari' }), teljariEl]),
        el('div', { 'class': 'tafla-reitur' }, [el('span', { text: 'Röng skot' }), skildir])
      ]),
      vollurKassi,
      el('p', { 'class': 'leidbeining thraut-svaedi', text: 'Færðu bogann upp og niður með músinni eða örvatökkunum. Skjóttu með smelli eða bilslá. Á snertiskjá skýtur þú þar sem þú snertir.' })
    ]));

    var ctx = canvas.getContext('2d');
    var W = 0, H = 0, dpr = 1, leturStaerd = 16;

    // Bakgrunnur: Salurinn úr myndinni af jarðhæðinni
    var bakgrunnur = new Image();
    bakgrunnur.src = r.haed.mynd;
    var xs = r.svaedi.map(function (p) { return p[0]; }), ys = r.svaedi.map(function (p) { return p[1]; });
    var bk = { x: Math.min.apply(null, xs), y: Math.min.apply(null, ys) };
    bk.w = Math.max.apply(null, xs) - bk.x;
    bk.h = Math.max.apply(null, ys) - bk.y;

    // Ástand leiksins
    var teljari, rangir, nofn, orvar, agnir, fljotandi, ryk;
    var boginnY = 0, takkiUpp = false, takkiNidur = false;
    var sidastaSkot = 0, naestaNafn = 0, hristingur = 0, timi = 0;
    var keyrir = false, rammi = null, sidast = 0;

    function nyrLeikur() {
      teljari = BYRJUN;
      rangir = 0;
      nofn = []; orvar = []; agnir = []; fljotandi = [];
      naestaNafn = 0.4;
      uppfaeraToflu();
    }

    function uppfaeraToflu() {
      teljariEl.textContent = String(teljari);
      skildir.textContent = '';
      for (var i = 0; i < LIF; i++) skildir.appendChild(el('span', { 'class': 'skjoldur' + (i < rangir ? ' brotinn' : '') }));
    }

    function staerd() {
      dpr = window.devicePixelRatio || 1;
      W = vollurKassi.clientWidth;
      H = Math.round(Math.max(300, Math.min(500, W * 0.62)));
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      leturStaerd = Math.max(13, Math.min(20, W / 38));
      boginnY = boginnY || H / 2;
      ryk = [];
      for (var i = 0; i < 40; i++) ryk.push({ x: Math.random() * W, y: Math.random() * H, v: slembi(6, 18), r: slembi(0.6, 1.8), a: slembi(0.15, 0.5) });
    }

    // Ný nöfn falla á slembnum stað og hraða
    function nyttNafn() {
      var rett = Math.random() < 0.4;
      var listi = (rett ? th.rett : th.rong).filter(function (t) {
        return !nofn.some(function (n) { return n.texti === t; });
      });
      if (!listi.length) return;
      var texti = velja(listi);
      ctx.font = '700 ' + leturStaerd + 'px ' + LETUR;
      var w = ctx.measureText(texti).width + leturStaerd * 1.6;
      var h = leturStaerd * 2;
      var x = 0;
      for (var k = 0; k < 8; k++) {
        x = slembi(W * 0.3 + w / 2, W - w / 2 - 8);
        var laust = nofn.every(function (n) { return n.y > h * 2.5 || Math.abs(n.x - x) > (n.w + w) / 2 + 6; });
        if (laust) break;
      }
      nofn.push({ texti: texti, rett: th.rett.indexOf(texti) >= 0, x: x, y: -h, w: w, h: h, v: H / slembi(5.5, 9), fasi: Math.random() * 6.3 });
    }

    function skjota() {
      if (!keyrir || timi - sidastaSkot < 0.32) return;
      sidastaSkot = timi;
      orvar.push({ x: 64, y: boginnY, v: Math.max(520, W * 1.3) });
    }

    function sprenging(x, y, litur, fjoldi) {
      for (var i = 0; i < fjoldi; i++) {
        var horn = Math.random() * Math.PI * 2, hradi = slembi(40, 220);
        agnir.push({ x: x, y: y, vx: Math.cos(horn) * hradi, vy: Math.sin(horn) * hradi - 40, lif: 1, litur: litur, r: slembi(1.5, 3.5) });
      }
    }

    function hitta(n) {
      if (n.rett) {
        teljari--;
        sprenging(n.x, n.y, GULL, 34);
        fljotandi.push({ x: n.x, y: n.y, texti: '−1', litur: GULL, lif: 1 });
      } else {
        teljari++;
        rangir++;
        hristingur = 0.35;
        sprenging(n.x, n.y, RAUTT, 26);
        fljotandi.push({ x: n.x, y: n.y, texti: '+1', litur: RAUTT, lif: 1 });
      }
      uppfaeraToflu();
      if (teljari <= 0) return sigur();
      if (rangir >= LIF) tap();
    }

    function sigur() {
      keyrir = false;
      nofn = [];
      for (var i = 0; i < 6; i++) sprenging(slembi(W * 0.3, W * 0.9), slembi(H * 0.2, H * 0.7), GULL, 30);
      if (api.leyst) {
        synaHulu('Trója er fallin!', 'Þú hittir alla Trójumennina.', 'Spila aftur', byrja);
      } else {
        setTimeout(api.leysa, 1400);
      }
    }

    function tap() {
      keyrir = false;
      synaHulu('Þrjú röng skot!', 'Þú hittir of marga Grikki og guði. Byrjaðu upp á nýtt.', 'Reyna aftur', byrja);
    }

    function synaHulu(titill, texti, takki, adgerd) {
      hulaTitill.textContent = titill;
      hulaTexti.textContent = texti;
      hulaTakki.textContent = takki;
      hulaTakki.onclick = adgerd;
      hula.hidden = false;
      hulaTakki.focus();
    }

    function byrja() {
      hula.hidden = true;
      nyrLeikur();
      keyrir = true;
    }

    // Uppfærsla í hverjum ramma
    function uppfaera(dt) {
      timi += dt;
      hristingur = Math.max(0, hristingur - dt);
      if (takkiUpp) boginnY -= 380 * dt;
      if (takkiNidur) boginnY += 380 * dt;
      boginnY = Math.max(24, Math.min(H - 24, boginnY));

      ryk.forEach(function (d) { d.y += d.v * dt; if (d.y > H) { d.y = -4; d.x = Math.random() * W; } });

      if (keyrir) {
        naestaNafn -= dt;
        if (naestaNafn <= 0) { nyttNafn(); naestaNafn = slembi(0.8, 1.4); }
        nofn.forEach(function (n) { n.y += n.v * dt; });
        nofn = nofn.filter(function (n) { return n.y - n.h < H; });

        orvar.forEach(function (o) {
          o.x += o.v * dt;
          var oddur = o.x + 46;
          for (var i = 0; i < nofn.length; i++) {
            var n = nofn[i];
            if (oddur > n.x - n.w / 2 && o.x < n.x + n.w / 2 && Math.abs(o.y - n.y) < n.h / 2) {
              o.burt = true;
              nofn.splice(i, 1);
              hitta(n);
              break;
            }
          }
        });
        orvar = orvar.filter(function (o) { return !o.burt && o.x < W + 20; });
      }

      agnir.forEach(function (a) { a.x += a.vx * dt; a.y += a.vy * dt; a.vy += 260 * dt; a.lif -= dt * 1.2; });
      agnir = agnir.filter(function (a) { return a.lif > 0; });
      fljotandi.forEach(function (f) { f.y -= 40 * dt; f.lif -= dt * 0.9; });
      fljotandi = fljotandi.filter(function (f) { return f.lif > 0; });
    }

    // Teikning
    function teiknaBakgrunn() {
      ctx.fillStyle = '#0b0a08';
      ctx.fillRect(0, 0, W, H);
      if (bakgrunnur.complete && bakgrunnur.naturalWidth) {
        var hlutfall = Math.max(W / bk.w, H / bk.h);
        var sw = W / hlutfall, sh = H / hlutfall;
        ctx.globalAlpha = 0.55;
        ctx.drawImage(bakgrunnur, bk.x + (bk.w - sw) / 2, bk.y + (bk.h - sh) / 2, sw, sh, 0, 0, W, H);
        ctx.globalAlpha = 1;
      }
      var g = ctx.createRadialGradient(W * 0.55, H * 0.45, H * 0.2, W * 0.55, H * 0.45, W * 0.75);
      g.addColorStop(0, 'rgba(20,14,8,0.15)');
      g.addColorStop(1, 'rgba(5,4,3,0.85)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
      ryk.forEach(function (d) {
        ctx.fillStyle = 'rgba(242,196,107,' + d.a + ')';
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
      });
    }

    function teiknaNafn(n) {
      ctx.save();
      ctx.translate(n.x, n.y);
      ctx.rotate(Math.sin(timi * 1.6 + n.fasi) * 0.05);
      var w = n.w, h = n.h, rr = h * 0.28;
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4;
      var g = ctx.createLinearGradient(0, -h / 2, 0, h / 2);
      g.addColorStop(0, '#f3dc9c'); g.addColorStop(0.5, '#cf9f4f'); g.addColorStop(1, '#8a5a22');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, rr); ctx.fill();
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = '#4a2f12'; ctx.lineWidth = 1.5; ctx.stroke();
      // Grískur rammi innan í skildinum
      ctx.strokeStyle = 'rgba(74,47,18,0.55)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.roundRect(-w / 2 + 4, -h / 2 + 4, w - 8, h - 8, rr * 0.6); ctx.stroke();
      ctx.fillStyle = 'rgba(255,248,220,0.5)';
      ctx.fillRect(-w / 2 + rr, -h / 2 + 2, w - rr * 2, 1);
      ctx.fillStyle = '#2b1a08';
      ctx.font = '700 ' + leturStaerd + 'px ' + LETUR;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(n.texti, 0, 1);
      ctx.restore();
    }

    function teiknaOr(x, y, slod) {
      if (slod) {
        var g = ctx.createLinearGradient(x - 70, y, x, y);
        g.addColorStop(0, 'rgba(242,196,107,0)'); g.addColorStop(1, 'rgba(242,196,107,0.35)');
        ctx.strokeStyle = g; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(x - 70, y); ctx.lineTo(x, y); ctx.stroke();
      }
      ctx.strokeStyle = '#d9c39a'; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 40, y); ctx.stroke();
      ctx.fillStyle = '#e0a84a';
      ctx.beginPath(); ctx.moveTo(x + 48, y); ctx.lineTo(x + 38, y - 5); ctx.lineTo(x + 38, y + 5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#b8402c';
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 8, y - 6); ctx.lineTo(x + 6, y); ctx.lineTo(x - 8, y + 6); ctx.closePath(); ctx.fill();
    }

    function teiknaBoga() {
      var x = 34, y = boginnY, h = 44;
      var hladinn = timi - sidastaSkot > 0.32;
      var dregid = hladinn ? 10 : 2;
      ctx.save();
      ctx.shadowColor = 'rgba(242,196,107,0.5)'; ctx.shadowBlur = 14;
      ctx.strokeStyle = '#7a4a1e'; ctx.lineWidth = 5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x, y - h); ctx.quadraticCurveTo(x + 34, y, x, y + h); ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = GULL; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(x, y - h); ctx.quadraticCurveTo(x + 34, y, x, y + h); ctx.stroke();
      ctx.strokeStyle = 'rgba(240,230,210,0.85)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, y - h); ctx.lineTo(x - dregid, y); ctx.lineTo(x, y + h); ctx.stroke();
      ctx.restore();
      if (hladinn) teiknaOr(x - dregid + 2, y, false);
      // Mið: dauf lína sem sýnir stefnuna
      ctx.setLineDash([4, 10]);
      ctx.strokeStyle = 'rgba(242,196,107,0.18)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(90, y); ctx.lineTo(W, y); ctx.stroke();
      ctx.setLineDash([]);
    }

    function teikna() {
      ctx.save();
      if (hristingur > 0) ctx.translate(slembi(-6, 6) * hristingur * 3, slembi(-4, 4) * hristingur * 3);
      teiknaBakgrunn();
      nofn.forEach(teiknaNafn);
      orvar.forEach(function (o) { teiknaOr(o.x, o.y, true); });
      teiknaBoga();
      agnir.forEach(function (a) {
        ctx.globalAlpha = Math.max(0, a.lif);
        ctx.fillStyle = a.litur;
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      fljotandi.forEach(function (f) {
        ctx.globalAlpha = Math.max(0, f.lif);
        ctx.fillStyle = f.litur;
        ctx.font = '700 ' + (leturStaerd * 1.5) + 'px ' + LETUR;
        ctx.textAlign = 'center';
        ctx.fillText(f.texti, f.x, f.y - 20);
      });
      ctx.globalAlpha = 1;
      ctx.restore();
    }

    function lykkja(nu) {
      var dt = Math.min(0.05, (nu - sidast) / 1000 || 0);
      sidast = nu;
      uppfaera(dt);
      teikna();
      rammi = requestAnimationFrame(lykkja);
    }

    function stoppa() {
      keyrir = false;
      if (rammi) cancelAnimationFrame(rammi);
      rammi = null;
    }

    // Stjórnun
    function yFraAtburdi(e) {
      var b = canvas.getBoundingClientRect();
      return (e.clientY - b.top) * (H / b.height);
    }
    canvas.addEventListener('pointermove', function (e) { boginnY = yFraAtburdi(e); });
    canvas.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      boginnY = yFraAtburdi(e);
      skjota();
    });
    function lyklar(e) {
      if (!kassi.isConnected) return;
      var nidri = e.type === 'keydown';
      if (e.key === 'ArrowUp' || e.key === 'w') { takkiUpp = nidri; e.preventDefault(); }
      else if (e.key === 'ArrowDown' || e.key === 's') { takkiNidur = nidri; e.preventDefault(); }
      else if (nidri && keyrir && (e.key === ' ' || e.key === 'ArrowRight')) { e.preventDefault(); skjota(); }
    }
    document.addEventListener('keydown', lyklar);
    document.addEventListener('keyup', lyklar);
    window.addEventListener('resize', staerd);
    api.dialog.addEventListener('close', function () {
      stoppa();
      document.removeEventListener('keydown', lyklar);
      document.removeEventListener('keyup', lyklar);
      window.removeEventListener('resize', staerd);
    }, { once: true });

    // Ræsing: bíða eftir letrinu svo skildirnir mælist rétt
    requestAnimationFrame(function () {
      staerd();
      nyrLeikur();
      rammi = requestAnimationFrame(lykkja);
    });
    if (document.fonts && document.fonts.load) document.fonts.load('700 16px Cinzel').catch(function () {});

    if (api.leyst) {
      synaHulu('Trója er fallin', 'Þú hefur þegar leyst Salinn. Viltu spila aftur?', 'Spila aftur', byrja);
    } else {
      synaHulu('Skjóttu Trójumenn!', 'Teljarinn byrjar í ' + BYRJUN + '. Hver Trójumaður sem þú hittir lækkar hann um einn, en Grikkir og guðir hækka hann. Eftir ' + LIF + ' röng skot byrjar þú upp á nýtt.', 'Byrja', byrja);
    }
  };
})();
