import { renderLayout } from './layout.js';
import { mountAddEntryModal } from './addEntryModal.js';
import { renderGroups } from './feed.js';
import { icons } from './icons.js';
import { memories as demoMemories, child, today } from '../data/demoData.js';
import { groupByAge } from '../logic/groupByAge.js';
import { filterEntries } from '../logic/filterEntries.js';

let memories = [...demoMemories];
let currentFilter = 'alla';
let currentView = 'grid';
let visibleGroups = 2;
const GROUPS_PER_PAGE = 2;

const modal = mountAddEntryModal({
  onAdd(memory) {
    memories = [memory, ...memories];
    renderFeed();
  },
});

renderLayout({ activePage: 'home', onAddEntry: () => modal.open() });

document.getElementById('hero-subtitle').textContent = `Spara, minns och återupplev ${child.name}s resa genom livet.`;
document.getElementById('feed-title').textContent = `${child.name}s resa`;
document.getElementById('qa-timeline-subtitle').textContent = `${child.name}s resa`;
document.getElementById('qa-icon-photo').innerHTML = icons.camera(18);
document.getElementById('qa-icon-memory').innerHTML = icons.edit(18);
document.getElementById('qa-icon-milestone').innerHTML = icons.star(18);
document.getElementById('qa-icon-timeline').innerHTML = icons.timeline(18);

document.querySelectorAll('.quick-action[data-open]').forEach((button) => {
  button.addEventListener('click', () =>
    modal.open({
      withMedia: button.dataset.withMedia === 'true',
      favorite: button.dataset.favorite === 'true',
    })
  );
});

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

const filterTabs = document.getElementById('filter-tabs');
filterTabs.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-filter]');
  if (!button) return;
  currentFilter = button.dataset.filter;
  visibleGroups = GROUPS_PER_PAGE;
  filterTabs.querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === button));
  renderFeed();
});

document.getElementById('show-more-btn').innerHTML = `Visa fler ${icons.chevronDown(16)}`;
document.getElementById('show-more-btn').addEventListener('click', () => {
  visibleGroups += GROUPS_PER_PAGE;
  renderFeed();
});

function renderFeed() {
  const filtered = filterEntries(memories, currentFilter);
  const groups = groupByAge(filtered, child.birthDate, today);
  const visible = groups.slice(0, visibleGroups);

  document.getElementById('feed-container').innerHTML = renderGroups(visible, currentView);
  document.getElementById('show-more-wrap').hidden = visibleGroups >= groups.length;
}

renderFeed();
