/* ============================================================
   /api/live — Vercel serverless function (Twitch Helix)
   Same contract as functions/api/live.js (the Cloudflare version):
   GET /api/live?channels=login1,login2,...
   → { streams: { login: { title, game, viewers, uptime } } }

   Without TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET env vars set in
   the Vercel dashboard this returns 503 and the front end quietly
   falls back to its public-API path — so deploying it costs nothing.
   ============================================================ */

let cachedToken = null; // reused across warm invocations

async function getAppToken() {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) return cachedToken.token;
  const r = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
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

export default async function handler(req, res) {
  const channels = String(req.query.channels || '')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean).slice(0, 100);
  if (!channels.length) return res.status(400).json({ error: 'channels query param required' });
  if (!process.env.TWITCH_CLIENT_ID || !process.env.TWITCH_CLIENT_SECRET) {
    return res.status(503).json({ error: 'Twitch credentials not configured' });
  }
  try {
    const token = await getAppToken();
    const qs = channels.map(c => 'user_login=' + encodeURIComponent(c)).join('&');
    const r = await fetch('https://api.twitch.tv/helix/streams?first=100&' + qs, {
      headers: { 'client-id': process.env.TWITCH_CLIENT_ID, authorization: 'Bearer ' + token }
    });
    if (!r.ok) return res.status(502).json({ error: 'helix error ' + r.status });
    const { data } = await r.json();
    const streams = {};
    for (const s of data || []) {
      streams[s.user_login.toLowerCase()] = {
        title: s.title, game: s.game_name, viewers: s.viewer_count, uptime: uptimeFrom(s.started_at)
      };
    }
    res.setHeader('cache-control', 'public, s-maxage=60'); // one Helix call per minute site-wide
    return res.status(200).json({ streams });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
