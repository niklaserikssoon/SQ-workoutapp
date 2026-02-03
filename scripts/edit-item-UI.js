const { getWorkouts, addWorkout, updateWorkout, getWorkoutById} = window.workoutService;

const form = document.getElementById("workout-form");
const list = document.getElementById("workout-list");
const status = document.getElementById("status");

const nameInput = document.getElementById("name");
const durationInput = document.getElementById("duration");
const notesInput = document.getElementById("notes");
const idInput = document.getElementById("workout-id");
const submitBtn = form.querySelector("button");

function renderWorkouts() {
    list.innerHTML = "";

    const workouts = getWorkouts();

    if (workouts.length === 0) {
        list.innerHTML = `<li role="status">Inga träningspass ännu</li>`;
        return;
    }

    workouts.forEach((workout) => {
        const li = document.createElement("li");
        li.tabIndex = 0;

        li.innerHTML = `
<span>
    <strong>${workout.name}</strong> – ${workout.duration} min
</span>
<button
    class="edit-btn"
    data-id="${workout.id}"
    aria-label="Redigera ${workout.name}">
    Redigera
</button>
`;

        list.appendChild(li);
    });
}

form.addEventListener("submit", (e) => {
    e.preventDefault();

    const workout = {
        id: idInput.value || crypto.randomUUID(),
        name: nameInput.value.trim(),
        duration: Number(durationInput.value),
        notes: notesInput.value.trim(),
    };

    if (idInput.value) {
        updateWorkout(workout);
        announce("Träningspass uppdaterat");
    } else {
        addWorkout(workout);
        announce("Träningspass sparat");
    }

    resetForm();
    renderWorkouts();
});

document.addEventListener("click", (e) => {
    if (!e.target.classList.contains("edit-btn")) return;

    const workout = getWorkoutById(e.target.dataset.id);
    if (!workout) return;

    fillForm(workout);
});

function fillForm(workout) {
    nameInput.value = workout.name;
    durationInput.value = workout.duration;
    notesInput.value = workout.notes;
    idInput.value = workout.id;

    submitBtn.textContent = "Spara ändringar";
    nameInput.focus();
}

function resetForm() {
    form.reset();
    idInput.value = "";
    submitBtn.textContent = "Spara träningspass";
}

function announce(message) {
    status.textContent = message;
}

// Initial render
renderWorkouts();
