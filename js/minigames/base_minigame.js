// Base Minigame Structure

export class Minigame {
    constructor(containerId, onComplete) {
        this.container = document.getElementById(containerId);
        this.onComplete = onComplete;
        this.isActive = false;
    }

    start() {
        this.isActive = true;
        this.setup();
        this.render();
    }

    stop() {
        this.isActive = false;
        this.cleanup();
    }

    setup() {
        // Override me
    }

    render() {
        // Override me
    }

    cleanup() {
        this.container.innerHTML = '';
    }

    finish(success = true) {
        this.stop();
        if (this.onComplete) this.onComplete(success);
    }
}
