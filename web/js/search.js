import { apiGet, apiPost } from './api.js';
import { capitalize, getUserId } from './helper.js';
import { addExerciseToWorkout } from './workouts.js';
import { addFoodToDay } from './foodDis.js';



    document.querySelectorAll('#search-type-dropdown li a').forEach(item => {
        item.addEventListener('click', () => {
            document.getElementById('search-type').value = item.dataset.value;
            document.querySelector('#search-type-dropdown summary').textContent = item.textContent;
            document.getElementById('search-type-dropdown').removeAttribute('open');
        })
    });
// Main search function
export async function exerciseSearch() {
    const input = document.getElementById('weight-input').value.trim();
    const type = document.getElementById('search-type').value;
    
    let url = "";


    if (type === "bodypart" || type === "musclename" || type === "equipment") {
        url = `/api/exercises?type=${type}&input=${input}`;
    } else if (type === "sport") {
        const weight = document.getElementById('weight-value').value;
        const duration = document.getElementById('time-value').value;
        if (!weight || !duration) return alert("Enter weight and duration.");

        url = `/api/sport?input=${input}&weight=${weight}&duration=${duration}`;
    }



    const data = await apiGet(url);
    console.log("FRONTEND DATA:", data);
    displayResults(data.data, type);
}

// Display search results
export function displayResults(results, searchBy) {
    const section = document.getElementById("results");
    section.innerHTML = "";

    results.forEach(item => {
        const container = document.createElement("section");
        container.classList.add("results");

        if (searchBy === "sport") {
            container.innerHTML = `
                <h1>${item.name}</h1>
                <p>Calories/hour: ${item.calories_per_hour}</p>
                <p>Minutes: ${item.duration_minutes}</p>
            `;
        } else {
            container.innerHTML = `
                <img class="gif-results" src="${item.gifUrl}">
                <h1>${capitalize(item.bodyParts[0])}</h1>
                <h2>Primary: ${capitalize(item.targetMuscles[0])}</h2>
                <h2>Secondary: ${item.secondaryMuscles.map(capitalize).join(", ")}</h2>

                <button class="add-to-routine"
                    data-exercise-id="${item.exerciseId}"
                    data-body-parts='${JSON.stringify(item.bodyParts)}'
                    data-target-muscles='${JSON.stringify(item.targetMuscles)}'
                    data-secondary-muscles='${JSON.stringify(item.secondaryMuscles)}'
                    data-gif-url="${item.gifUrl}">
                    Add
                </button>

                <select class="workout-dropdown" style="display:none"></select>
            `;
        }

        const addBtn = container.querySelector(".add-to-routine");
        const dropdown = container.querySelector(".workout-dropdown");

        // Handle add to routine dropdown
        addBtn?.addEventListener("click", async () => {
            const userId = await getUserId();
            const res = await fetch(`/workouts/users/${userId}/workouts`);
            const data = await res.json();

            dropdown.innerHTML = `<option value="">Select a workout</option>`;
            data.workouts.forEach(w => {
                let opt = document.createElement("option");
                opt.value = w._id;
                opt.textContent = w.workoutName;
                dropdown.appendChild(opt);
            });

            dropdown.style.display = "block";
        });

        // Add exercise to selected workout
        dropdown?.addEventListener("change", () => {
            addExerciseToWorkout(addBtn, dropdown.value);
            dropdown.style.display = "none";
        });

        section.appendChild(container);
    });
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
            foodName : p.product_name,
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



        const foodCon = document.createElement("section");
        foodCon.classList.add("food-results");

        foodCon.innerHTML = 
        `
            <section class="food-display-container">
                <h1>${item.foodName}</h1>
                <img class="food-item-img" src="${item.image}" />
                <h1>Item serving size: ${item.servingSize ?? 'N/A'}</h1>
                <h1>Macros per serving</h1>
                <h2>Calories: ${item.macros.calories ?? 'N/A'}g</h2>
                <h2>Protein: ${item.macros.protein ?? 'N/A'}g</h2>
                <h2>Carbs: ${item.macros.carbs ?? 'N/A'}g</h2>
                <h2>Fats: ${item.macros.fats ?? 'N/A'}g</h2>
                <button class="add-to-food"
                        data-code-id="${item.code}"
                        data-img-url="${item.image}"
                        data-servingsize="${item.servingSize}"
                        data-cal="${item.macros.calories}"
                        data-protein="${item.macros.protein}"
                        data-carbs="${item.macros.carbs}"
                        data-food-name="${item.foodName}"
                        data-fats="${item.macros.fats}"
                >Add</button>
            </section>
        `

        const foodAdd = foodCon.querySelector(".add-to-food");

        foodAdd.addEventListener("click", async () => {
            const userId = await getUserId();
            const code = foodAdd.dataset.codeId;
            const foodItem = {
                foodName : foodAdd.dataset.foodName ,
                code: foodAdd.dataset.codeId,
                image: foodAdd.dataset.imgUrl,
                servingSize: foodAdd.dataset.servingsize,
                calories: foodAdd.dataset.cal,
                protein: foodAdd.dataset.protein,
                carbs: foodAdd.dataset.carbs,
                fats: foodAdd.dataset.fats
            };

            showAdded(`Added: ${foodItem.foodName}`);


            try {
                const result = await addFoodToDay(foodItem);
                console.log('Saved food: ', result);
            } catch (error) {
                console.log("Failed to save", error);
            }
        })
        section.appendChild(foodCon);
    })
}

