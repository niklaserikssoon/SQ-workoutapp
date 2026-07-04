import { renderEntryCard } from './entryCard.js';

/** Renderar en lista av ålders-grupper (från groupByAge) som HTML. */
export function renderGroups(groups, view = 'grid') {
  return groups.map((group) => renderGroup(group, view)).join('');
}

function renderGroup(group, view) {
  return `
    <div class="age-group">
      <div class="age-marker">
        <div class="age-marker-label">${group.isCurrent ? 'Idag' : group.ageLabel}</div>
        ${group.isCurrent ? `<div class="age-marker-sub">${group.ageLabel}</div>` : ''}
      </div>
      <div class="entry-grid ${view === 'list' ? 'is-list' : ''}">
        ${group.entries.map(renderEntryCard).join('')}
      </div>
    </div>
  `;
}
