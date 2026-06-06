import { apiPost } from './api.js';
import { getUserId } from './helper.js';
import { reloadCalendar } from './routine.js';

document.addEventListener('click', () => {
    document.querySelectorAll('.kebab-menu.open').forEach(m => m.classList.remove('open'));
});



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

        // Clear previous content before repopulating
        document.getElementById('foods-added').innerHTML = '';
        const existingChartH1 = document.querySelector('#chartHeader h1');
        if (existingChartH1) existingChartH1.remove();

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

        const xValues = ["Protein", "Carbs", "Fats"];
        const yValues = [totalProtein, totalCarbs, totalFats];
        const barColors = ["#b91d47", "#00aba9", "#2b5797"];

        const ctx = document.getElementById('myChart');

        if (window.macroChart instanceof window.Chart) {
            window.macroChart.destroy();
        }

        const foodsAddedEl = document.getElementById("foods-added");
        foods.forEach(entry => {
            const p = document.createElement('p');
            p.style.position = 'relative';
            p.textContent = entry.foodName + ' ';

            const wrapper = document.createElement('span');
            wrapper.className = 'kebab-wrapper';

            const kebabBtn = document.createElement('button');
            kebabBtn.textContent = '⋮';
            kebabBtn.className = 'kebab-btn';

            const menu = document.createElement('div');
            menu.className = 'kebab-menu';

            const delItem = document.createElement('button');
            delItem.textContent = 'Delete';
            delItem.className = 'kebab-item';
            delItem.addEventListener('click', async (e) => {
                e.stopPropagation();
                menu.classList.remove('open');
                const userId = await getUserId();
                const res = await fetch(`/food/users/${userId}/foods/${entry._id}`, { method: 'DELETE' });
                if (res.ok) {
                    await macroPiChart();
                    await reloadCalendar();
                }
            });

            kebabBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.kebab-menu.open').forEach(m => { if (m !== menu) m.classList.remove('open'); });
                menu.classList.toggle('open');
            });

            menu.appendChild(delItem);
            wrapper.appendChild(kebabBtn);
            wrapper.appendChild(menu);
            p.appendChild(wrapper);
            foodsAddedEl.appendChild(p);
        });

        const foodHeader = document.createElement('h1');
        foodHeader.textContent = `Daily Food Intake`;
        foodsAddedEl.prepend(foodHeader);

        const chartHeader = document.createElement('h1');
        chartHeader.textContent = `Food Intake Chart`;
        document.getElementById('chartHeader').prepend(chartHeader);








        // Create new chart
        window.macroChart = new window.Chart(ctx, {
            type: "pie",
            plugins: [ChartDataLabels],
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
                maintainAspectRatio: true,
                aspectRatio: 1,
                plugins: {
                    datalabels: {
                        color: '#fff',
                        formatter: (value, context) => {
                            const label = context.chart.data.labels[context.dataIndex];
                            return `${label}: ${value.toFixed(1)}g`;
                        }
                    },
                    legend: { 
                        display: true,
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: `Macro Distribution (Total Calories: ${totalCalories.toFixed(1)})`,
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
