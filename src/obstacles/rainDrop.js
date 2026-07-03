import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants.js';

export class RainDrop {
  constructor() {
    this.type = 'rainDrop';
    this.x = Math.random() * CANVAS_WIDTH;
    this.y = -10;
    this.radius = 6 + Math.random() * 4;
    this.speed = 200 + Math.random() * 150;
    this.done = false;
  }

  update(dt) {
    this.y += this.speed * dt;
    if (this.y > CANVAS_HEIGHT + this.radius) {
      this.done = true;
    }
  }

  isColliding() {
    return this.y > 0;
  }

  draw(ctx) {
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#66bbff';
    ctx.fillStyle = 'rgba(100, 180, 255, 0.5)';
    ctx.strokeStyle = '#66bbff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}
