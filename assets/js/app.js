/* =========================================================================
   Revigora — Customer app (static mockup)
   Shared shell (header, mega menu, theme toggle, tab bar) + per-page
   rendering from window.RV_DATA. Pages declare themselves with
   <body data-page="…">. No framework, no build step.
   ========================================================================= */

(function () {
  'use strict';

  var D = window.RV_DATA;
  if (!D) return;

  /* ============================== Helpers ================================ */

  var MONTHS = ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'];
  var MONTHS_SHORT = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
  var STATUS_LABEL = { in: 'I området', over: 'Over området', under: 'Under området' };
  var LATEST = D.tests.length - 1;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)');

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmt(v, decimals) { return v.toFixed(decimals || 0).replace('.', ','); }
  function parseDate(iso) { var p = iso.split('-'); return { y: +p[0], m: +p[1] - 1, d: +p[2] }; }
  function dateLong(iso) { var d = parseDate(iso); return d.d + '. ' + MONTHS[d.m] + ' ' + d.y; }
  function dateShort(iso) { var d = parseDate(iso); return d.d + '. ' + MONTHS_SHORT[d.m] + ' ' + d.y; }
  function monthYear(iso) { var d = parseDate(iso); return MONTHS[d.m] + ' ' + d.y; }
  function dateAxis(iso) {
    var d = parseDate(iso), m = MONTHS_SHORT[d.m];
    return m.charAt(0).toUpperCase() + m.slice(1) + ' ' + String(d.y).slice(2);
  }
  function param(name) { return new URLSearchParams(location.search).get(name); }

  var markersById = {};
  D.markers.forEach(function (m) { markersById[m.id] = m; });
  var categoriesById = {};
  D.categories.forEach(function (c) { categoriesById[c.id] = c; });

  function valueAt(m, t) { var v = m.history[t]; return v === undefined ? null : v; }
  function hasValue(m, t) { return valueAt(m, t) !== null; }

  function statusAt(m, t) {
    var v = valueAt(m, t);
    if (v === null) return null;
    if (m.range.high !== undefined && v > m.range.high) return 'over';
    if (m.range.low !== undefined && v < m.range.low) return 'under';
    return 'in';
  }
  function isOut(m, t) { var s = statusAt(m, t); return s === 'over' || s === 'under'; }

  // "Forbedres": moved in the marker's better direction since the previous
  // test and is in range now.
  function isImproving(m, t) {
    if (!m.better || t < 1) return false;
    var cur = valueAt(m, t), prev = valueAt(m, t - 1);
    if (cur === null || prev === null || statusAt(m, t) !== 'in') return false;
    return m.better === 'lower' ? cur < prev : cur > prev;
  }

  function markersIn(categoryId, t) {
    return D.markers.filter(function (m) { return m.categoryId === categoryId && hasValue(m, t); });
  }

  function counts(t) {
    var c = { total: 0, in: 0, out: 0, improving: 0 };
    D.markers.forEach(function (m) {
      if (!hasValue(m, t)) return;
      c.total++;
      if (isOut(m, t)) c.out++; else c.in++;
      if (isImproving(m, t)) c.improving++;
    });
    return c;
  }

  // Bands for the range preview / chart, top → bottom. Equal height on screen.
  function bandsOf(m) {
    if (m.bands) return m.bands;
    var lo = m.range.low, hi = m.range.high, d = m.decimals;
    if (lo !== undefined && hi !== undefined) {
      var span = hi - lo;
      return [
        { status: 'over', label: 'Over', text: '> ' + fmt(hi, d), min: hi, max: hi + span * 0.5 },
        { status: 'in', label: 'I området', text: fmt(lo, d) + '–' + fmt(hi, d), min: lo, max: hi },
        { status: 'under', label: 'Under', text: '< ' + fmt(lo, d), min: Math.max(0, lo - span * 0.5), max: lo }
      ];
    }
    if (hi !== undefined) {
      return [
        { status: 'over', label: 'Over', text: '> ' + fmt(hi, d), min: hi, max: hi * 1.5 },
        { status: 'in', label: 'I området', text: '< ' + fmt(hi, d), min: 0, max: hi }
      ];
    }
    return [
      { status: 'in', label: 'I området', text: '> ' + fmt(lo, d), min: lo, max: lo * 2.5 },
      { status: 'under', label: 'Under', text: '< ' + fmt(lo, d), min: 0, max: lo }
    ];
  }

  /* ================================ Icons ================================ */

  var ICON = {
    chevronDown: '<svg class="icon-12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5L6 7.5L9 4.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevronRight: '<svg class="icon-12" viewBox="0 0 12 12" aria-hidden="true"><path d="M4.5 3L7.5 6L4.5 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg class="icon-10" viewBox="0 0 10 10" aria-hidden="true"><path d="M2 2L8 8M8 2L2 8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    arrowUp: '<svg class="icon-10" viewBox="0 0 10 10" aria-hidden="true"><path d="M5 8.5V1.5M5 1.5L2 4.5M5 1.5L8 4.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    sun: '<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.4 3.4L4.5 4.5M11.5 11.5L12.6 12.6M3.4 12.6L4.5 11.5M11.5 4.5L12.6 3.4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    moon: '<svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 9.6A5.8 5.8 0 0 1 6.4 2.5a5.8 5.8 0 1 0 7.1 7.1Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    search: '<svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true"><circle cx="7" cy="7" r="4.8" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10.6 10.6L14 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    check: '<svg class="icon-12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 6.5L5 9L9.5 3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    // Category icons (20×20), from the Paper category rails
    heart: '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 16.5S3 12.4 3 7.6A3.6 3.6 0 0 1 10 6a3.6 3.6 0 0 1 7 1.6c0 4.8-7 8.9-7 8.9Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M5.5 10H8l1-2 2 4 1-2h2.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bolt: '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M11 2.5L4.5 11h5l-1 6.5L15.5 9h-5l.5-6.5Z" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
    pill: '<svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><rect x="3.5" y="7.5" width="13" height="5" rx="2.5" transform="rotate(-45 10 10)" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 8L12 12" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>'
  };

  /* ============================== Charts ================================= */

  // Overview sparkline, 64×24. Silver line; first point silver, last point in
  // the status colour.
  function sparkline(m, t) {
    var n = t + 1, pts = [];
    for (var i = 0; i < n; i++) {
      var v = valueAt(m, i);
      if (v !== null) pts.push({ x: n === 1 ? 60 : 4 + i * (56 / (n - 1)), v: v });
    }
    // Scale against ~20% of the range limit so small wobbles stay small (as in
    // Paper); larger moves use the full 6–18px height.
    var vals = pts.map(function (p) { return p.v; });
    var lo = Math.min.apply(null, vals), hi = Math.max.apply(null, vals);
    var ref = (m.range.high !== undefined ? m.range.high : m.range.low) * 0.2;
    var span = Math.max(hi - lo, ref), mid = (hi + lo) / 2;
    pts.forEach(function (p) { p.y = 12 - ((p.v - mid) / span) * 12; });
    var r = function (x) { return Math.round(x * 10) / 10; };
    var last = pts[pts.length - 1];
    var svg = '<svg class="sparkline" width="64" height="24" viewBox="0 0 64 24" aria-hidden="true">';
    if (pts.length > 1) {
      svg += '<polyline class="sparkline__line" points="' + pts.map(function (p) { return r(p.x) + ',' + r(p.y); }).join(' ') + '"/>';
      svg += '<circle class="sparkline__first" cx="' + r(pts[0].x) + '" cy="' + r(pts[0].y) + '" r="2.2"/>';
    }
    svg += '<circle class="sparkline__last is-' + (isOut(m, t) ? 'out' : 'in') + '" cx="' + r(last.x) + '" cy="' + r(last.y) + '" r="3"/>';
    return svg + '</svg>';
  }

  // Hover-preview chart, 196×132: equal-height bands (non-linear scale),
  // hollow past points, filled current point.
  function miniChart(m, t) {
    var W = 196, H = 132, bands = bandsOf(m), bh = H / bands.length;
    var n = t + 1;
    function yOf(v) {
      var idx = bands.length - 1;
      for (var i = 0; i < bands.length; i++) { if (v >= bands[i].min) { idx = i; break; } }
      var b = bands[idx];
      var f = Math.max(0, Math.min(1, (v - b.min) / (b.max - b.min)));
      return Math.max(6, Math.min(H - 6, idx * bh + (1 - f) * bh));
    }
    var r = function (x) { return Math.round(x * 10) / 10; };
    var svg = '<svg class="mini-chart" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '" aria-hidden="true">';
    bands.forEach(function (b, i) {
      if (b.status === 'in') svg += '<rect class="mini-chart__zone" x="0" y="' + r(i * bh) + '" width="' + W + '" height="' + r(bh) + '"/>';
    });
    for (var i = 1; i < bands.length; i++) {
      var dashed = bands[i].status === 'in' || bands[i - 1].status === 'in';
      svg += '<line class="mini-chart__rule' + (dashed ? ' is-dashed' : '') + '" x1="0" x2="' + W + '" y1="' + r(i * bh) + '" y2="' + r(i * bh) + '"/>';
    }
    var pts = [];
    for (var k = 0; k < n; k++) {
      var v = valueAt(m, k);
      if (v !== null) pts.push({ x: n === 1 ? 180 : 14 + k * (166 / (n - 1)), y: yOf(v), v: v });
    }
    if (pts.length > 1) svg += '<polyline class="mini-chart__line" points="' + pts.map(function (p) { return r(p.x) + ',' + r(p.y); }).join(' ') + '"/>';
    pts.forEach(function (p, i) {
      var isLast = i === pts.length - 1;
      svg += isLast
        ? '<circle class="mini-chart__dot is-' + (isOut(m, t) ? 'out' : 'in') + '" cx="' + r(p.x) + '" cy="' + r(p.y) + '" r="5"/>'
        : '<circle class="mini-chart__past" cx="' + r(p.x) + '" cy="' + r(p.y) + '" r="3.5"/>';
    });
    if (pts.length > 1) {
      var f = pts[0];
      svg += '<text class="mini-chart__label" x="' + r(f.x + 2) + '" y="' + r(f.y - 10 < 12 ? f.y + 18 : f.y - 10) + '" text-anchor="middle">' + fmt(f.v, m.decimals) + '</text>';
    }
    var l = pts[pts.length - 1];
    svg += '<text class="mini-chart__label is-current is-' + (isOut(m, t) ? 'out' : 'in') + '" x="' + r(l.x - 2) + '" y="' + r(l.y - 14 < 12 ? l.y + 20 : l.y - 14) + '" text-anchor="middle">' + fmt(l.v, m.decimals) + '</text>';
    return svg + '</svg>';
  }

  /* ============================ App shell ================================ */

  var HEALTH_PAGES = ['helbred', 'noter', 'kategori', 'markoer'];

  function renderHeader() {
    var page = document.body.getAttribute('data-page');
    var mount = document.querySelector('[data-app-header]');
    if (!mount) return;
    function navLink(href, label, key) {
      return '<a class="app-nav__link" href="' + href + '"' + (page === key ? ' aria-current="page"' : '') + '>' + label + '</a>';
    }
    mount.className = 'app-header';
    mount.innerHTML =
      '<div class="app-header__inner">' +
        '<a class="brand" href="helbred.html" aria-label="Revigora – Dit helbred">' +
          '<img class="brand__logo brand__logo--light" src="../assets/img/revigora-logo.svg" alt="" width="66" height="24">' +
          '<img class="brand__logo brand__logo--dark" src="../assets/img/revigora-logo-footer.svg" alt="" width="66" height="24">' +
        '</a>' +
        '<nav class="app-nav" aria-label="Hovedmenu">' +
          '<button type="button" class="app-nav__link app-nav__menu-btn' + (HEALTH_PAGES.indexOf(page) > -1 ? ' is-current' : '') + '" aria-expanded="false" aria-controls="mega-menu" data-mega-trigger>' +
            'Dit helbred' + ICON.chevronDown +
          '</button>' +
          navLink('handlingsplan.html', 'Handlingsplan', 'handlingsplan') +
          navLink('historik.html', 'Historik', 'historik') +
          navLink('bestil.html', 'Bestil ny test', 'bestil') +
        '</nav>' +
        '<div class="app-header__actions">' +
          '<div class="theme-toggle" role="group" aria-label="Tema">' +
            '<button type="button" class="theme-toggle__btn" data-theme-set="light" aria-label="Lyst tema">' + ICON.sun + '</button>' +
            '<button type="button" class="theme-toggle__btn" data-theme-set="dark" aria-label="Mørkt tema">' + ICON.moon + '</button>' +
          '</div>' +
          '<a class="avatar" href="profil.html" aria-label="Profil &amp; indstillinger"' + (page === 'profil' ? ' aria-current="page"' : '') + '>' + esc(D.user.initials) + '</a>' +
        '</div>' +
      '</div>';
    mount.insertAdjacentHTML('afterend', megaMenuHTML(page));
  }

  function megaMenuHTML(page) {
    var c = counts(LATEST);
    var filter = page === 'helbred' ? param('filter') : null;
    function shortcut(href, label, count, kind, active) {
      return '<a class="mega-menu__shortcut' + (active ? ' is-active' : '') + '" href="' + href + '"' + (active ? ' aria-current="page"' : '') + '>' +
        '<span>' + label + '</span>' +
        (count !== null ? '<span class="mega-menu__count' + (kind ? ' is-' + kind : '') + '">' + count + '</span>' : '') +
      '</a>';
    }
    var cats = D.categories.slice().sort(function (a, b) { return a.menuOrder - b.menuOrder; });
    var cols = [cats.slice(0, 3), cats.slice(3, 6), cats.slice(6, 9)];
    return '' +
      '<div class="mega-scrim" data-mega-scrim></div>' +
      '<div class="mega-menu" id="mega-menu" data-mega-menu>' +
        '<div class="mega-menu__inner">' +
          '<div class="mega-menu__shortcuts">' +
            '<p class="eyebrow mega-menu__label">Dit helbred</p>' +
            shortcut('helbred.html', 'Alle biomarkører', c.total, null, page === 'helbred' && !filter) +
            shortcut('helbred.html?filter=out', 'Uden for området', c.out, 'out', page === 'helbred' && filter === 'out') +
            shortcut('helbred.html?filter=improving', 'Forbedres', c.improving, 'improving', page === 'helbred' && filter === 'improving') +
            shortcut('noter.html', 'Lægeteamets noter', null, null, page === 'noter') +
            shortcut('handlingsplan.html', 'Din handlingsplan', null, null, false) +
          '</div>' +
          '<div class="mega-menu__categories">' +
            '<p class="eyebrow">Kategorier</p>' +
            '<div class="mega-menu__grid">' +
              cols.map(function (col) {
                return '<div class="mega-menu__col">' + col.map(function (cat) {
                  var out = markersIn(cat.id, LATEST).filter(function (m) { return isOut(m, LATEST); }).length;
                  return '<a class="mega-menu__cat" href="kategori.html?id=' + cat.id + '">' +
                    '<span>' + esc(cat.name) + '</span>' +
                    '<span class="mega-menu__status">' +
                      (out ? '<span class="mega-menu__out">' + out + '</span>' : '') +
                      '<span class="dot dot--7 dot--' + (out ? 'out' : 'in') + '"></span>' +
                      '<span class="visually-hidden">' + (out ? out + ' uden for området' : 'alle i området') + '</span>' +
                    '</span>' +
                  '</a>';
                }).join('') + '</div>';
              }).join('') +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function initMegaMenu() {
    var trigger = document.querySelector('[data-mega-trigger]');
    var menu = document.querySelector('[data-mega-menu]');
    var scrim = document.querySelector('[data-mega-scrim]');
    if (!trigger || !menu) return;
    var closeTimer = null;

    function setOpen(open, opts) {
      clearTimeout(closeTimer);
      if (open === menu.classList.contains('is-open')) return;
      menu.classList.toggle('is-open', open);
      scrim.classList.toggle('is-open', open);
      trigger.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('has-mega-open', open);
      if (!open && opts && opts.returnFocus) trigger.focus();
    }
    trigger.addEventListener('click', function () { setOpen(!menu.classList.contains('is-open')); });
    scrim.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setOpen(false, { returnFocus: true });
    });
    document.addEventListener('click', function (e) {
      if (!menu.classList.contains('is-open')) return;
      if (menu.contains(e.target) || trigger.contains(e.target)) return;
      setOpen(false);
    });
    // Keyboard: closing when focus leaves trigger + menu
    menu.addEventListener('focusout', function (e) {
      if (e.relatedTarget && !menu.contains(e.relatedTarget) && e.relatedTarget !== trigger) setOpen(false);
    });
    // Hover on desktop
    function hoverOpen() { if (canHover.matches) setOpen(true); }
    function hoverClose() {
      if (!canHover.matches) return;
      clearTimeout(closeTimer);
      closeTimer = setTimeout(function () { setOpen(false); }, 180);
    }
    trigger.addEventListener('mouseenter', hoverOpen);
    trigger.addEventListener('mouseleave', hoverClose);
    menu.addEventListener('mouseenter', function () { clearTimeout(closeTimer); });
    menu.addEventListener('mouseleave', hoverClose);
  }

  function initThemeToggle() {
    var root = document.documentElement;
    function sync() {
      var theme = root.getAttribute('data-theme') || 'light';
      document.querySelectorAll('[data-theme-set]').forEach(function (btn) {
        btn.setAttribute('aria-pressed', String(btn.getAttribute('data-theme-set') === theme));
      });
    }
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-theme-set]');
      if (!btn) return;
      var theme = btn.getAttribute('data-theme-set');
      root.setAttribute('data-theme', theme);
      try { localStorage.setItem('rv-theme', theme); } catch (err) {}
      sync();
    });
    sync();
  }

  function renderTabbar() {
    var mount = document.querySelector('[data-app-tabbar]');
    if (!mount) return;
    var page = document.body.getAttribute('data-page');
    var tabs = [
      { href: 'helbred.html', label: 'Helbred', active: HEALTH_PAGES.indexOf(page) > -1, icon: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>' },
      { href: 'handlingsplan.html', label: 'Plan', active: page === 'handlingsplan', icon: '<path d="M6 2h8l6 6v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="M14 2v6h6M8 15l2.5 2.5L16 12"/>' },
      { href: 'historik.html', label: 'Historik', active: page === 'historik', icon: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>' },
      { href: 'bestil.html', label: 'Bestil', active: page === 'bestil', icon: '<path d="M12 5v14M5 12h14"/>' },
      { href: 'profil.html', label: 'Profil', active: page === 'profil', icon: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>' }
    ];
    mount.className = 'app-tabbar';
    mount.setAttribute('aria-label', 'Bundnavigation');
    mount.innerHTML = tabs.map(function (t) {
      return '<a class="app-tab" href="' + t.href + '"' + (t.active ? ' aria-current="page"' : '') + '>' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + t.icon + '</svg>' +
        t.label + '</a>';
    }).join('');
  }

  // Generic popover dropdown (test switcher etc.)
  function initDropdown(trigger, panel, onOpen) {
    function setOpen(open) {
      panel.hidden = !open;
      trigger.setAttribute('aria-expanded', String(open));
      if (open && onOpen) onOpen();
    }
    trigger.addEventListener('click', function () { setOpen(panel.hidden); });
    document.addEventListener('click', function (e) {
      if (!panel.hidden && !panel.contains(e.target) && !trigger.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) { setOpen(false); trigger.focus(); }
    });
    return setOpen;
  }

  /* ========================= Page: Dit helbred =========================== */

  var FILTERS = ['out', 'in', 'improving', 'andet'];

  function initHelbred() {
    var state = {
      test: LATEST,
      filter: FILTERS.indexOf(param('filter')) > -1 ? param('filter') : null,
      query: ''
    };

    var el = {
      eyebrow: document.querySelector('[data-test-eyebrow]'),
      switcher: document.querySelector('[data-test-switcher]'),
      switcherLabel: document.querySelector('[data-test-switcher-label]'),
      testMenu: document.querySelector('[data-test-menu]'),
      stats: document.querySelector('[data-stats]'),
      count: document.querySelector('[data-list-count]'),
      chips: document.querySelector('[data-chips]'),
      list: document.querySelector('[data-marker-list]'),
      search: document.querySelector('[data-search]'),
      searchInput: document.querySelector('[data-search-input]'),
      searchOpen: document.querySelector('[data-search-open]'),
      searchClear: document.querySelector('[data-search-clear]'),
      notes: document.querySelector('[data-notes-card]'),
      plan: document.querySelector('[data-plan]'),
      bioAge: document.querySelector('[data-bio-age]'),
      nextTest: document.querySelector('[data-next-test]')
    };

    function matches(m) {
      var t = state.test;
      if (!hasValue(m, t)) return false;
      if (state.query && m.name.toLowerCase().indexOf(state.query.toLowerCase()) === -1) return false;
      if (state.filter === 'out') return isOut(m, t);
      if (state.filter === 'in') return statusAt(m, t) === 'in';
      if (state.filter === 'improving') return isImproving(m, t);
      if (state.filter === 'andet') return false;
      return true;
    }

    function setFilter(f) {
      state.filter = state.filter === f ? null : f;
      var url = new URL(location.href);
      if (state.filter) url.searchParams.set('filter', state.filter); else url.searchParams.delete('filter');
      history.replaceState(null, '', url);
      render();
    }

    /* ---- Static-ish sections -------------------------------------------- */

    function renderHead() {
      var test = D.tests[state.test];
      el.eyebrow.textContent = test.package + ' · Prøve taget ' + dateLong(test.date);
      el.switcherLabel.textContent = 'Test ' + (state.test + 1) + ' af ' + D.tests.length + ' · ' + dateShort(test.date);
      el.testMenu.innerHTML = D.tests.slice().reverse().map(function (tst) {
        var i = D.tests.indexOf(tst);
        var on = i === state.test;
        return '<button type="button" class="test-menu__item" role="menuitemradio" aria-checked="' + on + '" data-test-index="' + i + '">' +
          '<span>Test ' + (i + 1) + ' af ' + D.tests.length + ' · ' + dateShort(tst.date) + '</span>' + (on ? ICON.check : '') +
        '</button>';
      }).join('');

      var bio = test.bioAge, diff = D.user.age - bio;
      el.bioAge.innerHTML =
        '<div class="bioage-card__copy">' +
          '<p class="bioage-card__eyebrow">Biologisk alder</p>' +
          '<p class="bioage-card__sub">' + fmt(Math.abs(diff), 1) + ' år ' + (diff >= 0 ? 'yngre' : 'ældre') + ' end din alder på ' + D.user.age + '</p>' +
        '</div>' +
        '<p class="bioage-card__value"><span>' + fmt(bio, 1) + '</span> år</p>';
    }

    function renderStats() {
      var c = counts(state.test);
      var stats = [
        { key: 'in', num: c.in, label: 'I området', mark: '<span class="dot dot--in"></span>' },
        { key: 'out', num: c.out, label: 'Uden for området', mark: '<span class="dot dot--out"></span>' },
        { key: 'improving', num: c.improving, label: 'Forbedres siden sidst', mark: '<span class="stat__arrow">' + ICON.arrowUp + '</span>' }
      ];
      el.stats.innerHTML = stats.map(function (s) {
        var on = state.filter === s.key;
        return '<button type="button" class="stat stat--' + s.key + (on ? ' is-active' : '') + '" aria-pressed="' + on + '" data-filter="' + s.key + '">' +
          '<span class="stat__num">' + s.num + '</span>' +
          '<span class="stat__label">' + s.mark + s.label + '</span>' +
        '</button>';
      }).join('');
    }

    function renderChips() {
      var c = counts(state.test);
      var chips = [
        { key: null, label: 'Alle · ' + c.total },
        { key: 'out', label: 'Uden for området · ' + c.out, dot: 'out' },
        { key: 'in', label: 'I området · ' + c.in, dot: 'in' }
      ];
      if (state.filter === 'improving') chips.push({ key: 'improving', label: 'Forbedres · ' + c.improving, dot: 'improving' });
      chips.push({ key: 'andet', label: 'Andet · ' + D.other.items.length, dot: 'none' });
      el.chips.innerHTML = chips.map(function (ch) {
        var on = ch.key === state.filter && !(ch.key === null && state.query);
        var removable = on && ch.key !== null;
        return '<button type="button" class="filter-chip' + (on ? ' is-active' : '') + '" aria-pressed="' + on + '" data-filter="' + (ch.key || '') + '"' +
          (removable ? ' aria-label="' + ch.label + ', fjern filter"' : '') + '>' +
          (ch.dot ? '<span class="dot dot--' + ch.dot + '"></span>' : '') +
          '<span>' + ch.label + '</span>' + (removable ? ICON.close : '') +
        '</button>';
      }).join('');
    }

    /* ---- Marker list ------------------------------------------------------ */

    function markerRow(m) {
      var t = state.test, st = statusAt(m, t), out = st !== 'in';
      return '<a class="biomarker-row" href="markoer.html?id=' + m.id + '" data-marker="' + m.id + '">' +
        '<span class="biomarker-row__bar is-' + (out ? 'out' : 'in') + '"></span>' +
        '<span class="biomarker-row__body">' +
          '<span class="biomarker-row__name">' + esc(m.name) + '</span>' +
          '<span class="biomarker-row__meta">' +
            '<span class="biomarker-row__status is-' + (out ? 'out' : 'in') + '">' + STATUS_LABEL[st] + '</span>' +
            '<span class="biomarker-row__sep" aria-hidden="true">·</span>' +
            '<span class="biomarker-row__value">' + fmt(valueAt(m, t), m.decimals) + '</span>' +
            (m.unit ? '<span class="biomarker-row__unit">' + esc(m.unit) + '</span>' : '') +
          '</span>' +
        '</span>' +
        '<span class="biomarker-row__spark">' + sparkline(m, t) + '</span>' +
      '</a>';
    }

    function railMeta(all, matching, t) {
      if (matching.length === all.length) {
        var out = all.filter(function (m) { return isOut(m, t); }).length;
        return out
          ? '<span>' + all.length + ' biomarkører ·</span><span class="is-out">' + out + ' uden for</span>'
          : '<span>' + all.length + ' biomarkører · alle i området</span>';
      }
      return '<span>' + matching.length + ' af ' + all.length + ' biomarkører</span>';
    }

    function summaryNames(list) {
      var names = [], text = '';
      for (var i = 0; i < list.length; i++) {
        var next = names.concat(list[i].name).join(', ');
        if (next.length > 40 && names.length) break;
        names.push(list[i].name); text = next;
      }
      return text + (names.length < list.length ? ' …' : '');
    }

    function renderList() {
      var t = state.test, html = '', total = 0;
      var filtering = !!(state.filter || state.query);

      D.categories.forEach(function (cat) {
        var all = markersIn(cat.id, t);
        var matching = all.filter(matches);
        total += matching.length;
        if (filtering && !matching.length) return;

        var featured = cat.featured.length && !state.query;
        if (!featured && !state.query) {
          // Collapsed row
          var inCount = all.filter(function (m) { return !isOut(m, t); }).length;
          var anyOut = inCount < all.length;
          html += '<a class="cat-collapsed" href="kategori.html?id=' + cat.id + '">' +
            '<span class="cat-collapsed__name">' + esc(cat.name) + '</span>' +
            '<span class="cat-collapsed__summary">' + all.length + ' biomarkører · ' + esc(summaryNames(all)) + '</span>' +
            '<span class="cat-collapsed__status' + (anyOut ? ' is-out' : '') + '">' +
              '<span class="dot dot--7 dot--' + (anyOut ? 'out' : 'in') + '"></span>' +
              '<span>' + inCount + ' af ' + all.length + '</span>' +
              '<span class="visually-hidden">i området</span>' + ICON.chevronRight +
            '</span>' +
          '</a>';
          return;
        }

        var rows = state.query ? matching : cat.featured.map(function (id) { return markersById[id]; }).filter(function (m) { return matching.indexOf(m) > -1; });
        var more = state.query ? [] : matching.filter(function (m) { return cat.featured.indexOf(m.id) === -1; });

        html += '<section class="cat-group" aria-labelledby="cat-' + cat.id + '">' +
          '<div class="cat-rail">' +
            '<h3 class="cat-rail__title" id="cat-' + cat.id + '">' + (cat.icon ? ICON[cat.icon] : '') + '<span>' + esc(cat.name) + '</span></h3>' +
            '<p class="cat-rail__meta">' + railMeta(all, matching, t) + '</p>' +
            '<a class="cat-rail__link" href="kategori.html?id=' + cat.id + '">Se kategori' + ICON.chevronRight + '</a>' +
          '</div>' +
          '<div class="cat-group__rows">' +
            rows.map(markerRow).join('') +
            (more.length ? '<a class="biomarker-more" href="kategori.html?id=' + cat.id + '">+ ' + more.length + ' flere · ' + more.map(function (m) { return esc(m.name); }).join(', ') + '</a>' : '') +
          '</div>' +
        '</section>';
      });

      var other = D.other.items.filter(function (o) {
        return !state.query || o.name.toLowerCase().indexOf(state.query.toLowerCase()) > -1;
      });
      var showOther = (state.filter === 'andet' || !state.filter) && other.length;
      if (showOther) {
        html += '<section class="cat-group cat-group--other" aria-labelledby="cat-andet">' +
          '<div class="cat-rail cat-rail--plain">' +
            '<h3 class="cat-rail__title" id="cat-andet"><span>Andet</span></h3>' +
            '<p class="cat-rail__meta cat-rail__meta--wrap">' + esc(D.other.summary) + '</p>' +
          '</div>' +
          '<div class="cat-group__rows">' + other.map(function (o) {
            return '<div class="biomarker-row biomarker-row--static">' +
              '<span class="biomarker-row__bar is-none"></span>' +
              '<span class="biomarker-row__body">' +
                '<span class="biomarker-row__name">' + esc(o.name) + '</span>' +
                '<span class="biomarker-row__plain">' + esc(o.value) + '</span>' +
              '</span>' +
            '</div>';
          }).join('') + '</div>' +
        '</section>';
      }

      if (!html) {
        html = '<p class="list-empty">Ingen biomarkører matcher “' + esc(state.query) + '”.</p>';
      }

      el.count.textContent = state.filter === 'andet'
        ? other.length + ' resultater'
        : total + ' biomarkører';
      el.list.innerHTML = html;
    }

    function render() {
      hidePreview();
      renderHead();
      renderStats();
      renderChips();
      renderList();
    }

    /* ---- Right column (rendered once; notes are for the latest test) ---- */

    var n = D.notes.overall;
    el.notes.querySelector('[data-notes-date]').textContent = n.date;
    el.notes.querySelector('[data-notes-excerpt]').textContent = n.excerpt;
    el.notes.querySelector('[data-notes-by]').textContent = n.reviewedBy;
    el.plan.querySelector('[data-plan-diet]').textContent = D.plan.diet.summary;
    el.plan.querySelector('[data-plan-supplements]').textContent = D.plan.supplements.summary;
    el.nextTest.querySelector('[data-next-eyebrow]').textContent = D.nextTest.eyebrow;
    el.nextTest.querySelector('[data-next-text]').textContent = D.nextTest.text;

    /* ---- Events ----------------------------------------------------------- */

    el.stats.addEventListener('click', function (e) {
      var b = e.target.closest('[data-filter]');
      if (b) setFilter(b.getAttribute('data-filter'));
    });
    el.chips.addEventListener('click', function (e) {
      var b = e.target.closest('[data-filter]');
      if (!b) return;
      var f = b.getAttribute('data-filter') || null;
      if (f === null) { state.filter = null; setFilter(null); return; }
      setFilter(f);
    });

    // Search
    function openSearch() {
      el.search.classList.add('is-open');
      el.searchOpen.setAttribute('aria-expanded', 'true');
      el.searchInput.focus();
    }
    function closeSearch() {
      el.search.classList.remove('is-open');
      el.searchOpen.setAttribute('aria-expanded', 'false');
      el.searchInput.value = '';
      if (state.query) { state.query = ''; render(); }
    }
    el.searchOpen.addEventListener('click', openSearch);
    el.searchClear.addEventListener('click', function () { closeSearch(); el.searchOpen.focus(); });
    el.searchInput.addEventListener('input', function () { state.query = el.searchInput.value.trim(); renderChips(); renderList(); });
    el.searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); closeSearch(); el.searchOpen.focus(); }
    });
    el.searchInput.addEventListener('blur', function () { if (!el.searchInput.value) el.search.classList.remove('is-open'); });

    // Test switcher
    var setMenuOpen = initDropdown(el.switcher, el.testMenu, function () {
      var cur = el.testMenu.querySelector('[aria-checked="true"]');
      if (cur) cur.focus();
    });
    el.testMenu.addEventListener('click', function (e) {
      var b = e.target.closest('[data-test-index]');
      if (!b) return;
      state.test = +b.getAttribute('data-test-index');
      setMenuOpen(false);
      el.switcher.focus();
      render();
    });
    el.testMenu.addEventListener('keydown', function (e) {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      e.preventDefault();
      var items = Array.prototype.slice.call(el.testMenu.querySelectorAll('[data-test-index]'));
      var i = items.indexOf(document.activeElement);
      items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length].focus();
    });

    // Print
    document.querySelector('[data-print]').addEventListener('click', function () { window.print(); });

    /* ---- Hover preview (desktop only) ------------------------------------- */

    var preview = document.createElement('div');
    preview.className = 'marker-preview';
    preview.setAttribute('aria-hidden', 'true');
    var hoverRow = null, hoverTimer = null;

    function previewHTML(m) {
      var t = state.test, first = null, firstIdx = -1;
      for (var i = 0; i <= t; i++) { if (valueAt(m, i) !== null) { first = valueAt(m, i); firstIdx = i; break; } }
      var cur = valueAt(m, t), delta = '';
      if (firstIdx > -1 && firstIdx < t) {
        var diff = cur - first;
        var good = m.better ? (m.better === 'lower' ? diff < 0 : diff > 0) : null;
        delta = '<p class="marker-preview__delta' + (good === true ? ' is-good' : good === false ? ' is-bad' : '') + '">' +
          (diff === 0 ? 'Uændret' : (diff < 0 ? '↓ ' : '↑ ') + fmt(Math.abs(diff), m.decimals) + ' ' + esc(m.unit)) +
          ' siden ' + monthYear(D.tests[firstIdx].date) + '</p>';
      }
      var axis = '';
      for (var k = 0; k <= t; k++) axis += '<span' + (k === t ? ' class="is-current"' : '') + '>' + dateAxis(D.tests[k].date) + '</span>';
      return '' +
        '<div class="marker-preview__info">' +
          '<p class="marker-preview__name">' + esc(m.name) + ICON.chevronRight + '</p>' +
          '<p class="marker-preview__desc">' + esc(m.description) + '</p>' + delta +
        '</div>' +
        '<div class="marker-preview__bands">' + bandsOf(m).map(function (b) {
          return '<div class="range-band"><span class="range-band__bar is-' + b.status + '"></span>' +
            '<span><span class="range-band__label">' + b.label + '</span><span class="range-band__range">' + esc(b.text) + '</span></span></div>';
        }).join('') + '</div>' +
        '<div class="marker-preview__chart">' + miniChart(m, t) + '<div class="marker-preview__axis">' + axis + '</div></div>';
    }

    function showPreview(row) {
      var m = markersById[row.getAttribute('data-marker')];
      var group = row.closest('.cat-group');
      if (!m || !group) return;
      preview.innerHTML = previewHTML(m);
      group.appendChild(preview);
      var rows = row.parentElement;
      preview.style.left = (rows.offsetLeft - 40) + 'px';
      var top = row.offsetTop + row.offsetHeight + 7;
      preview.style.top = top + 'px';
      // Flip above the row if it would run off the bottom of the viewport
      var rect = preview.getBoundingClientRect();
      if (rect.bottom > window.innerHeight - 16) preview.style.top = (row.offsetTop - preview.offsetHeight - 7) + 'px';
      requestAnimationFrame(function () { preview.classList.add('is-visible'); });
    }
    function hidePreview() {
      clearTimeout(hoverTimer);
      hoverRow = null;
      preview.classList.remove('is-visible');
      if (preview.parentNode) preview.parentNode.removeChild(preview);
    }
    var desktop = window.matchMedia('(min-width: 900px)');
    el.list.addEventListener('mouseover', function (e) {
      if (!canHover.matches || !desktop.matches) return;
      var row = e.target.closest('.biomarker-row[data-marker]');
      if (!row || row === hoverRow) return;
      hidePreview();
      hoverRow = row;
      hoverTimer = setTimeout(function () { showPreview(row); }, 150);
    });
    el.list.addEventListener('mouseout', function (e) {
      var row = e.target.closest('.biomarker-row[data-marker]');
      if (row && !row.contains(e.relatedTarget)) hidePreview();
    });

    render();
  }

  /* ================================ Boot ================================= */

  renderHeader();
  renderTabbar();
  initMegaMenu();
  initThemeToggle();
  document.documentElement.classList.remove('no-js');
  document.body.classList.remove('no-js');

  var page = document.body.getAttribute('data-page');
  if (page === 'helbred') initHelbred();

  // Exposed for the other page scripts added later (kategori, markør, …)
  window.RV = {
    data: D, fmt: fmt, esc: esc, dateLong: dateLong, dateShort: dateShort, dateAxis: dateAxis, monthYear: monthYear,
    statusAt: statusAt, isOut: isOut, isImproving: isImproving, valueAt: valueAt, bandsOf: bandsOf,
    markersIn: markersIn, counts: counts, sparkline: sparkline, miniChart: miniChart, icon: ICON,
    markersById: markersById, categoriesById: categoriesById, STATUS_LABEL: STATUS_LABEL
  };
})();
