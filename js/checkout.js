/* PRINCE SHOP — commande : coordonnées → vérification → WhatsApp
   Aucun compte, aucun mot de passe, aucun paiement en ligne.
   Les coordonnées restent sur l'appareil du client ; elles ne partent que dans SON message WhatsApp. */
(function () {
  const PS = (window.PS = window.PS || {});
  const U = PS.util, cfg = PS.CONFIG, cat = PS.catalog, M = PS.media, icon = PS.icon, ui = PS.ui, t = PS.t;
  const esc = U.esc, money = U.money;
  const O = ui.overlay;
  const KEY = 'ps_customer';

  /* villes proposées en saisie assistée (le client peut écrire n'importe quelle ville) */
  const CITIES = [
    ['Fès', 'فاس'], ['Casablanca', 'الدار البيضاء'], ['Rabat', 'الرباط'], ['Marrakech', 'مراكش'], ['Tanger', 'طنجة'],
    ['Meknès', 'مكناس'], ['Agadir', 'أكادير'], ['Oujda', 'وجدة'], ['Kénitra', 'القنيطرة'], ['Tétouan', 'تطوان'],
    ['Salé', 'سلا'], ['Témara', 'تمارة'], ['Mohammédia', 'المحمدية'], ['El Jadida', 'الجديدة'], ['Nador', 'الناظور'],
    ['Béni Mellal', 'بني ملال'], ['Safi', 'آسفي'], ['Khouribga', 'خريبكة'], ['Settat', 'سطات'], ['Taza', 'تازة'],
    ['Larache', 'العرائش'], ['Khémisset', 'الخميسات'], ['Chefchaouen', 'شفشاون'], ['Ifrane', 'إفران'], ['Sefrou', 'صفرو'],
    ['Errachidia', 'الرشيدية'], ['Ouarzazate', 'ورزازات'], ['Essaouira', 'الصويرة'], ['Al Hoceïma', 'الحسيمة'], ['Berkane', 'بركان'],
    ['Guelmim', 'كلميم'], ['Laâyoune', 'العيون'], ['Dakhla', 'الداخلة'], ['Tiznit', 'تزنيت'], ['Taroudant', 'تارودانت'],
  ];

  let cust = null;
  let step = 'form';
  let tried = false;
  let message = '';

  const load = () => Object.assign({ name: '', phone: '', city: '', address: '', email: '', note: '' }, U.store.get(KEY, {}) || {});
  const save = () => U.store.set(KEY, { name: cust.name, phone: cust.phone, city: cust.city, address: cust.address, email: cust.email });

  /* ---------- validation ---------- */
  function validate(c) {
    const e = {};
    if (c.name.trim().length < 2) e.name = t('co.errName');
    const ph = U.parsePhone(c.phone);
    if (!ph.ok) e.phone = t('co.errPhone');
    if (c.city.trim().length < 2) e.city = t('co.errCity');
    if (c.address.trim().length < 5) e.address = t('co.errAddress');
    if (c.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(c.email.trim())) e.email = t('co.errEmail');
    return e;
  }

  const stepsHtml = (n) => `<ol class="steps" aria-label="${esc(t('co.steps'))}">${[t('co.s1'), t('co.s2'), 'WhatsApp'].map((l, i) => `<li class="${i + 1 === n ? 'is-on' : i + 1 < n ? 'is-done' : ''}"${i + 1 === n ? ' aria-current="step"' : ''}><span>${i + 1 < n ? icon('check', 14) : i + 1}</span>${esc(l)}</li>`).join('')}</ol>`;

  const field = (id, label, input, opt) =>
    `<div class="field" data-field="${id}"><label class="field__l" for="co-${id}">${esc(label)}${opt ? ` <span class="field__o">${esc(t('co.optional'))}</span>` : ` <span class="field__r" aria-hidden="true">*</span>`}</label>${input}<p class="field__e" id="co-${id}-e" role="alert" hidden></p></div>`;

  /* ---------- étape 1 : coordonnées ---------- */
  function formHtml() {
    const tt = PS.cart.totals();
    const n = PS.cart.count();
    return `${ui.panelHead(esc(t('co.title')))}
      <div class="ov__scroll co">
        ${stepsHtml(1)}
        <button type="button" class="co__recap" data-act="close-overlay">
          <span>${esc(PS.count(n, 'product'))} · <b>${money(tt.subtotal)}</b></span><span class="u">${esc(t('co.editCart'))}</span>
        </button>
        <form id="co-form" class="co__form" novalidate>
          ${field('name', t('co.name'), `<input id="co-name" name="name" type="text" autocomplete="name" autocapitalize="words" enterkeyhint="next" required value="${esc(cust.name)}">`)}
          ${field('phone', t('co.phone'), `<input id="co-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" enterkeyhint="next" dir="ltr" class="in-ltr" placeholder="06 12 34 56 78" required value="${esc(cust.phone)}" aria-describedby="co-phone-h"><p class="field__h" id="co-phone-h">${esc(t('co.phoneHint'))}</p>`)}
          ${field('city', t('co.city'), `<input id="co-city" name="city" type="text" list="co-cities" autocomplete="address-level2" enterkeyhint="next" required value="${esc(cust.city)}"><datalist id="co-cities">${CITIES.map((c) => `<option value="${esc(c[PS.lang === 'ar' ? 1 : 0])}"></option>`).join('')}</datalist>`)}
          ${field('address', t('co.address'), `<textarea id="co-address" name="address" rows="2" autocomplete="street-address" enterkeyhint="next" required placeholder="${esc(t('co.addressPh'))}">${esc(cust.address)}</textarea>`)}
          ${field('note', t('co.note'), `<textarea id="co-note" name="note" rows="2" enterkeyhint="done" placeholder="${esc(t('co.notePh'))}">${esc(cust.note)}</textarea>`, true)}
          <details class="co__more"${cust.email ? ' open' : ''}><summary>${esc(t('co.addEmail'))}</summary>
            ${field('email', t('co.email'), `<input id="co-email" name="email" type="email" inputmode="email" autocomplete="email" dir="ltr" class="in-ltr" value="${esc(cust.email)}">`, true)}
          </details>
          <p class="co__priv">${icon('check', 16)} ${esc(t('co.privacy'))}</p>
        </form>
      </div>
      <footer class="ov__foot"><button type="submit" form="co-form" class="btn btn--primary btn--block">${esc(t('co.toReview'))} ${icon('arrowRight', 18)}</button></footer>`;
  }

  function showErrors(panel, errs, focusFirst) {
    let first = null;
    ['name', 'phone', 'city', 'address', 'email'].forEach((k) => {
      const wrap = panel.querySelector('[data-field="' + k + '"]');
      if (!wrap) return;
      const inp = wrap.querySelector('input,textarea'), e = wrap.querySelector('.field__e');
      const msg = errs[k];
      wrap.classList.toggle('is-bad', !!msg);
      e.hidden = !msg; e.textContent = msg || '';
      if (msg) { inp.setAttribute('aria-invalid', 'true'); inp.setAttribute('aria-describedby', e.id); if (!first) first = inp; }
      else { inp.removeAttribute('aria-invalid'); if (k !== 'phone') inp.removeAttribute('aria-describedby'); else inp.setAttribute('aria-describedby', 'co-phone-h'); }
    });
    if (focusFirst && first) {
      if (first.id === 'co-email') first.closest('details').open = true;
      first.focus({ preventScroll: true });
      first.scrollIntoView({ block: 'center', behavior: U.reduceMotion() ? 'auto' : 'smooth' });
    }
  }

  function bindForm(panel) {
    const form = panel.querySelector('#co-form');
    if (!form) return;
    const read = () => { ['name', 'phone', 'city', 'address', 'email', 'note'].forEach((k) => { const el = form.elements[k]; if (el) cust[k] = el.value; }); };
    form.addEventListener('input', () => { read(); save(); if (tried) showErrors(panel, validate(cust), false); });
    /* remet le numéro au propre quand on quitte le champ (06 12 34 56 78) */
    form.elements.phone.addEventListener('blur', () => { const ph = U.parsePhone(form.elements.phone.value); if (ph.ok) { form.elements.phone.value = ph.value; cust.phone = ph.value; save(); } });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      read();
      tried = true;
      const errs = validate(cust);
      if (Object.keys(errs).length) { showErrors(panel, errs, true); ui.live(t('co.errSummary')); return; }
      const ph = U.parsePhone(cust.phone);
      cust.phone = ph.value;
      ['name', 'city', 'address', 'email', 'note'].forEach((k) => { cust[k] = cust[k].trim(); });
      save();
      toReview();
    });
  }

  /* ---------- étape 2 : vérification ---------- */
  function reviewHtml() {
    const lines = PS.cart.lines();
    const tt = PS.cart.totals();
    message = PS.wa.orderMessage({ lines, customer: cust });
    return `${ui.panelHead(esc(t('co.reviewTitle')))}
      <div class="ov__scroll co">
        ${stepsHtml(2)}
        <section class="rv" aria-labelledby="rv-o">
          <h3 class="rv__h" id="rv-o">${esc(t('co.yourOrder'))}</h3>
          <ul class="rv__list">${lines.map((l) => `<li>
            <span class="plate rv__img">${M.tag(M.first(l.product, l.color), { alt: '', w: 320, widths: [320], sizes: '52px', icon: M.catIcon(l.product) })}</span>
            <span class="rv__t"><b>${esc(cat.name(l.product))}</b><small>${esc([PS.panels.variantText(l), '×' + l.qty].filter(Boolean).join(' · '))}</small></span>
            <span class="rv__p">${l.total == null ? esc(t('price.onRequest')) : money(l.total)}</span>
          </li>`).join('')}</ul>
          <dl class="sum">
            <div><dt>${esc(t('cart.subtotal'))}</dt><dd>${money(tt.subtotal)}</dd></div>
            <div class="sum__sm"><dt>${esc(t('cart.delivery'))}</dt><dd>${esc(PS.panels.deliveryLabel(tt))}</dd></div>
            ${tt.total != null && tt.delivery.state === 'fee' ? `<div class="sum__tot"><dt>${esc(t('cart.total'))}</dt><dd>${money(tt.total)}</dd></div>` : ''}
            <div class="sum__sm"><dt>${esc(t('co.payment'))}</dt><dd>${esc(cfg.payment.cashOnDelivery ? t('pay.codShort') : t('pay.tbdShort'))}</dd></div>
          </dl>
        </section>
        <section class="rv" aria-labelledby="rv-c">
          <h3 class="rv__h" id="rv-c">${esc(t('co.yourInfo'))}<button type="button" class="u rv__edit" data-act="co-edit">${icon('edit', 14)} ${esc(t('co.edit'))}</button></h3>
          <p class="rv__c"><b>${esc(cust.name)}</b><br>${U.ltr(cust.phone)}<br>${esc(cust.city)}<br>${esc(cust.address)}${cust.email ? '<br>' + U.ltr(cust.email) : ''}</p>
          ${cust.note ? `<p class="rv__note"><b>${esc(t('co.note'))}</b> ${esc(cust.note)}</p>` : ''}
        </section>
        <p class="co__next">${icon('whatsapp', 18)}<span>${esc(t('co.next'))}</span></p>
        <details class="co__msg"><summary>${esc(t('co.seeMsg'))}</summary><pre dir="auto">${esc(message)}</pre></details>
      </div>
      <footer class="ov__foot">
        <a class="btn btn--wa-solid btn--block" id="co-send" href="${esc(PS.wa.url(message))}" target="_blank" rel="noopener">${icon('whatsapp', 20)} ${esc(t('co.send'))}</a>
        <button type="button" class="btn btn--text btn--block" data-act="co-copy">${icon('copy', 16)} ${esc(t('co.copy'))}</button>
      </footer>`;
  }

  /* ---------- étape 3 : après l'ouverture de WhatsApp ---------- */
  function sentHtml() {
    return `${ui.panelHead(esc(t('co.sentTitle')))}
      <div class="ov__scroll co co--sent">
        ${stepsHtml(3)}
        <div class="sent">
          <span class="sent__ic">${icon('whatsapp', 34)}</span>
          <h3 class="sent__t">${esc(t('co.sentH'))}</h3>
          <p class="sent__p">${esc(t('co.sentP', { brand: cfg.brand.name }))}</p>
        </div>
      </div>
      <footer class="ov__foot">
        <button type="button" class="btn btn--primary btn--block" data-act="co-done">${icon('check', 18)} ${esc(t('co.done'))}</button>
        <a class="btn btn--wa btn--block" href="${esc(PS.wa.url(message))}" target="_blank" rel="noopener">${icon('whatsapp', 20)} ${esc(t('co.reopen'))}</a>
        <button type="button" class="btn btn--text btn--block" data-act="co-copy">${icon('copy', 16)} ${esc(t('co.copy'))}</button>
      </footer>`;
  }

  function render(focus) {
    const html = step === 'review' ? reviewHtml() : step === 'sent' ? sentHtml() : formHtml();
    O.update('checkout', html, { resetScroll: true, focus });
    const rec = O.get('checkout');
    if (rec && step === 'form') { bindForm(rec.panel); if (tried) showErrors(rec.panel, validate(cust), false); }
  }
  function toReview() {
    step = 'review';
    /* entrée d'historique « virtuelle » : Retour ramène au formulaire au lieu de tout fermer */
    O.open('co-review', { virtual: true, onClose() { if (O.has('checkout')) { step = 'form'; render('#co-name'); } } });
    render();
    ui.live(t('co.reviewTitle'));
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = message; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e2) { /* noop */ }
      ta.remove();
    }
    ui.toast(t('co.copied'));
  }

  const C = (PS.checkout = {
    open() {
      if (PS.cart.isEmpty() || PS.cart.hasProblem()) { PS.panels.cart(); return; }
      PS.panels.hideAdded();
      cust = load();
      step = 'form';
      tried = false;
      O.open('checkout', {
        type: 'full',
        label: t('co.title'),
        html: formHtml(),
        initialFocus: cust.name ? null : '#co-name',
        onOpen(rec) {
          bindForm(rec.panel);
          rec.panel.addEventListener('click', (e) => {
            const b = e.target.closest('[data-act],#co-send');
            if (!b) return;
            const act = b.getAttribute('data-act');
            if (b.id === 'co-send') {
              /* WhatsApp s'ouvre dans un nouvel onglet / l'appli ; on prépare l'écran de retour */
              setTimeout(() => { if (O.has('checkout')) { step = 'sent'; render(); } }, 700);
            } else if (act === 'co-edit') O.closeTop();
            else if (act === 'co-copy') copy();
            else if (act === 'co-done') {
              O.popAll();
              setTimeout(() => { PS.cart.clear(); ui.toast(t('co.thanks'), null, 6000); }, 60);
            }
          });
        },
        onClose() { step = 'form'; },
      });
    },
    /* le panier a changé ailleurs (autre onglet) pendant la commande */
    sync() {
      if (!O.has('checkout') || step === 'sent') return;
      if (PS.cart.isEmpty()) { O.closeAll(); return; }
      render();
    },
  });
})();
