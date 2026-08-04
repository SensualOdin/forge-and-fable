# Forge & Fable — Stream Team Site

Two-page site for the Forge & Fable Twitch stream team: a home page with the
full guild roster, and a live page that shows who is broadcasting right now.

## Run it locally

```bash
node server.js
```

Then open http://localhost:8137. Serving over HTTP (instead of double-clicking
the HTML file) makes the embedded Twitch players work — Twitch accepts
`localhost` as a parent domain. Opening `index.html` directly from disk still
works: live detection keeps running and live channels show preview cards
instead of players.

## Project layout

| Path | What it is |
| --- | --- |
| `index.html` | Home: hero, guild stats, the tale, searchable roster |
| `live.html` | Live page: real-time who's-live grid with players |
| `data/roster.js` | **Single source of truth** for all members — edit here only |
| `js/ff-core.js` | Live-status engine, avatar cache, shared UI behavior |
| `css/ff.css` | The design system (one stylesheet for every page) |
| `functions/api/live.js` | Optional serverless Twitch Helix endpoint |
| `assets/` | Favicon, social-card image, apple touch icon |

## How live detection works

1. The front end first tries `GET /api/live?channels=...` on its own origin —
   one batched, authenticated Twitch **Helix** call handled by
   `functions/api/live.js` (cached 60s, so the whole site costs ~1 API call
   per minute no matter how many visitors).
2. If that endpoint doesn't exist (local dev, plain static hosting), it falls
   back to [DecAPI](https://decapi.me) — a public, CORS-enabled Twitch proxy
   that needs no key. Checks are chunked politely and only live channels get
   the extra title/game/viewer lookups.

Either way: **no hidden iframes, no fake refresh buttons.** The refresh button
re-runs a real check; "last checked" is stamped only when a check completes.
Status re-polls every 3 minutes while the tab is visible.

Avatars are also refreshed from the live API and cached in `localStorage` for
24h, so the hardcoded fallback URLs in `roster.js` can go stale harmlessly.

## Editing the roster

Everything about a member lives in one object in `data/roster.js`:

```js
{name:'WillyLo', channel:'willylo', team:'F&F', country:'Canada', flag:'🇨🇦',
 cats:['rpg','survival'], games:['RPGs','Survival Crafting'],
 about:'Streaming 5+ years…', img:'(fallback avatar url)',
 youtube:'https://…' }
```

- `channel: null` = member without a Twitch channel (shown on the roster,
  skipped by the live checker).
- Categories/sigils are defined at the top of the same file.
- Both pages, the stats band, the filters, and the live checker all derive
  from this list — nothing is duplicated anywhere.

## Deploying (recommended: Cloudflare Pages)

1. Push this folder to a Git repo and connect it to Cloudflare Pages
   (framework preset: none, build command: none, output dir: `/`).
2. The `functions/` directory is picked up automatically. Add environment
   variables `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET`
   (create an app at https://dev.twitch.tv/console/apps).
3. After deploy, update the `og:image` / canonical URLs in both HTML heads to
   absolute URLs on your domain (social scrapers need absolute paths).

Netlify works too — move the handler logic into `netlify/functions/live.js`
(same fetch calls, Netlify's handler signature). Any plain static host (GitHub
Pages, etc.) also works — the site just uses the DecAPI fallback there.
