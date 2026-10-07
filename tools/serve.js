// Petit serveur statique pour prévisualiser :  node tools/serve.js [port]
// Se comporte comme GitHub Pages / Netlify : /dossier/ -> /dossier/index.html,
// et toute URL inconnue renvoie 404.html (avec le code 404).
const http = require('http'), fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..'), port = +process.argv[2] || 5200;
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.webp': 'image/webp', '.avif': 'image/avif', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/plain; charset=utf-8', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};
function send(res, code, file) {
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(500); return res.end('error'); }
    res.writeHead(code, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(buf);
  });
}
http.createServer((req, res) => {
  let p;
  try { p = decodeURIComponent(req.url.split('?')[0]); } catch (e) { res.writeHead(400); return res.end(); }
  let f = path.join(root, p);
  if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
  fs.stat(f, (err, st) => {
    if (!err && st.isDirectory()) {
      if (!p.endsWith('/')) { res.writeHead(301, { Location: p + '/' + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '') }); return res.end(); }
      f = path.join(f, 'index.html');
    }
    fs.stat(f, (e2, s2) => {
      if (!e2 && s2.isFile()) return send(res, 200, f);
      const nf = path.join(root, '404.html');
      fs.existsSync(nf) ? send(res, 404, nf) : (res.writeHead(404), res.end('not found'));
    });
  });
}).listen(port, () => console.log('PRINCE SHOP preview on http://localhost:' + port));
