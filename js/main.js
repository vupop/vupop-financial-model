// Vupop Financial Model Main Script 
import { assumptions, state, parseFinancialData, fixedInputs } from './state.js';
import { populateAssumptionsPanel, updateKPIs, updateFinancialChart, updateProjectionsTable, updateNarrativeSection, updateBenchmarkChart, updateCapTableChart } from './ui.js';
import { calculateProjections } from './calculations.js';
import { initAuth } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize authentication
    initAuth();
    
    // Modal elements
    const assumptionsModal = document.getElementById('assumptions-modal');
    const editAssumptionsBtn = document.getElementById('edit-assumptions-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const updateDashboardBtn = document.getElementById('update-dashboard-btn');

    // Modal event listeners
    editAssumptionsBtn.addEventListener('click', () => {
        assumptionsModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        assumptionsModal.classList.add('hidden');
    });

    updateDashboardBtn.addEventListener('click', () => {
        updateDashboard();
        assumptionsModal.classList.add('hidden');
    });

    // Fetch and parse the financial model data
    fetch('vupop_financial_model_spreadsheet.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(htmlText => {
            parseFinancialData(htmlText);
            // Now that data is parsed, we can initialize the dashboard UI
            initializeApp();
        })
        .catch(error => {
            console.error('Error loading or parsing financial data:', error);
            // Show error message to the user
            const mainContent = document.getElementById('main-content');
            if (mainContent) {
                mainContent.innerHTML = `
                    <div class="error-container">
                        <h2>Error Loading Data</h2>
                        <p>There was a problem loading the financial data. Please try refreshing the page.</p>
                    </div>
                `;
            }
        });
});

function initializeApp() {
    console.log('App initialized with assumptions:', assumptions);
    populateAssumptionsPanel(assumptions);
    updateDashboard(); // Initial calculation
}

function updateDashboard() {
    state.projections = calculateProjections(assumptions, fixedInputs);
    console.log('Dashboard updated with new projections:', state.projections);
    updateKPIs(state.projections);
    updateFinancialChart(state.projections);
    updateProjectionsTable(state.projections);
    updateNarrativeSection();
    updateBenchmarkChart();
    updateCapTableChart();
} 