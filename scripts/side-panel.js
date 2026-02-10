document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle')
  const sidePanel = document.getElementById('side-panel')
  const backdrop = document.getElementById('side-panel-backdrop')
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidePanel.classList.contains('open')) {
      closePanel()
    }
  })

  if (!menuToggle || !sidePanel || !backdrop) {
    console.warn('Sidebar elements missing from DOM')
    return
  }

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

  backdrop.addEventListener('click', () => {
    closePanel()
  })
})
