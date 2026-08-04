/* Tiny zero-dependency static server for local development.
   Run: node server.js   →  http://localhost:8137
   (Serving over HTTP instead of file:// lets the Twitch player embed work,
   since Twitch accepts "localhost" as a parent domain.) */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 8137;
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon', '.webp': 'image/webp', '.txt': 'text/plain'
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/index.html';
  if (urlPath.startsWith('/api/')) {
    // The real /api/live handler runs as a serverless function in production
    // (see functions/api/live.js). Locally we 404 so the front end falls back
    // to its public-API path.
    res.writeHead(404, { 'content-type': 'application/json' });
    return res.end('{"error":"api not available in local dev"}');
  }
  const filePath = path.join(ROOT, path.normalize(urlPath));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404, { 'content-type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, { 'content-type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log('Forge & Fable dev server → http://localhost:' + PORT));
