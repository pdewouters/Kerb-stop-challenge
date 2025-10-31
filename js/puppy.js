/**
 * Puppy class for the Kerb Stop Challenge
 * Draws a cute puppy using canvas (inspired by CSS puppy art)
 */

class Puppy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 80;
        this.height = 60;
        this.speed = 2; // pixels per frame
        this.state = 'walking'; // walking, sitting, stopped

        // Animation
        this.frameTime = 0;
        this.frameIndex = 0;
        this.walkCycleSpeed = 0.15;

        // Sitting animation
        this.sitProgress = 0;
        this.sitSpeed = 0.1;

        // Color scheme (golden labrador)
        this.colorBody = '#FFD700';
        this.colorDark = '#DAA520';
        this.colorLight = '#FFF8DC';
        this.colorNose = '#8B4513';
        this.colorEye = '#000000';

        // Tail wag
        this.tailAngle = 0;
        this.tailSpeed = 0.2;
    }

    update(deltaTime = 1) {
        if (this.state === 'walking') {
            this.x += this.speed;
            this.frameTime += this.walkCycleSpeed;
            this.tailAngle += this.tailSpeed;
        } else if (this.state === 'sitting') {
            if (this.sitProgress < 1) {
                this.sitProgress += this.sitSpeed;
                if (this.sitProgress >= 1) {
                    this.sitProgress = 1;
                    this.state = 'stopped';
                }
            }
        }

        // Keep tail angle in range
        if (Math.abs(this.tailAngle) > 0.5) {
            this.tailSpeed = -this.tailSpeed;
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
        ctx.save();
        ctx.translate(this.x, this.y);

        // Apply sitting transformation
        const sitOffset = this.sitProgress * 15;

        if (this.state === 'walking' || this.state === 'sitting') {
            this.drawWalking(ctx, sitOffset);
        } else {
            this.drawSitting(ctx);
        }

        ctx.restore();
    }

    drawWalking(ctx, sitOffset) {
        const legOffset = Math.sin(this.frameTime) * 5;

        // Body
        ctx.fillStyle = this.colorBody;
        ctx.beginPath();
        ctx.ellipse(0, -20 + sitOffset, 30, 20, 0, 0, Math.PI * 2);
        ctx.fill();

        // Legs (animated)
        this.drawLeg(ctx, -15, 5 + sitOffset, legOffset);
        this.drawLeg(ctx, -5, 5 + sitOffset, -legOffset);
        this.drawLeg(ctx, 5, 5 + sitOffset, legOffset * 0.8);
        this.drawLeg(ctx, 15, 5 + sitOffset, -legOffset * 0.8);

        // Tail (wagging)
        this.drawTail(ctx, -28, -25 + sitOffset);

        // Head
        this.drawHead(ctx, 25, -25 + sitOffset * 0.5);
    }

    drawSitting(ctx) {
        // Body (lower and tilted)
        ctx.fillStyle = this.colorBody;
        ctx.beginPath();
        ctx.ellipse(0, -10, 30, 25, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Legs (sitting position)
        this.drawLeg(ctx, -12, 10, 0, true);
        this.drawLeg(ctx, 12, 10, 0, true);

        // Tail (on ground)
        this.drawTail(ctx, -25, -5);

        // Head (slightly forward)
        this.drawHead(ctx, 25, -20);

        // Happy expression
        this.drawHappyMouth(ctx, 30, -15);
    }

    drawLeg(ctx, x, y, offset, sitting = false) {
        ctx.save();
        ctx.fillStyle = this.colorBody;

        if (sitting) {
            // Sitting legs (bent)
            ctx.beginPath();
            ctx.ellipse(x, y, 8, 12, 0, 0, Math.PI * 2);
            ctx.fill();

            // Paw
            ctx.fillStyle = this.colorDark;
            ctx.beginPath();
            ctx.ellipse(x, y + 8, 6, 4, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Walking legs
            ctx.translate(x, y + offset);

            // Upper leg
            ctx.beginPath();
            ctx.ellipse(0, 0, 6, 12, 0, 0, Math.PI * 2);
            ctx.fill();

            // Paw
            ctx.fillStyle = this.colorDark;
            ctx.beginPath();
            ctx.ellipse(0, 10, 5, 6, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }

    drawTail(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(this.tailAngle);

        ctx.fillStyle = this.colorBody;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(-10, -5, -8, -15);
        ctx.quadraticCurveTo(-6, -12, 0, -10);
        ctx.closePath();
        ctx.fill();

        // Tail tip
        ctx.fillStyle = this.colorLight;
        ctx.beginPath();
        ctx.ellipse(-8, -15, 4, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawHead(ctx, x, y) {
        ctx.save();
        ctx.translate(x, y);

        // Head
        ctx.fillStyle = this.colorBody;
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Snout
        ctx.fillStyle = this.colorLight;
        ctx.beginPath();
        ctx.ellipse(8, 5, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Nose
        ctx.fillStyle = this.colorNose;
        ctx.beginPath();
        ctx.ellipse(12, 3, 4, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = this.colorEye;
        ctx.beginPath();
        ctx.arc(-2, -5, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(6, -5, 3, 0, Math.PI * 2);
        ctx.fill();

        // Eye shine
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-1, -6, 1.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(7, -6, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Ears (floppy)
        this.drawEar(ctx, -12, -8, -0.3);
        this.drawEar(ctx, 8, -8, 0.2);

        ctx.restore();
    }

    drawEar(ctx, x, y, rotation) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);

        // Outer ear
        ctx.fillStyle = this.colorDark;
        ctx.beginPath();
        ctx.ellipse(0, 0, 8, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner ear
        ctx.fillStyle = this.colorLight;
        ctx.beginPath();
        ctx.ellipse(0, 2, 5, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    drawHappyMouth(ctx, x, y) {
        ctx.save();
        ctx.strokeStyle = this.colorNose;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';

        // Smile curve
        ctx.beginPath();
        ctx.arc(x + 5, y, 5, 0.2, Math.PI - 0.2);
        ctx.stroke();

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
