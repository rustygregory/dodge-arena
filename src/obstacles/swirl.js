import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants.js';

export class Swirl {
  constructor() {
    this.type = 'swirl';
    this.cx = CANVAS_WIDTH / 2;
    this.cy = CANVAS_HEIGHT / 2;
    this.timer = 0;
    this.duration = 3.5;
    this.maxRadius = Math.max(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.6;
    this.rotations = 3;
    this.thickness = 6;
    this.done = false;
  }

  update(dt) {
    this.timer += dt;
    if (this.timer >= this.duration) {
      this.done = true;
    }
  }

  isColliding() {
    return this.timer > 0.3 && this.timer < this.duration - 0.3;
  }

  getArmPoints() {
    const progress = Math.min(1, this.timer / this.duration);
    const currentRadius = this.maxRadius * progress;
    const totalAngle = this.rotations * Math.PI * 2 * progress;

    const points = [];
    const steps = 60;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const r = currentRadius * t;
      const angle = totalAngle * t;
      points.push({
        x: this.cx + Math.cos(angle) * r,
        y: this.cy + Math.sin(angle) * r,
      });
    }
    return points;
  }

  checkCollision(px, py, pr) {
    if (!this.isColliding()) return false;
    const points = this.getArmPoints();
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      if (circleLineSegment(px, py, pr, p1.x, p1.y, p2.x, p2.y, this.thickness)) {
        return true;
      }
    }
    return false;
  }

  draw(ctx) {
    const progress = Math.min(1, this.timer / this.duration);
    const points = this.getArmPoints();
    if (points.length < 2) return;

    ctx.save();

    let alpha = 1;
    if (this.timer < 0.3) {
      alpha = this.timer / 0.3;
    } else if (this.timer > this.duration - 0.3) {
      alpha = (this.duration - this.timer) / 0.3;
    }

    ctx.shadowBlur = 15;
    ctx.shadowColor = `rgba(255, 0, 255, ${alpha})`;
    ctx.strokeStyle = `rgba(255, 0, 255, ${alpha * 0.9})`;
    ctx.lineWidth = this.thickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Bright inner line
    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(255, 200, 255, ${alpha * 0.6})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    ctx.restore();
  }
}

function circleLineSegment(cx, cy, cr, x1, y1, x2, y2, thickness) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) {
    const d = Math.hypot(cx - x1, cy - y1);
    return d < cr + thickness / 2;
  }
  let t = ((cx - x1) * dx + (cy - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  const closestX = x1 + t * dx;
  const closestY = y1 + t * dy;
  const dist = Math.hypot(cx - closestX, cy - closestY);
  return dist < cr + thickness / 2;
}
