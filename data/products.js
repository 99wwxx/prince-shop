/* ==========================================================================
   PRINCE SHOP — CATALOGUE
   Le SEUL fichier à éditer pour ajouter, modifier ou retirer un produit.
   --------------------------------------------------------------------------
   REMPLACER UN PRODUIT DE DÉMO PAR UN VRAI (2 minutes)
     1. Mettez la photo dans  assets/products/shoes | bags | accessories
        (idéal : JPG ou WebP, format portrait 4:5, 1200 × 1500 px).
     2. Dans le bloc du produit, changez : name, price, colors → images.
          images: ['assets/products/shoes/mon-mocassin-noir-1.jpg',
                   'assets/products/shoes/mon-mocassin-noir-2.jpg']
     3. Enregistrez. C'est tout. (En ligne : lancez aussi  node tools/build.js)

   AJOUTER UN PRODUIT : copiez un bloc { ... }, changez « id » (unique) et le reste.

   CHAMPS
     id              identifiant unique en minuscules-avec-tirets (devient l'URL).
     ref             référence courte, reprise dans le message WhatsApp.
     name            { fr, ar } — nom NEUTRE. Pas de marque de luxe sans vérification.
     category        'chaussures' | 'sacs' | 'accessoires'   (PS.CATEGORIES)
     type            clé de PS.TYPES ('mocassins', 'sacs-a-main', ...)
     gender          'femme' | 'homme' | 'mixte'   (facultatif)
     price           prix en DH. null = « Prix sur demande ».
     compareAtPrice  ancien prix — seulement pour une VRAIE promotion.
     added           'AAAA-MM-JJ' : classe les nouveautés.
     badge           'new' ou rien. Pas de faux « best-seller », pas de fausse urgence.
     featured        true → « Sélection du moment » sur l'accueil.
     available       false → produit grisé, impossible à commander.
     colors          [{ key, images, name?, unavailable?, unavailableSizes? }]
                       key    = clé de PS.COLORS (donne le nom FR/AR et la pastille)
                       images = photos DE CETTE COULEUR (la galerie change avec la pastille)
     sizes           ['36','37',...]   — [] si pas de taille.
     unavailableSizes  tailles épuisées.
     description     { fr, ar }
     details         { fr: [...], ar: [...] }
     tags            mots de recherche en plus (français, arabe, darija).

   IMAGES
     • Photo locale  : 'assets/products/bags/sac.jpg'
     • Photo de démo : U('photo-…', x, y, zoom, largeur, hauteur, 'Photographe')
       → images libres Unsplash, recadrées à la volée. À remplacer par les vraies photos.

   NE PAS INVENTER : matière, authenticité, stock chiffré, promotion, avis.
   TOUS LES PRIX CI-DESSOUS SONT DES PRIX DE DÉMONSTRATION.
   ========================================================================== */
window.PS = window.PS || {};

(function () {
  /* photo de démonstration (Unsplash) : x/y = point d'intérêt (0–1), z = zoom */
  const U = (id, fx, fy, z, w, h, by) => ({ src: 'https://images.unsplash.com/' + id, fx, fy, z, w, h, by });

  /* ───────────── Catégories ───────────── */
  PS.CATEGORIES = [
    {
      id: 'chaussures',
      name: { fr: 'Chaussures', ar: 'أحذية' },
      blurb: { fr: 'Mocassins, sneakers, sandales', ar: 'موكاسان، سنيكرز، صنادل' },
      sizeFilter: true,                       // affiche le filtre « Pointure »
      sizeLabel: { fr: 'Pointure', ar: 'المقاس' },
      image: U('photo-1743799349027-93aca0dd6273', 0.45, 0.62, 1, 4032, 6048, 'Kristina Tochilko'),
    },
    {
      id: 'sacs',
      name: { fr: 'Sacs', ar: 'حقائب' },
      blurb: { fr: 'À main, bandoulière, mini', ar: 'حقائب يد، حقائب كتف، ميني' },
      sizeFilter: false,
      sizeLabel: { fr: 'Taille', ar: 'المقاس' },
      image: U('photo-1786872814428-1f0d8d685217', 0.5, 0.55, 1, 2244, 2804, 'Volodymyr Kozhevnikov'),
    },
    {
      id: 'accessoires',
      name: { fr: 'Accessoires', ar: 'إكسسوارات' },
      blurb: { fr: 'Pochettes, portefeuilles, ceintures', ar: 'بوشيت، محافظ، أحزمة' },
      sizeFilter: false,
      sizeLabel: { fr: 'Taille', ar: 'المقاس' },
      image: U('photo-1789110854562-6bff8f621b3b', 0.5, 0.44, 1.5, 4480, 6720, 'engin akyurt'),
    },
  ];

  /* ───────────── Types (sous-catégories) ───────────── */
  PS.TYPES = {
    'mocassins':     { fr: 'Mocassins',        ar: 'موكاسان' },
    'sneakers':      { fr: 'Sneakers',         ar: 'سنيكرز' },
    'sandales':      { fr: 'Sandales',         ar: 'صنادل' },
    'sacs-a-main':   { fr: 'Sacs à main',      ar: 'حقائب يد' },
    'bandouliere':   { fr: 'Sacs bandoulière', ar: 'حقائب كتف' },
    'mini-sacs':     { fr: 'Mini sacs',        ar: 'حقائب ميني' },
    'pochettes':     { fr: 'Pochettes',        ar: 'بوشيت' },
    'portefeuilles': { fr: 'Portefeuilles',    ar: 'محافظ' },
    'ceintures':     { fr: 'Ceintures',        ar: 'أحزمة' },
  };

  PS.GENDERS = {
    femme: { fr: 'Femme', ar: 'نساء' },
    homme: { fr: 'Homme', ar: 'رجال' },
    mixte: { fr: 'Mixte', ar: 'للجنسين' },
  };

  /* ───────────── Couleurs ─────────────
     family = regroupement dans le filtre « Couleur » (clé d'une autre couleur). */
  PS.COLORS = {
    beige:   { fr: 'Beige',       ar: 'بيج',       hex: '#d6c2a4' },
    nude:    { fr: 'Nude',        ar: 'بيج وردي',  hex: '#dcbfae', family: 'beige' },
    creme:   { fr: 'Crème',       ar: 'كريمي',     hex: '#ece2cf', family: 'beige' },
    blanc:   { fr: 'Blanc',       ar: 'أبيض',      hex: '#f6f3ec' },
    noir:    { fr: 'Noir',        ar: 'أسود',      hex: '#17140f' },
    gris:    { fr: 'Gris',        ar: 'رمادي',     hex: '#b9b7b3' },
    argent:  { fr: 'Argent',      ar: 'فضي',       hex: '#cdd0d3', family: 'gris' },
    bleu:    { fr: 'Bleu',        ar: 'أزرق',      hex: '#7f93b5' },
    marine:  { fr: 'Bleu marine', ar: 'كحلي',      hex: '#26375f', family: 'bleu' },
    rose:    { fr: 'Rose',        ar: 'وردي',      hex: '#d98d8a' },
    fuchsia: { fr: 'Fuchsia',     ar: 'فوشيا',     hex: '#e94aa0', family: 'rose' },
    rouge:   { fr: 'Rouge',       ar: 'أحمر',      hex: '#b3202a' },
    orange:  { fr: 'Orange',      ar: 'برتقالي',   hex: '#d9772b' },
    camel:   { fr: 'Camel',       ar: 'جملي',      hex: '#c58a4a' },
    kaki:    { fr: 'Kaki',        ar: 'كاكي',      hex: '#6e6a4f' },
  };

  const W = ['36', '37', '38', '39', '40', '41'];             // pointures femme (démo)
  const M = ['39', '40', '41', '42', '43', '44', '45'];       // pointures homme (démo)

  PS.PRODUCTS = [

    /* ═════════════════════════ CHAUSSURES ═════════════════════════ */
    {
      id: 'mocassin-elegance', ref: 'CH-01',
      name: { fr: 'Mocassin Élégance', ar: 'موكاسان الأناقة' },
      category: 'chaussures', type: 'mocassins', gender: 'femme',
      price: 449, added: '2026-10-02', badge: 'new', featured: true, available: true,
      colors: [{ key: 'beige', images: [U('photo-1743799349027-93aca0dd6273', 0.45, 0.6, 1, 4032, 6048, 'Kristina Tochilko')] }],
      sizes: W, unavailableSizes: ['36'],
      description: {
        fr: 'Mocassin à pampilles, aspect daim et semelle souple. Se porte du matin au soir, avec un jean comme avec une robe.',
        ar: 'موكاسان بشراشيب، بمظهر الشامواه ونعل مرن. يُلبس من الصباح إلى المساء، مع الجينز أو مع الفستان.',
      },
      details: { fr: ['À enfiler', 'Pampilles sur le dessus', 'Semelle souple'], ar: ['سهل الارتداء', 'شراشيب في الأعلى', 'نعل مرن'] },
      tags: ['loafer', 'pampille', 'daim', 'sabat', 'صباط', 'حذاء'],
    },
    {
      id: 'mocassin-sable', ref: 'CH-02',
      name: { fr: 'Mocassin Sable', ar: 'موكاسان الرمال' },
      category: 'chaussures', type: 'mocassins', gender: 'femme',
      price: 479, added: '2026-09-28', featured: true, available: true,
      colors: [{ key: 'nude', images: [
        U('photo-1732708875657-814b6a6fd8fe', 0.6, 0.65, 1.2, 3964, 5948, 'Rydale Clothing'),
        U('photo-1732708874631-d14fbbe406c6', 0.5, 0.75, 1.3, 5792, 3861, 'Rydale Clothing'),
      ] }],
      sizes: W,
      description: {
        fr: 'Mocassin à semelle crantée et bride contrastée. L’allure d’un mocassin, le confort au quotidien.',
        ar: 'موكاسان بنعل مسنّن وشريط بلون مختلف. أناقة الموكاسان وراحة كل يوم.',
      },
      details: { fr: ['À enfiler', 'Semelle crantée', 'Bride contrastée'], ar: ['سهل الارتداء', 'نعل مسنّن', 'شريط بلون مختلف'] },
      tags: ['loafer', 'chunky', 'sabat', 'صباط', 'حذاء'],
    },
    {
      id: 'mocassin-soleil', ref: 'CH-03',
      name: { fr: 'Mocassin Soleil', ar: 'موكاسان الشمس' },
      category: 'chaussures', type: 'mocassins', gender: 'femme',
      price: 349, added: '2026-09-20', featured: true, available: true,
      colors: [{ key: 'orange', images: [U('photo-1654945419086-bcb1c1e1b875', 0.5, 0.5, 1, 3060, 3060, 'Melvin Peter')] }],
      sizes: W, unavailableSizes: ['41'],
      description: {
        fr: 'Mocassin souple à lacet noué, dans un orange lumineux. La touche de couleur qui réveille une tenue simple.',
        ar: 'موكاسان مرن برباط معقود، بلون برتقالي مشرق. لمسة لون تُنعش أي إطلالة بسيطة.',
      },
      details: { fr: ['À enfiler', 'Lacet noué', 'Semelle souple'], ar: ['سهل الارتداء', 'رباط معقود', 'نعل مرن'] },
      tags: ['loafer', 'couleur', 'sabat', 'صباط', 'حذاء'],
    },
    {
      id: 'mocassin-nuit', ref: 'CH-04',
      name: { fr: 'Mocassin Nuit', ar: 'موكاسان الليل' },
      category: 'chaussures', type: 'mocassins', gender: 'homme',
      price: 549, added: '2026-09-12', available: true,
      colors: [{ key: 'noir', images: [
        U('photo-1784822041003-504771076494', 0.5, 0.6, 1.3, 4160, 6240, 'McFollis'),
        U('photo-1784822041097-e0f9e7246e94', 0.5, 0.7, 1.2, 4160, 6240, 'McFollis'),
      ] }],
      sizes: M, unavailableSizes: ['45'],
      description: {
        fr: 'Mocassin noir à motif tressé. Pour les soirées, les fêtes et les grandes occasions.',
        ar: 'موكاسان أسود بنقشة مضفورة. للسهرات والأعياد والمناسبات.',
      },
      details: { fr: ['À enfiler', 'Motif tressé', 'Bout arrondi'], ar: ['سهل الارتداء', 'نقشة مضفورة', 'مقدمة مستديرة'] },
      tags: ['loafer', 'homme', 'soiree', 'sabat', 'صباط', 'حذاء رجالي'],
    },
    {
      id: 'mocassin-azur', ref: 'CH-05',
      name: { fr: 'Mocassin Azur', ar: 'موكاسان لازوردي' },
      category: 'chaussures', type: 'mocassins', gender: 'femme',
      price: 429, added: '2026-10-01', badge: 'new', available: true,
      colors: [{ key: 'bleu', images: [
        U('photo-1678784973551-f38208de2529', 0.5, 0.55, 1, 4672, 7008, 'Mattia Occhi'),
        U('photo-1678784973073-f6a227408e81', 0.45, 0.55, 1, 7008, 4672, 'Mattia Occhi'),
      ] }],
      sizes: W,
      description: {
        fr: 'Mocassin plat bleu gris avec mors doré. Fin, léger, facile à associer.',
        ar: 'موكاسان مسطّح بلون أزرق رمادي مع حلية ذهبية. خفيف وأنيق وسهل التنسيق.',
      },
      details: { fr: ['À enfiler', 'Mors doré', 'Talon plat'], ar: ['سهل الارتداء', 'حلية ذهبية', 'كعب مسطّح'] },
      tags: ['loafer', 'plat', 'sabat', 'صباط', 'حذاء'],
    },
    {
      id: 'sneaker-blanche', ref: 'CH-06',
      name: { fr: 'Sneaker Blanche', ar: 'سنيكرز أبيض' },
      category: 'chaussures', type: 'sneakers', gender: 'mixte',
      price: 399, added: '2026-09-25', featured: true, available: true,
      colors: [{ key: 'blanc', images: [U('photo-1586556694812-fdae68467216', 0.45, 0.4, 1, 5793, 3862, 'Yucel M')] }],
      sizes: ['36', '37', '38', '39', '40', '41', '42', '43', '44'],
      description: {
        fr: 'La sneaker blanche qui va avec tout. Ligne épurée, détail camel au talon.',
        ar: 'السنيكرز الأبيض الذي يناسب كل شيء. تصميم بسيط مع لمسة جملية عند الكعب.',
      },
      details: { fr: ['Lacets', 'Coupe basse', 'Détail contrasté au talon'], ar: ['برباط', 'قصّة منخفضة', 'لمسة بلون مختلف عند الكعب'] },
      tags: ['basket', 'baskets', 'tennis', 'sport', 'سبرديلة', 'حذاء رياضي'],
    },
    {
      id: 'sneaker-duo', ref: 'CH-07',
      name: { fr: 'Sneaker Duo', ar: 'سنيكرز ديو' },
      category: 'chaussures', type: 'sneakers', gender: 'femme',
      price: 459, added: '2026-09-05', available: true,
      colors: [{ key: 'blanc', name: { fr: 'Blanc & beige', ar: 'أبيض وبيج' }, hex2: '#d6c2a4',
        images: [U('photo-1603808033192-082d6919d3e1', 0.5, 0.5, 1, 3000, 4200, 'Mojtaba Fahiminia')] }],
      sizes: W,
      description: {
        fr: 'Sneaker bicolore blanc et beige, touche orange au talon. Simple, mais pas banale.',
        ar: 'سنيكرز بلونين أبيض وبيج، مع لمسة برتقالية عند الكعب. بسيط لكنه مميّز.',
      },
      details: { fr: ['Lacets', 'Coupe basse', 'Deux tons'], ar: ['برباط', 'قصّة منخفضة', 'لونان'] },
      tags: ['basket', 'baskets', 'tennis', 'سبرديلة', 'حذاء رياضي'],
    },
    {
      id: 'sandale-ete', ref: 'CH-08',
      name: { fr: 'Sandale Été', ar: 'صندل الصيف' },
      category: 'chaussures', type: 'sandales', gender: 'femme',
      price: 229, added: '2026-08-20', available: true,
      colors: [{ key: 'blanc', images: [U('photo-1673960287816-18e1dd2fec2b', 0.5, 0.5, 1, 6000, 4000, 'Sandie Clarke')] }],
      sizes: W,
      description: {
        fr: 'Sandale plate à fines brides blanches. Légère, discrète, parfaite pour la saison chaude.',
        ar: 'صندل مسطّح بأشرطة بيضاء رفيعة. خفيف وأنيق ومثالي للموسم الحار.',
      },
      details: { fr: ['Brides fines', 'Talon plat', 'Bride arrière'], ar: ['أشرطة رفيعة', 'كعب مسطّح', 'شريط خلفي'] },
      tags: ['nu-pieds', 'ete', 'plate', 'صندالة'],
    },

    /* ═════════════════════════ SACS ═════════════════════════ */
    {
      id: 'sac-elegance', ref: 'SA-01',
      name: { fr: 'Sac Élégance', ar: 'حقيبة الأناقة' },
      category: 'sacs', type: 'bandouliere', gender: 'femme',
      price: 699, added: '2026-10-03', badge: 'new', featured: true, available: true,
      colors: [{ key: 'beige', images: [U('photo-1786872814428-1f0d8d685217', 0.5, 0.5, 1, 2244, 2804, 'Volodymyr Kozhevnikov')] }],
      sizes: [],
      description: {
        fr: 'Sac porté épaule aux lignes arrondies, dans un beige doux. Sobre, il accompagne toutes les tenues.',
        ar: 'حقيبة كتف بخطوط مستديرة وبلون بيج هادئ. بسيطة وتناسب كل الإطلالات.',
      },
      details: { fr: ['Porté épaule', 'Bandoulière', 'Rabat'], ar: ['تُحمل على الكتف', 'حزام كتف', 'غطاء أمامي'] },
      tags: ['sac a main', 'epaule', 'handbag', 'شنطة', 'صاك', 'ساك'],
    },
    {
      id: 'sac-paris', ref: 'SA-02',
      name: { fr: 'Sac Paris', ar: 'حقيبة باريس' },
      category: 'sacs', type: 'sacs-a-main', gender: 'femme',
      price: 549, added: '2026-09-18', featured: true, available: true,
      colors: [{ key: 'rose', images: [U('photo-1681747685985-a401c271156c', 0.5, 0.5, 1, 6000, 4000, 'Background Foto Pixell Design')] }],
      sizes: [],
      description: {
        fr: 'Sac à main matelassé rose poudré, anse de portée et fermoir doré. Féminin sans en faire trop.',
        ar: 'حقيبة يد مبطّنة بلون وردي هادئ، بيد علوية ومشبك ذهبي. أنثوية من دون مبالغة.',
      },
      details: { fr: ['Anse à la main', 'Bandoulière', 'Motif matelassé'], ar: ['يد علوية', 'حزام كتف', 'نقشة مبطّنة'] },
      tags: ['sac a main', 'matelasse', 'handbag', 'شنطة', 'صاك', 'ساك'],
    },
    {
      id: 'sac-marine', ref: 'SA-03',
      name: { fr: 'Sac Marine', ar: 'حقيبة مارين' },
      category: 'sacs', type: 'sacs-a-main', gender: 'femme',
      price: 649, added: '2026-10-04', badge: 'new', featured: true, available: true,
      colors: [{ key: 'marine', images: [U('photo-1560891958-68bb1fe7fb78', 0.5, 0.6, 1.3, 3024, 3778, 'Irene Kredenets')] }],
      sizes: [],
      description: {
        fr: 'Sac à main structuré bleu marine, anse rigide. La pièce chic pour le bureau comme pour les sorties.',
        ar: 'حقيبة يد منظّمة بلون كحلي ويد صلبة. قطعة أنيقة للعمل وللخروج.',
      },
      details: { fr: ['Anse à la main', 'Forme structurée', 'Rabat'], ar: ['يد علوية', 'شكل منظّم', 'غطاء أمامي'] },
      tags: ['sac a main', 'structure', 'handbag', 'شنطة', 'صاك', 'ساك'],
    },
    {
      id: 'sac-perle', ref: 'SA-04',
      name: { fr: 'Sac Perle', ar: 'حقيبة اللؤلؤة' },
      category: 'sacs', type: 'sacs-a-main', gender: 'femme',
      price: 599, added: '2026-09-10', available: true,
      colors: [{ key: 'gris', images: [
        U('photo-1683921470299-b8f0f3331657', 0.5, 0.4, 1.1, 4265, 6720, 'Genesis Warner'),
        U('photo-1575403538007-acb790100421', 0.5, 0.6, 1.2, 4000, 6000, 'Genesis Warner'),
      ] }],
      sizes: [],
      description: {
        fr: 'Sac à main gris perle à fermoir doré. Une forme nette, une couleur douce, zéro faute de goût.',
        ar: 'حقيبة يد بلون رمادي لؤلؤي ومشبك ذهبي. شكل أنيق ولون هادئ.',
      },
      details: { fr: ['Anse à la main', 'Fermoir doré', 'Forme rigide'], ar: ['يد علوية', 'مشبك ذهبي', 'شكل صلب'] },
      tags: ['sac a main', 'handbag', 'شنطة', 'صاك', 'ساك'],
    },
    {
      id: 'sac-croco', ref: 'SA-05',
      name: { fr: 'Sac Bandoulière Croco', ar: 'حقيبة كتف كروكو' },
      category: 'sacs', type: 'bandouliere', gender: 'femme',
      price: 379, added: '2026-09-22', featured: true, available: true,
      colors: [
        { key: 'rouge', images: [U('photo-1789110854673-b092eb5437e6', 0.5, 0.58, 1.45, 4480, 6720, 'engin akyurt')] },
        { key: 'noir',  images: [U('photo-1789110854681-bedd95d273a3', 0.5, 0.58, 1.45, 4480, 6720, 'engin akyurt')] },
      ],
      sizes: [],
      description: {
        fr: 'Petit sac bandoulière effet croco, rabat et fermoir métal. Juste ce qu’il faut pour sortir les mains libres.',
        ar: 'حقيبة كتف صغيرة بنقشة التمساح، بغطاء ومشبك معدني. كل ما تحتاجينه للخروج بيدين حرّتين.',
      },
      details: { fr: ['Bandoulière réglable', 'Effet croco', 'Rabat'], ar: ['حزام كتف قابل للتعديل', 'نقشة التمساح', 'غطاء أمامي'] },
      tags: ['crossbody', 'croco', 'sac a main', 'شنطة', 'صاك', 'ساك'],
    },
    {
      id: 'mini-sac', ref: 'SA-06',
      name: { fr: 'Mini Sac', ar: 'حقيبة ميني' },
      category: 'sacs', type: 'mini-sacs', gender: 'femme',
      price: 299, added: '2026-09-30', badge: 'new', available: true,
      colors: [{ key: 'creme', images: [U('photo-1789110854963-5a33f2aa2e43', 0.5, 0.55, 1.5, 4480, 6720, 'engin akyurt')] }],
      sizes: [],
      description: {
        fr: 'Mini sac crème à rabat, à porter à la main ou à l’épaule. Petit format, grand effet.',
        ar: 'حقيبة ميني بلون كريمي وبغطاء، تُحمل باليد أو على الكتف. حجم صغير وأثر كبير.',
      },
      details: { fr: ['Format mini', 'Rabat', 'Anse courte'], ar: ['حجم صغير', 'غطاء أمامي', 'يد قصيرة'] },
      tags: ['mini', 'petit sac', 'شنطة', 'صاك', 'ساك'],
    },
    {
      id: 'sac-bowling', ref: 'SA-07',
      name: { fr: 'Sac Bowling', ar: 'حقيبة بولينغ' },
      category: 'sacs', type: 'sacs-a-main', gender: 'femme',
      price: 499, added: '2026-08-28', available: true,
      colors: [{ key: 'noir', images: [U('photo-1705909237050-7a7625b47fac', 0.42, 0.55, 1, 5033, 3355, 'Mobina Ghazazani')] }],
      sizes: [],
      description: {
        fr: 'Sac bowling noir à double anse et boucles. Assez grand pour la journée, assez beau pour le soir.',
        ar: 'حقيبة بولينغ سوداء بيدين وأبازيم. واسعة لليوم وأنيقة للمساء.',
      },
      details: { fr: ['Double anse', 'Fermeture zippée', 'Boucles décoratives'], ar: ['يدان', 'إغلاق بسحّاب', 'أبازيم زخرفية'] },
      tags: ['sac a main', 'handbag', 'شنطة', 'صاك', 'ساك'],
    },

    /* ═════════════════════════ ACCESSOIRES ═════════════════════════ */
    {
      id: 'portefeuille-zippe', ref: 'AC-01',
      name: { fr: 'Portefeuille Zippé', ar: 'محفظة بسحّاب' },
      category: 'accessoires', type: 'portefeuilles', gender: 'femme',
      price: 149, added: '2026-09-15', featured: true, available: true,
      colors: [
        { key: 'rouge', images: [U('photo-1789110855208-f346356650df', 0.5, 0.46, 1.8, 4480, 6720, 'engin akyurt')] },
        { key: 'beige', images: [U('photo-1789110854823-381c81e48b4b', 0.5, 0.46, 1.8, 4480, 6720, 'engin akyurt')] },
        { key: 'noir',  images: [U('photo-1789110854494-196f41b1197c', 0.5, 0.46, 1.8, 4480, 6720, 'engin akyurt')] },
      ],
      sizes: [],
      description: {
        fr: 'Portefeuille zippé tout le tour : billets, cartes et monnaie bien rangés. Existe en trois couleurs.',
        ar: 'محفظة بسحّاب دائري: مكان للأوراق النقدية والبطاقات والقطع. متوفرة بثلاثة ألوان.',
      },
      details: { fr: ['Zip tout le tour', 'Compartiment cartes', 'Poche monnaie'], ar: ['سحّاب دائري', 'جيوب للبطاقات', 'جيب للقطع النقدية'] },
      tags: ['wallet', 'porte monnaie', 'بزطام'],
    },
    {
      id: 'pochette-croco', ref: 'AC-02',
      name: { fr: 'Pochette Croco', ar: 'بوشيت كروكو' },
      category: 'accessoires', type: 'pochettes', gender: 'femme',
      price: 199, added: '2026-09-26', available: true,
      colors: [
        { key: 'rose',    images: [U('photo-1789110854562-6bff8f621b3b', 0.5, 0.44, 1.8, 4480, 6720, 'engin akyurt')] },
        { key: 'fuchsia', images: [U('photo-1789110854836-a7e790d83736', 0.5, 0.44, 1.8, 4480, 6720, 'engin akyurt')] },
      ],
      sizes: [],
      description: {
        fr: 'Pochette longue effet croco. Se glisse dans un sac la journée, se porte seule le soir.',
        ar: 'بوشيت طويلة بنقشة التمساح. توضع داخل الحقيبة نهارًا وتُحمل وحدها مساءً.',
      },
      details: { fr: ['Format long', 'Effet croco', 'Fermeture zippée'], ar: ['شكل طويل', 'نقشة التمساح', 'إغلاق بسحّاب'] },
      tags: ['clutch', 'soiree', 'pochette'],
    },
    {
      id: 'pochette-strass', ref: 'AC-03',
      name: { fr: 'Pochette Strass', ar: 'بوشيت ستراس' },
      category: 'accessoires', type: 'pochettes', gender: 'femme',
      price: 279, added: '2026-10-01', badge: 'new', featured: true, available: true,
      colors: [{ key: 'argent', images: [U('photo-1721103427967-789d08779905', 0.45, 0.6, 1, 3000, 3000, 'PRAHANT STUDIO')] }],
      sizes: [],
      description: {
        fr: 'Pochette de soirée scintillante avec chaînette. Pour les mariages, les fêtes et les grandes soirées.',
        ar: 'بوشيت سهرة لامعة مع سلسلة. للأعراس والحفلات والسهرات.',
      },
      details: { fr: ['Finition scintillante', 'Chaînette amovible', 'Fermoir clip'], ar: ['لمسة لامعة', 'سلسلة قابلة للإزالة', 'مشبك إغلاق'] },
      tags: ['clutch', 'soiree', 'mariage', 'brillant', 'pochette', 'سهرة'],
    },
    {
      id: 'ceinture-classique', ref: 'AC-04',
      name: { fr: 'Ceinture Classique', ar: 'حزام كلاسيكي' },
      category: 'accessoires', type: 'ceintures', gender: 'mixte',
      price: 129, added: '2026-08-30', available: true,
      colors: [{ key: 'kaki', images: [
        U('photo-1750175473844-3d6ded7ba37f', 0.5, 0.45, 1.2, 3648, 5472, 'Brooke Balentine'),
        U('photo-1752386223406-b3d94092d790', 0.5, 0.5, 1.1, 4000, 4000, 'Fashion Needles'),
      ] }],
      sizes: ['S', 'M', 'L'],
      description: {
        fr: 'Ceinture kaki à boucle laiton. Le détail qui termine un jean et une chemise blanche.',
        ar: 'حزام كاكي بإبزيم نحاسي. التفصيل الذي يكمّل الجينز والقميص الأبيض.',
      },
      details: { fr: ['Boucle laiton', 'Largeur moyenne'], ar: ['إبزيم نحاسي', 'عرض متوسط'] },
      tags: ['belt', 'jean', 'سمطة'],
    },
    {
      id: 'portefeuille-compact', ref: 'AC-05',
      name: { fr: 'Portefeuille Compact', ar: 'محفظة صغيرة' },
      category: 'accessoires', type: 'portefeuilles', gender: 'mixte',
      price: 99, added: '2026-07-25', available: false,      // exemple de produit indisponible
      colors: [{ key: 'camel', images: [U('photo-1677326768050-7d437347ca70', 0.5, 0.5, 1.2, 3712, 5568, 'achmad adi wiratama')] }],
      sizes: [],
      description: {
        fr: 'Petit portefeuille camel à rabat. Tient dans une poche, garde l’essentiel.',
        ar: 'محفظة صغيرة بلون جملي وبغطاء. تدخل في الجيب وتحمل الأساسيات.',
      },
      details: { fr: ['Format poche', 'Rabat pression'], ar: ['حجم الجيب', 'غطاء بكبسة'] },
      tags: ['wallet', 'porte cartes', 'بزطام'],
    },
  ];

  /* visuels de l'accueil (démo) — remplaçables comme n'importe quelle image */
  PS.HOME_IMAGES = {
    hero:      U('photo-1560891958-68bb1fe7fb78', 0.5, 0.45, 1, 3024, 3778, 'Irene Kredenets'),
    editorial: U('photo-1732708874631-d14fbbe406c6', 0.5, 0.72, 1, 5792, 3861, 'Rydale Clothing'),
  };
})();
