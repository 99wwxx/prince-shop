/* PRINCE SHOP — pages : accueil, boutique, produit, infos, 404 + en-tête / pied / barre mobile */
(function () {
  const PS = (window.PS = window.PS || {});
  const U = PS.util, cfg = PS.CONFIG, cat = PS.catalog, M = PS.media, icon = PS.icon, R = PS.router, ui = PS.ui, t = PS.t, L = PS.L;
  const V = (PS.views = {});
  const a = R.a;
  const esc = U.esc;
  const money = U.money;

  R.add('/', 'home');
  R.add('/boutique', 'shop');
  R.add('/boutique/:cat', 'shop');
  R.add('/nouveautes', 'news');
  R.add('/produit/:slug', 'product');
  R.add('/infos/:slug', 'legal');

  const brandTitle = () => cfg.brand.name + ' ' + L(cfg.brand.city);
  const waHelp = () => PS.wa.helpUrl();
  const ext = 'target="_blank" rel="noopener"';
  const CAT_ICON = { chaussures: 'shoe', sacs: 'purse', accessoires: 'gem' };

  /* petit rappel produit en ligne (look éditorial, vus récemment en liste…) */
  ui.mini = (p) => {
    const name = cat.name(p);
    return `<div class="mini">
      <a class="plate mini__img" ${a('/produit/' + p.slug)} tabindex="-1" aria-hidden="true">${M.tag(M.first(p), { alt: '', w: 320, widths: [320], sizes: '80px', icon: M.catIcon(p) })}</a>
      <a class="mini__txt" ${a('/produit/' + p.slug)}><span class="mini__name">${esc(name)}</span><span class="mini__cat">${esc(cat.typeLabel(p))}</span>${ui.price(p)}</a>
      ${cat.purchasable(p) ? `<button type="button" class="mini__add" data-act="quick" data-id="${esc(p.id)}" aria-label="${esc(cat.needsOptions(p) ? t('card.choose', { name }) : t('card.add', { name }))}">${icon('plus', 18)}</button>` : ''}
    </div>`;
  };

  /* ======================================================================
     En-tête, bandeau, barre mobile, pied de page — redessinés à chaque changement de langue
     ====================================================================== */
  V.chrome = () => {
    const cats = cat.categories();
    const s = cfg.store;
    const waNum = PS.wa.display(), tel = U.phoneDisplay(cfg.contact.PHONE_NUMBER);
    const city = L(cfg.brand.city);

    /* bandeau utilitaire */
    document.getElementById('strip').innerHTML = `<div class="wrap strip__in">
      <p class="strip__msg">${cfg.DEMO_MODE && cfg.DEMO_INDICATOR ? `<span class="demo-chip" title="${esc(t('demo.title'))}">${esc(t('demo.chip'))}</span>` : ''}<span>${esc(t('strip.delivery'))}</span><span class="strip__sep" aria-hidden="true">·</span><span class="strip__2">${esc(t('strip.store', { city }))}</span></p>
      <div class="strip__end">
        <a class="strip__wa" href="${esc(waHelp())}" ${ext}>${icon('whatsapp', 13)} ${U.ltr(waNum)}</a>
        <div class="lang" role="group" aria-label="Langue / اللغة">
          <button type="button" class="lang__b${PS.lang === 'fr' ? ' is-on' : ''}" data-act="lang" data-lang="fr" lang="fr" aria-pressed="${PS.lang === 'fr'}">FR</button>
          <span class="lang__sep" aria-hidden="true">|</span>
          <button type="button" class="lang__b${PS.lang === 'ar' ? ' is-on' : ''}" data-act="lang" data-lang="ar" lang="ar" aria-pressed="${PS.lang === 'ar'}">العربية</button>
        </div>
      </div>
    </div>`;

    /* en-tête */
    const nav = [
      ['/', t('nav.home')], ['/boutique', t('nav.shop')],
      ...cats.map((c) => ['/boutique/' + c.id, L(c.name)]),
      ['/nouveautes', t('nav.new')],
    ];
    document.getElementById('hdr').innerHTML = `<div class="wrap hdr__in">
      <button type="button" class="ibtn hdr__menu" data-act="menu" aria-label="${esc(t('a11y.menu'))}" aria-haspopup="dialog">${icon('menu', 24)}</button>
      <a class="logo" ${a('/')} aria-label="${esc(t('a11y.home', { brand: cfg.brand.name }))}"><span class="logo__a">${esc(cfg.brand.wordmark[0])}</span><span class="logo__b">${esc(cfg.brand.wordmark[1])}</span></a>
      <nav class="nav" aria-label="${esc(t('a11y.mainNav'))}">${nav.map(([to, label]) => `<a class="nav__a" ${a(to)} data-nav="${to}">${esc(label)}</a>`).join('')}</nav>
      <div class="hdr__act">
        <button type="button" class="ibtn" data-act="search" aria-label="${esc(t('nav.search'))}" aria-haspopup="dialog">${icon('search', 22)}</button>
        <button type="button" class="ibtn hdr__cart" data-act="cart" aria-haspopup="dialog">${icon('bag', 22)}<span class="count" data-cart-count hidden>0</span></button>
      </div>
    </div>`;

    /* barre de navigation mobile (pouce) */
    document.getElementById('bnav').innerHTML = `
      <a class="bnav__i" ${a('/')} data-nav="/">${icon('home', 22)}<span>${esc(t('nav.home'))}</span></a>
      <a class="bnav__i" ${a('/boutique')} data-nav="/boutique">${icon('grid', 22)}<span>${esc(t('nav.shop'))}</span></a>
      <button type="button" class="bnav__i" data-act="search" aria-haspopup="dialog">${icon('search', 22)}<span>${esc(t('nav.search'))}</span></button>
      <a class="bnav__i bnav__wa" href="${esc(waHelp())}" ${ext}>${icon('whatsapp', 21)}<span>WhatsApp</span></a>
      <button type="button" class="bnav__i bnav__cart" data-act="cart" aria-haspopup="dialog"><span class="bnav__ic">${icon('bag', 22)}<span class="count" data-cart-count hidden>0</span></span><span>${esc(t('nav.cart'))}</span></button>`;
    document.getElementById('bnav').setAttribute('aria-label', t('a11y.quickNav'));

    /* pied de page */
    document.getElementById('ftr').innerHTML = `<div class="wrap">
      <div class="ftr__top">
        <div class="ftr__brand">
          <p class="ftr__logo"><span class="logo__a">${esc(cfg.brand.wordmark[0])}</span><span class="logo__b">${esc(cfg.brand.wordmark[1])}</span></p>
          <p class="ftr__tag">${esc(t('footer.tag', { city }))}</p>
          <a class="btn btn--wa-solid btn--sm" href="${esc(waHelp())}" ${ext}>${icon('whatsapp', 18)} ${esc(t('cta.writeWa'))}</a>
        </div>
        <nav class="ftr__col" aria-label="${esc(t('nav.shop'))}"><h2 class="ftr__h">${esc(t('nav.shop'))}</h2>
          <a ${a('/nouveautes')}>${esc(t('nav.new'))}</a>
          ${cats.map((c) => `<a ${a('/boutique/' + c.id)}>${esc(L(c.name))}</a>`).join('')}
          <a ${a('/boutique')}>${esc(t('footer.all'))}</a>
        </nav>
        <nav class="ftr__col" aria-label="${esc(t('footer.help'))}"><h2 class="ftr__h">${esc(t('footer.help'))}</h2>
          ${Object.keys(PS.LEGAL).filter((k) => k !== 'credits' || cfg.DEMO_MODE).map((k) => `<a ${a('/infos/' + k)}>${esc(L(PS.LEGAL[k]().title))}</a>`).join('')}
        </nav>
        <div class="ftr__col"><h2 class="ftr__h">${esc(t('footer.contact'))}</h2>
          <a href="${esc(waHelp())}" ${ext}>WhatsApp ${U.ltr(waNum)}</a>
          <a href="${esc(U.tel(cfg.contact.PHONE_NUMBER))}">${esc(t('footer.tel'))} ${U.ltr(tel)}</a>
          <a href="${esc(cfg.instagram.url)}" ${ext}>Instagram ${U.ltr('@' + cfg.instagram.handle)}</a>
          <a href="${esc(s.mapsUrl)}" ${ext}>${L(s.address).map(esc).join('<br>')}</a>
        </div>
      </div>
      <div class="ftr__bot">
        <p>© ${new Date().getFullYear()} ${esc(cfg.brand.name)}</p>
        ${cfg.DEMO_MODE && cfg.DEMO_INDICATOR ? `<p class="ftr__demo">${esc(t('demo.footer'))}</p>` : ''}
        <div class="lang lang--ftr" role="group" aria-label="Langue / اللغة">
          <button type="button" class="lang__b${PS.lang === 'fr' ? ' is-on' : ''}" data-act="lang" data-lang="fr" lang="fr" aria-pressed="${PS.lang === 'fr'}">Français</button>
          <span class="lang__sep" aria-hidden="true">|</span>
          <button type="button" class="lang__b${PS.lang === 'ar' ? ' is-on' : ''}" data-act="lang" data-lang="ar" lang="ar" aria-pressed="${PS.lang === 'ar'}">العربية</button>
        </div>
      </div>
    </div>`;

    document.querySelector('.skip').textContent = t('a11y.skip');
    V.updateNav();
    V.updateCartCount();
  };

  V.updateNav = () => {
    const p = R.current() ? R.current().path : '/';
    U.$$('[data-nav]').forEach((el) => {
      const to = el.getAttribute('data-nav');
      let on = to === p;
      /* « Boutique » reste actif sur une fiche produit ; une catégorie l'emporte sur « Boutique » */
      if (to === '/boutique' && el.classList.contains('bnav__i')) on = p.startsWith('/boutique') || p.startsWith('/produit') || p === '/nouveautes';
      if (on) el.setAttribute('aria-current', 'page'); else el.removeAttribute('aria-current');
    });
  };

  V.updateCartCount = () => {
    const n = PS.cart.count();
    U.$$('[data-cart-count]').forEach((el) => { el.textContent = n > 99 ? '99+' : n; el.hidden = n === 0; });
    U.$$('[data-act="cart"]').forEach((b) => b.setAttribute('aria-label', n ? t('a11y.cartN', { n: PS.count(n, 'product') }) : t('a11y.cartEmpty')));
  };

  /* ======================================================================
     Rendu + cycle de vie d'une page
     ====================================================================== */
  let cleanup = null;
  V.render = (r, ctx) => {
    if (cleanup) { try { cleanup(); } catch (e) { /* noop */ } cleanup = null; }
    const main = document.getElementById('main');
    document.documentElement.setAttribute('data-page', r.page || 'page');
    main.innerHTML = r.html;
    ui.setHead(r.head);
    V.updateNav();
    V.updateCartCount();
    if (r.mount) cleanup = r.mount(main) || null;
    ui.reveal(main);
    const o = ctx.opts || {};
    if (o.restoreY != null) window.scrollTo(0, o.restoreY);
    else if (o.scrollTo && document.getElementById(o.scrollTo)) document.getElementById(o.scrollTo).scrollIntoView();
    else if (!o.keepScroll) window.scrollTo(0, 0);
    if (!ctx.first && !o.lang) {
      const h = main.querySelector('h1');
      if (h) { h.setAttribute('tabindex', '-1'); try { h.focus({ preventScroll: true }); } catch (e) { /* noop */ } }
      ui.live(r.head.title);
    }
    document.dispatchEvent(new CustomEvent('ps:page', { detail: r.page }));
  };

  /* ======================================================================
     ACCUEIL
     ====================================================================== */
  const emph = (s) => esc(s).replace(/\*(.+?)\*/g, '<em>$1</em>');

  function budgetParts(b) {
    const cur = L(cfg.currency);
    if (b.min == null) return { k: t('budget.k.under'), v: U.num(b.max), cur };
    if (b.max == null) return { k: t('budget.k.over'), v: U.num(b.min), cur };
    return { k: t('budget.k.between'), v: U.num(b.min) + ' – ' + U.num(b.max), cur };
  }

  function igTiles() {
    const link = `href="${esc(cfg.instagram.url)}" ${ext} aria-label="${esc(t('ig.open', { handle: '@' + cfg.instagram.handle }))}"`;
    if (cfg.instagram.images && cfg.instagram.images.length) {
      return cfg.instagram.images.slice(0, 6).map((src) => `<a class="plate ig__t reveal" ${link}>${M.tag({ src }, { alt: '', ratio: 1, w: 480, widths: [480], sizes: '(min-width:900px) 16vw, 33vw' })}</a>`).join('');
    }
    const order = ['mocassin-elegance', 'sac-croco', 'pochette-strass', 'mocassin-azur', 'sac-perle', 'sneaker-duo'];
    const pick = order.map(cat.byId).filter(Boolean);
    cat.all().forEach((p) => { if (pick.length < 6 && !pick.includes(p) && M.first(p)) pick.push(p); });
    return pick.slice(0, 6).map((p, i) => {
      const list = M.list(p);
      const im = list[list.length > 1 ? 1 : 0];
      return `<a class="plate ig__t reveal" ${link}>${M.tag(im, { alt: '', ratio: 1, w: 480, widths: [480], sizes: '(min-width:900px) 16vw, 33vw' })}</a>`;
    }).join('');
  }

  V.recentHtml = (excludeId) => {
    const ids = (U.store.get('ps_recent', []) || []).filter((id) => id !== excludeId);
    const list = ids.map(cat.byId).filter(Boolean).slice(0, 8);
    if (list.length < 2) return '';
    return `<section class="sec sec--recent" aria-labelledby="h-rec"><div class="wrap">
      ${ui.secHead(esc(t('recent.title')), null, null, 'h-rec')}
      <div class="rail rail--sm">${list.map((p) => ui.card(p, { sizes: '(min-width:1024px) 16vw, 40vw' })).join('')}</div>
    </div></section>`;
  };

  V.home = () => {
    const cats = cat.categories();
    const news = cat.news(8);
    const s = cfg.store;
    const city = L(cfg.brand.city);
    const heroP = cat.byId(cfg.hero.productId);
    const sideP = cat.byId(cfg.hero.sideProductId);
    const edP = cat.byId(cfg.editorial.productId);
    const look = (cfg.editorial.lookIds || []).map(cat.byId).filter(Boolean);
    const budgets = cat.budgets();
    const HI = PS.HOME_IMAGES || {};

    /* sélection : un produit en grand format (photo horizontale) ouvre la grille, puis 5 cartes + un encart
       = 8 cases, donc aucune case vide en 2 comme en 4 colonnes */
    const feat = cat.featured(9);
    const wideP = feat.find((p) => M.first(p) && M.first(p).w > M.first(p).h * 1.2) || null;
    const selList = wideP ? [wideP].concat(feat.filter((p) => p !== wideP).slice(0, 5)) : feat.slice(0, 7);
    const selHtml = selList.map((p) => ui.card(p, { wide: p === wideP })).join('');

    const catTile = (c, i) => `<a class="cat cat--${i} reveal" ${a('/boutique/' + c.id)}>
        <span class="plate cat__img">${M.tag(c.image || M.first(cat.inCategory(c.id)[0]), { alt: '', ratio: i === 0 ? 1.1 : 1, w: 960, widths: [640, 1280], sizes: i === 0 ? '(min-width:1024px) 55vw, 100vw' : '(min-width:1024px) 40vw, 50vw', eager: false })}</span>
        <span class="cat__lab">
          <span class="cat__name">${icon(CAT_ICON[c.id] || 'bag', 20)}${esc(L(c.name))}</span>
          <span class="cat__meta">${esc(PS.count(c.count, 'model'))} · ${esc(L(c.blurb))}</span>
        </span>
        <span class="cat__go" aria-hidden="true">${icon('arrowRight', 20)}</span>
      </a>`;

    const hours = s.hours && s.hours.length
      ? `<dl class="hours">${s.hours.map((x) => `<div><dt>${esc(L(x.d))}</dt><dd>${U.ltr(x.h)}</dd></div>`).join('')}</dl>` : '';
    const stars = Array.from({ length: 5 }, () => icon('star', 14)).join('');
    const rating = s.googleRating
      ? `<a class="rating" href="${esc(s.mapsUrl)}" ${ext}><span class="rating__n">${String(s.googleRating).replace('.', PS.lang === 'fr' ? ',' : '.')}</span><span class="rating__s" aria-hidden="true">${stars}</span><span class="rating__t">${esc(s.googleReviewCount ? t('store.ratingN', { n: s.googleReviewCount }) : t('store.rating'))}</span></a>` : '';
    const directions = `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`;

    const html = `
    <section class="hero" aria-label="${esc(t('hero.kicker'))}">
      <div class="wrap hero__grid">
        <div class="hero__copy">
          <p class="kicker">${esc(t('hero.kicker'))}</p>
          <h1 class="hero__title">${emph(t('hero.title'))}</h1>
          <p class="hero__text">${esc(t('hero.text'))}</p>
          <div class="hero__cta">
            <a class="btn btn--primary" ${a('/boutique')}>${esc(t('hero.cta'))} ${icon('arrowRight', 18)}</a>
            <a class="btn btn--text" href="${esc(waHelp())}" ${ext}>${icon('whatsapp', 18)} ${esc(t('cta.orderWa'))}</a>
          </div>
        </div>
        <div class="hero__visual">
          ${heroP ? `<a class="plate hero__main" ${a('/produit/' + heroP.slug)} aria-label="${esc(cat.name(heroP) + ', ' + money(heroP.price))}">
            ${M.tag(HI.hero || M.first(heroP), { alt: '', ratio: 0.8, w: 960, widths: [960, 1600], sizes: '(min-width:1024px) 46vw, 100vw', eager: true })}
            <span class="hero__tag"><span class="hero__tagn">${esc(cat.name(heroP))}</span><b>${esc(money(heroP.price))}</b>${icon('arrowRight', 16)}</span>
          </a>` : ''}
          ${sideP ? `<a class="hero__side" ${a('/produit/' + sideP.slug)} aria-label="${esc(cat.name(sideP) + ', ' + money(sideP.price))}">
            <span class="plate">${M.tag(M.first(sideP), { alt: '', ratio: 1, w: 480, widths: [480], sizes: '(min-width:1024px) 16vw, 36vw', eager: true })}</span>
            <span class="hero__sidecap"><span>${esc(cat.name(sideP))}</span><b>${esc(money(sideP.price))}</b></span>
          </a>` : ''}
        </div>
      </div>
    </section>

    <section class="sec sec--cats" aria-labelledby="h-cat"><div class="wrap">
      ${ui.secHead(esc(t('home.cats')), '/boutique', t('common.seeAll'), 'h-cat', esc(PS.count(cat.all().length, 'product')))}
      <div class="cats cats--${cats.length}">${cats.map(catTile).join('')}</div>
    </div></section>

    ${budgets.length ? `<section class="budget" aria-labelledby="h-bud"><div class="wrap">
      <div class="budget__head">
        <h2 class="sec__title" id="h-bud">${esc(t('home.budget'))}</h2>
        <p class="budget__sub">${esc(t('home.budgetSub'))}</p>
      </div>
      <div class="budget__grid budget__grid--${budgets.length}">
        ${budgets.map((b) => { const bp = budgetParts(b); return `<a class="bud reveal" ${a('/boutique', { prix: b.key })} aria-label="${esc(cat.budgetLabel(b) + ', ' + PS.count(b.count, 'product'))}">
          <span class="bud__k">${esc(bp.k)}</span>
          <span class="bud__v"><span dir="ltr">${esc(bp.v)}</span> <small>${esc(bp.cur)}</small></span>
          <span class="bud__n">${esc(PS.count(b.count, 'product'))} ${icon('arrowRight', 16)}</span>
        </a>`; }).join('')}
      </div>
    </div></section>` : ''}

    <section class="sec" aria-labelledby="h-new"><div class="wrap">
      ${ui.secHead(esc(t('home.new')), '/nouveautes', t('common.seeAll'), 'h-new')}
      <div class="rail">${news.map((p, i) => ui.card(p, { sizes: '(min-width:1024px) 22vw, 60vw' })).join('')}</div>
    </div></section>

    ${edP ? `<section class="edito" aria-labelledby="h-ed"><div class="wrap edito__in">
      <a class="plate edito__img reveal" ${a('/produit/' + edP.slug)} tabindex="-1" aria-hidden="true">
        ${M.tag(HI.editorial || M.first(edP), { alt: '', ratio: 1.15, w: 960, widths: [960, 1600], sizes: '(min-width:1024px) 55vw, 100vw' })}
      </a>
      <div class="edito__copy">
        <p class="kicker">${esc(t('edito.kicker'))}</p>
        <h2 class="edito__title" id="h-ed">${emph(t('edito.title')).replace(/\n/g, '<br>')}</h2>
        <p class="edito__text">${esc(t('edito.text'))}</p>
        <div class="edito__items">${look.map((p) => ui.mini(p)).join('')}</div>
        <a class="more more--line" ${a('/boutique/chaussures')}>${esc(t('edito.cta'))} ${icon('arrowRight', 16)}</a>
      </div>
    </div></section>` : ''}

    <section class="sec" aria-labelledby="h-sel"><div class="wrap">
      ${ui.secHead(esc(t('home.selection')), '/boutique', t('common.seeAll'), 'h-sel')}
      <div class="grid grid--home">${selHtml}
        <a class="note reveal" href="${esc(waHelp())}" ${ext}>
          <span class="note__k">${icon('truck', 22)}</span>
          <span class="note__t">${esc(t('strip.delivery'))}</span>
          <span class="note__s">${esc(t('note.text'))}</span>
          <span class="note__a">${icon('whatsapp', 16)} ${esc(t('cta.askWa'))}</span>
        </a>
      </div>
    </div></section>

    <section class="sec sec--ig" aria-labelledby="h-ig"><div class="wrap">
      <div class="sec__head">
        <div><h2 class="sec__title" id="h-ig">${esc(t('ig.title'))}</h2>
        <p class="sec__sub">${U.ltr('@' + cfg.instagram.handle)}${cfg.instagram.followers ? ' · ' + esc(t('ig.followers', { n: L(cfg.instagram.followers) })) : ''}</p></div>
        <a class="more" href="${esc(cfg.instagram.url)}" ${ext}>${icon('instagram', 18)} ${esc(t('ig.cta'))}</a>
      </div>
      <div class="ig">${igTiles()}</div>
    </div></section>

    <section class="sec sec--store" id="boutique" aria-labelledby="h-store"><div class="wrap store">
      <div class="store__info">
        <p class="kicker">${esc(t('store.kicker'))}</p>
        <h2 class="sec__title" id="h-store">${esc(t('store.title', { city }))}</h2>
        <address class="store__addr">
          <span>${L(s.address).map(esc).join('<br>')}</span>
          <small>${esc(t('store.mapsRef'))} ${U.ltr(s.mapsLabel)}</small>
        </address>
        ${hours}
        ${rating}
        <div class="store__cta">
          <a class="btn btn--primary" href="${esc(directions)}" ${ext}>${icon('pin', 18)} ${esc(t('store.directions'))}</a>
          <a class="btn btn--line" href="${esc(s.mapsUrl)}" ${ext}>${esc(t('store.seeMaps'))}</a>
        </div>
        <ul class="contact">
          <li><a href="${esc(waHelp())}" ${ext}>${icon('whatsapp', 20)}<span><b>WhatsApp</b>${U.ltr(PS.wa.display())}</span></a></li>
          <li><a href="${esc(U.tel(cfg.contact.PHONE_NUMBER))}">${icon('phone', 20)}<span><b>${esc(t('store.phone'))}</b>${U.ltr(U.phoneDisplay(cfg.contact.PHONE_NUMBER))}</span></a></li>
          <li><span class="contact__s">${icon('truck', 20)}<span><b>${esc(t('strip.delivery'))}</b>${esc(t('delivery.tbd'))}</span></span></li>
        </ul>
      </div>
      <div class="store__map" id="map">
        <button type="button" class="map__poster" data-act="load-map">
          <span class="map__pin">${icon('pin', 30)}</span>
          <span class="map__t">${esc(cfg.brand.name)}</span>
          <span class="map__s">${esc(L(s.address)[0])}</span>
          <span class="map__b">${esc(t('store.showMap'))}</span>
        </button>
      </div>
    </div>
    <div class="wrap"><ol class="how" aria-label="${esc(t('how.title'))}">
      <li><span class="how__n" aria-hidden="true">1</span><span><b>${esc(t('how.1'))}</b>${esc(t('how.1s'))}</span></li>
      <li><span class="how__n" aria-hidden="true">2</span><span><b>${esc(t('how.2'))}</b>${esc(t('how.2s'))}</span></li>
      <li><span class="how__n" aria-hidden="true">3</span><span><b>${esc(t('how.3'))}</b>${esc(t('how.3s'))}</span></li>
    </ol></div></section>

    ${V.recentHtml()}`;

    const ld = [{
      '@context': 'https://schema.org',
      '@type': 'ClothingStore',
      name: cfg.brand.name,
      url: R.url('/'),
      telephone: cfg.contact.PHONE_NUMBER,
      address: { '@type': 'PostalAddress', streetAddress: s.address.fr[0], addressLocality: cfg.brand.city.fr, postalCode: s.postalCode, addressCountry: cfg.brand.country },
      geo: { '@type': 'GeoCoordinates', latitude: s.lat, longitude: s.lng },
      hasMap: s.mapsUrl,
      sameAs: [cfg.instagram.url],
      areaServed: { '@type': 'Country', name: 'Maroc' },
    }];

    return {
      page: 'home',
      head: { title: t('seo.homeTitle'), description: t('seo.homeDesc'), path: '/', jsonld: ld },
      html,
    };
  };

  /* ======================================================================
     BOUTIQUE (tout, catégorie, nouveautés, recherche) — la logique est dans shop.js
     ====================================================================== */
  V.shop = (params, query, route) => {
    const mode = route && route.name === 'news' ? 'news' : 'shop';
    const c = params.cat ? cat.category(params.cat) : null;
    if (params.cat && (!c || !cat.inCategory(c.id).length)) return V.notfound();
    const q = (query.get('q') || '').trim();
    let title, sub, path;
    if (q) { title = t('shop.results', { q }); sub = ''; path = '/boutique'; }
    else if (mode === 'news') { title = t('nav.new'); sub = t('shop.newSub'); path = '/nouveautes'; }
    else if (c) { title = L(c.name); sub = L(c.blurb); path = '/boutique/' + c.id; }
    else { title = t('shop.all'); sub = t('shop.allSub'); path = '/boutique'; }

    const crumbs = [[t('nav.home'), '/']];
    if (c) crumbs.push([t('nav.shop'), '/boutique'], [L(c.name), null]);
    else crumbs.push([q ? t('nav.search') : mode === 'news' ? t('nav.new') : t('nav.shop'), null]);

    const html = `
    <section class="shop"><div class="wrap">
      ${V.crumbs(crumbs)}
      <header class="shop__head">
        <h1 class="shop__title">${esc(title)}</h1>
        <p class="shop__sub">${sub ? esc(sub) + ' · ' : ''}<span id="count-top"></span></p>
      </header>
      <div id="shop-chips"></div>
      <div class="shop__layout">
        <aside class="shop__side" id="shop-side" aria-label="${esc(t('filter.title'))}"></aside>
        <div class="shop__main">
          <div class="shop__bar" id="shop-bar">
            <button type="button" class="tool" data-act="filters" aria-haspopup="dialog">${icon('filter', 18)}<span>${esc(t('filter.btn'))}</span><span class="tool__n" id="filt-n" hidden></span></button>
            <label class="tool tool--sort">${icon('sort', 18)}<span class="sr-only">${esc(t('sort.label'))}</span>
              <select id="sort" aria-label="${esc(t('sort.label'))}">
                <option value="new">${esc(t('sort.new'))}</option>
                <option value="prix-asc">${esc(t('sort.asc'))}</option>
                <option value="prix-desc">${esc(t('sort.desc'))}</option>
              </select>${icon('chevronDown', 14, 'tool__chev')}
            </label>
          </div>
          <div class="afilters" id="afilters"></div>
          <p class="sr-only" id="count" role="status"></p>
          <div class="grid grid--shop" id="grid"></div>
          <div id="empty" hidden></div>
        </div>
      </div>
    </div></section>
    ${V.recentHtml()}`;

    const ld = [{
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: crumbs.map(([l, to], i) => ({ '@type': 'ListItem', position: i + 1, name: l, ...(to ? { item: R.url(to) } : {}) })),
    }];
    return {
      page: 'shop',
      head: {
        title: (q ? t('nav.search') + ' « ' + q + ' »' : title) + ' — ' + brandTitle(),
        description: c ? t('seo.catDesc', { cat: L(c.name), blurb: L(c.blurb), city: L(cfg.brand.city) }) : t('seo.homeDesc'),
        path, noindex: !!q, jsonld: ld,
      },
      html,
      mount(main) { return PS.shopUI.mount(main, { mode, cat: c, q, query }); },
    };
  };
  V.news = (params, query) => V.shop(params, query, { name: 'news' });

  V.crumbs = (crumbs) =>
    `<nav class="crumbs" aria-label="${esc(t('a11y.breadcrumb'))}"><ol>${crumbs.map(([l, to]) => `<li>${to ? `<a ${a(to)}>${esc(l)}</a>` : `<span aria-current="page">${esc(l)}</span>`}</li>`).join('')}</ol></nav>`;

  /* ======================================================================
     FICHE PRODUIT — l'interaction est dans pdp.js
     ====================================================================== */
  V.product = (params, query) => {
    const p = cat.byId(params.slug);
    if (!p) return V.notfound();
    const color = cat.colorByKey(p, query.get('couleur')) || p.colors.find((c) => cat.colorOk(p, c)) || p.colors[0];
    const out = !cat.purchasable(p);
    const s = cfg.store;
    const name = cat.name(p);
    const related = cat.related(p, 4);
    const details = L(p.details) || [];
    const d = cfg.delivery;
    const crumbs = [[t('nav.home'), '/'], [L(p.cat.name), '/boutique/' + p.category], [name, null]];
    const sizeLab = cat.sizeLabel(p);
    const delivLine = d.fee != null ? t('delivery.fee', { fee: money(d.fee) }) : t('delivery.tbd');
    const payLine = cfg.payment.cashOnDelivery ? t('pay.cod') : t('pay.tbd');
    const shareUrl = cfg.siteUrl ? R.url('/produit/' + p.slug) : '';

    const html = `
    <article class="pdp" data-id="${esc(p.id)}">
      <div class="wrap">${V.crumbs(crumbs)}</div>
      <div class="wrap pdp__in">
        <div class="pdp__gallery">
          <div class="gal__thumbs" id="gal-thumbs"></div>
          <div class="gal__stage">
            <div class="gal" id="gal" tabindex="0" role="group" aria-roledescription="${esc(t('a11y.carousel'))}" aria-label="${esc(t('a11y.photos', { name }))}"></div>
            <span class="gal__count" id="gal-count" aria-hidden="true"></span>
            <button type="button" class="gal__zoom" data-act="zoom" aria-label="${esc(t('a11y.zoom'))}">${icon('zoom', 20)}</button>
            ${ui.tag(p)}
          </div>
        </div>

        <div class="pdp__info">
          <p class="kicker">${esc(cat.typeLabel(p))}${p.gender && PS.GENDERS[p.gender] ? ' · ' + esc(L(PS.GENDERS[p.gender])) : ''}</p>
          <h1 class="pdp__name">${esc(name)}</h1>
          <p class="pdp__price">${ui.price(p)}</p>

          <form class="pdp__form" id="pdp-form" novalidate>
            ${p.hasColors ? `<div class="opt" role="radiogroup" aria-labelledby="color-lab">
              <div class="opt__head"><span class="opt__l" id="color-lab">${esc(p.colors.length > 1 ? t('pdp.chooseColor') : t('pdp.color'))}<span class="opt__v" id="color-name">${esc(cat.colorName(color))}</span></span></div>
              <div class="sw-row">${p.colors.map((cl) => `<label class="sw${cl.unavailable ? ' is-off' : ''}"><input type="radio" name="color" value="${esc(cl.key)}"${cl.key === color.key ? ' checked' : ''}${cl.unavailable ? ' disabled' : ''}><span class="sw__dot${U.lum(cl.hex) > 0.8 ? ' is-light' : ''}" style="${ui.swatchStyle(cl)}"></span><span class="sr-only">${esc(cat.colorName(cl))}${cl.unavailable ? ' — ' + esc(t('badge.out')) : ''}</span></label>`).join('')}</div>
            </div>` : ''}
            ${p.sizes.length ? `<div class="opt" role="radiogroup" aria-labelledby="size-lab" id="size-box">
              <div class="opt__head"><span class="opt__l" id="size-lab">${esc(t('pdp.chooseSize', { label: sizeLab }))}<span class="opt__v" id="size-name"></span></span>
                <button type="button" class="opt__help" data-act="size-guide" data-id="${esc(p.id)}">${icon('ruler', 16)} ${esc(t('pdp.sizeGuide', { label: sizeLab }))}</button></div>
              <div class="sz-row" id="sizes"></div>
            </div>` : ''}
            <p class="pdp__err" id="opt-err" role="alert" hidden></p>
            <div class="pdp__cta" id="pdp-cta">
              ${out
                ? `<p class="pdp__out">${esc(t('pdp.outMsg'))}</p>
                   <a class="btn btn--wa-solid btn--block" href="${esc(PS.wa.url(PS.wa.productMessage(p, color, '', shareUrl, t('wa.outIntro'))))}" ${ext}>${icon('whatsapp', 20)} ${esc(t('cta.askWa'))}</a>`
                : `<button type="submit" class="btn btn--primary btn--block" data-act="add-pdp"><span class="btn__l">${esc(t('cta.add'))}</span><span class="btn__ok" aria-hidden="true">${icon('check', 18)} ${esc(t('added.short'))}</span></button>
                   <button type="button" class="btn btn--wa btn--block" data-act="wa-pdp">${icon('whatsapp', 20)} ${esc(t('cta.orderViaWa'))}</button>`}
            </div>
          </form>

          <ul class="assure">
            <li>${icon('truck', 20)}<span><b>${esc(t('strip.delivery'))}</b><small>${esc(delivLine)}</small></span></li>
            <li>${icon('chat', 20)}<span><b>${esc(t('assure.confirm'))}</b><small>${esc(t('assure.confirmS'))}</small></span></li>
            <li>${icon('store', 20)}<span><b>${esc(t('strip.store', { city: L(cfg.brand.city) }))}</b><small><a class="u" href="${esc(s.mapsUrl)}" ${ext}>${esc(L(s.address)[0])}</a></small></span></li>
          </ul>

          <div class="acc">
            <details class="acc__i" open><summary>${esc(t('pdp.details'))}${icon('plus', 18, 'acc__ic')}</summary><div class="acc__b">
              <p>${esc(L(p.description))}</p>
              <ul>${[...details,
                p.sizes.length ? sizeLab + t('wa.colon') + ' ' + p.sizes[0] + ' – ' + p.sizes[p.sizes.length - 1] : '',
                p.hasColors ? t('pdp.colors') + ' ' + p.colors.map(cat.colorName).join(PS.lang === 'ar' ? '، ' : ', ') : '',
              ].filter(Boolean).map((x) => `<li>${esc(x)}</li>`).join('')}${p.ref ? `<li>${esc(t('pdp.ref'))} ${U.ltr(p.ref)}</li>` : ''}</ul>
            </div></details>
            <details class="acc__i"><summary>${esc(t('pdp.delivery'))}${icon('plus', 18, 'acc__ic')}</summary><div class="acc__b">
              <p>${esc(t('strip.delivery'))}. ${esc(delivLine)}</p>
              <p>${esc(payLine)}</p>
            </div></details>
            <details class="acc__i"><summary>${esc(t('pdp.returns'))}${icon('plus', 18, 'acc__ic')}</summary><div class="acc__b">
              <p>${esc(t('pdp.returnsText'))} <a class="u" href="${esc(waHelp())}" ${ext}>${esc(t('cta.writeWa'))}</a></p>
            </div></details>
          </div>
        </div>
      </div>

      ${related.length ? `<section class="sec" aria-labelledby="h-rel"><div class="wrap">
        ${ui.secHead(esc(t('pdp.related')), '/boutique/' + p.category, t('common.seeAll'), 'h-rel')}
        <div class="grid">${related.map((r) => ui.card(r)).join('')}</div>
      </div></section>` : ''}
      ${V.recentHtml(p.id)}

      ${out ? '' : `<div class="pbar" id="pbar" aria-hidden="true" inert>
        <span class="plate pbar__img" id="pbar-img"></span>
        <span class="pbar__t"><b>${esc(name)}</b><span id="pbar-sub">${esc(money(p.price))}</span></span>
        <button type="button" class="btn btn--primary btn--sm" data-act="add-pdp">${esc(t('cta.add'))}</button>
      </div>`}
    </article>`;

    const desc = [name + (p.price != null ? ' — ' + money(p.price, true) : ''), L(p.description), t('seo.tail')].filter(Boolean).join(' ');
    const img = M.absolute(p);
    const ld = [
      {
        '@context': 'https://schema.org', '@type': 'Product',
        name, description: L(p.description), sku: p.ref || p.id, category: L(p.cat.name),
        ...(img && !cfg.DEMO_MODE ? { image: [img] } : {}),
        ...(p.price != null ? { offers: { '@type': 'Offer', priceCurrency: cfg.currency.iso, price: String(p.price), availability: out ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock', url: R.url('/produit/' + p.slug), seller: { '@type': 'Organization', name: cfg.brand.name } } } : {}),
      },
      {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: crumbs.map(([l, to], i) => ({ '@type': 'ListItem', position: i + 1, name: l, ...(to ? { item: R.url(to) } : {}) })),
      },
    ];

    return {
      page: 'product',
      head: {
        title: `${name} — ${L(p.cat.name)} | ${brandTitle()}`,
        description: desc.length > 160 ? desc.slice(0, 157) + '…' : desc,
        path: '/produit/' + p.slug, ogType: 'product', image: img || undefined, jsonld: ld,
      },
      html,
      mount(main) { return PS.pdpUI.mount(main, { p, color }); },
    };
  };

  /* ======================================================================
     INFOS (pages légales, crédits) + 404
     ====================================================================== */
  V.legal = (params) => {
    const def = PS.LEGAL[params.slug];
    if (!def || (params.slug === 'credits' && !cfg.DEMO_MODE)) return V.notfound();
    const d = def();
    const todo = /^\[/;
    const html = `<section class="legal"><div class="wrap wrap--narrow">
      ${V.crumbs([[t('nav.home'), '/'], [L(d.title), null]])}
      <h1 class="shop__title">${esc(L(d.title))}</h1>
      ${d.status === 'draft' ? `<p class="notice" role="note"><b>${esc(t('legal.draft'))}</b> ${esc(t('legal.draftText', { brand: cfg.brand.name }))}</p>` : ''}
      <p class="legal__intro">${esc(L(d.intro))}</p>
      ${d.sections.map((sec) => `<h2 class="legal__h">${esc(L(sec.h))}</h2>${(L(sec.p) || []).map((x) => `<p class="${todo.test(x) ? 'todo' : ''}">${esc(x)}</p>`).join('')}`).join('')}
    </div></section>`;
    return { page: 'legal', head: { title: `${L(d.title)} — ${brandTitle()}`, description: L(d.intro), path: '/infos/' + params.slug, noindex: d.status === 'draft' || params.slug === 'credits' }, html };
  };

  V.notfound = () => ({
    page: 'notfound',
    head: { title: t('nf.title') + ' — ' + brandTitle(), description: t('nf.text'), noindex: true },
    html: `<section class="legal"><div class="wrap wrap--narrow nf">
      <p class="kicker">404</p>
      <h1 class="shop__title">${esc(t('nf.title'))}</h1>
      <p class="legal__intro">${esc(t('nf.text'))}</p>
      <div class="hero__cta"><a class="btn btn--primary" ${a('/boutique')}>${esc(t('nf.cta'))}</a><a class="btn btn--line" ${a('/')}>${esc(t('nav.home'))}</a></div>
    </div></section>`,
  });
})();
