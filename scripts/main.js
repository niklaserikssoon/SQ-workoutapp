// UI rendering modules
import { renderList } from './ui/renderList.js';
import { renderExercises } from './ui/renderExercises.js'

// Storage actions
import { addTestItem } from './storage/itemsStorage.js';

/**
 * Loads the HTML component into #app-root
 * Initializes UI event listeners
 */
async function loadComponent() {
  const response = await fetch('./items-list.html');
  const html = await response.text();

  const root = document.getElementById('app-root');
  if (!root) return;

  root.innerHTML = html;

  // Button for testing
  const button = document.getElementById('add-test-item');
  if (button) {
    button.addEventListener('click', () => {
      addTestItem('Workout ' + Math.floor(Math.random() * 100));
    });
  }

  renderList();
  renderExercises();
}

// Component is loaded when page is ready 
document.addEventListener('DOMContentLoaded', loadComponent);

document.addEventListener('itemsUpdated', renderList);
document.addEventListener('exercisesUpdated', renderExercises);

window.addEventListener('storage', () => {
  renderList();
  renderExercises();
});

// display all exercies from API

async function loadExercises() {
  const response = await fetch(
    "https://raw.githubusercontent.com/yuhonas/free-exercise-db/master/dist/exercises.json"
  );
  const exercises = await response.json();

  displayExercises(exercises);
}

function displayExercises(exercises) {
  const gallery = document.getElementById("workout-display");
  gallery.innerHTML = "";

  exercises.forEach(exercise => {
    const article = document.createElement("article");
    article.classList.add("card");

    article.innerHTML = `
      <h3>${exercise.name}</h3>

      <p><strong>Category:</strong> ${exercise.category}</p>
      <p><strong>Level:</strong> ${exercise.level}</p>
      <p><strong>Equipment:</strong> ${exercise.equipment ?? "None"}</p>

      <p>
        <strong>Primary muscles:</strong>
        ${exercise.primaryMuscles.join(", ")}
      </p>

      <p>
        <strong>Secondary muscles:</strong>
        ${exercise.secondaryMuscles.join(", ")}
      </p>
    `;

    gallery.appendChild(article);
  });
}

loadExercises();