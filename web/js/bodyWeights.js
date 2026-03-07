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
        const now = new Date();
        const currentMonthData = data.filter(entry => {
            const date = new Date(entry.createdAt);
            return (
                date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
            );
        })
        //.map pulls just the weight numbers from the array and then ...weights unpacks it and
        //compares the values then ±30 the value
        const weights = currentMonthData.map(entry => entry.dailyWeight);
        const minWeight = Math.min(...weights) - 20;
        const maxWeight = Math.max(...weights) + 20;





        document.getElementById("weight-log").innerHTML = '';


        const bodyHeader = document.createElement("h1");
        bodyHeader.textContent = `Daily Measurements`;
        document.getElementById('weight-log').appendChild(bodyHeader);

        const { monthlyAverage, yearlyAverage } = groupAvgCalc(data);

        displayWeights(currentMonthData, monthlyAverage, yearlyAverage);

        function displayWeights(dailyWeight) {
            currentMonthData.forEach(entry => {
                const items = document.createElement("p");
                const date = new Date(entry.createdAt).toLocaleDateString();
                items.textContent = `${date} - ${entry.dailyWeight} lbs`;
                document.getElementById("weight-log").appendChild(items);
            });

            for (const month in monthlyAverage) {
                const t = document.createElement('h1');
                t.textContent = `${month} - Avg: ${monthlyAverage[month].toFixed(1)} lbs`;
                document.getElementById("weight-log").appendChild(t);
            }

            const yearAvg = document.createElement("h1");
            yearAvg.textContent = `Yearly Avg: ${yearlyAverage.toFixed(1)} lbs`;
            document.getElementById("weight-log").appendChild(yearAvg);

        }



        


        function groupAvgCalc(dailyWeight) {
            const grouped = {};

            dailyWeight.forEach(entry => {
                const date = new Date(entry.createdAt); 
                const keys = date.toLocaleDateString('default', { month: 'short' });

                if (!grouped[keys]) grouped[keys] = [];
                grouped[keys].push(entry.dailyWeight);
            });

            const monthlyAverage = {};
            for (const month in grouped) {
                const weight = grouped[month];
                const avg = weight.reduce((sum, w) => sum + w, 0) / weight.length;
                monthlyAverage[month] = avg;
            }


            const allAverages = Object.values(monthlyAverage);
            const yearlyAverage = allAverages.reduce((sum, avg) => sum + avg, 0) / allAverages.length;


            return { monthlyAverage, yearlyAverage };

        }







        chartInstance = new Chart("bodyWeightChart", {
        type: "line",
        data: {
            datasets: [{
            label: "Body Weight (lbs)",
            fill: false,
            lineTension: 0,
            backgroundColor: "rgba(0,255,255,3.0)",
            borderColor: "rgba(0, 255, 255, 0.1)",
            data: currentMonthData.map(entry => ({
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