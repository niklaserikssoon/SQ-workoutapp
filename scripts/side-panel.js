document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle')
  const sidePanel = document.getElementById('side-panel')
  const backdrop = document.getElementById('side-panel-backdrop')

  if (!menuToggle || !sidePanel || !backdrop) {
    console.warn('Sidebar elements missing from DOM')
    return
  }

  // Open the panel
  menuToggle.addEventListener('click', () => {
    sidePanel.classList.add('open')
    backdrop.classList.add('visible')
    sidePanel.setAttribute('aria-hidden', 'false')
  })

  // Close the panel when clicking the backdrop
  backdrop.addEventListener('click', () => {
    sidePanel.classList.remove('open')
    backdrop.classList.remove('visible')
    sidePanel.setAttribute('aria-hidden', 'true')
  })
})
