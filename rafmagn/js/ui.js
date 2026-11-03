/*
 * ui.js — sameiginlegir viðmótshlutar: HTML-hjálparföll, tengimyndir, lausnarskref,
 * æfingaspjöld (notuð bæði í æfingum og prófham) og staðfestingargluggi.
 */
(function (root) {
  'use strict';
  const Calc = root.Calc, Grade = root.Grade, Explain = root.Explain, Diagrams = root.Diagrams, Exercises = root.Exercises;
  const S = Explain.sym;

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function diagram(spec, caption) {
    if (!spec) return '';
    return '<figure class="diagram">' + Diagrams[spec.kind](spec) + (caption ? '<figcaption>' + caption + '</figcaption>' : '') + '</figure>';
  }

  function steps(list) {
    return '<ol class="steps">' + list.map(function (st) {
      return '<li><h4>' + st.title + '</h4>' + st.html.map(function (l) { return '<div class="line">' + l + '</div>'; }).join('') + '</li>';
    }).join('') + '</ol>';
  }

  function unitControl(id, units, selected, labelText) {
    if (units.length === 1) return '<span class="unit-fixed" id="' + id + '">' + esc(units[0]) + '</span>';
    return '<select id="' + id + '" aria-label="' + esc(labelText) + '" data-unit>' + units.map(function (u) {
      return '<option value="' + esc(u) + '"' + (u === selected ? ' selected' : '') + '>' + esc(u) + '</option>';
    }).join('') + '</select>';
  }

  const TOPIC_TONE = { seriesR: 'series', seriesU: 'series', parallelR: 'parallel', parallelI: 'parallel' };
  function topicTag(id) {
    const tone = TOPIC_TONE[id];
    return '<span class="tag' + (tone ? ' tag-' + tone : '') + '">' + esc(Exercises.topicName(id)) + '</span>';
  }

  function correctText(a) {
    if (a.units.length === 1) return Calc.eqSign(Calc.fromSI(a.value, a.units[0])) + ' ' + Calc.formatIn(a.value, a.units[0]);
    return Calc.eqSign(a.value) + ' ' + Calc.formatBoth(a.value, a.q);
  }

  /* ---------- Æfingaspjald ---------- */
  /**
   * mode: 'practice' (athuga, vísbending, lausn), 'exam' (aðeins svarreitir) eða 'review' (niðurstaða eftir próf).
   */
  function exerciseCard(ex, o) {
    o = o || {};
    const mode = o.mode || 'practice';
    const pre = (mode === 'practice' ? 'p' : 'x') + '-' + ex.id;
    const draft = o.draft || {};
    const fields = draft.fields || {};
    const locked = mode === 'review';
    let head = '<div class="ex-head"><div>' + topicTag(ex.topic) +
      '<h3 id="' + pre + '-title">' + (o.number ? o.number + '. ' : '') + esc(ex.title) + '</h3></div>';
    if (o.status) head += o.status;
    head += '</div>';
    let body = '<p class="prompt">' + ex.prompt + '</p>' + diagram(ex.diagram);
    if (mode === 'practice') body += toolsHTML(pre, ex.type === 'numeric' ? ex.answers[0].q : 'I');

    let form = '<form class="answers" data-ex="' + ex.id + '" novalidate aria-labelledby="' + pre + '-title">';
    if (ex.type === 'numeric') {
      form += '<div class="answers-grid">';
      ex.answers.forEach(function (a) {
        const f = fields[a.key] || {};
        const unit = f.u && a.units.indexOf(f.u) >= 0 ? f.u : (a.unit || a.units[0]);
        const id = pre + '-' + a.key;
        const res = o.results && o.results[a.key];
        form += '<div class="field"><label for="' + id + '">' + a.label + '</label>' +
          '<div class="inputrow"><input type="text" id="' + id + '" data-key="' + esc(a.key) + '" inputmode="decimal" autocomplete="off" spellcheck="false" value="' + esc(f.v || '') + '"' +
          (locked ? ' readonly' : '') + ' aria-describedby="' + id + '-fb">' +
          unitControl(id + '-unit', a.units, unit, 'Eining fyrir ' + a.key) + '</div>' +
          '<p class="fb' + (res ? ' fb-' + cls(res.status) : '') + '" id="' + id + '-fb" aria-live="polite">' + (res ? feedbackText(res) : '') + '</p>';
        if (mode === 'review') form += '<p class="help"><strong>Rétt svar:</strong> ' + correctText(a).replace(/^= /, '') + '</p>';
        form += '</div>';
      });
      form += '</div>';
    } else {
      form += '<fieldset><legend>Veldu eitt svar</legend><div class="mc-options">';
      ex.options.forEach(function (opt, i) {
        const checked = draft.choice === i;
        let extra = '';
        if (mode === 'review') extra = opt.correct ? ' is-correct' : (checked ? ' is-wrong' : '');
        form += '<label class="choice' + extra + '"><input type="radio" name="' + pre + '-mc" value="' + i + '"' + (checked ? ' checked' : '') + (locked ? ' disabled' : '') + '>' +
          '<span>' + opt.text + (mode === 'review' && opt.correct ? ' <strong>(rétt svar)</strong>' : '') + (mode === 'review' && checked && !opt.correct ? ' <strong>(þitt svar)</strong>' : '') + '</span></label>';
      });
      form += '</div></fieldset>';
      const res = o.results && o.results.mc;
      form += '<p class="fb' + (res ? ' fb-' + cls(res.status) : '') + '" aria-live="polite" data-mc-fb>' + (res ? feedbackText(res) : '') + '</p>';
    }
    if (mode === 'practice') {
      form += '<div class="actions">' +
        '<button type="submit" class="btn-primary">Athuga svar</button>' +
        '<button type="button" data-act="hint" aria-expanded="false" aria-controls="' + pre + '-hint">Vísbending</button>' +
        '<button type="button" data-act="solution" aria-expanded="false" aria-controls="' + pre + '-sol">Sýna lausn</button>' +
        '</div><p class="overall" aria-live="polite" data-overall></p>';
    }
    form += '</form>';
    let after = '';
    if (mode === 'practice') {
      after += '<div class="reveal reveal-hint" id="' + pre + '-hint" hidden><h4>Vísbending</h4><p>' + ex.hint + '</p></div>';
      after += '<div class="reveal reveal-solution" id="' + pre + '-sol" hidden><h4>Lausn</h4>' + steps(ex.solution) + '</div>';
    } else if (mode === 'review') {
      after += '<details class="sol"><summary>Útreikningur og lausn</summary>' + steps(ex.solution) + '</details>';
    }
    return '<article class="card ex" id="' + pre + '" data-id="' + ex.id + '">' + head + body + form + after + '</article>';
  }

  /* ---------- Hjálpartæki í hverju dæmi: lögmál Ohms og einingabreytir ---------- */
  const QNAMES = { U: 'Spenna (V)', I: 'Straumur (A)', R: 'Viðnám (Ω)' };
  function ohmRefHTML() {
    const F = Explain.FORMULA;
    return '<h4>Lögmál Ohms</h4><div class="formula"><span>' + F.U + '</span><span>' + F.I + '</span><span>' + F.R + '</span></div>' +
      '<div class="table-wrap"><table class="choose-table"><thead><tr><th scope="col">Gefið</th><th scope="col">Óþekkt</th><th scope="col">Formúla</th></tr></thead><tbody>' +
      '<tr><td>' + S('I') + ' og ' + S('R') + '</td><td>spenna ' + S('U') + '</td><td>' + F.U + '</td></tr>' +
      '<tr><td>' + S('U') + ' og ' + S('R') + '</td><td>straumur ' + S('I') + '</td><td>' + F.I + '</td></tr>' +
      '<tr><td>' + S('U') + ' og ' + S('I') + '</td><td>viðnám ' + S('R') + '</td><td>' + F.R + '</td></tr></tbody></table></div>' +
      '<p class="help">Breyttu fyrst í V, A og Ω. Í heilli rás notarðu heildarstærðir: ' + S('U', 'H') + ' = ' + S('I', 'H') + ' · ' + S('R', 'H') + '.</p>';
  }
  function unitOptions(q, selected) {
    return Calc.PREFIX_UNITS[q].map(function (u) { return '<option value="' + esc(u) + '"' + (u === selected ? ' selected' : '') + '>' + esc(u) + '</option>'; }).join('');
  }
  function converterHTML(pre, q) {
    const id = pre + '-conv';
    return '<h4>Einingabreytir</h4><div class="conv" data-conv>' +
      '<div class="conv-row">' +
      '<div><label for="' + id + '-q">Stærð</label><select id="' + id + '-q" data-conv-q>' +
      ['U', 'I', 'R'].map(function (k) { return '<option value="' + k + '"' + (k === q ? ' selected' : '') + '>' + QNAMES[k] + '</option>'; }).join('') + '</select></div>' +
      '<div><label for="' + id + '-v">Gildi</label><input type="text" id="' + id + '-v" data-conv-v inputmode="decimal" autocomplete="off" spellcheck="false" aria-describedby="' + id + '-msg"></div>' +
      '<div><label for="' + id + '-u">Eining</label><select id="' + id + '-u" data-conv-u>' + unitOptions(q, Calc.BASE_UNIT[q]) + '</select></div>' +
      '</div><p class="msg" id="' + id + '-msg" data-conv-msg></p><div data-conv-out aria-live="polite"><p class="help">Sláðu inn gildi til að sjá það í öllum einingum.</p></div>' +
      '<p class="help">' + Calc.PREFIXES.map(function (x) { return '<strong>' + x.p + '</strong> = ' + x.name + ' = ' + x.text; }).join(' · ') + '</p></div>';
  }
  function toolsHTML(pre, q) {
    return '<div class="tools no-print" role="group" aria-label="Hjálpartæki"><span class="small muted">Hjálpartæki:</span>' +
      '<button type="button" class="btn-small" data-tool aria-expanded="false" aria-controls="' + pre + '-tool-ohm">Lögmál Ohms</button>' +
      '<button type="button" class="btn-small" data-tool aria-expanded="false" aria-controls="' + pre + '-tool-conv">Einingabreytir</button></div>' +
      '<div class="reveal reveal-tool" id="' + pre + '-tool-ohm" hidden>' + ohmRefHTML() + '</div>' +
      '<div class="reveal reveal-tool" id="' + pre + '-tool-conv" hidden>' + converterHTML(pre, q) + '</div>';
  }
  function updateConverter(box) {
    const v = box.querySelector('[data-conv-v]');
    const u = box.querySelector('[data-conv-u]');
    const msg = box.querySelector('[data-conv-msg]');
    const out = box.querySelector('[data-conv-out]');
    const raw = v.value;
    if (!raw.trim()) {
      msg.textContent = ''; msg.className = 'msg'; v.setAttribute('aria-invalid', 'false');
      out.innerHTML = '<p class="help">Sláðu inn gildi til að sjá það í öllum einingum.</p>';
      return;
    }
    const p = Calc.parseNumber(raw);
    v.setAttribute('aria-invalid', p.ok ? 'false' : 'true');
    msg.className = 'msg' + (p.ok ? (p.warning ? ' msg-warn' : '') : ' msg-error');
    msg.textContent = p.ok ? (p.warning || '') : p.message;
    if (!p.ok) { out.innerHTML = ''; return; }
    const src = Calc.formatNumber(p.value) + ' ' + u.value;
    out.innerHTML = '<div class="table-wrap"><table class="conv-table"><thead><tr><th scope="col">Eining</th><th scope="col">Gildi</th><th scope="col">Útreikningur</th></tr></thead><tbody>' +
      Calc.convertAll(p.value, u.value).map(function (r) {
        const same = r.unit === u.value;
        return '<tr' + (same ? ' class="conv-same"' : '') + '><th scope="row">' + esc(r.unit) + '</th><td><strong>' + esc(Calc.formatNumber(r.value)) + ' ' + esc(r.unit) + '</strong></td><td>' +
          (same ? 'gefið gildi' : esc(src + ' ' + r.op + ' = ' + Calc.formatNumber(r.value) + ' ' + r.unit)) + '</td></tr>';
      }).join('') + '</tbody></table></div>';
  }
  if (root.document) {
    document.addEventListener('click', function (e) {
      const btn = e.target.closest('[data-tool]');
      if (!btn) return;
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      panel.hidden = !panel.hidden;
      btn.setAttribute('aria-expanded', String(!panel.hidden));
      btn.classList.toggle('is-open', !panel.hidden);
      if (!panel.hidden) { const f = panel.querySelector('[data-conv-v]'); if (f) f.focus(); }
    });
    const onConv = function (e) {
      const box = e.target.closest('[data-conv]');
      if (!box) return;
      if (e.target.matches('[data-conv-q]')) {
        const q = e.target.value;
        box.querySelector('[data-conv-u]').innerHTML = unitOptions(q, Calc.BASE_UNIT[q]);
      }
      updateConverter(box);
    };
    document.addEventListener('input', onConv);
    document.addEventListener('change', onConv);
  }

  function cls(status) { return status === 'correct' ? 'correct' : status === 'invalid' ? 'invalid' : 'wrong'; }
  function feedbackText(r) {
    if (r.status === 'correct') return '✓ ' + esc(r.message);
    if (r.status === 'invalid') return '! ' + esc(r.message);
    if (r.status === 'empty') return '– Ekki svarað.';
    return '✗ ' + esc(r.message);
  }

  /** Les svör úr æfingaspjaldi. */
  function readAnswers(card, ex) {
    const out = { fields: {}, choice: null };
    if (ex.type === 'numeric') {
      ex.answers.forEach(function (a) {
        const input = card.querySelector('input[data-key="' + a.key + '"]');
        const sel = card.querySelector('#' + input.id + '-unit');
        out.fields[a.key] = { v: input.value, u: sel && sel.tagName === 'SELECT' ? sel.value : a.units[0] };
      });
    } else {
      const c = card.querySelector('input[type=radio]:checked');
      out.choice = c ? Number(c.value) : null;
    }
    return out;
  }

  /** Metur öll svör æfingar. Tómir reitir fá stöðuna 'empty'. */
  function gradeExercise(ex, ans) {
    const parts = {};
    let correct = 0, total = 0, answered = 0;
    if (ex.type === 'numeric') {
      ex.answers.forEach(function (a) {
        total++;
        const f = (ans.fields || {})[a.key] || { v: '', u: a.units[0] };
        if (!String(f.v || '').trim()) { parts[a.key] = { status: 'empty', message: 'Ekki svarað.' }; return; }
        answered++;
        const unit = a.units.indexOf(f.u) >= 0 ? f.u : a.units[0];
        const r = Grade.gradeNumeric(f.v, unit, a);
        parts[a.key] = r;
        if (r.status === 'correct') correct++;
      });
    } else {
      total = 1;
      if (ans.choice == null) parts.mc = { status: 'empty', message: 'Ekki svarað.' };
      else { answered = 1; parts.mc = Grade.gradeChoice(ans.choice, ex.options); if (parts.mc.status === 'correct') correct = 1; }
    }
    return { parts: parts, correct: correct, total: total, answered: answered, allCorrect: correct === total };
  }

  /* ---------- Staðfesting og tilkynningar ---------- */
  function confirmDialog(text, okText, title) {
    const dlg = document.getElementById('confirm');
    if (!dlg || typeof dlg.showModal !== 'function') return Promise.resolve(root.confirm(text));
    document.getElementById('confirm-title').textContent = title || 'Ertu viss?';
    document.getElementById('confirm-text').textContent = text;
    document.getElementById('confirm-ok').textContent = okText || 'Já';
    const opener = document.activeElement;
    return new Promise(function (resolve) {
      dlg.returnValue = '';
      dlg.addEventListener('close', function onClose() {
        dlg.removeEventListener('close', onClose);
        if (opener && opener.focus && document.contains(opener)) opener.focus();
        resolve(dlg.returnValue === 'ok');
      });
      dlg.showModal();
      document.getElementById('confirm-ok').focus();
    });
  }

  let liveEl = null;
  function announce(text) {
    if (!liveEl) {
      liveEl = document.createElement('div');
      liveEl.className = 'sr-only';
      liveEl.setAttribute('role', 'status');
      liveEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(liveEl);
    }
    liveEl.textContent = '';
    setTimeout(function () { liveEl.textContent = text; }, 30);
  }

  function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }
  function progressBar(value, max, label) {
    return '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="' + max + '" aria-valuenow="' + value + '" aria-label="' + esc(label) + '"><span style="width:' + pct(value, max) + '%"></span></div>';
  }

  root.UI = {
    esc: esc, S: S, F: Explain.frac, diagram: diagram, steps: steps, unitControl: unitControl, topicTag: topicTag,
    correctText: correctText, toolsHTML: toolsHTML, updateConverter: updateConverter, exerciseCard: exerciseCard, readAnswers: readAnswers, gradeExercise: gradeExercise,
    feedbackText: feedbackText, feedbackClass: cls, confirm: confirmDialog, announce: announce, pct: pct, progressBar: progressBar,
  };
})(typeof self !== 'undefined' ? self : this);
