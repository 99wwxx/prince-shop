/* PRINCE SHOP — icônes (SVG en ligne, trait fin 1.5, héritent de currentColor)
   Les icônes « directionnelles » (flèches, chevrons) portent la classe .dir :
   elles sont retournées automatiquement en arabe (voir css : [dir=rtl] .i.dir). */
(function () {
  const PS = (window.PS = window.PS || {});
  const S = 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"';
  const P = {
    search: `<g ${S}><circle cx="11" cy="11" r="6.5"/><path d="m16.5 16.5 4 4"/></g>`,
    bag: `<g ${S}><path d="M5.5 8.5h13l-1 11.5h-11z"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/></g>`,
    home: `<g ${S}><path d="M4 11 12 4.5 20 11v8.5h-5.5V14h-5v5.5H4z"/></g>`,
    grid: `<g ${S}><rect x="4.5" y="4.5" width="6" height="6"/><rect x="13.5" y="4.5" width="6" height="6"/><rect x="4.5" y="13.5" width="6" height="6"/><rect x="13.5" y="13.5" width="6" height="6"/></g>`,
    menu: `<g ${S}><path d="M4 8h16M4 16h16"/></g>`,
    close: `<g ${S}><path d="m6 6 12 12M18 6 6 18"/></g>`,
    arrowRight: `<g ${S}><path d="M4 12h15M13.5 6.5 19 12l-5.5 5.5"/></g>`,
    arrowLeft: `<g ${S}><path d="M20 12H5M10.5 6.5 5 12l5.5 5.5"/></g>`,
    arrowUpRight: `<g ${S}><path d="M7 17 17 7M8.5 7H17v8.5"/></g>`,
    plus: `<g ${S}><path d="M12 5v14M5 12h14"/></g>`,
    minus: `<g ${S}><path d="M5 12h14"/></g>`,
    chevronDown: `<g ${S}><path d="m6 9.5 6 6 6-6"/></g>`,
    chevronLeft: `<g ${S}><path d="m14.5 6-6 6 6 6"/></g>`,
    chevronRight: `<g ${S}><path d="m9.5 6 6 6-6 6"/></g>`,
    check: `<g ${S}><path d="m5 12.5 4.5 4.5L19 7.5"/></g>`,
    filter: `<g ${S}><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></g>`,
    sort: `<g ${S}><path d="M7 5v14M7 19l-3-3M7 19l3-3M17 19V5M17 5l-3 3M17 5l3 3"/></g>`,
    trash: `<g ${S}><path d="M5 7h14M10 7V5h4v2M7 7l.8 12h8.4L17 7M10.5 11v5M13.5 11v5"/></g>`,
    pin: `<g ${S}><path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></g>`,
    phone: `<g ${S}><path d="M6.5 4h3l1.5 4-2 1.3a10 10 0 0 0 5.7 5.7l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4Z"/></g>`,
    truck: `<g ${S}><path d="M3 6.5h10.5V16H3zM13.5 10h4l3 3v3h-7"/><circle cx="7.5" cy="17" r="1.8"/><circle cx="17" cy="17" r="1.8"/></g>`,
    chat: `<g ${S}><path d="M4 5.5h16v10H10l-4.5 3.5v-3.5H4z"/></g>`,
    store: `<g ${S}><path d="M4 9.5 5.5 4.5h13L20 9.5M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0M5.5 12.5V20h13v-7.5M10 20v-4.5h4V20"/></g>`,
    star: `<path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8z" fill="currentColor"/>`,
    ruler: `<g ${S}><path d="m3.5 15.5 12-12 5 5-12 12zM7 12l1.8 1.8M9.8 9.2l1.8 1.8M12.6 6.4l1.8 1.8"/></g>`,
    zoom: `<g ${S}><circle cx="11" cy="11" r="6.5"/><path d="m16.5 16.5 4 4M11 8.5v5M8.5 11h5"/></g>`,
    copy: `<g ${S}><rect x="8.5" y="8.5" width="11" height="11" rx="1"/><path d="M15.5 8.5V6a1.5 1.5 0 0 0-1.5-1.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/></g>`,
    edit: `<g ${S}><path d="m5 19 .8-3.7L16.2 4.9a1.7 1.7 0 0 1 2.4 0l.5.5a1.7 1.7 0 0 1 0 2.4L8.7 18.2z"/></g>`,
    instagram: `<g ${S}><rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.7"/><circle cx="16.9" cy="7.1" r=".6" fill="currentColor"/></g>`,
    /* pictogrammes de catégorie (secondaires, à côté des photos) */
    shoe: `<g ${S}><path d="M3 15.5c0-2 .3-4.5 1.2-6 .8-1.2 2.8-1 3.6.2 1 1.6 2.6 2.8 4.6 3.2 3.4.7 8.6.9 8.6 3.6v1H3z"/><path d="M3 15.5h18"/></g>`,
    purse: `<g ${S}><path d="M5 10h14l1.2 9.5H3.8z"/><path d="M8.5 10V8.5a3.5 3.5 0 0 1 7 0V10"/><path d="M10.5 14h3"/></g>`,
    gem: `<g ${S}><path d="M3.5 9.5 7 4.5h10l3.5 5L12 20z"/><path d="M3.5 9.5h17M9.5 9.5 12 20l2.5-10.5M7 4.5l2.5 5M17 4.5l-2.5 5"/></g>`,
    whatsapp: `<path fill="currentColor" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.65.08-.3-.15-1.26-.46-2.4-1.48-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.07 2.88 1.21 3.07.15.2 2.1 3.2 5.08 4.49.7.3 1.26.49 1.7.63.72.23 1.36.2 1.87.12.57-.08 1.76-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.89-9.88 2.64 0 5.12 1.03 6.99 2.9a9.82 9.82 0 0 1 2.89 6.99c0 5.45-4.44 9.88-9.88 9.88m8.41-18.3A11.8 11.8 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L.06 24l6.3-1.65a11.88 11.88 0 0 0 5.68 1.45h.01c6.55 0 11.89-5.34 11.89-11.89 0-3.18-1.24-6.17-3.48-8.41Z"/>`,
  };
  const DIR = { arrowRight: 1, arrowLeft: 1, chevronLeft: 1, chevronRight: 1, arrowUpRight: 1 };

  PS.icon = (name, size, cls) => {
    const s = size || 22;
    return `<svg class="i i-${name}${DIR[name] ? ' dir' : ''}${cls ? ' ' + cls : ''}" width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${P[name] || ''}</svg>`;
  };
})();
