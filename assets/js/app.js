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
    var lo = m.range.low, hi = m.range.high, d = m.rangeDecimals !== undefined ? m.rangeDecimals : m.decimals;
    if (lo !== undefined && hi !== undefined) {
      var span = hi - lo;
      return [
        { status: 'over', label: 'Over', text: '> ' + fmt(hi, d), min: hi, max: hi + span * 0.75 },
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
    steth: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3v6a5 5 0 0 0 10 0V3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M11 14v2.5a4.5 4.5 0 0 0 9 0V14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="20" cy="12" r="2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
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
      test: (function () { var t = parseInt(param('test'), 10); return t >= 0 && t < D.tests.length ? t : LATEST; })(),
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
            rows.map(function (m) { return markerRowHTML(m, state.test); }).join('') +
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

  /* ======================= Shared page building blocks ===================== */

  var MORE_ICONS = {
    chevronLeft: '<svg class="icon-14" viewBox="0 0 12 12" aria-hidden="true"><path d="M7.5 3L4.5 6L7.5 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    chevronRight14: '<svg class="icon-14" viewBox="0 0 12 12" aria-hidden="true"><path d="M4.5 3L7.5 6L4.5 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    info: '<svg class="icon-18" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M10 9v4.5M10 6.5v.01" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    download: '<svg class="icon-14" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 2v8M8 10L5 7M8 10l3-3M3 13h10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    doc: '<svg class="icon-14" viewBox="0 0 16 16" aria-hidden="true"><rect x="3" y="2" width="10" height="12" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 6h5M5.5 9h5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    book: '<svg class="icon-14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3h4.5A1.5 1.5 0 0 1 9 4.5V13a1.5 1.5 0 0 0-1.5-1.5H3V3ZM13 3H10.5A1.5 1.5 0 0 0 9 4.5V13a1.5 1.5 0 0 1 1.5-1.5H13V3Z" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
    check: '<svg class="icon-14" viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5L6.5 12L13 4.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    ban: '<svg class="icon-14" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M4.2 11.8L11.8 4.2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
    calendar: '<svg class="icon-16" viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="4" width="14" height="13" rx="2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M3 8h14M7 2v4M13 2v4" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    pin: '<svg class="icon-16" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 18s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="10" cy="8" r="2" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
    logout: '<svg class="icon-15" viewBox="0 0 16 16" aria-hidden="true"><path d="M6 2.5H3.5v11H6M10.5 5l3 3-3 3M13.5 8H6.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    bowl: '<svg class="icon-16" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h14a7 7 0 0 1-14 0Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 7c0-1.5 1-2 1-3.5M11.5 7c0-1.5 1-2 1-3.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
    capsule: '<svg class="icon-16" viewBox="0 0 20 20" aria-hidden="true"><rect x="3" y="7" width="14" height="6" rx="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M10 7v6" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'
  };

  var WEEKDAYS = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];
  function weekday(iso) { var d = parseDate(iso); return WEEKDAYS[new Date(Date.UTC(d.y, d.m, d.d)).getUTCDay()]; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function kr(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' kr.'; }
  function shortName(m) { return m.shortName || m.name; }

  function markerRowHTML(m, t, opts) {
    var st = statusAt(m, t), out = st !== 'in';
    var tag = opts && opts.improvingTag && isImproving(m, t)
      ? '<span class="tag tag--teal tag--sm">' + ICON.arrowUp + 'Forbedres</span>' : '';
    return '<a class="biomarker-row" href="markoer.html?id=' + m.id + '" data-marker="' + m.id + '">' +
      '<span class="biomarker-row__bar is-' + (out ? 'out' : 'in') + '"></span>' +
      '<span class="biomarker-row__body">' +
        '<span class="biomarker-row__name">' + esc(m.name) + '</span>' +
        '<span class="biomarker-row__meta">' +
          '<span class="biomarker-row__status is-' + (out ? 'out' : 'in') + '">' + STATUS_LABEL[st] + '</span>' +
          '<span class="biomarker-row__sep" aria-hidden="true">·</span>' +
          '<span class="biomarker-row__value">' + fmt(valueAt(m, t), m.decimals) + '</span>' +
          (m.unit ? '<span class="biomarker-row__unit">' + esc(m.unit) + '</span>' : '') +
          tag +
        '</span>' +
      '</span>' +
      '<span class="biomarker-row__spark">' + sparkline(m, t) + '</span>' +
    '</a>';
  }

  // "2 – 10", "< 0,90", "> 60"
  function rangeText(m, sep) {
    var d = m.rangeDecimals !== undefined ? m.rangeDecimals : m.decimals;
    var lo = m.range.low, hi = m.range.high;
    if (lo !== undefined && hi !== undefined) return fmt(lo, d) + (sep || ' – ') + fmt(hi, d);
    return hi !== undefined ? '< ' + fmt(hi, d) : '> ' + fmt(lo, d);
  }

  function breadcrumbHTML(items) {
    return '<nav class="breadcrumb" aria-label="Brødkrumme"><ol>' + items.map(function (it, i) {
      var last = i === items.length - 1;
      return '<li>' + (last
        ? '<span aria-current="page">' + esc(it.label) + '</span>'
        : '<a href="' + it.href + '">' + esc(it.label) + '</a><span class="breadcrumb__sep" aria-hidden="true">/</span>') + '</li>';
    }).join('') + '</ol></nav>';
  }
  function pagerHTML(prev, label, next) {
    return '<div class="pager">' +
      '<a class="pager__btn" href="' + prev.href + '" aria-label="' + esc(prev.label) + '">' + MORE_ICONS.chevronLeft + '</a>' +
      '<span class="pager__label">' + esc(label) + '</span>' +
      '<a class="pager__btn" href="' + next.href + '" aria-label="' + esc(next.label) + '">' + MORE_ICONS.chevronRight14 + '</a>' +
    '</div>';
  }
  function targetTag(id) {
    var m = markersById[id];
    return '<a class="tag tag--amber" href="markoer.html?id=' + id + '"><span class="dot dot--6 dot--out"></span>' + esc(shortName(m)) + '</a>';
  }
  function demoAlert(msg) { window.alert(msg + '\n\n(Dette er en statisk mockup.)'); }

  // Scroll spy: marks the link whose section top has passed `offset`.
  function scrollSpy(links, offsetFn, onChange) {
    var sections = links.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    var ticking = false, current = null;
    function update() {
      ticking = false;
      var off = offsetFn(), idx = 0;
      sections.forEach(function (sec, i) { if (sec && sec.getBoundingClientRect().top - off <= 0) idx = i; });
      // At the very bottom, the last section wins
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) idx = sections.length - 1;
      if (idx === current) return;
      current = idx;
      links.forEach(function (a, i) {
        a.classList.toggle('is-active', i === idx);
        if (i === idx) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
      });
      if (onChange) onChange(idx);
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // Modal side panel: scrim, Esc, focus trap, focus return.
  function initPanel(panel, scrim, openers) {
    var lastFocus = null;
    function focusables() {
      return Array.prototype.filter.call(panel.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'),
        function (el) { return el.offsetParent !== null; });
    }
    function open(e) {
      if (e) e.preventDefault();
      lastFocus = document.activeElement;
      panel.hidden = false; scrim.hidden = false;
      requestAnimationFrame(function () { panel.classList.add('is-open'); scrim.classList.add('is-open'); });
      document.documentElement.classList.add('has-panel-open');
      var f = focusables(); if (f.length) f[0].focus();
    }
    function close() {
      panel.classList.remove('is-open'); scrim.classList.remove('is-open');
      document.documentElement.classList.remove('has-panel-open');
      setTimeout(function () { panel.hidden = true; scrim.hidden = true; }, reduceMotion.matches ? 0 : 320);
      if (lastFocus) lastFocus.focus();
    }
    openers.forEach(function (b) { b.addEventListener('click', open); });
    scrim.addEventListener('click', close);
    panel.querySelectorAll('[data-panel-close]').forEach(function (b) { b.addEventListener('click', close); });
    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); close(); return; }
      if (e.key !== 'Tab') return;
      var f = focusables(); if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  }

  /* ============================ Page: Kategori ============================ */

  function initKategori() {
    var cat = categoriesById[param('id')] || categoriesById.vitaminer;
    var t = LATEST, ci = D.categories.indexOf(cat), n = D.categories.length;
    var all = markersIn(cat.id, t);
    var outM = all.filter(function (m) { return isOut(m, t); });
    var impN = all.filter(function (m) { return isImproving(m, t); }).length;
    var inN = all.length - outM.length;
    var content = D.categoryContent[cat.id] || {};
    var note = D.notes.categories[cat.id] || { paragraphs: [] };
    var noteDate = D.notes.overall.date;
    var filter = null;
    document.title = cat.name + ' — Revigora';

    var prev = D.categories[(ci - 1 + n) % n], next = D.categories[(ci + 1) % n];
    document.querySelector('[data-crumbs]').innerHTML =
      breadcrumbHTML([{ href: 'helbred.html', label: 'Dit helbred' }, { label: cat.name }]) +
      pagerHTML({ href: 'kategori.html?id=' + prev.id, label: 'Forrige kategori: ' + prev.name },
        (ci + 1) + ' af ' + n + ' kategorier',
        { href: 'kategori.html?id=' + next.id, label: 'Næste kategori: ' + next.name });

    // Hero
    var orbitDots = [[150, 260], [352, 230], [120, 150], [330, 320]];
    var hero = document.querySelector('[data-cat-hero]');
    hero.querySelector('[data-hero-eyebrow]').textContent = 'Kategori · ' + all.length + ' biomarkører';
    hero.querySelector('[data-hero-title]').textContent = cat.name;
    hero.querySelector('[data-hero-tagline]').textContent = content.tagline || '';
    hero.querySelector('[data-hero-orbit]').innerHTML =
      '<circle cx="230" cy="190" r="70" class="orbit-ring" style="--o:.35"/>' +
      '<circle cx="230" cy="190" r="120" class="orbit-ring" style="--o:.22"/>' +
      '<circle cx="230" cy="190" r="170" class="orbit-ring" style="--o:.14"/>' +
      '<circle cx="230" cy="190" r="220" class="orbit-ring" style="--o:.08"/>' +
      '<circle cx="300" cy="140" r="6" class="orbit-dot is-in"/>' +
      outM.slice(0, orbitDots.length).map(function (m, i) {
        return '<circle cx="' + orbitDots[i][0] + '" cy="' + orbitDots[i][1] + '" r="4" class="orbit-dot is-out"/>';
      }).join('');

    // Distribution histogram (bar height ∝ count, largest = full height)
    var bars = [
      { n: inN, label: 'I området', kind: 'in' },
      { n: outM.length, label: 'Uden for området', kind: 'out' },
      { n: impN, label: 'Forbedres', kind: 'improving' }
    ];
    var maxN = Math.max.apply(null, bars.map(function (b) { return b.n; })) || 1;
    document.querySelector('[data-dist-eyebrow]').textContent = 'Fordeling · ' + all.length + ' biomarkører';
    document.querySelector('[data-histogram]').innerHTML = bars.map(function (b) {
      return '<div class="histogram__col histogram__col--' + b.kind + '">' +
        '<span class="histogram__num">' + b.n + '</span>' +
        '<span class="histogram__label">' + b.label + '</span>' +
        '<span class="histogram__bar" style="--h:' + (b.n / maxN) + '"></span>' +
      '</div>';
    }).join('');

    // Notes card + panel
    document.querySelector('[data-cat-notes-eyebrow]').textContent = cat.name;
    document.querySelector('[data-cat-notes-date]').textContent = noteDate;
    document.querySelector('[data-cat-notes-excerpt]').textContent = note.excerpt || note.paragraphs.join(' ');
    var panel = document.querySelector('[data-notes-panel]');
    panel.querySelector('[data-panel-eyebrow]').textContent = cat.name;
    panel.querySelector('[data-panel-meta]').textContent = noteDate + ' · Revigoras lægeteam';
    panel.querySelector('[data-panel-body]').innerHTML =
      note.paragraphs.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
      (outM.length ? '<div class="link-cards">' + outM.map(function (m) {
        return '<a class="link-card" href="markoer.html?id=' + m.id + '">' +
          '<span class="link-card__name"><span class="dot dot--out"></span>' + esc(shortName(m)) + '</span>' +
          '<span class="link-card__value">' + fmt(valueAt(m, t), m.decimals) + ' ' + esc(m.unit) + ' →</span></a>';
      }).join('') + '</div>' : '');
    initPanel(panel, document.querySelector('[data-panel-scrim]'), Array.prototype.slice.call(document.querySelectorAll('[data-open-notes]')));

    // Marker list
    var listEl = document.querySelector('[data-cat-rows]');
    var chipsEl = document.querySelector('[data-cat-chips]');
    function renderList() {
      var rows = all.filter(function (m) {
        return !filter || (filter === 'out' ? isOut(m, t) : !isOut(m, t));
      });
      // Out-of-range first, then the rest in data order (as in Paper 06)
      rows.sort(function (a, b) { return (isOut(b, t) ? 1 : 0) - (isOut(a, t) ? 1 : 0); });
      document.querySelector('[data-cat-count]').textContent = rows.length + ' biomarkører';
      var chips = [
        { key: null, label: 'Alle · ' + all.length },
        { key: 'out', label: 'Uden for området · ' + outM.length, dot: 'out' },
        { key: 'in', label: 'I området · ' + inN, dot: 'in' }
      ];
      chipsEl.innerHTML = chips.map(function (c) {
        var on = c.key === filter;
        return '<button type="button" class="filter-chip' + (on ? ' is-active' : '') + '" aria-pressed="' + on + '" data-filter="' + (c.key || '') + '">' +
          (c.dot ? '<span class="dot dot--' + c.dot + '"></span>' : '') + '<span>' + c.label + '</span></button>';
      }).join('');
      listEl.innerHTML = rows.map(function (m) { return markerRowHTML(m, t, { improvingTag: true }); }).join('');
    }
    chipsEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-filter]'); if (!b) return;
      var f = b.getAttribute('data-filter') || null;
      filter = filter === f ? null : f;
      renderList();
    });
    renderList();

    // About
    var sections = [{ id: 'hvorfor', title: 'Hvorfor det betyder noget' }].concat(content.sections || []);
    document.querySelector('[data-about-title]').textContent = content.aboutTitle || 'Om ' + cat.name.toLowerCase();
    document.querySelector('[data-about-nav]').innerHTML = sections.map(function (s) {
      return '<a href="#' + s.id + '">' + esc(s.title) + '</a>';
    }).join('');
    document.querySelector('[data-about-body]').innerHTML =
      '<div id="hvorfor" class="about-body__block">' +
        '<p class="about-body__lead">' + esc(content.intro || '') + '</p>' +
        (content.why || []).map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
      '</div>' +
      (content.sections || []).map(function (s) {
        return '<div id="' + s.id + '" class="about-body__block"><h3>' + esc(s.title) + '</h3>' +
          s.paragraphs.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>';
      }).join('') +
      '<div class="disclaimer">' + MORE_ICONS.info + '<p>Indholdet er generel information og erstatter ikke en konsultation med din egen læge.</p></div>';

    // Sticky category bar (screen 13)
    var bar = document.querySelector('[data-cat-sticky]');
    bar.querySelector('[data-sticky-title]').textContent = cat.name;
    bar.querySelector('[data-sticky-split]').innerHTML =
      '<span class="cat-sticky__n is-in">' + inN + '</span>' +
      '<span class="cat-sticky__bars"><span class="is-in" style="--w:' + inN + '"></span>' + (outM.length ? '<span class="is-out" style="--w:' + outM.length + '"></span>' : '') + '</span>' +
      (outM.length ? '<span class="cat-sticky__n is-out">' + outM.length + '</span>' : '') +
      '<span class="visually-hidden">' + inN + ' i området, ' + outM.length + ' uden for området</span>';
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        var show = !entries[0].isIntersecting && entries[0].boundingClientRect.top < 0;
        bar.classList.toggle('is-visible', show);
        bar.setAttribute('aria-hidden', String(!show));
        bar.querySelectorAll('a').forEach(function (a) { a.tabIndex = show ? 0 : -1; });
      }, { rootMargin: '-' + 72 + 'px 0px 0px 0px' }).observe(hero);
    }
    var headerOffset = function () { return 72 + 100; };
    scrollSpy(Array.prototype.slice.call(bar.querySelectorAll('.cat-sticky__links a')), headerOffset);
    scrollSpy(Array.prototype.slice.call(document.querySelectorAll('[data-about-nav] a')), headerOffset);
  }

  /* ============================= Page: Markør ============================= */

  var BAND_LABEL = { over: 'Over området', border: 'Grænse', in: 'I området', under: 'Under området' };

  function markerChart(m) {
    var bands = bandsOf(m), BH = 100, H = BH * bands.length, W = 966, n = D.tests.length;
    var xs = [], step = n > 1 ? 630 / (n - 1) : 0;
    for (var i = 0; i < n; i++) xs.push(100 + i * step);
    var xNext = 880;
    function yOf(v) {
      var idx = bands.length - 1;
      for (var k = 0; k < bands.length; k++) { if (v >= bands[k].min) { idx = k; break; } }
      var b = bands[idx], f = Math.max(0, Math.min(1, (v - b.min) / (b.max - b.min)));
      return Math.max(14, Math.min(H - 14, idx * BH + (1 - f) * BH));
    }
    var r = function (x) { return Math.round(x * 10) / 10; };
    var svg = '<svg class="mchart__svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Udvikling for ' + esc(m.name) + '">';
    bands.forEach(function (b, k) { if (b.status === 'in') svg += '<rect class="mchart__zone" x="0" y="' + k * BH + '" width="' + W + '" height="' + BH + '"/>'; });
    for (var k = 1; k <= bands.length; k++) {
      var y = k === bands.length ? H - 1 : k * BH;
      svg += '<line class="mchart__hline" x1="0" x2="' + W + '" y1="' + y + '" y2="' + y + '"/>';
    }
    xs.forEach(function (x) { svg += '<line class="mchart__vline" x1="' + x + '" x2="' + x + '" y1="0" y2="' + H + '"/>'; });
    svg += '<line class="mchart__vline is-next" x1="' + xNext + '" x2="' + xNext + '" y1="0" y2="' + H + '"/>';
    var pts = [];
    m.history.forEach(function (v, k) { if (v !== null) pts.push({ x: xs[k], y: yOf(v), v: v, k: k }); });
    svg += '<polyline class="mchart__line" points="' + pts.map(function (p) { return r(p.x) + ',' + r(p.y); }).join(' ') + '"/>';
    var last = pts[pts.length - 1];
    svg += '<line class="mchart__next-line" x1="' + r(last.x) + '" x2="' + xNext + '" y1="' + r(last.y) + '" y2="' + r(last.y) + '"/>';
    pts.forEach(function (p, i) {
      var out = isOut(m, p.k), isLast = i === pts.length - 1;
      svg += isLast
        ? '<circle class="mchart__dot is-' + (out ? 'out' : 'in') + '" cx="' + r(p.x) + '" cy="' + r(p.y) + '" r="8"/>'
        : '<circle class="mchart__past is-' + (out ? 'out' : 'in') + '" cx="' + r(p.x) + '" cy="' + r(p.y) + '" r="5"/>';
      var below = !out && !isLast, ly = below ? p.y + 26 : p.y - (isLast ? 15 : 14);
      if (ly < 14) ly = p.y + 28;
      svg += '<text class="mchart__label' + (isLast ? ' is-current' : '') + '" x="' + r(p.x) + '" y="' + r(ly) + '" text-anchor="middle">' + fmt(p.v, m.decimals) + '</text>';
    });
    svg += '<circle class="mchart__next" cx="' + xNext + '" cy="' + r(last.y) + '" r="6"/>';
    svg += '</svg>';

    var axis = D.tests.map(function (tst, k) {
      var d = parseDate(tst.date);
      return '<span style="--x:' + (xs[k] / W) + '"' + (k === n - 1 ? ' class="is-current"' : '') + '>' + MONTHS_SHORT[d.m] + ' ' + d.y + '</span>';
    }).join('') + '<span class="is-next" style="--x:' + (xNext / W) + '">' + esc(D.nextTest.axisLabel) + '</span>';

    return '<div class="mchart">' +
      '<div class="mchart__bands">' + bands.map(function (b) {
        return '<div class="mchart__band"><span class="range-band__bar is-' + b.status + '"></span>' +
          '<span><span class="mchart__band-label">' + BAND_LABEL[b.status] + '</span><span class="mchart__band-range">' + esc(b.text.replace('–', ' – ')) + '</span></span></div>';
      }).join('') + '</div>' +
      '<div class="mchart__plot">' + svg + '</div>' +
      '<div class="mchart__axis" aria-hidden="true">' + axis + '</div>' +
    '</div>';
  }

  function initMarkoer() {
    var m = markersById[param('id')] || markersById.fasteinsulin;
    var t = LATEST, cat = categoriesById[m.categoryId];
    var sibs = markersIn(cat.id, t), si = sibs.indexOf(m), n = sibs.length;
    var c = D.markerContent[m.id] || {};
    var st = statusAt(m, t), out = st !== 'in';
    document.title = m.name + ' — Revigora';

    var prev = sibs[(si - 1 + n) % n], next = sibs[(si + 1) % n];
    document.querySelector('[data-crumbs]').innerHTML =
      breadcrumbHTML([{ href: 'helbred.html', label: 'Dit helbred' }, { href: 'kategori.html?id=' + cat.id, label: cat.name }, { label: m.name }]) +
      pagerHTML({ href: 'markoer.html?id=' + prev.id, label: 'Forrige markør: ' + prev.name },
        (si + 1) + ' af ' + n + ' i ' + cat.name,
        { href: 'markoer.html?id=' + next.id, label: 'Næste markør: ' + next.name });

    // Head
    var cur = valueAt(m, t), prevV = valueAt(m, t - 1);
    var meta = 'Målt ' + dateLong(D.tests[t].date);
    if (prevV !== null && prevV !== undefined) {
      var dd = cur - prevV;
      meta += ' · ' + (dd > 0 ? '+' : dd < 0 ? '−' : '±') + fmt(Math.abs(dd), m.decimals) + ' siden ' + MONTHS[parseDate(D.tests[t - 1].date).m];
    }
    document.querySelector('[data-marker-head]').innerHTML =
      '<div class="marker-head__copy">' +
        '<p class="eyebrow">' + esc(cat.name) + (c.eyebrow ? ' · ' + esc(c.eyebrow) : '') + '</p>' +
        '<h1 class="marker-head__title">' + esc(m.name) + '</h1>' +
        '<p class="marker-head__lead">' + esc(c.lead || m.description) + '</p>' +
      '</div>' +
      '<div class="marker-head__value">' +
        '<span class="status-tag status-tag--' + (out ? 'out' : 'in') + '"><span class="dot dot--' + (out ? 'out' : 'in') + '"></span>' + STATUS_LABEL[st] + '</span>' +
        '<p class="marker-head__number"><span>' + fmt(cur, m.decimals) + '</span>' + esc(m.unit) + '</p>' +
        '<p class="marker-head__meta">' + meta + '</p>' +
      '</div>';

    // Chart card
    var firstIdx = 0; while (valueAt(m, firstIdx) === null) firstIdx++;
    var diff = cur - valueAt(m, firstIdx);
    var good = m.better ? (m.better === 'lower' ? diff < 0 : diff > 0) : null;
    var count = m.history.filter(function (v) { return v !== null; }).length;
    document.querySelector('[data-chart-card]').innerHTML =
      '<div class="chart-card__head"><p class="eyebrow">Din udvikling · ' + count + ' målinger</p>' +
      (firstIdx < t ? '<p class="chart-card__delta' + (good === true ? ' is-good' : good === false ? ' is-bad' : '') + '">' +
        (diff === 0 ? 'Uændret' : (diff < 0 ? '↓ ' : '↑ ') + fmt(Math.abs(diff), m.decimals) + ' ' + esc(m.unit)) +
        ' siden ' + monthYear(D.tests[firstIdx].date) + '</p>' : '') + '</div>' +
      markerChart(m);

    // Left column
    var note = D.notes.markers[m.id];
    var left = '';
    if (note) {
      left += '<article class="card note-card">' +
        '<div class="note-card__head"><h2 class="note-card__title">Lægeteamets kommentar</h2><span class="note-card__icon">' + ICON.steth + '</span></div>' +
        '<p class="note-card__meta">' + D.notes.overall.date + ' · Revigoras lægeteam</p>' +
        '<p class="note-card__text">' + esc(note) + '</p></article>';
    }
    if (c.about) {
      left += '<section class="prose-block"><h2>' + esc(c.aboutTitle) + '</h2>' + c.about.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</section>';
    }
    if (!left) {
      left = '<section class="prose-block"><h2>Om ' + esc(m.name) + '</h2><p>' + esc(m.description) + '</p></section>';
    }
    document.querySelector('[data-marker-left]').innerHTML = left;

    // Right column
    var right = '';
    if (c.actions) {
      right += '<div class="ink-card actions-card"><p class="ink-card__eyebrow">Det kan du gøre</p>' +
        '<ol class="actions-card__list">' + c.actions.map(function (a, i) {
          return '<li><span class="actions-card__num">' + ('0' + (i + 1)) + '</span><span>' + esc(a) + '</span></li>';
        }).join('') + '</ol>' +
        '<a class="btn-mint btn-mint--44" href="handlingsplan.html">Se din handlingsplan</a></div>';
    }
    var dd2 = parseDate(D.tests[t].date);
    right += '<dl class="card details-card">' +
      '<div><dt>Revigoras område</dt><dd class="is-mono">' + rangeText(m) + ' ' + esc(m.unit) + '</dd></div>' +
      (c.labLimit ? '<div><dt>Laboratoriets grænse</dt><dd class="is-mono">' + esc(c.labLimit) + ' ' + esc(m.unit) + '</dd></div>' : '') +
      '<div><dt>Prøve taget</dt><dd>' + dd2.d + '. ' + MONTHS_SHORT[dd2.m] + ' ' + dd2.y + ', kl. ' + D.sampleTimes[t] + '</dd></div>' +
      '<div><dt>Analyseret af</dt><dd>' + esc(D.lab) + '</dd></div>' +
    '</dl>';
    var related = (c.related || sibs.filter(function (s) { return s !== m; }).slice(0, 2).map(function (s) { return s.id; }))
      .map(function (id) { return markersById[id]; }).filter(Boolean);
    if (related.length) {
      right += '<div class="related"><p class="eyebrow">Relaterede markører</p><div class="link-cards">' + related.map(function (r) {
        var o = isOut(r, t);
        return '<a class="link-card" href="markoer.html?id=' + r.id + '"><span class="link-card__name"><span class="dot dot--' + (o ? 'out' : 'in') + '"></span>' + esc(shortName(r)) + '</span>' +
          '<span class="link-card__value">' + fmt(valueAt(r, t), r.decimals) + ' ' + esc(r.unit) + ' →</span></a>';
      }).join('') + '</div></div>';
    }
    document.querySelector('[data-marker-right]').innerHTML = right;
  }

  /* ============================= Page: Noter ============================== */

  function initNoter() {
    var reports = D.notes.reports;
    var rail = document.querySelector('[data-note-rail]');
    var article = document.querySelector('[data-note-article]');
    var active = 0;
    function render() {
      rail.innerHTML = reports.map(function (r, i) {
        return '<button type="button" class="rail-link' + (i === active ? ' is-active' : '') + '" aria-pressed="' + (i === active) + '" data-report="' + i + '">' +
          MORE_ICONS.doc + dateShort(r.date) + '</button>';
      }).join('');
      var r = reports[active], tst = D.tests[r.testIndex];
      var count = D.markers.filter(function (m) { return hasValue(m, r.testIndex); }).length;
      article.innerHTML =
        '<header class="note-article__head"><h2 class="note-article__date">' + dateLong(r.date) + '</h2>' +
          '<p class="note-article__meta">Test ' + (r.testIndex + 1) + ' af ' + D.tests.length + ' · ' + esc(tst.package) + ' · ' + count + ' biomarkører</p></header>' +
        '<section class="prose-block prose-block--sm"><h3>Opsummering</h3>' + r.summary.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</section>' +
        '<div class="note-lists">' +
          '<div class="card note-list"><p class="note-list__title is-good">Det går godt</p><ul>' + r.good.map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ul></div>' +
          '<div class="card note-list"><p class="note-list__title is-watch">Det holder vi øje med</p><ul class="is-watch">' + r.watch.map(function (g) { return '<li>' + esc(g) + '</li>'; }).join('') + '</ul></div>' +
        '</div>' +
        '<section class="prose-block prose-block--sm"><h3>Vores anbefaling</h3><p>' + esc(r.recommendation) + '</p></section>' +
        '<footer class="note-article__foot">' +
          '<div class="byline"><span class="byline__icon">' + ICON.steth + '</span><span><span class="byline__name">Revigoras lægeteam</span><span class="byline__sub">Gennemgået ' + dateLong(r.date) + '</span></span></div>' +
          '<a class="btn-mint btn-mint--44" href="handlingsplan.html">Se din handlingsplan →</a>' +
        '</footer>';
    }
    rail.addEventListener('click', function (e) {
      var b = e.target.closest('[data-report]'); if (!b) return;
      active = +b.getAttribute('data-report');
      render();
      rail.querySelector('[data-report="' + active + '"]').focus();
    });
    document.querySelector('[data-print]').addEventListener('click', function () { window.print(); });
    render();
  }

  /* ========================== Page: Handlingsplan ========================= */

  var ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ'.split('');

  function initHandlingsplan() {
    var plan = D.plan, diet = plan.diet, sup = plan.supplements;
    var state = { section: location.hash === '#tilskud' ? 'tilskud' : 'kost', list: 'enjoy', query: '' };
    var c = counts(LATEST);
    document.querySelector('[data-plan-eyebrow]').textContent = 'Baseret på din test fra ' + dateLong(D.tests[LATEST].date);
    document.querySelector('[data-plan-intro]').textContent = 'Målrettet mod dine ' + c.out + ' markører uden for området. Planen opdateres automatisk efter hver ny test.';
    var targetsHTML = '<span class="targets__label">Rettet mod</span>' + plan.targets.map(targetTag).join('');
    document.querySelectorAll('[data-plan-targets]').forEach(function (el) { el.innerHTML = targetsHTML; });
    document.querySelector('[data-diet-intro]').textContent = diet.intro;
    document.querySelector('[data-sup-intro]').textContent = sup.intro;

    var navBtns = document.querySelectorAll('[data-plan-nav]');
    var panes = { kost: document.getElementById('kost'), tilskud: document.getElementById('tilskud') };
    function showSection(s, push) {
      state.section = s;
      navBtns.forEach(function (b) {
        var on = b.getAttribute('data-plan-nav') === s;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
        b.tabIndex = on ? 0 : -1;
      });
      panes.kost.hidden = s !== 'kost';
      panes.tilskud.hidden = s !== 'tilskud';
      if (push) history.replaceState(null, '', s === 'tilskud' ? '#tilskud' : location.pathname);
    }
    navBtns.forEach(function (b) {
      b.addEventListener('click', function () { showSection(b.getAttribute('data-plan-nav'), true); });
      b.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        var s = state.section === 'kost' ? 'tilskud' : 'kost';
        showSection(s, true);
        document.querySelector('[data-plan-nav="' + s + '"]').focus();
      });
    });
    window.addEventListener('hashchange', function () { showSection(location.hash === '#tilskud' ? 'tilskud' : 'kost'); });

    // Kost
    var seg = document.querySelectorAll('[data-diet-list]');
    var lettersEl = document.querySelector('[data-letters]');
    var foodsEl = document.querySelector('[data-foods]');
    seg[0].querySelector('[data-seg-label]').textContent = 'Nyd disse · ' + diet.enjoy.length;
    seg[1].querySelector('[data-seg-label]').textContent = 'Begræns disse · ' + diet.limit.length;
    function slug(l) { return 'bogstav-' + state.list + '-' + l.toLowerCase(); }
    function renderFoods() {
      var limit = state.list === 'limit';
      seg.forEach(function (b) {
        var on = b.getAttribute('data-diet-list') === state.list;
        b.classList.toggle('is-active', on); b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1;
      });
      var items = (limit ? diet.limit : diet.enjoy).filter(function (f) {
        return !state.query || f.toLowerCase().indexOf(state.query.toLowerCase()) > -1;
      });
      var groups = {};
      items.forEach(function (f) { var l = f.charAt(0).toUpperCase(); (groups[l] = groups[l] || []).push(f); });
      lettersEl.innerHTML = ALPHABET.map(function (l) {
        return groups[l]
          ? '<a href="#' + slug(l) + '" class="letters__l">' + l + '</a>'
          : '<span class="letters__l is-empty" aria-hidden="true">' + l + '</span>';
      }).join('');
      var top = limit ? diet.limitTop : diet.enjoyTop;
      foodsEl.className = 'foods' + (limit ? ' is-limit' : '');
      foodsEl.innerHTML =
        (state.query ? '' : '<div class="card top-list"><h3 class="top-list__title">' + (limit ? 'Begræns mest' : 'Dine top 5') + '</h3><ol>' +
          top.map(function (f, i) {
            return '<li><span class="top-list__num">' + ('0' + (i + 1)) + '</span><span class="top-list__name">' + esc(f.name) + '</span><span class="top-list__targets">' + esc(f.targets) + '</span></li>';
          }).join('') + '</ol></div>') +
        ALPHABET.filter(function (l) { return groups[l]; }).map(function (l) {
          return '<section class="letter-group" id="' + slug(l) + '" aria-label="' + l + '"><h3 class="letter-group__l" aria-hidden="true">' + l + '</h3><ul>' +
            groups[l].map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul></section>';
        }).join('') +
        (items.length ? '' : '<p class="list-empty">Ingen fødevarer matcher “' + esc(state.query) + '”.</p>');
    }
    seg.forEach(function (b) {
      b.addEventListener('click', function () { state.list = b.getAttribute('data-diet-list'); renderFoods(); });
    });
    var searchWrap = document.querySelector('[data-food-search]');
    var searchInput = searchWrap.querySelector('input');
    document.querySelector('[data-food-search-open]').addEventListener('click', function (e) {
      var open = !searchWrap.classList.contains('is-open');
      searchWrap.classList.toggle('is-open', open);
      e.currentTarget.setAttribute('aria-expanded', String(open));
      if (open) searchInput.focus(); else { searchInput.value = ''; state.query = ''; renderFoods(); }
    });
    searchInput.addEventListener('input', function () { state.query = searchInput.value.trim(); renderFoods(); });
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { searchInput.value = ''; state.query = ''; searchWrap.classList.remove('is-open'); renderFoods(); }
    });
    renderFoods();

    // Tilskud
    document.querySelector('[data-supplements]').innerHTML =
      sup.items.slice(0, 2).map(function (s, i) {
        return '<article class="card supp-card' + (i === 0 ? ' is-top' : '') + '">' +
          '<span class="supp-card__rank">' + (i + 1) + '</span>' +
          '<div class="supp-card__body">' +
            '<div class="supp-card__head"><h3>' + esc(s.name) + '</h3>' + (s.badge ? '<span class="tag tag--mint">' + esc(s.badge) + '</span>' : '') + '</div>' +
            '<p class="supp-card__dose">' + esc(s.dose) + '</p>' +
            '<p class="supp-card__why">' + esc(s.why) + '</p>' +
            '<div class="targets targets--sm"><span class="targets__label">Rettet mod</span>' + s.targets.map(targetTag).join('') + '</div>' +
          '</div></article>';
      }).join('') +
      '<div class="card supp-list">' + sup.items.slice(2).map(function (s, i) {
        return '<div class="supp-row"><span class="supp-row__rank">' + (i + 3) + '</span>' +
          '<span class="supp-row__body"><span class="supp-row__name">' + esc(s.name) + '</span><span class="supp-row__dose">' + esc(s.dose) + '</span></span>' +
          '<span class="supp-row__targets">' + esc(s.targetsText) + '</span></div>';
      }).join('') + '</div>' +
      '<div class="not-needed"><p class="eyebrow">Ikke nødvendigt for dig lige nu</p><p>' + esc(sup.notNeeded) + '</p></div>' +
      '<div class="disclaimer">' + MORE_ICONS.info + '<p>' + esc(sup.disclaimer) + '</p></div>';

    showSection(state.section);
  }

  /* ============================ Page: Historik ============================ */

  var KEY_MARKERS = ['apob', 'ldl', 'fasteinsulin', 'hba1c', 'd-vitamin', 'ferritin', 'hs-crp'];

  function trendOf(m) {
    var t = LATEST, cur = valueAt(m, t), prev = valueAt(m, t - 1);
    if (m.trendNote) return { text: m.trendNote, kind: 'neutral' };
    if (isImproving(m, t)) return { text: (cur < prev ? '↓ ' : '↑ ') + 'Forbedres', kind: 'good' };
    if (prev === null || cur === prev) return { text: '→ Stabil', kind: 'neutral' };
    var up = cur > prev;
    var bad = m.better && (m.better === 'lower' ? up : !up);
    return { text: up ? '↑ Stigende' : '↓ Faldende', kind: bad ? 'bad' : 'neutral' };
  }

  function initHistorik() {
    var n = D.tests.length, first = D.tests[0], last = D.tests[n - 1];
    var mode = 'key';
    document.querySelector('[data-hist-eyebrow]').textContent = n + ' tests · siden ' + monthYear(first.date);
    document.querySelector('[data-bio-trend]').innerHTML =
      '<p class="eyebrow">Biologisk alder</p>' +
      '<p class="bio-trend__values"><span class="bio-trend__from">' + fmt(first.bioAge, 1) + '</span><span class="bio-trend__arrow" aria-label="til">→</span>' +
      '<span class="bio-trend__to">' + fmt(last.bioAge, 1) + '</span><span class="bio-trend__unit">år</span></p>';

    document.querySelector('[data-test-cards]').innerHTML = D.tests.slice().reverse().map(function (tst) {
      var i = D.tests.indexOf(tst), latest = i === n - 1, c = counts(i);
      return '<article class="test-card' + (latest ? ' ink-card' : ' card') + '">' +
        '<div class="test-card__top"><p class="test-card__eyebrow">' + (latest ? 'Seneste' : 'Test ' + (i + 1)) + '</p>' +
          '<button type="button" class="test-card__dl" aria-label="Download PDF for testen ' + dateShort(tst.date) + '" data-download>' + MORE_ICONS.download + '</button></div>' +
        '<h2 class="test-card__date"><a href="helbred.html' + (latest ? '' : '?test=' + i) + '">' + dateShort(tst.date) + '</a></h2>' +
        '<p class="test-card__pkg">' + esc(tst.package) + '</p>' +
        '<p class="test-card__counts"><span class="is-in">' + c.in + ' i området</span>' + (c.out ? '<span class="is-out">' + c.out + ' uden for</span>' : '') + '</p>' +
      '</article>';
    }).join('');
    document.querySelector('[data-test-cards]').addEventListener('click', function (e) {
      if (e.target.closest('[data-download]')) demoAlert('PDF-download er ikke en del af mockuppen.');
    });

    var table = document.querySelector('[data-compare]');
    var toggles = document.querySelectorAll('[data-compare-mode]');
    toggles[1].textContent = 'Alle ' + counts(LATEST).total;
    function render() {
      toggles.forEach(function (b) {
        var on = b.getAttribute('data-compare-mode') === mode;
        b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', String(on));
      });
      var markers = mode === 'key' ? KEY_MARKERS.map(function (id) { return markersById[id]; }) : D.markers;
      var head = '<thead><tr><th scope="col">Markør</th>' + D.tests.map(function (tst, i) {
        return '<th scope="col" class="is-num' + (i === n - 1 ? ' is-current' : '') + '">' + dateAxis(tst.date) + '</th>';
      }).join('') + '<th scope="col" class="is-trend">Tendens</th></tr></thead>';
      var rows = markers.map(function (m) {
        var tr = trendOf(m);
        return '<tr><th scope="row"><a href="markoer.html?id=' + m.id + '">' + esc(shortName(m)) + '</a><span>' + esc(m.unit) + (m.unit ? ' · ' : '') + rangeText(m, ' – ') + '</span></th>' +
          D.tests.map(function (tst, i) {
            var v = valueAt(m, i);
            if (v === null) return '<td class="is-num is-empty">–</td>';
            return '<td class="is-num' + (isOut(m, i) ? ' is-out' : '') + (i === n - 1 ? ' is-current' : '') + '">' + fmt(v, m.decimals) +
              (isOut(m, i) ? '<span class="visually-hidden"> (uden for området)</span>' : '') + '</td>';
          }).join('') +
          '<td class="is-trend is-' + tr.kind + '">' + tr.text + '</td></tr>';
      }).join('');
      var bio = '<tr><th scope="row"><span class="th-name">Biologisk alder</span><span>år · faktisk alder ' + D.user.age + '</span></th>' +
        D.tests.map(function (tst, i) { return '<td class="is-num' + (i === n - 1 ? ' is-current' : '') + '">' + fmt(tst.bioAge, 1) + '</td>'; }).join('') +
        '<td class="is-trend is-' + (last.bioAge < D.tests[n - 2].bioAge ? 'good">↓ Forbedres' : 'neutral">→ Stabil') + '</td></tr>';
      table.innerHTML = head + '<tbody>' + rows + bio + '</tbody>';
    }
    toggles.forEach(function (b) { b.addEventListener('click', function () { mode = b.getAttribute('data-compare-mode'); render(); }); });
    render();
  }

  /* ============================ Page: Bestil ============================== */

  function initBestil() {
    var o = D.order;
    var state = { pkg: o.defaultPackage, city: o.cities[0].id, day: o.defaultDay, slot: o.defaultSlot };
    var rec = document.querySelector('[data-recommendation]');
    rec.querySelector('[data-rec-title]').textContent = o.recommendation.title;
    rec.querySelector('[data-rec-text]').textContent = o.recommendation.text;

    var pkgEl = document.querySelector('[data-packages]');
    pkgEl.innerHTML = o.packages.map(function (p) {
      return '<label class="package">' +
        '<input type="radio" name="package" value="' + p.id + '"' + (p.id === state.pkg ? ' checked' : '') + '>' +
        '<span class="package__radio" aria-hidden="true"></span>' +
        '<span class="package__body">' +
          '<span class="package__head"><span class="package__name">' + esc(p.name) + '</span>' + (p.tag ? '<span class="tag tag--' + p.tagKind + '">' + esc(p.tag) + '</span>' : '') + '</span>' +
          '<span class="package__desc">' + esc(p.description) + '</span>' +
          (p.highlight ? '<span class="package__highlight">' + esc(p.highlight) + '</span>' : '') +
        '</span>' +
        '<span class="package__price"><span>' + kr(p.price) + '</span>' + esc(p.priceUnit) + '</span>' +
      '</label>';
    }).join('');
    pkgEl.addEventListener('change', function (e) { state.pkg = e.target.value; renderSummary(); });

    var cityEl = document.querySelector('[data-cities]');
    var daysEl = document.querySelector('[data-days]');
    var slotsEl = document.querySelector('[data-slots]');
    function unavailable(day) { return (o.unavailable[state.city] || {})[day || state.day] || []; }
    function ensureSlot() {
      if (unavailable().indexOf(state.slot) > -1) {
        state.slot = o.slots.filter(function (s) { return unavailable().indexOf(s) === -1; })[0] || null;
      }
    }
    function renderBooking() {
      var city = o.cities.filter(function (c) { return c.id === state.city; })[0];
      cityEl.innerHTML = o.cities.map(function (c) {
        var on = c.id === state.city;
        return '<button type="button" class="city-chip' + (on ? ' is-active' : '') + '" aria-pressed="' + on + '" data-city="' + c.id + '">' + esc(c.name) + '</button>';
      }).join('');
      document.querySelector('[data-clinic-name]').textContent = city.clinic;
      document.querySelector('[data-clinic-address]').textContent = city.address + ' · ' + o.duration;
      daysEl.innerHTML = o.days.map(function (day) {
        var d = parseDate(day), on = day === state.day;
        return '<button type="button" class="day' + (on ? ' is-active' : '') + '" aria-pressed="' + on + '" data-day="' + day + '" aria-label="' + cap(weekday(day)) + ' ' + d.d + '. ' + MONTHS[d.m] + '">' +
          '<span class="day__wd">' + weekday(day).slice(0, 3) + '</span><span class="day__d">' + d.d + '</span><span class="day__m">' + MONTHS_SHORT[d.m] + '</span></button>';
      }).join('');
      var un = unavailable();
      slotsEl.innerHTML = o.slots.map(function (s) {
        var off = un.indexOf(s) > -1, on = s === state.slot;
        return '<button type="button" class="slot' + (on ? ' is-active' : '') + '" data-slot="' + s + '" aria-pressed="' + on + '"' +
          (off ? ' disabled aria-label="' + s + ', optaget"' : '') + '>' + s + '</button>';
      }).join('');
      renderSummary();
    }
    function renderSummary() {
      var p = o.packages.filter(function (x) { return x.id === state.pkg; })[0];
      var city = o.cities.filter(function (c) { return c.id === state.city; })[0];
      var d = parseDate(state.day);
      document.querySelector('[data-sum-name]').textContent = p.name;
      document.querySelector('[data-sum-price]').textContent = kr(p.price);
      document.querySelector('[data-sum-note]').textContent = p.summaryNote;
      document.querySelector('[data-sum-when]').textContent = cap(weekday(state.day)) + ' ' + d.d + '. ' + MONTHS[d.m] + (state.slot ? ' · kl. ' + state.slot : ' · vælg et tidspunkt');
      document.querySelector('[data-sum-where]').textContent = city.clinic;
      document.querySelector('[data-sum-total]').textContent = kr(p.price);
    }
    cityEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-city]'); if (!b) return;
      state.city = b.getAttribute('data-city'); ensureSlot(); renderBooking();
      cityEl.querySelector('[data-city="' + state.city + '"]').focus();
    });
    document.querySelector('[data-switch-clinic]').addEventListener('click', function () {
      var i = o.cities.map(function (c) { return c.id; }).indexOf(state.city);
      state.city = o.cities[(i + 1) % o.cities.length].id; ensureSlot(); renderBooking();
    });
    daysEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-day]'); if (!b) return;
      state.day = b.getAttribute('data-day'); ensureSlot(); renderBooking();
      daysEl.querySelector('[data-day="' + state.day + '"]').focus();
    });
    slotsEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-slot]'); if (!b || b.disabled) return;
      state.slot = b.getAttribute('data-slot'); renderBooking();
      slotsEl.querySelector('[data-slot="' + state.slot + '"]').focus();
    });
    document.querySelector('[data-fasting]').textContent = o.fastingNote;
    document.querySelector('[data-pay-methods]').textContent = o.paymentMethods;
    document.querySelector('[data-included]').innerHTML = o.included.map(function (x) { return '<li>' + MORE_ICONS.check + '<span>' + esc(x) + '</span></li>'; }).join('');
    document.querySelector('[data-checkout]').addEventListener('click', function () {
      demoAlert('Trin 2 (betaling) er ikke designet endnu.');
    });
    ensureSlot();
    renderBooking();
  }

  /* ============================= Page: Profil ============================= */

  function initProfil() {
    var u = D.user, p = D.profile, d = parseDate(u.birthDate);
    document.querySelector('[data-profile-initials]').textContent = u.initials;
    document.querySelector('[data-profile-name]').textContent = u.firstName + ' ' + u.lastName;
    document.querySelector('[data-profile-sub]').textContent = 'Kunde siden ' + p.customerSince + ' · ' + D.tests.length + ' tests';

    function row(label, value, action) {
      return '<div class="settings-row"><span class="settings-row__label">' + label + '</span><span class="settings-row__value">' + value + '</span>' + action + '</div>';
    }
    var edit = function (what) { return '<button type="button" class="text-btn" data-edit="' + what + '">Rediger</button>'; };
    document.querySelector('[data-personal]').innerHTML =
      row('Navn', esc(u.firstName + ' ' + u.lastName), edit('navn')) +
      row('E-mail', esc(p.email), edit('e-mail')) +
      row('Telefon', esc(p.phone), edit('telefon')) +
      row('Fødselsdato · køn', d.d + '. ' + MONTHS[d.m] + ' ' + d.y + ' · ' + (u.sex === 'male' ? 'Mand' : 'Kvinde'), '<span class="settings-row__note">Bruges til dine områder</span>') +
      row('Login', esc(p.login), '<span class="settings-row__ok"><span class="dot dot--7 dot--in"></span>Bekræftet</span>');
    document.querySelector('[data-membership-eyebrow]').textContent = p.membership.eyebrow;
    document.querySelector('[data-membership-text]').textContent = p.membership.text;
    document.querySelector('[data-language]').innerHTML = row('Sprog', esc(p.language), '');

    function stored(id, def) {
      try { var v = localStorage.getItem('rv-pref-' + id); return v === null ? def : v === '1'; } catch (e) { return def; }
    }
    function toggleRow(t) {
      var on = t.locked ? true : stored(t.id, t.on);
      return '<div class="settings-row settings-row--toggle">' +
        '<span class="settings-row__text"><span class="settings-row__title" id="pref-' + t.id + '">' + esc(t.title) + '</span><span class="settings-row__sub">' + esc(t.sub) + '</span></span>' +
        '<button type="button" class="switch" role="switch" aria-checked="' + on + '" aria-labelledby="pref-' + t.id + '" data-pref="' + t.id + '"' +
          (t.locked ? ' aria-disabled="true" disabled' : '') + '><span class="switch__knob"></span></button>' +
      '</div>';
    }
    document.querySelector('[data-notifications]').innerHTML = p.notifications.map(toggleRow).join('');
    document.querySelector('[data-consents]').innerHTML = p.consents.map(toggleRow).join('') +
      '<div class="settings-row settings-row--actions"><button type="button" class="text-btn text-btn--underline" data-download-data>Download alle mine data</button>' +
      '<button type="button" class="text-btn text-btn--danger" data-delete-account>Slet konto</button></div>';

    document.addEventListener('click', function (e) {
      var sw = e.target.closest('[data-pref]');
      if (sw && !sw.disabled) {
        var on = sw.getAttribute('aria-checked') !== 'true';
        sw.setAttribute('aria-checked', String(on));
        try { localStorage.setItem('rv-pref-' + sw.getAttribute('data-pref'), on ? '1' : '0'); } catch (err) {}
      }
      if (e.target.closest('[data-edit]')) demoAlert('Redigering af ' + e.target.closest('[data-edit]').getAttribute('data-edit') + ' er ikke en del af mockuppen.');
      if (e.target.closest('[data-download-data]')) demoAlert('Dataudtræk er ikke en del af mockuppen.');
      if (e.target.closest('[data-delete-account]')) demoAlert('Sletning af konto er ikke en del af mockuppen.');
    });
    scrollSpy(Array.prototype.slice.call(document.querySelectorAll('[data-settings-nav] a')), function () { return 72 + 120; });
  }

  /* ================================ Boot ================================= */

  renderHeader();
  renderTabbar();
  initMegaMenu();
  initThemeToggle();
  document.documentElement.classList.remove('no-js');
  document.body.classList.remove('no-js');

  var page = document.body.getAttribute('data-page');
  var PAGES = { helbred: initHelbred, kategori: initKategori, markoer: initMarkoer, noter: initNoter, handlingsplan: initHandlingsplan, historik: initHistorik, bestil: initBestil, profil: initProfil };
  if (PAGES[page]) PAGES[page]();

  // Exposed for the other page scripts added later (kategori, markør, …)
  window.RV = {
    data: D, fmt: fmt, esc: esc, dateLong: dateLong, dateShort: dateShort, dateAxis: dateAxis, monthYear: monthYear,
    statusAt: statusAt, isOut: isOut, isImproving: isImproving, valueAt: valueAt, bandsOf: bandsOf,
    markersIn: markersIn, counts: counts, sparkline: sparkline, miniChart: miniChart, icon: ICON,
    markersById: markersById, categoriesById: categoriesById, STATUS_LABEL: STATUS_LABEL
  };
})();
