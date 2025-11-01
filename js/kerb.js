/**
 * Kerb class for the Kerb Stop Challenge - Continuous Scrolling Version
 * The world scrolls right-to-left while the dog stays fixed at bottom of screen
 */

class Kerb {
    constructor(canvasWidth, canvasHeight, difficulty = 1) {
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.difficulty = difficulty;

        // Continuous scrolling world offset
        this.worldOffset = 0;

        // Redesigned pattern: mostly buildings/street, with occasional intersection gaps
        this.streetSectionWidth = 800;  // Normal street with buildings
        this.intersectionWidth = 300;   // Gap for crossing (with traffic light)
        this.patternWidth = this.streetSectionWidth + this.intersectionWidth;  // Total = 1100px

        // Track if player has passed an intersection without stopping
        this.lastCheckedIntersection = -1;
        this.intersectionPassed = false;

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
    }

    configureZones() {
        // Adjust zone sizes based on difficulty
        if (this.difficulty === 1) {
            this.stopZoneSize = 150;
            this.perfectZoneSize = 50;
        } else if (this.difficulty === 2) {
            this.stopZoneSize = 120;
            this.perfectZoneSize = 40;
        } else {
            this.stopZoneSize = 100;
            this.perfectZoneSize = 30;
        }

        // Traffic light is in the middle of the intersection gap
        this.trafficLightOffsetInPattern = this.streetSectionWidth + (this.intersectionWidth / 2);
    }

    update(speed) {
        this.pulseTime += this.pulseSpeed;
        // Update world offset - world scrolls right to left
        this.worldOffset += speed;
    }

    // Check if player missed a traffic light without stopping
    checkMissedStop(puppyX, isPuppyWalking) {
        if (!isPuppyWalking) return false;

        const puppyWorldX = this.worldOffset + puppyX;
        const currentIntersection = Math.floor(puppyWorldX / this.patternWidth);

        // Check if we've moved to a new intersection
        if (currentIntersection !== this.lastCheckedIntersection) {
            // Check if puppy passed the traffic light
            const positionInPattern = puppyWorldX % this.patternWidth;
            const trafficLightPos = this.trafficLightOffsetInPattern;

            // If we're past the traffic light + stop zone, they missed it
            if (positionInPattern > trafficLightPos + (this.stopZoneSize / 2)) {
                this.lastCheckedIntersection = currentIntersection;
                return true; // Missed the stop!
            }
        }

        return false;
    }

    // Reset intersection tracking (call when player stops correctly or starts new attempt)
    resetIntersectionTracking() {
        const puppyWorldX = this.worldOffset + (this.canvasWidth * 0.2); // Default puppy X
        this.lastCheckedIntersection = Math.floor(puppyWorldX / this.patternWidth);
    }

    draw(ctx, showZones = true, puppyX = 0) {
        // ALWAYS show the bottom portion - this is where the dog is
        // Viewport is anchored to bottom regardless of screen size
        const groundHeight = this.canvasHeight * 0.4;  // Show 40% ground
        const skyHeight = this.canvasHeight - groundHeight;  // Rest is sky

        // Draw sky with buildings (parallax at 0.5x speed for depth)
        this.drawSky(ctx, skyHeight, this.worldOffset * 0.5);

        // Draw repeating ground pattern (pavement -> road -> pavement -> road...)
        // This scrolls at full speed
        this.drawGroundPattern(ctx, skyHeight, groundHeight, showZones, puppyX);
    }

    // Draw sky (simplified - buildings are now drawn with the ground pattern)
    drawSky(ctx, skyHeight, buildingOffset) {
        // Sky gradient
        const skyGradient = ctx.createLinearGradient(0, 0, 0, skyHeight);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(1, '#B0D4F1');
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0, 0, this.canvasWidth, skyHeight);

        // Just draw clouds with slower parallax for depth
        const cloudOffset = buildingOffset * 0.3;
        this.drawCloud(ctx, (150 - cloudOffset) % (this.canvasWidth + 200), skyHeight * 0.2);
        this.drawCloud(ctx, (450 - cloudOffset) % (this.canvasWidth + 200), skyHeight * 0.3);
        this.drawCloud(ctx, (700 - cloudOffset) % (this.canvasWidth + 200), skyHeight * 0.25);
    }

    // Draw repeating ground pattern
    drawGroundPattern(ctx, groundTop, groundHeight, showZones, puppyX) {
        // Calculate how many pattern repeats we need to draw to cover screen
        const startPattern = Math.floor((this.worldOffset - this.patternWidth) / this.patternWidth);
        const endPattern = Math.ceil((this.worldOffset + this.canvasWidth + this.patternWidth) / this.patternWidth);

        for (let i = startPattern; i <= endPattern; i++) {
            const patternX = i * this.patternWidth - this.worldOffset;
            this.drawSinglePattern(ctx, patternX, groundTop, groundHeight, showZones, puppyX);
        }
    }

    // Draw one complete pattern: street with buildings, then intersection gap
    drawSinglePattern(ctx, startX, groundTop, groundHeight, showZones, puppyX) {
        // PART 1: Street section with buildings (800px wide)
        // Draw pavement/sidewalk (horizontal strip at bottom)
        const pavementGradient = ctx.createLinearGradient(0, groundTop, 0, groundTop + groundHeight);
        pavementGradient.addColorStop(0, '#D3D3D3');
        pavementGradient.addColorStop(1, '#BEBEBE');
        ctx.fillStyle = pavementGradient;
        ctx.fillRect(startX, groundTop, this.streetSectionWidth, groundHeight);

        // Pavement texture (paving slabs) - horizontal lines
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
        ctx.lineWidth = 2;
        const slabHeight = 40;

        for (let y = groundTop; y < groundTop + groundHeight; y += slabHeight) {
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(startX + this.streetSectionWidth, y);
            ctx.stroke();
        }

        // Draw simple buildings above the street (in sky area)
        // Buildings fill the space from sky start to ground top
        const buildingHeight = groundTop * 0.6; // Buildings use 60% of sky height
        const buildingBottom = groundTop;
        const buildingTop = buildingBottom - buildingHeight;

        // Draw a continuous row of buildings
        const buildingWidth = 120;
        const numBuildings = Math.ceil(this.streetSectionWidth / buildingWidth);

        for (let i = 0; i < numBuildings; i++) {
            const bx = startX + (i * buildingWidth);
            const colors = ['#B85450', '#C67B5C', '#D4A574', '#A8483F', '#D9C2A3'];
            const color = colors[i % colors.length];

            // Building body
            ctx.fillStyle = color;
            ctx.fillRect(bx, buildingTop, buildingWidth - 2, buildingHeight);

            // Building outline
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.lineWidth = 2;
            ctx.strokeRect(bx, buildingTop, buildingWidth - 2, buildingHeight);

            // Windows
            const windowRows = Math.floor(buildingHeight / 40);
            const windowCols = Math.floor(buildingWidth / 35);
            for (let row = 0; row < windowRows; row++) {
                for (let col = 0; col < windowCols; col++) {
                    const wx = bx + 12 + (col * 35);
                    const wy = buildingTop + 15 + (row * 40);

                    // Window glass
                    const isLit = Math.random() > 0.3;
                    ctx.fillStyle = isLit ? '#FFF5C8' : '#B0D4E8';
                    ctx.fillRect(wx, wy, 16, 20);
                }
            }
        }

        // PART 2: Intersection gap (300px wide) - this is where you cross
        const intersectionStart = startX + this.streetSectionWidth;

        // Draw pavement continuing through intersection
        ctx.fillStyle = pavementGradient;
        ctx.fillRect(intersectionStart, groundTop, this.intersectionWidth, groundHeight);

        // Draw curb edges at start and end of intersection
        ctx.fillStyle = this.colorKerbEdge;
        ctx.fillRect(intersectionStart - 3, groundTop, 6, groundHeight);
        ctx.fillRect(intersectionStart + this.intersectionWidth - 3, groundTop, 6, groundHeight);

        // Traffic light in middle of intersection (on the pavement)
        const trafficLightX = intersectionStart + (this.intersectionWidth / 2) - 19; // Center it
        this.drawTrafficLight(ctx, trafficLightX, groundTop - 60); // Shorter pole

        // Draw stop zones if enabled
        if (showZones) {
            this.drawStopZones(ctx, trafficLightX + 19, groundTop, puppyX); // +19 to center on light
        }
    }

    // Draw stop zones around traffic light
    drawStopZones(ctx, trafficLightX, groundTop, puppyX) {
        const zoneTop = 0;
        const zoneBottom = groundTop;
        const pulse = Math.sin(this.pulseTime) * 0.2 + 0.8;

        // Zones are centered on traffic light
        const stopZoneX = trafficLightX - (this.stopZoneSize / 2);
        const perfectZoneX = trafficLightX - (this.perfectZoneSize / 2);

        // Good stop zone
        ctx.fillStyle = this.colorStopZone;
        ctx.globalAlpha = 0.3 * pulse;
        ctx.fillRect(stopZoneX, zoneTop, this.stopZoneSize, zoneBottom);

        // Perfect stop zone
        ctx.fillStyle = this.colorPerfectZone;
        ctx.globalAlpha = 0.4 * pulse;
        ctx.fillRect(perfectZoneX, zoneTop, this.perfectZoneSize, zoneBottom);

        ctx.globalAlpha = 1.0;

        // Zone indicators
        this.drawZoneIndicator(ctx, stopZoneX, zoneBottom, 'STOP ZONE', '#4CAF50');
        this.drawZoneIndicator(ctx, perfectZoneX, zoneBottom + 30, 'PERFECT', '#2E7D32');
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

    // Draw a building
    drawBuilding(ctx, x, groundLevel, building) {
        const buildingTop = groundLevel - building.height;

        // Building body
        ctx.fillStyle = building.color;
        ctx.fillRect(x, buildingTop, building.width, building.height);

        // Texture
        if (building.type === 'brick') {
            this.drawBrickTexture(ctx, x, buildingTop, building.width, building.height);
        } else if (building.type === 'stone') {
            this.drawStoneTexture(ctx, x, buildingTop, building.width, building.height);
        }

        // Building outline
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, buildingTop, building.width, building.height);

        // Windows
        const windowRows = Math.floor(building.height / 40);
        const windowCols = Math.floor(building.width / 35);
        for (let row = 0; row < windowRows; row++) {
            for (let col = 0; col < windowCols; col++) {
                const wx = x + 12 + (col * 35);
                const wy = buildingTop + 15 + (row * 40);

                // Window frame
                ctx.fillStyle = 'rgba(80, 60, 40, 0.6)';
                ctx.fillRect(wx - 2, wy - 2, 20, 24);

                // Window glass
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

    drawBrickTexture(ctx, x, y, width, height) {
        const brickWidth = 12;
        const brickHeight = 6;
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.lineWidth = 1;

        for (let by = 0; by < height; by += brickHeight) {
            ctx.beginPath();
            ctx.moveTo(x, y + by);
            ctx.lineTo(x + width, y + by);
            ctx.stroke();

            const offset = (Math.floor(by / brickHeight) % 2) * (brickWidth / 2);
            for (let bx = offset; bx < width; bx += brickWidth) {
                ctx.beginPath();
                ctx.moveTo(x + bx, y + by);
                ctx.lineTo(x + bx, y + by + brickHeight);
                ctx.stroke();
            }
        }
    }

    drawStoneTexture(ctx, x, y, width, height) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        const blockSize = 20;

        for (let sy = 0; sy < height; sy += blockSize) {
            for (let sx = 0; sx < width; sx += blockSize) {
                ctx.strokeRect(x + sx, y + sy, blockSize, blockSize);
            }
        }
    }

    drawTree(ctx, x, groundLevel, tree) {
        const treeBottom = groundLevel;
        const treeTop = treeBottom - tree.height;
        const trunkWidth = 8;
        const crownRadius = tree.width / 2;

        // Trunk
        ctx.fillStyle = '#6B5244';
        ctx.fillRect(x + crownRadius - trunkWidth/2, treeTop + crownRadius, trunkWidth, tree.height - crownRadius);

        // Crown (foliage) - layered circles
        const crownY = treeTop + crownRadius;

        ctx.fillStyle = '#4A7C59';
        ctx.beginPath();
        ctx.arc(x + crownRadius, crownY + 3, crownRadius - 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#6B9B6E';
        ctx.beginPath();
        ctx.arc(x + crownRadius, crownY, crownRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#8FBC8F';
        ctx.beginPath();
        ctx.arc(x + crownRadius - 3, crownY - 3, crownRadius - 4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawCloud(ctx, x, y) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
        ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    drawTrafficLight(ctx, x, y) {
        // Shorter pole for pavement-level traffic light
        ctx.fillStyle = '#4A4A4A';
        ctx.fillRect(x + 15, y + 80, 8, 60);

        // Traffic light box
        ctx.fillStyle = '#2C2C2C';
        ctx.fillRect(x, y, 38, 80);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, 38, 80);

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

    // Check stop quality based on puppy's position when stopped
    checkStopQuality(puppyX) {
        // Find nearest traffic light to puppy
        const puppyWorldX = this.worldOffset + puppyX;

        // Calculate which pattern the puppy is in
        const patternIndex = Math.floor(puppyWorldX / this.patternWidth);
        const positionInPattern = puppyWorldX % this.patternWidth;

        // Get traffic light position within this pattern
        const trafficLightPos = this.trafficLightOffsetInPattern;

        // Calculate distance from traffic light
        const distanceFromLight = Math.abs(positionInPattern - trafficLightPos);

        // Check zones
        if (distanceFromLight <= this.perfectZoneSize / 2) {
            return 'perfect';
        } else if (distanceFromLight <= this.stopZoneSize / 2) {
            return 'good';
        } else if (positionInPattern < trafficLightPos) {
            return 'too-early';
        } else {
            return 'too-late';
        }
    }

    // Get stop quality and score
    getStopQuality(puppyX) {
        const quality = this.checkStopQuality(puppyX);
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

    // Check if we've completed enough distance for a kerb
    hasCompletedKerb() {
        // Each pattern completion = one kerb crossed
        const patternsCompleted = Math.floor(this.worldOffset / this.patternWidth);
        return patternsCompleted;
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

        // Create single kerb instance that handles continuous scrolling
        this.kerb = new Kerb(canvasWidth, canvasHeight, 1);
        this.currentDifficulty = 1;
    }

    getCurrentKerb() {
        return this.kerb;
    }

    nextKerb() {
        this.currentKerbIndex++;

        // Update difficulty as player progresses
        if (this.currentKerbIndex >= 6) {
            this.currentDifficulty = 3;
        } else if (this.currentKerbIndex >= 3) {
            this.currentDifficulty = 2;
        }

        this.kerb.difficulty = this.currentDifficulty;
        this.kerb.configureZones();

        return this.currentKerbIndex < this.totalKerbs;
    }

    reset() {
        this.currentKerbIndex = 0;
        this.currentDifficulty = 1;
        this.kerb.worldOffset = 0;
        this.kerb.difficulty = 1;
        this.kerb.configureZones();
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
