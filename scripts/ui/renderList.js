// ui/renderList.js

// Renders the list of items in the UI

import { getItems } from '../storage/itemsStorage.js'

export function renderList() {
  const container = document.getElementById('item-list')
  if (!container) return

  const items = getItems()

  container.style.minHeight = '200px'

  container.replaceChildren()

  if (items.length === 0) {
    const empty = document.createElement('p')
    empty.className = 'empty-state'
    empty.textContent = 'No items yet. Add your first workout!'
    container.appendChild(empty)
    return
  }

  const fragment = document.createDocumentFragment()

  items.forEach((item) => {
    const li = document.createElement('li')
    li.textContent = item.name
    fragment.appendChild(li)
  })

  container.appendChild(fragment)
}
