/**
 * UI Manager for the Kerb Stop Challenge
 * Handles all UI updates and interactions
 */

class UIManager {
    constructor(game) {
        this.game = game;
        this.elements = this.cacheElements();
        this.setupEventListeners();

        // Guide dog facts for the donation modal
        this.guideDogFacts = [
            "It takes 2 years to train a guide dog, starting from when they're just 6 weeks old!",
            "Guide dogs can learn over 50 commands to keep their owners safe.",
            "Labrador Retrievers and Golden Retrievers are the most common guide dog breeds because of their friendly temperament.",
            "A guide dog's working life is typically 7-8 years, after which they retire and often stay with their owner as a pet.",
            "Guide dogs are trained to 'intelligently disobey' - they'll refuse an unsafe command to protect their handler.",
            "The first guide dog school was established in Germany in 1916 to help soldiers blinded in World War I.",
            "Guide dogs wear special harnesses with a rigid handle that allows them to communicate direction changes to their handler.",
            "Training includes navigating busy streets, public transport, shops, and even escalators!",
            "Guide dogs can detect overhead obstacles like tree branches to protect their handler's head.",
            "Each guide dog is matched to their owner based on personality, walking speed, and lifestyle.",
            "Guide dogs learn to find specific locations like doors, stairs, and crossing points on command.",
            "The partnership between a guide dog and their owner is built on trust, with the dog making split-second safety decisions.",
            "Guide dogs must be comfortable in all environments - from quiet country lanes to bustling city centers.",
            "Puppy walkers volunteer to raise guide dog puppies for their first year, teaching them basic obedience and socialization.",
            "Guide dogs are trained to ignore distractions like other dogs, food, and loud noises while working."
        ];
    }

    cacheElements() {
        return {
            // Screens
            startScreen: document.getElementById('startScreen'),
            gameScreen: document.getElementById('gameScreen'),
            completeScreen: document.getElementById('completeScreen'),

            // Buttons
            startButton: document.getElementById('startButton'),
            playAgainButton: document.getElementById('playAgainButton'),
            donateButton: document.getElementById('donateButton'),
            shareButton: document.getElementById('shareButton'),
            pauseButton: document.getElementById('pauseButton'),
            muteButton: document.getElementById('muteButton'),

            // Modals
            donationModal: document.getElementById('donationModal'),
            shareModal: document.getElementById('shareModal'),
            closeModal: document.getElementById('closeModal'),
            closeShareModal: document.getElementById('closeShareModal'),
            maybeLater: document.getElementById('maybeLater'),

            // Share buttons
            shareTwitter: document.getElementById('shareTwitter'),
            shareFacebook: document.getElementById('shareFacebook'),
            shareWhatsApp: document.getElementById('shareWhatsApp'),
            copyLink: document.getElementById('copyLink'),
            copyFeedback: document.getElementById('copyFeedback'),

            // Game UI
            progressText: document.getElementById('progressText'),
            progressHearts: document.getElementById('progressHearts'),
            scoreText: document.getElementById('scoreText'),
            instruction: document.getElementById('instruction'),
            feedback: document.getElementById('feedback'),

            // Complete screen
            completeTitle: document.getElementById('completeTitle'),
            gradeEmoji: document.getElementById('gradeEmoji'),
            gradeText: document.getElementById('gradeText'),
            finalScore: document.getElementById('finalScore'),
            personalMessage: document.getElementById('personalMessage')
        };
    }

    setupEventListeners() {
        // Start button
        this.elements.startButton.addEventListener('click', () => {
            this.game.startGame();
        });

        // Play again button
        this.elements.playAgainButton.addEventListener('click', () => {
            ModalManager.hide('donationModal');
            this.game.restartGame();
        });

        // Donate button
        this.elements.donateButton.addEventListener('click', () => {
            this.showDonationModal();
        });

        // Share button
        this.elements.shareButton.addEventListener('click', () => {
            this.showShareModal();
        });

        // Pause button
        this.elements.pauseButton.addEventListener('click', () => {
            this.game.togglePause();
        });

        // Mute button
        this.elements.muteButton.addEventListener('click', () => {
            this.toggleMute();
        });

        // Modal close buttons
        this.elements.closeModal.addEventListener('click', () => {
            ModalManager.hide('donationModal');
        });

        this.elements.closeShareModal.addEventListener('click', () => {
            ModalManager.hide('shareModal');
        });

        this.elements.maybeLater.addEventListener('click', () => {
            ModalManager.hide('donationModal');
        });

        // Share buttons
        this.elements.shareTwitter.addEventListener('click', () => {
            ShareManager.shareTwitter(this.game.score);
        });

        this.elements.shareFacebook.addEventListener('click', () => {
            ShareManager.shareFacebook();
        });

        this.elements.shareWhatsApp.addEventListener('click', () => {
            ShareManager.shareWhatsApp(this.game.score);
        });

        this.elements.copyLink.addEventListener('click', async () => {
            const success = await ShareManager.copyLink();
            if (success) {
                this.showCopyFeedback();
            }
        });

        // Close modals when clicking outside
        this.elements.donationModal.addEventListener('click', (e) => {
            if (e.target === this.elements.donationModal) {
                ModalManager.hide('donationModal');
            }
        });

        this.elements.shareModal.addEventListener('click', (e) => {
            if (e.target === this.elements.shareModal) {
                ModalManager.hide('shareModal');
            }
        });
    }

    updateProgress(current, total, attempts) {
        this.elements.progressText.textContent = `Kerb: ${current}/${total}`;

        // Update hearts/attempts
        this.elements.progressHearts.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const heart = document.createElement('span');
            heart.textContent = i < attempts ? '❤️' : '🤍';
            this.elements.progressHearts.appendChild(heart);
        }
    }

    updateScore(score) {
        this.elements.scoreText.textContent = `Score: ${score}`;
    }

    showFeedback(message, quality) {
        this.elements.feedback.textContent = message;
        this.elements.feedback.className = `feedback-text show ${quality}`;

        setTimeout(() => {
            this.elements.feedback.classList.remove('show');
        }, 1500);
    }

    updateInstruction(text) {
        this.elements.instruction.textContent = text;
    }

    showCompleteScreen(score, isNewHighScore) {
        const grade = this.getGrade(score);

        this.elements.finalScore.textContent = score;
        this.elements.gradeEmoji.textContent = grade.emoji;
        this.elements.gradeText.textContent = grade.text;

        if (isNewHighScore) {
            this.elements.completeTitle.textContent = '🎉 New High Score! 🎉';
        } else {
            this.elements.completeTitle.textContent = 'Training Complete!';
        }

        // Update score in donation modal
        const modalScoreElement = document.getElementById('modalScore');
        if (modalScoreElement) {
            modalScoreElement.textContent = score;
        }

        ScreenManager.show('completeScreen');
    }

    getGrade(score) {
        if (score >= 90) {
            return {
                emoji: '⭐⭐⭐',
                text: 'Qualified Guide Dog!'
            };
        } else if (score >= 70) {
            return {
                emoji: '⭐⭐',
                text: 'Excellent Progress!'
            };
        } else if (score >= 50) {
            return {
                emoji: '⭐',
                text: 'Good Training!'
            };
        } else {
            return {
                emoji: '💪',
                text: 'Keep Practicing!'
            };
        }
    }

    showDonationModal() {
        // Select random fact
        const randomIndex = Math.floor(Math.random() * this.guideDogFacts.length);
        const randomFact = this.guideDogFacts[randomIndex];

        // Display in modal
        const factElement = document.getElementById('randomFact');
        if (factElement) {
            factElement.textContent = randomFact;
        }

        ModalManager.show('donationModal');
    }

    showShareModal() {
        ModalManager.show('shareModal');
    }

    showCopyFeedback() {
        this.elements.copyFeedback.classList.add('show');
        setTimeout(() => {
            this.elements.copyFeedback.classList.remove('show');
        }, 2000);
    }

    toggleMute() {
        const muted = this.game.audioManager.toggleMute();
        this.elements.muteButton.textContent = muted ? '🔇' : '🔊';
    }

    updateMuteButton() {
        const muted = this.game.audioManager.isMuted();
        this.elements.muteButton.textContent = muted ? '🔇' : '🔊';
    }

    showPauseOverlay(paused) {
        this.elements.pauseButton.textContent = paused ? '▶️' : '⏸️';

        if (paused) {
            this.updateInstruction('PAUSED - Click to resume');
        } else {
            this.updateInstruction('Press SPACE or TAP to stop at the kerb');
        }
    }
}
