/* =========================================================================
   Revigora — landing page behaviour
   - scroll reveal + hero readout animation
   - waitlist modal: 3-step flow, focus trap, Formspree submit, Web Share
   - analytics: thin track() wrapper (dataLayer or console)
   ========================================================================= */
(function () {
  'use strict';

  /* ---- 0 · Paste your Formspree form ID here (https://formspree.io) ------ */
  var FORM_ENDPOINT = 'https://formspree.io/f/mjyvvajr';

  var root = document.documentElement;
  root.classList.remove('no-js');

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ===================================================================== *
   * Analytics
   * ===================================================================== */
  function track(event, props) {
    var payload = Object.assign({ event: event }, props || {});
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(payload);
    } else if (window.console && console.debug) {
      console.debug('[track]', payload);
    }
  }

  /* ===================================================================== *
   * Scroll reveal
   * ===================================================================== */
  var revealables = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ===================================================================== *
   * Hero readout animation — one orchestrated, staggered moment
   * ===================================================================== */
  (function animateReadouts() {
    if (reduceMotion) return;
    var readouts = document.querySelectorAll('.readout-card [data-readout]');
    if (!readouts.length) return;
    var start = function () {
      readouts.forEach(function (el, i) {
        setTimeout(function () { el.classList.add('is-active'); }, 180 + i * 90);
      });
    };
    if ('IntersectionObserver' in window) {
      var once = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { start(); obs.disconnect(); }
        });
      }, { threshold: 0.4 });
      once.observe(document.querySelector('.readout-card'));
    } else {
      start();
    }
  })();

  /* ===================================================================== *
   * Marketing nav — transparent over the hero, blurred linen once scrolled
   * ===================================================================== */
  (function marketingNav() {
    var nav = document.querySelector('[data-marketing-nav]');
    var hero = document.getElementById('hero');
    if (!nav || !hero) return;
    function update() {
      var threshold = Math.max(0, hero.offsetHeight - nav.offsetHeight);
      nav.classList.toggle('is-scrolled', window.scrollY > threshold);
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  })();

  /* ===================================================================== *
   * Mobile nav drawer
   * ===================================================================== */
  (function navDrawer() {
    var toggle = document.querySelector('[data-nav-menu-toggle]');
    var drawer = document.getElementById('nav-drawer');
    var backdrop = document.querySelector('[data-nav-drawer-backdrop]');
    if (!toggle || !drawer) return;

    function close() {
      drawer.hidden = true;
      if (backdrop) backdrop.hidden = true;
      toggle.setAttribute('aria-expanded', 'false');
    }
    function open() {
      drawer.hidden = false;
      if (backdrop) backdrop.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
    }
    toggle.addEventListener('click', function () {
      if (drawer.hidden) open(); else close();
    });
    if (backdrop) backdrop.addEventListener('click', close);
    drawer.querySelectorAll('[data-nav-drawer-link]').forEach(function (a) {
      a.addEventListener('click', close);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !drawer.hidden) close();
    });
    window.addEventListener('resize', function () {
      if (window.matchMedia('(min-width: 768px)').matches) close();
    });
  })();

  /* ===================================================================== *
   * Sheet drag-to-dismiss — mobile bottom sheets only (waitlist + package).
   * Press feedback / open-close is CSS; this adds the physical drag gesture:
   * follow the finger 1:1, then on release either spring back or follow
   * through and dismiss, based on distance dragged and release velocity.
   * ===================================================================== */
  function enableSheetDrag(sheetEl, backdropEl, close) {
    if (!sheetEl) return;
    var dragging = false, startY = 0, currentY = 0, startTime = 0;
    var handle = sheetEl.querySelector('[data-pkg-sheet-drag], .modal__handle') || sheetEl;

    function isMobile() { return !window.matchMedia('(min-width: 768px)').matches; }

    function onPointerDown(e) {
      if (reduceMotion || !isMobile()) return;
      dragging = true;
      startY = e.clientY;
      currentY = 0;
      startTime = Date.now();
      sheetEl.style.transition = 'none';
      handle.setPointerCapture && handle.setPointerCapture(e.pointerId);
      document.addEventListener('pointermove', onPointerMove);
      document.addEventListener('pointerup', onPointerUp);
    }
    function onPointerMove(e) {
      if (!dragging) return;
      currentY = Math.max(0, e.clientY - startY);
      sheetEl.style.transform = 'translateY(' + currentY + 'px)';
      if (backdropEl) backdropEl.style.opacity = String(Math.max(0, 1 - currentY / 280));
    }
    function onPointerUp() {
      if (!dragging) return;
      dragging = false;
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      var elapsed = Math.max(1, Date.now() - startTime);
      var velocity = currentY / elapsed; // px / ms — flick-velocity projection
      sheetEl.style.transition = '';
      if (currentY > 120 || velocity > 0.5) {
        sheetEl.style.transform = 'translateY(100%)';
        setTimeout(close, 220);
      } else {
        sheetEl.style.transform = '';
      }
      if (backdropEl) backdropEl.style.opacity = '';
      currentY = 0;
    }
    handle.addEventListener('pointerdown', onPointerDown);
  }

  /* ===================================================================== *
   * Package detail sheet (mobile) — tapping a package row opens its detail
   * as a bottom sheet; its own CTA hands off to the waitlist modal with the
   * package pre-selected.
   * ===================================================================== */
  (function packageSheet() {
    var sheet = document.getElementById('pkg-sheet');
    var backdrop = document.querySelector('[data-close-pkg-sheet]');
    if (!sheet || !backdrop) return;

    var PACKAGES = {
      performance: {
        img: 'assets/img/package-performance.jpeg',
        eyebrow: 'Basislinje · 28 biomarkører',
        name: 'Performance & Fitness',
        desc: 'Til atleter, træningsentusiaster og dig, der vil forstå din energi.',
        includes: ['Testosteron & hormoner', 'Stofskifte & metabolisme', 'Lipidprofil', 'D-vitamin og ferritin'],
        priceMeta: 'Engangstest',
        price: '4.499 kr.',
        ctaLabel: 'Kom på ventelisten – Performance'
      },
      longevity: {
        img: 'assets/img/package-longevity.jpeg',
        eyebrow: 'Engangstest · 45+ biomarkører',
        name: 'Longevity & Healthspan',
        desc: 'Til dig, der vil gå i dybden med biologisk alder og langsigtet sundhed.',
        includes: ['ApoB & hs-CRP', 'Fasteinsulin', 'Biologisk alder-score', 'Thyroidea (stofskiftehormoner)'],
        priceMeta: 'Engangstest',
        price: '4.499 kr.',
        ctaLabel: 'Kom på ventelisten – Longevity'
      }
    };

    var imgEl = sheet.querySelector('[data-pkg-sheet-img]');
    var eyebrowEl = sheet.querySelector('[data-pkg-sheet-eyebrow]');
    var nameEl = sheet.querySelector('[data-pkg-sheet-name]');
    var descEl = sheet.querySelector('[data-pkg-sheet-desc]');
    var includesEl = sheet.querySelector('[data-pkg-sheet-includes]');
    var priceMetaEl = sheet.querySelector('[data-pkg-sheet-price-meta]');
    var priceEl = sheet.querySelector('[data-pkg-sheet-price]');
    var ctaEl = sheet.querySelector('[data-pkg-sheet-cta]');
    var lastFocused = null;
    var currentKey = null;

    var CHECK_SVG = '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M3 8.5l3 3 7-7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    function render(key) {
      var pkg = PACKAGES[key];
      if (!pkg) return;
      currentKey = key;
      imgEl.src = pkg.img;
      imgEl.alt = pkg.name;
      eyebrowEl.textContent = pkg.eyebrow;
      nameEl.textContent = pkg.name;
      descEl.textContent = pkg.desc;
      includesEl.innerHTML = pkg.includes.map(function (item) {
        return '<div class="pkg-sheet__item">' + CHECK_SVG + '<span>' + item + '</span></div>';
      }).join('');
      priceMetaEl.textContent = pkg.priceMeta;
      priceEl.textContent = pkg.price;
      ctaEl.textContent = pkg.ctaLabel;
      ctaEl.setAttribute('data-intent', key);
    }

    function close() {
      sheet.hidden = true;
      backdrop.hidden = true;
      root.style.overflow = '';
      document.removeEventListener('keydown', onKeydown, true);
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }
    function open(key, trigger) {
      lastFocused = trigger || document.activeElement;
      render(key);
      backdrop.hidden = false;
      sheet.hidden = false;
      root.style.overflow = 'hidden';
      sheet.style.transform = '';
      document.addEventListener('keydown', onKeydown, true);
      track('package_sheet_open', { package: key });
    }
    function onKeydown(e) {
      if (e.key === 'Escape') close();
    }

    document.querySelectorAll('[data-open-pkg-sheet]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        open(btn.getAttribute('data-open-pkg-sheet'), btn);
      });
    });
    backdrop.addEventListener('click', close);

    ctaEl.addEventListener('click', function () {
      var key = currentKey;
      close();
      // hand off to the waitlist modal, pre-selected, after the sheet closes
      setTimeout(function () {
        var openWaitlist = document.querySelector('[data-open-waitlist][data-intent="' + key + '"]');
        if (openWaitlist) { openWaitlist.click(); return; }
        if (typeof window.__openWaitlistModal === 'function') {
          window.__openWaitlistModal(key, ctaEl, true);
        }
      }, reduceMotion ? 0 : 160);
    });

    enableSheetDrag(sheet, backdrop, close);
  })();

  /* ===================================================================== *
   * Waitlist modal
   * ===================================================================== */
  var modal = document.getElementById('waitlist');
  if (!modal) return;

  var sheet = modal.querySelector('.modal__sheet');
  var form = modal.querySelector('.modal__form');
  var steps = Array.prototype.slice.call(modal.querySelectorAll('.wl-step'));
  var progress = modal.querySelector('.modal__progress');
  var nextBtn = modal.querySelector('[data-step-next]');
  var prevBtn = modal.querySelector('[data-step-prev]');
  var submitBtn = modal.querySelector('[data-submit]');
  var errorEl = modal.querySelector('[data-form-error]');
  var confirmText = modal.querySelector('[data-confirm-text]');
  var shareBtn = modal.querySelector('[data-share]');
  var copyBtn = modal.querySelector('[data-copy]');
  var copiedEl = modal.querySelector('[data-copied]');
  var intentInputs = Array.prototype.slice.call(modal.querySelectorAll('input[name="intent"]'));

  var lastFocused = null;
  var currentStep = 1;
  var submitDefaultLabel = submitBtn ? submitBtn.textContent : 'Send';

  // Set when a "direct" trigger (membership) opens the modal: the panel picker
  // is skipped entirely and the flow is framed as 2 steps with no back button.
  // Other pre-selected panels also skip the picker but keep the 3-step framing.
  var twoStepMode = false;

  function showStep(n) {
    currentStep = n;
    steps.forEach(function (fs) {
      fs.hidden = Number(fs.dataset.step) !== n;
    });
    if (progress) {
      progress.textContent = twoStepMode
        ? 'Trin ' + (n - 1) + ' af 2'
        : 'Trin ' + n + ' af 3';
    }
    var active = steps[n - 1];
    var legend = active.querySelector('.modal__title');
    if (legend) {
      if (!legend.id) legend.id = 'wl-title-' + n;
      sheet.setAttribute('aria-labelledby', legend.id);
    }
    var focusTarget = Array.prototype.slice
      .call(active.querySelectorAll('input, select, button'))
      .filter(function (el) { return !el.disabled && el.offsetParent !== null; })[0];
    if (focusTarget) focusTarget.focus();
  }

  function getFocusable() {
    return Array.prototype.slice
      .call(sheet.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
      .filter(function (el) { return el.offsetParent !== null; });
  }

  function onKeydown(e) {
    if (e.key === 'Escape') { closeModal(); return; }
    if (e.key !== 'Tab') return;
    var f = getFocusable();
    if (!f.length) return;
    var first = f[0];
    var last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  function openModal(intent, trigger, direct) {
    lastFocused = trigger || document.activeElement;
    modal.hidden = false;
    root.style.overflow = 'hidden';
    sheet.style.transform = '';

    // Desktop: the dialog grows out of whichever button triggered it —
    // compute the trigger's centre relative to the sheet's own box and
    // feed it to the sheet as a transform-origin before the open animation
    // (which restarts automatically whenever the element leaves [hidden]).
    if (trigger && typeof trigger.getBoundingClientRect === 'function' && window.matchMedia('(min-width: 768px)').matches) {
      var tr = trigger.getBoundingClientRect();
      var sr = sheet.getBoundingClientRect();
      sheet.style.transformOrigin = (tr.left + tr.width / 2 - sr.left) + 'px ' + (tr.top + tr.height / 2 - sr.top) + 'px';
    } else {
      sheet.style.transformOrigin = '';
    }

    // reset flow
    errorEl.hidden = true;
    if (copiedEl) copiedEl.hidden = true;
    intentInputs.forEach(function (i) { i.checked = false; });
    var hasIntent = false;
    if (intent) {
      var pre = intentInputs.filter(function (i) { return i.value === intent; })[0];
      if (pre) { pre.checked = true; hasIntent = true; }
    } else {
      // Generic triggers (header/hero/footer) still show the panel picker,
      // but membership is pre-selected as the default choice.
      var defaultPre = intentInputs.filter(function (i) { return i.value === 'membership'; })[0];
      if (defaultPre) defaultPre.checked = true;
    }
    twoStepMode = hasIntent && !!direct;
    if (prevBtn) prevBtn.hidden = twoStepMode;
    if (nextBtn) nextBtn.disabled = !modal.querySelector('input[name="intent"]:checked');
    showStep(hasIntent ? 2 : 1);

    document.addEventListener('keydown', onKeydown, true);
    track(window.matchMedia('(min-width: 768px)').matches ? 'desktop_modal_open' : 'mobile_modal_open', { intent: intent || null });
  }

  function closeModal() {
    modal.hidden = true;
    root.style.overflow = '';
    document.removeEventListener('keydown', onKeydown, true);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  window.__openWaitlistModal = openModal;
  enableSheetDrag(sheet, modal.querySelector('.modal__backdrop'), closeModal);

  /* ---- triggers -------------------------------------------------------- */
  document.querySelectorAll('[data-open-waitlist]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openModal(btn.getAttribute('data-intent') || '', btn, btn.hasAttribute('data-direct'));
    });
  });
  modal.querySelectorAll('[data-close-waitlist]').forEach(function (btn) {
    btn.addEventListener('click', closeModal);
  });

  /* ---- step 1 -------------------------------------------------------- */
  intentInputs.forEach(function (input) {
    input.addEventListener('change', function () {
      if (nextBtn) nextBtn.disabled = false;
    });
  });
  if (nextBtn) nextBtn.addEventListener('click', function () { showStep(2); });
  if (prevBtn) prevBtn.addEventListener('click', function () { showStep(1); });

  /* ---- step 2 · submit --------------------------------------------- */
  function collect() {
    var data = new FormData(form);
    return {
      intent: data.get('intent') || '',
      name: (data.get('name') || '').toString().trim(),
      email: (data.get('email') || '').toString().trim(),
      city: data.get('city') || '',
      locale: 'da',
      source: 'landing-waitlist'
    };
  }

  function validStep2() {
    var fields = steps[1].querySelectorAll('input, select');
    for (var i = 0; i < fields.length; i++) {
      if (!fields[i].checkValidity()) { fields[i].reportValidity(); return false; }
    }
    return true;
  }

  async function submitWaitlist(payload) {
    var res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Request failed: ' + res.status);
    return res;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (currentStep !== 2 || !validStep2()) return;

    var payload = collect();
    errorEl.hidden = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sender…';

    submitWaitlist(payload)
      .then(function () {
        track('waitlist_completed', { intent: payload.intent, city: payload.city });
        if (confirmText && payload.email) {
          confirmText.textContent = 'Vi sender en mail til ' + payload.email +
            ', så snart den danske lancering åbner. Du er blandt de første, der får adgang.';
        }
        setupShare();
        showStep(3);
      })
      .catch(function () {
        errorEl.hidden = false;
        errorEl.focus && errorEl.focus();
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = submitDefaultLabel;
      });
  });

  /* ---- step 3 · share --------------------------------------------- */
  var SHARE_TEXT = 'Jeg er kommet på ventelisten til Revigora — proaktiv sundhedstestning for Norden.';

  function setupShare() {
    var url = window.location.href;
    if (navigator.share) {
      shareBtn.hidden = false;
      shareBtn.onclick = function () {
        navigator.share({ title: 'Revigora', text: SHARE_TEXT, url: url }).catch(function () {});
      };
    } else {
      shareBtn.hidden = true;
    }
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var url = window.location.href;
      var done = function () {
        if (!copiedEl) return;
        copiedEl.hidden = false;
        setTimeout(function () { copiedEl.hidden = true; }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done).catch(done);
      } else {
        var tmp = document.createElement('input');
        tmp.value = url;
        document.body.appendChild(tmp);
        tmp.select();
        try { document.execCommand('copy'); } catch (err) {}
        document.body.removeChild(tmp);
        done();
      }
    });
  }
})();
