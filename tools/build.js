// Génère les pages statiques du site :   node tools/build.js
//
// À relancer après toute modification de data/ (produits, config, textes).
// Sans dépendance : Node suffit. Le site fonctionne aussi sans ce script en local,
// mais en ligne il apporte :
//   - une vraie page par URL (/produit/…/, /boutique/…/, /ar/…) : liens partagés,
//     aperçu WhatsApp, rechargement de page, bouton « Retour »
//   - titres, descriptions, canonical, hreflang fr/ar et données structurées dans le HTML
//   - un contenu lisible sans JavaScript (moteurs de recherche)
//   - 404.html, sitemap.xml, robots.txt
const fs = require('fs'), path = require('path');
const { loadData, root } = require('./check.js');
const PS = loadData();
const cfg = PS.CONFIG;
const DEMO = !!cfg.DEMO_MODE;
const SITE = (cfg.siteUrl || '').replace(/\/$/, '');
const BASE_PATH = SITE ? new URL(SITE + '/').pathname : '/';

/* ---------- petits utilitaires (mêmes règles que dans le navigateur) ---------- */
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const IDX = { fr: 0, ar: 1 };
const t = (lang) => (key, vars) => {
  const e = PS.STRINGS[key];
  let s = e ? (e[IDX[lang]] == null ? e[0] : e[IDX[lang]]) : key;
  if (vars) s = s.replace(/\{(\w+)(:lower)?\}/g, (m, k, low) => (vars[k] == null ? '' : low ? String(vars[k]).toLowerCase() : vars[k]));
  return s.replace(/\*(.+?)\*/g, '$1');
};
const L = (o, lang) => (o == null ? '' : typeof o === 'string' ? o : o[lang] == null ? o.fr || '' : o[lang]);
const group = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const money = (n, lang) => (n == null ? t(lang)('price.onRequest') : group(n) + ' ' + cfg.currency[lang]);
const prefix = (lang) => (lang === cfg.defaultLang ? '' : '/' + lang);
const norm = (p) => ('/' + String(p).replace(/^\/+|\/+$/g, '')).replace(/\/+/g, '/');
const abs = (p, lang) => { const x = norm(prefix(lang) + norm(p)); return SITE + (x === '/' ? '/' : x + '/'); };
const asImg = (x) => (typeof x === 'string' ? { src: x } : x);
const imgUrl = (im, w) => {
  if (!im) return '';
  if (!/images\.unsplash\.com/.test(im.src)) return /^https?:/.test(im.src) ? im.src : (SITE ? SITE + '/' : BASE_PATH) + im.src.replace(/^\.?\//, '');
  return im.src + '?auto=format&q=72&w=' + w + '&h=' + Math.round(w / 0.8) + '&fit=crop&crop=focalpoint&fp-x=' + (im.fx == null ? 0.5 : im.fx) + '&fp-y=' + (im.fy == null ? 0.5 : im.fy) + '&fp-z=' + (im.z || 1);
};
/* image d'aperçu des liens partagés (WhatsApp, Instagram…) : 1200 × 630, JPEG */
const ogUrl = (im) => {
  if (!im) return '';
  if (!/images\.unsplash\.com/.test(im.src)) { const u = imgUrl(im, 1200); return /^https?:/.test(u) ? u : ''; }
  return im.src + '?fm=jpg&q=75&w=1200&h=630&fit=crop&crop=focalpoint&fp-x=' + (im.fx == null ? 0.5 : im.fx) + '&fp-y=' + (im.fy == null ? 0.5 : im.fy) + '&fp-z=' + (im.z || 1);
};
const HERO = (PS.HOME_IMAGES || {}).hero || null;
const firstImg = (p) => { const c = (p.colors || []).find((x) => x.images && x.images.length); return c ? asImg(c.images[0]) : null; };
const purchasable = (p) => p.available !== false;
const catOf = (p) => PS.CATEGORIES.find((c) => c.id === p.category);
const brandTitle = (lang) => cfg.brand.name + ' ' + L(cfg.brand.city, lang);

/* ---------- pages à générer ---------- */
function pages(lang) {
  const T = t(lang);
  const out = [];
  const cats = PS.CATEGORIES.filter((c) => PS.PRODUCTS.some((p) => p.category === c.id));
  const link = (p, label) => `<a href="${esc(relOrAbs(p, lang))}">${esc(label)}</a>`;
  const productLi = (p) => `<li>${link('/produit/' + p.id, L(p.name, lang))} — ${esc(money(p.price, lang))}</li>`;
  const s = cfg.store;
  const store = {
    '@context': 'https://schema.org', '@type': 'ClothingStore', name: cfg.brand.name, ...(SITE ? { url: abs('/', lang) } : {}),
    telephone: cfg.contact.PHONE_NUMBER,
    address: { '@type': 'PostalAddress', streetAddress: s.address.fr[0], addressLocality: cfg.brand.city.fr, postalCode: s.postalCode, addressCountry: cfg.brand.country },
    geo: { '@type': 'GeoCoordinates', latitude: s.lat, longitude: s.lng }, hasMap: s.mapsUrl, sameAs: [cfg.instagram.url],
    areaServed: { '@type': 'Country', name: 'Maroc' },
  };
  const crumbsLd = (list) => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: list.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, ...(p && SITE ? { item: abs(p, lang) } : {}) })) });
  const contact = `<p>${esc(T('strip.delivery'))}. WhatsApp : <a href="https://wa.me/${cfg.contact.WHATSAPP_NUMBER.replace(/\D/g, '')}">${esc(cfg.contact.WHATSAPP_NUMBER)}</a> · <a href="tel:${esc(cfg.contact.PHONE_NUMBER)}">${esc(cfg.contact.PHONE_NUMBER)}</a> · <a href="${esc(s.mapsUrl)}">${esc(L(s.address, lang).join(', '))}</a></p>`;

  /* accueil */
  out.push({
    path: '/', title: T('seo.homeTitle'), desc: T('seo.homeDesc'), ld: [store], image: ogUrl(HERO),
    body: `<h1>${esc(T('seo.homeTitle'))}</h1><p>${esc(T('hero.text'))}</p>
      <ul>${cats.map((c) => `<li>${link('/boutique/' + c.id, L(c.name, lang))} — ${esc(L(c.blurb, lang))}</li>`).join('')}</ul>
      <h2>${esc(T('home.selection'))}</h2><ul>${PS.PRODUCTS.filter((p) => p.featured).map(productLi).join('')}</ul>${contact}`,
  });
  /* boutique + nouveautés */
  out.push({
    path: '/boutique', title: T('shop.all') + ' — ' + brandTitle(lang), desc: T('seo.homeDesc'), image: ogUrl(HERO),
    ld: [crumbsLd([[T('nav.home'), '/'], [T('nav.shop'), null]])],
    body: `<h1>${esc(T('shop.all'))}</h1><ul>${PS.PRODUCTS.map(productLi).join('')}</ul>${contact}`,
  });
  out.push({
    path: '/nouveautes', title: T('nav.new') + ' — ' + brandTitle(lang), desc: T('seo.homeDesc'), image: ogUrl(HERO),
    ld: [crumbsLd([[T('nav.home'), '/'], [T('nav.new'), null]])],
    body: `<h1>${esc(T('nav.new'))}</h1><ul>${PS.PRODUCTS.filter((p) => p.badge === 'new').map(productLi).join('')}</ul>${contact}`,
  });
  /* catégories */
  cats.forEach((c) => {
    out.push({
      path: '/boutique/' + c.id, title: L(c.name, lang) + ' — ' + brandTitle(lang), image: ogUrl(c.image ? asImg(c.image) : null),
      desc: T('seo.catDesc', { cat: L(c.name, lang), blurb: L(c.blurb, lang), city: L(cfg.brand.city, lang) }),
      ld: [crumbsLd([[T('nav.home'), '/'], [T('nav.shop'), '/boutique'], [L(c.name, lang), null]])],
      body: `<h1>${esc(L(c.name, lang))}</h1><p>${esc(L(c.blurb, lang))}</p><ul>${PS.PRODUCTS.filter((p) => p.category === c.id).map(productLi).join('')}</ul>${contact}`,
    });
  });
  /* produits */
  PS.PRODUCTS.forEach((p) => {
    const c = catOf(p), name = L(p.name, lang), im = firstImg(p);
    const desc = [name + (p.price != null ? ' — ' + money(p.price, lang) : ''), L(p.description, lang), T('seo.tail')].filter(Boolean).join(' ');
    const out0 = !purchasable(p);
    const img = im ? imgUrl(im, 1200) : '';
    out.push({
      path: '/produit/' + p.id, type: 'product',
      title: `${name} — ${L(c.name, lang)} | ${brandTitle(lang)}`,
      desc: desc.length > 160 ? desc.slice(0, 157) + '…' : desc,
      image: ogUrl(im),
      ld: [
        { '@context': 'https://schema.org', '@type': 'Product', name, description: L(p.description, lang), sku: p.ref || p.id, category: L(c.name, lang),
          ...(img && !DEMO && /^https?:/.test(img) ? { image: [img] } : {}),
          ...(p.price != null ? { offers: { '@type': 'Offer', priceCurrency: cfg.currency.iso, price: String(p.price), availability: 'https://schema.org/' + (out0 ? 'OutOfStock' : 'InStock'), ...(SITE ? { url: abs('/produit/' + p.id, lang) } : {}), seller: { '@type': 'Organization', name: cfg.brand.name } } } : {}) },
        crumbsLd([[T('nav.home'), '/'], [L(c.name, lang), '/boutique/' + c.id], [name, null]]),
      ],
      body: `<p>${link('/boutique/' + c.id, L(c.name, lang))}</p><h1>${esc(name)}</h1><p><strong>${esc(money(p.price, lang))}</strong></p>
        ${im ? `<img src="${esc(imgUrl(im, 640))}" alt="${esc(name)}" width="640" height="800">` : ''}
        <p>${esc(L(p.description, lang))}</p><ul>${((p.details || {})[lang] || (p.details || {}).fr || []).map((d) => `<li>${esc(d)}</li>`).join('')}</ul>${contact}`,
    });
  });
  /* pages d'information */
  Object.keys(PS.LEGAL).forEach((k) => {
    if (k === 'credits') return;   // dépend du navigateur ; rendue par le site lui-même
    const d = PS.LEGAL[k]();
    out.push({
      path: '/infos/' + k, title: L(d.title, lang) + ' — ' + brandTitle(lang), desc: L(d.intro, lang), noindex: d.status === 'draft',
      body: `<h1>${esc(L(d.title, lang))}</h1><p>${esc(L(d.intro, lang))}</p>${d.sections.map((sec) => `<h2>${esc(L(sec.h, lang))}</h2>${(L(sec.p, lang) || []).map((x) => `<p>${esc(x)}</p>`).join('')}`).join('')}`,
    });
  });
  return out;
}

/* lien interne : relatif à la racine du site ; {{ROOT}} est remplacé au rendu selon la profondeur de la page */
function relOrAbs(p, lang) {
  const x = norm(prefix(lang) + norm(p));
  return '{{ROOT}}' + (x === '/' ? '' : x.slice(1) + '/');
}

/* ---------- gabarit ---------- */
const tpl = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const between = (html, tag, content) => {
  const a = '<!--ps:' + tag + '-->', b = '<!--/ps:' + tag + '-->';
  const i = html.indexOf(a), j = html.indexOf(b);
  if (i < 0 || j < 0) throw new Error('repère manquant dans index.html : ' + tag);
  return html.slice(0, i + a.length) + '\n' + content + '\n' + html.slice(j);
};

function render(page, lang, rootRel) {
  const T = t(lang);
  const robots = DEMO || page.noindex ? 'noindex, follow' : 'index, follow';
  const head = [
    `<title>${esc(page.title)}</title>`,
    `<meta name="description" content="${esc(page.desc)}">`,
    `<meta name="robots" content="${robots}">`,
    SITE ? `<link rel="canonical" href="${esc(abs(page.path, lang))}">` : '',
    ...(SITE ? cfg.languages.map((l) => `<link rel="alternate" hreflang="${l}" href="${esc(abs(page.path, l))}">`) : []),
    SITE ? `<link rel="alternate" hreflang="x-default" href="${esc(abs(page.path, cfg.defaultLang))}">` : '',
    `<meta property="og:type" content="${page.type === 'product' ? 'product' : 'website'}">`,
    `<meta property="og:site_name" content="${esc(cfg.brand.name)}">`,
    `<meta property="og:title" content="${esc(page.title)}">`,
    `<meta property="og:description" content="${esc(page.desc)}">`,
    `<meta property="og:locale" content="${lang === 'ar' ? 'ar_MA' : 'fr_MA'}">`,
    SITE ? `<meta property="og:url" content="${esc(abs(page.path, lang))}">` : '',
    page.image ? `<meta property="og:image" content="${esc(page.image)}">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta name="twitter:card" content="summary_large_image">` : '',
    ...(page.ld || []).map((o) => `<script type="application/ld+json" data-ps-ld>${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`),
    lang === 'ar' ? '<link id="font-ar" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap">' : '',
  ].filter(Boolean).join('\n');
  let html = between(tpl, 'head', head);
  html = between(html, 'static', `    <div class="wrap static">${page.body.replace(/\{\{ROOT\}\}/g, rootRel)}</div>`);
  html = html.replace(/<html lang="[^"]*" dir="[^"]*" data-root="[^"]*">/, `<html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}" data-root="${rootRel}">`);
  html = html.replace(/(href|src)="\.\//g, `$1="${rootRel}`);
  html = html.replace(/<a class="skip" href="#main">[^<]*<\/a>/, `<a class="skip" href="#main">${esc(T('a11y.skip'))}</a>`);
  return html;
}

/* ---------- écriture ---------- */
['boutique', 'produit', 'nouveautes', 'infos', ...cfg.languages.filter((l) => l !== cfg.defaultLang)].forEach((d) => {
  fs.rmSync(path.join(root, d), { recursive: true, force: true });   // dossiers 100 % générés
});
let count = 0;
const urls = [];
cfg.languages.forEach((lang) => {
  pages(lang).forEach((page) => {
    const full = norm(prefix(lang) + norm(page.path));
    const depth = full === '/' ? 0 : full.split('/').length - 1;
    const rootRel = depth === 0 ? './' : '../'.repeat(depth);
    const html = render(page, lang, rootRel);
    const dir = path.join(root, full);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    count++;
    if (!page.noindex) urls.push({ loc: abs(page.path, lang), alts: cfg.languages.map((l) => [l, abs(page.path, l)]) });
  });
});

/* 404.html : la coquille du site, avec des chemins absolus (elle peut être servie à n'importe quelle profondeur) */
const nf = { path: '/', title: t('fr')('nf.title') + ' — ' + brandTitle('fr'), desc: t('fr')('nf.text'), noindex: true,
  body: `<h1>${esc(t('fr')('nf.title'))}</h1><p>${esc(t('fr')('nf.text'))}</p><p><a href="${BASE_PATH}">${esc(cfg.brand.name)}</a></p>` };
fs.writeFileSync(path.join(root, '404.html'), render(nf, 'fr', BASE_PATH).replace(/<link rel="canonical"[^>]*>\n?/, '').replace(/<link rel="alternate"[^>]*>\n?/g, ''));

/* robots + sitemap */
if (DEMO) {
  fs.writeFileSync(path.join(root, 'robots.txt'), '# Mode démo : le site ne doit pas être indexé.\nUser-agent: *\nDisallow: /\n');
  fs.rmSync(path.join(root, 'sitemap.xml'), { force: true });
} else {
  fs.writeFileSync(path.join(root, 'robots.txt'), 'User-agent: *\nAllow: /\n' + (SITE ? 'Sitemap: ' + SITE + '/sitemap.xml\n' : ''));
  if (SITE) {
    fs.writeFileSync(path.join(root, 'sitemap.xml'),
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' +
      urls.map((u) => `  <url><loc>${esc(u.loc)}</loc>${u.alts.map(([l, h]) => `<xhtml:link rel="alternate" hreflang="${l}" href="${esc(h)}"/>`).join('')}</url>`).join('\n') + '\n</urlset>\n');
  }
}
fs.writeFileSync(path.join(root, '.nojekyll'), '');

console.log('\nPRINCE SHOP — pages générées : ' + count + ' (' + cfg.languages.join(' + ') + ') + 404.html + robots.txt' + (!DEMO && SITE ? ' + sitemap.xml' : ''));
if (DEMO) console.log('  Mode démo : pages en noindex, robots.txt bloque l\'indexation.');
if (!SITE) console.log('  siteUrl est vide dans data/config.js : pas de canonical / hreflang / sitemap (à renseigner avant la mise en ligne).');
console.log('');
