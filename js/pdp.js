/* PRINCE SHOP — fiche produit : galerie, couleur, taille, ajout au panier, barre d'achat mobile */
(function () {
  const PS = (window.PS = window.PS || {});
  const U = PS.util, cfg = PS.CONFIG, cat = PS.catalog, M = PS.media, icon = PS.icon, R = PS.router, ui = PS.ui, t = PS.t;
  const esc = U.esc;
  const RECENT = 'ps_recent';

  PS.pdpUI = {
    mount(main, ctx) {
      const p = ctx.p;
      const st = { color: ctx.color, size: '' };
      const $ = (s) => U.$(s, main);
      const gal = $('#gal'), thumbs = $('#gal-thumbs'), countEl = $('#gal-count');
      const form = $('#pdp-form'), err = $('#opt-err'), pbar = $('#pbar');
      const sizeLab = cat.sizeLabel(p);
      let images = [];
      let idx = 0;

      /* mémorise la visite (« Vus récemment ») */
      const rec = (U.store.get(RECENT, []) || []).filter((id) => id !== p.id);
      rec.unshift(p.id);
      U.store.set(RECENT, rec.slice(0, 12));

      /* ---------- galerie ---------- */
      function renderGallery() {
        images = M.list(p, st.color);
        const n = images.length;
        gal.innerHTML = n
          ? images.map((im, i) => `<button type="button" class="plate gal__s" data-act="zoom" data-i="${i}" aria-label="${esc(t('a11y.zoomN', { i: i + 1, n }))}">${M.tag(im, { alt: M.alt(p, st.color, i, n), ratio: 0.8, w: 960, widths: [960, 1600], sizes: '(min-width:1024px) 46vw, 100vw', eager: i === 0 })}</button>`).join('')
          : `<div class="plate gal__s">${M.tag(null, { alt: cat.name(p), icon: M.catIcon(p) })}</div>`;
        thumbs.innerHTML = n > 1
          ? images.map((im, i) => `<button type="button" class="plate gal__th" data-i="${i}" aria-label="${esc(t('a11y.photoN', { i: i + 1 }))}">${M.tag(im, { alt: '', ratio: 0.8, w: 320, widths: [320], sizes: '72px' })}</button>`).join('')
          : '';
        thumbs.hidden = n < 2;
        gal.scrollLeft = 0;
        idx = 0;
        paintIndex();
        if (pbar) {
          const pi = U.$('#pbar-img', pbar);
          pi.innerHTML = images[0] ? M.tag(images[0], { alt: '', ratio: 0.8, w: 320, widths: [320], sizes: '44px' }) : '';
        }
      }
      function paintIndex() {
        const n = images.length;
        countEl.hidden = n < 2;
        countEl.textContent = (idx + 1) + ' / ' + n;
        U.$$('.gal__th', thumbs).forEach((b, i) => b.classList.toggle('is-on', i === idx));
      }
      function goTo(i, smooth) {
        if (!gal.children[i]) return;
        /* en arabe (RTL), le défilement horizontal se compte en négatif */
        gal.scrollTo({ left: (PS.dir === 'rtl' ? -1 : 1) * i * gal.clientWidth, behavior: smooth && !U.reduceMotion() ? 'smooth' : 'auto' });
      }
      let raf = 0;
      const onScroll = () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const w = gal.clientWidth || 1;
          const i = Math.round(Math.abs(gal.scrollLeft) / w);
          if (i !== idx) { idx = Math.max(0, Math.min(images.length - 1, i)); paintIndex(); }
        });
      };
      gal.addEventListener('scroll', onScroll, { passive: true });
      const onGalKey = (e) => {
        const next = PS.dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight', prev = PS.dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
        if (e.key === next) { e.preventDefault(); goTo(Math.min(images.length - 1, idx + 1), true); }
        else if (e.key === prev) { e.preventDefault(); goTo(Math.max(0, idx - 1), true); }
      };
      gal.addEventListener('keydown', onGalKey);

      /* ---------- tailles ---------- */
      function renderSizes() {
        const box = $('#sizes');
        if (!box) return;
        const opts = cat.sizeOptions(p, st.color);
        if (st.size && !opts.find((s) => s.v === st.size && s.ok)) st.size = '';
        box.innerHTML = opts.map((s) => `<label class="sz${s.ok ? '' : ' is-off'}"><input type="radio" name="size" value="${esc(s.v)}"${s.ok ? '' : ' disabled'}${st.size === s.v ? ' checked' : ''}><span class="sz__b" dir="ltr">${esc(s.v)}</span><span class="sr-only">${s.ok ? '' : ' — ' + esc(t('badge.out'))}</span></label>`).join('');
        const sn = $('#size-name');
        if (sn) sn.textContent = st.size || '';
      }

      function showError(msg, target) {
        err.textContent = msg;
        err.hidden = false;
        if (target) {
          target.classList.remove('shake');
          void target.offsetWidth;
          target.classList.add('shake');
          const r = target.getBoundingClientRect();
          if (r.top < 80 || r.bottom > window.innerHeight - 90) target.scrollIntoView({ block: 'center', behavior: U.reduceMotion() ? 'auto' : 'smooth' });
          const first = target.querySelector('input:not([disabled])');
          if (first) first.focus({ preventScroll: true });
        }
      }
      function clearError() { err.hidden = true; err.textContent = ''; }

      /* vrai si les options obligatoires sont choisies ; sinon explique quoi faire */
      function ready() {
        if (p.sizes.length && !st.size) {
          showError(t('pdp.needSize', { label: sizeLab.toLowerCase() }), $('#size-box'));
          return false;
        }
        return true;
      }

      /* ---------- actions ---------- */
      function add(btn) {
        if (!ready()) return;
        const res = PS.cart.add(p.id, { color: st.color.key, size: st.size }, 1);
        if (!res.ok) { showError(t('pdp.cantAdd')); return; }
        clearError();
        U.$$('[data-act="add-pdp"]', main).forEach((b) => {
          b.classList.add('is-done');
          setTimeout(() => b.classList.remove('is-done'), 1900);
        });
        PS.panels.added(res.line, res.capped);
      }
      function orderWa() {
        if (!ready()) return;
        const url = cfg.siteUrl ? R.url('/produit/' + p.slug, p.colors.length > 1 ? { couleur: st.color.key } : '') : '';
        window.open(PS.wa.url(PS.wa.productMessage(p, st.color, st.size, url)), '_blank', 'noopener');
      }

      const onChange = (e) => {
        const el = e.target;
        if (el.name === 'color') {
          const c = cat.colorByKey(p, el.value);
          if (!c) return;
          st.color = c;
          $('#color-name').textContent = cat.colorName(c);
          renderGallery();
          renderSizes();
          if (p.colors.length > 1) R.setQuery({ couleur: c.key });
          clearError();
          ui.live(cat.colorName(c));
        } else if (el.name === 'size') {
          st.size = el.value;
          const sn = $('#size-name');
          if (sn) sn.textContent = st.size;
          clearError();
        }
      };
      const onSubmit = (e) => { e.preventDefault(); add(); };
      const onClick = (e) => {
        const b = e.target.closest('[data-act],[data-i]');
        if (!b || !main.contains(b)) return;
        const act = b.getAttribute('data-act');
        if (b.classList.contains('gal__th')) { goTo(+b.getAttribute('data-i'), true); return; }
        if (act === 'zoom') {
          if (!images.length) return;
          const i = b.hasAttribute('data-i') ? +b.getAttribute('data-i') : idx;
          PS.panels.lightbox(images, i, (k) => M.alt(p, st.color, k, images.length));
        } else if (act === 'add-pdp' && b.type !== 'submit') add();
        else if (act === 'wa-pdp') orderWa();
      };
      if (form) { form.addEventListener('change', onChange); form.addEventListener('submit', onSubmit); }
      main.addEventListener('click', onClick);

      /* ---------- barre d'achat mobile : visible quand le bouton principal sort de l'écran ---------- */
      let io = null;
      const cta = $('#pdp-cta');
      if (pbar && cta && 'IntersectionObserver' in window) {
        io = new IntersectionObserver((ents) => {
          const en = ents[0];
          const on = !en.isIntersecting && en.boundingClientRect.top < 0;
          pbar.classList.toggle('is-on', on);
          pbar.setAttribute('aria-hidden', String(!on));
          if (on) pbar.removeAttribute('inert'); else pbar.setAttribute('inert', '');
          document.documentElement.classList.toggle('pbar-on', on);
        }, { threshold: 0 });
        io.observe(cta);
      }

      renderGallery();
      renderSizes();

      return () => {
        gal.removeEventListener('scroll', onScroll);
        gal.removeEventListener('keydown', onGalKey);
        main.removeEventListener('click', onClick);
        if (io) io.disconnect();
        document.documentElement.classList.remove('pbar-on');
      };
    },
  };
})();
