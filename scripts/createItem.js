// scripts/createItem.js
// Handles Create form submission and saves a new exercise

import { addExercise } from "./storage/exercisesStorage.js";

export function initCreateForm() {
  const form = document.getElementById("create-item-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const category = document.getElementById("category")?.value?.trim();
    const muscleGroup = document.getElementById("muscleGroup")?.value?.trim();

    // TODO: Add remaining fields (name, equipment, level) in next step

    const newExercise = {
      id: Date.now(), // simple unique id
      name: "TEMP",   // TODO next step: read from input
      category,
      muscleGroup,
      equipment: "TEMP", // TODO next step
      level: "TEMP",     // TODO next step
    };

    addExercise(newExercise);
    form.reset();
  });
}
