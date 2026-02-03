import { renderList } from './renderList.js'

// TEMPORARY: Loading component into the page for testing
async function loadComponent() {
  const response = await fetch('./items-list.html')
  const html = await response.text()

  const root = document.getElementById('app-root')
  if (root) {
    root.innerHTML = html
    renderList()
  }
}

document.addEventListener('DOMContentLoaded', loadComponent)

// Auto-refresh when items change
document.addEventListener('itemsUpdated', renderList)
window.addEventListener('storage', renderList)

import { addTestItem } from './items.js'

async function loadComponent() {
  const response = await fetch('./items-list.html')
  const html = await response.text()

  const root = document.getElementById('app-root')
  if (root) {
    root.innerHTML = html

    const btn = document.getElementById('add-test-item')
    if (btn) {
      btn.addEventListener('click', () => {
        addTestItem('Workout ' + Math.floor(Math.random() * 100))
      })
    }

    renderList()
  }
}
