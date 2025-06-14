// Password protection system
const PASSWORD = 'vupop2024'; // This should be changed to a more secure method in production

export function initAuth() {
    const passwordOverlay = document.getElementById('password-overlay');
    const mainContent = document.getElementById('main-content');
    const passwordInput = document.getElementById('password-input');
    const passwordSubmit = document.getElementById('password-submit');
    const errorMessage = document.getElementById('error-message');

    // Check if user is already authenticated
    if (sessionStorage.getItem('authenticated') === 'true') {
        showMainContent();
        return;
    }

    function showMainContent() {
        passwordOverlay.style.display = 'none';
        mainContent.style.display = 'block';
        sessionStorage.setItem('authenticated', 'true');
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        setTimeout(() => {
            errorMessage.style.display = 'none';
        }, 3000);
    }

    function handleSubmit() {
        const enteredPassword = passwordInput.value.trim();
        
        if (enteredPassword === PASSWORD) {
            showMainContent();
        } else {
            showError('Incorrect password. Please try again.');
            passwordInput.value = '';
        }
    }

    // Event listeners
    passwordSubmit.addEventListener('click', handleSubmit);
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    });
} 