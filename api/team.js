/* /api/team — follower counts (and official avatars) for guild channels.
   GET /api/team?channels=login1,login2,...
   → { members: { login: { followers, avatar, name } } }
   The followers total is available to app tokens; the follower LIST
   is not requested. Cached at the edge for an hour. */
import { getAppToken, helix, parseChannels, hasCreds, lookupUsers } from '../lib/twitch.js';

export default async function handler(req, res) {
  const channels = parseChannels(req, 40);
  if (!channels.length) return res.status(400).json({ error: 'channels query param required' });
  if (!hasCreds()) return res.status(503).json({ error: 'Twitch credentials not configured' });

  try {
    const token = await getAppToken();
    const users = await lookupUsers(channels, token);

    const members = {};
    await Promise.allSettled(Object.entries(users).map(async ([login, u]) => {
      const j = await helix('channels/followers?broadcaster_id=' + u.id + '&first=1', token);
      members[login] = { followers: typeof j.total === 'number' ? j.total : null, avatar: u.avatar, name: u.name };
    }));

    res.setHeader('cache-control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ members });
  } catch (e) {
    return res.status(500).json({ error: String(e.message || e) });
  }
}
