/* ============================================================
   FORGE & FABLE — core engine
   - Live status: tries the site's own /api/live endpoint first
     (Twitch Helix via serverless function — see functions/api/live.js),
     then falls back to DecAPI (public, CORS-enabled, no key needed).
   - Avatar refresh: current Twitch avatars, cached in localStorage
     for 24h so hardcoded fallback URLs can rot harmlessly.
   - Shared UI: mobile nav, scroll reveals, count-up stats.
   ============================================================ */
(function () {
  'use strict';

  const D = window.FF_DATA;
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- utils ---------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function fetchText(url, timeoutMs) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs || 8000);
    return fetch(url, { signal: ctrl.signal })
      .then(r => r.ok ? r.text() : Promise.reject(new Error('HTTP ' + r.status)))
      .finally(() => clearTimeout(t));
  }

  /* ---------- live status engine ---------- */
  const DECAPI = 'https://decapi.me/twitch/';
  const state = {
    statuses: {},          // channel -> {live, uptime, title, game, viewers}
    lastChecked: null,
    checking: false,
    listeners: []
  };

  function notify() { state.listeners.forEach(fn => { try { fn(state); } catch (e) { /* listener errors shouldn't kill the loop */ } }); }

  // Preferred path: our own serverless endpoint (Helix, one batched call).
  async function checkViaApi(channels) {
    const r = await fetch('/api/live?channels=' + encodeURIComponent(channels.join(',')), { headers: { accept: 'application/json' } });
    if (!r.ok) throw new Error('no api');
    const json = await r.json();
    if (!json || typeof json !== 'object' || !json.streams) throw new Error('bad api payload');
    channels.forEach(ch => {
      const s = json.streams[ch];
      state.statuses[ch] = s
        ? { live: true, uptime: s.uptime || null, title: s.title || null, game: s.game || null, viewers: (typeof s.viewers === 'number' ? s.viewers : null) }
        : { live: false };
    });
  }

  // Fallback path: DecAPI, one small text request per channel, chunked politely.
  const OFFLINE_RE = /is offline|not found|error|unavailable|invalid/i;
  const LIVE_RE = /\d+\s*(second|minute|hour|day|week)/i;

  async function checkOneDecapi(ch) {
    try {
      const up = (await fetchText(DECAPI + 'uptime/' + encodeURIComponent(ch))).trim();
      if (LIVE_RE.test(up) && !OFFLINE_RE.test(up)) {
        const st = { live: true, uptime: up.replace(/,\s*\d+\s*seconds?$/i, ''), title: null, game: null, viewers: null };
        state.statuses[ch] = st;
        notify(); // surface the live card immediately, enrich after
        const [title, game, viewers] = await Promise.allSettled([
          fetchText(DECAPI + 'title/' + encodeURIComponent(ch)),
          fetchText(DECAPI + 'game/' + encodeURIComponent(ch)),
          fetchText(DECAPI + 'viewercount/' + encodeURIComponent(ch))
        ]).then(rs => rs.map(r => r.status === 'fulfilled' ? r.value.trim() : null));
        st.title = title && !OFFLINE_RE.test(title) ? title : null;
        st.game = game && !OFFLINE_RE.test(game) ? game : null;
        st.viewers = viewers && /^\d+$/.test(viewers) ? parseInt(viewers, 10) : null;
      } else {
        state.statuses[ch] = { live: false };
      }
    } catch (e) {
      // network hiccup: keep previous status rather than flapping to offline
      if (!state.statuses[ch]) state.statuses[ch] = { live: false, unknown: true };
    }
  }

  async function checkViaDecapi(channels) {
    const CHUNK = 6;
    for (let i = 0; i < channels.length; i += CHUNK) {
      await Promise.all(channels.slice(i, i + CHUNK).map(checkOneDecapi));
      notify();
    }
  }

  async function refresh() {
    if (state.checking) return;
    const channels = D.members.filter(m => m.channel).map(m => m.channel);
    state.checking = true;
    notify();
    try {
      try { await checkViaApi(channels); }
      catch (e) { await checkViaDecapi(channels); }
    } finally {
      state.checking = false;
      state.lastChecked = new Date();
      notify();
    }
  }

  let pollTimer = null;
  function startPolling(intervalMs) {
    refresh();
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(() => { if (!document.hidden) refresh(); }, intervalMs || 3 * 60 * 1000);
  }

  /* ---------- avatar refresh (localStorage cache, 24h) ---------- */
  const AVATAR_KEY = 'ff:avatars:v1';
  const AVATAR_TTL = 24 * 60 * 60 * 1000;

  function readAvatarCache() {
    try { return JSON.parse(localStorage.getItem(AVATAR_KEY)) || {}; } catch (e) { return {}; }
  }
  function avatarFor(member) {
    if (!member.channel) return member.img || null;
    const hit = readAvatarCache()[member.channel];
    return (hit && hit.url) ? hit.url : (member.img || null);
  }
  async function refreshAvatars() {
    const cache = readAvatarCache();
    const now = Date.now();
    const stale = D.members.filter(m => m.channel && (!cache[m.channel] || now - cache[m.channel].t > AVATAR_TTL));
    if (!stale.length) return;
    const CHUNK = 4;
    for (let i = 0; i < stale.length; i += CHUNK) {
      await Promise.all(stale.slice(i, i + CHUNK).map(async m => {
        try {
          const url = (await fetchText(DECAPI + 'avatar/' + encodeURIComponent(m.channel))).trim();
          if (/^https:\/\/\S+\.(png|jpe?g|webp)/i.test(url)) {
            cache[m.channel] = { url: url, t: now };
            document.querySelectorAll('img[data-avatar="' + m.channel + '"]').forEach(img => { img.src = url; });
          }
        } catch (e) { /* keep fallback */ }
      }));
    }
    try { localStorage.setItem(AVATAR_KEY, JSON.stringify(cache)); } catch (e) { /* private mode */ }
  }

  /* ---------- shared UI: mobile nav ---------- */
  function initNav() {
    const btn = document.querySelector('.nav-toggle');
    const links = document.querySelector('nav.links');
    if (!btn || !links) return;
    btn.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      btn.classList.toggle('open', open);
    });
    links.addEventListener('click', e => {
      if (e.target.closest('a')) { links.classList.remove('open'); btn.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Nav "N live" ember — always visible (it's the nav's link to the live
  // page); glows green when anyone is live, goes quiet at zero.
  function initNavLiveBadge() {
    const badge = document.getElementById('navLive');
    if (!badge) return;
    state.listeners.push(() => {
      const n = Object.values(state.statuses).filter(s => s.live).length;
      badge.querySelector('.n').textContent = n;
      badge.classList.toggle('none', n === 0);
    });
  }

  /* ---------- the mark takes light while the guild is on air ----------
     A pinned tab should be able to tell you someone is streaming without
     being opened: the hammer strikes brighter and the forge glow comes up. */
  const FAVICON_COLD = 'assets/favicon.svg';
  const FAVICON_LIT = 'data:image/svg+xml,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
    '<rect width="64" height="64" rx="12" fill="#171310"/>' +
    '<circle cx="33" cy="34" r="25" fill="#d8531f" opacity=".3"/>' +
    '<path d="M10 42c7-4 14-4 22-1 8-3 15-3 22 1v14c-7-4-14-4-22-1-8-3-15-3-22 1z" fill="#ece0c3" stroke="#c9a35c" stroke-width="1.6" stroke-linejoin="round"/>' +
    '<path d="M32 41v14" stroke="#b9a377" stroke-width="1.4"/>' +
    '<path d="M54 8 38 27" stroke="#c9a35c" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M33 22l9-9 8 8-9 9z" fill="#ff8c42" stroke="#ffd6a0" stroke-width="1.4" stroke-linejoin="round"/>' +
    '<path d="M32 29l2.5 6.6L41 38l-6.5 2.4L32 47l-2.5-6.6L23 38l6.5-2.4z" fill="#ffe0b8"/>' +
    '</svg>');

  function initLiveFavicon() {
    const link = document.querySelector('link[rel="icon"]');
    if (!link) return;
    let lit = null;
    state.listeners.push(() => {
      const on = Object.values(state.statuses).some(s => s.live);
      if (on === lit) return;
      lit = on;
      link.href = on ? FAVICON_LIT : FAVICON_COLD;
    });
  }

  /* ---------- shared UI: scroll reveals + count-ups ---------- */
  function initReveals() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (REDUCED || !('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
  }

  function countUp(el) {
    const stat = el.closest && el.closest('.stat');
    if (stat) stat.classList.add('struck');   // the blow that lands the number
    const target = parseInt(el.dataset.count, 10);
    if (REDUCED || isNaN(target)) { el.textContent = el.dataset.count; return; }
    const dur = 1100;
    const t0 = performance.now();
    (function tick(t) {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = String(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  }
  function initCounters() {
    const els = document.querySelectorAll('[data-count]');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(el => el.textContent = el.dataset.count); return; }
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { countUp(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.6 });
    els.forEach(el => io.observe(el));
  }

  /* ---------- boot ---------- */
  document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initNavLiveBadge();
    initLiveFavicon();
    initReveals();
    initCounters();
    if (!REDUCED) { /* embers are page-owned; nothing global */ }
    refreshAvatars();
  });

  /* ---------- public API ---------- */
  window.FF = {
    esc: esc,
    state: state,
    refresh: refresh,
    startPolling: startPolling,
    avatarFor: avatarFor,
    onLiveUpdate: fn => state.listeners.push(fn),
    reduced: REDUCED
  };
})();
