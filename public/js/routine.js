import { apiPost } from './api.js';
import { getUserId, capitalize } from './helper.js';

// Open/Close routine creation form
export function openRoutineForm() {
    document.getElementById('routineForm').style.display = 'block';
}

export function closeRoutineForm() {
    document.getElementById('routineForm').style.display = 'none';
}

// Create new workout routine
export async function createRoutine() {
    const name = document.getElementById('routineName').value;
    if (!name) return alert("Enter a routine name");

    const userId = await getUserId();
    if (!userId) return alert("Login required.");

    await apiPost('/workouts', { workoutName: name, userId });

    closeRoutineForm();
    document.getElementById('routineName').value = '';
}

// Show details of a specific workout
export async function showWorkoutDetails(workout) {
    
    
    const userId = await getUserId();
    const res = await fetch(`/workouts/users/${userId}/workouts/${workout}`);
    const workoutData = await res.json();

    const actualWorkout = workoutData.workout;

    const section = document.getElementById('routine-details');
    section.classList.remove('hidden');
    section.innerHTML = `
        <section class="routine-con">
            <section class="top-bar">
                <h2>${actualWorkout.workoutName}</h2>
                <button id="closeRoutine">Close Routine</button>
            </section>
            <section class="exercise-grid">
                ${actualWorkout.exercises.map(ex => `
                <section class="exercise-card">
                    <img src="${ex.gifUrl}">
                    <p>${capitalize(ex.bodyParts[0])}</p>
                    <p>${capitalize(ex.targetMuscles[0])}</p>
                    <p>${capitalize(ex.secondaryMuscles[0])}</p>
                    <button 
                        class="remove-from-routine"
                        data-workout-id="${actualWorkout._id}"
                        data-exercise-id="${ex.exerciseId}"
                    >
                    Remove
                    </button>
                </section>
            `).join("")}
            </section>
        </section>
    `;

    const removeBtn = section.querySelectorAll('.remove-from-routine');

    removeBtn.forEach(btn => {
        btn.addEventListener("click", async () => {
            
            const workoutId = btn.dataset.workoutId;
            const exerciseId = btn.dataset.exerciseId;

            const userId = await getUserId();


            await fetch(`/workouts/users/${userId}/workouts/${workoutId}/exercises/${exerciseId}`, {
                method: "DELETE"
            });

            btn.closest(".exercise-card").remove();
        });
    });


    document.getElementById("closeRoutine").onclick = () => {
        section.classList.add('hidden');
    };
}
