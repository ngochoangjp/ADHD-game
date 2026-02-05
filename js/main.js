// Main Game Logic - NeuroSpicy Daily Grind
import { initUI, updateUI } from './ui.js';
import { ImpulsivitySystem } from './mechanics/impulsivity.js';
import { OverloadSystem } from './mechanics/overload.js';
import { SocialSystem } from './mechanics/social.js';
import { DistractionMinigame } from './minigames/distraction.js';

export const GameState = {
    // Resources
    focusPoints: 100,
    maskingEnergy: 100,

    // Time
    dayTimer: 0,
    gameHour: 9,

    // Task Management
    activeTaskId: null,
    tasks: {
        work: { id: 'work', name: 'Work Project', progress: 50, decay: 1.5 },
        cook: { id: 'cook', name: 'Meal Prep', progress: 20, decay: 2.0 },
        clean: { id: 'clean', name: 'House Cleaning', progress: 30, decay: 1.0 },
        email: { id: 'email', name: 'Inbox Zero', progress: 10, decay: 3.0 },
        hobby: { id: 'hobby', name: 'Painting', progress: 0, decay: 1.0 }
    },

    // Meters
    impulsivity: 0,
    overload: 0,

    // Flags
    isPaused: false,
    activeMinigame: null,
    hyperfocusTarget: null,
    hyperfocusTimer: 0,

    constants: {
        SWITCH_COST: 10,
        WORK_Example_GAIN: 5,
        TICK_RATE: 60
    }
};

let lastTime = 0;

function initGame() {
    console.log("NeuroSpicy Daily Grind Initializing... State:", GameState);
    if (!GameState) {
        alert("CRITICAL ERROR: GameState failed to load!");
        return;
    }

    initUI();
    ImpulsivitySystem.init();
    OverloadSystem.init();
    SocialSystem.init();

    window.selectTask = selectTask;

    document.getElementById('btn-perform-action').addEventListener('click', doTaskWork);
    document.getElementById('btn-stim').addEventListener('click', actionStim);
    document.getElementById('btn-breathe').addEventListener('click', actionBreathe);

    requestAnimationFrame(gameLoop);
}

function selectTask(taskId) {
    if (GameState.isPaused) return;
    if (GameState.activeTaskId === taskId) return;

    // HYPERFOCUS CHECK
    if (GameState.hyperfocusTarget) {
        showFloatingText("LOCKED BY HYPERFOCUS!", "purple");
        // Shake the card to show it's locked?
        return;
    }

    if (GameState.focusPoints < GameState.constants.SWITCH_COST) {
        showFloatingText("Not enough Focus!", "red");
        return;
    }

    // EXECUTIVE DYSFUNCTION CHECK
    // If Impulse is High or Focus Low, switching is hard
    // Simple chance to fail switch? 
    // For now, allow switch but with heavy penalty if dysfunctional?
    // Let's keep it simple: Just cost check.

    // Deduct cost and switch
    GameState.focusPoints -= GameState.constants.SWITCH_COST;
    GameState.activeTaskId = taskId;
    ImpulsivitySystem.add(2);

    updateUI(GameState);
}

// Variables for Executive Dysfunction "Wall"
let dysfunctionClicksNeeded = 0;

function doTaskWork() {
    if (!GameState.activeTaskId || GameState.isPaused) return;

    // EXECUTIVE DYSFUNCTION LOGIC
    // If interest is low (low progress) OR Overload high, it might be hard to start
    if (dysfunctionClicksNeeded > 0) {
        dysfunctionClicksNeeded--;

        // Visual Feedback (Button Shake)
        const btn = document.getElementById('btn-perform-action');
        btn.classList.remove('btn-resist');
        void btn.offsetWidth; // trigger reflow
        btn.classList.add('btn-resist');

        if (dysfunctionClicksNeeded === 0) {
            showFloatingText("BROKE THE WALL!", "white");
        } else {
            return; // Click absorbed by the wall
        }
    }

    // Determine if we trigger a randomly high "Wall" for next time
    // Only happens if we are stressed
    if (GameState.overload > 50 && Math.random() < 0.2) {
        dysfunctionClicksNeeded = 3; // Must click 3 times to actually work next time
    }

    // Normal Work Logic
    const task = GameState.tasks[GameState.activeTaskId];

    let gain = 5;
    if (GameState.hyperfocusTarget === task.id) {
        gain = 15;
        // Extend Hyperfocus slightly?
        GameState.hyperfocusTimer += 0.5;
    }

    task.progress = Math.min(100, task.progress + gain);
    OverloadSystem.add(1);

    // Check for Hyperfocus Trigger
    if (!GameState.hyperfocusTarget && Math.random() < 0.05) { // 5% chance per click
        triggerHyperfocus(task.id);
    }

    if (Math.random() < 0.1) {
        GameState.focusPoints = Math.min(100, GameState.focusPoints + 5);
        showFloatingText("In the zone! +5 FP", "cyan");
    }

    updateUI(GameState);
}

function triggerHyperfocus(taskId) {
    console.log("HYPERFOCUS TRIGGERED ON", taskId);
    GameState.hyperfocusTarget = taskId;
    GameState.hyperfocusTimer = 15; // 15 Seconds of glory
    GameState.focusPoints = 100; // Free refill!

    showFloatingText("HYPERFOCUS ACTIVATED!", "gold");
    document.body.classList.add('hyperfocus-active');

    // Update UI immediately to show effect
    updateUI(GameState);
}

function actionStim() {
    if (GameState.focusPoints >= 5) {
        GameState.focusPoints -= 5;
        ImpulsivitySystem.reduce(15);
        showFloatingText("Stimmed! -Impulse", "green");
        updateUI(GameState);
    }
}

function actionBreathe() {
    OverloadSystem.reduce(20);
    updateUI(GameState);
}

function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (!GameState.isPaused) {
        ImpulsivitySystem.update(dt);
        OverloadSystem.update(dt);
        SocialSystem.update(dt);

        // Hyperfocus Timer
        if (GameState.hyperfocusTarget) {
            GameState.hyperfocusTimer -= dt;
            if (GameState.hyperfocusTimer <= 0) {
                // End Hyperfocus
                GameState.hyperfocusTarget = null;
                document.body.classList.remove('hyperfocus-active');
                // Crash energy?
                GameState.focusPoints = 20;
                showFloatingText("Hyperfocus Ended... Crash.", "grey");
            }
        }

        // Task Decay
        for (const key in GameState.tasks) {
            const task = GameState.tasks[key];
            if (key !== GameState.activeTaskId) {
                // Logic: Hyperfocus completely ignores other tasks, so they decay normally (or faster?)
                // Let's make them decay faster to punish the single-mindedness
                const decayMult = GameState.hyperfocusTarget ? 2.0 : 1.0;
                task.progress = Math.max(0, task.progress - (task.decay * dt * decayMult));
            }
        }

        if (GameState.focusPoints < 100) {
            GameState.focusPoints += 0.5 * dt;
        }

        updateUI(GameState);
    }

    requestAnimationFrame(gameLoop);
}

function showFloatingText(text, color) {
    // Simple console fallback for now
    console.log(`% c ${text} `, `color: ${color}; font - size: 1.2rem; font - weight: bold; `);
}

// Reuse Minigame Logic
export function startMinigame(type) {
    GameState.isPaused = true;
    document.getElementById('minigame-overlay').classList.remove('hidden');

    if (type === 'distraction') {
        const game = new DistractionMinigame('minigame-canvas-container', (success) => {
            endMinigame();
            if (success) {
                ImpulsivitySystem.reduce(50);
                GameState.focusPoints += 20;
            }
        });
        GameState.activeMinigame = game;
        game.start();
    }
}

function endMinigame() {
    GameState.isPaused = false;
    GameState.activeMinigame = null;
    document.getElementById('minigame-overlay').classList.add('hidden');
}

window.NeuroGame = {
    state: GameState,
    startMinigame
};

window.onload = initGame;
