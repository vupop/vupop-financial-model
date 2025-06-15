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

    // KPI Cards with sublabels
    const kpis = [
        {
            label: 'Year 4 Valuation',
            value: fmtGBP(year4.revenue.total * 10),
            sub: 'Implied exit value at 10x revenue (Year 4)',
        },
        {
            label: 'Year 4 MAU',
            value: `${(year4.mau / 1000).toFixed(0)}k`,
            sub: 'Monthly Active Users (target for strategic exit)',
        },
        {
            label: 'Year 4 Total Revenue',
            value: fmtGBP(year4.revenue.total),
            sub: 'Projected annual revenue (all streams)',
        },
        {
            label: 'Year 4 B2B Revenue',
            value: fmtGBP(year4.revenue.totalB2B),
            sub: 'Licensing, SaaS, and broadcast revenue',
        },
        {
            label: 'Year 4 B2C Revenue',
            value: fmtGBP(year4.revenue.totalB2C),
            sub: 'Consumer subscriptions, ads, affiliate',
        },
        {
            label: 'Year 4 EBITDA',
            value: fmtGBP(year4.profitability.ebitda),
            sub: 'Earnings before interest, taxes, depreciation, amortization',
        },
        {
            label: 'Year 4 Gross Margin %',
            value: year4.revenue.total ? fmtPct((year4.profitability.grossProfit / year4.revenue.total) * 100) : 'N/A',
            sub: 'High margins reflect IP/licensing model',
        },
    ];

    kpiGrid.innerHTML = kpis.map(kpi => `
        <div class="kpi-card">
            <h3>${kpi.label}</h3>
            <p>${kpi.value}</p>
            <div style="font-size:0.95rem;color:#FFD700;margin-top:0.2rem;">${kpi.sub || ''}</div>
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
    const totalRevenueData = projections.yearly.map(p => p.revenue.total);
    const opexData = projections.yearly.map(p => p.costs.totalOpEx);
    const mauData = projections.yearly.map(p => p.mau);
    // Exit Valuation: use revenue * multiple (Year 3: 15x, Year 4: 10x, Year 5: 8x, else 0)
    const exitValuationData = projections.yearly.map((p, i) => {
        if (i === 2) return p.revenue.total * 15;
        if (i === 3) return p.revenue.total * 10;
        if (i === 4) return p.revenue.total * 8;
        return 0;
    });
    const data = {
        labels: labels,
        datasets: [
            {
                label: 'Exit Valuation (£)',
                data: exitValuationData,
                borderColor: '#FFD700',
                backgroundColor: 'rgba(255, 215, 0, 0.1)',
                fill: false,
                tension: 0.4,
                yAxisID: 'y',
            },
            {
                label: 'Total Revenue (£)',
                data: totalRevenueData,
                borderColor: '#03a9f4',
                backgroundColor: 'rgba(3, 169, 244, 0.1)',
                fill: false,
                tension: 0.4,
                yAxisID: 'y',
            },
            {
                label: 'Opex (£)',
                data: opexData,
                borderColor: '#e67e22',
                backgroundColor: 'rgba(230, 126, 34, 0.1)',
                fill: false,
                tension: 0.4,
                yAxisID: 'y',
            },
            {
                label: 'MAU',
                data: mauData,
                borderColor: '#8bc34a',
                backgroundColor: 'rgba(139, 195, 74, 0.1)',
                fill: false,
                tension: 0.4,
                yAxisID: 'y1',
            }
        ]
    };
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: '#a0a0a0',
                    callback: function(value) { return '£' + (value / 1000) + 'k'; }
                },
                grid: { color: '#333' },
                title: { display: true, text: '£ (Valuation, Revenue, Opex)' }
            },
            y1: {
                beginAtZero: true,
                position: 'right',
                ticks: {
                    color: '#8bc34a',
                    callback: function(value) { return value >= 1000 ? (value / 1000) + 'k' : value; }
                },
                grid: { drawOnChartArea: false },
                title: { display: true, text: 'MAU' }
            }
        },
        plugins: {
            legend: {
                position: 'top',
                labels: { color: '#e0e0e0' }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        if (context.dataset.label === 'MAU') {
                            return context.dataset.label + ': ' + context.parsed.y.toLocaleString('en-GB');
                        } else {
                            return context.dataset.label + ': £' + context.parsed.y.toLocaleString('en-GB');
                        }
                    }
                }
            }
        }
    };
    if (financialChart) {
        financialChart.data = data;
        financialChart.options = options;
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
    // Add context sentence above the table
    const contextSentence = `<div style=\"color:#FFD700;font-size:0.97rem;margin-bottom:0.5rem;line-height:1.3;\">5-year projections: Key financial metrics and exit valuation milestones based on current model assumptions. This table shows the growth, profitability, and exit potential at each stage.</div>`;
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
            <td>${i < 2 ? '–' : fmtGBP(year.revenue.total * (i === 2 ? 15 : i === 3 ? 10 : i === 4 ? 8 : 0))}</td>
        </tr>
    `).join('');
    container.innerHTML = `
        ${contextSentence}
        <table class="projections-table compact-table">
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
        <p><span style="color:#FFD700;font-weight:bold;font-size:1.2rem;">Vupop is positioned to achieve a <b>£100 million valuation at 313K MAU</b>, representing exceptional returns for early investors and a compelling exit opportunity.</span></p>
        <p>The model projects strong revenue growth, high-margin recurring revenue, and a diversified business model. Key metrics such as EBITDA, gross margin, and B2B/B2C revenue mix are benchmarked against leading market comps, supporting the investment thesis and exit strategy.</p>
        <ul>
            <li><b>Exceptional return potential:</b> 22x+ return on current £4.5M valuation</li>
            <li><b>Conservative user acquisition target:</b> 313K MAU for £100M exit (vs. 1.3M+ for generic platforms)</li>
            <li><b>Multiple strategic acquirers:</b> Media conglomerates and tech giants with clear rationale for premium offers</li>
            <li><b>High recurring revenue and margins:</b> 60%+ gross margin, recurring B2B/B2C revenue, and robust IP/licensing model</li>
        </ul>
        <p style="color:#FFD700;"><b>Bottom line:</b> Vupop's differentiated positioning in sports media, scalable technology, and proven exit comparables make it a compelling opportunity for investors seeking outsized returns on a realistic user growth target.</p>
    `;
}

let benchmarkChart = null;

export function updateBenchmarkChart() {
    const ctx = document.getElementById('benchmarkChart').getContext('2d');
    // Hardcoded market comps (no Vupop)
    const comps = [
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
                backgroundColor: '#888',
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

    // Add context sentence below chart
    const container = document.getElementById('benchmark-chart-container');
    let contextDiv = document.getElementById('benchmark-context');
    if (!contextDiv) {
        contextDiv = document.createElement('div');
        contextDiv.id = 'benchmark-context';
        contextDiv.style.color = '#FFD700';
        contextDiv.style.fontSize = '0.97rem';
        contextDiv.style.lineHeight = '1.3';
        contextDiv.style.marginTop = '10px';
        contextDiv.style.textAlign = 'center';
    }
    contextDiv.textContent = "Benchmarking data shows how vupop's projected metrics compare to recent market leaders valuations and MAU at sale. The niche nature of vupops audience and industry will indicate a higher multiple of valuation as seen in the MAU to valuation ratios of Truth Social and Snapchat.";
}

export function updateCapTableChart() {
    const ctx = document.getElementById('captableChart').getContext('2d');
    const data = {
        labels: [
            'Founders',
            'Employee Option Pool',
            'Investor 1',
            'Investor 2',
        ],
        datasets: [{
            data: [41.89, 15.0, 0.85, 0.44],
            backgroundColor: [
                '#FFD700', // Founders
                '#03a9f4', // Option Pool
                '#e67e22', // Investor 1
                '#8bc34a', // Investor 2
            ],
            borderColor: '#222',
            borderWidth: 2,
        }]
    };
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#fff', font: { size: 14 } }
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return `${context.label}: ${context.parsed} %`;
                    }
                }
            }
        }
    };
    if (window.captableChartInstance) {
        window.captableChartInstance.data = data;
        window.captableChartInstance.options = options;
        window.captableChartInstance.update();
    } else {
        window.captableChartInstance = new Chart(ctx, {
            type: 'pie',
            data: data,
            options: options
        });
    }
}

export function updateSEISGauge(seisAmount, seisMax) {
    const ctx = document.getElementById('seisGauge').getContext('2d');
    const percent = seisAmount / seisMax;
    const data = {
        datasets: [{
            data: [seisAmount, seisMax - seisAmount],
            backgroundColor: [
                '#00e676', // Green for remaining
                '#333',    // Grey for used
            ],
            borderWidth: 0,
            circumference: 180,
            rotation: 270,
            cutout: '75%',
        }],
        labels: ['Remaining', 'Used']
    };
    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.label + ': £' + context.parsed + '';
                    }
                }
            },
            title: {
                display: true,
                text: 'SEIS Amount Remaining',
                color: '#FFFF00',
                font: { size: 15, weight: 'bold' },
                padding: { bottom: 10 }
            },
        },
    };
    if (window.seisGaugeInstance) {
        window.seisGaugeInstance.data = data;
        window.seisGaugeInstance.options = options;
        window.seisGaugeInstance.update();
    } else {
        window.seisGaugeInstance = new Chart(ctx, {
            type: 'doughnut',
            data: data,
            options: options
        });
    }
    // Set the percentage text in the center
    ctx.save();
    ctx.font = 'bold 1.2rem Segoe UI, Arial';
    ctx.fillStyle = '#FFFF00';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.clearRect(80, 60, 120, 40);
    ctx.fillText((percent * 100).toFixed(1) + '%', 100, 100);
    ctx.restore();
}

export function updateFundraisingMetrics({ seisAmount, seisMax, currentVal, nextRaise, nextVal }) {
    // Numeric widgets for fundraising metrics
    document.getElementById('current-valuation').innerHTML = `<div class="numeric-widget"><span class="num">£${Number(currentVal).toLocaleString('en-GB')}</span><span class="label">Current Valuation</span></div>`;
    document.getElementById('next-round-raise').innerHTML = `<div class="numeric-widget"><span class="num">£${Number(nextRaise).toLocaleString('en-GB')}</span><span class="label">Next Round Raise</span></div>`;
    document.getElementById('target-next-valuation').innerHTML = `<div class="numeric-widget"><span class="num">£${Number(nextVal).toLocaleString('en-GB')}</span><span class="label">Target Valuation</span></div>`;
    // SEIS handled by gauge
} 