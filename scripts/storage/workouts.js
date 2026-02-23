const workoutService = (function () {
  const STORAGE_KEY = "workouts";

  function getWorkouts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  }

  function saveWorkouts(workouts) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workouts));
  }

  function addWorkout(workout) {
    if (!workout.id) {
      workout.id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Date.now();
    }

    const workouts = getWorkouts();
    saveWorkouts([workout, ...workouts]);
  }

  function updateWorkout(updatedWorkout) {
    const workouts = getWorkouts().map(w =>
      w.id === updatedWorkout.id ? updatedWorkout : w
    );
    saveWorkouts(workouts);
  }

  function getWorkoutById(id) {
    return getWorkouts().find(w => w.id === id);
  }

  return {
    getWorkouts,
    saveWorkouts,
    addWorkout,
    updateWorkout,
    getWorkoutById,
  };
})();

export const {
  getWorkouts,
  saveWorkouts,
  addWorkout,
  updateWorkout,
  getWorkoutById,
} = workoutService;

export default workoutService;
