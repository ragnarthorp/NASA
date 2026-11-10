/* Sjálfvirk yfirferð svara og greining á mistökum.
   Staða hvers liðar: 'correct' (≤1 %), 'close' (≤3 % eða þekkt námundunarfrávik – gilt),
   'follow' (rétt aðferð en byggt á rangri fyrri útkomu – hálft stig), 'wrong', 'empty'. */
(function (G) {
  const RF = (G.RF = G.RF || {});
  const U = RF.util;
  const TOL = 0.01, CLOSE = 0.03;

  const near = (x, e, tol, abs) => {
    if (!isFinite(x) || !isFinite(e)) return false;
    if (abs && Math.abs(x - e) <= abs) return true;
    if (e === 0) return Math.abs(x) < 1e-9;
    return Math.abs(x - e) / Math.abs(e) <= tol;
  };

  function genericDiag(x, e, part, t) {
    if (!isFinite(x) || !isFinite(e) || e === 0) return null;
    const r = x / e;
    const is = (k) => Math.abs(r - k) / k < 0.02;
    if (is(1000)) return 'Svarið er 1000 sinnum of stórt. Athugaðu einingar (t.d. m og km, eða mm og m).';
    if (is(0.001)) return 'Svarið er 1000 sinnum of lítið. Athugaðu einingar (t.d. km og m).';
    if (is(1e6) || is(1e-6)) return 'Svarið skeikar um milljón. Ertu að blanda saman m² og mm²? Notaðu A í mm².';
    if (is(100) && part.unit !== '%') return 'Svarið er 100 sinnum of stórt. Athugaðu einingar og kommu.';
    if (is(0.01) && part.unit === '%') return 'Þú gleymdir líklega að margfalda með 100 til að fá prósentu.';
    if (is(0.01)) return 'Svarið er 100 sinnum of lítið. Athugaðu einingar og kommu.';
    if (is(10) || is(0.1)) return 'Svarið skeikar um tífalt – líklega kommuvilla eða röng eining.';
    if (is(0.5) && t.fam === 'U') return 'Svarið er helmingur af réttu svari. Gleymdirðu að margfalda með 2 fyrir tvíleiðara?';
    if (is(2) && t.fam === 'U') return 'Svarið er tvöfalt of stórt. Athugaðu hvort þú margfaldaðir með 2 þar sem átti að deila (eða tvisvar).';
    if (is(4) || is(0.25)) return 'Svarið skeikar um fjórfalt – ruglaðirðu saman þvermáli og radíus? A = π·d²/4 = π·r².';
    if (is(-1)) return 'Formerkið er rangt.';
    return null;
  }

  /* prob: úr RF.makeProblem · ans: { key: strengur } */
  RF.checkProblem = function (prob, ans) {
    const t = RF.ptype(prob.tid);
    const p = prob.p;
    const sol = t.solve(p).v;
    const parts = t.parts(p);
    let scen = null;
    const scenarios = () => (scen = scen || t.mistakes(p).map((s) => ({ ...s, v: t.solve(p, s.o).v })));
    const studentVals = {};
    const results = parts.map((part) => {
      const raw = ans[part.k];
      const expected = sol[part.k];
      if (part.kind === 'choice') {
        if (!raw) return { k: part.k, status: 'empty', credit: 0, expected, msg: 'Ekkert valið.' };
        const ok = expected.includes(raw);
        const extra = ok && t.choiceNote ? t.choiceNote(p, sol) : '';
        let msg = ok ? 'Rétt!' + (extra ? ' ' + extra : '') : 'Ekki rétt.';
        if (!ok && part.k === 'len') msg = raw === 'l' ? 'Þetta er bara leiðin aðra leiðina. Straumurinn fer líka til baka: 2·l.' : 'Nei – fjarlægðin er l og straumurinn fer fram og til baka, svo leiðin er 2·l.';
        if (!ok && part.k === 'mat') msg = 'Ekki rétt. Berðu reiknað ρ saman við töfluna og finndu næsta gildi.';
        return { k: part.k, status: ok ? 'correct' : 'wrong', credit: ok ? 1 : 0, expected, given: raw, msg };
      }
      const x = U.parseNum(raw);
      if (raw === undefined || String(raw).trim() === '') return { k: part.k, status: 'empty', credit: 0, expected, msg: 'Ekkert svar.' };
      if (!isFinite(x)) return { k: part.k, status: 'empty', credit: 0, expected, msg: 'Gat ekki lesið töluna. Skrifaðu t.d. 2,37 eða 2.37.' };
      studentVals[part.k] = x;
      const base = { k: part.k, expected, given: x };
      if (near(x, expected, TOL, part.abs)) { return { ...base, status: 'correct', credit: 1, msg: 'Rétt!' }; }
      // þekkt mistök
      for (const s of scenarios()) {
        if (s.parts && !s.parts.includes(part.k)) continue;
        const sv = s.v[part.k];
        if (!isFinite(sv) || near(sv, expected, 0.015)) continue;
        if (near(x, sv, TOL)) return { ...base, status: s.ok ? 'close' : 'wrong', credit: s.ok ? 1 : 0, msg: s.msg, code: s.code };
      }
      // fylgivilla: rétt aðferð á ranga fyrri útkomu
      if (part.from) {
        const merged = { ...sol, ...studentVals };
        const differs = Object.keys(studentVals).some((k) => k !== part.k && !near(studentVals[k], sol[k], TOL));
        if (differs) {
          const e2 = part.from(p, merged);
          if (near(x, e2, TOL)) return { ...base, status: 'follow', credit: 0.5, msg: 'Aðferðin í þessum lið er rétt, en hún byggir á rangri útkomu úr fyrri lið. Lagaðu fyrri liðinn.' };
        }
      }
      if (near(x, expected, CLOSE, part.abs ? part.abs * 3 : 0)) return { ...base, status: 'close', credit: 1, msg: 'Nálægt – telst rétt. Hafðu fleiri aukastafi í millinðurstöðum til að fá nákvæmara svar.' };
      const gd = genericDiag(x, expected, part, t);
      const card = RF.method(t.cards[t.cards.length - 1]);
      return { ...base, status: 'wrong', credit: 0, msg: gd || 'Ekki rétt. Farðu yfir skrefin – sjá aðferðaspjald ' + card.id + ' (' + card.find.toLowerCase() + ').' };
    });
    const score = results.reduce((s, r) => s + r.credit, 0) / results.length;
    return { parts: results, score, solution: sol };
  };

  RF.unitLabel = (u) => u || '';
})(typeof globalThis !== 'undefined' ? globalThis : window);
