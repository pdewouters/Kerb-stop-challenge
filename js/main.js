/**
 * Main entry point for Kerb Stop Challenge
 */

// Global game instance
let game = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Create game instance
    game = new Game();

    // Log to console
    console.log('🐕‍🦺 Kerb Stop Challenge loaded!');
    console.log('Help train a guide dog by mastering kerb stops.');

    // Add loading complete class
    document.body.classList.add('loaded');
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
