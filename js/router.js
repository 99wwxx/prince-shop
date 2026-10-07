/* PRINCE SHOP — routeur
   - En ligne (http/https) : vraies URLs propres   /produit/mocassin-elegance/
                              arabe sous /ar/       /ar/produit/mocassin-elegance/
   - Ouvert depuis un fichier (file://) : mêmes routes derrière un #
   Les panneaux (panier, recherche, filtres…) utilisent l'historique :
   le bouton « Retour » du téléphone les ferme au lieu de quitter la page. */
(function () {
  const PS = (window.PS = window.PS || {});
  const U = PS.util, cfg = PS.CONFIG;
  const R = (PS.router = {});
  const BASE = U.BASE;
  const routes = [];
  let current = null;
  let first = true;

  const norm = (p) => ('/' + String(p).replace(/^\/+|\/+$/g, '')).replace(/\/+/g, '/');
  const qs = (q) => {
    if (!q) return '';
    const s = typeof q === 'string' ? q.replace(/^\?/, '') : new URLSearchParams(q).toString();
    return s ? '?' + s : '';
  };

  R.add = (pattern, name) => {
    const keys = [];
    const re = new RegExp('^' + pattern.replace(/:([a-z]+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '$');
    routes.push({ re, keys, name });
  };

  /* URL courante → { path, query, lang } (la langue est le 1er segment si c'est /ar) */
  R.parse = () => {
    let path, query;
    if (U.fileMode) {
      const h = location.hash.replace(/^#/, '') || '/';
      const i = h.indexOf('?');
      path = i < 0 ? h : h.slice(0, i);
      query = new URLSearchParams(i < 0 ? '' : h.slice(i));
    } else {
      path = location.pathname;
      if (path.startsWith(BASE)) path = '/' + path.slice(BASE.length);
      path = path.replace(/\/(index|404)\.html$/, '/');
      query = new URLSearchParams(location.search);
    }
    path = norm(path);
    let lang = cfg.defaultLang;
    const m = /^\/([a-z]{2})(\/|$)/.exec(path);
    if (m && m[1] !== cfg.defaultLang && PS.isLang(m[1])) { lang = m[1]; path = norm(path.slice(3)); }
    return { path, query, lang };
  };

  function match(path) {
    for (const r of routes) {
      const m = r.re.exec(path);
      if (m) {
        const params = {};
        r.keys.forEach((k, i) => { try { params[k] = decodeURIComponent(m[i + 1]); } catch (e) { params[k] = m[i + 1]; } });
        return { name: r.name, params };
      }
    }
    return { name: 'notfound', params: {} };
  }

  const prefix = (lang) => { const l = lang || PS.lang; return l === cfg.defaultLang ? '' : '/' + l; };

  /* URL d'un lien interne (dans la langue courante, ou celle demandée) */
  R.href = (path, query, lang) => {
    const p = norm(prefix(lang) + norm(path));
    if (U.fileMode) return '#' + p + qs(query);
    return BASE + (p === '/' ? '' : p.slice(1) + '/') + qs(query);
  };
  /* attributs d'un <a> interne : href réel + cible lue par le routeur */
  R.a = (path, query) => `href="${U.esc(R.href(path, query))}" data-to="${U.esc(norm(path) + qs(query))}"`;
  /* URL absolue (canonical, partage) */
  R.url = (path, query, lang) => {
    const p = norm(prefix(lang) + norm(path));
    return U.siteUrl() + (p === '/' ? '/' : p + '/') + qs(query);
  };
  R.current = () => current;

  function urlFor(to) {
    const i = to.indexOf('?');
    return R.href(i < 0 ? to : to.slice(0, i), i < 0 ? '' : to.slice(i));
  }

  /* navigation. opts : { replace, keepScroll, scrollTo } */
  let pending = null;
  R.go = (to, opts) => {
    opts = opts || {};
    const url = urlFor(to);
    const depth = PS.ui ? PS.ui.overlay.depth() : 0;
    const replace = !!opts.replace;
    if (depth > 0) {
      /* un lien cliqué dans un panneau : on dépile d'abord les entrées des panneaux,
         puis on navigue — l'historique reste propre (pas de « Retour » dans le vide) */
      if ((history.state || {}).ov === depth) {
        pending = { to, opts };
        history.go(-depth);
        setTimeout(() => { if (pending) { const p = pending; pending = null; PS.ui.overlay.closeAll(); R.go(p.to, p.opts); } }, 400);
        return;
      }
      PS.ui.overlay.closeAll();
    }
    try {
      if (!replace) history.replaceState({ ...(history.state || {}), y: window.scrollY }, '');
      history[replace ? 'replaceState' : 'pushState']({ ov: 0, y: 0 }, '', url);
    } catch (e) {
      if (U.fileMode) location.hash = url.replace(/^#/, ''); else location.href = url;
      return;
    }
    render(opts);
  };

  /* met à jour la query de la page courante sans recharger (filtres, couleur choisie…) */
  R.setQuery = (q) => {
    const c = current || R.parse();
    try { history.replaceState({ ...(history.state || {}) }, '', R.href(c.path, q)); } catch (e) { /* noop */ }
    current = { ...c, query: new URLSearchParams(qs(q)) };
  };

  /* change de langue en restant sur la même page */
  R.switchLang = (lang) => {
    if (!PS.isLang(lang) || lang === PS.lang) return;
    PS.saveLang(lang);
    PS.applyLang(lang);
    const c = current || R.parse();
    try { history.replaceState({ ...(history.state || {}) }, '', R.href(c.path, c.query.toString())); } catch (e) { /* noop */ }
    document.dispatchEvent(new CustomEvent('ps:lang'));
    render({ instant: true, keepScroll: true, lang: true });
  };

  function render(opts) {
    opts = opts || {};
    const loc = R.parse();
    const m = match(loc.path);
    const prev = current;
    current = { path: loc.path, query: loc.query, name: m.name, params: m.params };
    const view = PS.views && PS.views[m.name];
    if (!view) return;
    const swap = () => {
      PS.views.render(view(m.params, loc.query, current), { first, opts });
      first = false;
    };
    if (first || opts.instant || U.reduceMotion() || !prev) swap();
    else {
      const main = document.getElementById('main');
      main.classList.add('is-out');
      setTimeout(() => { swap(); main.classList.remove('is-out'); }, 130);
    }
  }
  R.render = render;

  /* au démarrage : la langue choisie par le visiteur prime sur celle de l'URL */
  R.start = () => {
    const loc = R.parse();
    const lang = PS.storedLang() || loc.lang;
    PS.applyLang(lang);
    /* page (re)chargée : aucun panneau n'est ouvert, même si l'entrée d'historique restaurée dit le contraire */
    try { history.replaceState({ ...(history.state || {}), ov: 0 }, '', lang !== loc.lang ? R.href(loc.path, loc.query.toString()) : location.href); } catch (e) { /* noop */ }
  };

  /* ---------- événements ---------- */
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[data-to]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    e.preventDefault();
    const to = a.getAttribute('data-to'), sc = a.getAttribute('data-scroll');
    const samePage = current && norm(to.split('?')[0]) === current.path && to.indexOf('?') < 0 && !current.query.toString();
    if (samePage) {
      /* déjà sur la page : on ferme les panneaux et on défile, sans tout redessiner */
      const go = () => {
        const el = sc && document.getElementById(sc);
        if (el) el.scrollIntoView({ behavior: U.reduceMotion() ? 'auto' : 'smooth' });
        else window.scrollTo({ top: 0, behavior: U.reduceMotion() ? 'auto' : 'smooth' });
      };
      if (PS.ui && PS.ui.overlay.depth()) { PS.ui.overlay.closeTop(); setTimeout(go, 80); } else go();
      return;
    }
    R.go(to, { scrollTo: sc });
  });

  window.addEventListener('popstate', () => {
    const st = history.state || {};
    const before = PS.ui ? PS.ui.overlay.depth() : 0;
    /* entrée laissée par un panneau qui n'existe plus (page rechargée entre-temps) : on la saute */
    if ((st.ov || 0) > before && !pending) { history.back(); return; }
    if (PS.ui) PS.ui.overlay.syncTo(st.ov || 0);
    if (pending) { const p = pending; pending = null; R.go(p.to, p.opts); return; }
    const loc = R.parse();
    /* ce « Retour » n'a fait que fermer un panneau : la page garde son état (filtres, couleur…)
       et on remet son URL à jour, car l'entrée d'historique retrouvée date d'avant ces choix */
    if (before > (st.ov || 0) && current && loc.path === current.path) {
      try { history.replaceState(st, '', R.href(current.path, current.query.toString())); } catch (e) { /* noop */ }
      return;
    }
    if (loc.lang !== PS.lang) {
      try { history.replaceState(st, '', R.href(loc.path, loc.query.toString())); } catch (e) { /* noop */ }
    }
    const key = loc.path + '?' + loc.query.toString();
    const cur = current ? current.path + '?' + current.query.toString() : null;
    if (key !== cur) render({ restoreY: st.y || 0 });
  });

  try { history.scrollRestoration = 'manual'; } catch (e) { /* noop */ }
})();
