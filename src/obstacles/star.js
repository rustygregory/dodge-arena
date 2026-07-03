import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants.js';

const CORNERS = [
  { x: 50, y: 50 },
  { x: CANVAS_WIDTH - 50, y: 50 },
  { x: 50, y: CANVAS_HEIGHT - 50 },
  { x: CANVAS_WIDTH - 50, y: CANVAS_HEIGHT - 50 },
];

export class Star {
  constructor(cornerIndex, randomPos = false) {
    this.type = 'star';
    if (randomPos) {
      this.x = 80 + Math.random() * (CANVAS_WIDTH - 160);
      this.y = 80 + Math.random() * (CANVAS_HEIGHT - 160);
    } else {
      const idx = cornerIndex !== undefined ? cornerIndex : Math.floor(Math.random() * CORNERS.length);
      const corner = CORNERS[idx];
      this.x = corner.x;
      this.y = corner.y;
    }
    this.points = 5;
    this.outerRadius = 25;
    this.innerRadius = 12;
    this.rotation = Math.random() * Math.PI * 2;
    this.timer = 0;
    this.phase = 'warning';
    this.done = false;

    this.laserLength = Math.max(CANVAS_WIDTH, CANVAS_HEIGHT);
    this.laserThickness = 6;
    this.warnDuration = 2.0;
    this.fireDuration = 1.5;
    this.fadeDuration = 0.4;
  }

  update(dt) {
    this.timer += dt;

    if (this.phase === 'warning' && this.timer >= this.warnDuration) {
      this.phase = 'firing';
      this.timer = 0;
    } else if (this.phase === 'firing' && this.timer >= this.fireDuration) {
      this.phase = 'fading';
      this.timer = 0;
    } else if (this.phase === 'fading' && this.timer >= this.fadeDuration) {
      this.done = true;
    }

    if (this.phase === 'warning') {
      this.rotation += dt * 0.5;
    }
  }

  isColliding() {
    return this.phase === 'firing';
  }

  getStarPoints() {
    const pts = [];
    for (let i = 0; i < this.points; i++) {
      const angle = this.rotation + (i * Math.PI * 2) / this.points - Math.PI / 2;
      pts.push({
        x: this.x + Math.cos(angle) * this.outerRadius,
        y: this.y + Math.sin(angle) * this.outerRadius,
        angle,
      });
    }
    return pts;
  }

  getLaserLines() {
    const pts = this.getStarPoints();
    return pts.map(p => ({
      x1: p.x,
      y1: p.y,
      x2: p.x + Math.cos(p.angle) * this.laserLength,
      y2: p.y + Math.sin(p.angle) * this.laserLength,
    }));
  }

  checkCollision(px, py, pr) {
    if (!this.isColliding()) return false;

    // Check star body
    const dist = Math.hypot(px - this.x, py - this.y);
    if (dist < pr + this.outerRadius) return true;

    // Check laser beams from points
    const lines = this.getLaserLines();
    for (const line of lines) {
      if (circleLineSegment(px, py, pr, line.x1, line.y1, line.x2, line.y2, this.laserThickness)) {
        return true;
      }
    }
    return false;
  }

  draw(ctx) {
    ctx.save();

    let alpha = 1;
    if (this.phase === 'fading') {
      alpha = 1 - this.timer / this.fadeDuration;
    }

    // Draw star body
    const starPts = this.getStarPoints();
    const innerPts = [];
    for (let i = 0; i < this.points; i++) {
      const angle = this.rotation + ((i + 0.5) * Math.PI * 2) / this.points - Math.PI / 2;
      innerPts.push({
        x: this.x + Math.cos(angle) * this.innerRadius,
        y: this.y + Math.sin(angle) * this.innerRadius,
      });
    }

    ctx.shadowBlur = 20;
    ctx.shadowColor = `rgba(255, 255, 0, ${alpha})`;

    if (this.phase === 'warning') {
      const pulse = 0.5 + 0.5 * Math.sin(this.timer * 6);
      ctx.strokeStyle = `rgba(255, 255, 0, ${(0.4 + pulse * 0.4) * alpha})`;
      ctx.lineWidth = 2;

      ctx.beginPath();
      for (let i = 0; i < this.points; i++) {
        const op = starPts[i];
        const ip = innerPts[i];
        if (i === 0) ctx.moveTo(op.x, op.y);
        else ctx.lineTo(op.x, op.y);
        ctx.lineTo(ip.x, ip.y);
      }
      ctx.closePath();
      ctx.stroke();

      // Warning lines from points
      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = `rgba(255, 255, 0, ${0.2 + pulse * 0.2})`;
      ctx.lineWidth = 1;
      for (const p of starPts) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + Math.cos(p.angle) * this.laserLength, p.y + Math.sin(p.angle) * this.laserLength);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    } else {
      // Solid star
      ctx.fillStyle = `rgba(255, 255, 0, ${0.8 * alpha})`;
      ctx.strokeStyle = `rgba(255, 255, 100, ${alpha})`;
      ctx.lineWidth = 2;

      ctx.beginPath();
      for (let i = 0; i < this.points; i++) {
        const op = starPts[i];
        const ip = innerPts[i];
        if (i === 0) ctx.moveTo(op.x, op.y);
        else ctx.lineTo(op.x, op.y);
        ctx.lineTo(ip.x, ip.y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Laser beams from star points
      ctx.shadowBlur = 18;
      ctx.shadowColor = `rgba(255, 255, 0, ${alpha})`;
      ctx.strokeStyle = `rgba(255, 255, 0, ${alpha * 0.9})`;
      ctx.lineWidth = this.laserThickness;
      ctx.lineCap = 'round';

      const lines = this.getLaserLines();
      for (const line of lines) {
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
      }

      // Bright core of beams
      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(255, 255, 200, ${alpha * 0.7})`;
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
