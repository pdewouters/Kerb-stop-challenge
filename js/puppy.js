/**
 * Puppy class for the Kerb Stop Challenge
 * Uses custom Labrador image
 */

class Puppy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 120; // Slightly bigger for the nice PNG
        this.height = 100;
        this.speed = 2; // pixels per frame
        this.state = 'walking'; // walking, sitting, stopped

        // Animation
        this.frameTime = 0;
        this.frameIndex = 0;
        this.walkCycleSpeed = 0.15;

        // Sitting animation
        this.sitProgress = 0;
        this.sitSpeed = 0.1;

        // Bounce animation for walking
        this.bounceOffset = 0;

        // Image
        this.image = new Image();
        this.imageLoaded = false;
        this.imageAttempts = 0;
        this.imagePaths = [
            'assets/images/dog.png',
            './assets/images/dog.png',
            '/Kerb-stop-challenge/assets/images/dog.png', // GitHub Pages path
        ];

        this.image.onload = () => {
            this.imageLoaded = true;
            console.log('✅ Puppy image loaded successfully from:', this.image.src);

            // Once walking image loads, try sitting image from same path
            const sittingPath = this.imagePaths[this.imageAttempts].replace('dog.png', 'dog-sitting.png');
            this.imageSitting.src = sittingPath;
            console.log('📸 Loading sitting image from:', sittingPath);
        };

        this.image.onerror = (err) => {
            console.error('❌ Failed to load puppy image from:', this.image.src);
            this.imageAttempts++;

            // Try next path
            if (this.imageAttempts < this.imagePaths.length) {
                console.log('🔄 Trying alternate path...');
                this.image.src = this.imagePaths[this.imageAttempts];
            } else {
                console.error('❌ All image paths failed. Using placeholder.');
                this.imageLoaded = false;
            }
        };

        // Start loading with first path
        this.image.src = this.imagePaths[0];
        console.log('📸 Loading puppy image from:', this.image.src);

        // Optional sitting image (progressive enhancement)
        this.imageSitting = new Image();
        this.imageSittingLoaded = false;
        this.imageSitting.onload = () => {
            this.imageSittingLoaded = true;
            console.log('✅ Sitting puppy image loaded (optional)');
        };
        this.imageSitting.onerror = () => {
            console.log('ℹ️ Sitting image not available, will use walking image for all states');
            this.imageSittingLoaded = false;
        };
        // Sitting image source will be set once walking image loads successfully

        // Fallback colors (if image fails) - BRIGHT and visible!
        this.colorBody = '#FFD700'; // Bright gold
        this.colorDark = '#FF6B00'; // Bright orange
        this.colorLight = '#FFFFFF';
    }

    update(deltaTime = 1) {
        // Puppy stays at fixed position - only animate in place
        if (this.state === 'walking') {
            // No more this.x += this.speed; - puppy stays fixed!
            this.frameTime += this.walkCycleSpeed;

            // Bounce animation for walking
            this.bounceOffset = Math.sin(this.frameTime) * 3;
        } else if (this.state === 'sitting') {
            if (this.sitProgress < 1) {
                this.sitProgress += this.sitSpeed;
                if (this.sitProgress >= 1) {
                    this.sitProgress = 1;
                    this.state = 'stopped';
                }
            }
        }
    }

    stop() {
        this.state = 'sitting';
        this.sitProgress = 0;
        this.frameTime = 0;
    }

    reset() {
        this.state = 'walking';
        this.sitProgress = 0;
        this.frameTime = 0;
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    // Draw the puppy on canvas
    draw(ctx) {
        if (!this.imageLoaded) {
            // Draw a simple placeholder while image loads
            this.drawPlaceholder(ctx);
            return;
        }

        ctx.save();
        ctx.translate(this.x, this.y);

        // Calculate position and image based on state
        let yOffset = 0;
        let currentImage = this.image; // Default to walking image

        if (this.state === 'walking') {
            // Walking: use walking image with bounce
            currentImage = this.image;
            yOffset = this.bounceOffset;
        } else if (this.state === 'sitting') {
            // Transitioning to sitting
            yOffset = this.bounceOffset + (this.sitProgress * 10);
            // Switch to sitting image halfway through transition (if available)
            if (this.sitProgress >= 0.5 && this.imageSittingLoaded) {
                currentImage = this.imageSitting;
            }
        } else if (this.state === 'stopped') {
            // Fully stopped: use sitting image if available, otherwise walking image
            currentImage = this.imageSittingLoaded ? this.imageSitting : this.image;
            yOffset = 10;
        }

        // Draw the appropriate image
        const drawWidth = this.width;
        const drawHeight = (currentImage.height / currentImage.width) * drawWidth;

        ctx.drawImage(
            currentImage,
            -drawWidth / 2, -drawHeight / 2 + yOffset,  // Dest x, y (centered)
            drawWidth, drawHeight  // Dest width, height
        );

        ctx.restore();
    }

    // Placeholder while image loads or if it fails
    drawPlaceholder(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Calculate position based on state
        let yOffset = 0;
        if (this.state === 'walking' || this.state === 'sitting') {
            yOffset = this.bounceOffset;
            yOffset += this.sitProgress * 10;
        } else if (this.state === 'stopped') {
            yOffset = 10;
        }

        ctx.translate(0, yOffset);

        // Simple dog shape - body
        ctx.fillStyle = this.colorBody;
        ctx.beginPath();
        ctx.ellipse(0, -10, 35, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        ctx.beginPath();
        ctx.ellipse(25, -15, 15, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs
        ctx.fillStyle = this.colorDark;
        ctx.fillRect(-10, 5, 8, 15);
        ctx.fillRect(10, 5, 8, 15);

        // Ear
        ctx.beginPath();
        ctx.ellipse(18, -20, 6, 10, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(28, -17, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    // Get collision box for kerb detection
    getCollisionBox() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height,
            centerX: this.x
        };
    }

    // Check if puppy's center is in a zone
    isInZone(zoneStart, zoneEnd) {
        const center = this.x;
        return center >= zoneStart && center <= zoneEnd;
    }
}
