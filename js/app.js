/* PRINCE SHOP — démarrage + actions globales (tout bouton porte data-act="…") */
(function () {
  const PS = (window.PS = window.PS || {});
  const U = PS.util, R = PS.router, V = PS.views, ui = PS.ui, P = PS.panels, t = PS.t;
  const O = ui.overlay;

  let lastRemoved = null;

  function removeLine(key) {
    const idx = PS.cart.indexOf(key);
    const l = PS.cart.line(key);
    const it = PS.cart.remove(key);
    if (!it) return;
    lastRemoved = { it, idx };
    ui.toast(t('cart.removed', { name: l ? PS.catalog.name(l.product) : '' }), { label: t('cart.undo'), act: 'undo-rm' }, 6500);
  }

  const ACTIONS = {
    'lang'(b) {
      const l = b.getAttribute('data-lang');
      if (l === PS.lang) return;
      if (O.depth()) { O.popAll(); setTimeout(() => R.switchLang(l), 80); } else R.switchLang(l);
    },
    'menu': () => P.menu(),
    'search': () => P.search(),
    'cart': () => P.cart(),
    'close-overlay': () => O.closePanel(),
    'quick': (b) => P.quick(b.getAttribute('data-id')),
    'checkout': () => PS.checkout.open(),
    'load-map': () => P.map(),
    'size-guide': (b) => P.sizeGuide(b.getAttribute('data-id')),
    'added-close': () => P.hideAdded(),
    'qty'(b) {
      const key = b.getAttribute('data-key'), d = +b.getAttribute('data-d');
      const l = PS.cart.line(key);
      if (!l) return;
      if (l.qty + d < 1) removeLine(key); else PS.cart.setQty(key, l.qty + d);
    },
    'rm': (b) => removeLine(b.getAttribute('data-key')),
    'rm-problems': () => PS.cart.removeProblems(),
    'undo-rm'() {
      if (!lastRemoved) return;
      PS.cart.restore(lastRemoved.it, lastRemoved.idx);
      lastRemoved = null;
      ui.hideToast();
    },
  };

  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('[data-act]');
    if (!b) return;
    const fn = ACTIONS[b.getAttribute('data-act')];
    if (fn) { e.preventDefault(); fn(b); }
  });

  /* ---------- le panier change : compteur, panneau, commande en cours ---------- */
  PS.cart.on((ev) => {
    V.updateCartCount();
    P.refreshCart();
    if (ev.type === 'sync') PS.checkout.sync();
    if (ev.type === 'qty' || ev.type === 'remove') ui.live(t('a11y.cartN', { n: PS.count(PS.cart.count(), 'product') }));
    /* petit rebond du compteur : retour visuel discret */
    if (ev.type === 'add') U.$$('[data-cart-count]').forEach((el) => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); });
  });

  /* ---------- changement de langue : tout le « cadre » est redessiné ---------- */
  document.addEventListener('ps:lang', () => { V.chrome(); P.hideAdded(); ui.hideToast(); });

  /* ---------- en-tête : filet après défilement, se cache en descendant (mobile) ---------- */
  let lastY = 0, ticking = false;
  function onScroll() {
    const y = window.scrollY;
    const h = document.documentElement;
    h.classList.toggle('is-scrolled', y > 8);
    if (O.depth() === 0) {
      if (y > 160 && y > lastY + 6) h.classList.add('hdr-hidden');
      else if (y < lastY - 6 || y < 120) h.classList.remove('hdr-hidden');
    }
    lastY = y;
    ticking = false;
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  document.addEventListener('ps:page', () => { document.documentElement.classList.remove('hdr-hidden'); lastY = 0; });

  /* ---------- photos : fondu à l'arrivée ; repli propre si un fichier est introuvable ---------- */
  document.addEventListener('load', (e) => { const im = e.target; if (im && im.tagName === 'IMG') im.classList.add('is-in'); }, true);
  document.addEventListener('error', (e) => {
    const im = e.target;
    if (!im || im.tagName !== 'IMG' || !im.parentNode || !im.parentNode.classList.contains('plate')) return;
    const ph = document.createElement('span');
    ph.className = 'ph';
    ph.innerHTML = PS.icon('bag', 30) + '<small>' + U.esc(t('img.soon')) + '</small>';
    im.replaceWith(ph);
  }, true);

  /* ---------- démarrage ---------- */
  function boot() {
    R.start();
    V.chrome();
    R.render();
    document.documentElement.classList.add('is-ready');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
