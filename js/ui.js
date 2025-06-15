import { calculateGrowthRate } from './calculations.js';

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

    // Group assumptions by category
    const categories = {
        'Growth & User Metrics': ['startingMAU', 'year1TargetMAU', 'year2TargetMAU', 'year3TargetMAU', 'year4TargetMAU', 'year5TargetMAU'],
        'B2C Revenue Assumptions': ['premiumSubscriptionPrice', 'premiumAdoptionRate', 'adRevenuePerUser', 'affiliateCommissionRate'],
        'B2B Revenue Assumptions': ['socialTierPrice', 'broadcastTierPrice', 'broadcastPlusTierPrice', 'usageFeePerSecond'],
        'Valuation Multipliers': ['revenueMultiple', 'strategicPremium', 'sportsContentPremium', 'broadcastIntegrationPremium']
    };

    for (const [category, keys] of Object.entries(categories)) {
        // Add category header
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'assumption-category';
        categoryDiv.innerHTML = `<h3 style="color:#FFFF00;margin:1rem 0 0.5rem 0;font-size:1rem;">${category}</h3>`;
        panel.appendChild(categoryDiv);

        // Add controls for each assumption in this category
        keys.forEach(key => {
            const assumption = assumptions[key];
            const controlDiv = document.createElement('div');
            controlDiv.className = 'assumption-control';

            const label = document.createElement('label');
            label.htmlFor = key;
            label.textContent = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

            if (assumption.note) {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = assumption.note;
                controlDiv.appendChild(tooltip);
            }

            // Create slider container
            const sliderContainer = document.createElement('div');
            sliderContainer.className = 'slider-container';

            // Create slider
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.id = `${key}-slider`;
            slider.min = assumption.min;
            slider.max = assumption.max;
            slider.value = assumption.value;
            slider.step = (assumption.max - assumption.min) / 100;

            // Create number input
            const numberInput = document.createElement('input');
            numberInput.type = 'number';
            numberInput.id = key;
            numberInput.value = assumption.value;
            numberInput.min = assumption.min;
            numberInput.max = assumption.max;
            numberInput.step = (assumption.max - assumption.min) / 100;

            // Add event listeners for real-time updates
            const updateValue = (newValue) => {
                if (!isNaN(newValue) && newValue >= assumption.min && newValue <= assumption.max) {
                    assumption.value = parseFloat(newValue);
                    slider.value = newValue;
                    numberInput.value = newValue;
                    updateDashboard(); // Real-time update
                }
            };

            slider.addEventListener('input', (e) => updateValue(e.target.value));
            numberInput.addEventListener('change', (e) => updateValue(e.target.value));

            // Add min/max labels
            const minMaxLabels = document.createElement('div');
            minMaxLabels.className = 'min-max-labels';
            minMaxLabels.innerHTML = `
                <span>${assumption.min}</span>
                <span>${assumption.max}</span>
            `;

            sliderContainer.appendChild(slider);
            sliderContainer.appendChild(minMaxLabels);

            controlDiv.appendChild(label);
            controlDiv.appendChild(sliderContainer);
            controlDiv.appendChild(numberInput);
            panel.appendChild(controlDiv);
        });
    }
}

export function updateKPIs(projections) {
    const kpiGrid = document.querySelector('.kpi-grid');
    if (!projections || !projections.yearly) return;

    const currentYear = projections.yearly[0];
    const nextYear = projections.yearly[1];
    const exitYear = projections.yearly[2];

    // Calculate growth rate using the function from calculations.js
    const growthRate = calculateGrowthRate(currentYear.mau, 'EARLY_STAGE');

    const kpis = [
        {
            label: 'Current Valuation',
            value: `£${currentYear.valuation.toLocaleString('en-GB')}`,
            sub: 'Based on MAU and revenue multiples'
        },
        {
            label: 'MAU Growth Rate',
            value: `${(growthRate * 100).toFixed(1)}% MoM`,
            sub: 'Peak season target'
        },
        {
            label: 'Revenue Mix',
            value: '40/30/20/10',
            sub: 'B2B/SaaS/Affiliate/Premium'
        },
        {
            label: 'Gross Margin',
            value: `${currentYear.profitability.grossMargin.toFixed(1)}%`,
            sub: 'Target: 60%+'
        },
        {
            label: 'Exit Valuation',
            value: `£${exitYear.valuation.toLocaleString('en-GB')}`,
            sub: 'Year 3 target (15x revenue)'
        },
        {
            label: 'Strategic Premium',
            value: '1.4x',
            sub: 'Based on market comps'
        },
        {
            label: 'User Acquisition Cost',
            value: '£15-40',
            sub: 'Early stage target'
        },
        {
            label: 'LTV:CAC Ratio',
            value: '3:1 to 5:1',
            sub: 'Target range'
        }
    ];

    kpiGrid.innerHTML = kpis.map(kpi => `
        <div class="kpi-card">
            <h3>${kpi.label}</h3>
            <p>${kpi.value}</p>
            <div style="font-size:0.95rem;color:#FFFF00;margin-top:0.2rem;">${kpi.sub || ''}</div>
            ${KPI_TOOLTIPS[kpi.label] ? `<div class="tooltip">${KPI_TOOLTIPS[kpi.label]}</div>` : ''}
        </div>
    `).join('');
}

let financialChart = null;

export function updateFinancialChart(projections) {
    const ctx = document.getElementById('financialChart').getContext('2d');
    if (!projections || !projections.yearly) return;

    const labels = projections.yearly.map(p => `Year ${p.year}`);
    const totalRevenueData = projections.yearly.map(p => p.revenue.total);
    const opexData = projections.yearly.map(p => p.costs.totalOpEx);
    const mauData = projections.yearly.map(p => p.mau);
    const valuationData = projections.yearly.map(p => p.valuation);

    const data = {
        labels,
        datasets: [
            {
                label: 'Total Revenue',
                data: totalRevenueData,
                borderColor: '#FFFF00',
                backgroundColor: 'rgba(255, 255, 0, 0.1)',
                yAxisID: 'y'
            },
            {
                label: 'Operating Expenses',
                data: opexData,
                borderColor: '#FF4444',
                backgroundColor: 'rgba(255, 68, 68, 0.1)',
                yAxisID: 'y'
            },
            {
                label: 'MAU',
                data: mauData,
                borderColor: '#8bc34a',
                backgroundColor: 'rgba(139, 195, 74, 0.1)',
                yAxisID: 'y1'
            },
            {
                label: 'Valuation',
                data: valuationData,
                borderColor: '#2196F3',
                backgroundColor: 'rgba(33, 150, 243, 0.1)',
                yAxisID: 'y'
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

    const contextSentence = `<div style="color:#FFFF00;font-size:0.97rem;margin-bottom:0.5rem;line-height:1.3;">
        5-year projections: Key financial metrics and exit valuation milestones based on current model assumptions. 
        This table shows the growth, profitability, and exit potential at each stage.
    </div>`;

    const fmtGBP = v => `£${Number(v).toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    const fmtPct = v => `${Number(v).toFixed(1)}%`;

    const rows = projections.yearly.map(year => `
        <tr>
            <td>Year ${year.year}</td>
            <td>${year.mau.toLocaleString('en-GB')}</td>
            <td>${fmtGBP(year.revenue.total)}</td>
            <td>${fmtGBP(year.revenue.totalB2B)}</td>
            <td>${fmtGBP(year.revenue.totalB2C)}</td>
            <td>${fmtGBP(year.profitability.ebitda)}</td>
            <td>${fmtPct(year.profitability.grossMargin)}</td>
            <td>${fmtGBP(year.valuation)}</td>
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
                    <th>Valuation</th>
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
        <p><span style="color:#FFFF00;font-weight:bold;font-size:1.2rem;">Vupop is positioned to achieve a <b>£100 million valuation at 313K MAU</b>, representing exceptional returns for early investors and a compelling exit opportunity.</span></p>
        
        <p>The model projects strong revenue growth with a diversified business model:</p>
        <ul>
            <li><b>Revenue Mix:</b> 40% Broadcast Licensing, 30% SaaS Subscriptions, 20% Affiliate Commissions, 10% Premium Features</li>
            <li><b>Growth Trajectory:</b> 15-25% MoM growth in early stage, targeting 313K MAU within 36-48 months</li>
            <li><b>Strategic Premium:</b> 1.4x valuation multiplier based on content synergies and distribution advantages</li>
            <li><b>Exit Timeline:</b> 7-9 years post-founding, with potential earlier exit at £100-500M ARR</li>
        </ul>

        <p><b>Key Differentiators:</b></p>
        <ul>
            <li>Sports content premium (1.5x valuation multiplier)</li>
            <li>Broadcast integration creates defensible IP (2.0x multiplier)</li>
            <li>B2B revenue model reduces risk profile (1.2x multiplier)</li>
            <li>Conservative user acquisition target (313K MAU vs. 1.3M+ for generic platforms)</li>
        </ul>

        <p style="color:#FFFF00;"><b>Bottom line:</b> Vupop's differentiated positioning in sports media, scalable technology, and proven exit comparables make it a compelling opportunity for investors seeking outsized returns on a realistic user growth target.</p>
    `;
}

let benchmarkChart = null;

export function updateBenchmarkChart() {
    const ctx = document.getElementById('benchmarkChart').getContext('2d');
    
    const data = {
        labels: ['Truth Social', 'Snapchat', 'Discord', 'Pinterest', 'Reddit', 'Vupop (Projected)'],
        datasets: [
            {
                label: 'Valuation (£)',
                data: [4680000000, 18720000000, 11700000000, 7800000000, 5070000000, 100000000],
                backgroundColor: 'rgba(255, 255, 0, 0.2)',
                borderColor: '#FFFF00',
                borderWidth: 1,
                yAxisID: 'y'
            },
            {
                label: 'MAU (millions)',
                data: [5, 190, 154, 400, 430, 0.313],
                backgroundColor: 'rgba(3, 169, 244, 0.2)',
                borderColor: '#03a9f4',
                borderWidth: 1,
                yAxisID: 'y1'
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

    // Update context text with more detailed analysis
    const contextDiv = document.getElementById('benchmark-context');
    contextDiv.innerHTML = `
        <p>Vupop's projected £100M valuation at 313K MAU represents a premium valuation multiple compared to market leaders, justified by:</p>
        <ul style="text-align:left;margin-top:0.5rem;">
            <li>Sports content premium (1.5x multiplier)</li>
            <li>Broadcast integration (2.0x multiplier)</li>
            <li>B2B revenue model (1.2x multiplier)</li>
            <li>Strategic acquisition premium (1.4x multiplier)</li>
        </ul>
        <p style="margin-top:0.5rem;">This positions Vupop between Discord (£76/MAU) and Truth Social (£936/MAU) in terms of value per user, reflecting its unique market position.</p>
    `;
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
                '#FFFF00', // Founders
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