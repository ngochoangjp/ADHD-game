// Visual Overload Simulation
// Spawns distracting elements and visual noise.

import { GameState } from '../main.js';

export const OverloadSystem = {
    lastPopupTime: 0,
    popupInterval: 5, // Seconds between popups initially

    init() {
        // Init logic
    },

    update(dt) {
        // Passive overload reduction (recovery) if not doing anything? 
        // Or passive increase if environment is "Loud" (simulated)
        // For now, stable unless provoked.

        // Random "environment" stim
        if (Math.random() < 0.005) { // Occasional random spike
            this.add(5);
        }

        this.handlePopups(dt);
    },

    add(amount) {
        GameState.overload = Math.min(100, Math.max(0, GameState.overload + amount));
    },

    reduce(amount) {
        GameState.overload = Math.min(100, Math.max(0, GameState.overload - amount));
    },

    handlePopups(dt) {
        // Higher overload = more frequent popups
        const interval = Math.max(0.5, 5 - (GameState.overload / 20)); // High overload = 0.5s interval

        if (Date.now() / 1000 - this.lastPopupTime > interval) {
            if (GameState.overload > 10) { // Only start bothering if slightly overloaded
                this.spawnPopup();
                this.lastPopupTime = Date.now() / 1000;
            }
        }
    },

    spawnPopup() {
        const texts = [
            "Did you lock the door?",
            "What's that noise?",
            "New Notification!",
            "Itchy tag on shirt!",
            "Too bright...",
            "Hungry?",
            "Thirsty?",
            "Bored...",
            "Check email!",
            "Look at the bird!"
        ];

        const text = texts[Math.floor(Math.random() * texts.length)];
        const popupsLayer = document.getElementById('popups-layer');

        const el = document.createElement('div');
        el.className = 'popup';
        el.innerText = text;

        // Random position
        const x = Math.random() * (window.innerWidth - 200);
        const y = Math.random() * (window.innerHeight - 100);

        el.style.left = `${x}px`;
        el.style.top = `${y}px`;

        // Click to dismiss (improves overload slightly to clear)
        el.onclick = () => {
            el.remove();
            this.reduce(2); // "Handled" the distraction
        };

        // Auto remove after some time (simulates it fading or being ignored)
        setTimeout(() => {
            if (el.parentElement) el.remove();
        }, 3000);

        popupsLayer.appendChild(el);

        // Spawning adds a tiny bit of overload
        this.add(1);
    }
};
