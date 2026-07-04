import { renderLayout, initThemeToggle } from './layout.js';
import { mountAddEntryModal } from './addEntryModal.js';
import { icons } from './icons.js';
import { child, today, familyMembers as demoFamilyMembers, pendingInvites as demoPendingInvites } from '../data/demoData.js';
import { formatAge } from '../logic/age.js';

const ROLE_LABEL = { Parent: 'Förälder', Guardian: 'Vårdnadshavare', Viewer: 'Betraktare' };

let familyMembers = [...demoFamilyMembers];
let pendingInvites = [...demoPendingInvites];

const modal = mountAddEntryModal({ onAdd() {} });
renderLayout({ activePage: 'settings', onAddEntry: () => modal.open() });
initThemeToggle(document.getElementById('settings-theme-toggle'));

const born = new Date(child.birthDate).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long', year: 'numeric' });
document.getElementById('child-info').textContent = `${child.name}, ${formatAge(child.birthDate, today)} · född ${born}`;

function renderFamilyList() {
  document.getElementById('family-list').innerHTML = familyMembers
    .map(
      (member) => `
      <div class="family-member">
        <div class="family-member-avatar">${member.initials}</div>
        <div>
          <div class="family-member-name">${member.displayName}</div>
          <div class="family-member-role">${ROLE_LABEL[member.role] ?? member.role}</div>
        </div>
        <span class="family-member-status accepted">Med i familjen</span>
      </div>`
    )
    .join('');
}

function renderPendingInvites() {
  const list = document.getElementById('pending-invite-list');
  if (pendingInvites.length === 0) {
    list.innerHTML = `<p style="color: var(--text-muted); font-size: 0.85rem;">Inga väntande inbjudningar.</p>`;
    return;
  }
  list.innerHTML = pendingInvites
    .map(
      (invite) => `
      <div class="family-member">
        <div class="family-member-avatar">${icons.mail(16)}</div>
        <div>
          <div class="family-member-name">${invite.email}</div>
          <div class="family-member-role">Går ut ${new Date(invite.expiresAt).toLocaleDateString('sv-SE', { day: 'numeric', month: 'long' })}</div>
        </div>
        <span class="family-member-status pending">Väntar på svar</span>
      </div>`
    )
    .join('');
}

renderFamilyList();
renderPendingInvites();

// --- Mock-inbjudan (ingen riktig e-post skickas, ersätt med backend-anrop mot
// FamilyInvite-endpointen senare – den tar bara emot en e-postadress). ---
const inviteDialog = document.createElement('dialog');
inviteDialog.innerHTML = `
  <div class="modal-header">
    <h2>Bjud in familjemedlem</h2>
    <button type="button" class="modal-close" aria-label="Stäng">${icons.close(16)}</button>
  </div>
  <form class="modal-body">
    <div class="field">
      <label for="invite-email">E-postadress</label>
      <input id="invite-email" name="email" type="email" placeholder="mormor.karin@exempel.se" required />
    </div>
    <div class="invite-link-box">
      <code id="invite-link"></code>
      <button type="button" class="icon-btn" id="copy-link-btn" aria-label="Kopiera länk">${icons.mail(16)}</button>
    </div>
  </form>
  <div class="modal-footer">
    <button type="button" class="btn btn-secondary" data-action="cancel">Avbryt</button>
    <button type="button" class="btn btn-primary" data-action="send">Skicka inbjudan</button>
  </div>
`;
document.body.appendChild(inviteDialog);

function generateInviteLink() {
  const token = Math.random().toString(36).slice(2, 10);
  return `tinytales.example/invite/${token}`;
}

inviteDialog.querySelector('.modal-close').addEventListener('click', () => inviteDialog.close());
inviteDialog.querySelector('[data-action="cancel"]').addEventListener('click', () => inviteDialog.close());

inviteDialog.querySelector('#copy-link-btn').addEventListener('click', async () => {
  const link = inviteDialog.querySelector('#invite-link').textContent;
  try {
    await navigator.clipboard.writeText(link);
  } catch {
    // Klippbord kan vara otillgängligt i vissa miljöer – inte kritiskt för prototypen.
  }
});

inviteDialog.querySelector('[data-action="send"]').addEventListener('click', () => {
  const form = inviteDialog.querySelector('form');
  if (!form.reportValidity()) {
    return;
  }
  const data = new FormData(form);
  const email = data.get('email');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  pendingInvites = [...pendingInvites, { id: `local-${Date.now()}`, email, expiresAt }];
  renderPendingInvites();
  form.reset();
  inviteDialog.close();
});

document.getElementById('invite-btn').addEventListener('click', () => {
  inviteDialog.querySelector('form').reset();
  inviteDialog.querySelector('#invite-link').textContent = generateInviteLink();
  inviteDialog.showModal();
});
