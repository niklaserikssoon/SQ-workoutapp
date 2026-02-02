export function getItems() {
  const items = JSON.parse(localStorage.getItem('items')) || []
  return items.sort((a, b) => b.createdAt - a.createdAt) // newest first
}
