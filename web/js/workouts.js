// Handles user workouts/routines

import { apiPost } from './api.js';
import { getUserId } from './helper.js';
import { showWorkoutDetails } from './routine.js';

// Load all user workouts
export async function loadWorkouts() {
    const userId = await getUserId();
    if (!userId) return;

    const res = await fetch(`/workouts/users/${userId}/workouts`);
    const data = await res.json();

    const section = document.getElementById("routine-results");
    section.innerHTML = "";

    data.workouts.forEach(w => {
        const btn = document.createElement("button");
        btn.textContent = w.workoutName;
        btn.className = "workout-btn";
        btn.onclick = () => showWorkoutDetails(w._id);
        section.appendChild(btn);
    });
}

// Add an exercise to a routine
export async function addExerciseToWorkout(btn, workoutId) {
    if (!workoutId) return;

    const userId = await getUserId();
    if (!userId) {
        alert("Please log in");
        return;
    }

    const res = await apiPost(`/workouts/users/${userId}/workouts/${workoutId}/add-exercise`, {
        userId: userId,
        exerciseId: btn.dataset.exerciseId,
        bodyParts: JSON.parse(btn.dataset.bodyParts),
        gifUrl: btn.dataset.gifUrl,
        targetMuscles: JSON.parse(btn.dataset.targetMuscles),
        secondaryMuscles: JSON.parse(btn.dataset.secondaryMuscles)
    });

    if (res.success) alert("Exercise added!");
    else alert("Error adding exercise.");
}
