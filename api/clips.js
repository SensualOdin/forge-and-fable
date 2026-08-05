/* /api/clips — top Twitch clips across the guild from the last 7 days.
   GET /api/clips?channels=login1,login2,...
   → { clips: [{ title, url, embed_url, thumbnail, broadcaster, login,
                 views, game, duration, created_at }] }
   Cached at the edge for an hour, so the whole site costs ~30 Helix
   calls per hour no matter how many visitors. */
import { getAppToken, helix, parseChannels, hasCreds, lookupUsers } from '../lib/twitch.js';

const PER_CHANNEL = 3;   // clips fetched per member
const TOP = 12;          // clips returned overall
const MAX_PER_MEMBER = 2; // keep the shelf varied

export default async function handler(req, res) {
  const channels = parseChannels(req, 40);
  if (!channels.length) return res.status(400).json({ error: 'channels query param required' });
  if (!hasCreds()) return res.status(503).json({ error: 'Twitch credentials not configured' });

  try {
    const token = await getAppToken();
    const users = await lookupUsers(channels, token);
    const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();

    const results = await Promise.allSettled(Object.entries(users).map(async ([login, u]) => {
      const { data } = await helix('clips?broadcaster_id=' + u.id + '&first=' + PER_CHANNEL +
        '&started_at=' + encodeURIComponent(since), token);
      return (data || []).map(c => ({
        title: c.title, url: c.url, embed_url: c.embed_url,
        thumbnail: c.thumbnail_url, broadcaster: u.name, login,
        views: c.view_count, game_id: c.game_id, duration: c.duration, created_at: c.created_at
      }));
    }));

    let clips = results.filter(r => r.status === 'fulfilled').flatMap(r => r.value)
      .sort((a, b) => b.views - a.views);

    // cap per member so one viral channel doesn't own the shelf
    const perMember = {};
    clips = clips.filter(c => (perMember[c.login] = (perMember[c.login] || 0) + 1) <= MAX_PER_MEMBER)
      .slice(0, TOP);

    // resolve game names in one call
    const gameIds = [...new Set(clips.map(c => c.game_id).filter(Boolean))];
    if (gameIds.length) {
      const { data } = await helix('games?' + gameIds.map(id => 'id=' + id).join('&'), token);
      const games = Object.fromEntries((data || []).map(g => [g.id, g.name]));
      clips.forEach(c => { c.game = games[c.game_id] || null; delete c.game_id; });
    } else {
      clips.forEach(c => { c.game = null; delete c.game_id; });
    }

    res.setHeader('cache-control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ clips });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
