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

        // Images - walking and sitting
        this.imageWalking = new Image();
        this.imageSitting = new Image();
        this.imagesLoaded = 0;

        // Load walking image
        this.imageWalking.onload = () => {
            this.imagesLoaded++;
            console.log('✅ Walking puppy image loaded');
        };
        this.imageWalking.onerror = () => {
            console.error('❌ Failed to load walking puppy image');
        };

        // Load sitting image
        this.imageSitting.onload = () => {
            this.imagesLoaded++;
            console.log('✅ Sitting puppy image loaded');
        };
        this.imageSitting.onerror = () => {
            console.error('❌ Failed to load sitting puppy image');
        };

        // Try multiple paths for each image
        const basePaths = [
            'assets/images/',
            './assets/images/',
            '/Kerb-stop-challenge/assets/images/'
        ];

        // Start loading both images (try first path)
        this.imageWalking.src = basePaths[0] + 'dog.png';
        this.imageSitting.src = basePaths[0] + 'dog-sitting.png';

        console.log('📸 Loading dog images...');

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
        if (this.imagesLoaded < 2) {
            // Draw a simple placeholder while images load
            this.drawPlaceholder(ctx);
            return;
        }

        ctx.save();
        ctx.translate(this.x, this.y);

        // Calculate position based on state
        let yOffset = 0;
        let currentImage;

        if (this.state === 'walking') {
            // Walking: use walking image with bounce
            currentImage = this.imageWalking;
            yOffset = this.bounceOffset;
        } else if (this.state === 'sitting') {
            // Transitioning to sitting: blend between images
            currentImage = this.sitProgress < 0.5 ? this.imageWalking : this.imageSitting;
            yOffset = this.sitProgress * 10;
        } else if (this.state === 'stopped') {
            // Fully stopped: use sitting image
            currentImage = this.imageSitting;
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
