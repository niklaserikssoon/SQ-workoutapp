// UI rendering modules
//import { renderList } from './ui/generateWorkout.js'
//import { displayExercises } from './ui/exercise-bank.js'
import { initSearch } from './logic/search.js'
//import { initCreateForm } from './createItem.js'

// Storage actions
//import { addTestItem } from './storage/itemsStorage.js'

/**
 * Loads the HTML component into #app-root
 * Initializes UI event listeners
 */
async function loadComponent() {
  const response = await fetch('./items-list.html')
  const html = await response.text()

  const content = document.getElementById('app-content')
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
  //initCreateForm()

  // Button for testing
  // const button = document.getElementById('add-test-item');
  // if (button) {
  //   button.addEventListener('click', () => {
  //     addTestItem('Workout ' + Math.floor(Math.random() * 100));
  //   });
  // }

  renderList()
  displayExercises()
}

// Component is loaded when page is ready
document.addEventListener('DOMContentLoaded', loadComponent)
// Expose for side-panel navigation
window.loadComponent = loadComponent

//document.addEventListener('itemsUpdated', renderList)
//document.addEventListener('exercisesUpdated', renderExercises)

window.addEventListener('storage', () => {
  renderList()
  renderExercises()
})

// display all exercies from API
let allExercises = [];
let isLoaded = false;

async function loadExercises() {
  const response = await fetch(
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/dist/exercises.json'
  );

  allExercises = await response.json();
  isLoaded = true;

  // OBS: Visa INTE något här
  // displayExercises(allExercises)

  // koppla search (men du kan också välja att disable:a search tills man klickar)
  initSearch({
    input: document.getElementById('exercise-search'),
    button: document.getElementById('search-button'),
    data: allExercises,
    onResults: displayExercises,
  });
}

function displayExercises(exercises) {
  const gallery = document.getElementById('workout-display');
  gallery.innerHTML = '';

  exercises.forEach((exercise) => {
    const article = document.createElement('article');
    article.classList.add('card');

    article.innerHTML = `
      <h3>${exercise.name}</h3>
      <p><strong>Category:</strong> ${exercise.category}</p>
      <p><strong>Level:</strong> ${exercise.level}</p>
      <p><strong>Equipment:</strong> ${exercise.equipment ?? 'None'}</p>
      <p><strong>Primary muscles:</strong> ${exercise.primaryMuscles.join(', ')}</p>
      <p><strong>Secondary muscles:</strong> ${exercise.secondaryMuscles.join(', ')}</p>
    `;

    gallery.appendChild(article);
  });
}

document.getElementById('show-exercises')?.addEventListener('click', () => {
  if (!isLoaded) return;
  displayExercises(allExercises);
});

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

document.getElementById('load-more')?.addEventListener('click', () => {
  renderNextPage(false);
});


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

/*------- Custom Workout -------*/
import workoutService from "./storage/workouts.js";

// Elements
const customWorkoutSection = document.getElementById("custom-workout-section");
const customWorkoutList = document.getElementById("custom-workout-list");
const form = document.getElementById("custom-workout-form");

const backBtn = document.getElementById("custom-back-btn");
const customOptionBtn = document.getElementById("custom-option");
const clearBtn = document.getElementById("clear-workouts-btn");
const workoutOptionsSection = document.getElementById("workout-options");

// --- Navigation ---
// Show custom workout section when "Create Your Own" is clicked
customOptionBtn?.addEventListener("click", () => {
  workoutOptionsSection.hidden = true;
  customWorkoutSection.hidden = false;

  // Clear previous workouts when starting fresh
  workoutService.saveWorkouts([]); // clears localStorage
  renderWorkouts();
});

// Back button
backBtn?.addEventListener("click", () => {
  customWorkoutSection.hidden = true;
  workoutOptionsSection.hidden = false;
});

// --- Clear button ---
clearBtn?.addEventListener("click", () => {
  workoutService.saveWorkouts([]); // clear localStorage
  renderWorkouts();
});

// --- Render saved workouts ---
function renderWorkouts() {
  const workouts = workoutService.getWorkouts();
  customWorkoutList.innerHTML = "";

  if (workouts.length === 0) {
    customWorkoutList.innerHTML = `<li class="empty-state">No workouts yet</li>`;
    return;
  }

  const cwTable = document.createElement("table");
  cwTable.classList.add("custom-workout-table");

  cwTable.innerHTML = `
    <thead>
      <tr>
        <th colspan="3">${new Date().toISOString().split("T")[0]}</th>
      </tr>
      <tr>
        <th>Exercise</th>
        <th>Sets</th>
        <th>Reps</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = cwTable.querySelector("tbody");

  workouts.forEach(workout => {
    const row = document.createElement("tr");
    row.classList.add("workout-row");

    const exercise = workout.exercises[0];
    row.innerHTML = `
      <td class="workout-name">${exercise.exerciseName}</td>
      <td class="workout-sets">${exercise.sets}</td>
      <td class="workout-reps">${exercise.reps}</td>
    `;

    tbody.appendChild(row);
  });

  // Append table to the container
  customWorkoutList.appendChild(cwTable);
}

// --- Form submission ---
form?.addEventListener("submit", (e) => {
  e.preventDefault();

  const workout = {
    date: new Date().toISOString().split("T")[0],
    exercises: [
      {
        exerciseName: document.getElementById("exercise-name").value.trim(),
        sets: Number(document.getElementById("sets").value),
        reps: Number(document.getElementById("reps").value),
      }
    ]
  };

  workoutService.addWorkout(workout);

  form.reset();
  renderWorkouts();
  list.lastElementChild?.scrollIntoView({ behavior: "smooth" });
});

// Render on load
renderWorkouts();