import { apiPost } from './api.js';
import { getUserId } from './helper.js';


let chartInstance = null;

const bodyInput = document.getElementById('body-inputbox-id');
const bodySubmit = document.getElementById('body-submit-id');

bodySubmit.addEventListener('click', function (event) {
    event.preventDefault();

    const input = parseFloat(bodyInput.value);
    bodyWeightChart(input);

})


export async function bodyWeightChart(input) {
    try {
        if (chartInstance) {
            chartInstance.destroy();
        }

        const userId = await getUserId();
        if (input) {
            await apiPost(`/body/users/${userId}/bodyWeight`, { dailyWeight: input });
        }
        const res = await fetch(`/body/users/${userId}/bodyWeight`);
        const data = await res.json();

        console.log("data from DB:", data);
        //.map pulls just the weight numbers from the array and then ...weights unpacks it and
        //compares the values then ±30 the value
        const weights = data.map(entry => entry.dailyWeight);
        const minWeight = Math.min(...weights) - 20;
        const maxWeight = Math.max(...weights) + 20;



        data.forEach(entry => {
            const items = document.createElement("p");
            const date = new Date(entry.createdAt).toLocaleDateString();
            items.textContent = `${date} - ${entry.dailyWeight} lbs`;
            document.getElementById("weight-log").appendChild(items);
        });


        chartInstance = new Chart("bodyWeightChart", {
        type: "line",
        data: {
            datasets: [{
            label: "Body Weight (lbs)",
            fill: false,
            lineTension: 0,
            backgroundColor: "rgba(0,255,255,3.0)",
            borderColor: "rgba(0, 255, 255, 0.1)",
            data: data.map(entry => ({
                y: entry.dailyWeight,
                x: new Date(entry.createdAt).getDate()
            }))
            }]
        },
        options: {
    plugins: {
        legend: { display: true },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `Day: ${context.parsed.x} — Weight: ${context.parsed.y} lbs`;
                    }
                }
            }
            },
            scales: {
                x: {
                    type: 'linear',
                    min: 1,
                    max: 31,
                    ticks: { stepSize: 5 },
                    title: { display: true, text: "Day of Month" },
                    grid: { drawOnChartArea: true }
                },
                y: {
                    type: 'linear',
                    min: minWeight,
                    max: maxWeight,
                    ticks: { stepSize: 5 },
                    title: { display: true, text: "Body Weight (lbs)" },
                    grid: { drawOnChartArea: true }
                }
            }
        }
    });
    } catch (error) {
        console.error("Error in BodyChart:", error);
    }
}

bodyWeightChart();