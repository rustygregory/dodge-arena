import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants.js';

const THICKNESS = 8;
const SPEED = 240;
const GAP = 70;

export class DiagonalRect {
  constructor(speedMult = 1) {
    this.type = 'diagonalRect';
    this.speed = (SPEED + Math.random() * 60) * speedMult;
    this.thickness = THICKNESS;
    this.done = false;

    const diagonal = Math.random() < 0.5;
    if (diagonal) {
      this.angle = Math.PI / 4;
      const fromTopLeft = Math.random() < 0.5;
      if (fromTopLeft) {
        this.x = -CANVAS_WIDTH * 0.3;
        this.y = -CANVAS_HEIGHT * 0.3;
        this.dx = 1;
        this.dy = 1;
      } else {
        this.x = CANVAS_WIDTH + CANVAS_WIDTH * 0.3;
        this.y = CANVAS_HEIGHT + CANVAS_HEIGHT * 0.3;
        this.dx = -1;
        this.dy = -1;
      }
    } else {
      this.angle = -Math.PI / 4;
      const fromTopRight = Math.random() < 0.5;
      if (fromTopRight) {
        this.x = CANVAS_WIDTH + CANVAS_WIDTH * 0.3;
        this.y = -CANVAS_HEIGHT * 0.3;
        this.dx = -1;
        this.dy = 1;
      } else {
        this.x = -CANVAS_WIDTH * 0.3;
        this.y = CANVAS_HEIGHT + CANVAS_HEIGHT * 0.3;
        this.dx = 1;
        this.dy = -1;
      }
    }

    const perpAngle = this.angle + Math.PI / 2;
    this.moveX = Math.cos(perpAngle) * this.dx;
    this.moveY = Math.sin(perpAngle) * this.dy;

    const len = Math.hypot(CANVAS_WIDTH, CANVAS_HEIGHT) * 1.5;
    this.halfLength = len / 2;

    this.gapCenter = -this.halfLength + GAP + Math.random() * (len - GAP * 2);
  }

  update(dt) {
    this.x += this.moveX * this.speed * dt;
    this.y += this.moveY * this.speed * dt;

    if (this.x < -CANVAS_WIDTH * 0.6 || this.x > CANVAS_WIDTH * 1.6 ||
        this.y < -CANVAS_HEIGHT * 0.6 || this.y > CANVAS_HEIGHT * 1.6) {
      this.done = true;
    }
  }

  getSegments() {
    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);

    const gapHalf = GAP / 2;
    const seg1Start = -this.halfLength;
    const seg1End = this.gapCenter - gapHalf;
    const seg2Start = this.gapCenter + gapHalf;
    const seg2End = this.halfLength;

    return [
      {
        x1: this.x + cos * seg1Start,
        y1: this.y + sin * seg1Start,
        x2: this.x + cos * seg1End,
        y2: this.y + sin * seg1End,
      },
      {
        x1: this.x + cos * seg2Start,
        y1: this.y + sin * seg2Start,
        x2: this.x + cos * seg2End,
        y2: this.y + sin * seg2End,
      },
    ];
  }

  checkCollision(px, py, pr) {
    const segs = this.getSegments();
    for (const seg of segs) {
      if (circleLineSegment(px, py, pr, seg.x1, seg.y1, seg.x2, seg.y2, this.thickness)) {
        return true;
      }
    }
    return false;
  }

  draw(ctx) {
    const segs = this.getSegments();

    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(200, 210, 220, 0.8)';
    ctx.strokeStyle = 'rgba(200, 210, 220, 0.85)';
    ctx.lineWidth = this.thickness;
    ctx.lineCap = 'round';

    for (const seg of segs) {
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
    }

    ctx.shadowBlur = 0;
    ctx.strokeStyle = 'rgba(240, 245, 255, 0.5)';
    ctx.lineWidth = 2;
    for (const seg of segs) {
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
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
