# Implementation Plan: NeuroSpicy - One Continuous Day

# Goal
Refactor the existing prototype into a single continuous "Life Simulator" dashboard. The player manages 5 concurrent tasks (Work, Cook, Clean, Email, Hobby) while battling Impulsivity, Sensory Overload, and Masking usage in real-time.

# Core Concepts
1.  **The Dashboard**: A UI showing 5 task panels side-by-side.
2.  **Focus Points (FP)**: A resource required to switch actions.
3.  **Task Decay**: Tasks regress when not actively worked on.
4.  **Neuro-Meters**:
    *   **Impulsivity**: Rises with stress/failures. Triggers "Meltdown" (locks controls).
    *   **Overload**: Rises with time/events. blurs screen. "Calm Down" action reduces it.
    *   **Masking**: Consumed by random NPC interactions.
5.  **Random Events**:
    *   **Hyperfocus**: Locks you into one task (boosts progress, but ignores others).
    *   **Memory Check**: A modal asking "What was the 3rd item?"
    *   **Social**: NPC appears, demands answer (costs Masking).

# Proposed Changes

## 1. Data Structure Update (`js/main.js`)
- Update `GameState` to include:
    - `tasks`: Object with 5 task entries `{ id, name, progress, decayRate }`.
    - `resources`: `{ focus: 10, masking: 100 }`.
    - `timers`: `dayTime` (0-30 mins).

## 2. UI Overhaul (`index.html` & `css/style.css`)
- **Top Bar**: Resources (Focus, Masking), Impulse Meter, Overload Meter.
- **Main Grid**: 5 Cards for the tasks.
    - Each card has: Name, Progress Bar, "Active" indicator.
    - Click to "Switch To" (costs Focus).
    - "Active" task has a "Work" button (or auto-progresses?). *Decision: Active clicks generate progress.*
- **Action Bar**: Global actions like "Breathe/Focus" (Reduce Overload), "Stim" (Reduce Impulse, costs Focus).

## 3. Mechanics Implementation
- **Task Switching**: Logic to deduct Focus Points and change the `activeTaskId`.
- **Decay System**: In `gameLoop`, reduce progress of inactive tasks.
- **Hyperfocus Event**: Randomly set `lockedTask` and boost multiplier.
- **Social Event**: Simple modal "Coworker asks about weekend", choices cost Masking or increase Impulse.

## 4. Minigame Integration (Existing)
- Keep the "Distraction Bubble Pop" as the mechanic for **Meltdown/Hijack**.
- If Impulse > 100 -> Trigger Bubble Game.

# Step-by-Step
1.  **Refactor HTML/CSS**: Build the 5-column dashboard layout.
2.  **Update State**: Initialize the 5 tasks in `main.js`.
3.  **Implement Task Loop**: Clicking tasks updates progress; Inactive tasks decay.
4.  **Add Resources**: implement Focus Points and Masking Display.
5.  **Event Integration**: Add the Hyperfocus and Social triggers.
