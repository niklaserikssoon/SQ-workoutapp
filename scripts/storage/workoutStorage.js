// To make it work for both Jest and Live Preview Browser
(function (root, factory) {
  if (typeof module !== "undefined" && module.exports) {
    // Node / Jest
    module.exports = factory();
  } else {
    // Browser
    root.workoutService = factory();
  }
})(typeof self !== "undefined" ? self : this, function () {
    const STORAGE_KEY = "workouts";

    function getWorkouts() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    }

    function saveWorkouts(workouts) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
    }

    function addWorkout(workout) {
        const workouts = getWorkouts();
        saveWorkouts([workout, ...workouts]);
    }

    function updateWorkout(updatedWorkout) {
        const workouts = getWorkouts().map((w) =>
            w.id === updatedWorkout.id ? updatedWorkout : w
        );
        saveWorkouts(workouts);
    }

    function getWorkoutById(id) {
        return getWorkouts().find((w) => w.id === id);
    }

    return {
        getWorkouts,
        saveWorkouts,
        addWorkout,
        updateWorkout,
        getWorkoutById,
    };
});
