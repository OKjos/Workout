//Page updates results from search like when they search for the foods
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



export async function macroPiChart() {
    try {
        const userId = await getUserId();
        const res = await fetch(`/food/users/${userId}/foods-today`);
        const data = await res.json();


        const foods = data.foods || [];
        console.log('Fetched foods:', foods);


        let totalProtein = 0;
        let totalCarbs = 0;
        let totalFats = 0;
        let totalCalories = 0;
        
        foods.forEach(food => {
            totalProtein += food.macros?.protein || 0;
            totalCarbs += food.macros?.carbs || 0;
            totalFats += food.macros?.fats || 0;
            totalCalories += food.macros?.calories || 0;
        });

        console.log('Totals:', { totalProtein, totalCarbs, totalFats, totalCalories });  // Debug log

        const xValues = ["Protein", "Carbs", "Fats"];  
        const yValues = [totalProtein, totalCarbs, totalFats];  
        const barColors = [
            "#b91d47",  
            "#00aba9", 
            "#2b5797"   
        ];

    const ctx = document.getElementById('myChart');

        if (window.macroChart instanceof window.Chart) {
            window.macroChart.destroy();
        }

        // Create new chart
        window.macroChart = new window.Chart(ctx, {
            type: "pie",
            data: {
                labels: xValues,
                datasets: [{
                    backgroundColor: barColors,
                    data: yValues,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: `Macro Distribution (Total Calories: ${totalCalories})`,
                        font: { size: 16 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value}g`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error in macroPiChart:", error);
    }
}