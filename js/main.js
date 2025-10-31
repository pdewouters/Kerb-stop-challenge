/**
 * Main entry point for Kerb Stop Challenge
 */

// Global game instance
let game = null;

// Error display function
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #f44336;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        z-index: 10000;
        max-width: 90%;
        text-align: center;
        font-family: Arial, sans-serif;
    `;
    errorDiv.textContent = '⚠️ Error: ' + message;
    document.body.appendChild(errorDiv);
    console.error('Game Error:', message);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Create game instance
        game = new Game();

        // Log to console
        console.log('🐕‍🦺 Kerb Stop Challenge loaded!');
        console.log('Help train a guide dog by mastering kerb stops.');

        // Add loading complete class
        document.body.classList.add('loaded');
    } catch (error) {
        showError('Failed to initialize game: ' + error.message);
        console.error('Initialization error:', error);
    }
});

// Global error handler
window.addEventListener('error', (event) => {
    showError(event.message);
    console.error('Runtime error:', event);
});

window.addEventListener('unhandledrejection', (event) => {
    showError('Promise error: ' + event.reason);
    console.error('Unhandled promise rejection:', event);
});

// Handle visibility change (pause when tab is hidden)
document.addEventListener('visibilitychange', () => {
    if (game && game.state === 'playing' && document.hidden) {
        game.togglePause();
    }
});

// Prevent accidental page navigation
window.addEventListener('beforeunload', (e) => {
    if (game && game.state === 'playing') {
        e.preventDefault();
        e.returnValue = 'Game in progress. Are you sure you want to leave?';
        return e.returnValue;
    }
});

// Service Worker for PWA (optional enhancement)
if ('serviceWorker' in navigator) {
    // Uncomment when you have a service worker file
    // navigator.serviceWorker.register('/sw.js').catch(err => {
    //     console.log('Service worker registration failed:', err);
    // });
}
