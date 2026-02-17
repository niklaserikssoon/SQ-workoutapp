// tests/generateWorkout.test.js
const { generateWorkout } = require("../scripts/ui/generateWorkout.js");


const fakeExercises = [
  { name: "Push-up", primaryMuscles: ["chest", "triceps"] },
  { name: "Bench Press", primaryMuscles: ["Chest"] },
  { name: "Squat", primaryMuscles: ["legs"] },
  { name: "Pull-up", primaryMuscles: ["back", "biceps"] },
  { name: "Dumbbell Fly", primaryMuscles: ["chest"] },
];

describe("generateWorkout", () => {

  beforeEach(() => {
    global.fetch = jest.fn().mockResolvedValue({
      json: jest.fn().mockResolvedValue(fakeExercises),
    });
  });

  test("filter on muscle and return max count", async () => {
    const workout = await generateWorkout("chest", 2);
    expect(workout.length).toBeLessThanOrEqual(2);
  });

  test("add sets and reps", async () => {
  const workout = await generateWorkout("chest", 1);
  const ex = workout[0];

  expect(ex.sets).toBeGreaterThanOrEqual(3);
  expect(ex.sets).toBeLessThanOrEqual(5);

  expect(ex.reps).toBeGreaterThanOrEqual(8);
  expect(ex.reps).toBeLessThanOrEqual(15);
});

  test("all exercises have the correct muscle", async () => {
    const workout = await generateWorkout("chest", 5);
    workout.forEach(ex => {
        const muscles = ex.primaryMuscles.map(m => m.toLowerCase());
        expect(muscles).toContain("chest");
    });

});

  test("returns empty array if no exercises match", async () => {
    const workout = await generateWorkout("nonexistentmuscle", 5);
    expect(workout).toEqual([]);
  });

});
