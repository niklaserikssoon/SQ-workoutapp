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

// Auto-refresh when items change
document.addEventListener('itemsUpdated', renderList);
document.addEventListener('exercisesUpdated', renderExercises);

// Sync across browser tabs
window.addEventListener('storage', () =>{
  renderList();
  renderExercises();
});