/* Shared Twitch Helix helpers for the serverless functions. */

let cachedToken = null; // reused across warm invocations of the same function

export async function getAppToken() {
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

export async function helix(path, token) {
  const r = await fetch('https://api.twitch.tv/helix/' + path, {
    headers: { 'client-id': process.env.TWITCH_CLIENT_ID, authorization: 'Bearer ' + token }
  });
  if (!r.ok) throw new Error('helix ' + path.split('?')[0] + ' failed: ' + r.status);
  return r.json();
}

export function parseChannels(req, max = 100) {
  return String(req.query.channels || '')
    .split(',').map(s => s.trim().toLowerCase()).filter(Boolean).slice(0, max);
}

export function hasCreds() {
  return !!(process.env.TWITCH_CLIENT_ID && process.env.TWITCH_CLIENT_SECRET);
}

// login -> { id, name, avatar } for up to 100 logins in one call
export async function lookupUsers(logins, token) {
  const qs = logins.map(l => 'login=' + encodeURIComponent(l)).join('&');
  const { data } = await helix('users?' + qs, token);
  const users = {};
  for (const u of data || []) {
    users[u.login.toLowerCase()] = { id: u.id, name: u.display_name, avatar: u.profile_image_url };
  }
  return users;
}
