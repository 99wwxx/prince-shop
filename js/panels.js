/* PRINCE SHOP — panneaux : menu, recherche, panier, ajout rapide, confirmation d'ajout,
   guide des tailles, zoom photo, carte. */
(function () {
  const PS = (window.PS = window.PS || {});
  const U = PS.util, cfg = PS.CONFIG, cat = PS.catalog, M = PS.media, icon = PS.icon, R = PS.router, ui = PS.ui, t = PS.t, L = PS.L;
  const esc = U.esc, a = R.a, money = U.money;
  const O = ui.overlay;
  const ext = 'target="_blank" rel="noopener"';
  const P = (PS.panels = {});
  const CAT_ICON = { chaussures: 'shoe', sacs: 'purse', accessoires: 'gem' };

  const langSwitch = (cls) => `<div class="lang ${cls || ''}" role="group" aria-label="Langue / اللغة">
      <button type="button" class="lang__b${PS.lang === 'fr' ? ' is-on' : ''}" data-act="lang" data-lang="fr" lang="fr" aria-pressed="${PS.lang === 'fr'}">Français</button>
      <span class="lang__sep" aria-hidden="true">|</span>
      <button type="button" class="lang__b${PS.lang === 'ar' ? ' is-on' : ''}" data-act="lang" data-lang="ar" lang="ar" aria-pressed="${PS.lang === 'ar'}">العربية</button>
    </div>`;

  /* « Beige · Pointure 38 » */
  const variantText = (l) => [l.product.hasColors ? cat.colorName(l.color) : '', l.size ? cat.sizeLabel(l.product) + ' ' + l.size : ''].filter(Boolean).join(' · ');
  P.variantText = variantText;

  /* ======================================================================
     MENU (mobile)
     ====================================================================== */
  P.menu = () => {
    const cats = cat.categories();
    O.open('menu', {
      type: 'start',
      label: t('a11y.menu'),
      html: `${ui.panelHead(esc(t('menu.title')))}
        <nav class="ov__scroll menu" aria-label="${esc(t('a11y.mainNav'))}">
          <a class="menu__a" ${a('/')}>${esc(t('nav.home'))}</a>
          <a class="menu__a" ${a('/boutique')}>${esc(t('nav.shop'))}<small>${esc(PS.count(cat.all().length, 'product'))}</small></a>
          ${cats.map((c) => `<div class="menu__g">
            <a class="menu__a" ${a('/boutique/' + c.id)}><span class="menu__ic">${icon(CAT_ICON[c.id] || 'bag', 20)}</span>${esc(L(c.name))}<small>${c.count}</small></a>
            <div class="menu__sub">${cat.types(c.id).map((x) => `<a ${a('/boutique/' + c.id, { type: x.key })}>${esc(L(x.name))}</a>`).join('')}</div>
          </div>`).join('')}
          <a class="menu__a" ${a('/nouveautes')}>${esc(t('nav.new'))}</a>
          <div class="menu__sec">
            <a class="menu__s" ${a('/')} data-scroll="boutique">${icon('pin', 18)} ${esc(t('menu.find'))}</a>
            <a class="menu__s" href="${esc(PS.wa.helpUrl())}" ${ext}>${icon('whatsapp', 18)} ${esc(t('menu.contact'))}</a>
            <a class="menu__s" href="${esc(U.tel(cfg.contact.PHONE_NUMBER))}">${icon('phone', 18)} ${U.ltr(U.phoneDisplay(cfg.contact.PHONE_NUMBER))}</a>
            <a class="menu__s" href="${esc(cfg.instagram.url)}" ${ext}>${icon('instagram', 18)} ${U.ltr('@' + cfg.instagram.handle)}</a>
          </div>
        </nav>
        <footer class="ov__foot menu__foot">${langSwitch('lang--menu')}<p class="menu__deliv">${icon('truck', 16)} ${esc(t('strip.delivery'))}</p></footer>`,
    });
  };

  /* ======================================================================
     RECHERCHE
     ====================================================================== */
  function searchBody(q) {
    q = (q || '').trim();
    if (!q) {
      const news = cat.news(4);
      return `<div class="search__sec"><h3 class="search__h">${esc(t('search.cats'))}</h3>
          <div class="chips chips--wrap">${cat.categories().map((c) => `<a class="chip" ${a('/boutique/' + c.id)}>${esc(L(c.name))}</a>`).join('')}${cat.types().slice(0, 6).map((x) => `<a class="chip" ${a('/boutique/' + x.category, { type: x.key })}>${esc(L(x.name))}</a>`).join('')}</div></div>
        <div class="search__sec"><h3 class="search__h">${esc(t('home.budget'))}</h3>
          <div class="chips chips--wrap">${cat.budgets().map((b) => `<a class="chip" ${a('/boutique', { prix: b.key })}>${esc(cat.budgetLabel(b))}</a>`).join('')}</div></div>
        <div class="search__sec"><h3 class="search__h">${esc(t('home.new'))}</h3>
          <div class="minis">${news.map((p) => ui.mini(p)).join('')}</div></div>`;
    }
    const res = cat.search(q);
    if (!res.length) {
      return `<div class="empty empty--sm"><p class="empty__t">${esc(t('shop.emptyQ', { q }))}</p><p class="empty__s">${esc(t('shop.emptyS'))}</p>
        <div class="empty__b"><a class="btn btn--wa" href="${esc(PS.wa.helpUrl(t('wa.lookingFor', { q })))}" ${ext}>${icon('whatsapp', 20)} ${esc(t('cta.askWa'))}</a></div></div>`;
    }
    return `<p class="search__n">${esc(PS.count(res.length, 'result'))}</p>
      <div class="minis">${res.slice(0, 6).map((p) => ui.mini(p)).join('')}</div>
      ${res.length > 6 ? `<a class="btn btn--line btn--block" ${a('/boutique', { q })}>${esc(t('search.all', { n: res.length }))}</a>` : ''}`;
  }

  P.search = (prefill) => {
    const rec = O.open('search', {
      type: 'top',
      label: t('nav.search'),
      initialFocus: '#q',
      html: `<form class="search__bar" role="search" id="search-form" novalidate>
          ${icon('search', 22)}
          <label class="sr-only" for="q">${esc(t('search.label'))}</label>
          <input type="search" id="q" name="q" placeholder="${esc(t('search.ph'))}" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" enterkeyhint="search" value="${esc(prefill || '')}">
          <button type="button" class="ibtn" data-act="close-overlay" aria-label="${esc(t('a11y.close'))}">${icon('close', 22)}</button>
        </form>
        <div class="ov__scroll search__body" id="search-out">${searchBody(prefill)}</div>`,
      onOpen(r) {
        const input = r.panel.querySelector('#q'), out = r.panel.querySelector('#search-out');
        const run = U.debounce(() => {
          out.innerHTML = searchBody(input.value);
          const n = input.value.trim() ? cat.search(input.value).length : null;
          if (n != null) ui.live(PS.count(n, 'result'));
        }, 90);
        input.addEventListener('input', run);
        r.panel.querySelector('#search-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const q = input.value.trim();
          if (q) R.go('/boutique?' + new URLSearchParams({ q }).toString());
        });
      },
    });
    return rec;
  };

  /* ======================================================================
     PANIER
     ====================================================================== */
  function deliveryLabel(tt) {
    if (tt.delivery.state === 'free') return t('cart.deliveryFree');
    if (tt.delivery.state === 'fee') return money(tt.delivery.amount);
    return t('cart.deliveryTbd');
  }
  P.deliveryLabel = deliveryLabel;

  function lineHtml(l) {
    const p = l.product, name = cat.name(p), to = '/produit/' + p.slug;
    const max = PS.cart.max();
    return `<li class="line${l.problem ? ' is-bad' : ''}" data-key="${esc(l.key)}">
      <a class="plate line__img" ${a(to, p.colors.length > 1 ? { couleur: l.color.key } : '')} tabindex="-1" aria-hidden="true">${M.tag(M.first(p, l.color), { alt: '', w: 320, widths: [320], sizes: '88px', icon: M.catIcon(p) })}</a>
      <div class="line__main">
        <a class="line__name" ${a(to, p.colors.length > 1 ? { couleur: l.color.key } : '')}>${esc(name)}</a>
        ${variantText(l) ? `<p class="line__var">${esc(variantText(l))}</p>` : ''}
        ${l.problem ? `<p class="line__warn">${esc(l.problem === 'size' ? t('cart.badSize') : t('cart.badItem'))}</p>` : ''}
        <div class="line__row">
          <div class="qty" role="group" aria-label="${esc(t('cart.qty'))}">
            <button type="button" data-act="qty" data-d="-1" data-key="${esc(l.key)}" data-fk="m${esc(l.key)}" aria-label="${esc(l.qty > 1 ? t('cart.less', { name }) : t('cart.remove', { name }))}">${icon(l.qty > 1 ? 'minus' : 'trash', 16)}</button>
            <output dir="ltr" aria-label="${esc(t('cart.qtyN', { n: l.qty }))}">${l.qty}</output>
            <button type="button" data-act="qty" data-d="1" data-key="${esc(l.key)}" data-fk="p${esc(l.key)}" aria-label="${esc(t('cart.more', { name }))}"${l.qty >= max ? ' disabled' : ''}>${icon('plus', 16)}</button>
          </div>
          <span class="line__price">${l.total == null ? esc(t('price.onRequest')) : money(l.total)}${l.qty > 1 && l.unit != null ? `<small>${l.qty} × ${money(l.unit)}</small>` : ''}</span>
        </div>
      </div>
      <button type="button" class="line__rm" data-act="rm" data-key="${esc(l.key)}" data-fk="r${esc(l.key)}" aria-label="${esc(t('cart.remove', { name }))}">${icon('close', 18)}</button>
    </li>`;
  }

  P.cartHtml = () => {
    const lines = PS.cart.lines();
    const n = PS.cart.count();
    const head = ui.panelHead(`${esc(t('cart.title'))}${n ? ` <span class="ov__n">${n}</span>` : ''}`);
    if (!lines.length) {
      return `${head}<div class="ov__scroll cart cart--empty">
        <div class="empty">
          <p class="empty__t">${esc(t('cart.empty'))}</p>
          <p class="empty__s">${esc(t('cart.emptyS'))}</p>
          <div class="empty__b">
            <a class="btn btn--primary" ${a('/nouveautes')}>${esc(t('cart.emptyCta'))}</a>
          </div>
          <div class="chips chips--wrap chips--center">${cat.categories().map((c) => `<a class="chip" ${a('/boutique/' + c.id)}>${esc(L(c.name))}</a>`).join('')}</div>
        </div></div>`;
    }
    const tt = PS.cart.totals();
    const bad = PS.cart.hasProblem();
    return `${head}
      <div class="ov__scroll cart">
        ${bad ? `<div class="notice notice--warn" role="alert"><span>${esc(t('cart.problem'))}</span><button type="button" class="u" data-act="rm-problems">${esc(t('cart.problemFix'))}</button></div>` : ''}
        <ul class="cart__list">${lines.map(lineHtml).join('')}</ul>
        <ul class="cart__assure">
          <li>${icon('truck', 18)}<span>${esc(t('strip.delivery'))} — ${esc(tt.delivery.state === 'tbd' ? t('delivery.tbd') : deliveryLabel(tt))}</span></li>
          <li>${icon('chat', 18)}<span>${esc(cfg.payment.cashOnDelivery ? t('pay.cod') : t('pay.tbd'))}</span></li>
        </ul>
      </div>
      <footer class="ov__foot cart__foot">
        <dl class="sum">
          <div><dt>${esc(t('cart.subtotal'))}</dt><dd>${money(tt.subtotal)}</dd></div>
          <div class="sum__sm"><dt>${esc(t('cart.delivery'))}</dt><dd>${esc(deliveryLabel(tt))}</dd></div>
          ${tt.total != null && tt.delivery.state === 'fee' ? `<div class="sum__tot"><dt>${esc(t('cart.total'))}</dt><dd>${money(tt.total)}</dd></div>` : ''}
        </dl>
        <button type="button" class="btn btn--primary btn--block" data-act="checkout"${bad ? ' disabled' : ''}>${esc(t('cart.checkout'))} ${icon('arrowRight', 18)}</button>
        <button type="button" class="btn btn--text btn--block" data-act="close-overlay">${esc(t('cart.continue'))}</button>
      </footer>`;
  };

  P.cart = () => {
    P.hideAdded();
    if (O.has('cart')) return;
    O.open('cart', { type: 'drawer', label: t('cart.title'), html: P.cartHtml() });
  };
  P.refreshCart = (focus) => { if (O.has('cart')) O.update('cart', P.cartHtml(), focus ? { focus } : null); };

  /* ======================================================================
     CONFIRMATION D'AJOUT — claire, non bloquante (on continue ses achats)
     ====================================================================== */
  let addedTimer = null;
  const addedEl = () => document.getElementById('added');
  P.hideAdded = () => {
    const el = addedEl();
    clearTimeout(addedTimer);
    if (el) el.classList.remove('is-on');
  };
  P.added = (l, capped) => {
    const el = addedEl();
    if (!el || !l) return;
    const p = l.product, name = cat.name(p), n = PS.cart.count();
    el.innerHTML = `<div class="added__in">
      <span class="plate added__img">${M.tag(M.first(p, l.color), { alt: '', w: 320, widths: [320], sizes: '64px', icon: M.catIcon(p) })}</span>
      <div class="added__txt">
        <b class="added__ok">${icon('check', 18)} ${esc(t('added.title'))}</b>
        <span class="added__name">${esc(name)}</span>
        ${variantText(l) ? `<span class="added__var">${esc(variantText(l))}</span>` : ''}
        ${capped ? `<span class="added__var">${esc(t('added.max', { n: PS.cart.max() }))}</span>` : ''}
      </div>
      <button type="button" class="ibtn added__x" data-act="added-close" aria-label="${esc(t('a11y.close'))}">${icon('close', 18)}</button>
      <div class="added__act">
        <button type="button" class="btn btn--primary btn--sm" data-act="cart">${esc(t('added.view'))} <span class="btn__n">${n}</span></button>
        <button type="button" class="btn btn--line btn--sm" data-act="added-close">${esc(t('added.continue'))}</button>
      </div>
    </div>`;
    el.classList.add('is-on');
    ui.live(t('added.live', { name, n: PS.count(n, 'product') }));
    clearTimeout(addedTimer);
    const arm = () => { clearTimeout(addedTimer); addedTimer = setTimeout(P.hideAdded, 7000); };
    arm();
    el.onmouseenter = el.onfocusin = () => clearTimeout(addedTimer);
    el.onmouseleave = el.onfocusout = arm;
  };

  /* ======================================================================
     AJOUT RAPIDE (le « + » des cartes)
     - produit sans option : ajouté directement
     - produit avec couleur / taille : petit panneau de choix, sans quitter la liste
     ====================================================================== */
  P.quick = (id) => {
    const p = cat.byId(id);
    if (!p || !cat.purchasable(p)) return;
    if (!cat.needsOptions(p)) {
      const res = PS.cart.add(p.id, {}, 1);
      if (res.ok) P.added(res.line, res.capped);
      return;
    }
    const st = { color: p.colors.find((c) => cat.colorOk(p, c)) || p.colors[0], size: '' };
    const sizeLab = cat.sizeLabel(p);
    const name = cat.name(p);
    const sizesHtml = () => cat.sizeOptions(p, st.color).map((s) => `<label class="sz${s.ok ? '' : ' is-off'}"><input type="radio" name="qsize" value="${esc(s.v)}"${s.ok ? '' : ' disabled'}${st.size === s.v ? ' checked' : ''}><span class="sz__b" dir="ltr">${esc(s.v)}</span><span class="sr-only">${s.ok ? '' : ' — ' + esc(t('badge.out'))}</span></label>`).join('');
    const imgHtml = () => M.tag(M.first(p, st.color), { alt: M.alt(p, st.color, 0, 1), w: 480, widths: [480], sizes: '(min-width:768px) 200px, 34vw', icon: M.catIcon(p) });

    O.open('quick', {
      type: 'sheet',
      label: name,
      html: `${ui.panelHead(esc(t('quick.title')))}
        <div class="ov__scroll quick">
          <div class="quick__top">
            <a class="plate quick__img" id="quick-img" ${a('/produit/' + p.slug)} tabindex="-1" aria-hidden="true">${imgHtml()}</a>
            <div class="quick__meta">
              <p class="kicker">${esc(cat.typeLabel(p))}</p>
              <p class="quick__name">${esc(name)}</p>
              <p class="quick__price">${ui.price(p)}</p>
              <a class="more more--line" ${a('/produit/' + p.slug)}>${esc(t('quick.full'))} ${icon('arrowRight', 14)}</a>
            </div>
          </div>
          <form id="quick-form" novalidate>
            ${p.colors.length > 1 ? `<div class="opt" role="radiogroup" aria-labelledby="qcolor-lab">
              <div class="opt__head"><span class="opt__l" id="qcolor-lab">${esc(t('pdp.chooseColor'))}<span class="opt__v" id="quick-color">${esc(cat.colorName(st.color))}</span></span></div>
              <div class="sw-row">${p.colors.map((cl) => `<label class="sw${cl.unavailable ? ' is-off' : ''}"><input type="radio" name="qcolor" value="${esc(cl.key)}"${cl.key === st.color.key ? ' checked' : ''}${cl.unavailable ? ' disabled' : ''}><span class="sw__dot${U.lum(cl.hex) > 0.8 ? ' is-light' : ''}" style="${ui.swatchStyle(cl)}"></span><span class="sr-only">${esc(cat.colorName(cl))}</span></label>`).join('')}</div></div>` : ''}
            ${p.sizes.length ? `<div class="opt" role="radiogroup" aria-labelledby="qsize-lab" id="quick-size-box"><div class="opt__head"><span class="opt__l" id="qsize-lab">${esc(t('pdp.chooseSize', { label: sizeLab }))}</span></div><div class="sz-row" id="quick-sizes">${sizesHtml()}</div></div>` : ''}
            <p class="pdp__err" id="quick-err" role="alert" hidden></p>
          </form>
        </div>
        <footer class="ov__foot"><button type="submit" form="quick-form" class="btn btn--primary btn--block">${esc(t('cta.add'))} · ${money(p.price)}</button></footer>`,
      onOpen(r) {
        const form = r.panel.querySelector('#quick-form'), err = r.panel.querySelector('#quick-err');
        form.addEventListener('change', (e) => {
          if (e.target.name === 'qcolor') {
            st.color = cat.colorByKey(p, e.target.value) || st.color;
            r.panel.querySelector('#quick-color').textContent = cat.colorName(st.color);
            r.panel.querySelector('#quick-img').innerHTML = imgHtml();
            const box = r.panel.querySelector('#quick-sizes');
            if (box) { if (st.size && !cat.sizeOptions(p, st.color).find((s) => s.v === st.size && s.ok)) st.size = ''; box.innerHTML = sizesHtml(); }
          } else if (e.target.name === 'qsize') st.size = e.target.value;
          err.hidden = true;
        });
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          if (p.sizes.length && !st.size) {
            err.textContent = t('pdp.needSize', { label: sizeLab.toLowerCase() });
            err.hidden = false;
            const box = r.panel.querySelector('#quick-size-box');
            box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake');
            const f1 = box.querySelector('input:not([disabled])');
            if (f1) f1.focus();
            return;
          }
          const res = PS.cart.add(p.id, { color: st.color.key, size: st.size }, 1);
          if (!res.ok) { err.textContent = t('pdp.cantAdd'); err.hidden = false; return; }
          O.close('quick');
          setTimeout(() => P.added(res.line, res.capped), 120);
        });
      },
    });
  };

  /* ======================================================================
     GUIDE DES TAILLES
     ====================================================================== */
  P.sizeGuide = (id) => {
    const p = cat.byId(id);
    const label = p ? cat.sizeLabel(p) : t('filter.size');
    const rows = (cfg.sizeGuide && cfg.sizeGuide.rows) || [];
    const ask = p ? PS.wa.url(PS.wa.productMessage(p, null, '', '', t('wa.sizeIntro'))) : PS.wa.helpUrl();
    O.open('sizeguide', {
      type: 'sheet',
      label: t('pdp.sizeGuide', { label }),
      html: `${ui.panelHead(esc(t('pdp.sizeGuide', { label })))}
        <div class="ov__scroll sg">
          ${rows.length ? `<table class="sg__t"><thead><tr><th scope="col">${esc(label)}</th><th scope="col">${esc(t('sg.length'))}</th></tr></thead><tbody>${rows.map((r) => `<tr><th scope="row" dir="ltr">${esc(r[0])}</th><td dir="ltr">${esc(r[1])}</td></tr>`).join('')}</tbody></table>` : ''}
          <p class="sg__p">${esc(rows.length ? t('sg.between') : t('sg.help', { label: label.toLowerCase() }))}</p>
          <a class="btn btn--wa-solid btn--block" href="${esc(ask)}" ${ext}>${icon('whatsapp', 20)} ${esc(t('cta.writeWa'))}</a>
        </div>`,
    });
  };

  /* ======================================================================
     ZOOM PHOTO — plein écran, balayage, pincement pour zoomer (mobile), clic pour zoomer (ordinateur)
     ====================================================================== */
  P.lightbox = (images, start, altFn) => {
    const n = images.length;
    O.open('zoom', {
      type: 'light',
      label: t('a11y.zoom'),
      html: `<div class="lb">
          <div class="lb__bar"><span class="lb__n" id="lb-n" dir="ltr"></span><button type="button" class="ibtn" data-act="close-overlay" aria-label="${esc(t('a11y.close'))}">${icon('close', 24)}</button></div>
          <div class="lb__track" id="lb-track" tabindex="0">${images.map((im, i) => `<div class="lb__s"><div class="lb__z">${M.tag(im, { alt: altFn ? altFn(i) : '', ratio: null, w: 1600, widths: [1000, 1600], sizes: '100vw', eager: i === start })}</div></div>`).join('')}</div>
          ${n > 1 ? `<button type="button" class="lb__nav lb__nav--p" data-lb="-1" aria-label="${esc(t('a11y.prev'))}">${icon('chevronLeft', 26)}</button><button type="button" class="lb__nav lb__nav--n" data-lb="1" aria-label="${esc(t('a11y.next'))}">${icon('chevronRight', 26)}</button>` : ''}
        </div>`,
      onOpen(r) {
        const track = r.panel.querySelector('#lb-track'), counter = r.panel.querySelector('#lb-n');
        let i = start || 0;
        const sign = PS.dir === 'rtl' ? -1 : 1;
        const paint = () => { counter.textContent = n > 1 ? (i + 1) + ' / ' + n : ''; };
        const go = (k, smooth) => {
          i = Math.max(0, Math.min(n - 1, k));
          track.scrollTo({ left: sign * i * track.clientWidth, behavior: smooth && !U.reduceMotion() ? 'smooth' : 'auto' });
          paint();
        };
        requestAnimationFrame(() => go(i, false));
        track.addEventListener('scroll', () => {
          const k = Math.round(Math.abs(track.scrollLeft) / (track.clientWidth || 1));
          if (k !== i) { i = k; paint(); U.$$('.lb__z.is-zoomed', track).forEach((z) => z.classList.remove('is-zoomed')); }
        }, { passive: true });
        r.panel.addEventListener('click', (e) => {
          const nav = e.target.closest('[data-lb]');
          if (nav) { go(i + (+nav.getAttribute('data-lb')), true); return; }
          const z = e.target.closest('.lb__z');
          if (z && window.matchMedia('(hover: hover)').matches) {
            const b = z.getBoundingClientRect();
            z.style.setProperty('--ox', ((e.clientX - b.left) / b.width) * 100 + '%');
            z.style.setProperty('--oy', ((e.clientY - b.top) / b.height) * 100 + '%');
            z.classList.toggle('is-zoomed');
          }
        });
        r.panel.addEventListener('mousemove', (e) => {
          const z = e.target.closest('.lb__z.is-zoomed');
          if (!z) return;
          const b = z.getBoundingClientRect();
          z.style.setProperty('--ox', ((e.clientX - b.left) / b.width) * 100 + '%');
          z.style.setProperty('--oy', ((e.clientY - b.top) / b.height) * 100 + '%');
        });
        r.panel.addEventListener('keydown', (e) => {
          const next = PS.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight', prev = PS.dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
          if (e.key === next) go(i + 1, true); else if (e.key === prev) go(i - 1, true);
        });
        paint();
      },
    });
  };

  /* ======================================================================
     CARTE — l'iframe Google Maps n'est chargée que si le visiteur la demande
     ====================================================================== */
  P.map = () => {
    const box = document.getElementById('map');
    if (!box || box.querySelector('iframe')) return;
    const s = cfg.store;
    box.innerHTML = `<iframe title="${esc(t('store.mapTitle', { brand: cfg.brand.name }))}" src="https://www.google.com/maps?q=${s.lat},${s.lng}&z=16&hl=${PS.lang}&output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>`;
  };
})();
