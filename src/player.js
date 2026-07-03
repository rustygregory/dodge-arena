import { PLAYER_RADIUS, PLAYER_SPEED, CANVAS_WIDTH, CANVAS_HEIGHT, KEYBINDINGS } from './constants.js';
import { input } from './input.js';

export class Player {
  constructor(index, color, x, y) {
    this.index = index;
    this.color = color;
    this.x = x;
    this.y = y;
    this.radius = PLAYER_RADIUS;
    this.alive = true;
    this.score = 0;
    this.roundsWon = 0;
    this.opacity = 1;
    this.fadeTimer = 0;
    this.keys = KEYBINDINGS[index];
  }

  update(dt) {
    if (!this.alive) {
      this.fadeTimer += dt;
      this.opacity = Math.max(0, 1 - this.fadeTimer / 0.8);
      return;
    }

    let dx = 0;
    let dy = 0;

    if (input.isDown(this.keys.up)) dy -= 1;
    if (input.isDown(this.keys.down)) dy += 1;
    if (input.isDown(this.keys.left)) dx -= 1;
    if (input.isDown(this.keys.right)) dx += 1;

    if (dx !== 0 && dy !== 0) {
      const diag = 1 / Math.SQRT2;
      dx *= diag;
      dy *= diag;
    }

    this.x += dx * PLAYER_SPEED * dt;
    this.y += dy * PLAYER_SPEED * dt;

    this.x = Math.max(this.radius, Math.min(CANVAS_WIDTH - this.radius, this.x));
    this.y = Math.max(this.radius, Math.min(CANVAS_HEIGHT - this.radius, this.y));
  }

  eliminate() {
    this.alive = false;
    this.fadeTimer = 0;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.alive = true;
    this.opacity = 1;
    this.fadeTimer = 0;
  }
}
