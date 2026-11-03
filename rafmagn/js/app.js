/*
 * app.js — einföld leið (hash) á milli síðna og ræsing.
 * Leiðir: #yfirlit, #glosur[:kafli], #reiknivelar[:ohm|rad|hlid], #aefingar[:flokkur], #profhamur, #formulublad[:prenta]
 */
(function (root) {
  'use strict';
  const Views = root.Views;
  const ROUTES = {
    yfirlit: 'Yfirlit', glosur: 'Glósur', reiknivelar: 'Reiknivélar', aefingar: 'Æfingar', profhamur: 'Prófhamur', formulublad: 'Formúlublað',
  };
  const main = document.getElementById('main');
  let current = null;
  let currentRoute = null;

  function parse() {
    const h = decodeURIComponent(location.hash.replace(/^#/, ''));
    const i = h.indexOf(':');
    const route = i >= 0 ? h.slice(0, i) : h;
    const sub = i >= 0 ? h.slice(i + 1) : '';
    return { route: ROUTES[route] ? route : 'yfirlit', sub: sub };
  }

  function render(fromNav) {
    const p = parse();
    // Innri tenglar á sömu síðu (t.d. efnisyfirlit glósa) fletta aðeins að kaflanum.
    if (fromNav && current && p.route === currentRoute && current.navigate && current.navigate(p.sub)) return;
    if (current && current.unmount) current.unmount();
    const view = Views[p.route];
    current = view;
    currentRoute = p.route;
    main.innerHTML = '<div class="wrap view-' + p.route + '">' + view.render(p.sub) + '</div>';
    if (view.mount) view.mount(main.firstElementChild, p.sub);
    document.title = ROUTES[p.route] + ' · Rafmagnsfræði · Rað- og hliðtenging';
    document.body.classList.toggle('print-sheet', p.route === 'formulublad');
    document.querySelectorAll('.mainnav a').forEach(function (a) {
      if (a.dataset.route === p.route) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    const target = p.sub && document.getElementById(p.sub);
    if (target) target.scrollIntoView();
    else root.scrollTo(0, 0);
    if (fromNav) main.focus({ preventScroll: !!target });
  }

  root.App = { render: render, go: function (hash) { if (location.hash === hash) render(true); else location.hash = hash; } };
  root.addEventListener('hashchange', function () { render(true); });
  render(false);
})(typeof self !== 'undefined' ? self : this);
