/* PRINCE SHOP — générateur de messages WhatsApp
   Le numéro vient de config.contact.WHATSAPP_NUMBER, les libellés de data/i18n.js (clés « wa.* »),
   les produits et les prix du panier. Rien n'est écrit en dur ici. */
(function () {
  const PS = (window.PS = window.PS || {});
  const U = PS.util, cfg = PS.CONFIG, t = PS.t;

  const digits = () => U.waDigits(cfg.contact.WHATSAPP_NUMBER);
  const money = (n) => (n == null ? t('wa.priceTbd') : U.money(n, true));
  /* en arabe : nom arabe + nom français, pour que le vendeur retrouve l'article à coup sûr */
  const title = (p) => {
    const ref = p.ref ? ' — ' + p.ref : '';
    if (PS.lang === 'ar' && p.name.ar && p.name.ar !== p.name.fr) return p.name.ar + ' (' + p.name.fr + ref + ')';
    return p.name.fr + (p.ref ? ' (' + t('wa.ref') + ' ' + p.ref + ')' : '');
  };

  /* mode démo : chaque message commence par un repère « test », car c'est le vrai numéro de la boutique qui est utilisé */
  const demo = (s) => (cfg.DEMO_MODE ? t('wa.demoNote') + '\n\n' + s : s);

  const W = (PS.wa = {
    number: () => '+' + digits(),
    display: () => U.phoneDisplay(cfg.contact.WHATSAPP_NUMBER),

    /* lien wa.me avec texte pré-rempli */
    url(text) {
      return 'https://wa.me/' + digits() + (text ? '?text=' + encodeURIComponent(text) : '');
    },

    /* bloc d'un article :
       • Mocassin Élégance (réf. CH-01)
       Couleur : Beige
       Pointure : 38
       Quantité : 1
       Prix : 449 DH                                                        */
    itemBlock(l) {
      const p = l.product;
      const out = ['• ' + title(p)];
      if (p.hasColors) out.push(t('wa.color') + ' ' + PS.catalog.colorName(l.color));
      if (l.size) out.push(PS.catalog.sizeLabel(p) + t('wa.colon') + ' ' + l.size);
      out.push(t('wa.qty') + ' ' + l.qty);
      out.push(t('wa.price') + ' ' + money(l.total) + (l.qty > 1 && l.unit != null ? ' (' + l.qty + ' × ' + money(l.unit) + ')' : ''));
      return out.join('\n');
    },

    deliveryText(totals) {
      const d = totals.delivery;
      if (d.state === 'free') return t('wa.delivery') + ' ' + t('cart.deliveryFree');
      if (d.state === 'fee') return t('wa.delivery') + ' ' + money(d.amount);
      return t('wa.delivery') + ' ' + t('wa.deliveryTbd');
    },

    /* Message de commande complet. order = { lines, customer:{name,phone,city,address,email,note} } */
    orderMessage(order) {
      const tt = PS.cart.totals();
      const c = order.customer || {};
      const out = [t('wa.hello'), '', t('wa.orderIntro'), ''];
      order.lines.forEach((l) => { out.push(W.itemBlock(l), ''); });
      out.push(t('wa.subtotal') + ' ' + money(tt.subtotal) + (tt.unknown ? ' ' + t('wa.plusUnknown', { n: tt.unknown }) : ''));
      out.push(W.deliveryText(tt));
      if (tt.total != null && tt.delivery.state === 'fee') out.push(t('wa.total') + ' ' + money(tt.total));
      out.push('', t('wa.customer'));
      out.push(t('wa.name') + ' ' + (c.name || ''));
      out.push(t('wa.phone') + ' ' + (c.phone || ''));
      out.push(t('wa.city') + ' ' + (c.city || ''));
      out.push(t('wa.address') + ' ' + (c.address || ''));
      if (c.email) out.push(t('wa.email') + ' ' + c.email);
      if (c.note) out.push('', t('wa.note') + ' ' + c.note);
      out.push('', t('wa.outro'));
      return demo(out.join('\n'));
    },

    /* question rapide sur un article (bouton « Commander via WhatsApp » de la fiche produit) */
    productMessage(p, color, size, url, intro) {
      const out = [intro || t('wa.productIntro'), '', '• ' + title(p)];
      if (color && p.hasColors) out.push(t('wa.color') + ' ' + PS.catalog.colorName(color));
      if (size) out.push(PS.catalog.sizeLabel(p) + t('wa.colon') + ' ' + size);
      out.push(t('wa.price') + ' ' + money(p.price));
      if (url) out.push('', url);
      return demo(out.join('\n'));
    },

    helpUrl(extra) { return W.url(demo(t('wa.help') + (extra ? '\n' + extra : ''))); },
  });
})();
