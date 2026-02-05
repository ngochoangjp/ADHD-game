// Social Masking Mechanic

import { GameState } from '../main.js';
import { updateUI, showTip } from '../ui.js';
import { ImpulsivitySystem } from './impulsivity.js';

export const SocialSystem = {
    isActive: false,
    timer: 0,

    init() {
        // Bind Buttons
        document.getElementById('btn-social-mask').addEventListener('click', () => this.resolve(true));
        document.getElementById('btn-social-slip').addEventListener('click', () => this.resolve(false));
    },

    update(dt) {
        if (this.isActive || GameState.isPaused) return;

        // Random Event Trigger
        // Chance increases if Masking is High (You look "approachable")
        const chance = 0.005 + (GameState.maskingEnergy > 80 ? 0.005 : 0);

        if (Math.random() < chance * dt) {
            this.triggerEvent();
        }
    },

    triggerEvent() {
        console.log("Social Event Triggered");
        this.isActive = true;
        GameState.isPaused = true;

        // Pick dialogue
        const dialogues = [
            "Hey, did you see that email?",
            "How was your weekend?",
            "Can you help me with this printer?",
            "You're so quiet today! Everything okay?",
            "Want to grab lunch later?"
        ];
        const text = dialogues[Math.floor(Math.random() * dialogues.length)];

        document.getElementById('social-text').innerText = `"${text}"`;
        document.getElementById('social-modal-overlay').classList.remove('hidden');

        showTip("😰 Social situations drain 'masking energy' - the effort to appear neurotypical.");
    },

    resolve(didMask) {
        const overlay = document.getElementById('social-modal-overlay');
        overlay.classList.add('hidden');

        this.isActive = false;
        GameState.isPaused = false;

        if (didMask) {
            // Pay the cost
            GameState.maskingEnergy = Math.max(0, GameState.maskingEnergy - 20);
            // Small Focus reward for "handling it"
            GameState.focusPoints = Math.min(100, GameState.focusPoints + 5);
        } else {
            // Mask Slip
            ImpulsivitySystem.add(15); // Stress spike
            showTip("😅 Mask slips happen! The stress spike reflects the anxiety of 'being yourself'.");
            // Maybe social penalty (future feature)
        }

        updateUI(GameState);
    }
};
