// Draugahúsið: hæðir, herbergi og þrautir.
//
// Hæðirnar eru í röð ofan frá og niður (eins og þær birtast á síðunni).
// - mynd, breidd, haed: myndin og stærð hennar í pixlum.
// - svaedi: marghyrningur herbergis í pixlum myndarinnar, [[x,y], [x,y], ...].
// - krefst: herbergi sem þarf að leysa áður en hæðin eða herbergið opnast.
//   Tómur listi (eða enginn) þýðir að það er opið frá byrjun.
//
// Tegundir þrauta:
// - "ord":  svarað með orði. svor: listi af réttum svörum (hástafir og bil skipta ekki máli).
// - "tala": svarað með tölu. svar: rétta talan, skekkja: leyfilegt frávik (sjálfgefið 0).
// - "val":  fjölval. valkostir: listi, rett: númer rétta valkostarins (byrjar á 0).
// - "utvarp": lagbútar spilaðir í útvarpi og heiti hvers lags raðað úr stafaflísum
//   (sjá utvarp.js). log: listi af { heiti, flytjandi, hljod }, mynd: mynd af útvarpinu.
// visbending birtist eftir tvö röng svör.

window.HUS = {
  heiti: 'Draugahúsið',
  haedir: [
    {
      id: 'efri',
      heiti: 'Efri hæð',
      mynd: 'myndir/efri-haed.jpg', breidd: 1500, haed: 899,
      krefst: ['hadegismoar'],
      herbergi: [
        {
          id: 'moar', heiti: 'Móar',
          svaedi: [[690, 225], [980, 225], [980, 655], [690, 655]],
          thraut: {
            tegund: 'ord',
            spurning: 'Ég á borgir en engin hús, fjöll en engin tré og vötn en enga fiska. Hvað er ég?',
            svor: ['kort', 'landakort'],
            visbending: 'Þið finnið mig í landafræðibókinni.'
          }
        },
        {
          id: 'melar', heiti: 'Melar', krefst: ['moar'],
          svaedi: [[355, 225], [690, 225], [690, 655], [355, 655]],
          thraut: {
            tegund: 'val',
            spurning: 'Þú situr við arininn án þess að snerta hann en finnur samt hitann. Hvers konar varmaflutningur er það?',
            valkostir: ['Varmaleiðni', 'Varmaburður', 'Varmageislun', 'Núningur'],
            rett: 2,
            visbending: 'Hitinn frá sólinni berst til okkar á sama hátt, í gegnum tómarúm.'
          }
        },
        {
          id: 'svalir', heiti: 'Svalir', krefst: ['moar'],
          svaedi: [[980, 225], [1165, 225], [1165, 670], [980, 670]],
          thraut: {
            tegund: 'tala',
            spurning: 'Fullt tungl lýsir yfir svölunum. Um það bil hve marga daga tekur tunglið að fara einn hring um jörðina?',
            svar: 28, skekkja: 1.5,
            visbending: 'Það er nálægt fjórum vikum.'
          }
        },
        {
          id: 'myri', heiti: 'Mýri', krefst: ['melar'],
          svaedi: [[10, 225], [355, 225], [355, 655], [10, 655]],
          thraut: {
            tegund: 'ord',
            spurning: 'Ég er svartur og greindur fugl og Óðinn átti tvo eins og mig. Hvað er ég?',
            svor: ['hrafn', 'hrafninn'],
            visbending: 'Þeir hétu Huginn og Muninn.'
          }
        },
        {
          id: 'hatun', heiti: 'Hátún', krefst: ['myri', 'svalir'],
          svaedi: [[1165, 225], [1475, 225], [1475, 655], [1165, 655]],
          thraut: {
            tegund: 'tala',
            spurning: 'Á töflunni stendur: e^(iπ) + 1 = ?',
            svar: 0,
            visbending: 'Jafna Eulers. e^(iπ) er jafnt og −1.'
          }
        }
      ]
    },
    {
      id: 'jardhaed',
      heiti: 'Jarðhæð',
      mynd: 'myndir/jardhaed.jpg', breidd: 1619, haed: 971,
      herbergi: [
        {
          id: 'eldhus', heiti: 'Eldhúsið',
          svaedi: [[140, 610], [560, 475], [905, 465], [905, 885], [140, 885]],
          thraut: {
            tegund: 'utvarp',
            mynd: 'myndir/utvarp.jpg',
            spurning: 'Gamla útvarpið í eldhúsinu hrekkur í gang og draugurinn skiptir um stöð. Hlustið á lagbútinn og raðið stafaflísunum í heiti lagsins. Þegar öll fimm lögin eru fundin opnast næsta herbergi.',
            log: [
              { heiti: 'Blinding Lights', flytjandi: 'The Weeknd', hljod: 'hljod/lag1.mp3' },
              { heiti: 'As It Was', flytjandi: 'Harry Styles', hljod: 'hljod/lag2.mp3' },
              { heiti: 'Flowers', flytjandi: 'Miley Cyrus', hljod: 'hljod/lag3.mp3' },
              { heiti: 'Espresso', flytjandi: 'Sabrina Carpenter', hljod: 'hljod/lag4.mp3' },
              { heiti: 'Not Like Us', flytjandi: 'Kendrick Lamar', hljod: 'hljod/lag5.mp3' }
            ]
          }
        },
        {
          id: 'bordstofa', heiti: 'Borðstofan', krefst: ['eldhus'],
          svaedi: [[905, 465], [1575, 465], [1575, 885], [905, 885]],
          thraut: {
            tegund: 'val',
            spurning: 'Kertin á borðinu loga. Hvaða lofttegund þurfa þau úr loftinu til að geta brunnið?',
            valkostir: ['Köfnunarefni', 'Súrefni', 'Koltvísýringur', 'Helíum'],
            rett: 1,
            visbending: 'Við öndum henni líka að okkur.'
          }
        },
        {
          id: 'salurinn', heiti: 'Salurinn', krefst: ['bordstofa'],
          svaedi: [[45, 100], [600, 60], [600, 440], [545, 470], [150, 590], [45, 570]],
          thraut: {
            tegund: 'tala',
            spurning: 'Draugurinn hleypur 100 metra eftir salnum á 20 sekúndum. Hver er meðalhraði hans í m/s?',
            svar: 5,
            visbending: 'Hraði = vegalengd / tími.'
          }
        },
        {
          id: 'sandvik', heiti: 'Sandvík', krefst: ['bordstofa'],
          svaedi: [[600, 60], [930, 60], [930, 455], [600, 455]],
          thraut: {
            tegund: 'val',
            spurning: 'Hnötturinn í Sandvík snýst hægt. Hvert er lengsta fljót Íslands?',
            valkostir: ['Ölfusá', 'Þjórsá', 'Jökulsá á Fjöllum', 'Lagarfljót'],
            rett: 1,
            visbending: 'Hún rennur úr Hofsjökli til sjávar á Suðurlandi.'
          }
        },
        {
          id: 'hadegismoar', heiti: 'Hádegismóar', krefst: ['salurinn', 'sandvik'],
          svaedi: [[1060, 70], [1580, 70], [1580, 460], [1060, 460]],
          thraut: {
            tegund: 'ord',
            spurning: 'Á miða við tilraunaglösin stendur H₂O. Hvaða efni er í glasinu?',
            svor: ['vatn'],
            visbending: 'Það sauð í pottinum í eldhúsinu.'
          }
        }
      ]
    },
    {
      id: 'kjallari',
      heiti: 'Kjallari',
      mynd: 'myndir/kjallari.jpg', breidd: 1619, haed: 971,
      krefst: ['hatun'],
      herbergi: [
        {
          id: 'gangurinn', heiti: 'Langi gangurinn',
          svaedi: [[655, 165], [915, 165], [915, 645], [655, 645]],
          thraut: {
            tegund: 'ord',
            spurning: 'Því meira sem þú tekur af mér, því meira skilur þú eftir þig. Hvað er ég?',
            svor: ['spor', 'fótspor', 'skref'],
            visbending: 'Líttu niður á gólfið þegar þú gengur ganginn.'
          }
        },
        {
          id: 'kyndiklefinn', heiti: 'Kyndiklefinn', krefst: ['gangurinn'],
          svaedi: [[15, 165], [400, 165], [400, 615], [15, 615]],
          thraut: {
            tegund: 'val',
            spurning: 'Kyndillinn brennir kolum. Úr hverju mynduðust kolin?',
            valkostir: ['Eldfjallaösku', 'Fornum plöntum', 'Bráðnu bergi', 'Saltvatni'],
            rett: 1,
            visbending: 'Þau eru jarðefnaeldsneyti, leifar af lífverum sem uxu í mýrum fyrir milljónum ára.'
          }
        },
        {
          id: 'rafmagnstaflan', heiti: 'Rafmagnstaflan', krefst: ['kyndiklefinn'],
          svaedi: [[400, 165], [655, 165], [655, 605], [400, 605]],
          thraut: {
            tegund: 'tala',
            spurning: 'Spennan á töflunni er 12 V og viðnámið 4 Ω. Hver er straumurinn í amperum?',
            svar: 3,
            visbending: 'Lögmál Ohms: U = R · I.'
          }
        },
        {
          id: 'geymsludot', heiti: 'Geymsludót', krefst: ['gangurinn'],
          svaedi: [[1010, 165], [1295, 165], [1295, 635], [1010, 635]],
          thraut: {
            tegund: 'ord',
            spurning: 'Ég hef lykla en opna engar dyr. Hvað er ég?',
            svor: ['píanó', 'pianó', 'lyklaborð', 'hljómborð', 'flygill'],
            visbending: 'Það má spila á mig.'
          }
        },
        {
          id: 'smidaskemman', heiti: 'Smíðaskemman', krefst: ['rafmagnstaflan', 'geymsludot'],
          svaedi: [[1295, 165], [1605, 165], [1605, 645], [1295, 645]],
          thraut: {
            tegund: 'val',
            spurning: 'Þú dregur nagla út með klónni á hamrinum. Hvaða einföldu vél ertu að nota?',
            valkostir: ['Vogarstöng', 'Skrúfu', 'Hjól og ás', 'Trissu'],
            rett: 0,
            visbending: 'Hamarinn snýst um vendipunkt á spýtunni.'
          }
        }
      ]
    }
  ]
};
