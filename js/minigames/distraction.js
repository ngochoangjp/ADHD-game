// Distraction Minigame: "Click the bubbles!"
// Simple game where bubbles appear and player must pop them to regain focus.

import { Minigame } from './base_minigame.js';

export class DistractionMinigame extends Minigame {
    constructor(containerId, onComplete) {
        super(containerId, onComplete);
        this.score = 0;
        this.targetScore = 10;
    }

    setup() {
        this.score = 0;
        this.updateTitle("Pop 10 bubbles to focus!");
    }

    updateTitle(text) {
        const title = document.getElementById('minigame-title');
        if (title) title.innerText = text;
    }

    render() {
        // Create a simple canvas or div-based game
        // For simplicity, we'll use div bubbles
        this.spawnInterval = setInterval(() => this.spawnBubble(), 500);
    }

    spawnBubble() {
        if (!this.isActive) return;

        const bubble = document.createElement('div');
        const size = 40 + Math.random() * 40;

        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.borderRadius = '50%';
        bubble.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
        bubble.style.position = 'absolute';
        bubble.style.left = `${Math.random() * 80}%`; // Keep inside container roughly
        bubble.style.top = `${Math.random() * 80}%`;
        bubble.style.cursor = 'pointer';
        bubble.style.transition = 'transform 0.2s';

        // Animation
        bubble.animate([
            { transform: 'scale(0)' },
            { transform: 'scale(1)' }
        ], { duration: 300 });

        bubble.onclick = () => {
            if (!this.isActive) return;
            this.score++;
            bubble.remove();

            this.updateTitle(`Focusing... ${this.score}/${this.targetScore}`);

            if (this.score >= this.targetScore) {
                this.finish(true);
            }
        };

        this.container.appendChild(bubble);

        // Auto remove if not clicked (optional difficulty)
        setTimeout(() => {
            if (bubble.parentElement) {
                bubble.remove();
            }
        }, 2000);
    }

    cleanup() {
        super.cleanup();
        clearInterval(this.spawnInterval);
    }
}
