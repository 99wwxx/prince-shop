/* PRINCE SHOP — panier (état + persistance locale). Aucune interface ici. */
(function () {
  const PS = (window.PS = window.PS || {});
  const U = PS.util, cat = PS.catalog, cfg = PS.CONFIG;

  const KEY = 'ps_cart_v2';
  let items = []; // { key, id, color, size, qty }
  const listeners = [];

  const keyOf = (id, color, size) => [id, color || '', size || ''].join('|');
  const maxQty = () => Math.max(1, cfg.cart.maxQtyPerLine || 9);

  function load() {
    const raw = U.store.get(KEY, []);
    items = (Array.isArray(raw) ? raw : [])
      .filter((i) => i && cat.byId(i.id))
      .map((i) => {
        const p = cat.byId(i.id);
        const col = cat.colorByKey(p, i.color) || p.colors[0];
        const size = p.sizes.length ? String(i.size || '') : '';
        return { key: keyOf(i.id, col.key, size), id: i.id, color: col.key, size, qty: Math.min(maxQty(), Math.max(1, parseInt(i.qty, 10) || 1)) };
      });
  }
  function save() { U.store.set(KEY, items.map(({ id, color, size, qty }) => ({ id, color, size, qty }))); }
  function emit(type, key) { listeners.forEach((fn) => fn({ type, key })); }

  function line(i) {
    const p = cat.byId(i.id);
    const col = cat.colorByKey(p, i.color) || p.colors[0];
    let problem = null;
    if (!p.available || col.unavailable) problem = 'unavailable';
    else if (p.sizes.length && !cat.sizeOptions(p, col).find((s) => s.v === i.size && s.ok)) problem = 'size';
    const unit = p.price;
    return { key: i.key, product: p, color: col, size: i.size, qty: i.qty, unit, total: unit == null ? null : unit * i.qty, problem };
  }

  const C = (PS.cart = {
    lines: () => items.map(line),
    line: (key) => { const i = items.find((x) => x.key === key); return i ? line(i) : null; },
    count: () => items.reduce((n, i) => n + i.qty, 0),
    isEmpty: () => items.length === 0,
    hasProblem: () => C.lines().some((l) => l.problem),

    totals() {
      let sub = 0, unknown = 0;
      C.lines().forEach((l) => { if (l.total == null) unknown++; else sub += l.total; });
      const d = C.delivery(sub);
      return { subtotal: sub, unknown, delivery: d, total: d.state === 'tbd' ? null : sub + d.amount };
    },

    /* règles de livraison, 100 % pilotées par la config */
    delivery(sub) {
      const d = cfg.delivery;
      if (d.freeFrom != null && sub >= d.freeFrom) return { state: 'free', amount: 0 };
      if (d.fee != null) return { state: 'fee', amount: d.fee };
      return { state: 'tbd', amount: null };
    },

    add(id, opt, qty) {
      opt = opt || {};
      const p = cat.byId(id);
      if (!p) return { ok: false, reason: 'missing' };
      if (!p.available) return { ok: false, reason: 'unavailable' };
      const col = cat.colorByKey(p, opt.color) || p.colors[0];
      if (col.unavailable) return { ok: false, reason: 'unavailable' };
      if (p.sizes.length) {
        if (!opt.size) return { ok: false, reason: 'size' };
        if (!cat.sizeOptions(p, col).find((s) => s.v === String(opt.size) && s.ok)) return { ok: false, reason: 'size-unavailable' };
      }
      const size = p.sizes.length ? String(opt.size) : '';
      const key = keyOf(id, col.key, size);
      const n = Math.max(1, qty || 1);
      const ex = items.find((i) => i.key === key);
      let capped = false;
      if (ex) { capped = ex.qty + n > maxQty(); ex.qty = Math.min(maxQty(), ex.qty + n); }
      else items.push({ key, id, color: col.key, size, qty: Math.min(maxQty(), n) });
      save(); emit('add', key);
      return { ok: true, key, capped, line: C.line(key) };
    },
    setQty(key, qty) {
      const it = items.find((i) => i.key === key);
      if (!it) return;
      if (qty < 1) return C.remove(key);
      it.qty = Math.min(maxQty(), qty);
      save(); emit('qty', key);
    },
    remove(key) {
      const it = items.find((i) => i.key === key);
      items = items.filter((i) => i.key !== key);
      save(); emit('remove', key);
      return it || null;
    },
    /* remet une ligne supprimée par erreur (« Annuler ») */
    restore(it, index) {
      if (!it || items.find((i) => i.key === it.key)) return;
      items.splice(Math.min(index == null ? items.length : index, items.length), 0, it);
      save(); emit('add', it.key);
    },
    indexOf: (key) => items.findIndex((i) => i.key === key),
    clear() { items = []; save(); emit('clear'); },
    removeProblems() {
      const bad = C.lines().filter((l) => l.problem).map((l) => l.key);
      items = items.filter((i) => !bad.includes(i.key));
      save(); emit('remove');
    },

    on(fn) { listeners.push(fn); },
    max: maxQty,
  });

  load();
  /* synchro entre onglets */
  window.addEventListener('storage', (e) => { if (e.key === KEY) { load(); emit('sync'); } });
})();
