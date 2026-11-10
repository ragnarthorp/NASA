/* Gagnvirkar skýringarmyndir í kennsluköflum. Hver græja fær tóman <div data-widget="nafn"> og fyllir hann. */
(function () {
  const RF = window.RF;
  const { h } = RF.dom;
  const g = RF.util.fmt, f = RF.util.fmtS;
  const svg = (w, hgt, inner, label) => '<svg viewBox="0 0 ' + w + ' ' + hgt + '" role="img" aria-label="' + RF.util.esc(label) + '" class="fig">' + inner + '</svg>';
  const slider = (label, min, max, step, val, unit, on) => {
    const out = h('output', '');
    const inp = h('input', { type: 'range', min, max, step, value: val, 'aria-label': label });
    const upd = () => { out.textContent = g(+inp.value) + ' ' + unit; on(+inp.value); };
    inp.addEventListener('input', upd);
    setTimeout(upd);
    return h('label.slider', h('span', label), inp, out);
  };
  const matSelect = (keys, val, on) => {
    const s = h('select', { 'aria-label': 'Efni' }, keys.map((k) => h('option', { value: k, selected: k === val ? true : null }, RF.mat(k).name)));
    s.addEventListener('change', () => on(s.value));
    return h('label.slider', h('span', 'Efni'), s);
  };

  const W = {};

  /* Leiðari: lengd og sverleiki → viðnám */
  W.conductor = (el) => {
    const st = { l: 100, A: 2.5, mat: 'kopar' };
    const fig = h('div.figwrap'), res = h('div.widget-res', { 'aria-live': 'polite' });
    const draw = () => {
      const R = RF.phys.resistance(RF.mat(st.mat).rho, st.l, st.A);
      const len = 60 + (st.l / 500) * 400, th = 6 + Math.sqrt(st.A) * 7;
      fig.innerHTML = svg(520, 110, '<rect x="20" y="' + (55 - th / 2) + '" width="' + len + '" height="' + th + '" rx="' + th / 2 + '" fill="url(#cu)"/><defs><linearGradient id="cu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9a36b"/><stop offset=".5" stop-color="#b8692f"/><stop offset="1" stop-color="#7d4318"/></linearGradient></defs><text x="20" y="100" class="svgt">l = ' + g(st.l) + ' m</text><text x="' + (30 + len) + '" y="60" class="svgt">A = ' + g(st.A) + ' mm²</text>', 'Leiðari ' + g(st.l) + ' m langur og ' + g(st.A) + ' mm²');
      res.innerHTML = RF.m('R = \\f{ρ·l}{A} = \\f{' + g(RF.mat(st.mat).rho, 5) + '·' + g(st.l) + '}{' + g(st.A) + '} = ' + f(R) + ' Ω');
    };
    el.append(h('div.widget',
      h('div.widget-ctrl', slider('Lengd l', 10, 500, 10, st.l, 'm', (v) => { st.l = v; draw(); }), slider('Þverflatarmál A', 0.75, 16, 0.25, st.A, 'mm²', (v) => { st.A = v; draw(); }), matSelect(['kopar', 'al', 'silfur', 'jarn', 'manganin'], st.mat, (v) => { st.mat = v; draw(); })),
      fig, res, h('p.small', 'Tvöföld lengd → tvöfalt viðnám. Tvöfalt þverflatarmál → helmingi minna viðnám.')));
    draw();
  };

  /* Samanburður á eðlisviðnámi */
  W.materials = (el) => {
    const keys = ['silfur', 'kopar', 'gull', 'al', 'volfram', 'jarn'];
    const max = 0.1;
    const rows = keys.map((k, i) => { const m = RF.mat(k), w = (m.rho / max) * 360; return '<text x="0" y="' + (i * 30 + 20) + '" class="svgt">' + m.short + '</text><rect x="90" y="' + (i * 30 + 6) + '" width="' + w + '" height="20" rx="4" fill="' + (k === 'kopar' ? '#0b7a70' : '#1d5fa8') + '" opacity="' + (k === 'kopar' ? 1 : 0.75) + '"/><text x="' + (96 + w) + '" y="' + (i * 30 + 21) + '" class="svgt">' + g(m.rho, 4) + '</text>'; }).join('');
    el.append(h('div.widget', h('div.figwrap', { html: svg(520, 190, rows, 'Súlurit: eðlisviðnám silfurs, kopars, gulls, áls, volframs og járns') }), h('p.small', 'Styttri súla = minna eðlisviðnám = betri leiðari (Ω·mm²/m).')));
  };

  /* Galvanhúðun */
  W.galvan = (el) => {
    const s = '<rect x="60" y="50" width="300" height="110" rx="6" fill="#dcf3f0" stroke="#0b7a70"/><rect x="100" y="30" width="16" height="110" fill="#b8692f"/><rect x="300" y="30" width="16" height="110" fill="#7a8794"/><text x="86" y="24" class="svgt">+ málmur</text><text x="282" y="24" class="svgt">− hlutur</text><line x1="108" y1="30" x2="108" y2="8" stroke="#333"/><line x1="308" y1="30" x2="308" y2="8" stroke="#333"/><line x1="108" y1="8" x2="180" y2="8" stroke="#333"/><line x1="236" y1="8" x2="308" y2="8" stroke="#333"/><rect x="180" y="0" width="56" height="16" rx="3" fill="#fff" stroke="#333"/><text x="190" y="12" class="svgt sm">+  −</text>' +
      [0, 1, 2].map((i) => '<g class="ion" style="animation-delay:' + i * 0.9 + 's"><circle cx="140" cy="' + (75 + i * 25) + '" r="8" fill="#b8692f"/><text x="134" y="' + (79 + i * 25) + '" class="svgt sm" fill="#fff">+</text></g>').join('') + '<text x="150" y="182" class="svgt">Jákvæðar málmjónir → að mínusskautinu</text>';
    el.append(h('div.widget', h('div.figwrap', { html: svg(420, 190, s, 'Galvanhúðun: málmjónir fara frá plússkauti að hlutnum á mínusskauti') })));
  };

  /* Hringur: þvermál og radíus */
  W.circle = (el) => {
    const st = { d: 2 };
    const fig = h('div.figwrap'), res = h('div.widget-res', { 'aria-live': 'polite' });
    const draw = () => {
      const r = 20 + st.d * 18;
      fig.innerHTML = svg(320, 200, '<circle cx="110" cy="100" r="' + r + '" fill="#e9a36b" stroke="#7d4318" stroke-width="2"/><line x1="' + (110 - r) + '" y1="100" x2="' + (110 + r) + '" y2="100" stroke="#123" stroke-width="2"/><line x1="110" y1="100" x2="110" y2="' + (100 - r) + '" stroke="#b4530a" stroke-width="2" stroke-dasharray="4 3"/><text x="230" y="95" class="svgt">d = ' + g(st.d) + ' mm</text><text x="230" y="120" class="svgt" fill="#b4530a">r = ' + g(st.d / 2) + ' mm</text>', 'Þverskurður vírs');
      res.innerHTML = RF.m('A = \\f{π·d^2}{4} = \\f{π·' + g(st.d) + '^2}{4} = ' + f(RF.phys.areaFromDiameter(st.d)) + ' mm²') + '<br><span class="small">Algeng villa: π·d² = ' + f(Math.PI * st.d * st.d) + ' mm² (4 sinnum of mikið)</span>';
    };
    el.append(h('div.widget', h('div.widget-ctrl', slider('Þvermál d', 0.5, 4, 0.1, st.d, 'mm', (v) => { st.d = v; draw(); })), fig, res));
    draw();
  };

  /* Hitastig → viðnám */
  W.temp = (el) => {
    const st = { R1: 10, t1: 20, t2: 80, mat: 'kopar' };
    const fig = h('div.figwrap'), res = h('div.widget-res', { 'aria-live': 'polite' });
    const draw = () => {
      const a = RF.mat(st.mat).alpha, R2 = RF.phys.rAtTemp(st.R1, a, st.t1, st.t2);
      const X = (t) => 40 + ((t + 40) / 200) * 420, Y = (R) => 170 - ((R - 6) / 8) * 150;
      let pts = '';
      for (let t = -40; t <= 160; t += 10) pts += X(t) + ',' + Y(RF.phys.rAtTemp(st.R1, a, st.t1, t)) + ' ';
      fig.innerHTML = svg(500, 200, '<line x1="40" y1="170" x2="470" y2="170" stroke="#889"/><line x1="40" y1="10" x2="40" y2="170" stroke="#889"/><text x="440" y="190" class="svgt sm">t (°C)</text><text x="4" y="14" class="svgt sm">R (Ω)</text><polyline points="' + pts + '" fill="none" stroke="#b4530a" stroke-width="2.5"/><circle cx="' + X(st.t1) + '" cy="' + Y(st.R1) + '" r="6" fill="#1d5fa8"/><circle cx="' + X(st.t2) + '" cy="' + Y(R2) + '" r="6" fill="#b4530a"/><text x="' + (X(st.t1) + 8) + '" y="' + (Y(st.R1) + 18) + '" class="svgt sm">R_t1</text><text x="' + (X(st.t2) + 8) + '" y="' + (Y(R2) - 8) + '" class="svgt sm">R_t2</text>', 'Graf af viðnámi sem fall af hitastigi');
      const dt = st.t2 - st.t1;
      res.innerHTML = RF.m('R_{t2} = R_{t1} ' + (dt >= 0 ? '+' : '−') + ' R_{t1}·α·Δt = ' + g(st.R1) + (dt >= 0 ? ' + ' : ' − ') + g(st.R1) + '·' + g(a, 5) + '·' + g(Math.abs(dt)) + ' = ' + f(R2) + ' Ω') + '<br><span class="small">Δt = ' + g(Math.abs(dt)) + ' °C (' + (dt >= 0 ? 'hitun' : 'kólnun') + ')</span>';
    };
    el.append(h('div.widget', h('div.widget-ctrl', slider('Lokahitastig t₂', -40, 160, 5, st.t2, '°C', (v) => { st.t2 = v; draw(); }), matSelect(['kopar', 'nikkel', 'manganin'], st.mat, (v) => { st.mat = v; draw(); })), fig, res, h('p.small', 'R_t1 = 10 Ω við 20 °C. Manganín: línan er nánast flöt (α ≈ 0).')));
    draw();
  };

  /* Tvíleiðari – fram og til baka */
  RF.twoWireSVG = (o = {}) => {
    const L = o.l || 'l', I = o.I || 'I', U1 = o.U1 || 'U₁', U2 = o.U2 || 'U₂', anim = o.anim !== false;
    const x1 = 130, x2 = 520;
    return svg(660, 196,
      '<circle cx="' + x1 + '" cy="98" r="26" fill="#fff" stroke="#123" stroke-width="2"/><path d="M' + (x1 - 14) + ' 98 q7 -12 14 0 t14 0" fill="none" stroke="#123" stroke-width="2"/>' +
      '<line x1="' + x1 + '" y1="72" x2="' + x1 + '" y2="40" stroke="#123" stroke-width="2"/><line x1="' + x1 + '" y1="124" x2="' + x1 + '" y2="156" stroke="#123" stroke-width="2"/>' +
      '<line x1="' + x1 + '" y1="40" x2="' + x2 + '" y2="40" stroke="#b8692f" stroke-width="5"/><line x1="' + x1 + '" y1="156" x2="' + x2 + '" y2="156" stroke="#b8692f" stroke-width="5"/>' +
      '<line x1="' + x2 + '" y1="40" x2="' + x2 + '" y2="73" stroke="#123" stroke-width="2"/><line x1="' + x2 + '" y1="123" x2="' + x2 + '" y2="156" stroke="#123" stroke-width="2"/><rect x="' + (x2 - 14) + '" y="73" width="28" height="50" fill="#fff" stroke="#123" stroke-width="2"/>' +
      (anim ? '<circle r="5" fill="#0b7a70"><animateMotion dur="3.2s" repeatCount="indefinite" path="M' + x1 + ' 40 L' + x2 + ' 40 L' + x2 + ' 156 L' + x1 + ' 156 Z"/></circle><circle r="5" fill="#0b7a70"><animateMotion dur="3.2s" begin="1.6s" repeatCount="indefinite" path="M' + x1 + ' 40 L' + x2 + ' 40 L' + x2 + ' 156 L' + x1 + ' 156 Z"/></circle>' : '') +
      '<text x="' + (x1 + x2) / 2 + '" y="30" class="svgt" text-anchor="middle">fram → ' + L + '</text><text x="' + (x1 + x2) / 2 + '" y="184" class="svgt" text-anchor="middle">← til baka ' + L + '</text>' +
      '<text x="' + (x1 - 34) + '" y="103" class="svgt" text-anchor="end">' + U1 + '</text><text x="' + (x2 + 24) + '" y="103" class="svgt">' + U2 + '</text><text x="' + (x1 + 10) + '" y="62" class="svgt sm">' + I + '</text>' +
      '<text x="' + (x1 + x2) / 2 + '" y="103" class="svgt" text-anchor="middle" fill="#0b7a70" font-weight="700">Leið straumsins = 2·' + L + '</text>', 'Tengimynd: spennugjafi, tveir leiðarar og álag. Straumurinn fer fram og til baka, leiðin er 2 sinnum fjarlægðin.');
  };
  W.twowire = (el) => {
    const st = { l: 50 };
    const fig = h('div.figwrap'), res = h('div.widget-res', { 'aria-live': 'polite' });
    const draw = () => {
      fig.innerHTML = RF.twoWireSVG({ l: g(st.l) + ' m' });
      res.innerHTML = 'Fjarlægð ' + g(st.l) + ' m → heildarlengd vírs <b>' + g(2 * st.l) + ' m</b>. ' + RF.m('R_l = \\f{0,0178·' + g(st.l) + '·2}{1,5} = ' + f(RF.phys.resistance(0.0178, st.l, 1.5, true)) + ' Ω') + ' <span class="small">(kopar, 1,5 mm²)</span>';
    };
    el.append(h('div.widget', h('div.widget-ctrl', slider('Fjarlægð l', 10, 200, 5, st.l, 'm', (v) => { st.l = v; draw(); })), fig, res));
    draw();
  };

  /* Spennufall: U1, ΔU, U2 sem súla */
  W.drop = (el) => {
    const st = { U1: 230, I: 10, l: 50, A: 1.5 };
    const fig = h('div.figwrap'), res = h('div.widget-res', { 'aria-live': 'polite' });
    const draw = () => {
      const R = RF.phys.resistance(0.0178, st.l, st.A, true), dU = st.I * R, U2 = st.U1 - dU, pct = (dU / st.U1) * 100;
      const w2 = (U2 / st.U1) * 460, wd = (dU / st.U1) * 460;
      fig.innerHTML = svg(500, 70, '<rect x="20" y="15" width="' + w2 + '" height="30" fill="#1d5fa8"/><rect x="' + (20 + w2) + '" y="15" width="' + wd + '" height="30" fill="' + (pct > 6 ? '#c2261a' : '#b4530a') + '"/><text x="26" y="35" class="svgt" fill="#fff">U₂ = ' + f(U2) + ' V</text><text x="20" y="64" class="svgt sm">U₁ = ' + g(st.U1) + ' V</text><text x="' + Math.max(240, 20 + w2 - 120) + '" y="64" class="svgt sm">ΔU = ' + f(dU) + ' V (' + f(pct) + ' %)</text>', 'Súla: spenna á álagi og spennufall');
      res.innerHTML = RF.m('ΔU = I·\\f{ρ·l·2}{A} = ' + g(st.I) + '·\\f{0,0178·' + g(st.l) + '·2}{' + g(st.A) + '} = ' + f(dU) + ' V') + (pct > 6 ? ' <b class="bad">Yfir 6 %!</b>' : '');
    };
    el.append(h('div.widget', h('div.widget-ctrl', slider('Straumur I', 1, 32, 1, st.I, 'A', (v) => { st.I = v; draw(); }), slider('Fjarlægð l', 5, 150, 5, st.l, 'm', (v) => { st.l = v; draw(); }), slider('Þverflatarmál A', 0.75, 10, 0.25, st.A, 'mm²', (v) => { st.A = v; draw(); })), fig, res, h('p.small', 'Kopar, tvíleiðari, 230 V. Prófaðu að auka A og sjáðu spennufallið minnka.')));
    draw();
  };

  W.s7diagram = (el) => {
    el.append(h('div.widget', h('p', h('b', 'Tengimynd fyrir dæmi 7 (3.4.1)')), h('div.figwrap', { html: RF.twoWireSVG({ l: '75 m', I: 'I = 9,5 A', U1: 'U₁ = ?', U2: 'U₂ = 214 V', anim: false }) }), h('p.small', 'Merktu alltaf inn: U₁, U₂, I, fjarlægð l, A og efni. Þá sést að leiðin er 2·75 = 150 m.')));
  };

  /* Reiknivél fyrir R = ρl/A, hvaða stærð sem er */
  W.calcR = (el) => {
    const st = { find: 'R', R: 1, l: 100, A: 2.5, mat: 'kopar' };
    const res = h('div.widget-res', { 'aria-live': 'polite' });
    const box = h('div.widget-ctrl');
    const field = (k, label, unit) => { const i = h('input', { type: 'text', inputmode: 'decimal', value: g(st[k]), 'aria-label': label }); i.addEventListener('input', () => { st[k] = RF.util.parseNum(i.value); calc(); }); return h('label.slider', { 'data-k': k }, h('span', label + ' (' + unit + ')'), i); };
    const findSel = h('select', { 'aria-label': 'Hvað á að finna' }, [['R', 'Viðnám R'], ['l', 'Lengd l'], ['A', 'Þverflatarmál A']].map(([v, t]) => h('option', { value: v }, t)));
    findSel.addEventListener('change', () => { st.find = findSel.value; layout(); });
    const fields = { R: field('R', 'Viðnám', 'Ω'), l: field('l', 'Lengd', 'm'), A: field('A', 'Þverflatarmál', 'mm²') };
    const layout = () => { Object.entries(fields).forEach(([k, fe]) => (fe.style.display = k === st.find ? 'none' : '')); calc(); };
    const calc = () => {
      const rho = RF.mat(st.mat).rho;
      let out;
      if (st.find === 'R') out = 'R = \\f{ρ·l}{A} = \\f{' + g(rho, 5) + '·' + g(st.l) + '}{' + g(st.A) + '} = ' + f(RF.phys.resistance(rho, st.l, st.A)) + ' Ω';
      if (st.find === 'l') out = 'l = \\f{R·A}{ρ} = \\f{' + g(st.R) + '·' + g(st.A) + '}{' + g(rho, 5) + '} = ' + f(RF.phys.length(st.R, st.A, rho)) + ' m';
      if (st.find === 'A') out = 'A = \\f{ρ·l}{R} = \\f{' + g(rho, 5) + '·' + g(st.l) + '}{' + g(st.R) + '} = ' + f(RF.phys.area(rho, st.l, st.R)) + ' mm²';
      res.innerHTML = RF.m(out);
    };
    box.append(h('label.slider', h('span', 'Finna'), findSel), matSelect(Object.keys(RF.materials), st.mat, (v) => { st.mat = v; calc(); }), fields.R, fields.l, fields.A);
    el.append(h('div.widget', h('p', h('b', 'Reiknivél: '), 'veldu hvað á að finna og breyttu tölunum.'), box, res));
    layout();
  };

  /* „Umritunarþríhyrningur“: veldu óþekktu stærðina */
  W.triangle = (el) => {
    const forms = { R: 'R = \\f{ρ·l}{A}', l: 'l = \\f{R·A}{ρ}', A: 'A = \\f{ρ·l}{R}', rho: 'ρ = \\f{R·A}{l}' };
    const why = { R: 'Upphaflega formúlan.', l: 'Margfalda báðar hliðar með A → R·A = ρ·l. Deila með ρ.', A: 'R·A = ρ·l. Deila með R.', rho: 'R·A = ρ·l. Deila með l.' };
    const res = h('div.widget-res', { 'aria-live': 'polite' });
    const btns = h('div.seg', { role: 'group', 'aria-label': 'Óþekkt stærð' }, Object.keys(forms).map((k) => h('button', { type: 'button', onclick: (e) => { btns.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', 'false')); e.currentTarget.setAttribute('aria-pressed', 'true'); res.innerHTML = '<div class="fblock">' + RF.m(forms[k]) + '</div><p class="small">' + why[k] + '</p>'; }, 'aria-pressed': 'false' }, k === 'rho' ? 'ρ' : k)));
    el.append(h('div.widget', h('p', h('b', 'Hvaða stærð vantar? '), 'Smelltu og sjáðu umrituðu formúluna.'), btns, res));
    btns.firstChild.click();
  };

  RF.widgets = W;
  RF.mountWidgets = (root) => root.querySelectorAll('[data-widget]').forEach((el) => { const fn = W[el.dataset.widget]; if (fn && !el.dataset.done) { el.dataset.done = '1'; fn(el); } });
})();
