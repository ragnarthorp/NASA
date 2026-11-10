/* Hjálparföll: tölusnið (íslenska), lestur svara, slembitölur og formúlurithátturinn.
   Virkar bæði í vafra og í Node (prófanir og PDF-smíði). */
(function (G) {
  const RF = (G.RF = G.RF || {});

  /* ---------- Slembitölur með fræi (endurtakanleg dæmi) ---------- */
  function rng(seed) {
    let a = (seed >>> 0) || 1;
    const next = () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    next.pick = (arr) => arr[Math.floor(next() * arr.length)];
    next.int = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1));
    next.step = (lo, hi, step) => { const n = Math.round((hi - lo) / step); return round(lo + next.int(0, n) * step, 6); };
    return next;
  }
  const newSeed = () => (Math.floor(Math.random() * 2 ** 31) ^ Date.now()) >>> 0;

  function round(x, d) { const f = Math.pow(10, d); return Math.round((x + Number.EPSILON * Math.sign(x)) * f) / f; }

  /* ---------- Tölusnið: komma sem tugabrotsmerki ---------- */
  function autoDec(x) {
    const a = Math.abs(x);
    if (a === 0) return 0;
    if (a >= 100) return 2;
    if (a >= 1) return 2;
    if (a >= 0.1) return 3;
    if (a >= 0.01) return 4;
    return 5;
  }
  /* fmt(x)            -> sjálfvirkur fjöldi aukastafa, núllum aftast sleppt
     fmt(x, d)         -> d aukastafir, núllum aftast sleppt
     fmt(x, d, true)   -> nákvæmlega d aukastafir */
  function fmt(x, d, fixed) {
    if (x === null || x === undefined || !isFinite(x)) return '–';
    if (d === undefined || d === null) d = autoDec(x);
    let s = round(x, d).toFixed(d);
    if (!fixed && s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    if (s === '-0') s = '0';
    const neg = s[0] === '-';
    if (neg) s = s.slice(1);
    let [i, f] = s.split('.');
    if (i.length > 4) i = i.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return (neg ? '−' : '') + i + (f ? ',' + f : '');
  }
  const fmtFixed = (x, d) => fmt(x, d, true);
  /* Svör: a.m.k. 4 markverðir stafir og a.m.k. 2 aukastafir (t.d. 2,373 · 18,99 · 230,91 · 0,05498) */
  function fmtS(x) {
    if (!isFinite(x)) return '–';
    if (x === 0) return '0';
    const d = Math.min(5, Math.max(2, 3 - Math.floor(Math.log10(Math.abs(x)))));
    return fmt(x, d);
  }

  /* Les svar nemanda: leyfir kommu eða punkt, bil, einingar aftan við, − og e-rithátt. */
  function parseNum(str) {
    if (str === null || str === undefined) return NaN;
    let s = String(str).trim();
    if (!s) return NaN;
    s = s.replace(/[−–—]/g, '-').replace(/[\s  ]/g, '');
    s = s.replace(/×10\^?/g, 'e').replace(/·10\^?/g, 'e').replace(/\*10\^/g, 'e');
    const m = s.match(/^[+-]?[\d.,]*\d(?:[eE][+-]?\d+)?/);
    if (!m) return NaN;
    let n = m[0];
    const hasC = n.indexOf(',') >= 0, hasP = n.indexOf('.') >= 0;
    if (hasC && hasP) {
      if (n.lastIndexOf(',') > n.lastIndexOf('.')) n = n.replace(/\./g, '').replace(',', '.');
      else n = n.replace(/,/g, '');
    } else if (hasC) {
      if ((n.match(/,/g) || []).length > 1) return NaN;
      n = n.replace(',', '.');
    } else if ((n.match(/\./g) || []).length > 1) return NaN;
    const v = parseFloat(n);
    return isFinite(v) ? v : NaN;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  /* ---------- Formúlurithátturinn ----------
     \f{teljari}{nefnari}  brot
     _{x} eða _x           lágletur
     ^{x} eða ^x           hátt letur
     Allt annað er venjulegur texti. Sami rithátturinn er notaður á vef og í PDF. */
  function parseMath(src) {
    let i = 0;
    function group() {
      if (src[i] === '{') {
        i++;
        const out = seq('}');
        i++;
        return out;
      }
      const ch = src[i++];
      return [{ t: 'txt', v: ch }];
    }
    function seq(stop) {
      const out = [];
      let buf = '';
      const flush = () => { if (buf) { out.push({ t: 'txt', v: buf }); buf = ''; } };
      while (i < src.length && src[i] !== stop) {
        const c = src[i];
        if (c === '\\' && src[i + 1] === 'f') {
          flush(); i += 2;
          const n = group(), d = group();
          out.push({ t: 'frac', n, d });
        } else if (c === '_' || c === '^') {
          flush(); i++;
          out.push({ t: c === '_' ? 'sub' : 'sup', v: group() });
        } else { buf += c; i++; }
      }
      flush();
      return out;
    }
    return seq(null);
  }

  function mathHTML(src, cls) {
    const nodes = parseMath(src);
    const r = (ns) => ns.map((n) => {
      if (n.t === 'txt') return esc(n.v);
      if (n.t === 'sub') return '<sub>' + r(n.v) + '</sub>';
      if (n.t === 'sup') return '<sup>' + r(n.v) + '</sup>';
      return '<span class="fr"><span class="fn">' + r(n.n) + '</span><span class="fd">' + r(n.d) + '</span></span>';
    }).join('');
    return '<span class="math' + (cls ? ' ' + cls : '') + '" role="math" aria-label="' + esc(mathText(src)) + '">' + r(nodes) + '</span>';
  }
  /* Texti með stöku lágletri/brotum (t.d. „R_{t1} er upphafsviðnám“) – án role=math */
  function rich(src) {
    if (!/[_^]|\\f\{/.test(src)) return esc(src);
    return mathHTML(src, 'inl').replace(' role="math"', '');
  }
  /* Línuleg útgáfa (skjálesarar, leit) */
  function mathText(src) {
    const nodes = parseMath(src);
    const r = (ns) => ns.map((n) => {
      if (n.t === 'txt') return n.v;
      if (n.t === 'sub') return r(n.v);
      if (n.t === 'sup') return '^' + r(n.v);
      const a = r(n.n), b = r(n.d);
      return (a.length > 1 ? '(' + a + ')' : a) + '/' + (b.length > 1 ? '(' + b + ')' : b);
    }).join('');
    return r(nodes);
  }

  /* Setur inn tölur í sniðmát: "{l} m" -> "50 m" */
  function tpl(s, vars) { return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m)); }

  RF.util = { rng, newSeed, round, fmt, fmtFixed, fmtS, parseNum, esc, parseMath, mathHTML, mathText, tpl, autoDec };
  RF.m = mathHTML;
  RF.rich = rich;
  RF.fmt = fmt;
})(typeof globalThis !== 'undefined' ? globalThis : window);
