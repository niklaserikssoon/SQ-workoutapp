import { icons } from './icons.js';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function locationTag(memory) {
  return memory.location
    ? `<span style="display:inline-flex; align-items:center; gap:4px;">${icons.mapPin(12)} ${memory.location}</span>`
    : '';
}

/**
 * Renderar ett Memory-kort. Det finns bara en entitet (Memory + Media) i
 * backend, så variant väljs utifrån isFavorite/media istället för en typ-kolumn:
 * - isFavorite → "milstolpe"-stil (gul, framhävd)
 * - har media   → foto/video-kort
 * - annars      → rent textminne
 */
export function renderEntryCard(memory) {
  if (memory.isFavorite) {
    return renderFavoriteCard(memory);
  }
  if ((memory.media?.length ?? 0) > 0) {
    return renderMediaCard(memory);
  }
  return renderPlainCard(memory);
}

function renderMediaCard(memory) {
  const media = memory.media[0];
  return `
    <article class="entry-card entry-card-photo">
      <button type="button" class="entry-card-menu" aria-label="Fler alternativ">${icons.more(14)}</button>
      <div class="entry-card-media">
        ${media.emoji ?? '📷'}
        ${media.type === 'Video' ? `<span style="position:absolute; margin-top: 46px;">${icons.play(16)}</span>` : ''}
      </div>
      <div class="entry-card-body">
        <div class="entry-card-title">${memory.title}</div>
        <div class="entry-card-date">${formatDate(memory.memoryDate)} ${locationTag(memory)}</div>
      </div>
    </article>
  `;
}

function renderPlainCard(memory) {
  return `
    <article class="entry-card entry-card-plain">
      <button type="button" class="entry-card-menu" aria-label="Fler alternativ">${icons.more(14)}</button>
      <div class="entry-card-media">💭</div>
      <div class="entry-card-body">
        <div class="entry-card-title">${memory.title}</div>
        ${memory.description ? `<div class="entry-card-desc">${memory.description}</div>` : ''}
        <div class="entry-card-date">${formatDate(memory.memoryDate)} ${locationTag(memory)}</div>
      </div>
    </article>
  `;
}

function renderFavoriteCard(memory) {
  return `
    <article class="entry-card entry-card-favorite">
      <div class="entry-card-icon-circle">${icons.star(20)}</div>
      <div class="entry-card-title">${memory.title}</div>
      ${memory.description ? `<div class="entry-card-desc">${memory.description}</div>` : ''}
      <div class="entry-card-date">${formatDate(memory.memoryDate)} ${locationTag(memory)}</div>
    </article>
  `;
}
