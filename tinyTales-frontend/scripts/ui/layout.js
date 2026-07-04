import { icons } from './icons.js';
import { child, today } from '../data/demoData.js';
import { formatAge } from '../logic/age.js';

const THEME_KEY = 'tinytales-theme';

const NAV_ITEMS = [
  { key: 'home', label: 'Hem', href: 'index.html', icon: 'home' },
  { key: 'gallery', label: 'Galleri', href: 'gallery.html', icon: 'gallery' },
  { key: 'timeline', label: 'Tidslinje', href: 'timeline.html', icon: 'timeline' },
  { key: 'memories', label: 'Minnen', href: 'memories.html', icon: 'heart' },
  { key: 'milestones', label: 'Milstolpar', href: 'milestones.html', icon: 'star' },
  { key: 'settings', label: 'Inställningar', href: 'settings.html', icon: 'gear' },
];

function applyStoredTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  document.documentElement.classList.toggle('dark', stored === 'dark');
}

function toggleTheme(button) {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  updateThemeButton(button, isDark);
}

function updateThemeButton(button, isDark) {
  button.innerHTML = `${isDark ? icons.sun(18) : icons.moon(18)}<span>${isDark ? 'Ljust läge' : 'Mörkt läge'}</span>`;
}

// Körs direkt vid import så det inte blinkar till fel tema innan DOM är klar.
applyStoredTheme();

/** Kopplar en valfri knapp (t.ex. i sidomenyn eller på inställningssidan) till dark-mode-togglingen. */
export function initThemeToggle(button) {
  if (!button) return;
  updateThemeButton(button, document.documentElement.classList.contains('dark'));
  button.addEventListener('click', () => toggleTheme(button));
}

export function renderLayout({ activePage, onAddEntry } = {}) {
  const sidebarRoot = document.getElementById('sidebar-root');
  const topbarRoot = document.getElementById('topbar-root');
  if (!sidebarRoot || !topbarRoot) {
    return;
  }

  sidebarRoot.innerHTML = renderSidebarMarkup(activePage);
  topbarRoot.innerHTML = renderTopbarMarkup();

  initThemeToggle(sidebarRoot.querySelector('.theme-toggle'));

  const addChildButton = sidebarRoot.querySelector('.btn-add-child');
  addChildButton.addEventListener('click', () => {
    alert('Stöd för flera barn kommer snart! ✨');
  });

  const addEntryButton = topbarRoot.querySelector('.btn-lagg-till');
  addEntryButton.addEventListener('click', () => {
    if (typeof onAddEntry === 'function') {
      onAddEntry();
    }
  });

  const bellButton = topbarRoot.querySelector('.icon-btn[data-role="bell"]');
  bellButton.addEventListener('click', () => {
    alert('Inga nya notiser just nu.');
  });
}

function renderSidebarMarkup(activePage) {
  const navHtml = NAV_ITEMS.map(
    (item) => `
    <li>
      <a href="${item.href}" class="${item.key === activePage ? 'active' : ''}">
        ${icons[item.icon](18)}
        <span>${item.label}</span>
      </a>
    </li>`
  ).join('');

  const age = formatAge(child.birthDate, today);
  const born = new Date(child.birthDate).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `
    <div class="sidebar-logo">
      ${icons.heart(20)}
      <span>TinyTales</span>
    </div>
    <ul class="sidebar-nav">${navHtml}</ul>
    <div class="sidebar-footer">
      <div class="child-card">
        <div class="child-card-avatar">${child.profileImageEmoji}</div>
        <div>
          <div class="child-card-name">${child.name} · ${age}</div>
          <div class="child-card-meta">Född ${born}</div>
        </div>
      </div>
      <button type="button" class="btn-add-child">${icons.plus(16)} Lägg till barn</button>
      <button type="button" class="theme-toggle"></button>
    </div>
  `;
}

function renderTopbarMarkup() {
  return `
    <button type="button" class="btn-lagg-till">${icons.plus(16)} Lägg till</button>
    <button type="button" class="icon-btn" data-role="bell" aria-label="Notiser">${icons.bell(18)}</button>
    <a href="settings.html" class="avatar-circle" aria-label="Inställningar">A</a>
  `;
}
