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

  nextTest: {
    eyebrow: 'Næste måling · om 74 dage',
    text: 'Test igen i december for at se, om dine tiltag virker på fasteinsulin og D-vitamin.'
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
      range: { low: 2, high: 10 }, better: 'lower',
      description: 'Hvor meget insulin kroppen skal bruge for at holde blodsukkeret stabilt i fastende tilstand.',
      history: [8.1, 9.4, 11.2, 13.9] },
    { id: 'hba1c', name: 'HbA1c (langtidsblodsukker)', categoryId: 'stofskifte', unit: 'mmol/mol', decimals: 0,
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
    { id: 'd-vitamin', name: 'D-vitamin (25-OH)', categoryId: 'vitaminer', unit: 'nmol/L', decimals: 0,
      range: { low: 50, high: 150 }, better: 'higher',
      description: 'Kroppens D-vitamindepot. Vigtigt for knogler, muskler og immunforsvar.',
      history: [42, 82, 71, 46] },
    { id: 'ferritin', name: 'Ferritin', categoryId: 'vitaminer', unit: 'µg/L', decimals: 0,
      range: { low: 40, high: 300 }, better: 'higher',
      description: 'Viser størrelsen på kroppens jernlagre.',
      history: [61, 52, 44, 38] },
    { id: 'b12', name: 'B12-vitamin', categoryId: 'vitaminer', unit: 'pmol/L', decimals: 0,
      range: { low: 200, high: 700 }, better: 'higher', // range: placeholder
      description: 'Nødvendig for nervesystemet og dannelsen af røde blodlegemer.',
      history: [null, null, 320, 410] },
    { id: 'folat', name: 'Folat', categoryId: 'vitaminer', unit: 'nmol/L', decimals: 0,
      range: { low: 10 },
      description: 'B-vitamin, der indgår i celledeling og dannelse af blodlegemer.',
      history: [21, 23, 22, 22] }, // placeholder
    { id: 'magnesium', name: 'Magnesium', categoryId: 'vitaminer', unit: 'mmol/L', decimals: 2,
      range: { low: 0.70, high: 1.00 },
      description: 'Mineral, der indgår i muskel- og nervefunktion.',
      history: [0.84, 0.86, 0.85, 0.85] }, // placeholder
    { id: 'zink', name: 'Zink', categoryId: 'vitaminer', unit: 'µmol/L', decimals: 0,
      range: { low: 11, high: 18 },
      description: 'Mineral, der støtter immunforsvar og sårheling.',
      history: [14, 15, 14, 14] }, // placeholder
    { id: 'transferrinmaetning', name: 'Transferrinmætning', categoryId: 'vitaminer', unit: '%', decimals: 0,
      range: { low: 15, high: 50 },
      description: 'Hvor stor en del af blodets jerntransportør der er fyldt med jern.',
      history: [29, 27, 24, 24] }, // placeholder

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

  notes: {
    overall: {
      date: '14. september 2026',
      reviewedBy: 'Gennemgået af Revigoras lægeteam',
      excerpt: 'Dit samlede billede er stærkt: lipidprofil, inflammation og organfunktion ligger i det optimale område, og din ApoB er faldet for fjerde test i træk. Vi vil dog gerne have fokus på din fasteinsulin, som er steget siden marts og nu ligger over området …'
      // Full text for noter.html is added with that screen.
    },
    categories: {},
    markers: {}
  },

  plan: {
    diet: { summary: 'Laks, linser, spinat, sild …', enjoy: [], limit: [] },
    supplements: { summary: 'D3-vitamin, jernbisglycinat, omega-3 …', items: [] }
    // Full lists are added with the Handlingsplan screen.
  }
};
