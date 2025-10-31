/**
 * Main Game class for Kerb Stop Challenge
 * Manages game loop, state, and coordination between components
 */

class Game {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        // Game state
        this.state = 'start'; // start, playing, paused, complete
        this.score = 0;
        this.currentAttempts = 3;
        this.maxAttempts = 3;

        // Game objects
        this.puppy = null;
        this.kerbManager = null;
        this.confettiSystem = new ConfettiSystem();

        // Managers
        this.audioManager = new AudioManager();
        this.uiManager = null;

        // Timing
        this.lastTime = 0;
        this.animationId = null;

        // Difficulty settings
        this.difficultySettings = {
            1: { speed: 2, label: 'Easy' },
            2: { speed: 3.5, label: 'Medium' },
            3: { speed: 5, label: 'Hard' }
        };

        // Initialize
        this.init();
    }

    init() {
        // Setup touch controls for mobile
        setupTouchControls();

        // Resize canvas on window resize
        window.addEventListener('resize', () => this.resizeCanvas());

        // Load audio
        this.audioManager.loadSounds();

        // Create UI manager
        this.uiManager = new UIManager(this);
        this.uiManager.updateMuteButton();

        // Setup input handlers
        this.setupInput();

        // Show start screen
        ScreenManager.show('startScreen');
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();

        // Set canvas size to fill container
        this.canvas.width = Math.min(1200, rect.width);
        this.canvas.height = Math.min(800, rect.height);

        // Maintain aspect ratio on mobile
        if (window.innerWidth < 768) {
            this.canvas.width = rect.width;
            this.canvas.height = window.innerHeight - 200; // Account for UI
        }
    }

    setupInput() {
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                this.handleInput();
            }
        });

        // Touch/Click input on canvas
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleInput();
        });

        this.canvas.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleInput();
        });
    }

    handleInput() {
        if (this.state === 'playing') {
            this.stopPuppy();
        } else if (this.state === 'paused') {
            this.togglePause();
        }
    }

    startGame() {
        // Initialize game objects
        this.puppy = new Puppy(100, this.canvas.height * 0.35);
        this.kerbManager = new KerbManager(this.canvas.width, this.canvas.height);

        // Reset game state
        this.score = 0;
        this.currentAttempts = this.maxAttempts;
        this.state = 'playing';

        // Set initial difficulty
        const currentKerb = this.kerbManager.getCurrentKerb();
        this.puppy.setSpeed(this.difficultySettings[currentKerb.difficulty].speed);

        // Update UI
        this.uiManager.updateScore(this.score);
        this.updateProgress();

        // Show game screen
        ScreenManager.show('gameScreen');

        // Start game loop
        this.lastTime = performance.now();
        this.gameLoop();
    }

    restartGame() {
        ScreenManager.show('startScreen');
        this.state = 'start';

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    gameLoop(currentTime = 0) {
        if (this.state !== 'playing') {
            return;
        }

        // Calculate delta time
        const deltaTime = (currentTime - this.lastTime) / 16.67; // Normalize to 60fps
        this.lastTime = currentTime;

        // Update
        this.update(deltaTime);

        // Draw
        this.draw();

        // Continue loop
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime) {
        // Update puppy
        this.puppy.update(deltaTime);

        // Update current kerb
        const currentKerb = this.kerbManager.getCurrentKerb();
        if (currentKerb) {
            currentKerb.update();

            // Check if puppy passed the kerb without stopping
            if (this.puppy.state === 'walking' && currentKerb.hasPassed(this.puppy.x)) {
                this.handleMissedKerb();
            }
        }

        // Update confetti
        if (this.confettiSystem.isActive()) {
            this.confettiSystem.update();
        }
    }

    draw() {
        // Clear canvas with sky gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#E0F6FF');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw current kerb
        const currentKerb = this.kerbManager.getCurrentKerb();
        if (currentKerb) {
            const showZones = this.puppy.state === 'walking';
            currentKerb.draw(this.ctx, showZones);
        }

        // Draw puppy
        this.puppy.draw(this.ctx);

        // Draw confetti
        if (this.confettiSystem.isActive()) {
            this.confettiSystem.draw(this.ctx);
        }
    }

    stopPuppy() {
        if (this.puppy.state !== 'walking') return;

        // Stop the puppy
        this.puppy.stop();
        this.audioManager.play('sit');

        // Check stop quality
        const currentKerb = this.kerbManager.getCurrentKerb();
        const result = currentKerb.getStopQuality(this.puppy.x);

        // Handle result
        if (result.quality === 'perfect' || result.quality === 'good') {
            this.handleSuccessfulStop(result);
        } else {
            this.handleFailedStop(result);
        }
    }

    handleSuccessfulStop(result) {
        // Add score
        this.score += result.score;
        this.uiManager.updateScore(this.score);

        // Play sound
        if (result.quality === 'perfect') {
            this.audioManager.play('perfect');
            // Show confetti
            this.confettiSystem.burst(this.puppy.x, this.puppy.y, 20);
        } else {
            this.audioManager.play('success');
        }

        // Show feedback
        this.uiManager.showFeedback(result.message, result.quality);

        // Move to next kerb after delay
        setTimeout(() => {
            this.nextKerb();
        }, 1500);
    }

    handleFailedStop(result) {
        // Play miss sound
        this.audioManager.play('miss');

        // Show feedback
        this.uiManager.showFeedback(result.message, result.quality);

        // Reduce attempts
        this.currentAttempts--;
        this.updateProgress();

        // Check if out of attempts
        if (this.currentAttempts <= 0) {
            // Move to next kerb with 0 points
            setTimeout(() => {
                this.nextKerb();
            }, 1500);
        } else {
            // Retry this kerb
            setTimeout(() => {
                this.resetPuppyPosition();
            }, 1500);
        }
    }

    handleMissedKerb() {
        // Puppy walked past without stopping
        this.audioManager.play('miss');
        this.uiManager.showFeedback('Missed the kerb! ✗', 'miss');

        this.currentAttempts--;
        this.updateProgress();

        if (this.currentAttempts <= 0) {
            setTimeout(() => {
                this.nextKerb();
            }, 1500);
        } else {
            setTimeout(() => {
                this.resetPuppyPosition();
            }, 1500);
        }
    }

    resetPuppyPosition() {
        // Reset puppy to start position
        this.puppy.x = 100;
        this.puppy.reset();

        // Update difficulty
        const currentKerb = this.kerbManager.getCurrentKerb();
        this.puppy.setSpeed(this.difficultySettings[currentKerb.difficulty].speed);
    }

    nextKerb() {
        // Reset attempts for next kerb
        this.currentAttempts = this.maxAttempts;

        // Move to next kerb
        const hasMore = this.kerbManager.nextKerb();

        if (hasMore) {
            // Reset puppy for next kerb
            this.resetPuppyPosition();
            this.updateProgress();
        } else {
            // Game complete!
            this.completeGame();
        }
    }

    updateProgress() {
        const progress = this.kerbManager.getProgress();
        this.uiManager.updateProgress(progress.current, progress.total, this.currentAttempts);
    }

    completeGame() {
        this.state = 'complete';

        // Stop game loop
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // Play complete sound
        this.audioManager.play('complete');

        // Check for new high score
        const isNewHighScore = Storage.setHighScore(this.score);

        // Show confetti
        this.confettiSystem.burst(this.canvas.width / 2, this.canvas.height / 2, 50);

        // Show complete screen after brief delay
        setTimeout(() => {
            this.uiManager.showCompleteScreen(this.score, isNewHighScore);

            // Show donation modal after another delay
            setTimeout(() => {
                this.uiManager.showDonationModal();
            }, 1000);
        }, 1000);
    }

    togglePause() {
        if (this.state === 'playing') {
            this.state = 'paused';
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
            this.uiManager.showPauseOverlay(true);
        } else if (this.state === 'paused') {
            this.state = 'playing';
            this.lastTime = performance.now();
            this.gameLoop();
            this.uiManager.showPauseOverlay(false);
        }
    }
}
