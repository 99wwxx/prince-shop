/* PRINCE SHOP — catalogue : lecture des produits, filtres, tri, recherche, budgets, images */
(function () {
  const PS = (window.PS = window.PS || {});
  const U = PS.util, cfg = PS.CONFIG;

  const cats = PS.CATEGORIES;
  const catById = {};
  cats.forEach((c) => { catById[c.id] = c; });
  const asImg = (x) => (typeof x === 'string' ? { src: x } : x);
  const both = (o) => (o ? (o.fr || '') + ' ' + (o.ar || '') : '');

  cats.forEach((c) => { c.image = c.image ? asImg(c.image) : null; });

  /* ---------- préparation : valeurs par défaut sûres pour chaque produit ---------- */
  function prep(p, i) {
    p.slug = p.id;
    const raw = p.colors && p.colors.length ? p.colors : [{ key: null, images: p.images || [] }];
    p.colors = raw.map((c) => {
      const base = (c.key && PS.COLORS[c.key]) || {};
      return {
        key: c.key || 'unique',
        name: c.name || (c.key ? { fr: base.fr || c.key, ar: base.ar || base.fr || c.key } : null),
        hex: c.hex || base.hex || '#8a8176',
        hex2: c.hex2 || null,
        family: base.family || c.key || 'unique',
        images: (c.images || []).map(asImg),
        unavailable: !!c.unavailable,
        unavailableSizes: (c.unavailableSizes || []).map(String),
      };
    });
    p.hasColors = !(p.colors.length === 1 && p.colors[0].key === 'unique');
    p.sizes = (p.sizes || []).map(String);
    p.unavailableSizes = (p.unavailableSizes || []).map(String);
    p.available = p.available !== false;
    p.price = p.price == null || p.price === '' ? null : Number(p.price);
    p.compareAtPrice = p.compareAtPrice && Number(p.compareAtPrice) > p.price ? Number(p.compareAtPrice) : null;
    p.details = p.details || {};
    p.tags = p.tags || [];
    p.cat = catById[p.category] || { id: p.category, name: { fr: p.category, ar: p.category }, sizeLabel: { fr: 'Taille', ar: 'المقاس' } };
    p.typeName = PS.TYPES[p.type] || null;
    p._i = i;
    p._ts = p.added ? Date.parse(p.added) || 0 : 0;
    p._hay = U.norm([
      both(p.name), both(p.cat.name), both(p.typeName), p.tags.join(' '), p.ref || '',
      p.colors.map((c) => both(c.name)).join(' '), both(PS.GENDERS[p.gender]),
    ].join(' '));
    return p;
  }
  const products = PS.PRODUCTS.map(prep);
  const byId = {};
  products.forEach((p) => { byId[p.id] = p; });

  const C = (PS.catalog = {});
  C.all = () => products;
  C.byId = (id) => byId[id] || null;
  C.category = (id) => catById[id] || null;
  C.inCategory = (id) => products.filter((p) => p.category === id);

  /* catégories / types réellement présents dans le catalogue */
  C.categories = () =>
    cats.map((c) => ({ ...c, count: C.inCategory(c.id).length })).filter((c) => c.count > 0);
  C.types = (catId) => {
    const m = new Map();
    (catId ? C.inCategory(catId) : products).forEach((p) => {
      if (!p.type) return;
      const e = m.get(p.type) || { key: p.type, name: p.typeName || { fr: p.type, ar: p.type }, count: 0, category: p.category };
      e.count++;
      m.set(p.type, e);
    });
    return Array.from(m.values());
  };

  /* ---------- listes ---------- */
  const byDate = (a, b) => b._ts - a._ts || a._i - b._i;
  C.newest = (n) => products.slice().sort(byDate).slice(0, n || 8);
  /* nouveautés = produits marqués badge:'new' ; à défaut, les plus récents */
  C.news = (n) => {
    const m = products.filter((p) => p.badge === 'new').sort(byDate);
    return (m.length ? m : C.newest(n)).slice(0, n || 12);
  };
  C.featured = (n) => products.filter((p) => p.featured).slice(0, n || 8);

  /* suggestions qui ont du sens : 2 du même rayon + 2 pièces pour compléter la tenue */
  const COMPLEMENT = { chaussures: ['sacs', 'accessoires'], sacs: ['accessoires', 'chaussures'], accessoires: ['sacs', 'chaussures'] };
  C.related = (p, n) => {
    n = n || 4;
    const fam = p.colors.map((c) => c.family);
    const ok = (q) => q.id !== p.id && C.purchasable(q);
    const same = products.filter((q) => ok(q) && q.category === p.category)
      .sort((a, b) => (b.type === p.type) - (a.type === p.type) || byDate(a, b)).slice(0, 2);
    const comp = [];
    (COMPLEMENT[p.category] || []).forEach((cid) => {
      const pool = products.filter((q) => ok(q) && q.category === cid)
        .sort((a, b) => b.colors.some((c) => fam.includes(c.family)) - a.colors.some((c) => fam.includes(c.family)) || byDate(a, b));
      if (pool[0]) comp.push(pool[0]);
    });
    const out = same.concat(comp);
    products.forEach((q) => { if (out.length < n && ok(q) && !out.includes(q) && q.category === p.category) out.push(q); });
    return out.slice(0, n);
  };

  /* ---------- disponibilité ---------- */
  C.colorByKey = (p, key) => p.colors.find((c) => c.key === key) || null;
  C.sizeOptions = (p, color) =>
    p.sizes.map((v) => ({ v, ok: !p.unavailableSizes.includes(v) && !(color && color.unavailableSizes.includes(v)) }));
  C.colorOk = (p, c) => !c.unavailable && (!p.sizes.length || C.sizeOptions(p, c).some((s) => s.ok));
  C.purchasable = (p) => p.available && p.colors.some((c) => C.colorOk(p, c));
  /* un produit sans option (ni taille, ni choix de couleur) peut être ajouté d'un seul geste */
  C.needsOptions = (p) => p.sizes.length > 0 || p.colors.length > 1;

  /* ---------- budgets (config.budgets) ---------- */
  C.budgetLabel = (b) => {
    if (b.min == null) return PS.t('budget.under', { b: U.money(b.max) });
    if (b.max == null) return PS.t('budget.over', { a: U.money(b.min) });
    return PS.t('budget.between', { a: U.num(b.min), b: U.money(b.max) });
  };
  C.inBudget = (p, b) => p.price != null && (b.min == null || p.price >= b.min) && (b.max == null || p.price < b.max);
  C.budgets = (list) =>
    (cfg.budgets || []).map((b) => ({
      ...b,
      key: (b.min == null ? 0 : b.min) + '-' + (b.max == null ? '' : b.max),
      count: (list || products).filter((p) => C.inBudget(p, b)).length,
    })).filter((b) => b.count > 0);
  C.budgetByKey = (key) => (cfg.budgets || []).map((b) => ({ ...b, key: (b.min == null ? 0 : b.min) + '-' + (b.max == null ? '' : b.max) })).find((b) => b.key === key) || null;

  /* ---------- facettes : uniquement ce qui existe dans la liste ---------- */
  C.facets = (list) => {
    const types = new Map(), sizes = new Set(), fam = new Map(), gen = new Map();
    let min = Infinity, max = -Infinity;
    list.forEach((p) => {
      if (p.type) {
        const e = types.get(p.type) || { key: p.type, name: p.typeName || { fr: p.type, ar: p.type }, count: 0 };
        e.count++; types.set(p.type, e);
      }
      p.sizes.forEach((s) => sizes.add(s));
      if (p.price != null) { min = Math.min(min, p.price); max = Math.max(max, p.price); }
      if (p.gender && PS.GENDERS[p.gender]) {
        const g = gen.get(p.gender) || { key: p.gender, name: PS.GENDERS[p.gender], count: 0 };
        g.count++; gen.set(p.gender, g);
      }
      if (p.hasColors) {
        const seen = new Set();
        p.colors.forEach((c) => {
          if (seen.has(c.family)) return;
          seen.add(c.family);
          const base = PS.COLORS[c.family] || {};
          const e = fam.get(c.family) || { key: c.family, name: { fr: base.fr || c.family, ar: base.ar || base.fr || c.family }, hex: base.hex || c.hex, count: 0 };
          e.count++; fam.set(c.family, e);
        });
      }
    });
    return {
      types: Array.from(types.values()),
      sizes: Array.from(sizes).sort(U.sizeSort),
      colors: Array.from(fam.values()),
      genders: Array.from(gen.values()),
      price: min === Infinity ? null : { min, max },
      hasUnavailable: list.some((p) => !C.purchasable(p)),
    };
  };

  /* f : { q, types[], sizes[], colors[], genders[], min, max, avail } */
  C.filter = (list, f) => {
    f = f || {};
    let out = list;
    if (f.q) out = C.matchAll(out, f.q).map((r) => r.p);
    if (f.types && f.types.length) out = out.filter((p) => f.types.includes(p.type));
    if (f.genders && f.genders.length) out = out.filter((p) => f.genders.includes(p.gender) || p.gender === 'mixte');
    if (f.min != null) out = out.filter((p) => p.price != null && p.price >= f.min);
    if (f.max != null) out = out.filter((p) => p.price != null && p.price < f.max);
    if (f.sizes && f.sizes.length) out = out.filter((p) => C.sizeOptions(p).some((s) => s.ok && f.sizes.includes(s.v)));
    if (f.colors && f.colors.length) out = out.filter((p) => p.colors.some((c) => f.colors.includes(c.family)));
    if (f.avail) out = out.filter(C.purchasable);
    return out;
  };

  C.sort = (list, key) => {
    const a = list.slice();
    const nul = (x, y) => (x.price == null) - (y.price == null);
    if (key === 'prix-asc') a.sort((x, y) => nul(x, y) || x.price - y.price || x._i - y._i);
    else if (key === 'prix-desc') a.sort((x, y) => nul(x, y) || y.price - x.price || x._i - y._i);
    else a.sort(byDate);
    return a;
  };

  /* ---------- recherche (nom, catégorie, type, couleur, tags — FR + AR) ---------- */
  const stem = (t) => (/^[a-z]/.test(t) && t.length > 3 ? t.replace(/[sx]$/, '') : t.replace(/^ال/, ''));
  const tokens = (q) => U.norm(q).split(/[\s,;،]+/).filter(Boolean).map(stem).filter(Boolean);
  C.matchAll = (list, q) => {
    const t = tokens(q);
    if (!t.length) return list.map((p) => ({ p, score: 0 }));
    const out = [];
    list.forEach((p) => {
      let score = 0;
      const nameN = U.norm(both(p.name));
      for (const w of t) {
        if (!p._hay.includes(w)) return;
        score += nameN.startsWith(w) ? 4 : nameN.includes(w) ? 3 : 1;
      }
      out.push({ p, score });
    });
    return out.sort((a, b) => b.score - a.score || byDate(a.p, b.p));
  };
  C.search = (q) => C.matchAll(products, q).map((r) => r.p);

  /* ---------- noms localisés ---------- */
  C.name = (p) => PS.L(p.name);
  C.typeLabel = (p) => (p.typeName ? PS.L(p.typeName) : PS.L(p.cat.name));
  C.colorName = (c) => (c && c.name ? PS.L(c.name) : '');
  C.sizeLabel = (p) => PS.L(p.cat.sizeLabel);

  /* ======================================================================
     IMAGES
     - photo locale ('assets/…') : servie telle quelle, cadrée en CSS
     - photo de démo Unsplash : recadrée 4:5 autour du produit + tailles adaptées
     ====================================================================== */
  const remote = (im) => /images\.unsplash\.com/.test(im.src);
  const M = (PS.media = {});

  /* ratio = largeur / hauteur (0.8 = 4:5). ratio null = image entière. */
  M.url = (im, w, ratio) => {
    if (!remote(im)) return U.asset(im.src);
    let u = im.src + '?auto=format&q=72&w=' + w;
    if (ratio) u += '&h=' + Math.round(w / ratio) + '&fit=crop&crop=focalpoint&fp-x=' + (im.fx == null ? 0.5 : im.fx) + '&fp-y=' + (im.fy == null ? 0.5 : im.fy) + '&fp-z=' + (im.z || 1);
    else u += '&fit=max';
    return u;
  };

  /* o : { alt, ratio, w, widths, sizes, eager, cls, icon } */
  M.tag = (im, o) => {
    o = o || {};
    if (!im) return `<span class="ph" role="img" aria-label="${U.esc(o.alt || '')}">${PS.icon(o.icon || 'bag', 30)}<small>${U.esc(PS.t('img.soon'))}</small></span>`;
    const ratio = o.ratio === undefined ? 0.8 : o.ratio;
    const w0 = o.w || 640;
    const widths = o.widths || [480, 960];
    const ss = remote(im) ? widths.map((w) => M.url(im, w, ratio) + ' ' + w + 'w').join(', ') : im.srcset || '';
    const h = ratio ? Math.round(w0 / ratio) : Math.round((w0 * (im.h || 5)) / (im.w || 4));
    return `<img src="${U.esc(M.url(im, w0, ratio))}"${ss ? ` srcset="${U.esc(ss)}" sizes="${U.esc(o.sizes || '(min-width:1024px) 25vw, 50vw')}"` : ''} alt="${U.esc(o.alt || '')}" width="${w0}" height="${h}" ${o.eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"${o.cls ? ` class="${o.cls}"` : ''}>`;
  };

  /* images d'un produit pour une couleur (sinon la première couleur qui a des photos) */
  M.list = (p, color) => {
    const c = color || p.colors[0];
    if (c && c.images.length) return c.images;
    const alt = p.colors.find((x) => x.images.length);
    return alt ? alt.images : [];
  };
  M.first = (p, color) => M.list(p, color)[0] || null;
  M.alt = (p, color, i, n) => C.name(p) + (p.hasColors && color ? ' — ' + C.colorName(color) : '') + (n > 1 ? ' (' + (i + 1) + '/' + n + ')' : '');
  M.catIcon = (p) => ({ chaussures: 'shoe', sacs: 'purse', accessoires: 'gem' }[p.category] || 'bag');
  /* URL absolue de la 1re image (partage, données structurées) */
  M.absolute = (p) => {
    const im = M.first(p);
    if (!im) return null;
    const u = M.url(im, 1200, 0.8);
    return /^https?:/.test(u) ? u : location.origin + u;
  };
  /* crédits des photos de démonstration (page « Crédits ») */
  M.credits = () => {
    const m = new Map();
    const add = (im) => { if (im && im.by && remote(im)) m.set(im.by, (m.get(im.by) || 0) + 1); };
    products.forEach((p) => p.colors.forEach((c) => c.images.forEach(add)));
    cats.forEach((c) => add(c.image));
    Object.values(PS.HOME_IMAGES || {}).forEach(add);
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]).map(([name, count]) => ({ name, count }));
  };
})();
