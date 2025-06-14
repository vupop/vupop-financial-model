// Vupop Financial Model Main Script 
import { assumptions, state, parseFinancialData } from './state.js';
import { populateAssumptionsPanel, updateKPIs, updateFinancialChart } from './ui.js';
import { calculateProjections } from './calculations.js';

document.addEventListener('DOMContentLoaded', () => {
    const correctPassword = 'vupop'; // WARNING: This is not secure for production use.
    
    const passwordOverlay = document.getElementById('password-overlay');
    const mainContent = document.getElementById('main-content');
    const passwordInput = document.getElementById('password-input');
    const passwordSubmit = document.getElementById('password-submit');
    const errorMessage = document.getElementById('error-message');

    function checkPassword() {
        if (passwordInput.value === correctPassword) {
            passwordOverlay.style.display = 'none';
            mainContent.style.display = 'block';
        } else {
            errorMessage.textContent = 'Incorrect password. Please try again.';
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    passwordSubmit.addEventListener('click', checkPassword);

    passwordInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            checkPassword();
        }
    });

    // Set focus to the password input field when the page loads
    passwordInput.focus();
    
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
            // Optionally, show an error message to the user on the dashboard
        });
});

function initializeApp() {
    console.log('App initialized with assumptions:', assumptions);
    populateAssumptionsPanel(assumptions, updateDashboard);
    updateDashboard(); // Initial calculation
}

function updateDashboard() {
    state.projections = calculateProjections(assumptions);
    console.log('Dashboard updated with new projections:', state.projections);
    updateKPIs(state.projections);
    updateFinancialChart(state.projections);

    // In the future, this function will also update charts and KPIs
} 