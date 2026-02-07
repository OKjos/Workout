import { exerciseSearch, handleFoodSearch } from "./search.js";
import { loadWorkouts } from "./workouts.js";
import { macroPiChart } from "./foodDis.js";
import { openRoutineForm, closeRoutineForm, createRoutine, showWorkoutDetails } from "./routine.js";

document.addEventListener("DOMContentLoaded", () => {
    const weightBtn = document.getElementById('weight-button');
    const searchExercise = document.getElementById('weight-input');
    const searchType = document.getElementById('search-type');
    const extraInputs = document.getElementById('extra-inputs');
    const routineBtn = document.getElementById('createRoutineBtn');
    const routineFrm = document.getElementById('routineForm');
    const closeRoutineBtn = document.getElementById('closeRoutineBtn');
    const submitRoutineBtn = document.getElementById('submitRoutine');
    const workoutPageBtn = document.getElementById('workout-page-btn');
    const routinePageBtn = document.getElementById('routine-page-btn');
    const searchBox = document.getElementById('search-box');
    const routineLibrary = document.getElementById('routine-library');
    const foodInput = document.getElementById('food-input');
    const foodSubmit = document.getElementById('food-button');
    macroPiChart();

    // ---------------------------
    // Exercise Search
    // ---------------------------
    if (weightBtn) {
        weightBtn.addEventListener('click', exerciseSearch);
        searchExercise.addEventListener('keydown', e => { if(e.key==="Enter") exerciseSearch(); });
        searchType.addEventListener("change", () => {
            extraInputs.style.display = searchType.value === "sport" ? "block" : "none";
        });
    }

    // ---------------------------
    // Routine Form
    // ---------------------------
    if (routineBtn) {
        routineBtn.addEventListener('click', openRoutineForm);
        submitRoutineBtn.addEventListener('click', createRoutine);
    }

    if (closeRoutineBtn) {
        closeRoutineBtn.addEventListener('click', closeRoutineForm);
    }


    // ---------------------------
    // Workout / Routine Page Tabs
    // ---------------------------
    function switchTabs(showSection, hideSection, activateButton, inactivateButton) {
        showSection.classList.remove('hidden');
        hideSection.classList.add('hidden');
        activateButton.classList.add('active-tab');
        inactivateButton.classList.remove('active-tab');
    }

    if (workoutPageBtn) {
        workoutPageBtn.addEventListener('click', () => {
            switchTabs(searchBox, routineLibrary, workoutPageBtn, routinePageBtn);
        });
    }

    if (routinePageBtn) {
        routinePageBtn.addEventListener('click', () => {
            switchTabs(routineLibrary, searchBox, routinePageBtn, workoutPageBtn);
            document.getElementById('results').innerHTML = '';
        });
    }


    // ---------------------------
    // Food Page Search
    // ---------------------------
    if (foodSubmit) {
        foodSubmit.addEventListener('click', handleFoodSearch);
        foodInput.addEventListener('keydown', e => { 
            if(e.key === "Enter") {
                e.preventDefault();
                handleFoodSearch(); 
            }
        });
    }
    



    function profileButtons() {
    const macroBtn = document.getElementById('macro-info-btn');
    const bodyBtn = document.getElementById('body-info-btn');
    const historyBtn = document.getElementById('history-info-btn');

    const macroChart = document.getElementById('macro-chart');
    const bodyInfo = document.getElementById('body-info');
    const historyInfo = document.getElementById('history-info');

    bodyBtn.addEventListener('click', () => {
        macroChart.classList.add('hidden');
        bodyInfo.classList.remove('hidden');
        historyInfo.classList.add('hidden');
    })

    historyBtn.addEventListener('click', () => {
        macroChart.classList.add('hidden');
        bodyInfo.classList.add('hidden');
        historyInfo.classList.remove('hidden');
    })

    macroBtn.addEventListener('click', () => {
        macroChart.classList.remove('hidden');
        bodyInfo.classList.add('hidden');
        historyInfo.classList.add('hidden');
    })
}


    // ---------------------------
    // Load Workouts Initially
    // ---------------------------
    loadWorkouts();
    profileButtons();
});
