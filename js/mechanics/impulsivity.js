// Impulsivity Mechanic
// Simulates the internal urge to do something else.

import { GameState } from '../main.js';

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
        // Trigger the distraction minigame via the main module
        // We access the global for now to avoid circular dependency issues roughly, 
        // or we could pass a callback from main.init().
        // For ES modules, circular deps are handled but 'startMinigame' needs to be imported if we want to use it directly.
        // However, referencing window.NeuroGame is a quick dirty way, let's try a better import approach or use the window global since we set it up.

        if (window.NeuroGame && window.NeuroGame.startMinigame) {
            window.NeuroGame.startMinigame('distraction');
        }
    }
};
