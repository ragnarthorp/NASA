/* Lítil DOM-hjálparföll */
(function () {
  const RF = window.RF;
  /* append/replaceWith sleppa null/false/undefined (valkvæðir hlutar síðna) */
  for (const proto of [Element.prototype, DocumentFragment.prototype]) {
    const orig = proto.append;
    proto.append = function (...a) { return orig.apply(this, a.filter((x) => x !== null && x !== undefined && x !== false)); };
  }
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  /* h('div.card#id', {attr}, ...börn) */
  function h(tag, attrs, ...kids) {
    const m = tag.match(/^([a-z0-9]+)?((?:[.#][\w-]+)*)$/i);
    const el = document.createElement(m[1] || 'div');
    (m[2].match(/[.#][\w-]+/g) || []).forEach((t) => (t[0] === '.' ? el.classList.add(t.slice(1)) : (el.id = t.slice(1))));
    if (attrs && (typeof attrs !== 'object' || attrs instanceof Node || Array.isArray(attrs))) { kids.unshift(attrs); attrs = null; }
    if (attrs) for (const k in attrs) {
      const v = attrs[k];
      if (v === null || v === undefined || v === false) continue;
      if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'class') el.className += ' ' + v;
      else if (k === 'style' && typeof v === 'object') for (const sk in v) el.style.setProperty(sk.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()), v[sk]);
      else el.setAttribute(k, v === true ? '' : v);
    }
    const add = (c) => { if (c === null || c === undefined || c === false) return; if (Array.isArray(c)) c.forEach(add); else el.appendChild(c instanceof Node ? c : document.createTextNode(String(c))); };
    kids.forEach(add);
    return el;
  }
  const html = (s) => { const t = document.createElement('template'); t.innerHTML = s.trim(); return t.content; };
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 3200);
  }
  function download(blob, name) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  }
  /* Formúlur í HTML-texta: <f>…</f> og <fb>…</fb> */
  const renderMathTags = (s) => s.replace(/<fb>([\s\S]*?)<\/fb>/g, (m, x) => '<div class="fblock">' + RF.m(x) + '</div>').replace(/<f>([\s\S]*?)<\/f>/g, (m, x) => RF.m(x));
  const shuffle = (arr, r = Math.random) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const famChip = (fam, text) => h('span.chip.fam-' + fam, text);
  function confirmBox(msg) { return window.confirm(msg); }
  RF.dom = { $, $$, h, html, toast, download, renderMathTags, shuffle, famChip, confirmBox };
})();
