/**
 * Kerb class for the Kerb Stop Challenge
 * Manages kerb rendering and stop zone detection
 */

class Kerb {
    constructor(x, canvasWidth, canvasHeight, difficulty = 1) {
        this.x = x;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.difficulty = difficulty;

        // Stop zone configuration based on difficulty
        this.configureZones();

        // Visual properties
        this.kerbHeight = 15;
        this.kerbWidth = 10;

        // Colors
        this.colorPavement = '#C0C0C0';
        this.colorRoad = '#4A4A4A';
        this.colorKerbEdge = '#FFFF00';
        this.colorStopZone = 'rgba(76, 175, 80, 0.3)';
        this.colorPerfectZone = 'rgba(76, 175, 80, 0.5)';

        // Animation for visual feedback
        this.pulseTime = 0;
        this.pulseSpeed = 0.05;

        // Parallax scrolling
        this.backgroundOffset = 0;
    }

    configureZones() {
        // Adjust zone sizes based on difficulty
        if (this.difficulty === 1) {
            // Easy: Large zones
            this.stopZoneSize = 80;
            this.perfectZoneSize = 30;
        } else if (this.difficulty === 2) {
            // Medium: Medium zones
            this.stopZoneSize = 60;
            this.perfectZoneSize = 20;
        } else {
            // Hard: Small zones
            this.stopZoneSize = 50;
            this.perfectZoneSize = 15;
        }

        // Zone boundaries (relative to kerb position)
        this.stopZoneStart = this.x - this.stopZoneSize;
        this.stopZoneEnd = this.x;
        this.perfectZoneStart = this.x - this.perfectZoneSize;
        this.perfectZoneEnd = this.x;
    }

    update() {
        this.pulseTime += this.pulseSpeed;
    }

    draw(ctx, showZones = true, puppyX = 0) {
        const roadHeight = this.canvasHeight * 0.5;
        const pavementHeight = this.canvasHeight - roadHeight;

        // Update background offset based on puppy movement (parallax scrolling)
        this.backgroundOffset = puppyX * 0.3; // Buildings move slower than puppy

        // Draw sky/buildings background
        this.drawBackground(ctx, pavementHeight);

        // Draw pavement (left side)
        ctx.fillStyle = this.colorPavement;
        ctx.fillRect(0, pavementHeight, this.x, this.canvasHeight - pavementHeight);

        // Pavement texture (simple grid)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        const gridSize = 30;
        for (let x = 0; x < this.x; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, pavementHeight);
            ctx.lineTo(x, this.canvasHeight);
            ctx.stroke();
        }
        for (let y = pavementHeight; y < this.canvasHeight; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.x, y);
            ctx.stroke();
        }

        // Draw road (right side)
        ctx.fillStyle = this.colorRoad;
        ctx.fillRect(this.x, pavementHeight, this.canvasWidth - this.x, this.canvasHeight - pavementHeight);

        // Road center line
        ctx.setLineDash([20, 10]);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x + (this.canvasWidth - this.x) / 2, pavementHeight);
        ctx.lineTo(this.x + (this.canvasWidth - this.x) / 2, this.canvasHeight);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw kerb edge
        this.drawKerbEdge(ctx, pavementHeight);

        // Draw traffic light near kerb
        this.drawTrafficLight(ctx, this.x - 60, pavementHeight - 120);

        // Draw stop zones (if showing)
        if (showZones) {
            this.drawStopZones(ctx, pavementHeight);
        }
    }

    drawKerbEdge(ctx, pavementHeight) {
        // Kerb edge (yellow/white painted edge)
        ctx.fillStyle = this.colorKerbEdge;
        ctx.fillRect(this.x - this.kerbWidth / 2, pavementHeight - 5, this.kerbWidth, 5);

        // Kerb drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(this.x, pavementHeight, this.kerbWidth, this.kerbHeight);

        // Kerb face (side of kerb)
        const gradient = ctx.createLinearGradient(this.x, pavementHeight, this.x + this.kerbWidth, pavementHeight);
        gradient.addColorStop(0, '#E0E0E0');
        gradient.addColorStop(1, '#A0A0A0');
        ctx.fillStyle = gradient;
        ctx.fillRect(this.x, pavementHeight, this.kerbWidth, this.kerbHeight);
    }

    drawStopZones(ctx, pavementHeight) {
        const zoneTop = 0;
        const zoneBottom = pavementHeight;
        const pulse = Math.sin(this.pulseTime) * 0.2 + 0.8;

        // Good stop zone
        ctx.fillStyle = this.colorStopZone;
        ctx.globalAlpha = 0.3 * pulse;
        ctx.fillRect(this.stopZoneStart, zoneTop, this.stopZoneSize, zoneBottom);

        // Perfect stop zone (darker/brighter)
        ctx.fillStyle = this.colorPerfectZone;
        ctx.globalAlpha = 0.4 * pulse;
        ctx.fillRect(this.perfectZoneStart, zoneTop, this.perfectZoneSize, zoneBottom);

        ctx.globalAlpha = 1.0;

        // Zone indicators
        this.drawZoneIndicator(ctx, this.stopZoneStart, zoneBottom, 'STOP ZONE', '#4CAF50');
        this.drawZoneIndicator(ctx, this.perfectZoneStart, zoneBottom + 30, 'PERFECT', '#2E7D32');
    }

    drawZoneIndicator(ctx, x, y, text, color) {
        ctx.save();

        // Arrow pointing down
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x - 10, y - 15);
        ctx.lineTo(x + 10, y - 15);
        ctx.closePath();
        ctx.fill();

        // Text
        ctx.fillStyle = color;
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, x, y - 20);

        ctx.restore();
    }

    // Draw background with buildings and sky (with parallax scrolling)
    drawBackground(ctx, pavementHeight) {
        // Sky gradient
        const skyGradient = ctx.createLinearGradient(0, 0, 0, pavementHeight);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(1, '#B0D4F1');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.canvasWidth, pavementHeight);

        // Draw buildings in background with parallax scrolling
        const baseBuildings = [
            { x: 50, width: 120, height: 180, color: '#8B7355' },
            { x: 180, width: 100, height: 220, color: '#A0826D' },
            { x: 290, width: 90, height: 160, color: '#967259' },
            { x: 390, width: 110, height: 200, color: '#8B7355' },
            { x: 510, width: 95, height: 175, color: '#A0826D' },
        ];

        // Total width of building pattern
        const patternWidth = 650;

        // Draw buildings multiple times to create seamless scrolling
        for (let offset = -patternWidth; offset < this.canvasWidth + patternWidth; offset += patternWidth) {
            baseBuildings.forEach(building => {
                // Apply parallax offset (wrap around)
                const scrolledX = (building.x + offset - this.backgroundOffset) % (patternWidth * 2);
                const finalX = scrolledX + (scrolledX < -patternWidth ? patternWidth * 2 : 0);

                // Only draw if visible on screen
                if (finalX > -building.width && finalX < this.canvasWidth + building.width) {
                    this.drawBuilding(ctx, finalX, pavementHeight, building);
                }
            });
        }

        // Add some clouds (slower parallax)
        const cloudOffset = this.backgroundOffset * 0.15;
        this.drawCloud(ctx, (150 - cloudOffset) % (this.canvasWidth + 200), 50);
        this.drawCloud(ctx, (450 - cloudOffset) % (this.canvasWidth + 200), 80);
        this.drawCloud(ctx, (700 - cloudOffset) % (this.canvasWidth + 200), 60);
    }

    // Draw a single building
    drawBuilding(ctx, x, pavementHeight, building) {
        const buildingTop = pavementHeight - building.height;

        // Building body
        ctx.fillStyle = building.color;
        ctx.fillRect(x, buildingTop, building.width, building.height);

        // Building outline
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, buildingTop, building.width, building.height);

        // Windows
        ctx.fillStyle = '#FFE4B5';
        const windowRows = Math.floor(building.height / 35);
        const windowCols = Math.floor(building.width / 30);
        for (let row = 0; row < windowRows; row++) {
            for (let col = 0; col < windowCols; col++) {
                const wx = x + 10 + (col * 30);
                const wy = buildingTop + 10 + (row * 35);
                ctx.fillRect(wx, wy, 15, 20);
            }
        }

        // Roof
        ctx.fillStyle = '#6B4423';
        ctx.beginPath();
        ctx.moveTo(x - 5, buildingTop);
        ctx.lineTo(x + building.width / 2, buildingTop - 20);
        ctx.lineTo(x + building.width + 5, buildingTop);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    // Draw a simple cloud
    drawCloud(ctx, x, y) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
        ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    // Draw traffic light
    drawTrafficLight(ctx, x, y) {
        // Pole
        ctx.fillStyle = '#4A4A4A';
        ctx.fillRect(x + 15, y + 80, 8, 120);

        // Traffic light box
        ctx.fillStyle = '#2C2C2C';
        ctx.fillRect(x, y, 38, 80);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, 38, 80);

        // Lights (red, amber, green from top to bottom)
        // Red light (on for "stop")
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(x + 19, y + 15, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#8B0000';
        ctx.lineWidth = 1;
        ctx.stroke();

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

    // Check if position is in stop zone
    checkStopZone(puppyX) {
        if (puppyX >= this.perfectZoneStart && puppyX <= this.perfectZoneEnd) {
            return 'perfect';
        } else if (puppyX >= this.stopZoneStart && puppyX <= this.stopZoneEnd) {
            return 'good';
        } else {
            return 'miss';
        }
    }

    // Check if puppy passed the kerb
    hasPassed(puppyX) {
        return puppyX > this.x + 50;
    }

    // Get stop quality and score
    getStopQuality(puppyX) {
        const quality = this.checkStopZone(puppyX);
        let score = 0;
        let message = '';

        switch (quality) {
            case 'perfect':
                score = 10;
                message = 'Perfect Stop! ⭐';
                break;
            case 'good':
                score = 5;
                message = 'Good Stop! ✓';
                break;
            case 'miss':
                score = 0;
                message = 'Too Early! ✗';
                break;
        }

        return { quality, score, message };
    }
}

/**
 * Manages multiple kerbs and progression
 */
class KerbManager {
    constructor(canvasWidth, canvasHeight) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.currentKerbIndex = 0;
        this.totalKerbs = 10;
        this.kerbs = [];

        this.generateKerbs();
    }

    generateKerbs() {
        // Generate 10 kerbs with increasing difficulty
        const kerbPositions = [
            { x: 800, difficulty: 1 },   // Kerb 1
            { x: 800, difficulty: 1 },   // Kerb 2
            { x: 800, difficulty: 1 },   // Kerb 3
            { x: 850, difficulty: 2 },   // Kerb 4
            { x: 850, difficulty: 2 },   // Kerb 5
            { x: 850, difficulty: 2 },   // Kerb 6
            { x: 850, difficulty: 2 },   // Kerb 7
            { x: 900, difficulty: 3 },   // Kerb 8
            { x: 900, difficulty: 3 },   // Kerb 9
            { x: 900, difficulty: 3 }    // Kerb 10
        ];

        this.kerbs = kerbPositions.map(config =>
            new Kerb(config.x, this.canvasWidth, this.canvasHeight, config.difficulty)
        );
    }

    getCurrentKerb() {
        return this.kerbs[this.currentKerbIndex];
    }

    nextKerb() {
        this.currentKerbIndex++;
        return this.currentKerbIndex < this.totalKerbs;
    }

    reset() {
        this.currentKerbIndex = 0;
    }

    isComplete() {
        return this.currentKerbIndex >= this.totalKerbs;
    }

    getProgress() {
        return {
            current: this.currentKerbIndex + 1,
            total: this.totalKerbs,
            percentage: ((this.currentKerbIndex + 1) / this.totalKerbs) * 100
        };
    }
}
