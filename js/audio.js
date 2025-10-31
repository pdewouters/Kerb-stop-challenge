/**
 * Audio Manager for the Kerb Stop Challenge
 * Handles Web Audio API with mobile unlock support
 */

class AudioManager {
    constructor() {
        this.context = null;
        this.sounds = {};
        this.muted = Storage.getMuted();
        this.unlocked = false;

        this.init();
    }

    init() {
        // Create audio context (suspended until user interaction on mobile)
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.context = new AudioContext();
        } catch (e) {
            console.warn('Web Audio API not supported');
        }

        // Setup unlock for mobile devices
        this.setupUnlock();
    }

    setupUnlock() {
        const unlock = () => {
            if (this.unlocked || !this.context) return;

            // Play silent buffer to unlock
            const buffer = this.context.createBuffer(1, 1, 22050);
            const source = this.context.createBufferSource();
            source.buffer = buffer;
            source.connect(this.context.destination);
            source.start(0);

            // Resume context if suspended
            if (this.context.state === 'suspended') {
                this.context.resume();
            }

            this.unlocked = true;

            // Remove listeners
            document.removeEventListener('touchstart', unlock);
            document.removeEventListener('touchend', unlock);
            document.removeEventListener('click', unlock);
        };

        // Add listeners for various interaction types
        document.addEventListener('touchstart', unlock, false);
        document.addEventListener('touchend', unlock, false);
        document.addEventListener('click', unlock, false);
    }

    // Generate simple tones procedurally (no external files needed)
    generateTone(frequency, duration, type = 'sine') {
        if (!this.context) return null;

        const sampleRate = this.context.sampleRate;
        const numSamples = duration * sampleRate;
        const buffer = this.context.createBuffer(1, numSamples, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            let value = 0;

            switch (type) {
                case 'sine':
                    value = Math.sin(2 * Math.PI * frequency * t);
                    break;
                case 'square':
                    value = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
                    break;
                case 'sawtooth':
                    value = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
                    break;
                case 'triangle':
                    value = 2 * Math.abs(2 * (t * frequency - Math.floor(t * frequency + 0.5))) - 1;
                    break;
            }

            // Apply envelope (fade in/out)
            const fadeLength = sampleRate * 0.01; // 10ms fade
            if (i < fadeLength) {
                value *= i / fadeLength;
            } else if (i > numSamples - fadeLength) {
                value *= (numSamples - i) / fadeLength;
            }

            data[i] = value * 0.3; // Reduce volume
        }

        return buffer;
    }

    // Generate walking sound (soft thud)
    generateWalkSound() {
        if (!this.context) return null;

        const duration = 0.1;
        const sampleRate = this.context.sampleRate;
        const numSamples = duration * sampleRate;
        const buffer = this.context.createBuffer(1, numSamples, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const decay = Math.exp(-t * 20);
            const noise = (Math.random() * 2 - 1) * 0.1;
            const tone = Math.sin(2 * Math.PI * 80 * t) * 0.2;
            data[i] = (noise + tone) * decay;
        }

        return buffer;
    }

    // Generate sit sound (deeper thud)
    generateSitSound() {
        if (!this.context) return null;

        const duration = 0.2;
        const sampleRate = this.context.sampleRate;
        const numSamples = duration * sampleRate;
        const buffer = this.context.createBuffer(1, numSamples, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const decay = Math.exp(-t * 15);
            const noise = (Math.random() * 2 - 1) * 0.15;
            const tone = Math.sin(2 * Math.PI * 60 * t) * 0.3;
            data[i] = (noise + tone) * decay;
        }

        return buffer;
    }

    // Generate success chime (ascending notes)
    generateSuccessSound() {
        if (!this.context) return null;

        const duration = 0.4;
        const sampleRate = this.context.sampleRate;
        const numSamples = duration * sampleRate;
        const buffer = this.context.createBuffer(1, numSamples, sampleRate);
        const data = buffer.getChannelData(0);

        const notes = [523.25, 659.25]; // C5, E5

        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const decay = Math.exp(-t * 3);
            const noteIndex = Math.floor(t * 5);
            const freq = notes[Math.min(noteIndex, notes.length - 1)];
            data[i] = Math.sin(2 * Math.PI * freq * t) * decay * 0.3;
        }

        return buffer;
    }

    // Generate perfect sound (3-note ascending)
    generatePerfectSound() {
        if (!this.context) return null;

        const duration = 0.6;
        const sampleRate = this.context.sampleRate;
        const numSamples = duration * sampleRate;
        const buffer = this.context.createBuffer(1, numSamples, sampleRate);
        const data = buffer.getChannelData(0);

        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const decay = Math.exp(-t * 2.5);
            const noteIndex = Math.floor(t * 5);
            const freq = notes[Math.min(noteIndex, notes.length - 1)];
            data[i] = Math.sin(2 * Math.PI * freq * t) * decay * 0.3;
        }

        return buffer;
    }

    // Generate miss sound (sad descending)
    generateMissSound() {
        if (!this.context) return null;

        const duration = 0.5;
        const sampleRate = this.context.sampleRate;
        const numSamples = duration * sampleRate;
        const buffer = this.context.createBuffer(1, numSamples, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            const freq = 400 - (t * 200); // Descending
            const decay = Math.exp(-t * 3);
            data[i] = Math.sin(2 * Math.PI * freq * t) * decay * 0.2;
        }

        return buffer;
    }

    // Generate level complete fanfare
    generateCompleteSound() {
        if (!this.context) return null;

        const duration = 1.5;
        const sampleRate = this.context.sampleRate;
        const numSamples = duration * sampleRate;
        const buffer = this.context.createBuffer(1, numSamples, sampleRate);
        const data = buffer.getChannelData(0);

        // Happy melody
        const melody = [
            { freq: 523.25, start: 0, duration: 0.2 },    // C5
            { freq: 659.25, start: 0.2, duration: 0.2 },  // E5
            { freq: 783.99, start: 0.4, duration: 0.2 },  // G5
            { freq: 1046.50, start: 0.6, duration: 0.8 }  // C6
        ];

        for (let i = 0; i < numSamples; i++) {
            const t = i / sampleRate;
            let value = 0;

            melody.forEach(note => {
                if (t >= note.start && t < note.start + note.duration) {
                    const noteT = t - note.start;
                    const decay = Math.exp(-noteT * 2);
                    value += Math.sin(2 * Math.PI * note.freq * noteT) * decay;
                }
            });

            data[i] = value * 0.25;
        }

        return buffer;
    }

    // Load all sounds
    loadSounds() {
        this.sounds.walk = this.generateWalkSound();
        this.sounds.sit = this.generateSitSound();
        this.sounds.success = this.generateSuccessSound();
        this.sounds.perfect = this.generatePerfectSound();
        this.sounds.miss = this.generateMissSound();
        this.sounds.complete = this.generateCompleteSound();
    }

    // Play a sound
    play(soundName, volume = 1.0) {
        if (!this.context || this.muted || !this.sounds[soundName]) return;

        try {
            const source = this.context.createBufferSource();
            const gainNode = this.context.createGain();

            source.buffer = this.sounds[soundName];
            gainNode.gain.value = volume;

            source.connect(gainNode);
            gainNode.connect(this.context.destination);

            source.start(0);
        } catch (e) {
            console.warn('Error playing sound:', e);
        }
    }

    // Toggle mute
    toggleMute() {
        this.muted = !this.muted;
        Storage.setMuted(this.muted);
        return this.muted;
    }

    // Get mute state
    isMuted() {
        return this.muted;
    }
}
