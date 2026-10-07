/* PRINCE SHOP — utilitaires purs (aucune dépendance) */
(function () {
  const PS = (window.PS = window.PS || {});
  const U = (PS.util = {});

  /* ---------- Texte ---------- */
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  U.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ESC[c]);

  /* minuscules, sans accents latins, sans signes de vocalisation arabes — pour la recherche */
  U.norm = (s) =>
    String(s == null ? '' : s)
      .normalize('NFD')
      .replace(/[̀-ًͯ-ْـ]/g, '')
      .replace(/[أإآ]/g, 'ا')   // أ إ آ → ا
      .replace(/ة/g, 'ه')                  // ة → ه
      .replace(/ى/g, 'ي')                  // ى → ي
      .toLowerCase()
      .trim();
  U.slug = (s) => U.norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  /* fragment toujours lu de gauche à droite (téléphones, références) même en arabe */
  U.ltr = (s) => `<span dir="ltr" class="ltr">${U.esc(s)}</span>`;

  /* ---------- Argent ---------- */
  const group = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  U.num = group;
  U.money = (n, plain) => {
    if (n == null || isNaN(n)) return PS.t('price.onRequest');
    const s = group(n) + ' ' + PS.L(PS.CONFIG.currency);
    return plain ? s.replace(/ /g, ' ') : s;
  };

  /* ---------- Téléphone (Maroc) ---------- */
  U.waDigits = (n) => String(n).replace(/\D/g, '');
  U.tel = (n) => 'tel:' + String(n).replace(/[^\d+]/g, '');
  /* '+212662520130' -> '06 62 52 01 30' */
  U.phoneDisplay = (n) => {
    const d = U.waDigits(n);
    if (d.startsWith('212') && d.length === 12) return ('0' + d.slice(3)).replace(/(\d{2})(?=\d)/g, '$1 ').trim();
    return String(n);
  };
  /* Valide un numéro saisi par le client, sans être tatillon sur la forme :
     06…, 07…, 05…, +212 6…, 00212…, 212…, 6… (sans le zéro), chiffres arabes ٠-٩,
     et numéros étrangers avec + (Marocains du monde). */
  U.parsePhone = (raw) => {
    let s = String(raw || '')
      .replace(/[٠-٩]/g, (d) => d.charCodeAt(0) - 0x0660)
      .replace(/[۰-۹]/g, (d) => d.charCodeAt(0) - 0x06F0)
      .replace(/[\s.\-() /]/g, '');
    if (!s) return { ok: false };
    let intl = false;
    if (s.startsWith('00')) s = '+' + s.slice(2);
    if (s.startsWith('+')) {
      if (s.startsWith('+212')) s = '0' + s.slice(4).replace(/^0/, '');
      else intl = true;
    } else if (s.startsWith('212') && s.length >= 12) s = '0' + s.slice(3).replace(/^0/, '');
    else if (/^[567]\d{8}$/.test(s)) s = '0' + s;
    if (!intl && /^0[5-7]\d{8}$/.test(s)) {
      return { ok: true, value: s.replace(/(\d{2})(?=\d)/g, '$1 ').trim(), e164: '+212' + s.slice(1) };
    }
    if (intl && /^\+\d{8,15}$/.test(s)) return { ok: true, value: s, e164: s };
    return { ok: false };
  };

  /* ---------- Stockage (jamais bloquant, même en navigation privée) ---------- */
  const mem = {};
  U.store = {
    get(k, def) {
      try {
        const v = localStorage.getItem(k);
        return v == null ? (k in mem ? mem[k] : def) : JSON.parse(v);
      } catch (e) {
        return k in mem ? mem[k] : def;
      }
    },
    set(k, v) {
      mem[k] = v;
      try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* mémoire seulement */ }
    },
    remove(k) {
      delete mem[k];
      try { localStorage.removeItem(k); } catch (e) { /* noop */ }
    },
  };

  /* ---------- DOM / temps ---------- */
  U.$ = (s, r) => (r || document).querySelector(s);
  U.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  U.debounce = (fn, ms) => {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  };
  U.reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  U.isMobile = () => window.matchMedia('(max-width: 767px)').matches;
  U.focusables = (root) =>
    U.$$('a[href],button:not([disabled]),input:not([disabled]):not([type=hidden]),select:not([disabled]),textarea:not([disabled]),summary,[tabindex]:not([tabindex="-1"])', root)
      .filter((el) => !el.closest('[hidden]') && el.getClientRects().length > 0);

  /* ---------- URLs ---------- */
  U.fileMode = location.protocol === 'file:';
  /* Racine du site : posée par <html data-root="./"> (« ../../ » dans les pages générées). */
  U.BASE = new URL(document.documentElement.getAttribute('data-root') || './', location.href).pathname;
  U.asset = (p) => (/^(https?:|data:|\/\/|\/)/.test(p) ? p : U.BASE + String(p).replace(/^\.\//, ''));
  U.siteUrl = () => (PS.CONFIG.siteUrl || location.origin + U.BASE.replace(/\/$/, '')).replace(/\/$/, '');

  /* tri naturel des tailles (« 36 » < « 40 », S < M < L) */
  const ALPHA = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];
  U.sizeSort = (a, b) => {
    const na = parseFloat(a), nb = parseFloat(b);
    if (!isNaN(na) && !isNaN(nb)) return na - nb;
    const ia = ALPHA.indexOf(String(a).toUpperCase()), ib = ALPHA.indexOf(String(b).toUpperCase());
    if (ia >= 0 && ib >= 0) return ia - ib;
    return String(a).localeCompare(String(b), 'fr', { numeric: true });
  };

  /* luminance d'un hex (bordure des pastilles claires) */
  U.lum = (h) => {
    h = String(h).replace('#', '');
    if (h.length === 3) h = h.split('').map((x) => x + x).join('');
    const c = [0, 2, 4].map((i) => { let v = parseInt(h.slice(i, i + 2), 16) / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
})();
