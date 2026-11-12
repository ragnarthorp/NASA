/* Kennsluáætlanir. Hver pakki er settur einu sinni inn í gögnin (líka hjá þeim sem eru þegar byrjaðir).
   Vikur eru auðkenndar með mánudegi vikunnar. Verkefni með sama id eru ekki sett inn tvisvar. */
window.NAM_PACKS = [
  {
    id: 'rafl-H26-2',
    course: 'rafl',
    info: {
      code: 'RAFL1GA04AR',
      name: 'Raflagnir – efnisfræði og lagnir',
      teacher: 'Eygló Rut Sveinsdóttir (eyr@tskoli.is)',
      notes: 'Mætingarskylda: undir 80% mætingu er hætta á brottvísun úr áfanganum.\n' +
        'Lykilmatsþættir (verkefni 7 og lokapróf): heimilt að krefjast lágmarkseinkunnar 5,0.\n' +
        'Ekki má spennusetja nema kennari sé viðstaddur.\n' +
        'Námsgögn og skil eru í kennslukerfinu.'
    },
    plan: [
      { week: '2026-10-19', topic: 'Verkefni 1: klær og hulsur. Starf rafiðnaðarmannsins, öryggismál', reading: 'Kennsla hefst 19. okt.' },
      { week: '2026-10-26', topic: 'Verkefni 2: efnisfræði', reading: '' },
      { week: '2026-11-02', topic: 'Verkefni 3 og 4: einfaldir rofar, krónurofar og samrofar', reading: '' },
      { week: '2026-11-09', topic: 'Verkefni 5: krossrofar · Próf 1', reading: 'Próf 1 fös. 13. nóv. kl. 12' },
      { week: '2026-11-16', topic: 'Verkefni 6a og 6b', reading: 'Mán. 16. nóv. námsmat (miðspannarmat)' },
      { week: '2026-11-23', topic: 'Verkefni 7a og 7b (lokaverkefni)', reading: 'Skil á verkefni 6 mið. 25. nóv.' },
      { week: '2026-11-30', topic: 'Verkefni 8 · lokapróf', reading: 'Skil á verkefni 7 mið. 2. des. Lokapróf fös. 4. des. kl. 12' },
      { week: '2026-12-07', topic: 'Verkefni 8, frágangur', reading: 'Kennslu lýkur 11. des.' },
      { week: '2026-12-14', topic: 'Upptöku- og sjúkrapróf 14. des.', reading: 'Lokaeinkunnir birtar 16. des.' }
    ],
    tasks: [
      { id: 'rafl-ahaettumat', title: 'Áhættumat', kind: 'verkefni', due: '2026-11-02', time: '23:59', weight: '', done: true, submitted: '2026-11-05', score: 'Skilað seint', notes: '' },
      { id: 'rafl-v1', title: 'Verkefni 1: klær og hulsur, öryggismál', kind: 'verkefni', due: '2026-11-04', time: '23:59', weight: 5, done: true, submitted: '2026-10-23', score: '100%', notes: '' },
      { id: 'rafl-v2', title: 'Verkefni 2: efnisfræði', kind: 'verkefni', due: '2026-11-04', time: '23:59', weight: 5, done: true, submitted: '2026-10-28', score: '85%', notes: '' },
      { id: 'rafl-v3', title: 'Verkefni 3: einfaldir rofar, krónurofar og samrofar', kind: 'verkefni', due: '2026-11-11', time: '23:59', weight: 10, done: true, submitted: '2026-11-06', score: '80%', notes: '' },
      { id: 'rafl-v4', title: 'Verkefni 4: einfaldir rofar, krónurofar og samrofar', kind: 'verkefni', due: '2026-11-11', time: '23:59', weight: 10, done: false, notes: 'Merkt „vantar“ í kennslukerfinu. Hafðu samband við kennara um skil.' },
      { id: 'rafl-p1', title: 'Próf 1 í Raflögnum A', kind: 'prof', due: '2026-11-13', time: '12:00', weight: 15, done: false, notes: 'Próf um miðja spönn.' },
      { id: 'rafl-v5', title: 'Verkefni 5: krossrofar', kind: 'verkefni', due: '2026-11-13', time: '23:59', weight: 10, done: false, notes: '' },
      { id: 'rafl-v6', title: 'Verkefni 6 (6a og 6b)', kind: 'verkefni', due: '2026-11-25', time: '23:59', weight: 10, done: false, notes: '' },
      { id: 'rafl-v7', title: 'Lokaverkefni: verkefni 7 (7a og 7b)', kind: 'verkefni', due: '2026-12-02', time: '23:59', weight: 10, done: false, notes: 'Lykilmatsþáttur.' },
      { id: 'rafl-p2', title: 'Lokapróf í Raflögnum A', kind: 'prof', due: '2026-12-04', time: '12:00', weight: 20, done: false, notes: 'Lykilmatsþáttur. Námsáætlunin setur prófið í viku 50 en kennslukerfið segir 4. des. kl. 12. Staðfestu hjá kennara.' },
      { id: 'rafl-v8', title: 'Verkefni 8', kind: 'verkefni', due: '2026-12-07', time: '', weight: 5, done: false, notes: 'Nákvæmur skiladagur er ekki kominn. Námsáætlunin segir viku 50 (7.–11. des.), svo hér er miðað við upphaf vikunnar.' }
    ]
  }
];
