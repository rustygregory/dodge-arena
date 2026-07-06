class InputManager {
  constructor() {
    this.keysDown = new Set();
    this.keysPressed = new Set();
    this.onFirstInput = null;

    const triggerFirstInput = () => {
      if (this.onFirstInput) {
        this.onFirstInput();
        this.onFirstInput = null;
      }
    };

    window.addEventListener('keydown', (e) => {
      if (!this.keysDown.has(e.key)) {
        this.keysPressed.add(e.key);
      }
      this.keysDown.add(e.key);

      if (e.key.startsWith('Arrow')) {
        e.preventDefault();
      }

      triggerFirstInput();
    });

    window.addEventListener('keyup', (e) => {
      this.keysDown.delete(e.key);
    });

    window.addEventListener('click', triggerFirstInput);
    window.addEventListener('touchstart', triggerFirstInput);
  }

  isDown(key) {
    return this.keysDown.has(key) || this.keysDown.has(key.toLowerCase());
  }

  wasPressed(key) {
    return this.keysPressed.has(key) || this.keysPressed.has(key.toLowerCase());
  }

  clearPressed() {
    this.keysPressed.clear();
  }
}

export const input = new InputManager();
