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
  if (!content) return

  // Mark as loading (accessibility + CLS clarity)
  content.setAttribute('aria-busy', 'true')

  // Replace only inner content, not the container
  content.replaceChildren()

  const template = document.createElement('template')
  template.innerHTML = html

  content.appendChild(template.content)
  content.setAttribute('aria-busy', 'false')

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

//---- Offline app installation ----//
let deferredPrompt = null;
const installBtn = document.getElementById("install-btn");

const INSTALL_KEY = "pwa-install-dismissed";

// Listen for browser install availability
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();

  // Don't show again if user dismissed
  if (localStorage.getItem(INSTALL_KEY) === "true") return;

  deferredPrompt = e;
  installBtn.hidden = false;
});

// Handle install button click
installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  const choice = await deferredPrompt.userChoice;

  if (choice.outcome === "dismissed") {
    localStorage.setItem(INSTALL_KEY, "true");
  }

  installBtn.hidden = true;
  deferredPrompt = null;
});

// Detect successful install
window.addEventListener("appinstalled", () => {
  installBtn.hidden = true;
  localStorage.setItem("pwa-installed", "true");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/scripts/workers/service-worker.js");
  });
}

// Load script
loadExercises();


// generate random workout from API exercise database
import { generateWorkout } from "./ui/generateWorkout.js";

const button = document.getElementById("generate-btn");
const input = document.getElementById("workout-input");
const workoutList = document.getElementById("workout-list");

button.addEventListener("click", async () => {
  const muscle = input.value.trim();

  if (!muscle) {
    alert("Please enter a muscle group");
    return;
  }

  const workout = await generateWorkout(muscle, 5);

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
    <td> ${ex.sets}</td>
    <td>${ex.reps}</td>
  `;

  tbody.appendChild(row);
});

workoutList.appendChild(table);
});
