import { exerciseSearch, handleFoodSearch } from "./search.js";
import { loadWorkouts } from "./workouts.js";
import { macroPiChart } from "./foodDis.js";
import { openRoutineForm, closeRoutineForm, createRoutine, showWorkoutDetails, workoutHistory } from "./routine.js";
import { getUserId } from "./helper.js";

function resizeImage(file, size) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = e => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                const min = Math.min(img.width, img.height);
                const sx = (img.width - min) / 2;
                const sy = (img.height - min) / 2;
                ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    const weightBtn = document.getElementById('weight-button');
    const searchExercise = document.getElementById('weight-input');
    const routineBtn = document.getElementById('createRoutineBtn');
    const closeRoutineBtn = document.getElementById('closeRoutineBtn');
    const submitRoutineBtn = document.getElementById('submitRoutine');
    const workoutPageBtn = document.getElementById('workout-page-btn');
    const routinePageBtn = document.getElementById('routine-page-btn');
    const searchBox = document.getElementById('search-box');
    const routineLibrary = document.getElementById('routine-library');
    const foodInput = document.getElementById('food-input');
    const foodSubmit = document.getElementById('food-button');

    // ---------------------------
    // Profile dropdown
    // ---------------------------
    const profileCircle = document.querySelector('.profile-circle');
    if (profileCircle) {
        profileCircle.style.position = 'relative';
        profileCircle.style.cursor = 'pointer';

        const menu = document.createElement('div');
        menu.className = 'profile-menu';
        menu.innerHTML = `
            <button class="profile-menu-item" id="pm-upload">Upload Image</button>
            <button class="profile-menu-item" id="pm-settings">Settings</button>
            <button class="profile-menu-item profile-menu-logout" id="pm-logout">Logout</button>
        `;
        profileCircle.appendChild(menu);

        profileCircle.addEventListener('click', e => {
            e.stopPropagation();
            menu.classList.toggle('open');
        });
        document.addEventListener('click', () => menu.classList.remove('open'));

        document.getElementById('pm-logout').addEventListener('click', async e => {
            e.stopPropagation();
            await fetch('/user/logout', { method: 'POST' });
            window.location.href = '/';
        });

        document.getElementById('pm-settings').addEventListener('click', e => {
            e.stopPropagation();
            window.location.href = '/profile';
        });

        document.getElementById('pm-upload').addEventListener('click', e => {
            e.stopPropagation();
            menu.classList.remove('open');
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'image/*';
            fileInput.click();
            fileInput.addEventListener('change', async () => {
                const file = fileInput.files[0];
                if (!file) return;
                const imageData = await resizeImage(file, 120);
                const userId = await getUserId();
                const res = await fetch(`/user/upload-image/${userId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageData })
                });
                if (res.ok) {
                    profileCircle.querySelector('img').src = imageData;
                }
            });
        });

        // load saved profile image
        try {
            const cu = await fetch('/api/current-user');
            if (cu.ok) {
                const userData = await cu.json();
                if (userData.profileImage) {
                    profileCircle.querySelector('img').src = userData.profileImage;
                }
            }
        } catch (_) {}
    }

    // ---------------------------
    // Exercise Search
    // ---------------------------
    if (weightBtn) {
        weightBtn.addEventListener('click', exerciseSearch);
        searchExercise.addEventListener('keydown', e => { if(e.key==="Enter") exerciseSearch(); });
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
    if (document.getElementById('routine-results')) loadWorkouts();
    if (document.getElementById('macro-info-btn')) profileButtons();
    if (document.querySelector('.prev-month')) workoutHistory();
    if (document.getElementById('myChart')) macroPiChart();
});
