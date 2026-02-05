// UI Handling Module

export function initUI() {
    // Initial Setup
}

export function updateUI(state) {
    // 1. Update Global Meters
    setStyleWidth('meter-impulsivity', state.impulsivity);
    setStyleWidth('meter-overload', state.overload);
    setStyleWidth('meter-masking', state.maskingEnergy);

    document.getElementById('val-focus').innerText = Math.floor(state.focusPoints);
    document.getElementById('time-display').innerText = formatTime(state.gameHour);

    // 2. Update Task Cards
    for (const key in state.tasks) {
        const task = state.tasks[key];
        const barId = `prog-${key}`;
        const cardId = `task-${key}`;

        // Height for progress since we are doing vertical bars now? 
        // CSS says width: 20px, height: 100%. inner bar width 100%, height var.
        const bar = document.getElementById(barId);
        if (bar) {
            bar.style.height = `${task.progress}%`;
        }

        // Active State
        const card = document.getElementById(cardId);
        if (state.activeTaskId === key) {
            card.classList.add('active');
        } else {
            card.classList.remove('active');
        }
    }

    // 3. Update Action Area
    const btnAction = document.getElementById('btn-perform-action');
    const title = document.getElementById('active-task-title');

    if (state.activeTaskId) {
        const task = state.tasks[state.activeTaskId];
        title.innerText = `Focusing on: ${task.name}`;
        btnAction.classList.remove('disabled');
        btnAction.innerText = "Do Task (+Progress)";
    } else {
        title.innerText = "Select a Task...";
        btnAction.classList.add('disabled');
    }

    // 4. Overload Filters
    const grid = document.getElementById('game-container');
    grid.className = '';
    if (state.overload > 80) grid.classList.add('overload-stage-3');
    else if (state.overload > 50) grid.classList.add('overload-stage-2');
    else if (state.overload > 20) grid.classList.add('overload-stage-1');
}

function setStyleWidth(id, val) {
    const el = document.getElementById(id);
    if (el) el.style.width = `${val}%`;
}

function formatTime(hour) {
    // Dummy implementation. In real thing update hour based on timer
    // For now simple static
    return "10:30 AM";
}
