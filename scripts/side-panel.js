document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle')
  const sidePanel = document.getElementById('side-panel')
  const backdrop = document.getElementById('side-panel-backdrop')

  if (!menuToggle || !sidePanel || !backdrop) {
    console.warn('Sidebar elements missing from DOM')
    return
  }

  let isOpen = false

  sidePanel.querySelectorAll('input, button, select, textarea, a[href], [tabindex]').forEach(el => {
    el.disabled = true
    el.setAttribute('tabindex', '-1')
  })
  
  /* ---------- Panel controls ---------- */
  function openPanel() {
    if (isOpen) return
    isOpen = true

    sidePanel.classList.add('open')
    backdrop.classList.add('visible')
    menuToggle.classList.add('is-open')

    sidePanel.hidden = false
    sidePanel.setAttribute('aria-hidden', 'false')
    menuToggle.setAttribute('aria-expanded', 'true')

    sidePanel.querySelectorAll('input, button, [tabindex]').forEach(el => {
      el.disabled = false;
      el.setAttribute('tabindex', '0');
    });

    const firstFocusable = sidePanel.querySelector('input, button, [tabindex]');
    firstFocusable?.focus();
  }

  function closePanel() {
    if (!isOpen) return
    isOpen = false

    sidePanel.classList.remove('open')
    backdrop.classList.remove('visible')
    menuToggle.classList.remove('is-open')

    sidePanel.hidden = true
    sidePanel.setAttribute('aria-hidden', 'true')
    menuToggle.setAttribute('aria-expanded', 'false')

    sidePanel.querySelectorAll('input, button, [tabindex]').forEach(el => {
    el.disabled = true;
    el.setAttribute('tabindex', '-1');
    });
  }

  /* ---------- Toggle button ---------- */
  menuToggle.addEventListener('click', () => {
    isOpen ? closePanel() : openPanel()
  })

  /* ---------- Close interactions ---------- */
  backdrop.addEventListener('click', closePanel)

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closePanel()
    }
  })

  /* ---------- Navigation handling ---------- */
  sidePanel.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-nav]')
    if (!btn) return

    const nav = btn.dataset.nav
    sessionStorage.setItem('activeView', nav)

    if (nav === 'add' && typeof window.loadComponent === 'function') {
      window.loadComponent().then(() => {
        const form = document.getElementById('create-item-form')
        if (form) {
          form.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    }

    closePanel()
  })

  /* ---------- Restore state ---------- */
  const savedView = sessionStorage.getItem('activeView')

  if (savedView === 'add' && typeof window.loadComponent === 'function') {
    window.loadComponent().then(() => {
      const form = document.getElementById('create-item-form')
      if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    })
  }

  sidePanel.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-nav]')
    if (!btn) return

    const nav = btn.dataset.nav

    switch (nav) {
      case 'show-exercises':
        window.location.href = '../src/exerciseBank.html#show-all-exercises'
        break;

      case 'search-exercises': {
        const input = document.getElementById('side-panel-search');
        const query = input?.value.trim();

        const url = query
          ? `../src/exerciseBank.html#search=${encodeURIComponent(query)}`
          : `../src/exerciseBank.html#search`;
          
        window.location.href = url;
        break;
      }

      case 'add-workout':
        document.getElementById('add-workout-section')?.scrollIntoView({ behavior: 'smooth' })
        break;
    }

    closePanel()
  })

  sessionStorage.removeItem('activeView')
})


