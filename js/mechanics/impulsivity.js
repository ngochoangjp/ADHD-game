// Impulsivity Mechanic
// Simulates the internal urge to do something else.

import { GameState } from '../main.js';
import { showTip } from '../ui.js';

export const ImpulsivitySystem = {
    init() {
        // Initialization logic if needed
    },

    update(dt) {
        // Passive increase over time (boredom)
        // Rate could vary based on "Interest" level (future)
        this.add(2 * dt); // +2% per second passively

        // Check for "Hijack" threshold
        if (GameState.impulsivity >= 100) {
            this.triggerHijack();
        }
    },

    add(amount) {
        GameState.impulsivity = Math.min(100, Math.max(0, GameState.impulsivity + amount));
    },

    reduce(amount) {
        GameState.impulsivity = Math.min(100, Math.max(0, GameState.impulsivity - amount));
    },

    triggerHijack() {
        console.log("BRAIN HIJACKED!");
        // Reset impulsivity to prevent immediate retrigger after minigame ends
        GameState.impulsivity = 0;

        showTip("🎭 Brain hijack! When impulse gets too high, your brain demands stimulation NOW.");

        // Trigger the distraction minigame via the main module
        if (window.NeuroGame && window.NeuroGame.startMinigame) {
            window.NeuroGame.startMinigame('distraction');
        }
    }
};
