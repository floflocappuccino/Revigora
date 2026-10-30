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

  /* ---- 0b · Refundable deposit (Stripe Payment Link) ---------------------
     Leave `url` empty and the deposit step is not shown anywhere. To go live:
     paste the Payment Link (https://buy.stripe.com/...); the amount (kr.) is
     already set and must match the Payment Link. In the Payment Link, set the
     confirmation page to https://revigora.dk/tak.html. Terms: handelsbetingelser.html
     With `url` empty the payment step is still shown, but the button is locked
     ("Betaling åbner snart"). Pasting the link is all it takes to open it. */
  var DEPOSIT = { url: '', amount: 3500 };   // kr. incl. VAT = the full price of the first test

  /* ---- 0c · Referral discount --------------------------------------------
     Everyone gets a personal link (?ref=…). A referral counts only when both the
     referrer and the referred person have paid the deposit; each gives the
     referrer `discount` kr. back at launch, and it stacks. Terms:
     handelsbetingelser.html#henvisning. Counting: Stripe's client_reference_id is
     "<own code>_<referrer code>" (see README). */
  var REFERRAL = { discount: 100, exampleCount: 5 };

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
      one_time: {
        img: 'assets/img/package-box-enkelt-tjek.png',
        eyebrow: 'Engangstest · 45 biomarkører',
        name: 'Revigora-test',
        desc: 'Én komplet blodprøve med svar i dit dashboard.',
        includes: ['Blodprøve på et offentligt hospital', 'Analyse på hospitalets laboratorium',
          'Resultater forklaret i et klart sprog', 'Gennemgået af en læge'],
        priceMeta: 'Engangsbetaling',
        price: '3.500 kr.',
        ctaLabel: 'Kom på ventelisten – Engangstest'
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
   * Waitlist modal — fixed 5-step flow:
   *   1. Contact info (+ optional marketing consent)       -> kept in memory
   *   2. Interests (multi-select)
   *   3. Age range (single-select, auto-advance)
   *   4. Training frequency (single-select, auto-advance)  -> POST stage=completed
   *   5. Confirmation
   * Exactly one Formspree submission per modal session: it fires once they
   * finish step 4 (answered or skipped), or early — tagged stage=abandoned —
   * if they close the modal anywhere in steps 2-4. Closing on step 1 (before
   * it's been submitted) sends nothing.
   * `intent` (which package) is set only by which button opened the modal —
   * there is no in-modal picker any more. Generic triggers (header/hero/
   * footer, data-intent="") default to "membership".
   * ===================================================================== */
  var modal = document.getElementById('waitlist');
  if (!modal) return;

  var TOTAL_STEPS = 5;

  // Edit the Danish labels or machine-readable values here — steps 2-4 are
  // rendered from this config, nowhere else.
  var PROFILE_CONFIG = {
    interests: [
      { value: 'training', label: 'Jeg vil have mere ud af min træning' },
      { value: 'work', label: 'Jeg vil præstere bedre på arbejdet' },
      { value: 'baseline', label: 'Jeg vil have en baseline at sammenligne med fremover' },
      { value: 'energy', label: 'Jeg vil have mere energi i hverdagen' },
      { value: 'aging', label: 'Jeg vil sikre, at jeg ældes godt' },
      { value: 'other', label: 'Andet' }
    ],
    ageRanges: [
      { value: 'under-20', label: 'Under 20' },
      { value: '20-29', label: '20–29' },
      { value: '30-39', label: '30–39' },
      { value: '40-49', label: '40–49' },
      { value: '50-59', label: '50–59' },
      { value: '60-plus', label: '60+' }
    ],
    trainingFrequencies: [
      { value: 'rarely', label: 'Sjældent eller aldrig' },
      { value: '1-2', label: '1–2 gange om ugen' },
      { value: '3-4', label: '3–4 gange om ugen' },
      { value: '5-plus', label: '5 gange om ugen eller mere' }
    ]
  };

  var sheet = modal.querySelector('.modal__sheet');
  var form = modal.querySelector('.modal__form');
  var steps = Array.prototype.slice.call(modal.querySelectorAll('.wl-step'));
  var progress = modal.querySelector('.modal__progress');
  var progressFill = modal.querySelector('[data-progress-fill]');
  var errorEl = modal.querySelector('[data-form-error]');
  var consentInput = modal.querySelector('#wl-consent');
  var confirmText = modal.querySelector('[data-confirm-text]');
  var shareBtn = modal.querySelector('[data-share]');
  var copyBtn = modal.querySelector('[data-copy]');
  var copiedEl = modal.querySelector('[data-copied]');

  var interestListEl = modal.querySelector('[data-interest-options]');
  var otherFieldEl = modal.querySelector('[data-other-field]');
  var otherInputEl = modal.querySelector('#wl-other');
  var ageListEl = modal.querySelector('[data-age-options]');
  var freqListEl = modal.querySelector('[data-frequency-options]');

  var lastFocused = null;
  var currentStep = 1;

  var currentIntent = '';
  var submissionSent = false; // set once the single Formspree POST has gone out
  var refHash = '';
  var refParam = (function () {
    try {
      var r = (new URLSearchParams(window.location.search).get('ref') || '').toLowerCase();
      return /^[0-9a-f]{8}$/.test(r) ? r : '';  // only well-formed codes (they end up in Stripe)
    } catch (e) { return ''; }
  })();

  var contact = { name: '', email: '', city: '', consent: false, consentTimestamp: '' };
  var state = { interests: [], interestOther: '', ageRange: '', trainingFrequency: '' };

  /* ---- render steps 2-4 option lists once, from PROFILE_CONFIG -------- */
  function renderOptionList(container, options, kind) {
    if (!container) return;
    options.forEach(function (opt) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'wl-option press';
      btn.textContent = opt.label;
      btn.dataset.value = opt.value;
      if (kind === 'multi') btn.setAttribute('aria-pressed', 'false');
      else { btn.setAttribute('role', 'radio'); btn.setAttribute('aria-checked', 'false'); }
      container.appendChild(btn);
    });
  }
  renderOptionList(interestListEl, PROFILE_CONFIG.interests, 'multi');
  renderOptionList(ageListEl, PROFILE_CONFIG.ageRanges, 'single');
  renderOptionList(freqListEl, PROFILE_CONFIG.trainingFrequencies, 'single');

  function resetOptionButtons(container, attr) {
    if (!container) return;
    Array.prototype.forEach.call(container.querySelectorAll('.wl-option'), function (b) {
      b.setAttribute(attr, 'false');
    });
  }

  // The one payload shape, used whether the flow completes or is abandoned.
  function buildPayload(stage) {
    return {
      intent: currentIntent,
      name: contact.name,
      email: contact.email,
      city: contact.city,
      locale: 'da',
      source: 'landing-waitlist',
      marketing_consent: contact.consent,
      consent_timestamp: contact.consentTimestamp,
      ref: refParam,
      interests: state.interests.join(','),
      interest_other: state.interestOther,
      age_range: state.ageRange,
      training_frequency: state.trainingFrequency,
      stage: stage // 'completed' | 'abandoned'
    };
  }

  /* ---- ref hash: first 8 hex chars of SHA-256(email), never the email -- */
  function computeRefHash(email) {
    refHash = '';
    if (!email || !window.crypto || !window.crypto.subtle) return;
    try {
      var bytes = new TextEncoder().encode(email.trim().toLowerCase());
      window.crypto.subtle.digest('SHA-256', bytes).then(function (buf) {
        var hex = Array.prototype.map.call(new Uint8Array(buf), function (b) {
          return b.toString(16).padStart(2, '0');
        }).join('');
        refHash = hex.slice(0, 8);
      }).catch(function () { refHash = ''; });
    } catch (e) { refHash = ''; }
  }

  function buildShareUrl() {
    try {
      var url = new URL(window.location.href);
      if (refHash) url.searchParams.set('ref', refHash);
      return url.toString();
    } catch (e) {
      return window.location.href;
    }
  }

  function showStep(n) {
    currentStep = n;
    steps.forEach(function (fs) {
      fs.hidden = Number(fs.dataset.step) !== n;
    });
    if (progress) progress.textContent = 'Trin ' + n + ' af ' + TOTAL_STEPS;
    if (progressFill) progressFill.style.width = Math.round((n / TOTAL_STEPS) * 100) + '%';
    var active = steps[n - 1];
    var heading = active.querySelector('.modal__title');
    if (heading) {
      if (!heading.id) heading.id = 'wl-title-' + n;
      sheet.setAttribute('aria-labelledby', heading.id);
      if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
      heading.focus();
    }
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

  function openModal(intent, trigger) {
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
    currentIntent = intent || 'membership';
    submissionSent = false;
    refHash = '';
    contact = { name: '', email: '', city: '', consent: false, consentTimestamp: '' };
    state = { interests: [], interestOther: '', ageRange: '', trainingFrequency: '' };
    form.reset();
    if (otherFieldEl) otherFieldEl.hidden = true;
    resetOptionButtons(interestListEl, 'aria-pressed');
    resetOptionButtons(ageListEl, 'aria-checked');
    resetOptionButtons(freqListEl, 'aria-checked');

    showStep(1);

    document.addEventListener('keydown', onKeydown, true);
    track(window.matchMedia('(min-width: 768px)').matches ? 'desktop_modal_open' : 'mobile_modal_open', { intent: currentIntent });
  }

  function closeModal() {
    // Step 1 must be explicitly submitted before anything is captured. Once
    // past it (steps 2-4), bailing out still sends the one submission —
    // whatever contact + profile data has been collected so far — tagged
    // "abandoned" instead of "completed".
    if (!submissionSent && currentStep >= 2 && currentStep <= 4) {
      sendAbandoned();
    }
    modal.hidden = true;
    root.style.overflow = '';
    document.removeEventListener('keydown', onKeydown, true);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  window.__openWaitlistModal = openModal;
  enableSheetDrag(sheet, modal.querySelector('.modal__backdrop'), closeModal);

  /* ---- triggers -------------------------------------------------------- */
  document.querySelectorAll('[data-open-waitlist]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      if (btn.tagName === 'A') e.preventDefault(); // "Log ind" links: open the waitlist instead
      openModal(btn.getAttribute('data-intent') || '', btn);
    });
  });
  modal.querySelectorAll('[data-close-waitlist]').forEach(function (btn) {
    btn.addEventListener('click', closeModal);
  });

  /* ---- step navigation: Tilbage / Spring over / Fortsæt (step 2 only) - */
  modal.querySelectorAll('[data-step-back]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var n = Number(btn.closest('.wl-step').dataset.step);
      showStep(Math.max(1, n - 1));
    });
  });
  modal.querySelectorAll('[data-step-skip]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var n = Number(btn.closest('.wl-step').dataset.step);
      if (n === 4) { finishProfile(); return; }
      showStep(n + 1);
    });
  });
  var continueBtn = modal.querySelector('[data-step-continue]');
  if (continueBtn) {
    continueBtn.addEventListener('click', function () {
      showStep(Number(continueBtn.getAttribute('data-step-continue')));
    });
  }

  /* ---- step 2: interests (multi-select + "Andet" reveal) -------------- */
  if (interestListEl) {
    interestListEl.addEventListener('click', function (e) {
      var btn = e.target.closest('.wl-option');
      if (!btn) return;
      var value = btn.dataset.value;
      var wasPressed = btn.getAttribute('aria-pressed') === 'true';
      btn.setAttribute('aria-pressed', String(!wasPressed));
      if (wasPressed) {
        state.interests = state.interests.filter(function (v) { return v !== value; });
      } else {
        state.interests.push(value);
      }
      if (value === 'other' && otherFieldEl) {
        otherFieldEl.hidden = wasPressed;
        if (wasPressed && otherInputEl) { otherInputEl.value = ''; state.interestOther = ''; }
        else if (otherInputEl) { otherInputEl.focus(); }
      }
    });
  }
  if (otherInputEl) {
    otherInputEl.addEventListener('input', function () {
      state.interestOther = otherInputEl.value.trim();
    });
  }

  /* ---- steps 3 & 4: single-select, auto-advance ------------------------ */
  function wireSingleSelect(container, onPick) {
    if (!container) return;
    container.addEventListener('click', function (e) {
      var btn = e.target.closest('.wl-option');
      if (!btn) return;
      Array.prototype.forEach.call(container.querySelectorAll('.wl-option'), function (b) {
        b.setAttribute('aria-checked', String(b === btn));
      });
      onPick(btn.dataset.value);
    });
  }
  wireSingleSelect(ageListEl, function (value) { state.ageRange = value; showStep(4); });
  wireSingleSelect(freqListEl, function (value) { state.trainingFrequency = value; finishProfile(); });

  // step 4's own "Spring over" ends the flow the same way an answer does.
  function finishProfile() { submitFinal(); }

  function setStep4Busy(busy) {
    Array.prototype.forEach.call(steps[3].querySelectorAll('button'), function (b) { b.disabled = busy; });
  }

  // The only point the flow can actually fail: nothing has been saved yet,
  // so (unlike before) this blocks advancing to the confirmation screen —
  // showing "you're on the list" when nothing was sent would be worse.
  async function submitFinal() {
    if (submissionSent) { showStep(5); setupConfirmation(); return; }
    errorEl.hidden = true;
    setStep4Busy(true);
    try {
      await postToFormspree(buildPayload('completed'));
      submissionSent = true;
      track('waitlist_completed', { intent: currentIntent });
      showStep(5);
      setupConfirmation();
    } catch (err) {
      errorEl.hidden = false;
      errorEl.focus && errorEl.focus();
    } finally {
      setStep4Busy(false);
    }
  }

  // Fire-and-forget: the visitor is already leaving, there's no UI left to
  // retry into, so just log a failure rather than block the close.
  function sendAbandoned() {
    if (submissionSent) return;
    submissionSent = true;
    postToFormspree(buildPayload('abandoned'))
      .then(function () { track('waitlist_abandoned', { intent: currentIntent }); })
      .catch(function (err) {
        if (window.console && console.error) console.error('[waitlist] abandoned submission failed', err);
      });
  }

  /* ---- step 1 · contact info + consent (kept in memory, not sent yet) -- */
  function validStep1() {
    var fields = steps[0].querySelectorAll('input, select');
    for (var i = 0; i < fields.length; i++) {
      if (!fields[i].checkValidity()) { fields[i].reportValidity(); return false; }
    }
    return true;
  }

  async function postToFormspree(payload) {
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
    if (currentStep !== 1) return;
    if (!validStep1()) return;

    var data = new FormData(form);
    contact.name = (data.get('name') || '').toString().trim();
    contact.email = (data.get('email') || '').toString().trim();
    contact.city = data.get('city') || '';
    contact.consent = !!(consentInput && consentInput.checked);
    contact.consentTimestamp = new Date().toISOString();
    computeRefHash(contact.email);

    showStep(2);
  });

  /* ---- step 5 · secure your place (deposit) + referral + share ----------- */
  var SHARE_TEXT = 'Jeg er kommet på ventelisten til Revigora — proaktiv sundhedstestning for Norden.';

  function kr(n) { return n.toLocaleString('da-DK') + ' kr.'; }

  // The last step is where people secure their place by paying. Until a Payment Link is set,
  // the button is shown but locked; the free waitlist sign-up has already been saved either way.
  function setupConfirmation() {
    var done = steps[TOTAL_STEPS - 1];
    var payOpen = !!DEPOSIT.url;
    done.querySelector('.modal__title').textContent = 'Sikr din plads';
    var closeBtn = done.querySelector('.btn--ghost[data-close-waitlist]');
    if (closeBtn) closeBtn.textContent = payOpen ? 'Ikke nu' : 'Luk';
    if (confirmText) {
      var text = payOpen
        ? 'Du er skrevet op med ' + contact.email + '. Betal ' + kr(DEPOSIT.amount) +
          ' nu for at sikre din plads blandt de første, når vi lancerer i Danmark.'
        : 'Du er skrevet op med ' + contact.email + ' og står på ventelisten. Snart kan du sikre din plads ' +
          'blandt de første ved at betale ' + kr(DEPOSIT.amount) + ' på forhånd.'
      if (consentInput && consentInput.checked) {
        text += ' Indtil da sender vi dig lidt viden om blodprøver og sundhed undervejs.';
      }
      confirmText.textContent = text;
    }
    setupDeposit(done, payOpen);
    setupReferral(done);
    setupShare();
  }

  // The payment button. The email is prefilled on Stripe's page and the ref hash ties the
  // payment to this waitlist entry without exposing the email.
  function setupDeposit(done, payOpen) {
    var block = done.querySelector('[data-deposit]');
    if (!block) {
      block = document.createElement('div');
      block.className = 'wl-deposit';
      block.setAttribute('data-deposit', '');
      block.innerHTML =
        '<a class="btn btn--primary btn--block" data-deposit-link></a>' +
        '<p class="wl-deposit__soon" data-deposit-soon>Betaling åbner snart. Vi giver dig besked, når du kan sikre din plads.</p>' +
        '<p class="wl-deposit__text">Beløbet dækker hele prisen for din første test, så du skal ikke betale mere ' +
          'ved lancering. Du kan altid få det fuldt refunderet, indtil du bestiller.</p>' +
        '<p class="wl-deposit__terms">Betaling sker sikkert via Stripe. Læs <a href="/handelsbetingelser.html#depositum" ' +
          'target="_blank" rel="noopener">betingelserne for depositum</a>.</p>';
      confirmText.insertAdjacentElement('afterend', block);
    }
    var link = block.querySelector('[data-deposit-link]');
    link.textContent = 'Sikr din plads · ' + kr(DEPOSIT.amount);
    block.querySelector('[data-deposit-soon]').hidden = payOpen;
    if (!payOpen) {
      // Locked until the Stripe Payment Link exists.
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
      link.classList.add('is-disabled');
      link.onclick = function (e) { e.preventDefault(); };
      return;
    }
    link.removeAttribute('aria-disabled');
    link.classList.remove('is-disabled');
    link.href = depositUrl();
    // Rebuilt on click too: the personal code is hashed in the background after step 1 and
    // may not have been ready when this step was drawn. Referral payouts depend on it.
    link.onclick = function () { link.href = depositUrl(); track('deposit_click', { intent: currentIntent }); };
  }

  // Stripe gets "<own code>_<referrer code>" so referrals can be counted from Stripe alone.
  function depositUrl() {
    var ref = refHash ? refHash + (refParam && refParam !== refHash ? '_' + refParam : '') : '';
    return DEPOSIT.url + (DEPOSIT.url.indexOf('?') > -1 ? '&' : '?') +
      'prefilled_email=' + encodeURIComponent(contact.email) +
      (ref ? '&client_reference_id=' + encodeURIComponent(ref) : '');
  }

  // Stackable referral discount, shown above the share buttons (which share the personal link).
  function setupReferral(done) {
    var block = done.querySelector('[data-referral]');
    if (!block) {
      block = document.createElement('div');
      block.className = 'wl-referral';
      block.setAttribute('data-referral', '');
      block.innerHTML =
        '<p class="wl-referral__title"></p><p class="wl-referral__text"></p>' +
        '<p class="wl-referral__terms"><a href="/handelsbetingelser.html#henvisning" target="_blank" rel="noopener">' +
          'Betingelser for henvisningsrabat</a></p>';
      done.insertBefore(block, done.querySelector('.modal__share'));
    }
    var d = REFERRAL.discount, n = REFERRAL.exampleCount;
    block.querySelector('.wl-referral__title').textContent = 'Få ' + kr(d) + ' tilbage for hver, du henviser';
    block.querySelector('.wl-referral__text').textContent =
      'Når du har sikret din plads, kan du dele dit personlige link. For hver person, der sikrer sin plads via ' +
      'det, får du ' + kr(d) + ' tilbage ved lancering, og beløbene lægges sammen. Henviser du fx ' + n +
      ' personer, koster din test kun ' + kr(DEPOSIT.amount - n * d);  // "kr." ends the sentence
  }

  function setupShare() {
    if (navigator.share) {
      shareBtn.hidden = false;
      shareBtn.onclick = function () {
        // Built at click time, when the personal code is certainly ready.
        navigator.share({ title: 'Revigora', text: SHARE_TEXT, url: buildShareUrl() }).catch(function () {});
      };
    } else {
      shareBtn.hidden = true;
    }
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var url = buildShareUrl();
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
