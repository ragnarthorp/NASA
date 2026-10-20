(function () {
  "use strict";

  const LYKILL = "nasa-spilastokkur-v1";
  const HEITI = { bolvun: "Bölvun", verkefni: "Verkefni", spurning: "Spurning" };
  const spil = window.SPIL || [];

  /* Tegundir þrauta. Hver tegund birtir þrautina í `el` og athugar svarið.
     Nýja tegund má bæta við hér og vísa í hana með `gerd` í js/spil-gogn.js. */
  const SPIL_THRAUTIR = {
    svar: {
      birta(thraut, el) {
        el.innerHTML = '<input id="svar" autocomplete="off" spellcheck="false" placeholder="Skrifaðu svarið…" aria-label="Svar">';
        return el.querySelector("input");
      },
      athuga(thraut, el) {
        const svar = jafna(el.querySelector("input").value);
        return svar !== "" && thraut.svor.some(s => jafna(s) === svar);
      }
    }
  };

  function jafna(s) {
    return String(s).trim().toLowerCase().replace(/\s+/g, " ").replace(/,/g, ".");
  }

  function stokka(n) {
    const r = [...Array(n).keys()];
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  }

  function nyttSpil() {
    return { rod: stokka(spil.length), snuid: [], lokid: [] };
  }

  function lesa() {
    try {
      const s = JSON.parse(localStorage.getItem(LYKILL));
      if (s && Array.isArray(s.rod) && s.rod.length === spil.length) return s;
    } catch (e) { /* tómt eða lokað geymslusvæði */ }
    return nyttSpil();
  }

  function vista() {
    try { localStorage.setItem(LYKILL, JSON.stringify(stada)); } catch (e) { /* hunsa */ }
  }

  let stada = lesa();
  let virkt = null; // staða (sæti) spilsins sem er opið

  const $ = id => document.getElementById(id);
  const deck = $("deck");

  function pips(n) {
    if (!n) return "";
    return '<span class="pips" aria-label="' + n + ' stig">' +
      [1, 2, 3].map(i => '<i class="' + (i <= n ? "" : "off") + '"></i>').join("") + "</span>";
  }

  function framhlid(s) {
    const stig = s.tegund === "bolvun" ? "Engin stig" : s.stig + " stig";
    return '<div class="side face ' + s.tegund + '">' +
      '<div class="band"><span>' + HEITI[s.tegund] + "</span>" + pips(s.stig) + "</div>" +
      "<h3>" + esc(s.titill) + "</h3>" +
      "<p>" + esc(s.texti) + "</p>" +
      '<div class="foot"><span>' + stig + "</span><span>" + (s.tegund === "bolvun" ? "☠" : "★") + "</span></div>" +
      "</div>";
  }

  function esc(t) {
    return String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  function teikna() {
    deck.innerHTML = "";
    stada.rod.forEach((idx, saeti) => {
      const s = spil[idx];
      const snuid = stada.snuid.includes(saeti);
      const b = document.createElement("button");
      b.className = "card" + (snuid ? " flipped" : "") + (stada.lokid.includes(saeti) ? " done" : "");
      b.style.animationDelay = (saeti * 35) + "ms";
      b.setAttribute("role", "listitem");
      b.setAttribute("aria-label", snuid ? "Spil " + (saeti + 1) + ": " + HEITI[s.tegund] + ", " + s.titill : "Spil " + (saeti + 1) + ", á grúfu");
      b.innerHTML =
        '<div class="side back"><div class="emblem"><span>?</span></div><span class="num">' + (saeti + 1) + "</span></div>" +
        framhlid(s);
      b.addEventListener("click", () => (stada.snuid.includes(saeti) ? syna(saeti) : opnaThraut(saeti)));
      deck.appendChild(b);
    });
    uppfaeraTolur();
  }

  function uppfaeraTolur() {
    $("statFlipped").textContent = stada.snuid.length;
    $("statFlipped").nextElementSibling.textContent = "af " + spil.length + " snúið";
    $("statScore").textContent = stada.lokid.reduce((t, saeti) => t + (spil[stada.rod[saeti]].stig || 0), 0);
  }

  /* Þraut */
  const dlg = $("puzzle");
  const form = $("puzzleForm");

  function opnaThraut(saeti) {
    virkt = saeti;
    const s = spil[stada.rod[saeti]];
    const gerd = SPIL_THRAUTIR[s.thraut.gerd];
    $("puzzleNo").textContent = saeti + 1;
    $("puzzleQ").textContent = s.thraut.spurning;
    $("puzzleFeedback").textContent = "";
    $("puzzleFeedback").className = "feedback";
    const fokus = gerd.birta(s.thraut, $("puzzleBody"));
    dlg.showModal();
    if (fokus) fokus.focus();
  }

  form.addEventListener("submit", e => {
    e.preventDefault();
    const saeti = virkt;
    const s = spil[stada.rod[saeti]];
    const fb = $("puzzleFeedback");
    if (SPIL_THRAUTIR[s.thraut.gerd].athuga(s.thraut, $("puzzleBody"))) {
      fb.textContent = "Rétt! Spilinu er snúið við…";
      fb.className = "feedback right";
      setTimeout(() => {
        dlg.close();
        snua(saeti);
      }, 550);
    } else {
      fb.textContent = "Rangt svar. Reyndu aftur.";
      fb.className = "feedback wrong";
      form.classList.remove("shake");
      void form.offsetWidth;
      form.classList.add("shake");
      const inp = $("puzzleBody").querySelector("input");
      if (inp) inp.select();
    }
  });

  $("puzzleCancel").addEventListener("click", () => dlg.close());

  function snua(saeti) {
    if (!stada.snuid.includes(saeti)) stada.snuid.push(saeti);
    vista();
    const b = deck.children[saeti];
    const s = spil[stada.rod[saeti]];
    b.classList.add("flipped");
    b.setAttribute("aria-label", "Spil " + (saeti + 1) + ": " + HEITI[s.tegund] + ", " + s.titill);
    uppfaeraTolur();
    setTimeout(() => syna(saeti), 750);
  }

  /* Stækkað spil */
  const view = $("view");

  function syna(saeti) {
    const s = spil[stada.rod[saeti]];
    const lokid = stada.lokid.includes(saeti);
    $("viewCard").innerHTML = '<div class="big">' + framhlid(s) + "</div>";
    const a = $("viewActions");
    a.innerHTML = "";
    if (s.tegund !== "bolvun") {
      const k = document.createElement("button");
      k.className = "btn" + (lokid ? "" : " primary");
      k.textContent = lokid ? "Afturkalla (−" + s.stig + " stig)" : "Lokið (+" + s.stig + " stig)";
      k.addEventListener("click", () => {
        if (lokid) stada.lokid = stada.lokid.filter(x => x !== saeti);
        else stada.lokid.push(saeti);
        vista();
        deck.children[saeti].classList.toggle("done", !lokid);
        uppfaeraTolur();
        view.close();
      });
      a.appendChild(k);
    }
    const loka = document.createElement("button");
    loka.className = "btn ghost";
    loka.textContent = "Loka";
    loka.addEventListener("click", () => view.close());
    a.appendChild(loka);
    view.showModal();
  }

  [dlg, view].forEach(d => d.addEventListener("click", e => { if (e.target === d) d.close(); }));

  $("reset").addEventListener("click", () => {
    if (stada.snuid.length && !confirm("Stokka upp og byrja nýjan leik? Öll spil snúa aftur á grúfu og stigin núllstillast.")) return;
    stada = nyttSpil();
    vista();
    teikna();
  });

  teikna();
})();
