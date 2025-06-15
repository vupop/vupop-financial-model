// Tooltip text for assumptions
const ASSUMPTION_TOOLTIPS = {
    startingMAU: 'Monthly Active Users at launch (Month 1)',
    year1TargetMAU: 'Projected MAU at the end of Year 1',
    year2TargetMAU: 'Projected MAU at the end of Year 2',
    year3TargetMAU: 'Projected MAU at the end of Year 3 (exit target)',
    year4TargetMAU: 'Projected MAU at the end of Year 4 (revenue target year)',
    year5TargetMAU: 'Projected MAU at the end of Year 5 (extended growth)',
    premiumSubscriptionPrice: 'Monthly price for premium B2C subscription',
    premiumAdoptionRate: 'Percentage of users who subscribe to premium',
    adRevenuePerUser: 'Monthly ad revenue per user (from Year 3)',
    affiliateCommissionRate: 'Percentage of revenue shared as affiliate commission',
    socialTierPrice: 'Monthly price for B2B Social Tier',
    broadcastTierPrice: 'Monthly price for B2B Broadcast Tier',
    broadcastPlusTierPrice: 'Monthly price for B2B Broadcast+ Tier',
    usageFeePerSecond: 'Fee per second of licensed broadcast content (B2B)',
};

// Tooltip text for KPIs
const KPI_TOOLTIPS = {
    'Year 4 Valuation': 'Estimated company valuation in Year 4 based on revenue multiple.',
    'Year 4 MAU': 'Projected Monthly Active Users at the end of Year 4.',
    'Year 4 Total Revenue': 'Total projected revenue for Year 4.',
    'Year 4 B2B Revenue': 'Projected B2B (business) revenue for Year 4.',
    'Year 4 B2C Revenue': 'Projected B2C (consumer) revenue for Year 4.',
    'Year 4 EBITDA': 'Earnings Before Interest, Taxes, Depreciation, and Amortization for Year 4.',
    'Year 4 Gross Margin %': 'Gross margin as a percentage of revenue for Year 4.',
};

export function populateAssumptionsPanel(assumptions) {
    const panel = document.getElementById('assumptions-panel');
    panel.innerHTML = '';

    for (const key in assumptions) {
        if (Object.hasOwnProperty.call(assumptions, key)) {
            const assumption = assumptions[key];
            const labelText = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

            const controlDiv = document.createElement('div');
            controlDiv.className = 'assumption-control';

            const label = document.createElement('label');
            label.htmlFor = key;
            label.textContent = labelText;

            if (ASSUMPTION_TOOLTIPS[key]) {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = ASSUMPTION_TOOLTIPS[key];
                controlDiv.appendChild(tooltip);
            }

            const input = document.createElement('input');
            input.type = 'number';
            input.id = key;
            input.value = (assumption && typeof assumption === 'object' && 'value' in assumption) ? assumption.value : assumption;

            // Determine step based on value type (percentage or currency)
            let val = (assumption && typeof assumption === 'object' && 'value' in assumption) ? assumption.value : assumption;
            if (key.toLowerCase().includes('rate')) {
                input.step = '0.01';
            } else if (val < 10) {
                input.step = '0.01';
            } else {
                input.step = '1';
            }

            input.addEventListener('change', (event) => {
                const newValue = parseFloat(event.target.value);
                if (!isNaN(newValue)) {
                    if (assumption && typeof assumption === 'object' && 'value' in assumption) {
                        assumption.value = newValue;
                    } else {
                        assumptions[key] = newValue;
                    }
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
    kpiGrid.innerHTML = '';

    if (!projections || !projections.yearly || projections.yearly.length === 0) {
        return;
    }

    // Use Year 4 as the main reference year for all metrics
    const year4 = projections.yearly[3]; // 0-based index, Year 4 is index 3

    // Helper for formatting
    const fmtGBP = v => `£${Number(v).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    const fmtPct = v => `${Number(v).toFixed(1)}%`;

    // KPI Cards
    const kpis = [
        {
            label: 'Year 4 Valuation',
            value: fmtGBP(year4.revenue.total * 10),
        },
        {
            label: 'Year 4 MAU',
            value: `${(year4.mau / 1000).toFixed(0)}k`,
        },
        {
            label: 'Year 4 Total Revenue',
            value: fmtGBP(year4.revenue.total),
        },
        {
            label: 'Year 4 B2B Revenue',
            value: fmtGBP(year4.revenue.totalB2B),
        },
        {
            label: 'Year 4 B2C Revenue',
            value: fmtGBP(year4.revenue.totalB2C),
        },
        {
            label: 'Year 4 EBITDA',
            value: fmtGBP(year4.profitability.ebitda),
        },
        {
            label: 'Year 4 Gross Margin %',
            value: year4.revenue.total ? fmtPct((year4.profitability.grossProfit / year4.revenue.total) * 100) : 'N/A',
        },
    ];

    kpiGrid.innerHTML = kpis.map(kpi => `
        <div class="kpi-card">
            <h3>${kpi.label}</h3>
            <p>${kpi.value}</p>
            ${KPI_TOOLTIPS[kpi.label] ? `<div class="tooltip">${KPI_TOOLTIPS[kpi.label]}</div>` : ''}
        </div>
    `).join('');
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

export function updateProjectionsTable(projections) {
    const container = document.getElementById('projections-table-container');
    if (!projections || !projections.yearly || projections.yearly.length === 0) {
        container.innerHTML = '<p>No data available.</p>';
        return;
    }
    const fmtGBP = v => `£${Number(v).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    const fmtPct = v => `${Number(v).toFixed(1)}%`;
    const rows = projections.yearly.map((year, i) => `
        <tr>
            <td>Year ${year.year}</td>
            <td>${year.mau.toLocaleString('en-GB')}</td>
            <td>${fmtGBP(year.revenue.total)}</td>
            <td>${fmtGBP(year.revenue.totalB2B)}</td>
            <td>${fmtGBP(year.revenue.totalB2C)}</td>
            <td>${fmtGBP(year.profitability.ebitda)}</td>
            <td>${year.revenue.total ? fmtPct((year.profitability.grossProfit / year.revenue.total) * 100) : 'N/A'}</td>
            <td>${fmtGBP(year.revenue.total * (i === 2 ? 15 : i === 3 ? 10 : i === 4 ? 8 : 0))}</td>
        </tr>
    `).join('');
    container.innerHTML = `
        <table class="projections-table">
            <thead>
                <tr>
                    <th>Year</th>
                    <th>MAU</th>
                    <th>Total Revenue</th>
                    <th>B2B Revenue</th>
                    <th>B2C Revenue</th>
                    <th>EBITDA</th>
                    <th>Gross Margin %</th>
                    <th>Exit Valuation</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;
}

export function updateNarrativeSection() {
    const narrative = document.getElementById('narrative-content');
    narrative.innerHTML = `
        <p><strong>Vupop is positioned to achieve a £100 million valuation at 313K MAU</strong>, representing exceptional returns for early investors and a compelling exit opportunity. The model projects strong revenue growth, high-margin recurring revenue, and a diversified business model. Key metrics such as EBITDA, gross margin, and B2B/B2C revenue mix are benchmarked against leading market comps, supporting the investment thesis and exit strategy.</p>
        <ul>
            <li><strong>Exceptional return potential:</strong> 22x+ return on current £4.5M valuation</li>
            <li><strong>Conservative user acquisition target:</strong> 313K MAU for £100M exit</li>
            <li><strong>Multiple strategic acquirers</strong> with clear rationale</li>
            <li><strong>High recurring revenue and margins</strong> vs. market benchmarks</li>
        </ul>
    `;
}

let benchmarkChart = null;

export function updateBenchmarkChart() {
    const ctx = document.getElementById('benchmarkChart').getContext('2d');
    // Hardcoded market comps (from markdown and spreadsheet)
    const comps = [
        { name: 'Vupop (Yr 4)', mau: 500000, valuation: 100_000_000 },
        { name: 'Discord (2024)', mau: 200_000_000, valuation: 11_700_000_000 },
        { name: 'Reddit (2024)', mau: 430_000_000, valuation: 5_070_000_000 },
        { name: 'Truth Social (2024)', mau: 5_000_000, valuation: 4_680_000_000 },
        { name: 'Snapchat (2017)', mau: 190_000_000, valuation: 18_720_000_000 },
        { name: 'Pinterest (2019)', mau: 400_000_000, valuation: 7_800_000_000 },
    ];
    const data = {
        labels: comps.map(c => c.name),
        datasets: [
            {
                label: 'Valuation (£)',
                data: comps.map(c => c.valuation),
                backgroundColor: comps.map(c => c.name.includes('Vupop') ? '#FFD700' : '#888'),
            },
            {
                label: 'MAU (millions)',
                data: comps.map(c => c.mau / 1_000_000),
                backgroundColor: 'rgba(52, 152, 219, 0.5)',
                yAxisID: 'y1',
            }
        ]
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                type: 'linear',
                position: 'left',
                beginAtZero: true,
                title: { display: true, text: 'Valuation (£)' },
                ticks: {
                    callback: v => '£' + (v / 1_000_000) + 'M',
                    color: '#a0a0a0',
                },
                grid: { color: '#333' },
            },
            y1: {
                type: 'linear',
                position: 'right',
                beginAtZero: true,
                title: { display: true, text: 'MAU (millions)' },
                ticks: {
                    callback: v => v + 'M',
                    color: '#03a9f4',
                },
                grid: { drawOnChartArea: false },
            }
        },
        plugins: {
            legend: { position: 'top', labels: { color: '#e0e0e0' } },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        if (context.dataset.label === 'Valuation (£)') {
                            return context.dataset.label + ': £' + context.parsed.y.toLocaleString('en-GB');
                        } else {
                            return context.dataset.label + ': ' + context.parsed.y + 'M';
                        }
                    }
                }
            }
        }
    };
    if (benchmarkChart) {
        benchmarkChart.data = data;
        benchmarkChart.options = options;
        benchmarkChart.update();
    } else {
        benchmarkChart = new Chart(ctx, {
            type: 'bar',
            data: data,
            options: options
        });
    }
} 