// Handskrivna inline SVG-ikoner, outline-stil (24x24, stroke=currentColor).
// Varje funktion returnerar en SVG-sträng så den kan sättas rakt in i innerHTML.

function svg(paths, size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;
}

export const icons = {
  home: (size) => svg('<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9"/>', size),
  gallery: (size) => svg('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="m3 16 5-5 4 4 3-3 6 6"/>', size),
  timeline: (size) => svg('<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h10"/><circle cx="4" cy="6" r="1.2" fill="currentColor"/><circle cx="4" cy="12" r="1.2" fill="currentColor"/><circle cx="4" cy="18" r="1.2" fill="currentColor"/>', size),
  heart: (size) => svg('<path d="M12 20s-7-4.4-9.5-9A5.5 5.5 0 0 1 12 5.5 5.5 5.5 0 0 1 21.5 11c-2.5 4.6-9.5 9-9.5 9Z"/>', size),
  star: (size) => svg('<path d="M12 3.5 14.6 9l6 .9-4.3 4.2 1 6-5.3-2.8L6.7 20l1-6L3.4 9.9l6-.9Z"/>', size),
  chart: (size) => svg('<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>', size),
  gear: (size) => svg('<circle cx="12" cy="12" r="3"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.4-2-3.5-2.3.8a7.6 7.6 0 0 0-2.6-1.5L14 2h-4l-.5 2.4a7.6 7.6 0 0 0-2.6 1.5l-2.3-.8-2 3.5 2 1.4a7.6 7.6 0 0 0 0 3l-2 1.4 2 3.5 2.3-.8a7.6 7.6 0 0 0 2.6 1.5L10 22h4l.5-2.4a7.6 7.6 0 0 0 2.6-1.5l2.3.8 2-3.5Z"/>', size),
  plus: (size) => svg('<path d="M12 5v14"/><path d="M5 12h14"/>', size),
  bell: (size) => svg('<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z"/><path d="M10 19a2 2 0 0 0 4 0"/>', size),
  camera: (size) => svg('<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"/><circle cx="12" cy="13" r="3.3"/>', size),
  chevronDown: (size) => svg('<path d="m6 9 6 6 6-6"/>', size),
  grid: (size) => svg('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>', size),
  list: (size) => svg('<path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><circle cx="3.5" cy="6" r="1" fill="currentColor"/><circle cx="3.5" cy="12" r="1" fill="currentColor"/><circle cx="3.5" cy="18" r="1" fill="currentColor"/>', size),
  close: (size) => svg('<path d="m6 6 12 12"/><path d="m18 6-12 12"/>', size),
  sun: (size) => svg('<circle cx="12" cy="12" r="4"/><path d="M12 3v1.5M12 19.5V21M4.2 4.2l1 1M18.8 18.8l1 1M3 12h1.5M19.5 12H21M4.2 19.8l1-1M18.8 5.2l1-1"/>', size),
  moon: (size) => svg('<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"/>', size),
  more: (size) => svg('<circle cx="5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="19" cy="12" r="1.3" fill="currentColor"/>', size),
  userPlus: (size) => svg('<circle cx="9" cy="8" r="3.3"/><path d="M3.5 20a5.5 5.5 0 0 1 11 0"/><path d="M18 8v6M15 11h6"/>', size),
  mail: (size) => svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 6.5 8 6 8-6"/>', size),
  edit: (size) => svg('<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>', size),
  mapPin: (size) => svg('<path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.3"/>', size),
  play: (size) => svg('<path d="M8 5.5v13l11-6.5Z"/>', size),
};
