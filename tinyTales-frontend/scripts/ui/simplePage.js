import { renderLayout } from './layout.js';
import { mountAddEntryModal } from './addEntryModal.js';
import { renderGroups } from './feed.js';
import { icons } from './icons.js';
import { memories as demoMemories, child, today } from '../data/demoData.js';
import { groupByAge } from '../logic/groupByAge.js';
import { filterEntries } from '../logic/filterEntries.js';

const OPEN_DEFAULTS = {
  bilder: { withMedia: true },
  milstolpar: { favorite: true },
};

/**
 * Delad initiering för de enklare undersidorna (Galleri, Tidslinje, Minnen,
 * Milstolpar) som alla bara visar ett filtrerat, grupperat flöde av minnen.
 * matchesFilter är samma filter-nyckel som flikarna på Hem använder
 * ('bilder' | 'minnen' | 'milstolpar' | null för allt).
 */
export function initSimplePage({ activePage, title, subtitle, matchesFilter }) {
  document.getElementById('page-title').textContent = title;
  document.getElementById('page-subtitle').textContent = subtitle;

  let memories = filterEntries(demoMemories, matchesFilter);
  let currentView = 'grid';

  const modal = mountAddEntryModal({
    onAdd(memory) {
      if (filterEntries([memory], matchesFilter).length > 0) {
        memories = [memory, ...memories];
        renderFeed();
      }
    },
  });

  renderLayout({ activePage, onAddEntry: () => modal.open(OPEN_DEFAULTS[matchesFilter] ?? {}) });

  const viewToggle = document.getElementById('view-toggle');
  viewToggle.querySelector('[data-view="grid"]').innerHTML = icons.grid(16);
  viewToggle.querySelector('[data-view="list"]').innerHTML = icons.list(16);
  viewToggle.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-view]');
    if (!button) return;
    currentView = button.dataset.view;
    viewToggle.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === button));
    renderFeed();
  });

  function renderFeed() {
    const groups = groupByAge(memories, child.birthDate, today);
    const container = document.getElementById('feed-container');
    if (groups.length === 0) {
      container.innerHTML = `<p style="color: var(--text-muted);">Inga minnen ännu.</p>`;
      return;
    }
    container.innerHTML = renderGroups(groups, currentView);
  }

  renderFeed();
}
