/**
 * Puppy class for the Kerb Stop Challenge
 * Uses custom Labrador image
 */

class Puppy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 100;
        this.height = 80;
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
            'assets/images/28599.jpg',
            './assets/images/28599.jpg',
            '/Kerb-stop-challenge/assets/images/28599.jpg', // GitHub Pages path
        ];

        this.image.onload = () => {
            this.imageLoaded = true;
            console.log('✅ Puppy image loaded successfully from:', this.image.src);
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

        // Fallback colors (if image fails) - BRIGHT and visible!
        this.colorBody = '#FFD700'; // Bright gold
        this.colorDark = '#FF6B00'; // Bright orange
        this.colorLight = '#FFFFFF';
    }

    update(deltaTime = 1) {
        if (this.state === 'walking') {
            this.x += this.speed;
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
        // DEBUG: Always draw a bright test circle to verify rendering works
        ctx.save();
        ctx.fillStyle = 'rgba(255, 0, 255, 0.5)'; // Bright magenta debug circle
        ctx.beginPath();
        ctx.arc(this.x, this.y, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Draw status text for debugging
        ctx.save();
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`Dog at: ${Math.round(this.x)}, ${Math.round(this.y)}`, 10, 100);
        ctx.fillText(`Image loaded: ${this.imageLoaded}`, 10, 120);
        ctx.fillText(`State: ${this.state}`, 10, 140);
        ctx.restore();

        if (!this.imageLoaded) {
            // Draw a simple placeholder while image loads
            this.drawPlaceholder(ctx);
            return;
        }

        ctx.save();
        ctx.translate(this.x, this.y);

        // Calculate scale and position based on state
        let scale = 1.0;
        let yOffset = 0;
        let cropBottom = 0; // How much to crop from bottom (for "Labrador" text)

        if (this.state === 'walking' || this.state === 'sitting') {
            // Walking: slight bounce
            yOffset = this.bounceOffset;

            // During sitting transition, lower the dog
            yOffset += this.sitProgress * 10;
        } else if (this.state === 'stopped') {
            // Sitting: lower position
            yOffset = 10;
        }

        // Crop the "Labrador" text from bottom (roughly 15% of image)
        const cropHeight = this.image.height * 0.85;

        // Draw the image
        const drawWidth = this.width;
        const drawHeight = (cropHeight / this.image.width) * drawWidth;

        ctx.drawImage(
            this.image,
            0, 0,  // Source x, y
            this.image.width, cropHeight,  // Source width, height (crop bottom)
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
