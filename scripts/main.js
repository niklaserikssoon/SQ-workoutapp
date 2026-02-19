// UI rendering modules
import { renderList } from './ui/renderList.js'
import { renderExercises } from './ui/renderExercises.js'
import { initSearch } from './logic/search.js'
import { initCreateForm } from './createItem.js'

// Storage actions
import { addTestItem } from './storage/itemsStorage.js'

/**
 * Loads the HTML component into #app-root
 * Initializes UI event listeners
 */
async function loadComponent() {
  const response = await fetch('./items-list.html')
  const html = await response.text()

  const root = document.getElementById('app-content')
  if (!root) return

  root.setAttribute('aria-busy', 'true')
  root.replaceChildren()

  const template = document.createElement('template')
  template.innerHTML = html

  root.appendChild(template.content)
  root.setAttribute('aria-busy', 'false')

  //init Create form after HTML is injected
  initCreateForm()

  // Button for testing
  // const button = document.getElementById('add-test-item');
  // if (button) {
  //   button.addEventListener('click', () => {
  //     addTestItem('Workout ' + Math.floor(Math.random() * 100));
  //   });
  // }

  renderList()
  renderExercises()

  await loadExercises()
}

// Component is loaded when page is ready
document.addEventListener('DOMContentLoaded', loadComponent)
// Expose for side-panel navigation
window.loadComponent = loadComponent

document.addEventListener('itemsUpdated', renderList)
document.addEventListener('exercisesUpdated', renderExercises)

window.addEventListener('storage', () => {
  renderList()
  renderExercises()
})

// display all exercies from API
let allExercises = []

async function loadExercises() {
  const response = await fetch(
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/dist/exercises.json'
  )

  allExercises = await response.json()

  // visa alla från start
  displayExercises(allExercises)

  // koppla search
  initSearch({
    input: document.getElementById('exercise-search'),
    button: document.getElementById('search-button'),
    data: allExercises,
    onResults: displayExercises,
  })
}

function displayExercises(exercises) {
  const gallery = document.getElementById('workout-display')
  if(!gallery) return;
  gallery.innerHTML = ''

  exercises.forEach((exercise) => {
    const article = document.createElement('article')
    article.classList.add('card')

    article.innerHTML = `
      <h3>${exercise.name}</h3>

      <p><strong>Category:</strong> ${exercise.category}</p>
      <p><strong>Level:</strong> ${exercise.level}</p>
      <p><strong>Equipment:</strong> ${exercise.equipment ?? 'None'}</p>

      <p>
        <strong>Primary muscles:</strong>
        ${exercise.primaryMuscles.join(', ')}
      </p>

      <p>
        <strong>Secondary muscles:</strong>
        ${exercise.secondaryMuscles.join(', ')}
      </p>
    `

    gallery.appendChild(article)
  })
}

/* ----- GENERATE WORKOUT ----- */
import { generateWorkout } from "./ui/generateWorkout.js";

const button = document.getElementById("generate-btn");
const generatedWorkoutCard = document.getElementById("generate-workout");
const input = document.getElementById("workout-input");
const workoutList = document.getElementById("workout-list");

// Button for workout generation
button.addEventListener("click", async () => {
  const muscle = input.value.trim();
  if (!muscle) return alert("Please enter a muscle group");

  const workout = await generateWorkout(muscle, 5);
  renderWorkoutList(workout);
});

// Pull-to-refresh gesture
let startY = 0;
let isPulling = false;

generatedWorkoutCard.addEventListener("pointerdown", (e) => {
  startY = e.clientY;
});

generatedWorkoutCard.addEventListener("pointermove", (e) => {
  const delta = e.clientY - startY;
  if (delta > 50) { // pull distance threshold
    refreshIndicator.textContent = "Release to refresh...";
    isPulling = true;
  }
});

generatedWorkoutCard.addEventListener("pointerup", async () => {
  if (isPulling) {
    refreshIndicator.textContent = "Refreshing...";
    isPulling = false;

    const muscle = input.value.trim() || "Full Body"; // default if input empty
    const workout = await generateWorkout(muscle, 5);
    renderWorkoutList(workout);

    // reset indicator
    setTimeout(() => {
      refreshIndicator.textContent = "Pull down to refresh";
    }, 500);
  }
});

// Render Workout List function
function renderWorkoutList(workout) {
  workoutList.innerHTML = "";

  const table = document.createElement("table");
  table.classList.add("workout-table");

  table.innerHTML = `
    <thead>
      <tr>
        <th>Exercise</th>
        <th>Sets</th>
        <th>Reps</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  workout.forEach(ex => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>🏋️ ${ex.name}</td>
      <td>${ex.sets}</td>
      <td>${ex.reps}</td>
    `;

    tbody.appendChild(row);
  });

  workoutList.appendChild(table);
}


// UI navigation logic for workout generation and custom workout creation
const startSection = document.getElementById("start-workout");
const optionsSection = document.getElementById("workout-options");
const generateSection = document.getElementById("generate-workout");
const customSection = document.getElementById("custom-workout");

document.getElementById("start-btn").addEventListener("click", () => {
  startSection.hidden = true;
  optionsSection.hidden = false;
});

document.getElementById("generate-option").addEventListener("click", () => {
  optionsSection.hidden = true;
  generateSection.hidden = false;
});

document.getElementById("custom-option").addEventListener("click", () => {
  optionsSection.hidden = true;
  customSection.hidden = false;
});

// Back buttons
document.getElementById("options-back-btn").addEventListener("click", () => {
  optionsSection.hidden = true;
  startSection.hidden = false;
});

document.getElementById("generate-back-btn").addEventListener("click", () => {
  generateSection.hidden = true;
  optionsSection.hidden = false;
});

document.getElementById("custom-back-btn").addEventListener("click", () => {
  customSection.hidden = true;
  optionsSection.hidden = false;
});
