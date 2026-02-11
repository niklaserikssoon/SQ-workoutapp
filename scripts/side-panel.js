document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle')
  const sidePanel = document.getElementById('side-panel')
  const backdrop = document.getElementById('side-panel-backdrop')
  
  if (!menuToggle || !sidePanel || !backdrop) {
    console.warn('Sidebar elements missing from DOM');
    return;
  }
  
  const savedView = sessionStorage.getItem('activeView');
  
  if (savedView === 'add') {
    if (typeof window.loadComponent === 'function') {
      window.loadComponent().then(() => {
        const form = document.getElementById('create-item-form');
        if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    }
  }
 
// Reset on refresh/new load
sessionStorage.removeItem('activeView');

  function openPanel() {
    sidePanel.classList.add('open')
    backdrop.classList.add('visible')
    sidePanel.setAttribute('aria-hidden', 'false')
    menuToggle.classList.add('is-open')
    menuToggle.setAttribute('aria-expanded', 'true')
  }

  function closePanel() {
    sidePanel.classList.remove('open')
    backdrop.classList.remove('visible')
    sidePanel.setAttribute('aria-hidden', 'true')
    menuToggle.classList.remove('is-open')
    menuToggle.setAttribute('aria-expanded', 'false')
  }

  menuToggle.addEventListener('click', () => {
    if (sidePanel.classList.contains('open')) {
      closePanel()
    } else {
      openPanel()
    }
  })

  backdrop.addEventListener('click', closePanel)
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidePanel.classList.contains('open')) {
      closePanel()
    }
  })
  
  // Navigation buttons (delegation)
sidePanel.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-nav]');
  if (!btn) return;

  const nav = btn.dataset.nav;
  sessionStorage.setItem('activeView', nav);

  if (nav === 'add') {
    if (typeof window.loadComponent === 'function') {
      window.loadComponent().then(() => {
        const form = document.getElementById('create-item-form');
        if (form) form.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      })
    }
  }

    closePanel()
  })
})