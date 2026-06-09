// UI rendering modules
//import { renderList } from './ui/generateWorkout.js'
//import { displayExercises } from './ui/exercise-bank.js'
//import { initCreateForm } from './createItem.js'
import { initSearch } from './logic/search.js'
import './ui/aiWorkout.js'
import { initCreateWorkout } from './ui/createWorkout.js'

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

  initCreateWorkout(allExercises)
  
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

  exercises.forEach((exercise) => {
    const article = document.createElement('article');
    article.classList.add('card');
    article.innerHTML = `
      <button class="add-to-workout-btn" type="button" aria-label="Add exercise to workout">
        +
      </button>

      <h3>${exercise.name}</h3>
      <p><strong>Category:</strong> ${exercise.category}</p>
      <p><strong>Level:</strong> ${exercise.level}</p>
      <p><strong>Equipment:</strong> ${exercise.equipment ?? 'None'}</p>
      <p><strong>Primary muscles:</strong> ${exercise.primaryMuscles.join(', ')}</p>
      <p><strong>Secondary muscles:</strong> ${exercise.secondaryMuscles.join(', ') || '—'}</p>
      <button class="btn-secondary show-more-btn" style="margin-top:auto;">Instructions</button>
    `;

    // Store data on the element to avoid re-fetching
    article.dataset.catalogExerciseId = exercise.id ?? exercise.Id;

    console.log("Exercise object:", exercise);
    console.log("Catalog exercise id:", article.dataset.catalogExerciseId);
    article.dataset.name         = exercise.name;
    article.dataset.category     = exercise.category;
    article.dataset.level        = exercise.level;
    article.dataset.equipment    = exercise.equipment ?? 'None';
    article.dataset.primary      = exercise.primaryMuscles.join(', ');
    article.dataset.secondary    = exercise.secondaryMuscles.join(', ') || '—';
    article.dataset.instructions = exercise.instructions ?? '';

    gallery.appendChild(article);
  });
}

/* ── Add catalog exercise to existing workout ───────────────────────────── */

async function fetchUserWorkouts(token) {
  const response = await fetch(`${CONFIG.workoutApiUrl}api/v1/workouts`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error("Could not fetch workouts.");
  }

  return await response.json();
}

async function addCatalogExerciseToWorkout(workoutId, catalogExerciseId, token) {
  const encodedCatalogExerciseId = encodeURIComponent(catalogExerciseId);

  const response = await fetch(
    `${CONFIG.workoutApiUrl}api/v1/workouts/${workoutId}/catalog-exercises/${encodedCatalogExerciseId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Add catalog exercise failed:", {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
      workoutId,
      catalogExerciseId
    });

    throw new Error("Could not add exercise to workout.");
  }
}

async function handleAddToWorkoutClick(catalogExerciseId) {
  const token = getToken();

  if (!token) {
    showAddExerciseMessage("You must be logged in to add exercises.", true);
    return;
  }

  try {
    const workouts = await fetchUserWorkouts(token);

    if (!workouts || workouts.length === 0) {
      showAddExerciseMessage("You have no saved workouts yet.", true);
      return;
    }

    showWorkoutPicker(workouts, catalogExerciseId, token);
  } catch (error) {
    console.error(error);
    showAddExerciseMessage("Could not load your workouts.", true);
  }
}

function showWorkoutPicker(workouts, catalogExerciseId, token) {
  let modal = document.getElementById("add-to-workout-modal");

  if (!modal) {
    modal = document.createElement("dialog");
    modal.id = "add-to-workout-modal";
    modal.className = "workout-picker-modal";
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="workout-picker-content">
      <button class="modal-close-btn" type="button" aria-label="Close">×</button>
      <h2>Choose workout</h2>
      <div class="workout-picker-list"></div>
    </div>
  `;

  const list = modal.querySelector(".workout-picker-list");

  workouts.forEach((workout) => {
    const workoutId = workout.workoutId ?? workout.WorkoutId;
    const workoutName = workout.name ?? workout.Name ?? `Workout ${workoutId}`;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "workout-picker-item";
    button.textContent = workoutName;

    button.addEventListener("click", async () => {
      try {
        await addCatalogExerciseToWorkout(workoutId, catalogExerciseId, token);
        modal.close();
        showAddExerciseMessage("Exercise added to workout!", false);
      } catch (error) {
        console.error(error);
        modal.close();
        showAddExerciseMessage("Could not add exercise to workout.", true);
      }
    });

    list.appendChild(button);
  });

  modal.querySelector(".modal-close-btn")?.addEventListener("click", () => {
    modal.close();
  });

  modal.showModal();
}

function showAddExerciseMessage(message, isError = false) {
  let messageBox = document.getElementById("add-exercise-message");

  if (!messageBox) {
    messageBox = document.createElement("div");
    messageBox.id = "add-exercise-message";
    document.body.appendChild(messageBox);
  }

  messageBox.textContent = message;
  messageBox.className = isError
    ? "add-exercise-message error"
    : "add-exercise-message success";

  messageBox.hidden = false;

  setTimeout(() => {
    messageBox.hidden = true;
  }, 3000);
}

/* ── Exercise modal ───────────────────────────── */
const exerciseModal    = document.getElementById('exercise-modal');
const modalTitle       = document.getElementById('modal-title');
const modalOverview    = document.getElementById('modal-overview');
const modalInstructions = document.getElementById('modal-instructions');
const modalClose       = document.getElementById('modal-close');

document.getElementById('workout-display')?.addEventListener('click', async (e) => {
  const addBtn = e.target.closest('.add-to-workout-btn');

  if (addBtn) {
    const card = addBtn.closest('article');
    const catalogExerciseId = card?.dataset.catalogExerciseId;

    if (!catalogExerciseId) {
      showAddExerciseMessage("Could not find exercise id.", true);
      return;
    }

    await handleAddToWorkoutClick(catalogExerciseId);
    return;
  }

  const btn = e.target.closest('.show-more-btn');
  if (!btn) return;

  const card = btn.closest('article');
  const d    = card.dataset;

  modalTitle.textContent = d.name;
  modalOverview.innerHTML = `
    <strong>Category:</strong> ${d.category} &nbsp;·&nbsp;
    <strong>Level:</strong> ${d.level} &nbsp;·&nbsp;
    <strong>Equipment:</strong> ${d.equipment}<br>
    <strong>Primary muscles:</strong> ${d.primary}<br>
    <strong>Secondary muscles:</strong> ${d.secondary}
  `;

  // Split instructions into numbered steps if comma/period separated
  modalInstructions.innerHTML = '';
  const steps = d.instructions
    .split(/(?<=\.)\s*,\s*|(?<=\.)\s+(?=[A-Z])/)
    .filter(s => s.trim());

  if (steps.length > 1) {
    steps.forEach(step => {
      const li = document.createElement('li');
      li.textContent = step.trim();
      modalInstructions.appendChild(li);
    });
  } else {
    const li = document.createElement('li');
    li.textContent = d.instructions;
    modalInstructions.appendChild(li);
  }

  exerciseModal?.showModal();
});

modalClose?.addEventListener('click', () => exerciseModal?.close());

exerciseModal?.addEventListener('click', (e) => {
  if (e.target === exerciseModal) exerciseModal.close(); // click backdrop to close
});

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
    <td>${ex.name}</td>
    <td>${ex.sets}</td>
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
  setHeroHeader(false)
});

document.getElementById("generate-option")?.addEventListener("click", () => {
  optionsSection.hidden = true;
  generateSection.hidden = false;
  setHeroHeader(false)
});

document.getElementById("custom-option")?.addEventListener("click", () => {
  optionsSection.hidden = true;
  createExerciseSection.hidden = false;
  setHeroHeader(false)
});

document.getElementById("options-back-btn")?.addEventListener("click", () => {
  optionsSection.hidden = true;
  startSection.hidden = false;
  setHeroHeader(false)
});

document.getElementById("generate-back-btn")?.addEventListener("click", () => {
  generateSection.hidden = true;
  optionsSection.hidden = false;
  setHeroHeader(true)
});

document.getElementById("custom-back-btn")?.addEventListener("click", () => {
  createExerciseSection.hidden = true;
  optionsSection.hidden = false;
  setHeroHeader(true)
});

document.querySelectorAll('.select-wrapper select').forEach(select => {
  const chevron = select.closest('.select-wrapper').querySelector('.select-chevron')
  let isOpen = false

  select.addEventListener('mousedown', () => {
    isOpen = !isOpen
    chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
  })

  select.addEventListener('blur', () => {
    isOpen = false
    chevron.style.transform = 'rotate(0deg)'
  })

  select.addEventListener('change', () => {
    isOpen = false
    chevron.style.transform = 'rotate(0deg)'
  })
})

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

function setHeroHeader(visible) {
  const el = document.querySelector('.hero-header')
  if (el) el.hidden = !visible
}