export function initSearch({ input, button, data, onResults }) {

  function runSearch() {
    const value = input.value.toLowerCase().trim()

    const filtered = data.filter(item =>
      item.name.toLowerCase().includes(value) ||
      item.category.toLowerCase().includes(value) ||
      item.muscleGroup.toLowerCase().includes(value) ||
      item.level.toLowerCase().includes(value)
    )

    onResults(filtered)
  }

  button.addEventListener("click", runSearch)

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") runSearch()
  })
}