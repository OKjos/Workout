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
                                <input type="number" placeholder="Reps" class="rep-input">
                                <input type="number" placeholder="Lbs" class="weight-input">
                                <button>Remove</button>
                            </section>
                        </section>
                        <button class="add-set">Add set</button>
                    </section>
                    </section>
                </section>
            `).join("")}
            </section>
        </section>
    `;

    const removeBtn = section.querySelectorAll('.remove-from-routine');



    removeBtn.forEach(btn => {
        btn.addEventListener("click", async () => {
            
             let workoutId = btn.dataset.workoutId;
             let exerciseId = btn.dataset.exerciseId;

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
        let counter = 1;


        
        setBtn.addEventListener("click", () => {
            counter++;




            const newSet = document.createElement("section");
            newSet.classList.add("set-inputs");


            newSet.innerHTML = `
                <span>${counter}</span>
                    <input type="number" placeholder="Reps" class="rep-input">
                    <input type="number" placeholder="Lbs" class="weight-input">
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
            const historyExercises = [];

            const cards = section.querySelectorAll('.exercise-card');

                for (const card of cards) {
                    const workoutId = card.querySelector('.remove-from-routine').dataset.workoutId;
                    const exerciseId = card.querySelector('.remove-from-routine').dataset.exerciseId;
                    const sets = card.querySelectorAll('.set-inputs');   
                    let index = 0;

                    const cardSets = [];



                    //GETS THE WHOLE EXERCCISE ARRAY
                    const matchedExercise = actualWorkout.exercises.find(ex => ex.exerciseId === exerciseId);

                    for (const row of sets) {
                        
                        const reps = row.querySelector('.rep-input').value;
                        const weight = row.querySelector('.weight-input').value;
                        const res = await apiPost(`/workouts/users/${userId}/workouts/${workoutId}/exercises/${exerciseId}/sets`, {
                        weight: weight,
                        reps: reps,
                        setNumber: index + 1,
                        time: seconds,
                    });
                    index++
                    cardSets.push({weight, reps, setNumber: index + 1, time: seconds});
                }
                historyExercises.push({sets: cardSets, exerciseId, gifUrl: matchedExercise.gifUrl});
            }
            


            const wHistory = await fetch(`/workouts/users/${userId}/workoutHistory`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ workoutName: actualWorkout.workoutName, exercises: historyExercises })
            });


        } catch (error) {
            console.error("Error in saving workout", error);
        }
    }

}




export async function workoutHistory() {
    try {

        const prevMonthBtn = document.querySelector(".prev-month");
        const nextMonth = document.querySelector(".next-month");
        const monthYear = document.querySelector(".month-year");
        const gridCon = document.querySelector(".workout-grid-con");
        const workoutDes = document.querySelector(".workout-description");

        
        const userId = await getUserId();
        const res = await fetch(`/workouts/users/${userId}/workoutHistory`);
        const historyData = await res.json();

         if (!res.ok) {
            throw new Error("Failed to fetch history");
         }

         const { workoutHistory, foods, bodyWeight } = historyData;

         const date = new Date();
         let month =  date.getMonth();
         let year = date.getFullYear();

         const workoutDate = {};
         const foodByDate = {};
         const weightByDate = {};


         workoutHistory.forEach(workout => {
            const workoutDay = new Date(workout.createdAt);
            const key = `${workoutDay.getFullYear()}-${workoutDay.getMonth()}-${workoutDay.getDate()}`;
            workoutDate[key] = workout;
         });

         foods.forEach(food => {
            const foodDay = new Date(food.createdAt);
            const key = `${foodDay.getFullYear()}-${foodDay.getMonth()}-${foodDay.getDate()}`;
            if (!foodByDate[key]) {
                foodByDate[key] = [food];
            } else if (foodByDate[key]) {
                foodByDate[key].push(food);
            }
         });

         bodyWeight.forEach(bodyW => {
            const bodyWeightDay = new Date(bodyW.createdAt);
            const key = `${bodyWeightDay.getFullYear()}-${bodyWeightDay.getMonth()}-${bodyWeightDay.getDate()}`;
            weightByDate[key] = bodyW;
         });

         prevMonthBtn.addEventListener('click', () => {
            month--;
            if (month < 0) {
                year--;
                month = 11;
            }
            renderCalendar(month, year, workoutDate, foodByDate, weightByDate, gridCon, monthYear, workoutDes);
         });
        
         nextMonth.addEventListener('click', () => {
            month++;
            if (month > 11) {
                year++;
                month = 0;
            }
            renderCalendar(month, year, workoutDate, foodByDate, weightByDate, gridCon, monthYear, workoutDes);
         });



         renderCalendar(month, year, workoutDate, foodByDate, weightByDate, gridCon, monthYear, workoutDes);



    } catch (error) {

        console.log(error);
    }
}


function renderCalendar(month, year, workoutDate, foodByDate, weightByDate, gridCon, monthYear, workoutDes) {
    //Tell which day to get
    const date = new Date(year, month, 1);
    monthYear.textContent = date.toLocaleString("default", { month: "long", year: "numeric" });

    //get the first day of the month
    const firstDay = new Date(year, month, 1).getDay();
    //get the last day of the month
    const lastOfMonth = new Date(year, month + 1, 0).getDate();

    gridCon.innerHTML = "";
    let html = `
        <span class='day-label'>Sun</span>
        <span class='day-label'>Mon</span>
        <span class='day-label'>Tue</span>
        <span class='day-label'>Wed</span>
        <span class='day-label'>Thu</span>
        <span class='day-label'>Fri</span>
        <span class='day-label'>Sat</span>
        `

        //Loop through blank cells before the 1st of the month
        for (let i = 0; i < firstDay; i++) {
            html += `<button class="empty"></button>`
        };

        //Loop through each day of the month and create a button for each one
        //data-date stores the full date string so it knows which day is clicked
        //i = current day displayed in the cell
        for (let i = 1; i <= lastOfMonth; i++) {
            //key acts like an ID to look through and then the if statment uses key to browse through and see if 
            //any of the entrys happened on that day
            const key = `${year}-${month}-${i}`;
            //checks if there was a user entry on the day and if theres an entry put a dot and change the box color
            //else keep it a regular button
            if (workoutDate[key] || weightByDate[key] || foodByDate[key]) {
                html += `<button class="day-cell has-entry" data-date="${year}-${month}-${i}">${i}<span class="dot"></span></button>`
            } else {
                html += `<button class="day-cell" data-date="${year}-${month}-${i}">${i}</button>`
            }
        };

        gridCon.innerHTML = html;

        document.querySelectorAll('.day-cell').forEach(cell => {
            cell.addEventListener('click', async () => {
                let info = cell.dataset.date;


        workoutDes.innerHTML = "";
        let descHtml = '';

        if (workoutDate[info]) {
            descHtml += `
                <section class="des-grid">
                    <section class="des-workout-info">
                        <h1>Workout:</h1>
                        <h2>${workoutDate[info].workoutName}</h2>

                    </section>
                </section>
            `
        };
        
        //^^^^
        /*
                        <section class="des-workout-grid">
                            ${workoutDate[info].exercises.map(ex => `<img src="${ex.gifUrl}">`).join("")}
                            ${workoutDate[info].exercises.map(ex => ex.sets.map(set => `<p>${set.reps}</p>`).join("")).join("")}                        
                        </section>
        */

        if (foodByDate[info]) {
            descHtml += `
                <section class="des-grid">
                    <h1>Food Intake:</h1>
                    ${foodByDate[info].map(ex => `<h3>${ex.foodName}</h3>`).join("")}
                </section>
            `
        };

        if (weightByDate[info]) {
            descHtml += `
                <section class="des-grid">
                    <h1>Daily Weight:</h1>
                    <h3>Weight: ${weightByDate[info].dailyWeight}lbs</h3>
                </section>            
            `
        };

        workoutDes.innerHTML += descHtml;
        })  
        });



}

//Workout description innerHTML
//renderCalendar to check for an entry on that day
//Current month/year not showing between prev and next month button
//Prev and next month button needs styling