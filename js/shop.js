/* PRINCE SHOP — page boutique : filtres, tri, grille, synchronisés avec l'URL
   URL : ?q=…&tri=prix-asc&type=mocassins,sneakers&taille=38,39&couleur=noir&pour=femme&prix=250-400&pmin=…&pmax=…&dispo=1 */
(function () {
  const PS = (window.PS = window.PS || {});
  const U = PS.util, cfg = PS.CONFIG, cat = PS.catalog, M = PS.media, icon = PS.icon, R = PS.router, ui = PS.ui, t = PS.t, L = PS.L;
  const esc = U.esc;
  const SORTS = ['new', 'prix-asc', 'prix-desc'];
  const list = (v) => (v ? String(v).split(',').map((s) => s.trim()).filter(Boolean) : []);
  const num = (v) => { const n = parseInt(v, 10); return isNaN(n) || n < 0 ? null : n; };

  function parse(q) {
    return {
      q: (q.get('q') || '').trim(),
      sort: SORTS.includes(q.get('tri')) ? q.get('tri') : 'new',
      types: list(q.get('type')), sizes: list(q.get('taille')), colors: list(q.get('couleur')), genders: list(q.get('pour')),
      budget: cat.budgetByKey(q.get('prix') || '') ? q.get('prix') : '',
      pmin: num(q.get('pmin')), pmax: num(q.get('pmax')),
      avail: q.get('dispo') === '1',
    };
  }
  function toQuery(f) {
    const p = new URLSearchParams();
    if (f.q) p.set('q', f.q);
    if (f.sort !== 'new') p.set('tri', f.sort);
    if (f.types.length) p.set('type', f.types.join(','));
    if (f.sizes.length) p.set('taille', f.sizes.join(','));
    if (f.colors.length) p.set('couleur', f.colors.join(','));
    if (f.genders.length) p.set('pour', f.genders.join(','));
    if (f.budget) p.set('prix', f.budget);
    if (f.pmin != null) p.set('pmin', f.pmin);
    if (f.pmax != null) p.set('pmax', f.pmax);
    if (f.avail) p.set('dispo', '1');
    return p;
  }
  /* état → critères du catalogue (max exclu pour une tranche, inclus pour une saisie libre) */
  function criteria(f) {
    const b = f.budget ? cat.budgetByKey(f.budget) : null;
    let min = null, max = null;
    if (b) { min = b.min == null ? null : b.min; max = b.max == null ? null : b.max; }
    if (f.pmin != null) min = f.pmin;
    if (f.pmax != null) max = f.pmax + 1;
    return { q: f.q, types: f.types, sizes: f.sizes, colors: f.colors, genders: f.genders, min, max, avail: f.avail };
  }
  const activeCount = (f) => (f.budget || f.pmin != null || f.pmax != null ? 1 : 0) + f.sizes.length + f.colors.length + f.genders.length + (f.avail ? 1 : 0);
  const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : arr.concat(v));

  PS.shopUI = {
    mount(main, ctx) {
      let f = parse(ctx.query);
      const base = ctx.q ? cat.search(ctx.q) : ctx.mode === 'news' ? cat.news(12) : ctx.cat ? cat.inCategory(ctx.cat.id) : cat.all();
      const facets = cat.facets(base);
      const showSize = !!(ctx.cat && ctx.cat.sizeFilter && facets.sizes.length > 1);
      const showType = facets.types.length > 1 && !!ctx.cat;
      const showGender = facets.genders.filter((g) => g.key !== 'mixte').length > 1;
      const showColor = facets.colors.length > 1;
      const budgets = cat.budgets(base);
      const sizeLab = ctx.cat ? L(ctx.cat.sizeLabel) : t('filter.size');
      /* on écarte de l'URL ce qui ne s'applique pas à cette page */
      if (!showSize) f.sizes = [];
      if (!showType) f.types = [];
      if (!showGender) f.genders = [];

      const $ = (s) => U.$(s, main);
      const grid = $('#grid'), side = $('#shop-side'), chips = $('#shop-chips');
      const sortSel = $('#sort');

      /* ---------- formulaire de filtres (colonne sur ordinateur, panneau sur mobile) ---------- */
      const group = (title, body, key) => `<fieldset class="fg" data-g="${key}"><legend class="fg__t">${esc(title)}</legend>${body}</fieldset>`;
      function formHtml(scope) {
        const n = (k) => scope + '-' + k;
        let h = '';
        if (budgets.length || facets.price) {
          h += group(t('filter.price'), `
            <div class="fchips">
              <label class="fchip"><input type="radio" name="${n('prix')}" data-f="prix" value=""><span>${esc(t('filter.anyPrice'))}</span></label>
              ${budgets.map((b) => `<label class="fchip"><input type="radio" name="${n('prix')}" data-f="prix" value="${esc(b.key)}"><span>${esc(cat.budgetLabel(b))}<small>${b.count}</small></span></label>`).join('')}
            </div>
            <div class="frange">
              <label><span class="sr-only">${esc(t('filter.min'))}</span><input type="number" inputmode="numeric" min="0" step="10" data-f="pmin" placeholder="${esc(t('filter.min'))}${facets.price ? ' ' + facets.price.min : ''}" dir="ltr"></label>
              <span aria-hidden="true">–</span>
              <label><span class="sr-only">${esc(t('filter.max'))}</span><input type="number" inputmode="numeric" min="0" step="10" data-f="pmax" placeholder="${esc(t('filter.max'))}${facets.price ? ' ' + facets.price.max : ''}" dir="ltr"></label>
              <span class="frange__cur">${esc(L(cfg.currency))}</span>
            </div>`, 'prix');
        }
        if (showSize) {
          h += group(sizeLab, `<div class="fchips fchips--sq">${facets.sizes.map((s) => `<label class="fchip fchip--sq"><input type="checkbox" data-f="taille" value="${esc(s)}"><span dir="ltr">${esc(s)}</span></label>`).join('')}</div>`, 'taille');
        }
        if (showColor) {
          h += group(t('filter.color'), `<div class="fsw">${facets.colors.map((c) => `<label class="fswi"><input type="checkbox" data-f="couleur" value="${esc(c.key)}"><span class="fswi__d${U.lum(c.hex) > 0.8 ? ' is-light' : ''}" style="background:${esc(c.hex)}"></span><span class="fswi__l">${esc(L(c.name))}</span></label>`).join('')}</div>`, 'couleur');
        }
        if (showGender) {
          h += group(t('filter.gender'), `<div class="fchips">${facets.genders.filter((g) => g.key !== 'mixte').map((g) => `<label class="fchip"><input type="checkbox" data-f="pour" value="${esc(g.key)}"><span>${esc(L(g.name))}</span></label>`).join('')}</div>`, 'pour');
        }
        if (facets.hasUnavailable) {
          h += `<label class="fcheck"><input type="checkbox" data-f="dispo"><span>${esc(t('filter.avail'))}</span></label>`;
        }
        return h;
      }
      /* reflète l'état dans un formulaire, sans le redessiner (le focus est conservé) */
      function syncForm(root) {
        if (!root) return;
        U.$$('[data-f]', root).forEach((el) => {
          const k = el.getAttribute('data-f');
          if (k === 'prix') el.checked = el.value === (f.pmin != null || f.pmax != null ? '\u0000' : f.budget);
          else if (k === 'taille') el.checked = f.sizes.includes(el.value);
          else if (k === 'couleur') el.checked = f.colors.includes(el.value);
          else if (k === 'pour') el.checked = f.genders.includes(el.value);
          else if (k === 'dispo') el.checked = f.avail;
          else if (k === 'pmin' && document.activeElement !== el) el.value = f.pmin == null ? '' : f.pmin;
          else if (k === 'pmax' && document.activeElement !== el) el.value = f.pmax == null ? '' : f.pmax;
        });
      }
      function onFormChange(e) {
        const el = e.target.closest('[data-f]');
        if (!el) return;
        const k = el.getAttribute('data-f');
        if (k === 'prix') { f.budget = el.value; f.pmin = null; f.pmax = null; }
        else if (k === 'taille') f.sizes = toggle(f.sizes, el.value);
        else if (k === 'couleur') f.colors = toggle(f.colors, el.value);
        else if (k === 'pour') f.genders = toggle(f.genders, el.value);
        else if (k === 'dispo') f.avail = el.checked;
        else if (k === 'pmin' || k === 'pmax') {
          f[k] = num(el.value);
          if (f.pmin != null && f.pmax != null && f.pmax < f.pmin) { const x = f.pmin; f.pmin = f.pmax; f.pmax = x; }
          f.budget = '';
        }
        apply();
      }

      /* ---------- rangée de puces : catégories (page « tout ») ou types (page catégorie) ---------- */
      function renderChips() {
        if (ctx.q || ctx.mode === 'news') { chips.innerHTML = ''; return; }
        if (!ctx.cat) {
          chips.innerHTML = `<div class="chips" role="navigation" aria-label="${esc(t('filter.category'))}">
            <a class="chip is-on" ${R.a('/boutique')} aria-current="page">${esc(t('filter.all'))}</a>
            ${cat.categories().map((c) => `<a class="chip" ${R.a('/boutique/' + c.id)}>${esc(L(c.name))}<small>${c.count}</small></a>`).join('')}
          </div>`;
        } else if (showType) {
          chips.innerHTML = `<div class="chips" role="group" aria-label="${esc(t('filter.type'))}">
            <button type="button" class="chip${f.types.length ? '' : ' is-on'}" data-act="type" data-v="" aria-pressed="${!f.types.length}">${esc(t('filter.all'))}</button>
            ${facets.types.map((x) => `<button type="button" class="chip${f.types.includes(x.key) ? ' is-on' : ''}" data-act="type" data-v="${esc(x.key)}" aria-pressed="${f.types.includes(x.key)}">${esc(L(x.name))}<small>${x.count}</small></button>`).join('')}
          </div>`;
        } else chips.innerHTML = '';
      }

      /* ---------- filtres actifs, retirables un par un ---------- */
      function renderActive() {
        const out = [];
        const chip = (label, k, v) => `<button type="button" class="af" data-act="unfilter" data-k="${k}" data-v="${esc(v || '')}" aria-label="${esc(t('filter.remove', { label }))}"><span>${esc(label)}</span>${icon('close', 14)}</button>`;
        if (f.budget) out.push(chip(cat.budgetLabel(cat.budgetByKey(f.budget)), 'prix'));
        else if (f.pmin != null || f.pmax != null) out.push(chip((f.pmin == null ? 0 : f.pmin) + ' – ' + (f.pmax == null ? '∞' : f.pmax) + ' ' + L(cfg.currency), 'prix'));
        f.sizes.forEach((s) => out.push(chip(sizeLab + ' ' + s, 'taille', s)));
        f.colors.forEach((c) => { const x = facets.colors.find((y) => y.key === c); out.push(chip(x ? L(x.name) : c, 'couleur', c)); });
        f.genders.forEach((g) => out.push(chip(L(PS.GENDERS[g]) || g, 'pour', g)));
        if (f.avail) out.push(chip(t('filter.availShort'), 'dispo'));
        $('#afilters').innerHTML = out.length ? out.join('') + `<button type="button" class="af af--clear" data-act="clear-filters">${esc(t('filter.clear'))}</button>` : '';
        const n = activeCount(f), badge = $('#filt-n');
        badge.hidden = n === 0; badge.textContent = n;
        const sc = U.$('#side-clear', side);
        if (sc) sc.hidden = n === 0;
      }

      /* ---------- grille ---------- */
      function results() { return cat.sort(cat.filter(base, criteria(f)), f.sort); }
      const landscape = (p) => { const im = M.first(p); return !!(im && im.w && im.h && im.w > im.h * 1.2); };

      function renderGrid(animate) {
        const res = results();
        const n = res.length;
        const label = PS.count(n, 'product');
        $('#count-top').textContent = label;
        $('#count').textContent = t('filter.shown', { n: label });
        const empty = $('#empty');
        if (!n) {
          grid.innerHTML = '';
          empty.hidden = false;
          const ask = ctx.q ? t('wa.lookingFor', { q: ctx.q }) : '';
          empty.innerHTML = `<div class="empty">
            <p class="empty__t">${esc(ctx.q ? t('shop.emptyQ', { q: ctx.q }) : t('shop.empty'))}</p>
            <p class="empty__s">${esc(t('shop.emptyS'))}</p>
            <div class="empty__b">
              ${activeCount(f) || f.types.length ? `<button type="button" class="btn btn--primary" data-act="clear-filters">${esc(t('filter.clear'))}</button>` : `<a class="btn btn--primary" ${R.a('/boutique')}>${esc(t('nf.cta'))}</a>`}
              <a class="btn btn--wa" href="${esc(PS.wa.helpUrl(ask))}" target="_blank" rel="noopener">${icon('whatsapp', 20)} ${esc(t('cta.askWa'))}</a>
            </div></div>`;
          return n;
        }
        empty.hidden = true;
        /* vue par défaut : un produit en grand + un rappel livraison pour rythmer la grille.
           Dès qu'on filtre ou qu'on trie, la grille redevient strictement régulière. */
        const plain = !activeCount(f) && !f.types.length && f.sort === 'new' && !ctx.q && n >= 8;
        let items = res.slice(), wide = null;
        if (plain) {
          const wi = items.findIndex((p, i) => i >= 2 && landscape(p) && cat.purchasable(p));
          if (wi >= 0) { wide = items.splice(wi, 1)[0]; items.splice(4, 0, wide); }
        }
        let html = '';
        items.forEach((p, i) => {
          html += ui.card(p, { eager: i < 2, wide: p === wide, sizes: p === wide ? undefined : '(min-width:1024px) 22vw, 50vw' });
          if (plain && i === 8 && n >= 12) {
            html += `<a class="note" href="${esc(PS.wa.helpUrl())}" target="_blank" rel="noopener">
              <span class="note__k">${icon('truck', 22)}</span><span class="note__t">${esc(t('strip.delivery'))}</span>
              <span class="note__s">${esc(t('note.text'))}</span><span class="note__a">${icon('whatsapp', 16)} ${esc(t('cta.askWa'))}</span></a>`;
          }
        });
        if (animate && !U.reduceMotion()) {
          grid.classList.add('is-swap');
          setTimeout(() => { grid.innerHTML = html; grid.classList.remove('is-swap'); ui.reveal(grid); }, 120);
        } else { grid.innerHTML = html; ui.reveal(grid); }
        return n;
      }

      function sheetCount() {
        const b = document.getElementById('sheet-apply');
        if (b) b.textContent = t('filter.show', { n: PS.count(results().length, 'product') });
      }

      /* applique l'état : URL, grille, puces, formulaires */
      function apply(opts) {
        R.setQuery(toQuery(f));
        renderGrid(true);
        renderActive();
        renderChips();
        syncForm(side);
        const sh = ui.overlay.get('filters');
        if (sh) { syncForm(sh.panel); sheetCount(); }
        if (!(opts && opts.quiet)) ui.live(t('filter.shown', { n: PS.count(results().length, 'product') }));
      }
      function clearAll() {
        f = { ...f, types: [], sizes: [], colors: [], genders: [], budget: '', pmin: null, pmax: null, avail: false };
        apply();
      }

      /* ---------- panneau mobile ---------- */
      function openSheet() {
        const rec = ui.overlay.open('filters', {
          type: 'sheet',
          label: t('filter.title'),
          html: `${ui.panelHead(esc(t('filter.title')))}
            <div class="ov__scroll"><form class="fform" data-filter-form novalidate>${formHtml('sheet')}</form></div>
            <footer class="ov__foot ov__foot--row">
              <button type="button" class="btn btn--line" data-act="clear-filters-sheet">${esc(t('filter.clearShort'))}</button>
              <button type="button" class="btn btn--primary" id="sheet-apply" data-act="close-overlay"></button>
            </footer>`,
          onOpen(r) {
            syncForm(r.panel);
            r.panel.addEventListener('change', onFormChange);
            r.panel.addEventListener('submit', (e) => e.preventDefault());
            r.panel.addEventListener('click', (e) => { if (e.target.closest('[data-act="clear-filters-sheet"]')) clearAll(); });
          },
        });
        sheetCount();
        return rec;
      }

      /* ---------- événements ---------- */
      const onClick = (e) => {
        const b = e.target.closest('[data-act]');
        if (!b || !main.contains(b)) return;
        const act = b.getAttribute('data-act');
        if (act === 'filters') openSheet();
        else if (act === 'clear-filters') clearAll();
        else if (act === 'type') { const v = b.getAttribute('data-v'); f.types = v ? toggle(f.types, v) : []; apply(); }
        else if (act === 'unfilter') {
          const k = b.getAttribute('data-k'), v = b.getAttribute('data-v');
          if (k === 'prix') { f.budget = ''; f.pmin = null; f.pmax = null; }
          else if (k === 'taille') f.sizes = f.sizes.filter((x) => x !== v);
          else if (k === 'couleur') f.colors = f.colors.filter((x) => x !== v);
          else if (k === 'pour') f.genders = f.genders.filter((x) => x !== v);
          else if (k === 'dispo') f.avail = false;
          apply();
        }
      };
      const onSort = () => { f.sort = sortSel.value; apply(); };
      main.addEventListener('click', onClick);
      sortSel.addEventListener('change', onSort);
      side.addEventListener('change', onFormChange);
      const onSubmit = (e) => e.preventDefault();
      side.addEventListener('submit', onSubmit);

      /* ---------- premier rendu ---------- */
      const sideForm = formHtml('side');
      side.innerHTML = sideForm
        ? `<div class="side__head"><h2 class="side__t">${esc(t('filter.title'))}</h2><button type="button" class="side__clear" id="side-clear" data-act="clear-filters" hidden>${esc(t('filter.clear'))}</button></div><form class="fform" data-filter-form novalidate>${sideForm}</form>`
        : '';
      main.querySelector('.shop__layout').classList.toggle('no-side', !sideForm);
      const fbtn = $('[data-act="filters"]');
      if (fbtn) fbtn.hidden = !sideForm;
      sortSel.value = f.sort;
      syncForm(side);
      renderChips();
      renderActive();
      renderGrid(false);
      R.setQuery(toQuery(f));

      return () => {
        main.removeEventListener('click', onClick);
        sortSel.removeEventListener('change', onSort);
        side.removeEventListener('change', onFormChange);
        side.removeEventListener('submit', onSubmit);
      };
    },
  };
})();
