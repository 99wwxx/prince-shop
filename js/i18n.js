/* PRINCE SHOP — langues (français / arabe)
   Les textes sont dans data/i18n.js. Ici : le moteur.
     PS.t('cle', { n: 3 })   → texte de l'interface
     PS.L({ fr, ar })        → champ bilingue d'une donnée (nom de produit…)
     PS.count(n, 'product')  → pluriel correct (y compris les 6 formes de l'arabe)
     PS.applyLang('ar')      → bascule langue + sens d'écriture (RTL) */
(function () {
  const PS = (window.PS = window.PS || {});
  const cfg = PS.CONFIG;
  const S = PS.STRINGS || {};
  const P = PS.PLURALS || {};
  const IDX = { fr: 0, ar: 1 };
  const KEY = 'ps_lang';

  PS.lang = cfg.defaultLang;
  PS.dir = 'ltr';

  PS.t = (key, vars) => {
    const e = S[key];
    if (!e) { if (window.console) console.warn('[i18n] clé manquante :', key); return key; }
    let s = e[IDX[PS.lang]];
    if (s == null) s = e[0];
    if (vars) s = s.replace(/\{(\w+)(:lower)?\}/g, (m, k, low) => (vars[k] == null ? '' : low ? String(vars[k]).toLowerCase() : vars[k]));
    return s;
  };

  PS.L = (o) => {
    if (o == null) return '';
    if (typeof o === 'string' || typeof o === 'number') return String(o);
    if (Array.isArray(o)) return o;
    const v = o[PS.lang];
    return v == null ? (o.fr == null ? '' : o.fr) : v;
  };

  let prAr;
  PS.count = (n, key) => {
    const e = P[key];
    if (!e) return String(n);
    let form;
    if (PS.lang === 'ar') {
      prAr = prAr || (window.Intl && Intl.PluralRules ? new Intl.PluralRules('ar') : null);
      const cat = prAr ? prAr.select(n) : n === 1 ? 'one' : n === 2 ? 'two' : 'other';
      form = e.ar[cat] || e.ar.other;
    } else {
      form = n < 2 ? e.fr[0] : e.fr[1];
    }
    return form.replace('{n}', n);
  };

  PS.isLang = (l) => cfg.languages.indexOf(l) >= 0;
  PS.storedLang = () => { const v = PS.util.store.get(KEY, null); return PS.isLang(v) ? v : null; };
  PS.saveLang = (l) => PS.util.store.set(KEY, l);

  /* police arabe : chargée seulement quand l'arabe est affiché */
  function loadArabicFont() {
    if (document.getElementById('font-ar')) return;
    const l = document.createElement('link');
    l.id = 'font-ar';
    l.rel = 'stylesheet';
    l.href = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600&display=swap';
    document.head.appendChild(l);
  }

  PS.applyLang = (l) => {
    if (!PS.isLang(l)) l = cfg.defaultLang;
    PS.lang = l;
    PS.dir = l === 'ar' ? 'rtl' : 'ltr';
    const h = document.documentElement;
    h.setAttribute('lang', l);
    h.setAttribute('dir', PS.dir);
    if (l === 'ar') loadArabicFont();
  };
})();
