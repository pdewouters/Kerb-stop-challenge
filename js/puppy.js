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
        this.image.onload = () => {
            this.imageLoaded = true;
            console.log('✅ Puppy image loaded successfully!');
        };
        this.image.onerror = (err) => {
            console.error('❌ Failed to load puppy image from:', this.image.src);
            console.error('Error:', err);
            this.imageLoaded = false;
        };
        this.image.src = 'assets/images/28599.jpg';
        console.log('📸 Loading puppy image from:', this.image.src);

        // Fallback colors (if image fails)
        this.colorBody = '#E8C39E';
        this.colorDark = '#C5A572';
        this.colorLight = '#FFF8DC';
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

    // Placeholder while image loads
    drawPlaceholder(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Simple dog shape placeholder
        ctx.fillStyle = this.colorBody;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Add "Loading..." text
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🐕', 0, 5);

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
