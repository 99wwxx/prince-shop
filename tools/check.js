// Vérifie les données du site avant de publier :   node tools/check.js
//  - chaque texte utilisé par le code existe en français ET en arabe
//  - chaque produit est complet (id unique, catégorie, type, couleurs, photos, textes bilingues)
//  - rappelle ce qui reste « à confirmer » dans config.js
const fs = require('fs'), path = require('path'), vm = require('vm');
const root = path.resolve(__dirname, '..');

/* charge les fichiers data/ comme le ferait un navigateur (window.PS) */
function loadData() {
  const ctx = { console };
  ctx.window = ctx;
  vm.createContext(ctx);
  ['data/config.js', 'data/i18n.js', 'data/products.js', 'data/legal.js'].forEach((f) => {
    vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
  });
  return ctx.PS;
}
module.exports = { loadData, root };

if (require.main === module) {
  const PS = loadData();
  const errors = [], warns = [];
  const S = PS.STRINGS;

  /* 1. textes */
  const used = new Set(), plurals = new Set();
  fs.readdirSync(path.join(root, 'js')).forEach((f) => {
    const s = fs.readFileSync(path.join(root, 'js', f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    for (const m of s.matchAll(/\bt\('([a-zA-Z0-9_.]+)'/g)) used.add(m[1]);
    for (const m of s.matchAll(/count\([^()]*(?:\([^()]*\)[^()]*)*,\s*'(\w+)'\)/g)) plurals.add(m[1]);
  });
  used.forEach((k) => { if (!S[k]) errors.push('texte manquant : ' + k); });
  Object.entries(S).forEach(([k, v]) => {
    if (!Array.isArray(v) || v.length !== 2 || !v[0] || !v[1]) errors.push('texte incomplet (fr + ar attendus) : ' + k);
    else {
      /* l'arabe peut se passer d'une variable, mais ne doit pas en utiliser une que le français n'a pas */
      const ph = (x) => (x.match(/\{\w+/g) || []);
      const frVars = ph(v[0]);
      if (ph(v[1]).some((x) => !frVars.includes(x))) errors.push('variable inconnue dans le texte arabe : ' + k);
    }
    if (!used.has(k)) warns.push('texte inutilisé : ' + k);
  });
  plurals.forEach((k) => { if (!PS.PLURALS[k]) errors.push('pluriel manquant : ' + k); });

  /* 2. produits */
  const ids = new Set();
  const cats = new Set(PS.CATEGORIES.map((c) => c.id));
  PS.PRODUCTS.forEach((p) => {
    const w = 'produit « ' + p.id + ' » : ';
    if (!p.id || !/^[a-z0-9-]+$/.test(p.id)) errors.push(w + 'id invalide (minuscules, chiffres, tirets)');
    if (ids.has(p.id)) errors.push(w + 'id en double');
    ids.add(p.id);
    if (!p.name || !p.name.fr) errors.push(w + 'name.fr manquant');
    if (!p.name || !p.name.ar) warns.push(w + 'name.ar manquant (le français sera affiché en arabe)');
    if (!cats.has(p.category)) errors.push(w + 'catégorie inconnue « ' + p.category + ' »');
    if (p.type && !PS.TYPES[p.type]) errors.push(w + 'type inconnu « ' + p.type + ' »');
    if (p.price != null && !(Number(p.price) > 0)) errors.push(w + 'prix invalide');
    if (p.compareAtPrice && Number(p.compareAtPrice) <= Number(p.price)) warns.push(w + 'compareAtPrice doit être supérieur au prix (sinon ignoré)');
    if (!p.colors || !p.colors.length) warns.push(w + 'aucune couleur');
    (p.colors || []).forEach((c) => {
      if (c.key && !PS.COLORS[c.key]) errors.push(w + 'couleur inconnue « ' + c.key + ' » (à ajouter dans PS.COLORS)');
      if (!c.images || !c.images.length) warns.push(w + 'pas de photo pour la couleur « ' + c.key + ' »');
      (c.images || []).forEach((im) => {
        const src = typeof im === 'string' ? im : im.src;
        if (!/^https?:/.test(src) && !fs.existsSync(path.join(root, src))) errors.push(w + 'photo introuvable : ' + src);
      });
    });
    (p.unavailableSizes || []).forEach((s) => { if (!(p.sizes || []).map(String).includes(String(s))) warns.push(w + 'taille indisponible « ' + s + ' » absente de sizes'); });
    if (!p.description || !p.description.fr) warns.push(w + 'description.fr manquante');
  });
  [PS.CONFIG.hero.productId, PS.CONFIG.hero.sideProductId, PS.CONFIG.editorial.productId, ...(PS.CONFIG.editorial.lookIds || [])].forEach((id) => {
    if (id && !ids.has(id)) errors.push('config.js : produit « ' + id + ' » introuvable (hero / editorial)');
  });

  /* 3. rappel « à confirmer » */
  const c = PS.CONFIG, todo = [];
  if (c.DEMO_MODE) todo.push('DEMO_MODE est encore à true (produits, prix et photos d\'exemple ; site non indexé)');
  if (!c.siteUrl) todo.push('siteUrl vide (nécessaire pour le sitemap, les liens partagés et le SEO)');
  if (c.delivery.fee == null) todo.push('frais de livraison non renseignés → « confirmés avec le vendeur »');
  if (!c.delivery.eta) todo.push('délai de livraison non renseigné');
  if (!c.payment.cashOnDelivery) todo.push('paiement à la livraison non confirmé → texte neutre');
  if (!c.store.hours) todo.push('horaires de la boutique non renseignés → non affichés');
  if (!c.store.googleReviewCount) todo.push('nombre d\'avis Google non renseigné → seule la note est affichée');
  if (!(c.sizeGuide.rows || []).length) todo.push('guide des pointures vide → renvoi vers WhatsApp');
  const demoImgs = PS.PRODUCTS.filter((p) => (p.colors || []).some((x) => (x.images || []).some((im) => /unsplash/.test(typeof im === 'string' ? im : im.src)))).length;
  if (demoImgs) todo.push(demoImgs + ' produit(s) utilisent encore des photos de démonstration');

  console.log('\nPRINCE SHOP — vérification');
  console.log('  ' + Object.keys(S).length + ' textes (fr + ar), ' + PS.PRODUCTS.length + ' produits, ' + PS.CATEGORIES.length + ' catégories');
  if (errors.length) { console.log('\n✗ ERREURS (' + errors.length + ')'); errors.forEach((e) => console.log('   - ' + e)); }
  if (warns.length) { console.log('\n! Avertissements (' + warns.length + ')'); warns.forEach((e) => console.log('   - ' + e)); }
  console.log('\n… À confirmer avant la mise en ligne (' + todo.length + ')'); todo.forEach((e) => console.log('   - ' + e));
  console.log(errors.length ? '\nÀ corriger avant de publier.\n' : '\n✓ Données cohérentes.\n');
  process.exit(errors.length ? 1 : 0);
}
