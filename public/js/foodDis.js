//Page updates results from search like when you search for the foods
import { apiPost } from './api.js';
import { getUserId } from './helper.js';



export async function addFoodToDay(food) {
    try {
        const userId = await getUserId();

        const data = await apiPost(`/food/user/${userId}/add-to-food`, {
            userId: userId,
            foodName: food.foodName,
            code: food.code,
            image: food.image,
            servingSize: food.servingSize,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fats: food.fats
        });

        console.log("Food added successfully: ", data);
        return data;
    } catch (error) {
        console.error("Error adding", error);
        throw error;
    }
}




export async function macroPiChart(food) {
    try {
        const userId = await getUserId();
        const data = await apiGet(`/user/${userId}/foods`)


        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFats = 0;

        const xValues = ["Protein", "Carbs", "Fats"];  // These are LABELS
        const yValues = [totalProtein, totalCarbs, totalFats];  // These are VALUES
        const barColors = [
            "#b91d47",  // Protein
            "#00aba9",  // Carbs  
            "#2b5797"   // Fats
        ];

    const ctx = document.getElementById('myChart');

    new Chart(ctx, {
    type: "pie",
    data: {
        labels: xValues,
        datasets: [{
        backgroundColor: barColors,
        data: yValues
        }]
    },
    options: {
        plugins: {
        legend: {display:true},
        title: {
            display: true,
            text: "World Wine Production 2018",
            font: {size:16}
        }
        }
    }
    });
    } catch (error) {

    }

}
