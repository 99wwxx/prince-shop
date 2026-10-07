/* ==========================================================================
   PRINCE SHOP — CONFIGURATION UNIQUE
   --------------------------------------------------------------------------
   LE fichier à modifier pour : mode démo, numéros, adresse, livraison,
   paiement, tranches de budget, visuels de l'accueil.
   Aucun numéro ni aucune règle n'est écrit ailleurs dans le code.

   Légende
     [VÉRIFIÉ]      confirmé sur le profil Instagram @princeshop_ali ou sur la
                    fiche Google Maps du lien de la bio (contrôles : 06 et 07/10/2026).
     [À CONFIRMER]  information inconnue : laissée vide volontairement.
                    Le site n'affiche rien d'inventé tant qu'elle n'est pas remplie.
   ========================================================================== */
window.PS = window.PS || {};

PS.CONFIG = {

  /* ----------------------------------------------------------------------
     MODE DÉMO
     true  → produits, prix et photos d'exemple ; petit repère « Démo » ;
             le site demande à Google de ne pas l'indexer.
     false → le repère disparaît, le site devient indexable.
             RIEN d'autre ne change : même design, mêmes pages.
     ---------------------------------------------------------------------- */
  DEMO_MODE: true,
  DEMO_INDICATOR: true,        // false = cache le repère « Démo » même en mode démo

  brand: {
    name: 'Prince Shop',
    wordmark: ['PRINCE', 'SHOP'],
    city: { fr: 'Fès', ar: 'فاس' },
    country: 'MA',
  },

  /* URL publique finale, sans « / » final. Ex. 'https://www.princeshop.ma'
     Sert au SEO (canonical, hreflang, sitemap) et aux liens partagés. */
  siteUrl: 'https://99wwxx.github.io/prince-shop',   // démo en ligne (GitHub Pages) — à remplacer par le domaine final

  languages: ['fr', 'ar'],
  defaultLang: 'fr',

  currency: { fr: 'DH', ar: 'درهم', iso: 'MAD' },

  /* ----------------------------------------------------------------------
     CONTACT — un seul endroit pour les numéros (format international)
     ---------------------------------------------------------------------- */
  contact: {
    // [VÉRIFIÉ] numéro étiqueté « WhatsApp » dans la bio Instagram.
    // À reconfirmer avec la boutique avant la mise en ligne : toutes les commandes y arrivent.
    WHATSAPP_NUMBER: '+212662520130',
    // [VÉRIFIÉ] téléphone de la bio Instagram ET de la fiche Google Maps.
    PHONE_NUMBER: '+212664479449',
  },

  instagram: {
    handle: 'princeshop_ali',
    url: 'https://www.instagram.com/princeshop_ali/',
    followers: { fr: '23,9 k', ar: '23.9 ألف' },   // [VÉRIFIÉ 06/10/2026] à rafraîchir de temps en temps
    // 6 photos carrées pour « Vu sur Instagram ». Vide = le site réutilise les photos produits.
    // ex. ['assets/brand/ig-1.jpg', ...]
    images: [],
  },

  /* ----------------------------------------------------------------------
     BOUTIQUE
     ---------------------------------------------------------------------- */
  store: {
    // [VÉRIFIÉ] adresse telle que la boutique l'écrit dans sa bio Instagram.
    address: {
      fr: ['Av. Oran, Montfleuri 1, Zohour', 'Fès, Maroc'],
      ar: ['شارع وهران، مونفلوري 1، الزهور', 'فاس، المغرب'],
    },
    // [VÉRIFIÉ] libellé affiché par Google Maps pour la fiche du lien de la bio.
    // Le nom de rue diffère de la bio (« Rue d'Alep ») : à trancher avec la boutique.
    mapsLabel: '2256+RPV, Rue d’Alep, Fès 30050',
    postalCode: '30050',
    lat: 34.0096047,
    lng: -4.9882087,
    mapsUrl: 'https://maps.app.goo.gl/UuQjvm1TEyzavnbx6',   // lien fourni par la boutique
    // [VÉRIFIÉ] note Google Maps lue le 07/10/2026.
    googleRating: 4.3,
    // [À CONFIRMER] nombre d'avis : non visible sans compte Google. Mettre le chiffre exact
    // (ex. 7) pour l'afficher ; null = seule la note est affichée.
    googleReviewCount: null,
    // [À CONFIRMER] horaires. Google Maps montrait « 10:00–22:30 » le mardi et « ferme à 22:30 »
    // le mercredi, pas la semaine complète. Exemple une fois confirmés :
    //   hours: [ { d: { fr: 'Lundi – Samedi', ar: 'الإثنين – السبت' }, h: '10:00 – 22:30' } ]
    hours: null,
  },

  /* ----------------------------------------------------------------------
     LIVRAISON  — [VÉRIFIÉ] bio : « Livraison disponible partout au Maroc »
     Tout le reste est [À CONFIRMER] : null = « confirmé avec le vendeur ».
     ---------------------------------------------------------------------- */
  delivery: {
    fee: null,        // ex. 35   → frais fixes en DH
    freeFrom: null,   // ex. 500  → livraison offerte dès ce montant
    eta: null,        // ex. { fr: '24 à 72 h', ar: 'من 24 إلى 72 ساعة' }
  },

  /* ----------------------------------------------------------------------
     PAIEMENT — [À CONFIRMER]
     Passer à true UNIQUEMENT si la boutique confirme le paiement à la livraison.
     ---------------------------------------------------------------------- */
  payment: {
    cashOnDelivery: false,
  },

  /* ----------------------------------------------------------------------
     SHOPPER PAR BUDGET — tranches de DÉMO, à adapter aux vrais prix.
     min inclus, max exclu. Une tranche sans produit est masquée toute seule.
     ---------------------------------------------------------------------- */
  budgets: [
    { max: 250 },
    { min: 250, max: 400 },
    { min: 400, max: 600 },
    { min: 600 },
  ],

  cart: {
    maxQtyPerLine: 9,   // pas de donnée de stock : simple plafond de confort
  },

  /* ----------------------------------------------------------------------
     ACCUEIL — visuels (les textes sont dans data/i18n.js, clés « hero.* » / « edito.* »)
     image : même format que les images produits (voir products.js).
     ---------------------------------------------------------------------- */
  hero: {
    productId: 'sac-marine',          // produit montré sur la grande image
    sideProductId: 'mocassin-soleil', // petit visuel secondaire
  },
  editorial: {
    productId: 'mocassin-sable',      // la « paire »
    lookIds: ['mocassin-sable', 'sac-elegance', 'ceinture-classique'],   // le « look »
  },

  /* ----------------------------------------------------------------------
     GUIDE DES POINTURES — [À CONFIRMER]
     Vide = le site propose simplement d'écrire sur WhatsApp.
     Pour afficher un tableau :  rows: [['36', '23 cm'], ['37', '23,5 cm'], ...]
     ---------------------------------------------------------------------- */
  sizeGuide: {
    rows: [],
  },
};
