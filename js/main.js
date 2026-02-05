// Main Game Logic - NeuroSpicy Daily Grind
import { initUI, updateUI } from './ui.js';
import { ImpulsivitySystem } from './mechanics/impulsivity.js';
import { OverloadSystem } from './mechanics/overload.js';
import { DistractionMinigame } from './minigames/distraction.js';

export const GameState = {
    // Resources
    focusPoints: 100,
    maskingEnergy: 100,

    // Time
    dayTimer: 0, // Seconds passed
    gameHour: 9, // Starts at 9 AM

    // Task Management
    activeTaskId: null,
    tasks: {
        work: { id: 'work', name: 'Work Project', progress: 50, decay: 1.5, color: '#4caf50' },
        cook: { id: 'cook', name: 'Meal Prep', progress: 20, decay: 2.0, color: '#ff9800' },
        clean: { id: 'clean', name: 'House Cleaning', progress: 30, decay: 1.0, color: '#2196f3' },
        email: { id: 'email', name: 'Inbox Zero', progress: 10, decay: 3.0, color: '#e91e63' },
        hobby: { id: 'hobby', name: 'Painting', progress: 0, decay: 1.0, color: '#9c27b0' }
    },

    // Meters
    impulsivity: 0,
    overload: 0,

    // Flags
    isPaused: false,
    activeMinigame: null,
    hyperfocusTarget: null, // If set, can only work on this

    constants: {
        SWITCH_COST: 10,
        WORK_Example_GAIN: 5,
        TICK_RATE: 60
    }
};

let lastTime = 0;

function initGame() {
    console.log("NeuroSpicy Daily Grind Initializing...");

    initUI();
    ImpulsivitySystem.init();
    OverloadSystem.init();

    // Setup Global Select for HTML onclicks
    window.selectTask = selectTask;

    // Action Buttons
    document.getElementById('btn-perform-action').addEventListener('click', doTaskWork);
    document.getElementById('btn-stim').addEventListener('click', actionStim);
    document.getElementById('btn-breathe').addEventListener('click', actionBreathe);

    requestAnimationFrame(gameLoop);
}

function selectTask(taskId) {
    if (GameState.isPaused) return;

    if (GameState.activeTaskId === taskId) return; // Already active

    // Check Costs
    if (GameState.focusPoints < GameState.constants.SWITCH_COST) {
        showFloatingText("Not enough Focus!", "red");
        return;
    }

    if (GameState.hyperfocusTarget && GameState.hyperfocusTarget !== taskId) {
        showFloatingText("LOCKED BY HYPERFOCUS!", "purple");
        return;
    }

    // Deduct cost and switch
    GameState.focusPoints -= GameState.constants.SWITCH_COST;
    GameState.activeTaskId = taskId;

    // Add a bit of impulsivity/stress on switch (Cognitive switching penalty)
    ImpulsivitySystem.add(2);

    updateUI(GameState);
}

function doTaskWork() {
    if (!GameState.activeTaskId || GameState.isPaused) return;

    const task = GameState.tasks[GameState.activeTaskId];

    // Gain Progress
    let gain = 5;
    if (GameState.hyperfocusTarget === task.id) gain = 15; // Boost!

    task.progress = Math.min(100, task.progress + gain);

    // Cost
    OverloadSystem.add(1); // Working adds strain

    // Reward?
    if (Math.random() < 0.1) {
        // Occasional Focus refund (Flow state)
        GameState.focusPoints = Math.min(100, GameState.focusPoints + 5);
        showFloatingText("In the zone! +5 FP", "cyan");
    }

    updateUI(GameState);
}

function actionStim() {
    if (GameState.focusPoints >= 5) {
        GameState.focusPoints -= 5;
        ImpulsivitySystem.reduce(15);
        showFloatingText("Stimmed! -Impulse", "green");
    }
}

function actionBreathe() {
    OverloadSystem.reduce(20);
    // Maybe costs time?
}

function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    if (!GameState.isPaused) {
        // 1. Update Systems
        ImpulsivitySystem.update(dt);
        OverloadSystem.update(dt);

        // 2. Task Decay (Real-time pressure!)
        for (const key in GameState.tasks) {
            const task = GameState.tasks[key];
            if (key !== GameState.activeTaskId) {
                // Inactive tasks decay
                task.progress = Math.max(0, task.progress - (task.decay * dt));
            }
        }

        // 3. Time Passive Focus Regen ?
        // Maybe very slow?
        if (GameState.focusPoints < 100) {
            GameState.focusPoints += 0.5 * dt;
        }

        updateUI(GameState);
    }

    requestAnimationFrame(gameLoop);
}

function showFloatingText(text, color) {
    console.log(`FLOAT: ${text} (${color})`);
    // Ideally spawn a DOM element at mouse or center
    // For now, logging.
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
                GameState.focusPoints += 20; // Recover focus
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
