/* Grunngögn: skóladagatal Tækniskólans 2026–2027 og stundaskrá haustannar 2026, spönn 2.
   Allt hér má breyta í forritinu sjálfu; þetta er aðeins upphafsstaðan. */
window.NAM_DEFAULTS = {
  version: 1,
  school: 'Tækniskólinn',

  // Spannir. Stundaskrá tilheyrir alltaf einni spönn.
  terms: [
    { id: 'H26-1', name: 'Haustönn 2026 · spönn 1', start: '2026-08-18', end: '2026-10-13' },
    { id: 'H26-2', name: 'Haustönn 2026 · spönn 2', start: '2026-10-19', end: '2026-12-11' },
    { id: 'V27-1', name: 'Vorönn 2027 · spönn 1', start: '2027-01-05', end: '2027-03-02' },
    { id: 'V27-2', name: 'Vorönn 2027 · spönn 2', start: '2027-03-08', end: '2027-05-18' }
  ],

  // Kóðar sjást aðeins að hluta í Innu, nöfn eru ágiskun og stofur vantar. Lagað undir „Áfangar“.
  courses: [
    { id: 'rafl', code: 'RAFL1', name: 'Raflagnir', group: 'TH (3-S2)', room: '', teacher: '', color: '#d97706', link: '' },
    { id: 'rafm', code: 'RAFM1', name: 'Rafmagnsfræði', group: 'TH (3-S2)', room: '', teacher: '', color: '#2563eb', link: '' },
    { id: 'staer', code: 'STÆR2', name: 'Stærðfræði', group: 'Hfj (1-S2)', room: '', teacher: '', color: '#7c3aed', link: '' },
    { id: 'ithr', code: 'ÍÞRÓ', name: 'Íþróttir', group: 'Hfj (6-Ö)', room: '', teacher: '', color: '#059669', link: '' }
  ],

  // day: 1 = mánudagur … 5 = föstudagur. Kennslustund er 50 mínútur.
  slots: [
    // Mánudagur
    { term: 'H26-2', course: 'staer', day: 1, start: '10:25', end: '11:15' },
    { term: 'H26-2', course: 'staer', day: 1, start: '11:15', end: '12:05' },
    { term: 'H26-2', course: 'rafm', day: 1, start: '12:45', end: '13:35' },
    { term: 'H26-2', course: 'rafm', day: 1, start: '13:35', end: '14:25' },
    { term: 'H26-2', course: 'rafm', day: 1, start: '14:35', end: '15:25' },
    { term: 'H26-2', course: 'rafm', day: 1, start: '15:25', end: '16:15' },
    // Þriðjudagur
    { term: 'H26-2', course: 'staer', day: 2, start: '12:45', end: '13:35' },
    { term: 'H26-2', course: 'staer', day: 2, start: '13:35', end: '14:25' },
    // Miðvikudagur
    { term: 'H26-2', course: 'rafl', day: 3, start: '08:30', end: '09:20' },
    { term: 'H26-2', course: 'rafl', day: 3, start: '09:20', end: '10:10' },
    { term: 'H26-2', course: 'rafl', day: 3, start: '10:25', end: '11:15' },
    { term: 'H26-2', course: 'rafl', day: 3, start: '11:15', end: '12:05' },
    { term: 'H26-2', course: 'rafm', day: 3, start: '12:45', end: '13:35' },
    { term: 'H26-2', course: 'rafm', day: 3, start: '13:35', end: '14:25' },
    { term: 'H26-2', course: 'rafm', day: 3, start: '14:35', end: '15:25' },
    { term: 'H26-2', course: 'rafm', day: 3, start: '15:25', end: '16:15' },
    // Fimmtudagur (íþróttir og stærðfræði skarast kl. 9:20 í Innu)
    { term: 'H26-2', course: 'staer', day: 4, start: '08:30', end: '09:20' },
    { term: 'H26-2', course: 'ithr', day: 4, start: '09:20', end: '10:10' },
    { term: 'H26-2', course: 'staer', day: 4, start: '09:20', end: '10:10' },
    // Föstudagur
    { term: 'H26-2', course: 'rafl', day: 5, start: '08:30', end: '09:20' },
    { term: 'H26-2', course: 'rafl', day: 5, start: '09:20', end: '10:10' },
    { term: 'H26-2', course: 'rafl', day: 5, start: '10:25', end: '11:15' },
    { term: 'H26-2', course: 'rafl', day: 5, start: '11:15', end: '12:05' },
    { term: 'H26-2', course: 'staer', day: 5, start: '14:35', end: '15:25' },
    { term: 'H26-2', course: 'staer', day: 5, start: '15:25', end: '16:15' }
  ],

  /* Tegundir viðburða:
     fri      – skóli lokaður / frí (engin kennsla)
     namsmat  – námsmat: ekki kennt skv. stundaskrá, sjálfstæð vinna, próf eða skil
     spönn    – kennsla hefst eða lýkur
     frestur  – frestir og skráning (úrsögn, útskrift, kennslumat)
     vidburdur – annað */
  events: [
    // Haustönn 2026
    { date: '2026-08-14', title: 'Birting stundatöflu', kind: 'vidburdur' },
    { date: '2026-08-17', title: 'Nýnemadagur', kind: 'vidburdur' },
    { date: '2026-08-18', title: 'Kennsla hefst – spönn 1', kind: 'spönn' },
    { date: '2026-08-20', title: 'Foreldrafundur fyrir nýnema', kind: 'vidburdur' },
    { date: '2026-08-26', title: 'Úrsögn úr áfanga', kind: 'frestur' },
    { date: '2026-08-31', title: 'Skráning til útskriftar', kind: 'frestur' },
    { date: '2026-09-14', title: 'Námsmat – miðspannarmat', kind: 'namsmat' },
    { date: '2026-09-21', title: 'Opnað fyrir kennslumat', kind: 'frestur' },
    { date: '2026-09-24', title: 'Tækniskóladagurinn', kind: 'vidburdur' },
    { date: '2026-09-28', end: '2026-10-02', title: 'Valvika', kind: 'vidburdur' },
    { date: '2026-10-09', title: 'Lokað fyrir kennslumat', kind: 'frestur' },
    { date: '2026-10-13', title: 'Kennslu lýkur – spönn 1', kind: 'spönn' },
    { date: '2026-10-14', title: 'Námsmat – miðannarmat', kind: 'namsmat' },
    { date: '2026-10-15', title: 'Upptöku- og sjúkrapróf', kind: 'namsmat' },
    { date: '2026-10-16', title: 'Lokadagur spannar – skóli lokaður', kind: 'fri' },
    { date: '2026-10-19', title: 'Kennsla hefst – spönn 2', kind: 'spönn' },
    { date: '2026-10-26', title: 'Alþjóðavika', kind: 'vidburdur' },
    { date: '2026-11-16', title: 'Námsmat – miðspannarmat', kind: 'namsmat' },
    { date: '2026-11-17', title: 'Opnað fyrir kennslumat', kind: 'frestur' },
    { date: '2026-12-01', title: 'Fullveldiskaffi', kind: 'vidburdur' },
    { date: '2026-12-10', title: 'Lokað fyrir kennslumat', kind: 'frestur' },
    { date: '2026-12-11', title: 'Kennslu lýkur – spönn 2', kind: 'spönn' },
    { date: '2026-12-14', title: 'Upptöku- og sjúkrapróf', kind: 'namsmat' },
    { date: '2026-12-15', title: 'Lokafrágangur o.fl.', kind: 'namsmat' },
    { date: '2026-12-16', title: 'Birting lokaeinkunna', kind: 'vidburdur' },
    { date: '2026-12-17', title: 'Endurtökupróf fyrir útskriftarnema', kind: 'vidburdur' },
    { date: '2026-12-18', title: 'Brautskráning', kind: 'vidburdur' },
    { date: '2026-12-21', end: '2027-01-03', title: 'Jólafrí', kind: 'fri' },
    // Vorönn 2027
    { date: '2027-01-04', title: 'Starfsdagur', kind: 'fri' },
    { date: '2027-01-05', title: 'Kennsla hefst – spönn 1', kind: 'spönn' },
    { date: '2027-01-07', title: 'Foreldrafundur fyrir nýnema', kind: 'vidburdur' },
    { date: '2027-01-13', title: 'Úrsögn úr áfanga', kind: 'frestur' },
    { date: '2027-01-18', title: 'Skráning til útskriftar', kind: 'frestur' },
    { date: '2027-02-02', title: 'Námsmat – miðspannarmat', kind: 'namsmat' },
    { date: '2027-02-03', title: 'Opnað fyrir kennslumat', kind: 'frestur' },
    { date: '2027-02-15', end: '2027-02-19', title: 'Valvika', kind: 'vidburdur' },
    { date: '2027-02-22', title: 'Vetrarfrí – skóli lokaður', kind: 'fri' },
    { date: '2027-02-24', title: 'Skólafundur', kind: 'vidburdur' },
    { date: '2027-03-01', title: 'Lokað fyrir kennslumat', kind: 'frestur' },
    { date: '2027-03-02', title: 'Kennslu lýkur – spönn 1', kind: 'spönn' },
    { date: '2027-03-03', title: 'Námsmat – miðannarmat', kind: 'namsmat' },
    { date: '2027-03-04', title: 'Upptöku- og sjúkrapróf', kind: 'namsmat' },
    { date: '2027-03-05', title: 'Lokadagur spannar – skóli lokaður', kind: 'fri' },
    { date: '2027-03-08', title: 'Kennsla hefst – spönn 2', kind: 'spönn' },
    { date: '2027-03-11', end: '2027-03-13', title: 'Íslandsmót iðn- og verkgreina', kind: 'vidburdur' },
    { date: '2027-03-22', end: '2027-03-30', title: 'Páskafrí', kind: 'fri' },
    { date: '2027-04-05', title: 'Alþjóðavika', kind: 'vidburdur' },
    { date: '2027-04-07', title: 'Opið hús', kind: 'vidburdur' },
    { date: '2027-04-10', title: 'Skúfudagur', kind: 'vidburdur' },
    { date: '2027-04-16', title: 'Miðspannarmat', kind: 'vidburdur' },
    { date: '2027-04-19', title: 'Opnað fyrir kennslumat', kind: 'frestur' },
    { date: '2027-04-21', title: 'Starfsþróunardagur', kind: 'fri' },
    { date: '2027-04-22', title: 'Sumardagurinn fyrsti', kind: 'fri' },
    { date: '2027-04-23', title: 'Námsmat – skóli lokaður', kind: 'namsmat' },
    { date: '2027-05-06', title: 'Uppstigningardagur', kind: 'fri' },
    { date: '2027-05-14', title: 'Lokað fyrir kennslumat', kind: 'frestur' },
    { date: '2027-05-17', title: 'Annar í hvítasunnu', kind: 'fri' },
    { date: '2027-05-18', title: 'Kennslu lýkur – spönn 2', kind: 'spönn' },
    { date: '2027-05-19', title: 'Upptöku- og sjúkrapróf', kind: 'namsmat' },
    { date: '2027-05-20', title: 'Lokafrágangur o.fl.', kind: 'namsmat' },
    { date: '2027-05-21', title: 'Birting lokaeinkunna', kind: 'vidburdur' },
    { date: '2027-05-24', title: 'Endurtökupróf fyrir útskriftarnema', kind: 'vidburdur' },
    { date: '2027-05-25', title: 'Lokafrágangur o.fl.', kind: 'namsmat' },
    { date: '2027-05-26', title: 'Brautskráning', kind: 'vidburdur' },
    { date: '2027-05-27', end: '2027-05-28', title: 'Vinnudagur (SUS)', kind: 'vidburdur' }
  ],

  /* Kennsluáætlanir (fylltar inn síðar), ein á hvern áfanga:
     plans[courseId] = [{ id, week: 'YYYY-MM-DD' (mánudagur vikunnar), topic, reading, notes }]
     tasks = [{ id, course, title, kind, due: 'YYYY-MM-DD', time: 'HH:MM', weight, notes, done }] */
  plans: {},
  tasks: [],

  settings: {
    notify: false,
    classLead: 10,      // mínútum fyrir kennslustund
    taskDaysBefore: 2,  // dögum fyrir skil
    taskHour: '08:00'   // klukkan hvað minnt er á skil
  }
};
