/* ============================================================
   /api/live — Cloudflare Pages Function (Twitch Helix)
   One batched, authenticated call for all channels instead of
   per-channel public-API requests. The front end automatically
   prefers this endpoint and falls back to DecAPI if it's absent,
   so deploying this file is optional but recommended.

   Setup (Cloudflare Pages → Settings → Environment variables):
     TWITCH_CLIENT_ID      from https://dev.twitch.tv/console/apps
     TWITCH_CLIENT_SECRET  same app (create a "client credentials" app)

   GET /api/live?channels=login1,login2,...
   → { streams: { login: { title, game, viewers, uptime } } }
   ============================================================ */

let cachedToken = null; // { token, expiresAt } — reused across warm invocations

async function getAppToken(env) {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) return cachedToken.token;
  const r = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: env.TWITCH_CLIENT_ID,
      client_secret: env.TWITCH_CLIENT_SECRET,
      grant_type: 'client_credentials'
    })
  });
  if (!r.ok) throw new Error('token request failed: ' + r.status);
  const json = await r.json();
  cachedToken = { token: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return cachedToken.token;
}

function uptimeFrom(startedAt) {
  const mins = Math.floor((Date.now() - new Date(startedAt).getTime()) / 60_000);
  const h = Math.floor(mins / 60), m = mins % 60;
  return h > 0 ? `${h} hour${h === 1 ? '' : 's'}, ${m} minute${m === 1 ? '' : 's'}` : `${m} minute${m === 1 ? '' : 's'}`;
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const channels = (url.searchParams.get('channels') || '')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean).slice(0, 100);
  if (!channels.length) {
    return Response.json({ error: 'channels query param required' }, { status: 400 });
  }
  if (!env.TWITCH_CLIENT_ID || !env.TWITCH_CLIENT_SECRET) {
    return Response.json({ error: 'Twitch credentials not configured' }, { status: 503 });
  }

  const token = await getAppToken(env);
  const qs = channels.map(c => 'user_login=' + encodeURIComponent(c)).join('&');
  const r = await fetch('https://api.twitch.tv/helix/streams?first=100&' + qs, {
    headers: { 'client-id': env.TWITCH_CLIENT_ID, authorization: 'Bearer ' + token }
  });
  if (!r.ok) return Response.json({ error: 'helix error ' + r.status }, { status: 502 });
  const { data } = await r.json();

  const streams = {};
  for (const s of data || []) {
    streams[s.user_login.toLowerCase()] = {
      title: s.title,
      game: s.game_name,
      viewers: s.viewer_count,
      uptime: uptimeFrom(s.started_at)
    };
  }
  return Response.json({ streams }, {
    headers: { 'cache-control': 'public, max-age=60' } // one Helix call per minute site-wide
  });
}
