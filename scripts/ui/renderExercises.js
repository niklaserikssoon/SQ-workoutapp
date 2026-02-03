// ui/renderExercises.js
import { getExercises, deleteExercise } from '../storage/exercisesStorage.js';

/**
 * Renders all exercises in the list 
 * Delete button for each of the exercises
 * exercisesUpdated is updated automatically when event is trigged
 */
export function renderExercises() {
    const list = document.getElementById('exerciseList');
    if (!list) return;

    list.innerHTML = "";

    const exerciseList = getExercises();

    exerciseList.forEach(exercise => {
      const li = document.createElement("li");
      li.textContent = exercise.name;

      const deleteButton = document.createElement('button');
      deleteButton.textContent ="Delete";

      deleteButton.addEventListener('click', () => {
        deleteExercise(exercise.id);
      });

      li.appendChild(deleteButton);
      list.appendChild(li);
    });
}