import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants.js';

const CORNERS = [
  { x: 0, y: 0 },
  { x: CANVAS_WIDTH, y: 0 },
  { x: 0, y: CANVAS_HEIGHT },
  { x: CANVAS_WIDTH, y: CANVAS_HEIGHT },
];

const DIAGONALS = [
  { dx: 1, dy: 1 },
  { dx: -1, dy: 1 },
  { dx: 1, dy: -1 },
  { dx: -1, dy: -1 },
];

const WARN_DURATION = 1.5;
const GROW_DURATION = 0.6;
const HOLD_DURATION = 1.0;
const FADE_DURATION = 0.4;
const MAX_LENGTH = Math.hypot(CANVAS_WIDTH, CANVAS_HEIGHT) * 0.55;
const THICKNESS = 10;

export class GoldSpark {
  constructor() {
    this.type = 'goldSpark';
    this.timer = 0;
    this.phase = 'warning';
    this.done = false;
    this.currentLength = 0;
  }

  update(dt) {
    this.timer += dt;

    if (this.phase === 'warning' && this.timer >= WARN_DURATION) {
      this.phase = 'growing';
      this.timer = 0;
    } else if (this.phase === 'growing' && this.timer >= GROW_DURATION) {
      this.phase = 'holding';
      this.timer = 0;
    } else if (this.phase === 'holding' && this.timer >= HOLD_DURATION) {
      this.phase = 'fading';
      this.timer = 0;
    } else if (this.phase === 'fading' && this.timer >= FADE_DURATION) {
      this.done = true;
    }

    if (this.phase === 'growing') {
      this.currentLength = (this.timer / GROW_DURATION) * MAX_LENGTH;
    } else if (this.phase === 'holding' || this.phase === 'fading') {
      this.currentLength = MAX_LENGTH;
    }
  }

  getLaserLines() {
    const lines = [];
    for (let i = 0; i < 4; i++) {
      const corner = CORNERS[i];
      const dir = DIAGONALS[i];
      const len = this.currentLength;
      lines.push({
        x1: corner.x,
        y1: corner.y,
        x2: corner.x + dir.dx * len,
        y2: corner.y + dir.dy * len,
      });
    }
    return lines;
  }

  checkCollision(px, py, pr) {
    if (this.phase !== 'growing' && this.phase !== 'holding') return false;
    const lines = this.getLaserLines();
    for (const line of lines) {
      if (circleLineSegment(px, py, pr, line.x1, line.y1, line.x2, line.y2, THICKNESS)) {
        return true;
      }
    }
    return false;
  }

  draw(ctx) {
    ctx.save();

    const shimmer = 0.5 + 0.5 * Math.sin(this.timer * 12);
    const shimmer2 = 0.5 + 0.5 * Math.sin(this.timer * 18 + 1.5);

    if (this.phase === 'warning') {
      const pulse = 0.5 + 0.5 * Math.sin(this.timer * 8);
      const alpha = 0.3 + pulse * 0.4;

      for (let i = 0; i < 4; i++) {
        const corner = CORNERS[i];
        const dir = DIAGONALS[i];

        ctx.shadowBlur = 20 + shimmer * 15;
        ctx.shadowColor = `rgba(255, 215, 0, ${alpha})`;
        ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(corner.x, corner.y, 8 + pulse * 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 220, ${alpha * shimmer2 * 0.8})`;
        ctx.beginPath();
        ctx.arc(corner.x, corner.y, 4 + pulse * 2, 0, Math.PI * 2);
        ctx.fill();

        this.drawSparkles(ctx, corner.x, corner.y, alpha, 12);

        ctx.setLineDash([4, 8]);
        ctx.strokeStyle = `rgba(255, 215, 0, ${alpha * 0.5})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(corner.x, corner.y);
        ctx.lineTo(corner.x + dir.dx * MAX_LENGTH, corner.y + dir.dy * MAX_LENGTH);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    } else {
      let alpha = 1;
      if (this.phase === 'fading') {
        alpha = 1 - this.timer / FADE_DURATION;
      }

      const lines = this.getLaserLines();

      ctx.shadowBlur = 30 + shimmer * 20;
      ctx.shadowColor = `rgba(255, 215, 0, ${alpha})`;
      ctx.strokeStyle = `rgba(255, 215, 0, ${alpha * 0.9})`;
      ctx.lineWidth = THICKNESS;
      ctx.lineCap = 'round';

      for (const line of lines) {
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
      }

      ctx.shadowBlur = 10 + shimmer2 * 8;
      ctx.shadowColor = `rgba(255, 255, 200, ${alpha * 0.6})`;
      ctx.strokeStyle = `rgba(255, 255, 220, ${alpha * (0.5 + shimmer2 * 0.4)})`;
      ctx.lineWidth = 3;
      for (const line of lines) {
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
      }

      for (const line of lines) {
        const midX = (line.x1 + line.x2) / 2;
        const midY = (line.y1 + line.y2) / 2;
        const q1X = (line.x1 + midX) / 2;
        const q1Y = (line.y1 + midY) / 2;
        const q3X = (midX + line.x2) / 2;
        const q3Y = (midY + line.y2) / 2;
        this.drawSparkles(ctx, midX, midY, alpha, 8);
        this.drawSparkles(ctx, q1X, q1Y, alpha * 0.7, 6);
        this.drawSparkles(ctx, q3X, q3Y, alpha * 0.7, 6);
      }

      for (let i = 0; i < 4; i++) {
        const corner = CORNERS[i];
        ctx.shadowBlur = 35 + shimmer * 20;
        ctx.shadowColor = `rgba(255, 215, 0, ${alpha})`;
        ctx.fillStyle = `rgba(255, 255, 150, ${alpha})`;
        ctx.beginPath();
        ctx.arc(corner.x, corner.y, 12 + shimmer * 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * (0.6 + shimmer2 * 0.4)})`;
        ctx.beginPath();
        ctx.arc(corner.x, corner.y, 5 + shimmer2 * 2, 0, Math.PI * 2);
        ctx.fill();

        this.drawSparkles(ctx, corner.x, corner.y, alpha, 16);
      }
    }

    ctx.restore();
  }

  drawSparkles(ctx, cx, cy, alpha, radius) {
    const t = this.timer * 6;
    const count = 4;
    for (let i = 0; i < count; i++) {
      const angle = t + (i * Math.PI * 2) / count;
      const dist = radius * (0.6 + 0.4 * Math.sin(t * 2 + i));
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy + Math.sin(angle) * dist;
      const size = 1.5 + Math.sin(t * 3 + i * 2) * 1;

      ctx.shadowBlur = 6;
      ctx.shadowColor = `rgba(255, 255, 200, ${alpha * 0.8})`;
      ctx.fillStyle = `rgba(255, 255, 220, ${alpha * 0.9})`;
      ctx.beginPath();
      ctx.moveTo(sx, sy - size);
      ctx.lineTo(sx + size * 0.4, sy);
      ctx.lineTo(sx, sy + size);
      ctx.lineTo(sx - size * 0.4, sy);
      ctx.closePath();
      ctx.fill();
    }
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
