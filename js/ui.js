export function populateAssumptionsPanel(assumptions) {
    const panel = document.getElementById('assumptions-panel');
    panel.innerHTML = ''; // Clear existing content

    for (const key in assumptions) {
        if (Object.hasOwnProperty.call(assumptions, key)) {
            const assumption = assumptions[key];
            const labelText = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

            const controlDiv = document.createElement('div');
            controlDiv.className = 'assumption-control';

            const label = document.createElement('label');
            label.htmlFor = key;
            label.textContent = labelText;

            const input = document.createElement('input');
            input.type = 'number';
            input.id = key;
            input.value = assumption;

            // Determine step based on value type (percentage or currency)
            if (key.toLowerCase().includes('rate')) {
                input.step = '0.01';
            } else if (assumption < 10) {
                input.step = '0.01';
            } else {
                input.step = '1';
            }

            input.addEventListener('change', (event) => {
                const newValue = parseFloat(event.target.value);
                if (!isNaN(newValue)) {
                    assumptions[key] = newValue;
                }
            });

            controlDiv.appendChild(label);
            controlDiv.appendChild(input);
            panel.appendChild(controlDiv);
        }
    }
}

export function updateKPIs(projections) {
    const kpiGrid = document.querySelector('.kpi-grid');
    kpiGrid.innerHTML = ''; // Clear existing cards

    if (!projections || !projections.yearly || projections.yearly.length === 0) {
        return;
    }

    const latestYear = projections.yearly[projections.yearly.length - 1];
    const year4 = projections.yearly[projections.yearly.length - 2];

    const totalRevenueKPI = `
        <div class="kpi-card">
            <h3>Year 4 Valuation</h3>
            <p>£${(year4.revenue.total * 10).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
        </div>
    `;

    const mauKPI = `
        <div class="kpi-card">
            <h3>Year 4 MAU</h3>
            <p>${(year4.mau / 1000).toFixed(0)}k</p>
        </div>
    `;

    const ebitdaKPI = `
        <div class="kpi-card">
            <h3>Year 4 EBITDA</h3>
            <p>£${(year4.profitability.ebitda).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
        </div>
    `;

    kpiGrid.innerHTML = totalRevenueKPI + mauKPI + ebitdaKPI;
}

let financialChart = null;

export function updateFinancialChart(projections) {
    const ctx = document.getElementById('financialChart').getContext('2d');
    
    if (!projections || !projections.yearly) {
        return;
    }

    const labels = projections.yearly.map(p => `Year ${p.year}`);
    const b2cRevenueData = projections.yearly.map(p => p.revenue.totalB2C);
    const b2bRevenueData = projections.yearly.map(p => p.revenue.totalB2B);
    const totalRevenueData = projections.yearly.map(p => p.revenue.total);
    const ebitdaData = projections.yearly.map(p => p.profitability.ebitda);

    const data = {
        labels: labels,
        datasets: [{
            label: 'Total Revenue (£)',
            data: totalRevenueData,
            borderColor: '#FFD700', // Vupop Yellow
            backgroundColor: 'rgba(255, 215, 0, 0.1)',
            fill: true,
            tension: 0.4,
        }, {
            label: 'Total B2B Revenue (£)',
            data: b2bRevenueData,
            borderColor: '#03a9f4', // Light Blue
            backgroundColor: 'rgba(3, 169, 244, 0.1)',
            fill: true,
            tension: 0.4,
        }, {
            label: 'Total B2C Revenue (£)',
            data: b2cRevenueData,
            borderColor: '#8bc34a', // Light Green
            backgroundColor: 'rgba(139, 195, 74, 0.1)',
            fill: true,
            tension: 0.4,
        }, {
            label: 'EBITDA (£)',
            data: ebitdaData,
            borderColor: '#f44336', // Red
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            fill: true,
            tension: 0.4,
        }]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#a0a0a0', // Light gray ticks
                    callback: function(value, index, values) {
                        return '£' + (value / 1000) + 'k';
                    }
                },
                grid: {
                    color: '#333' // Darker grid lines
                }
            },
            x: {
                ticks: {
                    color: '#a0a0a0' // Light gray ticks
                },
                grid: {
                    color: '#333' // Darker grid lines
                }
            }
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#e0e0e0' // Light gray legend text
                }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            }
        }
    };

    if (financialChart) {
        financialChart.data = data;
        financialChart.update();
    } else {
        financialChart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: options
        });
    }
} 