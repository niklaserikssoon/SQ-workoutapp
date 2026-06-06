// ui/createWorkout.js
import workoutService from '../storage/workouts.js'
import { getToken } from '../storage/profileStorage.js'

const API_BASE = CONFIG.workoutApiUrl + 'api/v1/workouts'

// ── State ──────────────────────────────────────────────────────
let allExercises    = []
let selectedExercises = []

// ── Init (called from main.js, receives already-loaded exercises) ──
export function initCreateWorkout(exercises) {
  allExercises = exercises

  // Navigation
  document.getElementById('custom-workout-btn')
    ?.addEventListener('click', showCreateWorkout)
  document.getElementById('create-workout-back-btn')
    ?.addEventListener('click', hideCreateWorkout)
  document.getElementById('my-workouts-btn')
    ?.addEventListener('click', showMyWorkouts)
  document.getElementById('my-workouts-back-btn')
    ?.addEventListener('click', hideMyWorkouts)

  // Search
  document.getElementById('workout-exercise-search-btn')
    ?.addEventListener('click', searchExercises)
  document.getElementById('workout-exercise-search')
    ?.addEventListener('keydown', e => { if (e.key === 'Enter') searchExercises() })

  // Save
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
}

function hideCreateWorkout() {
  toggle('create-workout-section', true)
  toggle('workout-options', false)
}

function showMyWorkouts() {
  toggle('workout-options', true)
  toggle('my-workouts-section', false)
  renderMyWorkouts()
}

function hideMyWorkouts() {
  toggle('my-workouts-section', true)
  toggle('workout-options', false)
}

// ── Exercise Search ────────────────────────────────────────────
function searchExercises() {
  const query = document.getElementById('workout-exercise-search')
    .value.trim().toLowerCase()

  if (!query) return

  const results = allExercises
    .filter(ex =>
      ex.name.toLowerCase().includes(query) ||
      ex.primaryMuscles?.some(m => m.toLowerCase().includes(query))
    )
    .slice(0, 15)

  renderSearchResults(results)
}

function renderSearchResults(exercises) {
  const container = document.getElementById('workout-exercise-results')
  container.innerHTML = ''

  if (!exercises.length) {
    container.innerHTML = '<p class="empty-state">No exercises found.</p>'
    return
  }

  exercises.forEach(ex => {
    const div = document.createElement('div')
    div.className = 'exercise-result-item'

    const alreadyAdded = selectedExercises.some(e => e.exerciseName === ex.name)

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
      // Refresh results to update button state
      searchExercises()
    })

    container.appendChild(div)
  })
}

// ── Selected Exercises ─────────────────────────────────────────
function addExercise(ex) {
  if (selectedExercises.some(e => e.exerciseName === ex.name)) return

  selectedExercises.push({
    exerciseId:   ex.id ?? 0,
    exerciseName: ex.name,
    primaryMuscle: ex.primaryMuscles?.[0] ?? ''
  })

  renderSelectedExercises()
}

function removeExercise(name) {
  selectedExercises = selectedExercises.filter(e => e.exerciseName !== name)
  renderSelectedExercises()
  // Refresh search results to re-enable the removed exercise
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
    div.className = 'exercise-result-item'
    div.innerHTML = `
      <span>
        ${ex.exerciseName}
        <small>${ex.primaryMuscle}</small>
      </span>
      <button class="btn-secondary remove-exercise-btn">Remove</button>
    `
    div.querySelector('.remove-exercise-btn').addEventListener('click', () => {
      removeExercise(ex.exerciseName)
    })
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

  // Always save locally
  workoutService.addWorkout(workout)

  // Try API if logged in (uses internal exercise IDs — may be 0 for external exercises)
  const token = getToken()
  if (token) {
    const validIds = selectedExercises.map(e => e.exerciseId).filter(id => id > 0)
    if (validIds.length) {
      try {
        await fetch(API_BASE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ exerciseIds: validIds })
        })
      } catch (err) {
        console.warn('API save failed, saved locally:', err)
      }
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

  // Merge with API workouts if logged in
  const token = getToken()
  if (token) {
    try {
      const res = await fetch(API_BASE, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.ok) {
        const apiWorkouts = await res.json()
        // Merge: prefer API versions, keep local-only ones
        const apiIds = new Set(apiWorkouts.map(w => String(w.workoutId)))
        const localOnly = workouts.filter(w => !apiIds.has(String(w.id)))
        workouts = [
          ...apiWorkouts.map(w => ({
            id:        w.workoutId,
            name:      `Workout ${w.workoutId}`,
            date:      w.createdAt?.split('T')[0] ?? '—',
            exercises: w.exercises.map(e => ({
              exerciseName:  e.exerciseName,
              primaryMuscle: e.primaryMuscle
            })),
            fromApi: true
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
      <ul class="saved-workout-exercises">
        ${w.exercises.map(e =>
          `<li>${e.exerciseName} <small>${e.primaryMuscle ?? ''}</small></li>`
        ).join('')}
      </ul>
    `

    div.querySelector('.delete-workout-btn').addEventListener('click', async (e) => {
      const id     = e.target.dataset.id
      const fromApi = e.target.dataset.api === 'true'

      workoutService.deleteWorkout(id)

      if (fromApi && token) {
        try {
          await fetch(`${API_BASE}/${id}`, {
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