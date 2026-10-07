/* ==========================================================================
   PRINCE SHOP — PAGES D'INFORMATION (BROUILLONS, français + arabe)
   --------------------------------------------------------------------------
   Ces pages ne contiennent QUE ce que le site fait réellement.
   Tout ce qui dépend d'une décision de la boutique (retours, délais, paiement,
   mentions légales) reste en « [À COMPLÉTER …] » : rien n'est inventé.
   Une page affiche l'avertissement « Brouillon » tant que  status: 'draft'.
   Quand la boutique a validé ses règles : remplacez le texte, puis  status: 'final'.
   ========================================================================== */
window.PS = window.PS || {};

PS.LEGAL = (function () {
  const cfg = () => PS.CONFIG;
  const cur = (l) => cfg().currency[l];
  const T = (fr, ar) => ({ fr: '[À COMPLÉTER — ' + fr + ']', ar: '[يُستكمل — ' + ar + ']' });
  /* fusionne des phrases bilingues en { fr: [...], ar: [...] } */
  const P = (...items) => ({ fr: items.map((x) => x.fr).filter(Boolean), ar: items.map((x) => x.ar).filter(Boolean) });
  const S = (fr, ar) => ({ fr, ar });

  return {
    'livraison': () => {
      const d = cfg().delivery;
      return {
        title: S('Livraison', 'التوصيل'),
        status: 'draft',
        intro: S('La livraison est disponible partout au Maroc.', 'التوصيل متاح في جميع أنحاء المغرب.'),
        sections: [
          { h: S('Frais', 'الرسوم'), p: P(
            d.fee == null
              ? S('Les frais de livraison vous sont confirmés par la boutique sur WhatsApp, avant validation de la commande.', 'يؤكد لك المتجر رسوم التوصيل عبر واتساب قبل تأكيد الطلب.')
              : S('Frais de livraison : ' + d.fee + ' ' + cur('fr') + '.', 'رسوم التوصيل: ' + d.fee + ' ' + cur('ar') + '.'),
            d.freeFrom != null ? S('Livraison offerte dès ' + d.freeFrom + ' ' + cur('fr') + '.', 'توصيل مجاني ابتداءً من ' + d.freeFrom + ' ' + cur('ar') + '.') : S('', '')) },
          { h: S('Délai', 'المدة'), p: P(
            d.eta ? S('Délai indicatif : ' + d.eta.fr + '.', 'المدة التقريبية: ' + d.eta.ar + '.') : T('délai de livraison par ville ou zone', 'مدة التوصيل حسب المدينة أو المنطقة')) },
          { h: S('Suivi', 'التتبع'), p: P(T('comment le client est prévenu : appel, WhatsApp…', 'طريقة إخبار الزبون: اتصال، واتساب…')) },
        ],
      };
    },

    'echange-retour': () => ({
      title: S('Échange et retour', 'الاستبدال والإرجاع'),
      status: 'draft',
      intro: S('Cette politique doit être définie par la boutique. En attendant, contactez-nous sur WhatsApp pour confirmation.', 'يجب أن يحدد المتجر هذه السياسة. في انتظار ذلك، تواصل معنا عبر واتساب للتأكيد.'),
      sections: [
        { h: S('À décider par la boutique', 'يحدده المتجر'), p: P(
          T('l’échange est-il possible ? sous quel délai ?', 'هل الاستبدال ممكن؟ وخلال أي مدة؟'),
          T('conditions : article non porté, emballage d’origine…', 'الشروط: منتج غير مستعمل، التغليف الأصلي…'),
          T('qui paie les frais de retour ?', 'من يتحمل رسوم الإرجاع؟'),
          T('remboursement ou avoir ?', 'استرداد المبلغ أم قسيمة شراء؟')) },
      ],
    }),

    'conditions-de-vente': () => ({
      title: S('Conditions de vente', 'شروط البيع'),
      status: 'draft',
      intro: S('Comment fonctionne une commande sur ce site.', 'كيف يتم الطلب عبر هذا الموقع.'),
      sections: [
        { h: S('Commander', 'الطلب'), p: P(
          S('Vous choisissez vos articles, puis vous envoyez votre commande à la boutique via WhatsApp. Aucun compte n’est nécessaire.', 'تختار منتجاتك ثم ترسل طلبك إلى المتجر عبر واتساب. لا حاجة لإنشاء حساب.'),
          S('La commande est confirmée par la boutique après vérification de la disponibilité. Tant que vous n’avez pas reçu cette confirmation, elle n’est pas définitive.', 'يؤكد المتجر الطلب بعد التحقق من التوفر. الطلب غير نهائي ما لم تتوصل بهذا التأكيد.')) },
        { h: S('Prix', 'الأسعار'), p: P(
          S('Les prix sont affichés en dirhams (' + cur('fr') + ').', 'الأسعار معروضة بالدرهم.'),
          T('préciser si les prix incluent ou non la livraison', 'توضيح هل الأسعار تشمل التوصيل أم لا')) },
        { h: S('Paiement', 'الدفع'), p: P(
          cfg().payment.cashOnDelivery
            ? S('Paiement à la livraison.', 'الدفع عند الاستلام.')
            : S('Les modalités de paiement sont confirmées lors de la commande.', 'تُؤكَّد طريقة الدفع عند الطلب.'),
          T('modes de paiement acceptés', 'طرق الدفع المقبولة')) },
        { h: S('Vendeur', 'البائع'), p: P(
          S(cfg().brand.name + ' — ' + cfg().store.address.fr.join(', ') + '.', cfg().brand.name + ' — ' + cfg().store.address.ar.join('، ') + '.'),
          T('raison sociale, ICE / RC si applicable', 'الاسم التجاري، ICE / RC إن وُجد')) },
      ],
    }),

    'confidentialite': () => ({
      title: S('Confidentialité', 'الخصوصية'),
      status: 'draft',
      intro: S('Ce que fait, et ne fait pas, ce site avec vos informations.', 'ما الذي يفعله هذا الموقع بمعلوماتك، وما الذي لا يفعله.'),
      sections: [
        { h: S('Pas de compte', 'بدون حساب'), p: P(S('Le site ne demande ni compte, ni mot de passe, ni paiement en ligne.', 'لا يطلب الموقع حسابًا ولا كلمة مرور ولا دفعًا عبر الإنترنت.')) },
        { h: S('Sur votre appareil', 'على جهازك'), p: P(
          S('Votre panier, votre langue, les articles vus récemment et les coordonnées que vous saisissez sont gardés dans votre navigateur, pour vous éviter de les retaper. Ils ne sont envoyés à aucun serveur du site. Vous pouvez les effacer en supprimant les données du site dans votre navigateur.', 'تُحفظ سلتك ولغتك والمنتجات التي شاهدتها مؤخرًا والمعلومات التي تدخلها داخل متصفحك، حتى لا تعيد كتابتها. لا تُرسل إلى أي خادم تابع للموقع. يمكنك حذفها بمسح بيانات الموقع من متصفحك.')) },
        { h: S('Quand vous envoyez une commande', 'عند إرسال الطلب'), p: P(
          S('Vos coordonnées (nom, téléphone, ville, adresse, note) sont placées dans un message WhatsApp que vous envoyez vous-même à la boutique. Rien ne part tant que vous n’appuyez pas sur « Envoyer » dans WhatsApp.', 'توضع معلوماتك (الاسم، الهاتف، المدينة، العنوان، الملاحظة) في رسالة واتساب ترسلها أنت إلى المتجر. لا يُرسل أي شيء ما لم تضغط على «إرسال» في واتساب.')) },
        { h: S('Services tiers', 'خدمات خارجية'), p: P(
          S('Polices de caractères : chargées depuis Google Fonts.', 'الخطوط: تُحمَّل من Google Fonts.'),
          S('Carte : chargée depuis Google Maps seulement si vous appuyez sur « Afficher la carte ».', 'الخريطة: تُحمَّل من خرائط Google فقط إذا ضغطت على «عرض الخريطة».'),
          S('WhatsApp et Instagram : ouverts seulement quand vous cliquez sur leurs liens.', 'واتساب وإنستغرام: يُفتحان فقط عند الضغط على روابطهما.'),
          cfg().DEMO_MODE ? S('Photos de démonstration : chargées depuis Unsplash.', 'صور العرض التجريبي: تُحمَّل من Unsplash.') : S('', '')) },
        { h: S('Responsable et vos droits', 'المسؤول وحقوقك'), p: P(
          T('identité du responsable, durée de conservation côté boutique, droits d’accès et de suppression, mentions prévues par la loi marocaine 09-08 (CNDP) — à valider avec un conseiller juridique', 'هوية المسؤول، مدة الاحتفاظ بالبيانات لدى المتجر، حق الولوج والحذف، البيانات المنصوص عليها في القانون المغربي 09-08 (CNDP) — تُراجع مع مستشار قانوني')) },
      ],
    }),

    /* visible uniquement en mode démo */
    'credits': () => {
      const list = PS.media ? PS.media.credits() : [];
      const names = list.map((c) => c.name).join(', ');
      return {
        title: S('Crédits photos (démo)', 'مصادر الصور (نسخة تجريبية)'),
        status: 'final',
        intro: S('Les photos de cette version de démonstration ne montrent pas les articles réels de Prince Shop. Ce sont des images libres de droits (licence Unsplash), utilisées pour illustrer la maquette. Elles seront remplacées par les photos de la boutique.', 'صور هذه النسخة التجريبية لا تمثل المنتجات الفعلية لـ Prince Shop. هي صور حرة الاستعمال (رخصة Unsplash) لتوضيح التصميم فقط، وستُعوَّض بصور المتجر.'),
        sections: [
          { h: S('Photographes', 'المصورون'), p: { fr: [names + '.'], ar: [names + '.'] } },
        ],
      };
    },
  };
})();
