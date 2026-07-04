import { icons } from './icons.js';

/**
 * Bygger och monterar "Lägg till"-dialogen i document.body.
 * Fälten matchar Memory + Media 1:1 (se backend TinyTales.Models) – det
 * finns ingen typ-kolumn, bara title/description/memoryDate/location/isFavorite
 * och en valfri bifogad bild. Sparar bara i minnet via onAdd-callbacken.
 * Byt onAdd mot ett POST-anrop till backend när den finns.
 */
export function mountAddEntryModal({ onAdd } = {}) {
  const dialog = document.createElement('dialog');
  dialog.id = 'add-entry-modal';
  dialog.innerHTML = `
    <div class="modal-header">
      <h2>Lägg till minne</h2>
      <button type="button" class="modal-close" aria-label="Stäng">${icons.close(16)}</button>
    </div>
    <form class="modal-body">
      <div class="field">
        <label for="entry-title">Titel</label>
        <input id="entry-title" name="title" type="text" placeholder="T.ex. Första leendet" required />
      </div>
      <div class="field">
        <label for="entry-description">Beskrivning</label>
        <textarea id="entry-description" name="description" placeholder="Ett litet ögonblick värt att minnas..."></textarea>
      </div>
      <div class="field-row">
        <div class="field">
          <label for="entry-date">Datum</label>
          <input id="entry-date" name="memoryDate" type="date" required />
        </div>
        <div class="field">
          <label for="entry-location">Plats (valfri)</label>
          <input id="entry-location" name="location" type="text" placeholder="T.ex. Parken" />
        </div>
      </div>
      <div class="field-checkbox">
        <input id="entry-add-media" type="checkbox" />
        <label for="entry-add-media">Lägg till bild</label>
      </div>
      <div class="field" data-field="media-emoji" hidden>
        <label for="entry-media-emoji">Bild (emoji-platshållare tills riktig uppladdning finns)</label>
        <input id="entry-media-emoji" type="text" maxlength="4" placeholder="📷" />
      </div>
      <div class="field-checkbox">
        <input id="entry-favorite" name="isFavorite" type="checkbox" />
        <label for="entry-favorite">Markera som milstolpe</label>
      </div>
    </form>
    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" data-action="cancel">Avbryt</button>
      <button type="button" class="btn btn-primary" data-action="save">Spara</button>
    </div>
  `;
  document.body.appendChild(dialog);

  const form = dialog.querySelector('form');
  const mediaCheckbox = dialog.querySelector('#entry-add-media');
  const mediaField = dialog.querySelector('[data-field="media-emoji"]');
  const mediaEmojiInput = dialog.querySelector('#entry-media-emoji');

  mediaCheckbox.addEventListener('change', () => {
    mediaField.hidden = !mediaCheckbox.checked;
  });

  dialog.querySelector('.modal-close').addEventListener('click', () => dialog.close());
  dialog.querySelector('[data-action="cancel"]').addEventListener('click', () => dialog.close());

  dialog.querySelector('[data-action="save"]').addEventListener('click', () => {
    if (!form.reportValidity()) {
      return;
    }
    const data = new FormData(form);

    const memory = {
      id: `local-${Date.now()}`,
      title: data.get('title') || 'Namnlöst minne',
      description: data.get('description') || '',
      memoryDate: data.get('memoryDate') || new Date().toISOString().slice(0, 10),
      location: data.get('location') || null,
      isFavorite: mediaCheckboxIsFavorite(dialog),
      media: mediaCheckbox.checked ? [{ type: 'Image', emoji: mediaEmojiInput.value || '📷', caption: null }] : [],
    };

    if (typeof onAdd === 'function') {
      onAdd(memory);
    }
    form.reset();
    mediaField.hidden = true;
    dialog.close();
  });

  function mediaCheckboxIsFavorite(root) {
    return root.querySelector('#entry-favorite').checked;
  }

  return {
    /** options: { withMedia?: boolean, favorite?: boolean } – för snabbknapparna på Hem. */
    open({ withMedia = false, favorite = false } = {}) {
      form.reset();
      form.elements.memoryDate.value = new Date().toISOString().slice(0, 10);
      mediaCheckbox.checked = withMedia;
      mediaField.hidden = !withMedia;
      mediaEmojiInput.value = withMedia ? '📷' : '';
      dialog.querySelector('#entry-favorite').checked = favorite;
      dialog.showModal();
      dialog.querySelector('#entry-title').focus();
    },
  };
}
