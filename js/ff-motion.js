/* ============================================================
   FORGE & FABLE — motion engine
   Vanilla, dependency-free, self-initialising. Exports nothing.

   What it owns:
     1. header.site gains .is-scrolled past ~40px
     2. [data-parallax="0.2"] layers drift against the scroll
     3. .reveal elements added AFTER ff-core booted still get .in
        (ff-core owns the class; this only widens its reach)
     4. --reveal-i stagger indices for [data-reveal-stagger] containers
     5. the live indicator is hoisted out of the mobile drawer, so
        "is anyone live right now" survives the 820px breakpoint

   It never fights ff-core: ff-core adds .in, and so does this — the
   class is idempotent. Parallax uses the `translate` property, not
   `transform`, so .reveal keeps `transform` entirely to itself.

   Everything no-ops when the visitor asked for reduced motion, and
   every hook is optional — a page with none of these elements pays
   nothing but the parse.
   ============================================================ */
(function () {
  'use strict';

  /* A page builder may link this twice; boot once. */
  if (window.__ffMotion) return;
  window.__ffMotion = true;

  var mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  /* FF may not exist yet (script order is the page's business) — fall back. */
  function reduced() {
    return (window.FF && typeof window.FF.reduced === 'boolean') ? window.FF.reduced : mq.matches;
  }

  /* Contexts where no one will ever scroll: automation, prerenderers, social
     card renderers, screenshot services, print. In every one of them the
     entrance animation is the only thing standing between the visitor and the
     content, and the content must win. Same markup, same copy — the only
     difference is that nothing fades in. */
  function neverScrolls() {
    return navigator.webdriver === true ||
           /\bHeadless(Chrome)?\b/i.test(navigator.userAgent || '') ||
           (window.matchMedia && window.matchMedia('print').matches);
  }
  function staticRender() { return reduced() || neverScrolls(); }

  var rafPending = false;
  var scrollJobs = [];

  function onScroll() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () {
      rafPending = false;
      for (var i = 0; i < scrollJobs.length; i++) {
        try { scrollJobs[i](); } catch (e) { /* one bad job must not stop the rest */ }
      }
    });
  }

  /* ---------- 1. sticky header state ----------
     Runs even under reduced motion: it is a state change, not an
     animation, and the CSS transition is already neutralised there. */
  function initHeaderState() {
    var header = document.querySelector('header.site');
    if (!header) return;
    var THRESHOLD = 40;
    var on = null;
    function apply() {
      var next = window.scrollY > THRESHOLD;
      if (next === on) return;          // don't touch the DOM for nothing
      on = next;
      header.classList.toggle('is-scrolled', next);
    }
    scrollJobs.push(apply);
    apply();
  }

  /* ---------- 2. parallax ----------
     data-parallax="0.2" → the layer lags 20% of its travel through the
     viewport. Written to a custom property so CSS decides what to do
     with it (and so reduced-motion CSS can simply ignore it). */
  function initParallax() {
    var els = document.querySelectorAll('[data-parallax]');
    if (!els.length || reduced()) return;

    var layers = [];
    for (var i = 0; i < els.length; i++) {
      var speed = parseFloat(els[i].getAttribute('data-parallax'));
      if (!isFinite(speed) || speed === 0) continue;
      /* clamped: a runaway value would tear the layer off the page */
      layers.push({ el: els[i], speed: Math.max(-0.6, Math.min(0.6, speed)), visible: true });
    }
    if (!layers.length) return;

    /* Only pay for layers that are actually on screen — and only hold a
       compositor layer while one is. A permanent will-change on a decorative
       texture is rent with no lease end. */
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          for (var j = 0; j < layers.length; j++) {
            if (layers[j].el !== en.target) continue;
            layers[j].visible = en.isIntersecting;
            en.target.style.willChange = en.isIntersecting ? 'translate' : 'auto';
            break;
          }
        });
      }, { rootMargin: '120px 0px' });
      layers.forEach(function (l) { io.observe(l.el); });
    } else {
      layers.forEach(function (l) { l.el.style.willChange = 'translate'; });
    }

    function apply() {
      var vh = window.innerHeight || 1;
      for (var k = 0; k < layers.length; k++) {
        var l = layers[k];
        if (!l.visible) continue;
        var r = l.el.getBoundingClientRect();
        /* how far this element's centre sits from the viewport centre */
        var offset = (r.top + r.height / 2) - vh / 2;
        l.el.style.setProperty('--ff-parallax', (offset * l.speed * -1).toFixed(2) + 'px');
      }
    }
    scrollJobs.push(apply);
    window.addEventListener('resize', onScroll, { passive: true });
    apply();
  }

  /* ---------- 5. hoist the live indicator out of the mobile drawer ----------
     Below 820px nav.links collapses to max-height:0, which buried the one
     piece of chrome that answers "is anyone live right now" behind a tap.
     The node itself is moved — same element, same #navLive, same classes — so
     ff-core's badge listener keeps updating it. Reversed on the way back up.
     Runs under reduced motion too: this is layout, not animation. */
  function initNavLiveHoist() {
    var nav = document.querySelector('header.site .nav');
    var links = nav && nav.querySelector('nav.links');
    if (!nav || !links) return;

    var pill = document.getElementById('navLive') || links.querySelector('.nav-live');
    if (!pill || !links.contains(pill)) return;

    var toggle = nav.querySelector('.nav-toggle');
    var rail = nav.querySelector('.nav-rail');
    if (!rail) {
      rail = document.createElement('div');
      rail.className = 'nav-rail';
      if (toggle && toggle.parentNode === nav) nav.insertBefore(rail, toggle);
      else nav.appendChild(rail);
    }

    /* remember exactly where it came from, so going back is lossless */
    var home = pill.parentNode;
    var anchor = pill.nextSibling;

    var mqNav = window.matchMedia('(max-width:820px)');
    function place() {
      if (mqNav.matches) {
        if (pill.parentNode !== rail) rail.appendChild(pill);
      } else if (pill.parentNode !== home) {
        home.insertBefore(pill, anchor);
      }
    }
    place();
    if (mqNav.addEventListener) mqNav.addEventListener('change', place);
    else if (mqNav.addListener) mqNav.addListener(place);
  }

  /* ---------- 3 + 4. reveal reach and stagger ----------
     ff-core observes the .reveal elements present when it booted. Anything
     a page renders later (a roster re-render, a lazily revealed shelf) is
     never observed and would stay at opacity 0 forever. This adopts them. */
  function initReveals() {
    var supported = 'IntersectionObserver' in window;

    function showAll(list) {
      for (var i = 0; i < list.length; i++) list[i].classList.add('in');
    }

    /* stagger indices, so a grid arrives as a sequence rather than a slab */
    function stagger(root) {
      var groups = (root || document).querySelectorAll('[data-reveal-stagger]');
      for (var i = 0; i < groups.length; i++) {
        var step = parseInt(groups[i].getAttribute('data-reveal-stagger'), 10);
        var kids = groups[i].querySelectorAll(':scope > .reveal');
        for (var j = 0; j < kids.length; j++) {
          /* cap it: the 40th card must not wait three seconds */
          kids[j].style.setProperty('--reveal-i', String(Math.min(j, isFinite(step) && step > 0 ? step : 8)));
        }
      }
    }

    if (staticRender() || !supported) {
      showAll(document.querySelectorAll('.reveal'));
      /* late arrivals too */
      if ('MutationObserver' in window) {
        new MutationObserver(function () {
          showAll(document.querySelectorAll('.reveal:not(.in)'));
        }).observe(document.body, { childList: true, subtree: true });
      }
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in');
        io.unobserve(en.target);
      });
      /* a touch of bottom margin so a block is already arriving as it crosses
         the fold, rather than popping exactly at the edge */
    }, { threshold: 0.1, rootMargin: '0px 0px 12% 0px' });

    var seen = 'ffSeen';   // dataset flag, so we never double-observe
    function adopt(root) {
      var els = (root || document).querySelectorAll('.reveal:not(.in)');
      for (var i = 0; i < els.length; i++) {
        if (els[i].dataset[seen]) continue;
        els[i].dataset[seen] = '1';
        io.observe(els[i]);
      }
    }

    stagger(document);
    adopt(document);

    if ('MutationObserver' in window) {
      var mo = new MutationObserver(function (records) {
        for (var i = 0; i < records.length; i++) {
          var added = records[i].addedNodes;
          for (var j = 0; j < added.length; j++) {
            if (added[j].nodeType !== 1) continue;
            stagger(added[j].parentNode || document);
            adopt(added[j].parentNode || document);
            return;   // one rescan per batch is plenty
          }
        }
      });
      mo.observe(document.body, { childList: true, subtree: true });
    }
  }

  /* ---------- boot ---------- */
  function boot() {
    if (!document.body) return;
    initHeaderState();
    initNavLiveHoist();
    initParallax();
    initReveals();
    if (scrollJobs.length) {
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
