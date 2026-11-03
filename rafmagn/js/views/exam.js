/* Prófhamur — 10 spurningar úr verkefnabankanum, valfrjáls tímamælir, mat eftir skil. */
(function (root) {
  'use strict';
  const Views = root.Views = root.Views || {};
  const UI = root.UI, Store = root.Store, Exercises = root.Exercises, Calc = root.Calc;
  const esc = UI.esc;
  let container = null;
  let tick = null;

  const DISCLAIMER = '<div class="card disclaimer"><p style="margin:0"><strong>Athugaðu:</strong> Þetta er æfingapróf byggt á uppgefnum námsþáttum (lögmál Ohms, raðtenging og hliðtenging). Það er ekki opinbera prófið og spurningarnar þar geta verið öðruvísi.</p></div>';

  function exam() { return Store.state.exam; }
  function isAnswered(id) {
    const ex = Exercises.byId[id];
    const a = (exam().answers || {})[id];
    if (!a) return false;
    if (ex.type === 'mc') return a.choice != null;
    return ex.answers.every(function (x) { return a.fields && a.fields[x.key] && String(a.fields[x.key].v || '').trim(); });
  }
  function remainingMs() {
    const e = exam();
    if (!e || !e.timer) return null;
    return e.startedAt + e.minutes * 60000 - Date.now();
  }
  function fmtTime(ms) {
    const s = Math.max(0, Math.ceil(ms / 1000));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  /* ---------- Upphafssíða ---------- */
  function startHTML() {
    const set = Store.state.settings;
    const total = Exercises.BANK.length;
    const only = Exercises.BANK.filter(function (e) { return e.examOnly; }).length;
    let h = '<div class="section-head"><div><p class="eyebrow">Prófhamur</p><h1>Æfingapróf</h1>' +
      '<p class="lead">10 spurningar valdar úr verkefnabanka með ' + total + ' spurningum (þar af ' + only + ' sem birtast aðeins hér). Ein spurning er úr hverjum efnisflokki og afgangurinn af handahófi. Vísbendingar, lausnir og rétt svör birtast ekki fyrr en þú skilar.</p></div></div>' +
      DISCLAIMER + '<section class="card" aria-labelledby="start-h" style="margin-top:18px"><h2 id="start-h">Stillingar</h2>' +
      '<label class="choice" style="display:inline-flex"><input type="checkbox" data-timer' + (set.timer ? ' checked' : '') + '> Nota tímamæli</label> ' +
      '<label for="exam-min" style="margin-left:10px">Tími</label> <select id="exam-min" data-minutes' + (set.timer ? '' : ' disabled') + '>' +
      [15, 20, 30, 45, 60].map(function (m) { return '<option value="' + m + '"' + (set.timerMinutes === m ? ' selected' : '') + '>' + m + ' mínútur</option>'; }).join('') + '</select>' +
      '<p class="help">Tímamælirinn er valfrjáls. Ef tíminn rennur út er prófinu skilað sjálfkrafa.</p>' +
      '<p class="help">Hafðu reiknivél, blað og formúlublaðið við höndina, eins og í prófinu. Hjálpartækin úr æfingunum (lögmál Ohms og einingabreytir) eru ekki í boði hér.</p>' +
      '<div class="actions"><button type="button" class="btn-primary" data-start>Hefja nýtt próf</button></div></section>';
    h += historyHTML();
    return h;
  }
  function historyHTML() {
    const list = Store.state.exams;
    if (!list.length) return '';
    return '<section class="card" aria-labelledby="hist-h" style="margin-top:18px"><h2 id="hist-h">Fyrri æfingapróf</h2><div class="table-wrap"><table>' +
      '<thead><tr><th scope="col">Dagsetning</th><th scope="col">Stig</th><th scope="col">Alveg réttar spurningar</th></tr></thead><tbody>' +
      list.slice().reverse().slice(0, 10).map(function (x) {
        return '<tr><td>' + esc(new Date(x.date).toLocaleString('is-IS', { dateStyle: 'medium', timeStyle: 'short' })) + '</td><td>' + Calc.formatNumber(x.points, 3) + ' af ' + x.total + '</td><td>' + x.full + ' af ' + x.total + '</td></tr>';
      }).join('') + '</tbody></table></div></section>';
  }

  /* ---------- Próf í gangi ---------- */
  function runningHTML() {
    const e = exam();
    const i = e.current;
    const id = e.ids[i];
    const ex = Exercises.byId[id];
    const answered = e.ids.filter(isAnswered).length;
    let h = '<div class="exam-bar"><div><p class="eyebrow" style="margin:0">Æfingapróf</p><h1 style="margin:0">Spurning ' + (i + 1) + ' af ' + e.ids.length + '</h1></div>' +
      '<div><span class="small">' + answered + ' af ' + e.ids.length + ' svarað</span>' +
      (e.timer ? ' · <span>Tími eftir: <span class="timer" role="timer" aria-live="off" data-timer-out>' + fmtTime(remainingMs()) + '</span></span>' : '') + '</div></div>';
    h += '<nav aria-label="Spurningar"><ol class="qnav">' + e.ids.map(function (qid, j) {
      const ans = isAnswered(qid);
      return '<li><button type="button" data-goto="' + j + '" class="' + (ans ? 'answered' : '') + '"' + (j === i ? ' aria-current="step"' : '') +
        ' aria-label="Spurning ' + (j + 1) + (ans ? ', svarað' : ', ósvarað') + '">' + (j + 1) + '<small>' + (ans ? 'svarað' : '–') + '</small></button></li>';
    }).join('') + '</ol></nav>';
    h += UI.exerciseCard(ex, { mode: 'exam', number: i + 1, draft: (e.answers || {})[id] });
    h += '<div class="actions">' +
      (i > 0 ? '<button type="button" data-prev>← Fyrri spurning</button>' : '') +
      (i < e.ids.length - 1 ? '<button type="button" data-next>Næsta spurning →</button>' : '') +
      '<button type="button" class="btn-primary" data-submit>Skila prófi</button>' +
      '<button type="button" class="btn-quiet" data-abort>Hætta við prófið</button></div>';
    return h;
  }

  /* ---------- Niðurstöður ---------- */
  function grade(e) {
    const rows = e.ids.map(function (id) {
      const ex = Exercises.byId[id];
      const g = UI.gradeExercise(ex, (e.answers || {})[id] || {});
      return { id: id, ex: ex, g: g, points: g.correct / g.total };
    });
    const points = rows.reduce(function (a, r) { return a + r.points; }, 0);
    const full = rows.filter(function (r) { return r.g.allCorrect; }).length;
    const byTopic = {};
    rows.forEach(function (r) {
      const t = byTopic[r.ex.topic] = byTopic[r.ex.topic] || { points: 0, total: 0 };
      t.points += r.points; t.total += 1;
    });
    return { rows: rows, points: points, full: full, total: rows.length, byTopic: byTopic };
  }

  function resultHTML() {
    const e = exam();
    const r = grade(e);
    let h = '<div class="section-head"><div><p class="eyebrow">Prófhamur</p><h1>Niðurstöður æfingaprófs</h1></div>' +
      '<div class="actions no-print"><button type="button" class="btn-primary" data-new>Taka nýtt próf</button></div></div>';
    if (e.autoSubmitted) h += '<p class="notice notice-warn">Tíminn rann út og prófinu var skilað sjálfkrafa.</p>';
    h += '<section class="card" aria-labelledby="score-h"><h2 id="score-h" class="sr-only">Stig</h2><div class="grid grid-3">' +
      '<div><div class="score">' + Calc.formatNumber(r.points, 3) + ' / ' + r.total + '</div><div class="muted">stig (hlutastig fyrir hluta af réttum svörum)</div></div>' +
      '<div><div class="score">' + UI.pct(r.points, r.total) + ' %</div><div class="muted">hlutfall</div></div>' +
      '<div><div class="score">' + r.full + '</div><div class="muted">spurningar alveg réttar</div></div></div></section>';
    const weak = [];
    h += '<section class="card" aria-labelledby="topic-h"><h2 id="topic-h">Eftir efnisflokki</h2>';
    Exercises.TOPICS.forEach(function (t) {
      const s = r.byTopic[t.id];
      if (!s) return;
      const ok = s.points / s.total >= 0.999;
      if (!ok) weak.push(t);
      h += '<div class="topic-row"><span>' + esc(t.name) + '</span>' + UI.progressBar(Math.round(s.points * 100), s.total * 100, t.name) +
        '<span class="small">' + (ok ? '<span class="tag tag-ok">✓ Í lagi</span>' : '<span class="tag tag-bad">Æfa betur</span>') + ' ' + Calc.formatNumber(s.points, 3) + ' af ' + s.total + '</span></div>';
    });
    h += weak.length
      ? '<p style="margin-top:12px"><strong>Gagnlegt væri að æfa betur:</strong></p><div class="actions">' + weak.map(function (t) { return '<a class="btn btn-small" href="#aefingar:' + t.id + '">' + esc(t.name) + '</a>'; }).join('') + '</div>'
      : '<p class="notice notice-ok" style="margin-top:12px">✓ Allir efnisflokkar í lagi. Frábært!</p>';
    h += '</section>' + DISCLAIMER + '<h2 style="margin-top:24px">Svörin þín, rétt svör og útreikningar</h2><div class="stack">';
    r.rows.forEach(function (row, i) {
      const status = row.g.allCorrect ? '<span class="tag tag-ok">✓ Rétt</span>'
        : (row.g.correct ? '<span class="tag tag-warn">Hluti réttur (' + row.g.correct + ' af ' + row.g.total + ')</span>' : (row.g.answered ? '<span class="tag tag-bad">✗ Rangt</span>' : '<span class="tag tag-bad">Ósvarað</span>'));
      h += UI.exerciseCard(row.ex, { mode: 'review', number: i + 1, draft: (e.answers || {})[row.id], results: row.g.parts, status: status });
    });
    return h + '</div>';
  }

  /* ---------- Aðgerðir ---------- */
  function draw() {
    stopTick();
    const e = exam();
    let html;
    if (!e) html = startHTML();
    else if (e.submitted) html = resultHTML();
    else html = runningHTML();
    container.innerHTML = html;
    if (e && !e.submitted && e.timer) startTick();
  }
  function saveCurrent() {
    const e = exam();
    if (!e || e.submitted) return;
    const card = container.querySelector('.ex');
    if (!card) return;
    const id = card.dataset.id;
    e.answers = e.answers || {};
    e.answers[id] = UI.readAnswers(card, Exercises.byId[id]);
    Store.save();
  }
  function go(i) {
    saveCurrent();
    exam().current = Math.max(0, Math.min(exam().ids.length - 1, i));
    Store.save();
    draw();
    const h = container.querySelector('h1'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
  }
  function submit(auto) {
    saveCurrent();
    const e = exam();
    if (!e || e.submitted) return;
    e.submitted = true;
    e.autoSubmitted = !!auto;
    const r = grade(e);
    Store.state.exams.push({ date: Date.now(), points: r.points, total: r.total, full: r.full, byTopic: r.byTopic });
    if (Store.state.exams.length > 30) Store.state.exams.shift();
    Store.flush();
    draw();
    root.scrollTo(0, 0);
    const h = container.querySelector('h1'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
    UI.announce('Prófinu hefur verið skilað.');
  }
  function start() {
    const set = Store.state.settings;
    Store.state.exam = {
      seed: (Date.now() ^ Math.floor(Math.random() * 1e9)) >>> 0,
      ids: null, answers: {}, current: 0, startedAt: Date.now(), timer: !!set.timer, minutes: set.timerMinutes, submitted: false,
    };
    Store.state.exam.ids = Exercises.buildExam(Store.state.exam.seed);
    Store.flush();
    draw();
    const h = container.querySelector('h1'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
  }
  function startTick() {
    const out = function () {
      const ms = remainingMs();
      const el = container && container.querySelector('[data-timer-out]');
      if (ms <= 0) { stopTick(); submit(true); return; }
      if (el) { el.textContent = fmtTime(ms); el.classList.toggle('low', ms < 60000); }
    };
    out();
    tick = setInterval(out, 1000);
  }
  function stopTick() { if (tick) clearInterval(tick); tick = null; }

  Views.profhamur = {
    render: function () { return '<div data-exam></div>'; },
    mount: function (el) {
      container = el.querySelector('[data-exam]');
      // Gild vistuð staða? Annars byrjað upp á nýtt.
      const e = exam();
      if (e && (!Array.isArray(e.ids) || !e.ids.every(function (id) { return Exercises.byId[id]; }))) Store.state.exam = null;
      if (exam() && !exam().submitted && exam().timer && remainingMs() <= 0) { container.innerHTML = ''; submit(true); }
      else draw();
      container.addEventListener('click', function (ev) {
        const t = ev.target;
        if (t.closest('[data-start]') || t.closest('[data-new]')) { start(); return; }
        const g = t.closest('[data-goto]');
        if (g) { go(+g.dataset.goto); return; }
        if (t.closest('[data-prev]')) { go(exam().current - 1); return; }
        if (t.closest('[data-next]')) { go(exam().current + 1); return; }
        if (t.closest('[data-submit]')) {
          saveCurrent();
          const left = exam().ids.filter(function (id) { return !isAnswered(id); }).length;
          const msg = left ? 'Þú átt eftir að svara ' + left + (left === 1 ? ' spurningu' : ' spurningum') + ' að hluta eða öllu leyti. Ósvaraðir hlutar teljast rangir.' : 'Öllum spurningum hefur verið svarað.';
          UI.confirm(msg + ' Eftir skil sérðu stig, rétt svör og útreikninga.', 'Skila prófi', 'Skila prófinu?').then(function (ok) { if (ok) submit(false); });
          return;
        }
        if (t.closest('[data-abort]')) {
          UI.confirm('Svörin í þessu prófi glatast og það verður ekki skráð.', 'Hætta við prófið', 'Hætta við prófið?').then(function (ok) {
            if (!ok) return;
            Store.state.exam = null; Store.flush(); draw();
          });
        }
      });
      container.addEventListener('change', function (ev) {
        if (ev.target.matches('[data-timer]')) {
          Store.state.settings.timer = ev.target.checked; Store.save();
          container.querySelector('[data-minutes]').disabled = !ev.target.checked;
          return;
        }
        if (ev.target.matches('[data-minutes]')) { Store.state.settings.timerMinutes = +ev.target.value; Store.save(); return; }
        if (ev.target.closest('.ex')) { saveCurrent(); refreshNav(); }
      });
      container.addEventListener('input', function (ev) { if (ev.target.closest('.ex')) { saveCurrent(); refreshNav(); } });
      container.addEventListener('submit', function (ev) { ev.preventDefault(); });
    },
    unmount: function () { saveCurrent(); stopTick(); container = null; },
  };

  function refreshNav() {
    const e = exam();
    if (!e || e.submitted) return;
    container.querySelectorAll('[data-goto]').forEach(function (b) {
      const j = +b.dataset.goto;
      const ans = isAnswered(e.ids[j]);
      b.classList.toggle('answered', ans);
      b.setAttribute('aria-label', 'Spurning ' + (j + 1) + (ans ? ', svarað' : ', ósvarað'));
      b.querySelector('small').textContent = ans ? 'svarað' : '–';
    });
    const cnt = container.querySelector('.exam-bar .small');
    if (cnt) cnt.textContent = e.ids.filter(isAnswered).length + ' af ' + e.ids.length + ' svarað';
  }
})(typeof self !== 'undefined' ? self : this);
