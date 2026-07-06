import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants.js';

const BOUNCE_DURATION = {
  normal: 10,
  hard: 15,
  nightmare: 30,
};

const SPEED = 260;
const SIZE = 22;

export class Triangle {
  constructor(difficulty = 'normal') {
    this.type = 'triangle';
    this.size = SIZE;
    this.speed = SPEED;
    this.duration = BOUNCE_DURATION[difficulty] || 4;
    this.timer = 0;
    this.done = false;
    this.rotation = 0;

    const side = Math.floor(Math.random() * 4);
    if (side === 0) {
      this.x = Math.random() * CANVAS_WIDTH;
      this.y = -this.size;
    } else if (side === 1) {
      this.x = Math.random() * CANVAS_WIDTH;
      this.y = CANVAS_HEIGHT + this.size;
    } else if (side === 2) {
      this.x = -this.size;
      this.y = Math.random() * CANVAS_HEIGHT;
    } else {
      this.x = CANVAS_WIDTH + this.size;
      this.y = Math.random() * CANVAS_HEIGHT;
    }

    const angle = Math.atan2(CANVAS_HEIGHT / 2 - this.y, CANVAS_WIDTH / 2 - this.x)
      + (Math.random() - 0.5) * 0.8;
    this.vx = Math.cos(angle) * this.speed;
    this.vy = Math.sin(angle) * this.speed;
  }

  update(dt) {
    this.timer += dt;
    if (this.timer >= this.duration) {
      this.done = true;
      return;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += dt * 4;

    if (this.x - this.size < 0) {
      this.x = this.size;
      this.vx = Math.abs(this.vx);
    } else if (this.x + this.size > CANVAS_WIDTH) {
      this.x = CANVAS_WIDTH - this.size;
      this.vx = -Math.abs(this.vx);
    }

    if (this.y - this.size < 0) {
      this.y = this.size;
      this.vy = Math.abs(this.vy);
    } else if (this.y + this.size > CANVAS_HEIGHT) {
      this.y = CANVAS_HEIGHT - this.size;
      this.vy = -Math.abs(this.vy);
    }
  }

  checkCollision(px, py, pr) {
    const dist = Math.hypot(px - this.x, py - this.y);
    return dist < pr + this.size * 0.8;
  }

  draw(ctx) {
    ctx.save();

    let alpha = 1;
    if (this.timer < 0.3) {
      alpha = this.timer / 0.3;
    } else if (this.timer > this.duration - 0.5) {
      alpha = (this.duration - this.timer) / 0.5;
    }

    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    ctx.shadowBlur = 15;
    ctx.shadowColor = `rgba(0, 255, 100, ${alpha})`;
    ctx.fillStyle = `rgba(0, 255, 100, ${alpha * 0.8})`;
    ctx.strokeStyle = `rgba(150, 255, 200, ${alpha})`;
    ctx.lineWidth = 2;

    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3 - Math.PI / 2;
      const x = Math.cos(angle) * this.size;
      const y = Math.sin(angle) * this.size;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(200, 255, 220, ${alpha * 0.5})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3 - Math.PI / 2;
      const x = Math.cos(angle) * this.size * 0.5;
      const y = Math.sin(angle) * this.size * 0.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }
}
