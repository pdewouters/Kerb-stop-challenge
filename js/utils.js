/**
 * Utility functions for the Kerb Stop Challenge game
 */

// Helper function to get a random number between min and max
function randomRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Helper function to get a random integer between min and max (inclusive)
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Linear interpolation
function lerp(start, end, t) {
    return start + (end - start) * t;
}

// Easing function for smooth animations
function easeOutQuad(t) {
    return t * (2 - t);
}

function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// Clamp a value between min and max
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

// Check if point is in rectangle
function pointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
}

// Format score with leading zeros
function formatScore(score) {
    return score.toString().padStart(3, '0');
}

// Prevent default touch behaviors
function preventDefaultTouch(e) {
    e.preventDefault();
}

// Setup touch controls
function setupTouchControls() {
    document.addEventListener('touchmove', preventDefaultTouch, { passive: false });
    document.addEventListener('gesturestart', preventDefaultTouch);
    document.addEventListener('gesturechange', preventDefaultTouch);
    document.addEventListener('gestureend', preventDefaultTouch);
}

// Get canvas scale for touch coordinates
function getTouchPos(canvas, touchEvent) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
        x: (touchEvent.touches[0].clientX - rect.left) * scaleX,
        y: (touchEvent.touches[0].clientY - rect.top) * scaleY
    };
}

// Local storage helpers
const Storage = {
    getHighScore() {
        return parseInt(localStorage.getItem('kerbChallenge_highScore') || '0');
    },

    setHighScore(score) {
        const currentHigh = this.getHighScore();
        if (score > currentHigh) {
            localStorage.setItem('kerbChallenge_highScore', score.toString());
            return true; // New high score
        }
        return false;
    },

    getMuted() {
        return localStorage.getItem('kerbChallenge_muted') === 'true';
    },

    setMuted(muted) {
        localStorage.setItem('kerbChallenge_muted', muted.toString());
    }
};

// Screen management
const ScreenManager = {
    currentScreen: null,

    show(screenId) {
        // Hide current screen
        if (this.currentScreen) {
            this.currentScreen.classList.remove('active');
        }

        // Show new screen
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screen;
        }
    },

    hide(screenId) {
        const screen = document.getElementById(screenId);
        if (screen) {
            screen.classList.remove('active');
        }
    }
};

// Modal management
const ModalManager = {
    show(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    },

    hide(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
};

// Confetti effect using canvas
class ConfettiParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = randomRange(-5, 5);
        this.vy = randomRange(-10, -5);
        this.gravity = 0.3;
        this.size = randomRange(4, 8);
        this.color = this.randomColor();
        this.rotation = randomRange(0, Math.PI * 2);
        this.rotationSpeed = randomRange(-0.1, 0.1);
        this.life = 1.0;
        this.decay = randomRange(0.01, 0.02);
    }

    randomColor() {
        const colors = ['#FFB84D', '#FF9A3D', '#667eea', '#764ba2', '#4CAF50', '#2196F3', '#f44336'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.vy += this.gravity;
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        this.life -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

class ConfettiSystem {
    constructor() {
        this.particles = [];
    }

    burst(x, y, count = 30) {
        for (let i = 0; i < count; i++) {
            this.particles.push(new ConfettiParticle(x, y));
        }
    }

    update() {
        this.particles.forEach(p => p.update());
        this.particles = this.particles.filter(p => !p.isDead());
    }

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }

    isActive() {
        return this.particles.length > 0;
    }
}

// Share functionality
const ShareManager = {
    gameUrl: window.location.href,

    getShareText(score) {
        return `I just helped train a guide dog and scored ${score}/100 on the Kerb Stop Challenge! 🐕‍🦺\n\nEvery guide dog costs £56k to train. Can you beat my score and help support @guidedogs?`;
    },

    shareTwitter(score) {
        const text = this.getShareText(score);
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(this.gameUrl)}`;
        window.open(url, '_blank', 'noopener');
    },

    shareFacebook() {
        const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(this.gameUrl)}`;
        window.open(url, '_blank', 'noopener');
    },

    shareWhatsApp(score) {
        const text = this.getShareText(score);
        const url = `https://wa.me/?text=${encodeURIComponent(text + '\n' + this.gameUrl)}`;
        window.open(url, '_blank', 'noopener');
    },

    async copyLink() {
        try {
            await navigator.clipboard.writeText(this.gameUrl);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = this.gameUrl;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                document.body.removeChild(textArea);
                return true;
            } catch (err) {
                document.body.removeChild(textArea);
                return false;
            }
        }
    }
};
