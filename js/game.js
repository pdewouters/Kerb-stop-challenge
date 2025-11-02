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

        // Difficulty settings (increased by 20% for faster gameplay)
        this.difficultySettings = {
            1: { speed: 2.4, label: 'Easy' },
            2: { speed: 4.2, label: 'Medium' },
            3: { speed: 6, label: 'Hard' }
        };

        // Initialize
        this.init();
    }

    init() {
        // Setup touch controls for mobile
        setupTouchControls();

        // Resize canvas on window resize
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            if (this.state === 'start') {
                this.renderStartScreen();
            }
        });

        // Load audio
        this.audioManager.loadSounds();

        // Create UI manager
        this.uiManager = new UIManager(this);
        this.uiManager.updateMuteButton();

        // Setup input handlers
        this.setupInput();

        // Render and show start screen
        this.renderStartScreen();
        ScreenManager.show('startScreen');
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();

        // Calculate available space
        const uiHeight = document.getElementById('gameUI')?.offsetHeight || 100;
        const availableHeight = window.innerHeight - uiHeight - 40; // Extra padding
        const availableWidth = window.innerWidth;

        // Detect orientation
        const isLandscape = availableWidth > availableHeight;

        // Set canvas size based on orientation
        if (isLandscape) {
            // Landscape: prioritize width, adjust height to fit
            this.canvas.width = Math.min(1200, availableWidth);
            this.canvas.height = Math.max(400, Math.min(availableHeight, 600));
        } else {
            // Portrait: prioritize height with minimum for proper rendering
            this.canvas.width = Math.min(1200, rect.width || availableWidth);
            this.canvas.height = Math.max(500, Math.min(availableHeight, 800));
        }

        console.log('Canvas resized:', this.canvas.width, 'x', this.canvas.height, 'Orientation:', isLandscape ? 'landscape' : 'portrait');
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
        // Puppy stays FIXED on pavement - world scrolls past it
        const puppyX = this.canvas.width * 0.2;  // 20% from left side
        const puppyY = this.canvas.height * 0.82;  // On the pavement (around 80% down based on background image)
        this.puppy = new Puppy(puppyX, puppyY);
        this.kerbManager = new KerbManager(this.canvas.width, this.canvas.height);

        // Reset game state
        this.score = 0;
        this.currentAttempts = this.maxAttempts;
        this.state = 'playing';

        // Store current scroll speed (difficulty affects scroll speed)
        const currentKerb = this.kerbManager.getCurrentKerb();
        this.scrollSpeed = this.difficultySettings[currentKerb.difficulty].speed;

        // Update UI
        this.uiManager.updateScore(this.score);
        this.updateProgress();

        // Show game screen
        ScreenManager.show('gameScreen');

        // Show instructions briefly at start
        const instructionElement = document.getElementById('instruction');
        if (instructionElement) {
            instructionElement.classList.remove('hidden');
            // Hide instructions after 3 seconds
            setTimeout(() => {
                instructionElement.classList.add('hidden');
            }, 3000);
        }

        // Resize canvas after screen is shown to ensure correct dimensions
        setTimeout(() => {
            this.resizeCanvas();
            console.log('Canvas resized after game screen shown');
        }, 100);

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
        // Update puppy animation (stays in place)
        this.puppy.update(deltaTime);

        // Update current kerb - scroll the world if puppy is walking
        const currentKerb = this.kerbManager.getCurrentKerb();
        if (currentKerb) {
            if (this.puppy.state === 'walking') {
                // Scroll the world right-to-left
                currentKerb.update(this.scrollSpeed);

                // Check if player missed a traffic light
                if (currentKerb.checkMissedStop(this.puppy.x, true)) {
                    this.handleMissedKerb();
                }
            }
        }

        // Update confetti
        if (this.confettiSystem.isActive()) {
            this.confettiSystem.update();
        }
    }

    draw() {
        // Draw current kerb - this draws entire scene (sky, buildings, ground, traffic lights)
        const currentKerb = this.kerbManager.getCurrentKerb();
        if (currentKerb) {
            // Show stop zones in debug mode only
            currentKerb.draw(this.ctx, false, this.puppy.x);
        }

        // Draw puppy (stays fixed on screen)
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

        // Reset intersection tracking for next crossing
        const currentKerb = this.kerbManager.getCurrentKerb();
        currentKerb.resetIntersectionTracking();

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
        // Puppy stays at fixed position - just resume walking
        this.puppy.reset();

        // Update scroll speed based on difficulty
        const currentKerb = this.kerbManager.getCurrentKerb();
        this.scrollSpeed = this.difficultySettings[currentKerb.difficulty].speed;

        // Reset intersection tracking
        currentKerb.resetIntersectionTracking();
    }

    nextKerb() {
        // Reset attempts for next kerb
        this.currentAttempts = this.maxAttempts;

        // Move to next kerb
        const hasMore = this.kerbManager.nextKerb();

        if (hasMore) {
            // Reset puppy for next kerb and update scroll speed
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

    renderStartScreen() {
        // Render game background on start screen canvas
        const startCanvas = document.getElementById('startCanvas');
        if (!startCanvas) {
            console.warn('Start canvas not found');
            return;
        }

        try {
            const ctx = startCanvas.getContext('2d');

            // Set canvas size
            startCanvas.width = window.innerWidth;
            startCanvas.height = window.innerHeight;

            const canvasWidth = startCanvas.width;
            const canvasHeight = startCanvas.height;

            // Load and draw the background image directly
            const bgImage = new Image();
            bgImage.onload = () => {
                // Scale to fill canvas height
                const scale = canvasHeight / bgImage.height;
                const scaledWidth = bgImage.width * scale;

                // Draw tiled background
                for (let x = 0; x < canvasWidth + scaledWidth; x += scaledWidth) {
                    ctx.drawImage(bgImage, x, 0, scaledWidth, canvasHeight);
                }
            };
            bgImage.onerror = () => {
                // Fallback to gradient if image fails to load
                const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
                gradient.addColorStop(0, '#87CEEB');
                gradient.addColorStop(1, '#B0D4F1');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvasWidth, canvasHeight);
            };
            bgImage.src = 'assets/images/FAA4CCA7-41BA-4745-A689-15D3DFDF36AA.jpeg?' + Date.now();

        } catch (error) {
            console.error('Error rendering start screen:', error);
        }
    }

    drawSimpleCloud(ctx, x, y, size) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.arc(x + size * 0.7, y, size * 0.8, 0, Math.PI * 2);
        ctx.arc(x + size * 1.4, y, size * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }

    drawSimpleBuilding(ctx, x, y, width, height, color) {
        // Building body
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);

        // Outline
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        // Windows
        const windowRows = Math.floor(height / 40);
        const windowCols = Math.floor(width / 35);
        for (let row = 0; row < windowRows; row++) {
            for (let col = 0; col < windowCols; col++) {
                const wx = x + 12 + (col * 35);
                const wy = y + 15 + (row * 40);
                ctx.fillStyle = Math.random() > 0.3 ? '#FFF5C8' : '#B0D4E8';
                ctx.fillRect(wx, wy, 16, 20);
            }
        }
    }

    drawSimpleTree(ctx, x, y, height) {
        const crownRadius = 15;
        // Trunk
        ctx.fillStyle = '#6B5244';
        ctx.fillRect(x - 4, y - height + crownRadius, 8, height - crownRadius);

        // Crown
        ctx.fillStyle = '#6B9B6E';
        ctx.beginPath();
        ctx.arc(x, y - height + crownRadius, crownRadius, 0, Math.PI * 2);
        ctx.fill();
    }

    drawSimpleTrafficLight(ctx, x, y) {
        // Pole
        ctx.fillStyle = '#333';
        ctx.fillRect(x + 17, y, 4, 120);

        // Box
        ctx.fillStyle = '#222';
        ctx.fillRect(x, y, 38, 90);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, 38, 90);

        // Red light (on)
        ctx.fillStyle = '#FF4444';
        ctx.beginPath();
        ctx.arc(x + 19, y + 15, 12, 0, Math.PI * 2);
        ctx.fill();

        // Amber light (off)
        ctx.fillStyle = '#664400';
        ctx.beginPath();
        ctx.arc(x + 19, y + 40, 12, 0, Math.PI * 2);
        ctx.fill();

        // Green light (off)
        ctx.fillStyle = '#003300';
        ctx.beginPath();
        ctx.arc(x + 19, y + 65, 12, 0, Math.PI * 2);
        ctx.fill();
    }
}
