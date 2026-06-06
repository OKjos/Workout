import { apiGet, apiPost } from './api.js';
import { capitalize, getUserId } from './helper.js';
import { addExerciseToWorkout } from './workouts.js';
import { addFoodToDay } from './foodDis.js';



let _allResults = [];
let _shownCount = 0;
const PAGE_SIZE = 10;

export async function exerciseSearch() {
    const input = document.getElementById('weight-input').value.trim();
    const type = document.getElementById('search-type').value;
    if (!input) return;

    const section = document.getElementById("results");
    section.innerHTML = '<p style="text-align:center;padding:20px;">Searching…</p>';

    const url = `/api/exercises?type=${type}&input=${encodeURIComponent(input)}`;
    try {
        const data = await apiGet(url);
        _allResults = data.data || [];
        _shownCount = 0;
        section.innerHTML = '';
        if (_allResults.length === 0) {
            section.innerHTML = '<p style="text-align:center;padding:20px;">No results found.</p>';
            return;
        }
        renderNextPage();
    } catch (err) {
        console.error("Exercise search failed:", err);
        section.innerHTML = '<p style="text-align:center;padding:20px;">Search failed. Try again.</p>';
    }
}

function renderNextPage() {
    const section = document.getElementById("results");
    const existing = document.getElementById('load-more-btn');
    if (existing) existing.remove();

    const slice = _allResults.slice(_shownCount, _shownCount + PAGE_SIZE);
    _shownCount += slice.length;

    slice.forEach(item => appendCard(item, section));

    if (_shownCount < _allResults.length) {
        const btn = document.createElement('button');
        btn.id = 'load-more-btn';
        btn.className = 'load-more-btn';
        btn.textContent = `Load More (${_allResults.length - _shownCount} remaining)`;
        btn.addEventListener('click', renderNextPage);
        section.appendChild(btn);
    }
}

function appendCard(item, section) {
    const container = document.createElement("section");
    container.classList.add("results");
    container.innerHTML = `
        <img class="gif-results" src="${item.gifUrl}">
        <h1>${capitalize(item.bodyParts?.[0] ?? '')}</h1>
        <h2>Primary: ${capitalize(item.targetMuscles?.[0] ?? '')}</h2>
        <h2>Secondary: ${(item.secondaryMuscles ?? []).map(capitalize).join(", ")}</h2>
        <button class="add-to-routine"
            data-exercise-id="${item.exerciseId}"
            data-body-parts='${JSON.stringify(item.bodyParts ?? [])}'
            data-target-muscles='${JSON.stringify(item.targetMuscles ?? [])}'
            data-secondary-muscles='${JSON.stringify(item.secondaryMuscles ?? [])}'
            data-gif-url="${item.gifUrl ?? ''}">
            Add
        </button>
        <select class="workout-dropdown" style="display:none"></select>
    `;

    const addBtn = container.querySelector(".add-to-routine");
    const dropdown = container.querySelector(".workout-dropdown");

    addBtn?.addEventListener("click", async () => {
        const userId = await getUserId();
        const res = await fetch(`/workouts/users/${userId}/workouts`);
        const data = await res.json();
        dropdown.innerHTML = `<option value="">Select a workout</option>`;
        data.workouts.forEach(w => {
            const opt = document.createElement("option");
            opt.value = w._id;
            opt.textContent = w.workoutName;
            dropdown.appendChild(opt);
        });
        dropdown.style.display = "block";
    });

    dropdown?.addEventListener("change", async () => {
        const workoutName = dropdown.options[dropdown.selectedIndex].text;
        try { await addExerciseToWorkout(addBtn, dropdown.value); } catch (err) { console.error(err); }
        dropdown.style.display = "none";
        showAddedToRoutine(`Exercise added to ${workoutName}`);
    });

    section.appendChild(container);
}

function showAddedToRoutine(message) {
    const popupAdd = document.getElementById('popup-routineAdd');
    if (!popupAdd) return;
    popupAdd.textContent = message;
    requestAnimationFrame(() => requestAnimationFrame(() => {
        popupAdd.style.transition = 'opacity 0.3s ease';
        popupAdd.style.opacity = '1';
        setTimeout(() => { popupAdd.style.opacity = '0'; }, 2000);
    }));
}


export async function handleFoodSearch() {
    const query = document.getElementById('food-input').value.trim();

    const res = await fetch(`/api/food?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    searchFood(data.products);
}

function showAdded(message) {
    const popupAdd = document.getElementById('popup-Add');
    popupAdd.textContent = message;
    popupAdd.style.opacity = '1';
    setTimeout(() => {
        popupAdd.style.opacity = '0';
    }, 2000);
}


export async function searchFood(foodResults) {
    const section = document.getElementById('food-results');
    section.innerHTML = '';

    foodResults.forEach(p => {
        const item = {
            foodName: p.product_name,
            code: p.code,
            image: p.image_url,
            servingSize: p.serving_size,
            macros: {
                calories: p["energy-kcal_100g"],
                protein: p.proteins_100g,
                carbs: p.carbohydrates_100g,
                fats: p.fat_100g
            }
        };

        const fmt = (val, mult) => val != null ? (val * mult).toFixed(1) + 'g' : 'N/A';

        const foodCon = document.createElement("section");
        foodCon.classList.add("food-results");

        foodCon.innerHTML = `
            <section class="food-display-container">
                <h1>${item.foodName}</h1>
                <img class="food-item-img" src="${item.image}" />
                <h2>Serving size: ${item.servingSize ?? 'N/A'}</h2>
                <label class="servings-label">Servings: <input type="number" class="servings-input" value="1" min="0.5" step="0.5"></label>
                <h2 class="macros-label">Macros (×1 serving)</h2>
                <h2 class="cal-display">Calories: ${fmt(item.macros.calories, 1)}</h2>
                <h2 class="protein-display">Protein: ${fmt(item.macros.protein, 1)}</h2>
                <h2 class="carbs-display">Carbs: ${fmt(item.macros.carbs, 1)}</h2>
                <h2 class="fats-display">Fats: ${fmt(item.macros.fats, 1)}</h2>
                <button class="add-to-food">Add</button>
            </section>
        `;

        const servingsInput = foodCon.querySelector('.servings-input');
        const calDisplay = foodCon.querySelector('.cal-display');
        const proteinDisplay = foodCon.querySelector('.protein-display');
        const carbsDisplay = foodCon.querySelector('.carbs-display');
        const fatsDisplay = foodCon.querySelector('.fats-display');
        const macrosLabel = foodCon.querySelector('.macros-label');

        servingsInput.addEventListener('input', () => {
            const mult = parseFloat(servingsInput.value) || 1;
            macrosLabel.textContent = `Macros (×${mult} serving${mult !== 1 ? 's' : ''})`;
            calDisplay.textContent = `Calories: ${fmt(item.macros.calories, mult)}`;
            proteinDisplay.textContent = `Protein: ${fmt(item.macros.protein, mult)}`;
            carbsDisplay.textContent = `Carbs: ${fmt(item.macros.carbs, mult)}`;
            fatsDisplay.textContent = `Fats: ${fmt(item.macros.fats, mult)}`;
        });

        const foodAdd = foodCon.querySelector(".add-to-food");

        foodAdd.addEventListener("click", async () => {
            const mult = parseFloat(servingsInput.value) || 1;
            const calcMacro = (val) => val != null ? parseFloat((val * mult).toFixed(1)) : null;

            const foodItem = {
                foodName: item.foodName,
                code: item.code,
                image: item.image,
                servingSize: item.servingSize,
                calories: calcMacro(item.macros.calories),
                protein: calcMacro(item.macros.protein),
                carbs: calcMacro(item.macros.carbs),
                fats: calcMacro(item.macros.fats)
            };

            showAdded(`Added: ${foodItem.foodName}`);

            try {
                const result = await addFoodToDay(foodItem);
                console.log('Saved food: ', result);
            } catch (error) {
                console.log("Failed to save", error);
            }
        });

        section.appendChild(foodCon);
    });
}

