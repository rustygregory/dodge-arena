import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants.js';

const WARN_DURATION = 1.8;
const EXPLODE_DURATION = 1.2;
const FADE_DURATION = 0.4;
const LINE_COUNT = 10;
const LINE_LENGTH = 200;
const LINE_THICKNESS = 5;

export class NovaCircle {
  constructor() {
    this.type = 'novaCircle';
    this.x = 80 + Math.random() * (CANVAS_WIDTH - 160);
    this.y = 80 + Math.random() * (CANVAS_HEIGHT - 160);
    this.radius = 20;
    this.timer = 0;
    this.phase = 'warning';
    this.done = false;

    this.lineAngles = [];
    for (let i = 0; i < LINE_COUNT; i++) {
      this.lineAngles.push((i * Math.PI * 2) / LINE_COUNT + (Math.random() - 0.5) * 0.3);
    }
  }

  update(dt) {
    this.timer += dt;

    if (this.phase === 'warning' && this.timer >= WARN_DURATION) {
      this.phase = 'exploding';
      this.timer = 0;
    } else if (this.phase === 'exploding' && this.timer >= EXPLODE_DURATION) {
      this.phase = 'fading';
      this.timer = 0;
    } else if (this.phase === 'fading' && this.timer >= FADE_DURATION) {
      this.done = true;
    }
  }

  getLines() {
    const progress = Math.min(1, this.timer / 0.3);
    const len = LINE_LENGTH * progress;
    return this.lineAngles.map(angle => ({
      x1: this.x + Math.cos(angle) * this.radius,
      y1: this.y + Math.sin(angle) * this.radius,
      x2: this.x + Math.cos(angle) * (this.radius + len),
      y2: this.y + Math.sin(angle) * (this.radius + len),
    }));
  }

  checkCollision(px, py, pr) {
    if (this.phase !== 'exploding') return false;

    const dist = Math.hypot(px - this.x, py - this.y);
    if (dist < pr + this.radius) return true;

    const lines = this.getLines();
    for (const line of lines) {
      if (circleLineSegment(px, py, pr, line.x1, line.y1, line.x2, line.y2, LINE_THICKNESS)) {
        return true;
      }
    }
    return false;
  }

  draw(ctx) {
    ctx.save();

    if (this.phase === 'warning') {
      const pulse = 0.5 + 0.5 * Math.sin(this.timer * 10);
      const growProgress = this.timer / WARN_DURATION;
      const currentRadius = this.radius * (0.5 + growProgress * 0.5);
      const alpha = 0.4 + pulse * 0.4;

      ctx.shadowBlur = 25 + pulse * 15;
      ctx.shadowColor = `rgba(255, 255, 255, ${alpha})`;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 2 + pulse;
      ctx.beginPath();
      ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, currentRadius * 0.6, 0, Math.PI * 2);
      ctx.fill();

      if (growProgress > 0.5) {
        ctx.setLineDash([2, 6]);
        ctx.strokeStyle = `rgba(255, 255, 255, ${(growProgress - 0.5) * 0.4})`;
        ctx.lineWidth = 1;
        for (const angle of this.lineAngles) {
          ctx.beginPath();
          ctx.moveTo(
            this.x + Math.cos(angle) * currentRadius,
            this.y + Math.sin(angle) * currentRadius
          );
          ctx.lineTo(
            this.x + Math.cos(angle) * (currentRadius + LINE_LENGTH * 0.4),
            this.y + Math.sin(angle) * (currentRadius + LINE_LENGTH * 0.4)
          );
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }
    } else {
      let alpha = 1;
      if (this.phase === 'fading') {
        alpha = 1 - this.timer / FADE_DURATION;
      }

      ctx.shadowBlur = 30;
      ctx.shadowColor = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 0.5, 0, Math.PI * 2);
      ctx.fill();

      const lines = this.getLines();
      ctx.shadowBlur = 20;
      ctx.shadowColor = `rgba(255, 255, 255, ${alpha})`;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
      ctx.lineWidth = LINE_THICKNESS;
      ctx.lineCap = 'round';

      for (const line of lines) {
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
      }

      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
      ctx.lineWidth = 2;
      for (const line of lines) {
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}

function circleLineSegment(cx, cy, cr, x1, y1, x2, y2, thickness) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    return Math.hypot(cx - x1, cy - y1) < cr + thickness / 2;
  }
  let t = ((cx - x1) * dx + (cy - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const closestX = x1 + t * dx;
  const closestY = y1 + t * dy;
  const dist = Math.hypot(cx - closestX, cy - closestY);
  return dist < cr + thickness / 2;
}
