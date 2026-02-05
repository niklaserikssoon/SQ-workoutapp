// storage/exercisesStorage.js
// To make it work for both Jest and Live Preview Browser
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    // Node / Jest
    module.exports = factory();
  } else {
    // Browser
    root.exerciseService = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
    const STORAGE_KEY = "exercises";

    async function loadExercises() {
        if (localStorage.getItem(STORAGE_KEY)) return getExercises();

        const response = await fetch('../scripts/data/exercises.json');
        if (!response.ok) throw new Error("Could not load exercises.json");

        const exercisesFromFile = await response.json();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(exercisesFromFile));

        document.dispatchEvent(new Event('exercisesUpdated'));

        return exercisesFromFile;
    }

    /** 
     * Fetches all exercises from LocalStorage
     * Returns empty array if nothing is saved
    */
    function getExercises() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    }

    /**
     * Delete an exercise from list and LocalStorage based on ID
     * Shows confirmation dialog before deleting
     * Saves the updated list in LogalStorage
     * Triggers an global event so the UI can update automatically
     *  */ 
    function deleteExercise(idToDelete) {
        const confirmDelete = confirm("Are you sure you want to delete this exercise?");
        if (!confirmDelete) return getExercises; // Return current list of cancelled

        const exerciseList = getExercises();

        const updatedExerciseList = exerciseList.filter(ex => ex.id !== idToDelete);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedExerciseList));

        document.dispatchEvent(new Event('exercisesUpdated'));

        return updatedExerciseList;
    }

    return {
        loadExercises,
        getExercises,
        deleteExercise,
    };
});