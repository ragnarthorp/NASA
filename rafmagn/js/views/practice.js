/* Æfingar — verkefni með athugun, vísbendingu, lausn og framvindu eftir efnisflokki. */
(function (root) {
  'use strict';
  const Views = root.Views = root.Views || {};
  const UI = root.UI, Store = root.Store, Exercises = root.Exercises;
  const esc = UI.esc;
  let container = null;
  let draftTimer = null;

  function statusTag(id) {
    const p = Store.state.progress[id];
    if (p && p.solved) return '<span class="tag tag-ok" data-status>✓ Leyst' + (p.firstTry ? ' í fyrstu tilraun' : '') + '</span>';
    if (p && p.attempts) return '<span class="tag tag-warn" data-status>Í vinnslu</span>';
    return '<span class="tag" data-status>Óleyst</span>';
  }

  function statsHTML() {
    const list = Exercises.practice();
    const stats = Store.topicStats(Exercises.TOPICS, list);
    const solved = stats.reduce(function (a, s) { return a + s.solved; }, 0);
    let h = '<div class="section-head"><h2 id="stats-h" style="font-size:1.2rem">Árangur eftir efnisflokki</h2>' +
      '<span><strong>' + solved + ' af ' + list.length + '</strong> leystar</span></div>';
    stats.forEach(function (s) {
      h += '<div class="topic-row"><span>' + esc(s.topic.name) + '</span>' + UI.progressBar(s.solved, s.total, s.topic.name) +
        '<span class="small"><strong>' + s.solved + '/' + s.total + '</strong> leystar' + (s.firstTry ? ', ' + s.firstTry + ' í fyrstu tilraun' : '') + '</span></div>';
    });
    h += '<div class="actions"><button type="button" class="btn-small btn-danger" data-reset>Endurstilla framvindu</button></div>';
    return h;
  }

  function listHTML() {
    const set = Store.state.settings;
    const items = Exercises.practice().filter(function (e) {
      if (set.practiceTopic !== 'all' && e.topic !== set.practiceTopic) return false;
      if (set.onlyUnsolved) { const p = Store.state.progress[e.id]; if (p && p.solved) return false; }
      return true;
    });
    if (!items.length) {
      return '<div class="card notice-ok"><p style="margin:0">✓ Engar óleystar æfingar í þessum flokki. Taktu hakið af „Sýna aðeins óleystar“ til að sjá allar, eða veldu annan flokk.</p></div>';
    }
    return items.map(function (e, i) {
      return UI.exerciseCard(e, { mode: 'practice', number: i + 1, draft: Store.state.drafts[e.id], status: statusTag(e.id) });
    }).join('');
  }

  function filtersHTML() {
    const set = Store.state.settings;
    const list = Exercises.practice();
    const btn = function (id, name, count) {
      return '<button type="button" class="btn-small" data-topic="' + id + '" aria-pressed="' + (set.practiceTopic === id) + '">' + esc(name) + ' (' + count + ')</button>';
    };
    return '<div class="filters" role="group" aria-label="Sía eftir efnisflokki">' + btn('all', 'Allir flokkar', list.length) +
      Exercises.TOPICS.map(function (t) { return btn(t.id, t.name, list.filter(function (e) { return e.topic === t.id; }).length); }).join('') + '</div>' +
      '<label class="choice" style="display:inline-flex"><input type="checkbox" data-unsolved' + (set.onlyUnsolved ? ' checked' : '') + '> Sýna aðeins óleystar</label>';
  }

  function refreshStats() { const s = container.querySelector('[data-stats]'); if (s) s.innerHTML = statsHTML(); }
  function refreshList() { container.querySelector('[data-list]').innerHTML = listHTML(); }

  function saveDraft(card) {
    const ex = Exercises.byId[card.dataset.id];
    Store.state.drafts[ex.id] = UI.readAnswers(card, ex);
    Store.save();
  }

  function checkCard(card) {
    const ex = Exercises.byId[card.dataset.id];
    const ans = UI.readAnswers(card, ex);
    Store.state.drafts[ex.id] = ans;
    const g = UI.gradeExercise(ex, ans);
    const overall = card.querySelector('[data-overall]');
    if (ex.type === 'numeric') {
      ex.answers.forEach(function (a) {
        const input = card.querySelector('input[data-key="' + a.key + '"]');
        const fb = document.getElementById(input.id + '-fb');
        const r = g.parts[a.key];
        fb.className = 'fb fb-' + (r.status === 'empty' ? 'invalid' : UI.feedbackClass(r.status));
        fb.innerHTML = r.status === 'empty' ? '! Skrifaðu svar í reitinn.' : UI.feedbackText(r);
        input.setAttribute('aria-invalid', r.status === 'invalid' || r.status === 'empty' ? 'true' : 'false');
      });
    } else {
      const fb = card.querySelector('[data-mc-fb]');
      const r = g.parts.mc;
      card.querySelectorAll('.choice').forEach(function (l) { l.classList.remove('is-correct', 'is-wrong'); });
      if (ans.choice != null) card.querySelectorAll('.choice')[ans.choice].classList.add(r.status === 'correct' ? 'is-correct' : 'is-wrong');
      fb.className = 'fb fb-' + (r.status === 'empty' ? 'invalid' : UI.feedbackClass(r.status));
      fb.innerHTML = r.status === 'empty' ? '! Veldu einn svarmöguleika.' : UI.feedbackText(r);
    }
    // Tóm eða ógild svör teljast ekki sem tilraun.
    const anyInvalid = Object.keys(g.parts).some(function (k) { return g.parts[k].status === 'invalid' || g.parts[k].status === 'empty'; });
    if (anyInvalid && !g.allCorrect) {
      overall.textContent = 'Fylltu út alla reiti með gildum tölum til að athuga svarið.';
      Store.save();
      return;
    }
    Store.recordCheck(ex.id, g.allCorrect);
    if (g.allCorrect) overall.innerHTML = '<span class="tag tag-ok">✓ Allt rétt</span> Vel gert!';
    else if (g.total > 1) overall.innerHTML = '<span class="tag tag-bad">' + g.correct + ' af ' + g.total + ' rétt</span> Lagaðu það sem er merkt og athugaðu aftur.';
    else overall.innerHTML = '<span class="tag tag-bad">✗ Ekki rétt</span> Reyndu aftur — vísbendingin getur hjálpað.';
    const st = card.querySelector('[data-status]');
    if (st) st.outerHTML = statusTag(ex.id);
    refreshStats();
  }

  function toggle(card, act, btn) {
    const ex = Exercises.byId[card.dataset.id];
    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    const open = panel.hidden;
    panel.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    if (act === 'hint') btn.textContent = open ? 'Fela vísbendingu' : 'Vísbending';
    else btn.textContent = open ? 'Fela lausn' : 'Sýna lausn';
    if (open) Store.mark(ex.id, act === 'hint' ? 'hint' : 'solution');
  }

  Views.aefingar = {
    render: function (sub) {
      if (sub && (sub === 'all' || Exercises.TOPICS.some(function (t) { return t.id === sub; }))) {
        Store.state.settings.practiceTopic = sub; Store.save();
      }
      return '<div class="section-head"><div><p class="eyebrow">Æfingar</p><h1>Æfingar með endurgjöf</h1>' +
        '<p class="lead">Reiknaðu á blað eða í reiknivélinni þinni og skrifaðu svarið í reitinn. Svör í A og mA (eða Ω og kΩ) eru metin eins, og hæfileg námundun er í lagi.</p></div></div>' +
        '<section class="card" data-stats aria-labelledby="stats-h" style="margin-bottom:18px">' + statsHTML() + '</section>' +
        '<div class="no-print">' + filtersHTML() + '</div><div class="stack" data-list style="margin-top:16px">' + listHTML() + '</div>';
    },
    mount: function (el) {
      container = el;
      el.addEventListener('submit', function (e) {
        const form = e.target.closest('form.answers');
        if (!form) return;
        e.preventDefault();
        checkCard(form.closest('.ex'));
      });
      el.addEventListener('click', function (e) {
        const topic = e.target.closest('[data-topic]');
        if (topic) {
          Store.state.settings.practiceTopic = topic.dataset.topic; Store.save();
          el.querySelectorAll('[data-topic]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === topic)); });
          history.replaceState(null, '', '#aefingar:' + topic.dataset.topic);
          refreshList();
          return;
        }
        const act = e.target.closest('[data-act]');
        if (act) { toggle(act.closest('.ex'), act.dataset.act, act); return; }
        if (e.target.closest('[data-reset]')) {
          UI.confirm('Þetta eyðir öllum vistuðum svörum, árangri í æfingum og niðurstöðum æfingaprófa í þessum vafra. Ekki er hægt að afturkalla það.', 'Já, endurstilla', 'Endurstilla framvindu?')
            .then(function (ok) {
              if (!ok) return;
              Store.resetProgress(); refreshStats(); refreshList();
              UI.announce('Framvinda hefur verið endurstillt.');
            });
        }
      });
      el.addEventListener('change', function (e) {
        if (e.target.matches('[data-unsolved]')) {
          Store.state.settings.onlyUnsolved = e.target.checked; Store.save(); refreshList(); return;
        }
        const card = e.target.closest('.ex');
        if (card) saveDraft(card);
      });
      el.addEventListener('input', function (e) {
        const card = e.target.closest('.ex');
        if (!card) return;
        clearTimeout(draftTimer);
        draftTimer = setTimeout(function () { saveDraft(card); }, 250);
      });
    },
    navigate: function (sub) {
      if (!sub) return false;
      if (sub !== 'all' && !Exercises.TOPICS.some(function (t) { return t.id === sub; })) return false;
      Store.state.settings.practiceTopic = sub; Store.save();
      container.querySelectorAll('[data-topic]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.topic === sub)); });
      refreshList();
      return true;
    },
    unmount: function () { clearTimeout(draftTimer); container = null; },
  };
})(typeof self !== 'undefined' ? self : this);
