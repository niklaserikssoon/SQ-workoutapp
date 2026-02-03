import { getItems } from './items.js'

export function renderList() {
  const container = document.getElementById('item-list')
  const items = getItems()

  container.innerHTML = ''

  if (items.length === 0) {
    container.innerHTML =
      '<p class="empty-state">No items yet. Add your first workout!</p>'
    return
  }

  items.forEach((item) => {
    const li = document.createElement('li')
    li.textContent = item.name
    container.appendChild(li)
  })
}
