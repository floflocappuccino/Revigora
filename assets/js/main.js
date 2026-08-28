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

  function showStep(n) {
    currentStep = n;
    steps.forEach(function (fs) {
      fs.hidden = Number(fs.dataset.step) !== n;
    });
    if (progress) progress.textContent = 'Trin ' + n + ' af 3';
    var active = steps[n - 1];
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

  function openModal(intent, trigger) {
    lastFocused = trigger || document.activeElement;
    modal.hidden = false;
    root.style.overflow = 'hidden';

    // reset flow
    errorEl.hidden = true;
    if (copiedEl) copiedEl.hidden = true;
    intentInputs.forEach(function (i) { i.checked = false; });
    if (intent) {
      var pre = intentInputs.filter(function (i) { return i.value === intent; })[0];
      if (pre) pre.checked = true;
    }
    if (nextBtn) nextBtn.disabled = !modal.querySelector('input[name="intent"]:checked');
    showStep(1);

    document.addEventListener('keydown', onKeydown, true);
    track(window.matchMedia('(min-width: 768px)').matches ? 'desktop_modal_open' : 'mobile_modal_open', { intent: intent || null });
  }

  function closeModal() {
    modal.hidden = true;
    root.style.overflow = '';
    document.removeEventListener('keydown', onKeydown, true);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  /* ---- triggers -------------------------------------------------------- */
  document.querySelectorAll('[data-open-waitlist]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      openModal(btn.getAttribute('data-intent') || '', btn);
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
