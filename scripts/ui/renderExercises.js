// ui/renderExercises.js

// Renders the list of exercises in the UI

import { getExercises, deleteExercise } from '../storage/exercisesStorage.js';

/**
 * Renders all exercises in the list 
 * Delete button for each of the exercises
 * exercisesUpdated is updated automatically when event is trigged
 */
export function renderExercises() {
    const list = document.getElementById('exerciseList');
    if (!list) return;

    // Clear current list
    list.innerHTML = "";

    // Fetch exercises
    const exerciseList = getExercises();

    // Render each exercise
    exerciseList.forEach(exercise => {
      const li = document.createElement("li");
      li.textContent = exercise.name;

      // Create delete button
      const deleteButton = document.createElement('button');
      deleteButton.textContent ="Delete";

      // Delete event
      deleteButton.addEventListener('click', () => {
        deleteExercise(exercise.id);
      });

      // Add button to list item
      li.appendChild(deleteButton);

      // Add list item to UI
      list.appendChild(li);
    });
}