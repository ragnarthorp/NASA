// Enigma I: snúðar I–V, endurkastarar B og C, hringstillingar, upphafsstaða og tengiborð.
// Vélin er samhverf: sama stilling dulkóðar og afkóðar.
(function (rot) {
  'use strict';
  var A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  var SNUDAR = {
    I: ['EKMFLGDQVZNTOWYHXUSPAIBRCJ', 'Q'],
    II: ['AJDKSIRUXBLHWTMCQGZNPYFVOE', 'E'],
    III: ['BDFHJLCPRTXVZNYEIWGAKMUSQO', 'V'],
    IV: ['ESOVPZJAYQUIRHXLNFTGKDCMWB', 'J'],
    V: ['VZBRGITYUPSDNHLXAWMJQOFECK', 'Z']
  };
  var ENDURKASTARAR = { B: 'YRUHQSLDPXNGOKMIEBFZCWVJAT', C: 'FVPJIAOYEDRZXWGCTKUQSBNMHL' };

  function stafur(c) { return A.indexOf(c); }

  // stilling: { snudar: ['I','II','III'], endurkastari: 'B', hringir: 'AAA', stada: 'AAA', tengibord: 'AB CD' }
  function dulkoda(texti, stilling) {
    stilling = stilling || {};
    var nofn = stilling.snudar || ['I', 'II', 'III'];
    var snudar = nofn.map(function (n) {
      var s = SNUDAR[n];
      var fram = s[0].split('').map(stafur);
      var aftur = [];
      fram.forEach(function (t, i) { aftur[t] = i; });
      return { fram: fram, aftur: aftur, hak: stafur(s[1]) };
    });
    var endur = (ENDURKASTARAR[stilling.endurkastari || 'B']).split('').map(stafur);
    var hringir = (stilling.hringir || 'AAA').split('').map(stafur);
    var stada = (stilling.stada || 'AAA').split('').map(stafur);
    var tengi = A.split('').map(function (_, i) { return i; });
    (stilling.tengibord || '').toUpperCase().split(/\s+/).forEach(function (par) {
      if (par.length === 2) { var a = stafur(par[0]), b = stafur(par[1]); tengi[a] = b; tengi[b] = a; }
    });

    function gegnum(i, k, att) {
      var s = snudar[k], d = stada[k] - hringir[k];
      var inn = (i + d + 26) % 26;
      var ut = att ? s.fram[inn] : s.aftur[inn];
      return (ut - d + 26) % 26;
    }

    var ut = '';
    texti.toUpperCase().replace(/[^A-Z]/g, '').split('').forEach(function (c) {
      // Skref með tvöföldu skrefi miðsnúðsins
      if (stada[1] === snudar[1].hak) { stada[0] = (stada[0] + 1) % 26; stada[1] = (stada[1] + 1) % 26; }
      else if (stada[2] === snudar[2].hak) stada[1] = (stada[1] + 1) % 26;
      stada[2] = (stada[2] + 1) % 26;

      var i = tengi[stafur(c)];
      for (var k = 2; k >= 0; k--) i = gegnum(i, k, true);
      i = endur[i];
      for (k = 0; k <= 2; k++) i = gegnum(i, k, false);
      ut += A[tengi[i]];
    });
    return ut;
  }

  rot.ENIGMA = { dulkoda: dulkoda };
})(typeof window !== 'undefined' ? window : globalThis);
