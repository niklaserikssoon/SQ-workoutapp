// UI rendering modules
import { renderList, initWorkoutNav } from './ui/index.js'
import { renderExerciseBank, loadExercises } from './ui/exercise-bank.js'
import { initSearch } from './logic/search.js'
import { initCreateForm } from './create-Item.js'
import { generateWorkout } from './ui/generateWorkout.js'

/**
 * Loads the HTML component into #app-content
 * Initializes UI event listeners
 */
async function loadComponent() {
  const root = document.getElementById('app-content')
  if (!root) return

  try {
    const response = await fetch('../src/items-list.html')
    if (!response.ok)
      throw new Error(`Could not load page (${response.status})`)
    const html = await response.text()

    root.setAttribute('aria-busy', 'true')
    root.replaceChildren()

    const template = document.createElement('template')
    template.innerHTML = html
    root.appendChild(template.content)

    root.setAttribute('aria-busy', 'false')

    initCreateForm()
    renderList()
    renderExerciseBank()
  } catch (error) {
    console.error('loadComponent failed:', error)
    root.innerHTML =
      '<p>Sorry, something went wrong loading this page. Please try again.</p>'
  }
}

// Component is loaded when page is ready
document.addEventListener('DOMContentLoaded', () => {
  loadComponent()
  initWorkoutNav()
  window.loadComponent = loadComponent

  // Initialize exercises on pages that have #workout-display
  if (document.getElementById('workout-display')) {
    loadExercises().then((exercises) => {
      initSearch({
        input: document.getElementById('exercise-search'),
        button: document.getElementById('search-button'),
        data: exercises,
        onResults: (results) => {
          const gallery = document.getElementById('workout-display')
          if (!gallery) return
          gallery.innerHTML = ''
          const fragment = document.createDocumentFragment()
          results.forEach((exercise) => {
            const article = document.createElement('article')
            article.classList.add('card')
            article.innerHTML = `
              <h3>${exercise.name}</h3>
              <p><strong>Category:</strong> ${exercise.category}</p>
              <p><strong>Level:</strong> ${exercise.level}</p>
              <p><strong>Equipment:</strong> ${exercise.equipment ?? 'None'}</p>
              <p><strong>Primary muscles:</strong> ${exercise.primaryMuscles.join(', ')}</p>
              <p><strong>Secondary muscles:</strong> ${exercise.secondaryMuscles.join(', ')}</p>
            `
            fragment.appendChild(article)
          })
          gallery.appendChild(fragment)
        },
      })
    })
  }

  // Workout generator button
  const button = document.getElementById('generate-btn')
  const input = document.getElementById('workout-input')
  const workoutList = document.getElementById('workout-list')

  if (button && input && workoutList) {
    button.addEventListener('click', async () => {
      const muscle = input.value.trim()
      if (!muscle) {
        alert('Please enter a muscle group')
        return
      }

      const workout = await generateWorkout(muscle, 5)
      workoutList.innerHTML = ''

      const table = document.createElement('table')
      table.classList.add('workout-table')
      table.innerHTML = `
        <thead>
          <tr>
            <th>Exercise</th>
            <th>Sets</th>
            <th>Reps</th>
          </tr>
        </thead>
        <tbody></tbody>
      `

      const tbody = table.querySelector('tbody')
      workout.forEach((ex) => {
        const row = document.createElement('tr')
        row.innerHTML = `
          <td>🏋️ ${ex.name}</td>
          <td>${ex.sets}</td>
          <td>${ex.reps}</td>
        `
        tbody.appendChild(row)
      })

      workoutList.appendChild(table)
    })
  }
})

document.addEventListener('itemsUpdated', renderList)
document.addEventListener('exercisesUpdated', renderExerciseBank)

window.addEventListener('storage', () => {
  renderList()
  renderExerciseBank()
})
