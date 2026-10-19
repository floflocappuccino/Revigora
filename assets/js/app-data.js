/* =========================================================================
   Revigora — Customer app sample data (static mockup)
   One object, shaped so a real API response could replace it later.
   ALL medical copy here (notes, descriptions, ranges, doses, food lists) is
   PLACEHOLDER until a doctor signs off. Values marked `// placeholder` are
   invented in-range values where neither the brief nor Paper gives one.
   ========================================================================= */

window.RV_DATA = {

  user: {
    firstName: 'Mikkel',
    lastName: 'Krogh',
    initials: 'MK',
    birthDate: '1988-05-04',
    age: 38,
    sex: 'male'
  },

  // Oldest first. `history[i]` on every marker lines up with tests[i].
  tests: [
    { id: 't1', date: '2025-03-14', package: 'Longevity & Healthspan', bioAge: 36.1 },
    { id: 't2', date: '2025-09-12', package: 'Longevity & Healthspan', bioAge: 35.4 },
    { id: 't3', date: '2026-03-13', package: 'Longevity & Healthspan', bioAge: 34.8 },
    { id: 't4', date: '2026-09-12', package: 'Longevity & Healthspan', bioAge: 34.2 }
  ],

  sampleTimes: ['08:05', '07:55', '08:20', '08:10'], // per test; placeholder except the last (Paper 12)
  lab: 'ISO 15189-laboratorium',

  nextTest: {
    eyebrow: 'Næste måling · om 74 dage',
    text: 'Test igen i december for at se, om dine tiltag virker på fasteinsulin og D-vitamin.',
    axisLabel: 'Næste · dec'
  },

  // Order = order on the overview. `featured` markers get full rows on the
  // overview; categories without featured markers render as one collapsed row.
  // `menuOrder` = position in the mega menu (3 columns, filled top-to-bottom).
  categories: [
    { id: 'hjerte', name: 'Hjerte & kredsløb', menuOrder: 0, icon: 'heart', featured: ['apob', 'ldl', 'hdl', 'triglycerider'] },
    { id: 'stofskifte', name: 'Stofskifte', menuOrder: 1, icon: 'bolt', featured: ['fasteinsulin', 'hba1c', 'faste-glukose'] },
    { id: 'vitaminer', name: 'Vitaminer & mineraler', menuOrder: 2, icon: 'pill', featured: ['d-vitamin', 'ferritin', 'b12'] },
    { id: 'hormoner', name: 'Hormoner', menuOrder: 3, icon: null, featured: [] },
    { id: 'skjoldbruskkirtel', name: 'Skjoldbruskkirtel', menuOrder: 4, icon: null, featured: [] },
    { id: 'lever', name: 'Lever', menuOrder: 6, icon: null, featured: [] },
    { id: 'nyrer', name: 'Nyrer', menuOrder: 7, icon: null, featured: [] },
    { id: 'blod', name: 'Blod', menuOrder: 8, icon: null, featured: [] },
    { id: 'inflammation', name: 'Inflammation', menuOrder: 5, icon: null, featured: [] }
  ],

  /* Markers
     range:   { low, high } — either may be omitted for one-sided ranges.
     bands:   optional, top → bottom, for the hover preview / marker chart.
              status: 'over' | 'border' | 'in' | 'under'. min/max are the
              scale ends used to place values inside each (equal-height) band.
              Omitted → derived from `range` in app.js.
     better:  'lower' | 'higher' — direction that counts as "Forbedres".
              Omitted → the marker never counts as improving.
     decimals: digits shown after the comma. */
  markers: [
    // --- Hjerte & kredsløb (8) ---------------------------------------------
    { id: 'apob', name: 'ApoB', categoryId: 'hjerte', unit: 'g/L', decimals: 2,
      range: { high: 0.90 }, better: 'lower',
      bands: [
        { status: 'over', label: 'Over', text: '> 1,20', min: 1.20, max: 1.50 },
        { status: 'border', label: 'Grænse', text: '0,90–1,20', min: 0.90, max: 1.20 },
        { status: 'in', label: 'I området', text: '< 0,90', min: 0.60, max: 0.90 }
      ],
      description: 'Tæller de partikler i blodet, der kan aflejre kolesterol i karvæggen. Lavere er bedre.',
      history: [0.91, 0.83, 0.78, 0.74] },
    { id: 'ldl', name: 'LDL-kolesterol', categoryId: 'hjerte', unit: 'mmol/L', decimals: 1,
      range: { high: 3.0 }, better: 'lower',
      description: 'Det "dårlige" kolesterol, som kan aflejres i blodkarrene. Lavere er bedre.',
      history: [2.9, 2.7, 2.5, 2.4] },
    { id: 'hdl', name: 'HDL-kolesterol', categoryId: 'hjerte', unit: 'mmol/L', decimals: 1,
      range: { low: 1.0 }, better: 'higher',
      description: 'Det "gode" kolesterol, der fragter overskydende kolesterol tilbage til leveren.',
      history: [1.4, 1.5, 1.5, 1.6] }, // placeholder (history)
    { id: 'triglycerider', name: 'Triglycerider', categoryId: 'hjerte', unit: 'mmol/L', decimals: 1,
      range: { high: 1.7 }, better: 'lower',
      description: 'Fedtstoffer i blodet, som påvirkes af kost, alkohol og blodsukker.',
      history: [1.0, 0.8, 1.0, 0.9] }, // placeholder (history)
    { id: 'lpa', name: 'Lp(a)', categoryId: 'hjerte', unit: 'nmol/L', decimals: 0,
      range: { high: 75 },
      description: 'En arvelig kolesterolpartikel. Niveauet ændrer sig sjældent gennem livet.',
      history: [32, 32, 32, 32] }, // placeholder
    { id: 'total-kolesterol', name: 'Total-kolesterol', categoryId: 'hjerte', unit: 'mmol/L', decimals: 1,
      range: { high: 5.0 },
      description: 'Den samlede mængde kolesterol i blodet.',
      history: [4.6, 4.5, 4.4, 4.4] }, // placeholder
    { id: 'non-hdl', name: 'Non-HDL', categoryId: 'hjerte', unit: 'mmol/L', decimals: 1,
      range: { high: 3.8 },
      description: 'Alt kolesterol undtagen HDL — et mål for de partikler, der kan aflejres.',
      history: [3.2, 3.0, 2.9, 2.9] }, // placeholder
    { id: 'homocystein', name: 'Homocystein', categoryId: 'hjerte', unit: 'µmol/L', decimals: 1,
      range: { low: 5, high: 12 },
      description: 'En aminosyre, der hænger sammen med B-vitaminstatus og karsundhed.',
      history: [9.1, 9.0, 8.8, 8.8] }, // placeholder

    // --- Stofskifte (5) -------------------------------------------------------
    { id: 'fasteinsulin', name: 'Fasteinsulin', categoryId: 'stofskifte', unit: 'mIE/L', decimals: 1,
      range: { low: 2, high: 10 }, rangeDecimals: 0, better: 'lower',
      description: 'Hvor meget insulin kroppen skal bruge for at holde blodsukkeret stabilt i fastende tilstand.',
      history: [8.1, 9.4, 11.2, 13.9] },
    { id: 'hba1c', name: 'HbA1c (langtidsblodsukker)', shortName: 'HbA1c', categoryId: 'stofskifte', unit: 'mmol/mol', decimals: 0,
      range: { high: 39 }, better: 'lower',
      description: 'Dit gennemsnitlige blodsukker over de seneste 2–3 måneder.',
      history: [34, 33, 34, 34] },
    { id: 'faste-glukose', name: 'Faste-glukose', categoryId: 'stofskifte', unit: 'mmol/L', decimals: 1,
      range: { low: 4.0, high: 6.0 }, // placeholder (brief gives no range)
      description: 'Dit blodsukker efter en nats faste.',
      history: [5.1, 5.2, 5.4, 5.3] }, // placeholder (first three)
    { id: 'urinsyre', name: 'Urinsyre', categoryId: 'stofskifte', unit: 'µmol/L', decimals: 0,
      range: { low: 230, high: 480 },
      description: 'Et affaldsstof fra kroppens omsætning af puriner.',
      history: [330, 320, 325, 320] }, // placeholder
    { id: 'c-peptid', name: 'C-peptid', categoryId: 'stofskifte', unit: 'nmol/L', decimals: 2,
      range: { low: 0.30, high: 1.30 },
      description: 'Dannes sammen med insulin og viser, hvor meget insulin bugspytkirtlen producerer.',
      history: [0.62, 0.64, 0.71, 0.71] }, // placeholder

    // --- Vitaminer & mineraler (7) -------------------------------------------
    { id: 'd-vitamin', name: 'D-vitamin (25-OH)', shortName: 'D-vitamin', categoryId: 'vitaminer', unit: 'nmol/L', decimals: 0,
      range: { low: 50, high: 150 }, better: 'higher', trendNote: 'Følger årstiden',
      description: 'Kroppens D-vitamindepot. Vigtigt for knogler, muskler og immunforsvar.',
      history: [42, 82, 71, 46] },
    { id: 'ferritin', name: 'Ferritin', categoryId: 'vitaminer', unit: 'µg/L', decimals: 0,
      range: { low: 40, high: 300 }, better: 'higher',
      description: 'Viser størrelsen på kroppens jernlagre.',
      history: [61, 52, 44, 38] },
    { id: 'b12', name: 'B12-vitamin', categoryId: 'vitaminer', unit: 'pmol/L', decimals: 0,
      range: { low: 200, high: 700 }, better: 'higher', // range: placeholder
      description: 'Nødvendig for nervesystemet og dannelsen af røde blodlegemer.',
      history: [300, 310, 320, 410] }, // first two: placeholder (Paper 14 counts need a value)
    { id: 'folat', name: 'Folat', categoryId: 'vitaminer', unit: 'nmol/L', decimals: 0,
      range: { low: 10 },
      description: 'B-vitamin, der indgår i celledeling og dannelse af blodlegemer.',
      history: [22, 23, 24, 24] }, // placeholder (last value from Paper 06)
    { id: 'magnesium', name: 'Magnesium', categoryId: 'vitaminer', unit: 'mmol/L', decimals: 2,
      range: { low: 0.70, high: 1.00 },
      description: 'Mineral, der indgår i muskel- og nervefunktion.',
      history: [0.84, 0.85, 0.86, 0.86] }, // placeholder (last value from Paper 06)
    { id: 'zink', name: 'Zink', categoryId: 'vitaminer', unit: 'µmol/L', decimals: 1,
      range: { low: 11, high: 18 },
      description: 'Mineral, der støtter immunforsvar og sårheling.',
      history: [14.0, 14.1, 14.2, 14.2] }, // placeholder (last value from Paper 06)
    { id: 'transferrinmaetning', name: 'Transferrinmætning', categoryId: 'vitaminer', unit: '%', decimals: 0,
      range: { low: 15, high: 50 },
      description: 'Hvor stor en del af blodets jerntransportør der er fyldt med jern.',
      history: [29, 27, 28, 28] }, // placeholder (last value from Paper 06)

    // --- Hormoner (6) --------------------------------------------------------
    { id: 'testosteron', name: 'Testosteron', categoryId: 'hormoner', unit: 'nmol/L', decimals: 1,
      range: { low: 8.6, high: 29 },
      description: 'Det vigtigste mandlige kønshormon.',
      history: [18.4, 19.0, 19.2, 19.2] }, // placeholder
    { id: 'shbg', name: 'SHBG', categoryId: 'hormoner', unit: 'nmol/L', decimals: 0,
      range: { low: 18, high: 54 },
      description: 'Protein, der binder kønshormoner i blodet.',
      history: [35, 36, 36, 36] }, // placeholder
    { id: 'oestradiol', name: 'Østradiol', categoryId: 'hormoner', unit: 'pmol/L', decimals: 0,
      range: { low: 40, high: 160 },
      description: 'Det vigtigste østrogen — også hos mænd i små mængder.',
      history: [92, 95, 94, 94] }, // placeholder
    { id: 'kortisol', name: 'Kortisol', categoryId: 'hormoner', unit: 'nmol/L', decimals: 0,
      range: { low: 140, high: 690 },
      description: 'Kroppens stresshormon, målt om morgenen.',
      history: [410, 430, 420, 420] }, // placeholder
    { id: 'dhea-s', name: 'DHEA-S', categoryId: 'hormoner', unit: 'µmol/L', decimals: 1,
      range: { low: 4.3, high: 12.2 },
      description: 'Forstadie til kønshormoner, dannet i binyrerne.',
      history: [7.9, 7.8, 7.8, 7.8] }, // placeholder
    { id: 'frit-testosteron', name: 'Frit testosteron', categoryId: 'hormoner', unit: 'nmol/L', decimals: 2,
      range: { low: 0.20, high: 0.62 },
      description: 'Den del af testosteronet, der ikke er bundet, og som kroppen kan bruge.',
      history: [0.39, 0.41, 0.41, 0.41] }, // placeholder

    // --- Skjoldbruskkirtel (3) -----------------------------------------------
    { id: 'tsh', name: 'TSH', categoryId: 'skjoldbruskkirtel', unit: 'mIE/L', decimals: 1,
      range: { low: 0.4, high: 4.0 },
      description: 'Hormonet, der styrer skjoldbruskkirtlen.',
      history: [1.9, 1.7, 1.8, 1.8] }, // placeholder
    { id: 'frit-t4', name: 'Frit T4', categoryId: 'skjoldbruskkirtel', unit: 'pmol/L', decimals: 0,
      range: { low: 12, high: 22 },
      description: 'Skjoldbruskkirtlens hovedhormon.',
      history: [16, 16, 16, 16] }, // placeholder
    { id: 'frit-t3', name: 'Frit T3', categoryId: 'skjoldbruskkirtel', unit: 'pmol/L', decimals: 1,
      range: { low: 3.1, high: 6.8 },
      description: 'Den aktive form af stofskiftehormonet.',
      history: [4.8, 4.9, 4.9, 4.9] }, // placeholder

    // --- Lever (5) -----------------------------------------------------------
    { id: 'alat', name: 'ALAT', categoryId: 'lever', unit: 'U/L', decimals: 0,
      range: { low: 10, high: 70 },
      description: 'Leverenzym. Forhøjet niveau kan tyde på belastning af leveren.',
      history: [26, 24, 24, 24] }, // placeholder
    { id: 'asat', name: 'ASAT', categoryId: 'lever', unit: 'U/L', decimals: 0,
      range: { low: 15, high: 45 },
      description: 'Enzym fra lever og muskler.',
      history: [23, 22, 22, 22] }, // placeholder
    { id: 'ggt', name: 'GGT', categoryId: 'lever', unit: 'U/L', decimals: 0,
      range: { low: 10, high: 80 },
      description: 'Leverenzym, der påvirkes af bl.a. alkohol.',
      history: [22, 21, 21, 21] }, // placeholder
    { id: 'basisk-fosfatase', name: 'Basisk fosfatase', categoryId: 'lever', unit: 'U/L', decimals: 0,
      range: { low: 35, high: 105 },
      description: 'Enzym fra lever og knogler.',
      history: [60, 62, 62, 62] }, // placeholder
    { id: 'albumin', name: 'Albumin', categoryId: 'lever', unit: 'g/L', decimals: 0, // placeholder (name)
      range: { low: 36, high: 48 },
      description: 'Protein dannet i leveren. Afspejler leverfunktion og ernæring.',
      history: [44, 44, 44, 44] }, // placeholder

    // --- Nyrer (3) -----------------------------------------------------------
    { id: 'kreatinin', name: 'Kreatinin', categoryId: 'nyrer', unit: 'µmol/L', decimals: 0,
      range: { low: 60, high: 105 },
      description: 'Affaldsstof fra musklerne, som nyrerne udskiller.',
      history: [86, 84, 84, 84] }, // placeholder
    { id: 'egfr', name: 'eGFR', categoryId: 'nyrer', unit: 'mL/min', decimals: 0,
      range: { low: 60 },
      description: 'Et skøn over, hvor godt nyrerne filtrerer blodet.',
      history: [96, 98, 98, 98] }, // placeholder
    { id: 'cystatin-c', name: 'Cystatin C', categoryId: 'nyrer', unit: 'mg/L', decimals: 2,
      range: { low: 0.60, high: 1.10 },
      description: 'Alternativt mål for nyrefunktion, mindre påvirket af muskelmasse.',
      history: [0.84, 0.82, 0.82, 0.82] }, // placeholder

    // --- Blod (6) ------------------------------------------------------------
    { id: 'haemoglobin', name: 'Hæmoglobin', categoryId: 'blod', unit: 'mmol/L', decimals: 1,
      range: { low: 8.3, high: 10.5 },
      description: 'Det iltbærende protein i de røde blodlegemer.',
      history: [9.3, 9.4, 9.4, 9.4] }, // placeholder
    { id: 'haematokrit', name: 'Hæmatokrit', categoryId: 'blod', unit: '', decimals: 2,
      range: { low: 0.40, high: 0.50 },
      description: 'Andelen af blodet, der består af røde blodlegemer.',
      history: [0.45, 0.45, 0.45, 0.45] }, // placeholder
    { id: 'leukocytter', name: 'Leukocytter', categoryId: 'blod', unit: '10⁹/L', decimals: 1,
      range: { low: 3.5, high: 8.8 },
      description: 'Hvide blodlegemer — en del af immunforsvaret.',
      history: [5.8, 5.6, 5.6, 5.6] }, // placeholder
    { id: 'trombocytter', name: 'Trombocytter', categoryId: 'blod', unit: '10⁹/L', decimals: 0,
      range: { low: 145, high: 390 },
      description: 'Blodplader, der får blodet til at størkne.',
      history: [238, 240, 240, 240] }, // placeholder
    { id: 'erytrocytter', name: 'Erytrocytter', categoryId: 'blod', unit: '10¹²/L', decimals: 1,
      range: { low: 4.3, high: 5.7 },
      description: 'Røde blodlegemer.',
      history: [5.0, 5.0, 5.0, 5.0] }, // placeholder
    { id: 'mcv', name: 'MCV', categoryId: 'blod', unit: 'fL', decimals: 0,
      range: { low: 82, high: 98 },
      description: 'Den gennemsnitlige størrelse af de røde blodlegemer.',
      history: [89, 89, 89, 89] }, // placeholder

    // --- Inflammation (2) ----------------------------------------------------
    { id: 'hs-crp', name: 'hs-CRP', categoryId: 'inflammation', unit: 'mg/L', decimals: 1,
      range: { high: 1.0 }, better: 'lower',
      description: 'Følsom måling af lavgradig inflammation i kroppen.',
      history: [0.9, 0.8, 0.7, 0.6] },
    { id: 'fibrinogen', name: 'Fibrinogen', categoryId: 'inflammation', unit: 'µmol/L', decimals: 1,
      range: { low: 5.0, high: 12.0 },
      description: 'Protein, der indgår i blodets størkning og stiger ved inflammation.',
      history: [8.9, 8.8, 8.8, 8.8] } // placeholder
  ],

  // Results without a reference range ("Andet"). Not counted in the 45.
  other: {
    summary: '2 resultater uden referenceområde',
    items: [
      { id: 'blodtype', name: 'Blodtype', value: 'A' },
      { id: 'rhd', name: 'Rhesus (RhD)', value: 'Positiv' }
    ]
  },

  /* Doctor's notes. PLACEHOLDER copy until signed off.
     overall = the excerpt shown on the overview.
     reports = one per test, newest first (noter.html).
     categories / markers = per-category and per-marker notes. */
  notes: {
    overall: {
      date: '14. september 2026',
      reviewedBy: 'Gennemgået af Revigoras lægeteam',
      excerpt: 'Dit samlede billede er stærkt: lipidprofil, inflammation og organfunktion ligger i det optimale område, og din ApoB er faldet for fjerde test i træk. Vi vil dog gerne have fokus på din fasteinsulin, som er steget siden marts og nu ligger over området …'
    },
    reports: [
      { testIndex: 3, date: '2026-09-14',
        summary: [
          'Dit samlede billede er stærkt. 42 af 45 markører ligger i det optimale område, og flere af de vigtigste markører for langsigtet hjertesundhed bevæger sig i den rigtige retning. Din ApoB er faldet fra 0,91 til 0,74 g/L over fire målinger, hvilket er et af de klareste tegn på lav risiko for hjerte-kar-sygdom.',
          'Det, vi gerne vil have dit fokus på, er din fasteinsulin. Den er steget fra 8,1 til 13,9 mIE/L siden marts 2025 og ligger nu over det optimale område, selvom dit blodsukker (HbA1c og faste-glukose) stadig er normalt. Det er typisk et tidligt signal: kroppen skal bruge mere insulin for at holde blodsukkeret stabilt. Det er godt at fange nu, fordi det reagerer hurtigt på kost, bevægelse og søvn.',
          'Din D-vitamin (46 nmol/L) og ferritin (38 µg/L) er lidt lave. Det er meget almindeligt i Danmark efter sommeren og let at rette med et D3-tilskud og lidt mere jernrig kost. Lave jernlagre kan mærkes som træthed og langsommere restitution, så det er værd at tage alvorligt, selvom tallet ikke er bekymrende.'
        ],
        good: ['ApoB faldet 19 % på 18 måneder', 'Ingen tegn på kronisk inflammation (hs-CRP 0,6)', 'Lever, nyrer og skjoldbruskkirtel helt normale'],
        watch: ['Fasteinsulin 13,9 mIE/L, stigende', 'D-vitamin 46 nmol/L, lidt lav', 'Ferritin 38 µg/L, lidt lav'],
        recommendation: 'Følg din handlingsplan de næste 90 dage, og test igen i december. Vi forventer at se din fasteinsulin falde mod det optimale område og din D-vitamin over 75 nmol/L. Har du symptomer som udtalt træthed, svimmelhed eller hjertebanken, så kontakt din egen læge.' },
      // Older reports: not designed in Paper — placeholder copy
      { testIndex: 2, date: '2026-03-16',
        summary: [
          'Et godt resultat med 44 af 45 markører i området. Din ApoB og dit LDL-kolesterol fortsætter nedad, og din D-vitamin har holdt sig pænt gennem vinteren.',
          'Din fasteinsulin er steget til 11,2 mIE/L og ligger nu lige over området. Blodsukkeret er normalt, så det er et tidligt signal, vi gerne vil følge tæt.'
        ],
        good: ['ApoB og LDL faldende', 'D-vitamin stabil gennem vinteren', 'B12 målt for første gang i panelet – fint niveau'],
        watch: ['Fasteinsulin 11,2 mIE/L, lige over området'],
        recommendation: 'Prøv at gå en tur efter dagens største måltid og skær ned på hvidt brød og pasta. Test igen til september.' },
      { testIndex: 1, date: '2025-09-15',
        summary: [
          'Alle 45 markører ligger i området. Din D-vitamin er steget markant efter sommeren, og ApoB er nu under grænsen.',
          'Fasteinsulin er steget lidt siden marts, men ligger stadig inden for området.'
        ],
        good: ['Alle markører i området', 'D-vitamin steget fra 42 til 82 nmol/L', 'ApoB under 0,90 g/L'],
        watch: ['Fasteinsulin svagt stigende'],
        recommendation: 'Fortsæt som nu, og overvej et D3-tilskud fra oktober, så du ikke falder for lavt igen i vinter.' },
      { testIndex: 0, date: '2025-03-17',
        summary: [
          'Velkommen til Revigora. Din første test giver et godt udgangspunkt: 43 af 45 markører ligger i området.',
          'Din D-vitamin er lav efter vinteren, og din ApoB ligger lige over grænsen. Begge dele kan rykkes med enkle ændringer.'
        ],
        good: ['Lever, nyrer og skjoldbruskkirtel normale', 'Ingen tegn på inflammation'],
        watch: ['D-vitamin 42 nmol/L, lav', 'ApoB 0,91 g/L, lige over grænsen'],
        recommendation: 'Start på et D3-tilskud og spis mere fisk og bælgfrugter. Vi ser på tallene igen om et halvt år.' }
    ],
    categories: {
      vitaminer: {
        excerpt: 'To af dine markører i denne kategori ligger lidt lavt: D-vitamin på 46 nmol/L og ferritin på 38 µg/L. Begge dele er meget almindeligt i Danmark og ikke bekymrende i sig selv, men lave jernlagre kan give træthed og langsommere restitution efter træning. Din B12 er derimod steget siden marts og ligger nu solidt i området …',
        paragraphs: [
          'To af dine markører i denne kategori ligger lidt lavt: D-vitamin på 46 nmol/L og ferritin på 38 µg/L. Begge dele er meget almindeligt i Danmark og ikke bekymrende i sig selv.',
          'Din D-vitamin er faldet fra 71 nmol/L i marts, hvilket passer med årstiden. Vi anbefaler 2.000 IE D3 dagligt fra nu og frem til april. Ferritin har været svagt faldende over tre målinger. Lave jernlagre kan give træthed og langsommere restitution efter træning, så vi foreslår mere jernrig kost frem for tilskud som første skridt.',
          'Din B12 er steget fra 320 til 410 pmol/L siden sidst og ligger nu solidt i området. Folat, magnesium og zink er stabile.'
        ] },
      hjerte: { paragraphs: [
        'Alle otte markører ligger i området. Din ApoB er faldet ved hver måling og er nu 0,74 g/L – et af de stærkeste tegn på lav risiko for hjerte-kar-sygdom.',
        'LDL og triglycerider følger samme retning, og dit HDL er steget en smule. Fortsæt med den kost og træning, du har nu.'
      ] },
      stofskifte: { paragraphs: [
        'Din fasteinsulin er steget ved hver måling og ligger nu over området, mens dit blodsukker (HbA1c 34, faste-glukose 5,3) stadig er normalt.',
        'Det er et tidligt signal om, at kroppen skal bruge mere insulin for at holde blodsukkeret stabilt. Det reagerer typisk godt på kost, bevægelse og søvn inden for 3 måneder.'
      ] },
      hormoner: { paragraphs: ['Dine hormoner ligger alle i området og har været stabile over de seneste målinger.'] },
      skjoldbruskkirtel: { paragraphs: ['Din skjoldbruskkirtel fungerer normalt. TSH, frit T4 og frit T3 er stabile.'] },
      lever: { paragraphs: ['Dine levertal er normale og stabile. Der er ingen tegn på belastning af leveren.'] },
      nyrer: { paragraphs: ['Dine nyrer filtrerer blodet fint. Kreatinin, eGFR og cystatin C ligger midt i området.'] },
      blod: { paragraphs: ['Dit blodbillede er normalt. Hæmoglobin og de røde blodlegemer ligger stabilt, selvom dine jernlagre er lidt lave.'] },
      inflammation: { paragraphs: ['Ingen tegn på kronisk lavgradig inflammation. Din hs-CRP er faldet ved hver måling og er nu 0,6 mg/L.'] }
    },
    markers: {
      fasteinsulin: 'Din fasteinsulin er steget ved hver måling og ligger nu over området, mens dit blodsukker (HbA1c 34, faste-glukose 5,3) stadig er normalt. Det betyder, at kroppen i dag skal bruge mere insulin end før for at holde blodsukkeret stabilt. Det er et tidligt signal – ikke en diagnose – og det reagerer typisk godt på ændringer i kost, bevægelse og søvn inden for 3 måneder.',
      'd-vitamin': 'Din D-vitamin er faldet fra 71 nmol/L i marts, hvilket passer med årstiden. Vi anbefaler 2.000 IE D3 dagligt fra nu og frem til april, så du ligger over 75 nmol/L ved næste test.',
      ferritin: 'Ferritin har været svagt faldende over tre målinger og ligger nu lige under området. Lave jernlagre kan give træthed og langsommere restitution efter træning, så vi foreslår mere jernrig kost frem for tilskud som første skridt.',
      apob: 'Din ApoB er faldet fra 0,91 til 0,74 g/L over fire målinger. Det er et af de klareste tegn på lav risiko for hjerte-kar-sygdom. Fortsæt som nu.'
    }
  },

  /* Category page content (hero tagline + "Om kategorien"). PLACEHOLDER.
     Only Vitaminer & mineraler is written out in Paper; the rest are short
     placeholders in the same shape. */
  categoryContent: {
    vitaminer: {
      tagline: 'De byggesten, kroppen ikke selv kan lave. De styrer alt fra energi og immunforsvar til knogler, nerver og iltoptagelse.',
      aboutTitle: 'Om vitaminer & mineraler',
      intro: 'Vitaminer og mineraler er de mikronæringsstoffer, kroppen ikke selv kan producere – eller ikke kan producere nok af. Selvom vi kun har brug for små mængder, er de afgørende for energiomsætning, immunforsvar, nervesystem, knogler og blodets evne til at transportere ilt.',
      why: ['Et let underskud giver sjældent tydelige symptomer. I stedet viser det sig ofte som diffus træthed, dårligere søvn, hyppigere forkølelser eller langsommere restitution. Derfor giver det mening at måle frem for at gætte.'],
      sections: [
        { id: 'd-vitamin-i-danmark', title: 'D-vitamin i Danmark', paragraphs: ['Fra oktober til april står solen for lavt i Danmark til, at huden kan danne D-vitamin. Mange danskere ligger derfor under 50 nmol/L i vinterhalvåret. Sundhedsstyrelsen anbefaler tilskud til en lang række grupper, og for de fleste er et dagligt D3-tilskud den enkleste vej til et stabilt niveau.'] },
        { id: 'jern-og-ferritin', title: 'Jern og ferritin', paragraphs: ['Ferritin afspejler kroppens jernlager. Et lavt lager kan påvirke energi og udholdenhed, længe før det giver blodmangel. Jern fra kød og fisk optages bedst, mens jern fra planter optages bedre sammen med C-vitamin – og dårligere sammen med kaffe og te.'] },
        // Listed in Paper's About nav but without body copy — placeholder
        { id: 'b-vitaminer-og-mineraler', title: 'B-vitaminer og mineraler', paragraphs: ['B12 og folat indgår i dannelsen af røde blodlegemer og i nervesystemet, mens magnesium og zink bruges i hundredvis af enzymer. De fleste får nok gennem en varieret kost, men B12 kan blive lav ved en plantebaseret kost.'] }
      ]
    },
    hjerte: {
      tagline: 'Markørerne, der bedst forudsiger din risiko for hjerte-kar-sygdom – længe før der er symptomer.',
      aboutTitle: 'Om hjerte & kredsløb',
      intro: 'Hjerte-kar-sygdom udvikler sig langsomt over årtier. Blodprøver kan vise, hvor mange kolesterolbærende partikler der cirkulerer i blodet, og dermed hvor stor belastningen af karvæggen er over tid.',
      why: ['ApoB tæller de partikler, der kan aflejre kolesterol i karvæggen, og er derfor et mere præcist mål end LDL alene. Lp(a) er arveligt og behøver kun måles én gang.'],
      sections: [{ id: 'apob-og-ldl', title: 'ApoB og LDL', paragraphs: ['LDL måler mængden af kolesterol, mens ApoB måler antallet af partikler. Når de to peger i forskellige retninger, er ApoB den bedste rettesnor.'] }]
    },
    stofskifte: {
      tagline: 'Hvordan kroppen håndterer sukker og energi – og de tidlige tegn på, at noget er ved at ændre sig.',
      aboutTitle: 'Om stofskifte',
      intro: 'Stofskiftemarkørerne viser, hvor godt kroppen regulerer blodsukkeret. Insulin stiger ofte flere år, før blodsukkeret gør, og er derfor et tidligt varsel.',
      why: ['Insulinresistens kan i mange år give få symptomer. Ved at måle fasteinsulin sammen med HbA1c og faste-glukose kan man se ændringerne, mens de stadig er nemme at vende.'],
      sections: [{ id: 'insulin-og-blodsukker', title: 'Insulin og blodsukker', paragraphs: ['Kost, bevægelse og søvn påvirker insulinfølsomheden hurtigt. En gåtur efter måltider og færre hurtige kulhydrater er to af de mest effektive tiltag.'] }]
    },
    hormoner: { tagline: 'Kønshormoner og stresshormon, der påvirker energi, humør, muskler og søvn.', aboutTitle: 'Om hormoner', intro: 'Hormonerne er kroppens signalstoffer. Niveauerne svinger naturligt over døgnet, så prøven tages om morgenen for at kunne sammenligne over tid.', why: ['Ændringer i testosteron, østradiol eller kortisol kan forklare træthed, dårlig søvn eller langsom restitution.'], sections: [] },
    skjoldbruskkirtel: { tagline: 'Kirtlen, der sætter tempoet for kroppens stofskifte.', aboutTitle: 'Om skjoldbruskkirtlen', intro: 'Skjoldbruskkirtlen styrer, hvor hurtigt kroppen omsætter energi. TSH er hjernens signal til kirtlen, mens T4 og T3 er de hormoner, kirtlen selv danner.', why: ['Både for lavt og for højt stofskifte er almindeligt og kan give diffuse symptomer som træthed, vægtændringer og uro.'], sections: [] },
    lever: { tagline: 'Kroppens kemiske fabrik – afgiftning, proteiner og energilagre.', aboutTitle: 'Om leveren', intro: 'Levertallene viser, om leveren er belastet. Forhøjede enzymer kan skyldes alkohol, fedtlever, medicin eller hård træning.', why: ['Fedtlever er udbredt og giver sjældent symptomer, men kan opdages tidligt gennem blodprøver.'], sections: [] },
    nyrer: { tagline: 'Filtrene, der holder blodet rent og væskebalancen stabil.', aboutTitle: 'Om nyrerne', intro: 'Nyretallene viser, hvor godt nyrerne filtrerer blodet. eGFR er et skøn over filtrationen, mens cystatin C er mindre påvirket af muskelmasse.', why: ['Nedsat nyrefunktion udvikler sig ofte langsomt og uden symptomer.'], sections: [] },
    blod: { tagline: 'Røde og hvide blodlegemer og blodplader – ilttransport og immunforsvar.', aboutTitle: 'Om blodet', intro: 'Blodbilledet viser, om du har nok røde blodlegemer til at transportere ilt, og om immunforsvaret er i balance.', why: ['Lav hæmoglobin eller små røde blodlegemer kan være tegn på jernmangel.'], sections: [] },
    inflammation: { tagline: 'Lavgradig betændelse i kroppen, der over tid belaster hjerte, kar og led.', aboutTitle: 'Om inflammation', intro: 'Kronisk lavgradig inflammation giver ingen symptomer, men hænger sammen med en lang række livsstilssygdomme.', why: ['hs-CRP er en følsom måling, der kan opfange selv små forhøjelser.'], sections: [] }
  },

  /* Marker page content. PLACEHOLDER. Markers without an entry fall back to
     `description`, and sections without content are hidden. */
  markerContent: {
    fasteinsulin: {
      eyebrow: 'Insulin, fastende',
      lead: 'Hormonet, der flytter sukker fra blodet ind i cellerne. Et højt niveau i fastende tilstand er ofte det tidligste tegn på, at kroppen er blevet mindre følsom for insulin.',
      aboutTitle: 'Hvad er fasteinsulin?',
      about: [
        'Insulin dannes i bugspytkirtlen og åbner cellerne for sukker fra blodet. Når cellerne bliver mindre følsomme – insulinresistens – kompenserer kroppen ved at producere mere. Derfor stiger insulin ofte flere år, før blodsukkeret gør.',
        'Prøven tages fastende, fordi et måltid får insulin til at stige kraftigt i nogle timer. Søvnmangel, stress og hård træning dagen før kan også påvirke tallet en smule.'
      ],
      actions: ['Gå 10 minutter efter dagens største måltid', 'Byt hvidt brød og pasta ud med rugbrød og bælgfrugter', 'Styrketræning 2× om ugen'],
      labLimit: '< 25',
      related: ['hba1c', 'faste-glukose']
    },
    'd-vitamin': {
      eyebrow: '25-hydroxy-D-vitamin',
      aboutTitle: 'Hvad er D-vitamin?',
      about: ['D-vitamin dannes i huden, når solen skinner, og lagres i kroppen. Målingen viser dit depot, ikke hvad du har spist i dag.'],
      actions: ['2.000 IE D3 dagligt med et måltid med fedt', 'Fed fisk som sild og makrel 2× om ugen', '15–20 min. dagslys midt på dagen, når solen er fremme'],
      labLimit: '> 25',
      related: ['ferritin', 'b12']
    },
    ferritin: {
      eyebrow: 'Jernlager',
      aboutTitle: 'Hvad er ferritin?',
      about: ['Ferritin er det protein, kroppen lagrer jern i. Et lavt niveau betyder, at lagrene er ved at være tomme, selv om hæmoglobinen stadig er normal.'],
      actions: ['Rødt kød eller linser 3–4× om ugen', 'C-vitamin til jernrige måltider', 'Undgå kaffe og te en time før og efter måltider'],
      labLimit: '15–400',
      related: ['haemoglobin', 'transferrinmaetning']
    },
    apob: {
      eyebrow: 'Apolipoprotein B',
      aboutTitle: 'Hvad er ApoB?',
      about: ['Hver kolesterolpartikel, der kan aflejres i karvæggen, bærer præcis ét ApoB-protein. Derfor er ApoB et direkte mål for antallet af skadelige partikler.'],
      related: ['ldl', 'non-hdl']
    }
  },

  /* Action plan. PLACEHOLDER food lists, doses and copy until signed off. */
  plan: {
    targets: ['fasteinsulin', 'd-vitamin', 'ferritin'],
    diet: {
      summary: 'Laks, linser, spinat, sild …',
      intro: 'Fødevarerne er valgt ud fra dine resultater og prioriteret efter, hvor meget de kan rykke dine markører. De ændrer sig, efterhånden som dine tal ændrer sig.',
      enjoyTop: [
        { name: 'Sild og makrel', targets: 'D-vitamin · Fasteinsulin' },
        { name: 'Linser og kikærter', targets: 'Ferritin · Fasteinsulin' },
        { name: 'Græsfodret oksekød', targets: 'Ferritin' },
        { name: 'Æg fra fritgående høns', targets: 'D-vitamin' },
        { name: 'Havregryn og rugbrød', targets: 'Fasteinsulin' }
      ],
      enjoy: [
        'Abrikoser, tørrede', 'Avocado', 'Asparges',
        'Blåbær', 'Broccoli', 'Bønner, sorte og hvide',
        'Chiafrø', 'Dild', 'Edamamebønner', 'Fuldkornspasta',
        'Græsfodret oksekød', 'Grønkål', 'Havregryn', 'Hytteost',
        'Ingefær', 'Jordbær', 'Kikærter', 'Kyllingelår',
        'Laks', 'Linser', 'Makrel', 'Mandler', 'Nødder, blandede',
        'Olivenolie', 'Peberfrugt, rød', 'Persille', 'Quinoa',
        'Rugbrød', 'Rødbeder', 'Sild', 'Spinat', 'Squash',
        'Tang', 'Tun', 'Usødet yoghurt', 'Valnødder', 'Æg', 'Ørred'
      ],
      limitTop: [
        { name: 'Sodavand, juice og smoothies', targets: 'Fasteinsulin' },
        { name: 'Hvidt brød, pasta og ris', targets: 'Fasteinsulin' },
        { name: 'Kaffe og te til måltider', targets: 'Ferritin · hæmmer jernoptag' },
        { name: 'Kager, kiks og slik', targets: 'Fasteinsulin' },
        { name: 'Alkohol', targets: 'Fasteinsulin · Søvn' }
      ],
      limit: [
        'Agavesirup', 'Ananas på dåse', 'Appelsinjuice',
        'Bagels og hvide boller', 'Bacon og forarbejdet kød', 'Brød af hvidt mel',
        'Cornflakes', 'Energidrik', 'Færdigretter',
        'Kaffe til måltider', 'Kiks og kager', 'Pålæg, forarbejdet', 'Slik', 'Sodavand'
      ]
    },
    supplements: {
      summary: 'D3-vitamin, jernbisglycinat, omega-3 …',
      intro: 'Sorteret efter, hvor meget de forventes at rykke dine markører. Start oppefra – de to første giver den største effekt for dig lige nu.',
      items: [
        { name: 'D3-vitamin', dose: '2.000 IE · dagligt · med et måltid med fedt', why: 'Din D-vitamin er 46 nmol/L. Målet er over 75 nmol/L inden din næste test i december.', targets: ['d-vitamin'], badge: 'Højeste prioritet' },
        { name: 'Jernbisglycinat', dose: '25 mg · hver anden dag · med C-vitamin', why: 'Skånsom form for jern, der sjældent giver maveproblemer. Undgå kaffe og te en time før og efter.', targets: ['ferritin'] },
        { name: 'Omega-3 (EPA + DHA)', dose: '2 g · dagligt', targetsText: 'Fasteinsulin' },
        { name: 'Magnesiumbisglycinat', dose: '300 mg · om aftenen', targetsText: 'Fasteinsulin · Søvn' },
        { name: 'Psylliumfibre', dose: '5 g · før dagens største måltid', targetsText: 'Fasteinsulin' }
      ],
      notNeeded: 'B12, folat og zink ligger allerede i det optimale område. Et ekstra tilskud vil ikke gøre en forskel – spar pengene.',
      disclaimer: 'Tal med din læge, før du starter på jerntilskud, eller hvis du tager anden medicin. Anbefalingerne er gennemgået af Revigoras lægeteam.'
    }
  },

  /* Ordering (bestil.html). Prices from PRD.md. Clinics are fictional. */
  order: {
    recommendation: { title: 'Lægeteamet anbefaler en ny test i december', text: 'For at følge op på fasteinsulin, D-vitamin og ferritin.' },
    packages: [
      { id: 'membership', name: 'Revigora Membership', tag: 'Anbefalet for dig', tagKind: 'mint',
        description: '45+ biomarkører 4 gange om året, løbende gennemgang fra lægeteamet og opdateret handlingsplan efter hver test.',
        highlight: 'Du tester 2× om året i dag. Med medlemskab får du 4 tests for 4.760 kr. i stedet for 7.980 kr. for 2.',
        price: 1190, priceUnit: 'pr. kvartal',
        summaryNote: 'Første kvartal. Derefter 1.190 kr. pr. kvartal – kan opsiges inden næste test.' },
      { id: 'longevity', name: 'Longevity & Healthspan', tag: 'Din seneste test', tagKind: 'paper',
        description: '45+ biomarkører inkl. ApoB, hs-CRP, fasteinsulin, skjoldbruskkirtel og biologisk alder.',
        price: 3990, priceUnit: 'engangsbetaling',
        summaryNote: 'Engangsbetaling. Inkluderer gennemgang fra lægeteamet.' }, // placeholder (summary note)
      { id: 'performance', name: 'Performance & Fitness',
        description: '28 biomarkører: hormoner, stofskifte, lipider, D-vitamin og ferritin.',
        price: 2490, priceUnit: 'engangsbetaling',
        summaryNote: 'Engangsbetaling. Inkluderer gennemgang fra lægeteamet.' } // placeholder (summary note)
    ],
    defaultPackage: 'membership',
    cities: [
      { id: 'kbh', name: 'København', clinic: 'Partnerklinik, Østerbro', address: 'Østerbrogade 56, 2100 København Ø' },
      { id: 'aarhus', name: 'Aarhus', clinic: 'Partnerklinik, Aarhus C', address: 'Frederiksgade 40, 8000 Aarhus C' }, // placeholder
      { id: 'odense', name: 'Odense', clinic: 'Partnerklinik, Odense C', address: 'Vestergade 18, 5000 Odense C' } // placeholder
    ],
    duration: 'prøvetagning ca. 10 min.',
    days: ['2026-12-07', '2026-12-08', '2026-12-09', '2026-12-10', '2026-12-11'],
    defaultDay: '2026-12-09',
    slots: ['07:30', '07:50', '08:10', '08:30', '08:50', '09:10', '09:30'],
    defaultSlot: '07:50',
    // Unavailable slots per city/day — placeholder availability
    unavailable: {
      kbh: { '2026-12-07': ['07:30', '08:10'], '2026-12-08': ['09:30'], '2026-12-09': ['08:50'], '2026-12-10': ['07:30', '07:50'], '2026-12-11': [] },
      aarhus: { '2026-12-07': [], '2026-12-08': ['07:50', '08:30'], '2026-12-09': ['07:30'], '2026-12-10': ['09:10'], '2026-12-11': ['08:10', '08:50'] },
      odense: { '2026-12-07': ['09:10'], '2026-12-08': [], '2026-12-09': ['08:30', '09:30'], '2026-12-10': [], '2026-12-11': ['07:30'] }
    },
    fastingNote: 'Kom fastende – intet at spise 10 timer før. Vand er fint. Tider før kl. 10 giver det mest præcise resultat.',
    paymentMethods: 'MobilePay · Kort · Apple Pay',
    included: ['Svar i appen inden for 3–5 hverdage', 'Gennemgang fra Revigoras lægeteam', 'Opdateret handlingsplan', 'Gratis ombooking op til 24 timer før']
  },

  /* Profile (profil.html). Contact details are fictional. */
  profile: {
    email: 'mikkel.krogh@mail.dk',
    phone: '+45 22 41 87 30',
    login: 'MitID',
    customerSince: 'marts 2025',
    membership: {
      eyebrow: 'Nuværende · Enkelttests',
      text: 'Du har betalt 15.960 kr. for 4 tests på 18 måneder. Som medlem havde du betalt 7.140 kr. – og fået 6 tests.'
    },
    notifications: [
      { id: 'results', title: 'Nye resultater er klar', sub: 'E-mail og SMS', on: true },
      { id: 'reminder', title: 'Påmindelse om næste test', sub: '2 uger før anbefalet dato', on: true },
      { id: 'news', title: 'Nyheder og tilbud', sub: 'Højst én mail om måneden', on: false }
    ],
    consents: [
      { id: 'doctors', title: 'Lægeteamet må se mine resultater', sub: 'Påkrævet for noter og handlingsplan', on: true, locked: true },
      { id: 'research', title: 'Anonymiserede data til forskning', sub: 'Kan trækkes tilbage når som helst', on: false }
    ],
    language: 'Dansk'
  }
};
