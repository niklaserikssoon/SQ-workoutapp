// storage/exercisesStorage.js

/** 
 * Fetches all exercises from LocalStorage
 * Returns empty array if nothing is saved
*/
export function getExercises() {
    return JSON.parse(localStorage.getItem('exercises')) || [];
}

/**
 * Delete an exercise from list and LocalStorage based on ID
 * Shows confirmation dialog before deleting
 * Saves the updated list in LogalStorage
 * Triggers an global event so the UI can update automatically
 *  */ 
export function deleteExercise(idToDelete) {
    const confirmDelete = confirm("Are you sure you want to delete this exercise?");
    if (!confirmDelete) return getExercises; // Return current list of cancelled

    const exerciseList = getExercises();

    const updatedExerciseList = exerciseList.filter(ex => ex.id !== idToDelete);

    localStorage.setItem('exercises', JSON.stringify(updatedExerciseList));

    document.dispatchEvent(new Event('exercisesUpdated'));

    return updatedExerciseList;
}