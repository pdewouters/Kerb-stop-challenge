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

        // Background image - full street scene
        this.backgroundImage = new Image();
        this.backgroundLoaded = false;
        this.backgroundImage.onload = () => {
            this.backgroundLoaded = true;
            console.log('✅ Background image loaded:', this.backgroundImage.width, 'x', this.backgroundImage.height);

            // Calculate scaling once image is loaded
            this.calculateBackgroundScale();
        };
        this.backgroundImage.onerror = () => {
            console.error('❌ Failed to load background image');
        };
        // Add cache-busting parameter to force reload
        this.backgroundImage.src = 'assets/images/FAA4CCA7-41BA-4745-A689-15D3DFDF36AA.jpeg?' + Date.now();

        // COORDINATE MAPPING SYSTEM
        // Define traffic light position at the end of the pavement section
        // The traffic light marks where the dog should stop before crossing
        this.trafficLightPositionsInImage = [
            { x: 1250, y: 0.78, label: 'End of pavement - crossing point' },
        ];

        // Will be calculated once image loads
        this.scaledTrafficLightPositions = [];
        this.scaledBackgroundWidth = 0;

        // Track if player has passed an intersection without stopping
        this.lastCheckedIntersection = -1;

        // Track if player has stopped at current intersection (to prevent false miss detection)
        this.hasStoppedAtCurrentIntersection = false;

        // Stop zone configuration based on difficulty
        this.configureZones();

        // Visual properties
        this.colorStopZone = 'rgba(76, 175, 80, 0.3)';
        this.colorPerfectZone = 'rgba(76, 175, 80, 0.5)';

        // Animation for visual feedback
        this.pulseTime = 0;
        this.pulseSpeed = 0.05;
    }

    // Calculate how the background will be scaled and update traffic light positions
    calculateBackgroundScale() {
        if (!this.backgroundLoaded) return;

        const bgWidth = this.backgroundImage.width;
        const bgHeight = this.backgroundImage.height;

        // Scale background to fill entire canvas height
        const scale = this.canvasHeight / bgHeight;
        this.scaledBackgroundWidth = bgWidth * scale;
        this.scale = scale;

        // Scale traffic light positions to match scaled background
        this.scaledTrafficLightPositions = this.trafficLightPositionsInImage.map(pos => ({
            x: pos.x * scale,
            y: pos.y,  // Y is already a percentage
            label: pos.label
        }));

        console.log('📍 Scaled background width:', this.scaledBackgroundWidth);
        console.log('📍 Traffic light positions:', this.scaledTrafficLightPositions);
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
    }

    update(speed) {
        this.pulseTime += this.pulseSpeed;
        // Update world offset - world scrolls right to left
        this.worldOffset += speed;
    }

    // Check if player missed a traffic light without stopping
    checkMissedStop(puppyX, isPuppyWalking) {
        if (!isPuppyWalking || this.scaledTrafficLightPositions.length === 0) return false;

        // If player has already stopped at current intersection, they haven't missed it
        if (this.hasStoppedAtCurrentIntersection) {
            return false;
        }

        const puppyWorldX = this.worldOffset + puppyX;

        // Check each traffic light position across all background repeats
        const currentBackgroundRepeat = Math.floor(puppyWorldX / this.scaledBackgroundWidth);

        // Check traffic lights in current and next background repeat
        for (let repeatIndex = currentBackgroundRepeat; repeatIndex <= currentBackgroundRepeat + 1; repeatIndex++) {
            this.scaledTrafficLightPositions.forEach((lightPos, lightIndex) => {
                const worldLightX = (repeatIndex * this.scaledBackgroundWidth) + lightPos.x;
                const intersectionId = `${repeatIndex}-${lightIndex}`;

                // Check if we just passed this traffic light completely (past the far edge of stop zone)
                const passedStopZone = puppyWorldX > worldLightX + (this.stopZoneSize / 2);

                if (passedStopZone) {
                    // Check if we already recorded this intersection
                    if (this.lastCheckedIntersection !== intersectionId) {
                        this.lastCheckedIntersection = intersectionId;
                        // Player walked past without stopping - this is a miss!
                        console.log('❌ Missed traffic light! Intersection:', intersectionId);
                        return true;
                    }
                }
            });
        }

        return false;
    }

    // Reset intersection tracking (call when player stops correctly or starts new attempt)
    resetIntersectionTracking() {
        this.lastCheckedIntersection = null;
        this.hasStoppedAtCurrentIntersection = false;
    }

    draw(ctx, showZones = true, puppyX = 0) {
        // Draw full-screen background image
        this.drawBackgroundImage(ctx);

        // Draw traffic lights and stop zones on top
        // Traffic lights should be on the pavement (around 80% down the screen based on the image)
        const pavementY = this.canvasHeight * 0.8;
        this.drawTrafficLights(ctx, pavementY, showZones, puppyX);
    }

    // Draw the repeating background image at full canvas size
    drawBackgroundImage(ctx) {
        if (!this.backgroundLoaded) {
            // Show placeholder while loading
            ctx.fillStyle = '#87CEEB';
            ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
            ctx.fillStyle = '#333';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Loading background...', this.canvasWidth / 2, this.canvasHeight / 2);
            return;
        }

        // Get background dimensions
        const bgWidth = this.backgroundImage.width;
        const bgHeight = this.backgroundImage.height;

        // Scale background to fill entire canvas height while maintaining aspect ratio
        const scale = this.canvasHeight / bgHeight;
        const scaledWidth = bgWidth * scale;
        const scaledHeight = this.canvasHeight;

        // Calculate how many times we need to draw the background to cover the screen width
        // plus buffer for scrolling
        const startX = -(this.worldOffset % scaledWidth);
        const numRepeats = Math.ceil((this.canvasWidth - startX) / scaledWidth) + 1;

        // Draw the background repeated horizontally
        for (let i = 0; i < numRepeats; i++) {
            const x = startX + (i * scaledWidth);
            ctx.drawImage(
                this.backgroundImage,
                x,
                0,
                scaledWidth,
                scaledHeight
            );
        }
    }

    // Draw traffic lights at positions defined in the coordinate map
    drawTrafficLights(ctx, pavementY, showZones, puppyX) {
        if (!this.backgroundLoaded || this.scaledTrafficLightPositions.length === 0) return;

        // Calculate which background repeats are visible
        const firstVisibleRepeat = Math.floor((this.worldOffset - this.scaledBackgroundWidth) / this.scaledBackgroundWidth);
        const lastVisibleRepeat = Math.ceil((this.worldOffset + this.canvasWidth + this.scaledBackgroundWidth) / this.scaledBackgroundWidth);

        // Draw traffic lights for each visible background repeat
        for (let repeatIndex = firstVisibleRepeat; repeatIndex <= lastVisibleRepeat; repeatIndex++) {
            this.scaledTrafficLightPositions.forEach(lightPos => {
                // Calculate world position (absolute position in game world)
                const worldX = (repeatIndex * this.scaledBackgroundWidth) + lightPos.x;

                // Convert to screen position
                const screenX = worldX - this.worldOffset;

                // Only draw if visible on screen
                if (screenX > -100 && screenX < this.canvasWidth + 100) {
                    const screenY = this.canvasHeight * lightPos.y;

                    // Draw traffic light
                    this.drawTrafficLight(ctx, screenX - 19, screenY - 100);

                    // Draw stop zones if enabled (for debugging)
                    if (showZones) {
                        this.drawStopZones(ctx, screenX, pavementY, puppyX);
                    }
                }
            });
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
        if (this.scaledTrafficLightPositions.length === 0) return 'too-late';

        const puppyWorldX = this.worldOffset + puppyX;

        // Find the nearest traffic light
        let nearestDistance = Infinity;
        let nearestQuality = 'too-late';

        const currentBackgroundRepeat = Math.floor(puppyWorldX / this.scaledBackgroundWidth);

        // Check traffic lights in nearby background repeats
        for (let repeatIndex = currentBackgroundRepeat - 1; repeatIndex <= currentBackgroundRepeat + 1; repeatIndex++) {
            this.scaledTrafficLightPositions.forEach(lightPos => {
                const worldLightX = (repeatIndex * this.scaledBackgroundWidth) + lightPos.x;
                const distance = Math.abs(puppyWorldX - worldLightX);

                if (distance < nearestDistance) {
                    nearestDistance = distance;

                    // Determine quality based on distance
                    if (distance <= this.perfectZoneSize / 2) {
                        nearestQuality = 'perfect';
                    } else if (distance <= this.stopZoneSize / 2) {
                        nearestQuality = 'good';
                    } else if (puppyWorldX < worldLightX) {
                        nearestQuality = 'too-early';
                    } else {
                        nearestQuality = 'too-late';
                    }
                }
            });
        }

        return nearestQuality;
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
        this.totalKerbs = 5;

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
        this.kerb.resetIntersectionTracking();
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
