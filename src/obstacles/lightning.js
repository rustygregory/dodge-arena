import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants.js';

const CORNERS = [
  { x: 0, y: 0 },
  { x: CANVAS_WIDTH, y: 0 },
  { x: 0, y: CANVAS_HEIGHT },
  { x: CANVAS_WIDTH, y: CANVAS_HEIGHT },
];

export class Lightning {
  constructor() {
    this.type = 'lightning';
    const corner = CORNERS[Math.floor(Math.random() * CORNERS.length)];
    this.timer = 0;
    this.phase = 'warning';
    this.done = false;
    this.thickness = 10;
    this.warnDuration = 1.2;
    this.strikeDuration = 0.8;
    this.fadeDuration = 0.4;

    this.segments = this.generatePath(corner.x, corner.y);
  }

  generatePath(startX, startY) {
    const segments = [{ x: startX, y: startY }];
    let x = startX;
    let y = startY;

    const targetX = startX === 0 ? CANVAS_WIDTH * (0.5 + Math.random() * 0.4) : CANVAS_WIDTH * (0.1 + Math.random() * 0.4);
    const targetY = startY === 0 ? CANVAS_HEIGHT * (0.5 + Math.random() * 0.4) : CANVAS_HEIGHT * (0.1 + Math.random() * 0.4);

    const numSegments = 8 + Math.floor(Math.random() * 6);
    for (let i = 1; i <= numSegments; i++) {
      const t = i / numSegments;
      const baseX = startX + (targetX - startX) * t;
      const baseY = startY + (targetY - startY) * t;

      const jitterX = (Math.random() - 0.5) * 80;
      const jitterY = (Math.random() - 0.5) * 80;

      x = baseX + jitterX;
      y = baseY + jitterY;

      x = Math.max(0, Math.min(CANVAS_WIDTH, x));
      y = Math.max(0, Math.min(CANVAS_HEIGHT, y));

      segments.push({ x, y });
    }

    return segments;
  }

  update(dt) {
    this.timer += dt;

    if (this.phase === 'warning' && this.timer >= this.warnDuration) {
      this.phase = 'strike';
      this.timer = 0;
    } else if (this.phase === 'strike' && this.timer >= this.strikeDuration) {
      this.phase = 'fading';
      this.timer = 0;
    } else if (this.phase === 'fading' && this.timer >= this.fadeDuration) {
      this.done = true;
    }
  }

  isColliding() {
    return this.phase === 'strike';
  }

  checkCollision(px, py, pr) {
    if (!this.isColliding()) return false;

    for (let i = 0; i < this.segments.length - 1; i++) {
      const s1 = this.segments[i];
      const s2 = this.segments[i + 1];
      if (circleLineSegment(px, py, pr, s1.x, s1.y, s2.x, s2.y, this.thickness)) {
        return true;
      }
    }
    return false;
  }

  draw(ctx) {
    ctx.save();

    if (this.phase === 'warning') {
      const pulse = 0.3 + 0.4 * Math.sin(this.timer * 10);
      ctx.strokeStyle = `rgba(180, 200, 255, ${pulse})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 6]);
      ctx.shadowBlur = 6;
      ctx.shadowColor = 'rgba(180, 200, 255, 0.5)';

      ctx.beginPath();
      ctx.moveTo(this.segments[0].x, this.segments[0].y);
      for (let i = 1; i < this.segments.length; i++) {
        ctx.lineTo(this.segments[i].x, this.segments[i].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      let alpha = 1;
      if (this.phase === 'fading') {
        alpha = 1 - this.timer / this.fadeDuration;
      }

      // Outer glow
      ctx.shadowBlur = 25;
      ctx.shadowColor = `rgba(180, 200, 255, ${alpha})`;
      ctx.strokeStyle = `rgba(120, 160, 255, ${alpha * 0.7})`;
      ctx.lineWidth = this.thickness + 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(this.segments[0].x, this.segments[0].y);
      for (let i = 1; i < this.segments.length; i++) {
        ctx.lineTo(this.segments[i].x, this.segments[i].y);
      }
      ctx.stroke();

      // Core bolt
      ctx.shadowBlur = 15;
      ctx.shadowColor = `rgba(255, 255, 255, ${alpha})`;
      ctx.strokeStyle = `rgba(220, 240, 255, ${alpha})`;
      ctx.lineWidth = this.thickness;

      ctx.beginPath();
      ctx.moveTo(this.segments[0].x, this.segments[0].y);
      for (let i = 1; i < this.segments.length; i++) {
        ctx.lineTo(this.segments[i].x, this.segments[i].y);
      }
      ctx.stroke();

      // Bright inner line
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.moveTo(this.segments[0].x, this.segments[0].y);
      for (let i = 1; i < this.segments.length; i++) {
        ctx.lineTo(this.segments[i].x, this.segments[i].y);
      }
      ctx.stroke();
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
