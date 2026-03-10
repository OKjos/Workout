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
                <h1 id="timer">Timer</h1>
                <h2>${actualWorkout.workoutName}</h2>
                <button id="closeRoutine">Close Routine</button>
                <button id="toggleTimerBtn">Start</button>
            </section>
                <section class="exercise-grid">
                    ${actualWorkout.exercises.map(ex => `
                    <section class="exercise-card">
                    <section class="exercise-left">
                        <img src="${ex.gifUrl}">
                        <p>Body Part<br><br> ${capitalize(ex.bodyParts[0])}</p>
                        <p>Target Muscles<br><br> ${capitalize(ex.targetMuscles[0])}</p>
                        <p>Secondary Muscles<br><br> ${capitalize(ex.secondaryMuscles[0])}</p>
                        <button 
                            class="remove-from-routine"
                            data-workout-id="${actualWorkout._id}"
                            data-exercise-id="${ex.exerciseId}">
                        Remove
                        </button>


                    <section class="set-section">
                        <section class="set-headers">
                            <span>SET</span>
                            <span>REPS</span>
                            <span>LBS</span>
                        </section>
                    <section class="sets-container">
                        <section class="set-inputs">
                            <span class="rep-counter">1</span>
                            <input type="number" placeholder="Reps" id="repNumber">
                            <input type="number" placeholder="Lbs" id="weightNumber">
                            <button>Remove</button>
                        </section>
                    </section>
                    <button class="add-set">Add set</button>
                    </section>
                </section>
            `).join("")}
            </section>
        </section>       weightInput  repInput
    `;

    const removeBtn = section.querySelectorAll('.remove-from-routine');
    const repInput = document.getElementById('repNumber');
    const weightInput = document.getElementById('weightNumber');
    let repCounter = 1;
    let workoutId;
    let exerciseId;
    workoutId = section.querySelector('.remove-from-routine').dataset.workoutId;
    exerciseId = section.querySelector('.remove-from-routine').dataset.exerciseId;

    removeBtn.forEach(btn => {
        btn.addEventListener("click", async () => {
            
             workoutId = btn.dataset.workoutId;
             exerciseId = btn.dataset.exerciseId;

            const userId = await getUserId();


            await fetch(`/workouts/users/${userId}/workouts/${workoutId}/exercises/${exerciseId}`, {
                method: "DELETE"
            });

            btn.closest(".exercise-card").remove();
        });
    });



    const setAddBtn = section.querySelectorAll('.add-set');


    setAddBtn.forEach(setBtn => {
        
        const card = setBtn.closest('.exercise-card');
        const container = card.querySelector('.sets-container');


        
        setBtn.addEventListener("click", () => {
            repCounter++;



            const newSet = document.createElement("section");
            newSet.classList.add("set-inputs");

            newSet.innerHTML = `
                <span>${repCounter}</span>
                    <input type="number" placeholder="Reps" id="repNumber">
                    <input type="number" placeholder="Lbs" id="weightNumber">
                    <button>Remove</button>
            `;

            container.appendChild(newSet);
        });
    })



    let seconds = 0;
    let interval = null;

    const timerDisplay = document.getElementById('timer');
    const toggleBtn = document.getElementById('toggleTimerBtn');

    function formatTime(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }

    toggleBtn.addEventListener("click", () => {
        if (interval === null) {
            interval = setInterval(() => {
                seconds++;
                timerDisplay.textContent = formatTime(seconds);
            }, 1000);

            toggleBtn.textContent = "Stop";
        } else {
            clearInterval(interval);
            interval = null;

            toggleBtn.textContent = "Start";

            const popupEnd = document.createElement('section');
            popupEnd.classList.add('save-popup');
            popupEnd.innerHTML = `
            <p>Finish workout?</p>
            <button id="confirmSave">Yes</button>
            <button id="cancelSave">No</button>
            `;

            document.body.appendChild(popupEnd);

            document.getElementById('confirmSave').addEventListener('click', async () => {
                await routineSetsInputs();
                popupEnd.remove();
            });

            document.getElementById('cancelSave').addEventListener('click', async () => {
                popupEnd.remove();
            })
        }
    })

    document.getElementById("closeRoutine").onclick = () => {
        section.classList.add('hidden');
    };





    async function routineSetsInputs() {
        try {
            const userId = await getUserId();
            const res = await apiPost(`/workouts/users/${userId}/workouts/${workoutId}/exercises/${exerciseId}/sets`, {
                weight: weightInput.value,
                reps: repInput.value,
                setNumber: repCounter,
                time: seconds
            })
        } catch (error) {
            console.error("Error in saving workout", error);
        }
    }

}




