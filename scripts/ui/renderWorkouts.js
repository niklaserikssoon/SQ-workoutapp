const { loadExercises, getExercises, deleteExercise } = window.exerciseService
const { getWorkouts, addWorkout, updateWorkout, getWorkoutById } =
  window.workoutService

const form = document.getElementById('workout-form')
const list = document.getElementById('workout-list')
const status = document.getElementById('status')
const exerciseSelect = document.getElementById('exercise')

const nameInput = document.getElementById('name')
const durationInput = document.getElementById('duration')
const notesInput = document.getElementById('notes')
const idInput = document.getElementById('workout-id')
const submitBtn = form.querySelector('button')

async function renderExercises() {
  await loadExercises()
  // Clear dropdown
  exerciseSelect.innerHTML = `<option value="">Välj övning</option>`
  getExercises().forEach((exercise) => {
    const option = document.createElement('option')
    option.value = exercise.id
    option.textContent = exercise.name
    exerciseSelect.appendChild(option)
  })
}

function renderWorkouts() {
  list.style.minHeight = '240px'
  list.replaceChildren()

  const workouts = getWorkouts()

  if (workouts.length === 0) {
    const li = document.createElement('li')
    li.setAttribute('role', 'status')
    li.textContent = 'Inga träningspass ännu'
    list.appendChild(li)
    return
  }

  const fragment = document.createDocumentFragment()

  workouts.forEach((workout) => {
    const li = document.createElement('li')
    li.tabIndex = 0

    const exerciseId = workout.exercises?.[0]?.exerciseId
    const exercise = exerciseId ? getExerciseById(exerciseId) : null

    li.innerHTML = `
      <span>
        <strong>${workout.name}</strong> – ${workout.duration} min<br>
        <em>${exercise?.name || 'Ingen övning vald'}</em>
      </span>
      <button
        class="edit-btn"
        data-id="${workout.id}"
        aria-label="Redigera ${workout.name}">
        Redigera
      </button>
    `

    fragment.appendChild(li)
  })

  list.appendChild(fragment)
}

form.addEventListener('submit', (e) => {
  e.preventDefault()

  if (!exerciseSelect.value) {
    announce('Välj en övning')
    exerciseSelect.focus()
    return
  }

  const workout = {
    id: idInput.value || crypto.randomUUID(),
    name: nameInput.value.trim(),
    duration: Number(durationInput.value),
    notes: notesInput.value.trim(),
    exercises: [
      {
        exerciseId: Number(exerciseSelect.value),
      },
    ],
  }

  if (idInput.value) {
    updateWorkout(workout)
    announce('Träningspass uppdaterat')
  } else {
    addWorkout(workout)
    announce('Träningspass sparat')
  }

  resetForm()
  renderWorkouts()
})

document.addEventListener('click', (e) => {
  if (!e.target.classList.contains('edit-btn')) return

  const workout = getWorkoutById(e.target.dataset.id)
  if (!workout) return

  fillForm(workout)
})

function fillForm(workout) {
  nameInput.value = workout.name
  durationInput.value = workout.duration
  notesInput.value = workout.notes
  idInput.value = workout.id

  if (workout.exercises?.length) {
    exerciseSelect.value = workout.exercises[0].exerciseId
  }

  submitBtn.textContent = 'Spara ändringar'
  nameInput.focus()
}

function resetForm() {
  form.reset()
  idInput.value = ''
  submitBtn.textContent = 'Spara träningspass'
}

function announce(message) {
  status.textContent = message
}

;(async function init() {
  await renderExercises()
  renderWorkouts()

  // Update dropdown if exercises are deleted
  document.addEventListener('exercisesUpdated', renderExercises)
})()
