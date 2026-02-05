// storage/itemsStorage.js

// Handles all data management for items

export function getItems() {
  const items = JSON.parse(localStorage.getItem('items')) || []
  return items.sort((a, b) => b.createdAt - a.createdAt) // newest first
}

export function addTestItem(name) {
  const items = JSON.parse(localStorage.getItem('items')) || []

  items.push({
    name,
    createdAt: Date.now(),
  })

  localStorage.setItem('items', JSON.stringify(items))
  document.dispatchEvent(new Event('itemsUpdated'))
}
