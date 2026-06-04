// UI rendering modules
//import { renderList } from './ui/generateWorkout.js'
//import { displayExercises } from './ui/exercise-bank.js'
import { initSearch } from './logic/search.js'
import './ui/aiWorkout.js'
//import { initCreateForm } from './createItem.js'

// Storage actions
//import { addTestItem } from './storage/itemsStorage.js'

/**
 * Loads the HTML component into #app-root
 * Initializes UI event listeners
 */
async function loadComponent() {
  const response = await fetch('../src/items-list.html')
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

  if (typeof renderList === 'function') {
    renderList()
  }
  if (isLoaded) {
    displayExercises(allExercises)
  }
}

// Component is loaded when page is ready
document.addEventListener('DOMContentLoaded', loadComponent)
// Expose for side-panel navigation
window.loadComponent = loadComponent

//document.addEventListener('itemsUpdated', renderList)
//document.addEventListener('exercisesUpdated', renderExercises)

window.addEventListener('storage', () => {
  if (typeof renderList === 'function') {
    renderList()
  }
  if (typeof renderExercises === 'function') {
    renderExercises()
  }
})

// display all exercies from API
let allExercises = [];
let isLoaded = false;

async function loadExercises() {
  const response = await fetch(CONFIG.exerciseListUrl);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  allExercises = await response.json();
  isLoaded = true;

  // Store references
  const searchInput = document.getElementById('exercise-search');
  const searchBtn = document.getElementById('search-button');

  // Initialize search logic
  initSearch({
    input: searchInput,
    button: searchBtn,
    data: allExercises,
    onResults: displayExercises,
  });

  // Show all exercises if hash is set
  if (location.hash === '#show-all-exercises') {
    displayExercises(allExercises);
    history.replaceState(null, '', location.pathname);
  }

  // Handle side-panel / deep links
  handleDeepLinks(searchInput, searchBtn);
}

function handleDeepLinks(searchInput, searchBtn) {
  const hash = location.hash;

  if (hash === '#show-exercises') {
    displayExercises(allExercises);
    return;
  }

  if (hash.startsWith('#search')) {
    const query = hash.includes('=')
      ? decodeURIComponent(hash.split('=')[1])
      : '';

    searchInput?.focus();

    if (query) {
      searchInput.value = query;
      searchBtn?.click();
    }
  }
}

function displayExercises(exercises = []) {
  const gallery = document.getElementById('workout-display');
  if (!gallery) return;

  gallery.innerHTML = '';
  console.log("N", exercises.length);
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

      <details>
        <summary><strong>Instructions</strong> (Visa mer)</summary>
        <p>${exercise.instructions}</p>
      </details>
    `;
    
    gallery.appendChild(article);
  });
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('#show-exercises');
  if (!btn) return;

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
  if (installBtn) installBtn.hidden = false;
});

// Handle install button click
installBtn?.addEventListener("click", async () => {
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
  if (installBtn) installBtn.hidden = true;
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

button?.addEventListener("click", async () => {
  const muscle = input?.value.trim();

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

// UI navigation
const startSection = document.getElementById("start-workout");
const optionsSection = document.getElementById("workout-options");
const generateSection = document.getElementById("generate-workout");
const createExerciseSection = document.getElementById("create-exercise-section");

document.getElementById("start-btn")?.addEventListener("click", () => {
  startSection.hidden = true;
  optionsSection.hidden = false;
});

document.getElementById("generate-option")?.addEventListener("click", () => {
  optionsSection.hidden = true;
  generateSection.hidden = false;
});

document.getElementById("custom-option")?.addEventListener("click", () => {
  optionsSection.hidden = true;
  createExerciseSection.hidden = false;
});

document.getElementById("options-back-btn")?.addEventListener("click", () => {
  optionsSection.hidden = true;
  startSection.hidden = false;
});

document.getElementById("generate-back-btn")?.addEventListener("click", () => {
  generateSection.hidden = true;
  optionsSection.hidden = false;
});

document.getElementById("custom-back-btn")?.addEventListener("click", () => {
  createExerciseSection.hidden = true;
  optionsSection.hidden = false;
});

/*------- Create Exercise -------*/
import { addExerciseToApi } from './storage/exercises.js';
import { getToken, getAuthType } from './storage/profileStorage.js';

const createExerciseForm = document.getElementById('create-exercise-form');
const exerciseFeedback = document.getElementById('exercise-feedback');

createExerciseForm?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const token = getToken();
  if (!token || getAuthType() !== 'api') {
    showExerciseFeedback('You must be logged in to create an exercise.', true);
    return;
  }

  const exerciseName = document.getElementById('exercise-name').value.trim();
  const primaryMuscle = document.getElementById('primary-muscle').value.trim();

  try {
    await addExerciseToApi(exerciseName, primaryMuscle, token);
    createExerciseForm.reset();
    showExerciseFeedback('Exercise saved!');
  } catch {
    showExerciseFeedback('Could not save exercise. Try again.', true);
  }
});

function showExerciseFeedback(message, isError = false) {
  exerciseFeedback.textContent = message;
  exerciseFeedback.hidden = false;
  exerciseFeedback.className = isError ? 'feedback-error' : 'feedback-success';
  setTimeout(() => { exerciseFeedback.hidden = true; }, 3000);
}