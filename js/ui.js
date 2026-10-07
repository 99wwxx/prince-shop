/* PRINCE SHOP — briques d'interface : panneaux accessibles, toast, <head>, carte produit */
(function () {
  const PS = (window.PS = window.PS || {});
  const U = PS.util, cfg = PS.CONFIG, icon = PS.icon, t = PS.t;
  const UI = (PS.ui = {});

  /* ======================================================================
     Annonces lecteur d'écran + toast
     ====================================================================== */
  let liveEl, toastEl, toastTimer;
  UI.live = (msg) => {
    liveEl = liveEl || document.getElementById('live');
    if (!liveEl) return;
    liveEl.textContent = '';
    setTimeout(() => { liveEl.textContent = msg; }, 40);
  };

  /* action : { label, act } → bouton data-act */
  UI.toast = (msg, action, ms) => {
    toastEl = toastEl || document.getElementById('toast');
    if (!toastEl) return;
    clearTimeout(toastTimer);
    toastEl.innerHTML = `<span class="toast__msg">${U.esc(msg)}</span>${action ? `<button type="button" class="toast__act" data-act="${U.esc(action.act)}">${U.esc(action.label)}</button>` : ''}`;
    toastEl.classList.add('is-on');
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), ms || 4200);
  };
  UI.hideToast = () => { if (toastEl) toastEl.classList.remove('is-on'); };

  /* ======================================================================
     <head> : titre, description, canonical, langues, partage, JSON-LD
     ====================================================================== */
  function meta(sel, attr, val) {
    let el = document.head.querySelector(sel);
    if (!el) {
      el = document.createElement(sel.startsWith('link') ? 'link' : 'meta');
      sel.replace(/\[([\w:]+)="([^"]+)"\]/g, (m, k, v) => { el.setAttribute(k, v); return m; });
      document.head.appendChild(el);
    }
    el.setAttribute(attr, val);
  }
  /* h : { title, description, path, noindex, ogType, image, jsonld[] } */
  UI.setHead = (h) => {
    const R = PS.router;
    document.title = h.title;
    const canonical = h.path ? R.url(h.path) : location.href.split('#')[0].split('?')[0];
    meta('meta[name="description"]', 'content', h.description || '');
    meta('link[rel="canonical"]', 'href', canonical);
    meta('meta[name="robots"]', 'content', cfg.DEMO_MODE || h.noindex ? 'noindex, follow' : 'index, follow');
    meta('meta[property="og:title"]', 'content', h.title);
    meta('meta[property="og:description"]', 'content', h.description || '');
    meta('meta[property="og:url"]', 'content', canonical);
    meta('meta[property="og:type"]', 'content', h.ogType || 'website');
    meta('meta[property="og:locale"]', 'content', PS.lang === 'ar' ? 'ar_MA' : 'fr_MA');
    if (h.image) meta('meta[property="og:image"]', 'content', h.image);
    if (h.path) {
      cfg.languages.forEach((l) => meta(`link[rel="alternate"][hreflang="${l}"]`, 'href', R.url(h.path, '', l)));
      meta('link[rel="alternate"][hreflang="x-default"]', 'href', R.url(h.path, '', cfg.defaultLang));
    }
    document.head.querySelectorAll('script[data-ps-ld]').forEach((s) => s.remove());
    (h.jsonld || []).forEach((obj) => {
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.setAttribute('data-ps-ld', '');
      s.textContent = JSON.stringify(obj);
      document.head.appendChild(s);
    });
  };

  /* ======================================================================
     Panneaux (panier, recherche, menu, filtres, fiche rapide…)
     - une entrée d'historique par panneau : « Retour » le ferme
     - le reste de la page est inerte ; le focus est piégé puis rendu
     ====================================================================== */
  const stack = [];
  const O = (UI.overlay = {});
  let root;

  const siteEls = () => ['site', 'bnav', 'added'].map((id) => document.getElementById(id)).filter(Boolean);
  function setInert(el, on) {
    if (!el) return;
    if (on) el.setAttribute('inert', ''); else el.removeAttribute('inert');
  }
  function refreshInert() {
    const real = stack.filter((r) => !r.virtual);
    siteEls().forEach((el) => setInert(el, real.length > 0));
    real.forEach((r, i) => setInert(r.el, i < real.length - 1));
    document.documentElement.classList.toggle('ov-open', real.length > 0);
  }
  function pushEntry() {
    try {
      history.pushState({ ...(history.state || {}), ov: stack.length + 1 }, '');
      return true;
    } catch (e) { return false; }
  }

  O.depth = () => stack.length;
  O.top = () => stack[stack.length - 1] || null;
  O.get = (name) => stack.find((r) => r.name === name) || null;
  O.has = (name) => !!O.get(name);

  /* o : { type:'drawer'|'start'|'sheet'|'full'|'modal'|'top'|'light', label, html, onOpen, onClose, initialFocus, virtual } */
  O.open = (name, o) => {
    if (O.has(name)) return O.get(name);
    root = root || document.getElementById('ov-root');
    const rec = { name, opener: document.activeElement, onClose: o.onClose, virtual: !!o.virtual };
    if (!o.virtual) {
      const el = document.createElement('div');
      el.className = 'ov ov--' + (o.type || 'sheet') + ' ov--' + name;
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-modal', 'true');
      el.setAttribute('aria-label', o.label || name);
      el.innerHTML = `<div class="ov__scrim" data-act="close-overlay"></div><div class="ov__panel" tabindex="-1">${o.html}</div>`;
      root.appendChild(el);
      rec.el = el;
      rec.panel = el.querySelector('.ov__panel');
    }
    rec.entry = pushEntry();
    stack.push(rec);
    if (!o.virtual) {
      refreshInert();
      UI.hideToast();
      // deux frames : le navigateur peint l'état fermé avant de lancer la transition
      requestAnimationFrame(() => requestAnimationFrame(() => {
        rec.el.classList.add('is-open');
        const target = (o.initialFocus && rec.panel.querySelector(o.initialFocus)) || rec.panel;
        try { target.focus({ preventScroll: true }); } catch (e) { /* noop */ }
      }));
      if (o.onOpen) o.onOpen(rec);
    }
    return rec;
  };

  /* remplace le contenu d'un panneau en gardant le défilement et, si possible, le focus */
  O.update = (name, html, opts) => {
    const rec = O.get(name);
    if (!rec || !rec.panel) return;
    opts = opts || {};
    const a = document.activeElement;
    const fk = a && rec.panel.contains(a) && a.getAttribute('data-fk');
    const sc = rec.panel.querySelector('.ov__scroll');
    const st = sc && !opts.resetScroll ? sc.scrollTop : 0;
    rec.panel.innerHTML = html;
    const ns = rec.panel.querySelector('.ov__scroll');
    if (ns) ns.scrollTop = st;
    let target = null;
    if (opts.focus) target = rec.panel.querySelector(opts.focus);
    if (!target && fk) target = rec.panel.querySelector('[data-fk="' + fk + '"]');
    try { (target || rec.panel).focus({ preventScroll: true }); } catch (e) { /* noop */ }
  };

  function finish(rec) {
    const i = stack.indexOf(rec);
    if (i < 0) return;
    stack.splice(i, 1);
    if (rec.el) {
      rec.el.classList.remove('is-open');
      rec.el.classList.add('is-closing');
      const el = rec.el;
      setTimeout(() => el.remove(), U.reduceMotion() ? 0 : 400);
    }
    refreshInert();
    const top = stack.filter((r) => !r.virtual).pop();
    if (top && top.panel) { try { top.panel.focus({ preventScroll: true }); } catch (e) { /* noop */ } }
    else if (!rec.virtual && rec.opener && document.contains(rec.opener)) {
      try { rec.opener.focus({ preventScroll: true }); } catch (e) { /* noop */ }
    }
    if (rec.onClose) rec.onClose();
  }

  /* ferme le panneau du dessus (via l'historique quand c'est possible) */
  O.closeTop = () => {
    const rec = O.top();
    if (!rec) return;
    if (rec.entry && (history.state || {}).ov === stack.length) history.back();
    else finish(rec);
  };
  O.close = (name) => {
    const rec = O.get(name);
    if (!rec) return;
    if (rec === O.top()) O.closeTop(); else finish(rec);
  };
  /* ferme n niveaux d'un coup en gardant l'historique propre */
  O.pop = (n) => {
    n = Math.min(n, stack.length);
    if (n < 1) return;
    const synced = stack.slice(-n).every((r) => r.entry) && (history.state || {}).ov === stack.length;
    if (synced) history.go(-n);
    else for (let i = 0; i < n; i++) finish(stack[stack.length - 1]);
  };
  /* bouton ✕ / Échap : ferme le panneau visible, y compris ses étapes internes */
  O.closePanel = () => {
    let k = 0;
    for (let i = stack.length - 1; i >= 0; i--) { k++; if (!stack[i].virtual) break; }
    O.pop(k);
  };
  O.popAll = () => O.pop(stack.length);
  /* ferme tout sans toucher à l'historique (juste avant une navigation) */
  O.closeAll = () => { while (stack.length) finish(stack[stack.length - 1]); };
  /* appelé par le routeur sur « Retour » */
  O.syncTo = (n) => { while (stack.length > n) finish(stack[stack.length - 1]); };

  document.addEventListener('keydown', (e) => {
    const rec = stack.filter((r) => !r.virtual).pop();
    if (!rec) return;
    if (e.key === 'Escape') { e.preventDefault(); O.closePanel(); return; }
    if (e.key === 'Tab') {
      const f = U.focusables(rec.panel);
      if (!f.length) { e.preventDefault(); rec.panel.focus(); return; }
      const firstEl = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === firstEl || document.activeElement === rec.panel)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); firstEl.focus(); }
    }
  });

  /* en-tête standard d'un panneau */
  UI.panelHead = (title, extra) =>
    `<header class="ov__head"><h2 class="ov__title">${title}</h2>${extra || ''}<button type="button" class="ibtn ov__x" data-act="close-overlay" aria-label="${U.esc(t('a11y.close'))}">${icon('close', 22)}</button></header>`;

  /* ======================================================================
     Composants HTML
     ====================================================================== */
  UI.price = (p, cls) => {
    if (p.price == null) return `<span class="price price--tbd ${cls || ''}">${U.esc(t('price.onRequest'))}</span>`;
    const old = p.compareAtPrice ? `<s class="price__old"><span class="sr-only">${U.esc(t('a11y.oldPrice'))} </span>${U.money(p.compareAtPrice)}</s>` : '';
    return `<span class="price ${p.compareAtPrice ? 'price--sale ' : ''}${cls || ''}"><span class="price__now">${U.money(p.price)}</span>${old}</span>`;
  };

  /* pastille couleur (unie ou bicolore) */
  UI.swatchStyle = (c) => 'background:' + (c.hex2 ? `linear-gradient(135deg, ${c.hex} 0 50%, ${c.hex2} 50% 100%)` : c.hex);
  UI.dots = (p) => {
    if (!p.hasColors) return '';
    const shown = p.colors.slice(0, 4), more = p.colors.length - shown.length;
    return `<span class="dots" role="img" aria-label="${U.esc(PS.count(p.colors.length, 'color'))}">${shown.map((c) => `<i class="${U.lum(c.hex) > 0.8 ? 'is-light' : ''}" style="${UI.swatchStyle(c)}"></i>`).join('')}${more > 0 ? `<em>+${more}</em>` : ''}</span>`;
  };

  UI.tag = (p) => {
    if (!PS.catalog.purchasable(p)) return `<span class="tag tag--out">${U.esc(t('badge.out'))}</span>`;
    if (p.compareAtPrice) return `<span class="tag tag--sale">${U.esc(t('badge.sale'))}</span>`;
    if (p.badge === 'new') return `<span class="tag">${U.esc(t('badge.new'))}</span>`;
    return '';
  };

  /* carte produit. opts : { eager, sizes, wide } */
  UI.card = (p, opts) => {
    opts = opts || {};
    const cat = PS.catalog, M = PS.media;
    const out = !cat.purchasable(p);
    const to = '/produit/' + p.slug;
    const imgs = M.list(p);
    const name = cat.name(p);
    const ratio = opts.wide ? 1.5 : 0.8;
    const sizes = opts.sizes || (opts.wide ? '(min-width:1024px) 50vw, 100vw' : '(min-width:1024px) 25vw, 50vw');
    const widths = opts.wide ? [960, 1600] : undefined;
    const addLabel = cat.needsOptions(p) ? t('card.choose', { name }) : t('card.add', { name });
    return `<article class="card${out ? ' is-out' : ''}${opts.wide ? ' card--wide' : ''}">
      <div class="card__figure">
        <a class="plate card__media" ${PS.router.a(to)} tabindex="-1" aria-hidden="true">
          ${M.tag(imgs[0], { alt: '', ratio, sizes, widths, w: opts.wide ? 960 : 640, eager: opts.eager, icon: M.catIcon(p) })}
          ${imgs[1] && !opts.wide ? M.tag(imgs[1], { alt: '', ratio, sizes, cls: 'card__alt' }) : ''}
        </a>
        ${UI.tag(p)}
        ${out ? '' : `<button type="button" class="card__add" data-act="quick" data-id="${U.esc(p.id)}" aria-label="${U.esc(addLabel)}">${icon('plus', 18)}</button>`}
      </div>
      <a class="card__body" ${PS.router.a(to)}>
        <span class="card__name">${U.esc(name)}</span>
        <span class="card__cat">${U.esc(cat.typeLabel(p))}</span>
        <span class="card__row">${UI.price(p)}${UI.dots(p)}</span>
      </a>
    </article>`;
  };

  /* en-tête de section : titre + lien « tout voir » */
  UI.secHead = (title, linkTo, linkLabel, id, sub) =>
    `<div class="sec__head"><div><h2 class="sec__title"${id ? ` id="${id}"` : ''}>${title}</h2>${sub ? `<p class="sec__sub">${sub}</p>` : ''}</div>${linkTo ? `<a class="more" ${PS.router.a(linkTo)}>${U.esc(linkLabel || t('common.seeAll'))} ${icon('arrowRight', 16)}</a>` : ''}</div>`;

  /* ======================================================================
     Apparition douce au défilement (opacité + translation seulement)
     ====================================================================== */
  let io;
  UI.reveal = (scope) => {
    const els = U.$$('.reveal:not(.in)', scope || document);
    if (!els.length) return;
    if (!('IntersectionObserver' in window) || U.reduceMotion()) { els.forEach((e) => e.classList.add('in')); return; }
    io = io || new IntersectionObserver((ents) => {
      ents.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0.04 });
    els.forEach((e) => io.observe(e));
  };
})();
