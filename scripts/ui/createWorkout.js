// ui/createWorkout.js
import workoutService from '../storage/workouts.js'
import { getToken } from '../storage/profileStorage.js'

const EXERCISE_API = CONFIG.workoutApiUrl + 'api/v1/Exercise'
const WORKOUT_API  = CONFIG.workoutApiUrl + 'api/v1/workouts'

let selectedExercises = []

export function initCreateWorkout() {
  document.getElementById('custom-workout-btn')
    ?.addEventListener('click', showCreateWorkout)
  document.getElementById('create-workout-back-btn')
    ?.addEventListener('click', hideCreateWorkout)
  document.getElementById('my-workouts-btn')
    ?.addEventListener('click', showMyWorkouts)
  document.getElementById('my-workouts-back-btn')
    ?.addEventListener('click', hideMyWorkouts)

  document.getElementById('workout-exercise-search-btn')
    ?.addEventListener('click', searchExercises)
  document.getElementById('workout-exercise-search')
    ?.addEventListener('keydown', e => { if (e.key === 'Enter') searchExercises() })

  document.getElementById('save-workout-btn')
    ?.addEventListener('click', saveWorkout)
}

// ── Navigation ─────────────────────────────────────────────────
function showCreateWorkout() {
  selectedExercises = []
  document.getElementById('workout-name').value = ''
  document.getElementById('workout-exercise-search').value = ''
  document.getElementById('workout-exercise-results').innerHTML = ''
  renderSelectedExercises()
  toggle('workout-options', true)
  toggle('create-workout-section', false)
  document.querySelector('.hero-header').hidden = true
}

function hideCreateWorkout() {
  toggle('create-workout-section', true)
  toggle('workout-options', false)
  document.querySelector('.hero-header').hidden = false
}

function showMyWorkouts() {
  toggle('workout-options', true)
  toggle('my-workouts-section', false)
  renderMyWorkouts()
  document.querySelector('.hero-header').hidden = true
}

function hideMyWorkouts() {
  toggle('my-workouts-section', true)
  toggle('workout-options', false)
  document.querySelector('.hero-header').hidden = false
}

// ── Exercise Search ────────────────────────────────────────────
async function searchExercises() {
  const query = document.getElementById('workout-exercise-search').value.trim()
  if (!query) return

  const container = document.getElementById('workout-exercise-results')
  container.innerHTML = '<p class="empty-state">Searching…</p>'

  try {
    const token = getToken()
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const res = await fetch(`${EXERCISE_API}?search=${encodeURIComponent(query)}`, { headers })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const exercises = await res.json()
    renderSearchResults(exercises)
  } catch (err) {
    container.innerHTML = '<p class="empty-state">Could not load exercises.</p>'
    console.error('Exercise search failed:', err)
  }
}

function renderSearchResults(exercises) {
  const container = document.getElementById('workout-exercise-results')
  container.innerHTML = ''

  if (!exercises.length) {
    container.innerHTML = '<p class="empty-state">No exercises found.</p>'
    return
  }

  exercises.slice(0, 15).forEach(ex => {
    const div = document.createElement('div')
    div.className = 'exercise-result-item'

    const alreadyAdded = selectedExercises.some(e => e.exerciseId === ex.id)

    div.innerHTML = `
      <span>
        ${ex.name}
        <small>${ex.primaryMuscles?.join(', ') ?? ''}</small>
      </span>
      <button class="btn-secondary add-exercise-btn" ${alreadyAdded ? 'disabled' : ''}>
        ${alreadyAdded ? 'Added' : 'Add'}
      </button>
    `

    div.querySelector('.add-exercise-btn').addEventListener('click', () => {
      addExercise(ex)
      searchExercises()
    })

    container.appendChild(div)
  })
}

// ── Selected Exercises ─────────────────────────────────────────
function addExercise(ex) {
  if (selectedExercises.some(e => e.exerciseId === ex.id)) return

  selectedExercises.push({
    exerciseId:    ex.id,
    exerciseName:  ex.name,
    primaryMuscle: ex.primaryMuscles?.[0] ?? '',
    sets:          3,
    reps:          10
  })

  renderSelectedExercises()
}

function removeExercise(id) {
  selectedExercises = selectedExercises.filter(e => e.exerciseId !== id)
  renderSelectedExercises()
  const query = document.getElementById('workout-exercise-search').value.trim()
  if (query) searchExercises()
}

function renderSelectedExercises() {
  const container = document.getElementById('selected-exercises')
  container.innerHTML = ''

  if (!selectedExercises.length) {
    container.innerHTML = '<p class="empty-state">No exercises added yet.</p>'
    return
  }

  selectedExercises.forEach(ex => {
    const div = document.createElement('div')
    div.className = 'selected-exercise-item'
    div.innerHTML = `
      <div class="selected-exercise-main">
        <span class="selected-exercise-name">${ex.exerciseName}</span>
        <small>${ex.primaryMuscle}</small>
      </div>
      <div class="sets-reps-controls">
        ${buildPicker('sets', ex.sets)}
        ${buildPicker('reps', ex.reps)}
      </div>
      <button class="btn-remove-btn remove-exercise-btn" aria-label="Remove exercise">✕</button>
    `

    wirePickerEvents(div, 'sets', ex)
    wirePickerEvents(div, 'reps', ex)
    div.querySelector('.remove-exercise-btn').addEventListener('click', () => removeExercise(ex.exerciseId))
    container.appendChild(div)
  })
}

// ── Save Workout ───────────────────────────────────────────────
async function saveWorkout() {
  const feedback = document.getElementById('create-workout-feedback')
  const name     = document.getElementById('workout-name').value.trim()

  if (!name) {
    showFeedback(feedback, 'Please enter a workout name.', true)
    return
  }
  if (!selectedExercises.length) {
    showFeedback(feedback, 'Please add at least one exercise.', true)
    return
  }

  const workout = {
    name,
    date:      new Date().toISOString().split('T')[0],
    exercises: selectedExercises
  }

  workoutService.addWorkout(workout)

  const token = getToken()
  if (token) {
    try {
      await fetch(WORKOUT_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          catalogExerciseIds: selectedExercises.map(e => e.exerciseId)
        })
      })
    } catch (err) {
      console.warn('API save failed, saved locally:', err)
    }
  }

  showFeedback(feedback, 'Workout saved!', false)
  setTimeout(hideCreateWorkout, 1200)
}

// ── My Workouts ────────────────────────────────────────────────
async function renderMyWorkouts() {
  const container = document.getElementById('my-workouts-list')
  container.innerHTML = '<p class="empty-state">Loading…</p>'

  let workouts = workoutService.getWorkouts()

  const token = getToken()
  if (token) {
    try {
      const res = await fetch(WORKOUT_API, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const apiWorkouts = await res.json()
        const apiIds = new Set(apiWorkouts.map(w => String(w.workoutId)))
        const localOnly = workouts.filter(w => !apiIds.has(String(w.id)))
        workouts = [
          ...apiWorkouts.map(w => ({
            id:        w.workoutId,
            name:      w.name ?? `Workout ${w.workoutId}`,
            date:      w.createdAt?.split('T')[0] ?? '—',
            exercises: w.exercises ?? [],
            fromApi:   true
          })),
          ...localOnly
        ]
      }
    } catch (err) {
      console.warn('Could not fetch API workouts:', err)
    }
  }

  container.innerHTML = ''

  if (!workouts.length) {
    container.innerHTML = '<p class="empty-state">No saved workouts yet.</p>'
    return
  }

  workouts.forEach(w => {
    const div = document.createElement('div')
    div.className = 'saved-workout-item'
    div.innerHTML = `
      <div class="saved-workout-header">
        <span class="saved-workout-name">${w.name ?? 'Workout'}</span>
        <span class="workout-date">${w.date}</span>
        <button class="btn-secondary delete-workout-btn" data-id="${w.id}" data-api="${w.fromApi ?? false}">
          Delete
        </button>
      </div>
      <div class="saved-workout-table-wrapper">
        <table class="saved-workout-table">
          <thead>
            <tr>
              <th>Exercise</th>
              <th>Muscle</th>
              <th>Sets</th>
              <th>Reps</th>
            </tr>
          </thead>
          <tbody>
            ${w.exercises.map(e => `
              <tr>
                <td>${e.exerciseName ?? e.name ?? '—'}</td>
                <td>${e.primaryMuscle ?? '—'}</td>
                <td>${e.sets ?? '—'}</td>
                <td>${e.reps ?? '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `

    div.querySelector('.delete-workout-btn').addEventListener('click', async (e) => {
      const id      = e.target.dataset.id
      const fromApi = e.target.dataset.api === 'true'

      workoutService.deleteWorkout(id)

      if (fromApi && token) {
        try {
          await fetch(`${WORKOUT_API}/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          })
        } catch (err) {
          console.warn('API delete failed:', err)
        }
      }

      renderMyWorkouts()
    })

    container.appendChild(div)
  })
}

// ── Helpers ────────────────────────────────────────────────────
function toggle(id, hidden) {
  const el = document.getElementById(id)
  if (el) el.hidden = hidden
}

function showFeedback(el, message, isError) {
  el.textContent = message
  el.hidden = false
  el.className = isError ? 'feedback-error' : 'feedback-success'
  setTimeout(() => { el.hidden = true }, 3000)
}

const COMMON_VALUES = {
  sets: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  reps: [3, 5, 6, 8, 10, 12, 15, 20, 25]
}

function buildPicker(field, currentValue) {
  const options = COMMON_VALUES[field].map(v =>
    `<option value="${v}" ${v === currentValue ? 'selected' : ''}>${v}</option>`
  ).join('')

  return `
    <div class="picker-label">
      <span>${field.charAt(0).toUpperCase() + field.slice(1)}</span>
      <div class="select-wrapper">
        <select class="${field}-input">${options}</select>
        <span class="select-chevron" aria-hidden="true" style="pointer-events:none;">▾</span>
      </div>
    </div>
  `
}

function wirePickerEvents(div, field, ex) {
  div.querySelector(`.${field}-input`).addEventListener('change', e => {
    ex[field] = parseInt(e.target.value)
  })
}
