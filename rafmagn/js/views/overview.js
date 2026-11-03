/* Yfirlit — forsíða með lýsingu, flýtileiðum, samanburði og framvindu. */
(function (root) {
  'use strict';
  const Views = root.Views = root.Views || {};
  const UI = root.UI, S = UI.S, F = UI.F, Store = root.Store, Exercises = root.Exercises;

  function compareTable() {
    return '<div class="table-wrap"><table class="compare">' +
      '<caption class="sr-only">Samanburður á raðtengingu og hliðtengingu</caption>' +
      '<thead><tr><th scope="col">Atriði</th><th scope="col" class="h-series">Raðtenging</th><th scope="col" class="h-parallel">Hliðtenging</th></tr></thead><tbody>' +
      '<tr><th scope="row">Uppbygging</th><td>Ein leið: viðnámin eru hvert á eftir öðru.</td><td>Margar greinar: hvert viðnám tengt beint yfir spennugjafann.</td></tr>' +
      '<tr><th scope="row">Heildarviðnám</th><td class="math">' + S('R', 'H') + ' = ' + S('R', 1) + ' + ' + S('R', 2) + ' + … + ' + S('R', 'n') + '</td><td class="math">' + F('1', S('R', 'H')) + ' = ' + F('1', S('R', 1)) + ' + ' + F('1', S('R', 2)) + ' + … + ' + F('1', S('R', 'n')) + '</td></tr>' +
      '<tr><th scope="row">Straumur</th><td><strong>Sá sami</strong> alls staðar: <span class="math">' + S('I', 'H') + ' = ' + S('I', 1) + ' = ' + S('I', 2) + ' = …</span></td><td><strong>Leggst saman</strong>: <span class="math">' + S('I', 'H') + ' = ' + S('I', 1) + ' + ' + S('I', 2) + ' + …</span></td></tr>' +
      '<tr><th scope="row">Spenna</th><td><strong>Leggst saman</strong>: <span class="math">' + S('U', 'H') + ' = ' + S('U', 1) + ' + ' + S('U', 2) + ' + …</span></td><td><strong>Sú sama</strong> yfir hverja grein: <span class="math">' + S('U', 'H') + ' = ' + S('U', 1) + ' = ' + S('U', 2) + ' = …</span></td></tr>' +
      '<tr><th scope="row">Stærð ' + S('R', 'H') + '</th><td>Stærra en hvert einstakt viðnám.</td><td>Minna en minnsta einstaka viðnámið.</td></tr>' +
      '<tr><th scope="row">Tvö viðnám</th><td class="math">' + S('R', 'H') + ' = ' + S('R', 1) + ' + ' + S('R', 2) + '</td><td>Formúlan góða: <span class="math">' + S('R', 'H') + ' = ' + F(S('R', 1) + ' · ' + S('R', 2), S('R', 1) + ' + ' + S('R', 2)) + '</span></td></tr>' +
      '</tbody></table></div>';
  }

  function progressCard() {
    const list = Exercises.practice();
    const stats = Store.topicStats(Exercises.TOPICS, list);
    const solved = stats.reduce(function (a, s) { return a + s.solved; }, 0);
    const first = stats.reduce(function (a, s) { return a + s.firstTry; }, 0);
    const exams = Store.state.exams;
    let h = '<section class="card" aria-labelledby="prog-h"><div class="section-head"><h2 id="prog-h">Framvindan þín</h2>';
    if (solved || exams.length) h += '<button type="button" class="btn-small btn-danger" data-reset>Endurstilla framvindu</button>';
    h += '</div>';
    if (!solved && !exams.length) {
      h += '<p>Þú hefur ekki leyst neinar æfingar enn. Þegar þú leysir æfingar birtist árangurinn hér, flokkaður eftir efni.</p>' +
        '<p><a class="btn btn-primary" href="#aefingar">Byrja á æfingunum</a></p>';
      return h + '</section>';
    }
    h += '<div class="grid grid-3" style="margin-bottom:14px">' +
      '<div><div class="stat">' + solved + ' / ' + list.length + '</div><div class="muted">æfingar leystar</div></div>' +
      '<div><div class="stat">' + first + '</div><div class="muted">réttar í fyrstu tilraun</div></div>';
    if (exams.length) {
      const last = exams[exams.length - 1];
      h += '<div><div class="stat">' + root.Calc.formatNumber(last.points, 3) + ' / ' + last.total + '</div><div class="muted">stig í síðasta æfingaprófi</div></div>';
    } else {
      h += '<div><div class="stat">–</div><div class="muted">ekkert æfingapróf tekið enn</div></div>';
    }
    h += '</div><h3>Eftir efnisflokki</h3>';
    stats.forEach(function (s) {
      h += '<div class="topic-row"><a href="#aefingar:' + s.topic.id + '">' + UI.esc(s.topic.name) + '</a>' +
        UI.progressBar(s.solved, s.total, s.topic.name + ': ' + s.solved + ' af ' + s.total + ' leystar') +
        '<span class="small"><strong>' + s.solved + ' af ' + s.total + '</strong> leystar' + (s.firstTry ? ' · ' + s.firstTry + ' í fyrstu tilraun' : '') + '</span></div>';
    });
    const weakest = stats.filter(function (s) { return s.solved < s.total; })
      .sort(function (a, b) { return (a.solved / a.total) - (b.solved / b.total); })[0];
    if (weakest) h += '<p class="actions"><a class="btn" href="#aefingar:' + weakest.topic.id + '">Æfa næst: ' + UI.esc(weakest.topic.name) + '</a></p>';
    else h += '<p class="notice notice-ok" style="margin-top:12px">✓ Þú hefur leyst allar æfingarnar. Prófaðu æfingapróf í prófham.</p>';
    return h + '</section>';
  }

  Views.yfirlit = {
    render: function () {
      return '<section class="hero">' +
        '<div><p class="eyebrow">Rafmagnsfræði · grunnatriði</p><h1>Undirbúningur fyrir rafmagnsfræðipróf</h1>' +
        '<p class="lead">Hér rifjarðu upp og æfir raðtengingu og hliðtengingu viðnáma og lögmál Ohms: að reikna spennu, straum og viðnám, heildarviðnám, spennuföll og greinastrauma.</p>' +
        '<div class="actions"><a class="btn btn-primary" href="#formulublad:prenta" data-print-sheet>Prenta formúlublað</a>' + UI.pdfLink('glosur', 'Sækja glósur sem PDF') + '<a class="btn" href="#aefingar">Byrja að æfa</a></div></div>' +
        '<div class="card"><h2>Það sem þarf að kunna</h2><ul class="checklist">' +
        '<li>Lögmál Ohms: <span class="math">' + S('U') + ' = ' + S('I') + ' · ' + S('R') + '</span> og að velja rétta útgáfu.</li>' +
        '<li>Raðtenging: viðnám og spennuföll leggjast saman, sami straumur alls staðar.</li>' +
        '<li>Hliðtenging: andhverfuformúlan og formúlan góða, sama spenna yfir hverja grein, greinastraumar leggjast saman.</li>' +
        '<li>Að breyta mA í A og kΩ í Ω áður en reiknað er.</li></ul>' +
        '<p class="small muted">Í prófinu má nota allar glósur og námsefni á Canvas. Símar eru bannaðir og þú þarft að mæta með reiknivél. Prentaðu formúlublaðið og glósurnar — ekki gera ráð fyrir að þessi vefur verði leyfður í prófinu.</p></div>' +
        '</section>' +
        '<h2 class="sr-only">Flýtileiðir</h2><div class="grid grid-3 quick" style="margin:26px 0">' +
        '<a href="#glosur"><div class="card tone-ohm"><h3>Glósur →</h3><p>Tákn, formúlur, tengimyndir og reiknuð dæmi fyrir hvert atriði. Prentvænar.</p></div></a>' +
        '<a href="#reiknivelar"><div class="card tone-series"><h3>Reiknivélar →</h3><p>Lögmál Ohms, raðtenging og hliðtenging með lausn skref fyrir skref.</p></div></a>' +
        '<a href="#aefingar"><div class="card tone-parallel"><h3>Æfingar →</h3><p>' + Exercises.practice().length + ' æfingar með vísbendingum, lausnum og endurgjöf. Svo æfingapróf í prófham.</p></div></a>' +
        '</div>' +
        '<section class="card" aria-labelledby="cmp-h" style="margin-bottom:18px"><h2 id="cmp-h">Raðtenging og hliðtenging í hnotskurn</h2>' +
        '<div class="grid grid-2">' +
        UI.diagram({ kind: 'series', U: '12 V', R: ['100 Ω', '200 Ω'], I: '40 mA', drops: ['4 V', '8 V'] }, '<span class="tag tag-series">Raðtenging</span> Sami straumur, spennan skiptist.') +
        UI.diagram({ kind: 'parallel', U: '12 V', R: ['100 Ω', '200 Ω'], I: '0,18 A', currents: ['0,12 A', '0,06 A'] }, '<span class="tag tag-parallel">Hliðtenging</span> Sama spenna, straumurinn skiptist.') +
        '</div>' + compareTable() + '</section>' +
        '<div data-progress>' + progressCard() + '</div>';
    },
    mount: function (el) {
      el.addEventListener('click', function (e) {
        // Inni í artifact opnast prentgluggi ekki; þá er formúlublaðið boðið sem PDF.
        if (e.target.closest('[data-print-sheet]') && UI.inArtifact()) { e.preventDefault(); UI.savePdf('formulublad'); return; }
        if (!e.target.closest('[data-reset]')) return;
        UI.confirm('Þetta eyðir öllum vistuðum svörum, árangri í æfingum og niðurstöðum æfingaprófa í þessum vafra. Ekki er hægt að afturkalla það.', 'Já, endurstilla', 'Endurstilla framvindu?')
          .then(function (ok) {
            if (!ok) return;
            Store.resetProgress();
            el.querySelector('[data-progress]').innerHTML = progressCard();
            UI.announce('Framvinda hefur verið endurstillt.');
          });
      });
    },
  };
})(typeof self !== 'undefined' ? self : this);
