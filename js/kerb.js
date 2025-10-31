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
        // Adjust zone sizes based on difficulty (made much more generous)
        if (this.difficulty === 1) {
            // Easy: Very large zones
            this.stopZoneSize = 150;
            this.perfectZoneSize = 50;
        } else if (this.difficulty === 2) {
            // Medium: Large zones
            this.stopZoneSize = 120;
            this.perfectZoneSize = 40;
        } else {
            // Hard: Medium zones
            this.stopZoneSize = 100;
            this.perfectZoneSize = 30;
        }

        // Zone boundaries - aligned with traffic light position (x - 60)
        const trafficLightX = this.x - 60;

        // Stop zone: wider area around traffic light
        this.stopZoneStart = trafficLightX - (this.stopZoneSize / 2);
        this.stopZoneEnd = trafficLightX + (this.stopZoneSize / 2);

        // Perfect zone: centered on traffic light
        this.perfectZoneStart = trafficLightX - (this.perfectZoneSize / 2);
        this.perfectZoneEnd = trafficLightX + (this.perfectZoneSize / 2);
    }

    update() {
        this.pulseTime += this.pulseSpeed;
    }

    draw(ctx, showZones = true, puppyX = 0) {
        // Adjust pavement height based on screen orientation and size
        // For small landscape screens (like iPhone landscape), move view closer to ground
        const isSmallLandscape = this.canvasWidth > this.canvasHeight && this.canvasHeight < 500;
        const pavementHeight = isSmallLandscape
            ? this.canvasHeight * 0.35  // 35% sky, 65% ground - closer to ground level
            : this.canvasHeight * 0.6;   // 60% sky, 40% ground - normal view
        const roadHeight = this.canvasHeight - pavementHeight;

        // Update background offset based on puppy movement (parallax scrolling)
        this.backgroundOffset = puppyX * 0.3; // Buildings move slower than puppy

        // Draw sky/buildings background
        this.drawBackground(ctx, pavementHeight);

        // Draw pavement (left side) with better color
        const pavementGradient = ctx.createLinearGradient(0, pavementHeight, 0, this.canvasHeight);
        pavementGradient.addColorStop(0, '#D3D3D3');
        pavementGradient.addColorStop(1, '#BEBEBE');
        ctx.fillStyle = pavementGradient;
        ctx.fillRect(0, pavementHeight, this.x, this.canvasHeight - pavementHeight);

        // Pavement texture (subtle paving slabs)
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 2;
        const slabWidth = 60;
        const slabHeight = 40;

        // Draw horizontal lines (slab rows)
        for (let y = pavementHeight; y < this.canvasHeight; y += slabHeight) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.x, y);
            ctx.stroke();
        }

        // Draw vertical lines (offset every other row for realistic paving)
        for (let y = pavementHeight; y < this.canvasHeight; y += slabHeight) {
            const offset = (Math.floor((y - pavementHeight) / slabHeight) % 2) * (slabWidth / 2);
            for (let x = offset; x < this.x; x += slabWidth) {
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, Math.min(y + slabHeight, this.canvasHeight));
                ctx.stroke();
            }
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
        // Building heights are proportional to available sky space
        const maxBuildingHeight = pavementHeight * 0.7; // Buildings use 70% of sky space
        const baseBuildings = [
            { x: 50, width: 120, heightRatio: 0.6, color: '#B85450', type: 'brick' },
            { x: 180, width: 30, heightRatio: 0.4, type: 'tree' }, // Tree between buildings
            { x: 220, width: 100, heightRatio: 0.8, color: '#C67B5C', type: 'brick' },
            { x: 330, width: 90, heightRatio: 0.5, color: '#D4A574', type: 'stone' },
            { x: 430, width: 25, heightRatio: 0.35, type: 'tree' },
            { x: 465, width: 110, heightRatio: 0.7, color: '#A8483F', type: 'brick' },
            { x: 585, width: 95, heightRatio: 0.65, color: '#D9C2A3', type: 'stone' },
        ].map(b => ({ ...b, height: maxBuildingHeight * b.heightRatio }));

        // Total width of building pattern
        const patternWidth = 700;

        // Draw buildings and trees multiple times to create seamless scrolling
        for (let offset = -patternWidth; offset < this.canvasWidth + patternWidth; offset += patternWidth) {
            baseBuildings.forEach(element => {
                // Apply parallax offset (wrap around)
                const scrolledX = (element.x + offset - this.backgroundOffset) % (patternWidth * 2);
                const finalX = scrolledX + (scrolledX < -patternWidth ? patternWidth * 2 : 0);

                // Only draw if visible on screen
                if (finalX > -element.width && finalX < this.canvasWidth + element.width) {
                    if (element.type === 'tree') {
                        this.drawTree(ctx, finalX, pavementHeight, element);
                    } else {
                        this.drawBuilding(ctx, finalX, pavementHeight, element);
                    }
                }
            });
        }

        // Add some clouds (slower parallax)
        const cloudOffset = this.backgroundOffset * 0.15;
        this.drawCloud(ctx, (150 - cloudOffset) % (this.canvasWidth + 200), 50);
        this.drawCloud(ctx, (450 - cloudOffset) % (this.canvasWidth + 200), 80);
        this.drawCloud(ctx, (700 - cloudOffset) % (this.canvasWidth + 200), 60);
    }

    // Draw a single building with brick texture
    drawBuilding(ctx, x, pavementHeight, building) {
        const buildingTop = pavementHeight - building.height;

        // Building body with base color
        ctx.fillStyle = building.color;
        ctx.fillRect(x, buildingTop, building.width, building.height);

        // Add brick or stone texture
        if (building.type === 'brick') {
            this.drawBrickTexture(ctx, x, buildingTop, building.width, building.height, building.color);
        } else if (building.type === 'stone') {
            this.drawStoneTexture(ctx, x, buildingTop, building.width, building.height, building.color);
        }

        // Building outline
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, buildingTop, building.width, building.height);

        // Windows with frames
        const windowRows = Math.floor(building.height / 40);
        const windowCols = Math.floor(building.width / 35);
        for (let row = 0; row < windowRows; row++) {
            for (let col = 0; col < windowCols; col++) {
                const wx = x + 12 + (col * 35);
                const wy = buildingTop + 15 + (row * 40);

                // Window frame (darker)
                ctx.fillStyle = 'rgba(80, 60, 40, 0.6)';
                ctx.fillRect(wx - 2, wy - 2, 20, 24);

                // Window glass (light blue/yellow)
                const isLit = Math.random() > 0.3;
                ctx.fillStyle = isLit ? '#FFF5C8' : '#B0D4E8';
                ctx.fillRect(wx, wy, 16, 20);

                // Window panes
                ctx.strokeStyle = 'rgba(80, 60, 40, 0.4)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(wx + 8, wy);
                ctx.lineTo(wx + 8, wy + 20);
                ctx.moveTo(wx, wy + 10);
                ctx.lineTo(wx + 16, wy + 10);
                ctx.stroke();
            }
        }
    }

    // Draw brick texture
    drawBrickTexture(ctx, x, y, width, height, baseColor) {
        const brickWidth = 12;
        const brickHeight = 6;

        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 1;

        // Draw horizontal mortar lines
        for (let by = 0; by < height; by += brickHeight) {
            ctx.beginPath();
            ctx.moveTo(x, y + by);
            ctx.lineTo(x + width, y + by);
            ctx.stroke();

            // Draw vertical mortar lines (offset every other row)
            const offset = (Math.floor(by / brickHeight) % 2) * (brickWidth / 2);
            for (let bx = offset; bx < width; bx += brickWidth) {
                ctx.beginPath();
                ctx.moveTo(x + bx, y + by);
                ctx.lineTo(x + bx, y + by + brickHeight);
                ctx.stroke();
            }
        }
    }

    // Draw stone texture
    drawStoneTexture(ctx, x, y, width, height, baseColor) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;

        // Draw random stone blocks
        const blockSize = 20;
        for (let sy = 0; sy < height; sy += blockSize) {
            for (let sx = 0; sx < width; sx += blockSize) {
                ctx.strokeRect(x + sx, y + sy, blockSize, blockSize);
            }
        }
    }

    // Draw a tree
    drawTree(ctx, x, pavementHeight, tree) {
        const treeBottom = pavementHeight;
        const treeTop = treeBottom - tree.height;
        const trunkWidth = 8;
        const crownRadius = tree.width / 2;

        // Tree trunk
        ctx.fillStyle = '#6B5244';
        ctx.fillRect(x + crownRadius - trunkWidth/2, treeTop + crownRadius, trunkWidth, tree.height - crownRadius);

        // Tree crown (foliage) - layered circles for depth
        const crownY = treeTop + crownRadius;

        // Shadow layer (darker green)
        ctx.fillStyle = '#4A7C59';
        ctx.beginPath();
        ctx.arc(x + crownRadius, crownY + 3, crownRadius - 2, 0, Math.PI * 2);
        ctx.fill();

        // Main layer
        ctx.fillStyle = '#6B9B6E';
        ctx.beginPath();
        ctx.arc(x + crownRadius, crownY, crownRadius, 0, Math.PI * 2);
        ctx.fill();

        // Highlight layer (lighter green)
        ctx.fillStyle = '#8FBC8F';
        ctx.beginPath();
        ctx.arc(x + crownRadius - 3, crownY - 3, crownRadius - 4, 0, Math.PI * 2);
        ctx.fill();
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
        } else if (puppyX < this.stopZoneStart) {
            return 'too-early';
        } else {
            return 'too-late';
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
            case 'too-early':
                score = 0;
                message = 'Too Early! ✗';
                break;
            case 'too-late':
                score = 0;
                message = 'Too Late! ✗';
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
        // Moved closer (more left) for better balance between pavement and road
        const kerbPositions = [
            { x: 500, difficulty: 1 },   // Kerb 1
            { x: 500, difficulty: 1 },   // Kerb 2
            { x: 500, difficulty: 1 },   // Kerb 3
            { x: 520, difficulty: 2 },   // Kerb 4
            { x: 520, difficulty: 2 },   // Kerb 5
            { x: 520, difficulty: 2 },   // Kerb 6
            { x: 520, difficulty: 2 },   // Kerb 7
            { x: 550, difficulty: 3 },   // Kerb 8
            { x: 550, difficulty: 3 },   // Kerb 9
            { x: 550, difficulty: 3 }    // Kerb 10
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
