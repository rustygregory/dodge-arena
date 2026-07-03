import { CANVAS_WIDTH, CANVAS_HEIGHT, LASER_WARN_TIME, LASER_SWEEP_TIME, LASER_LINGER_TIME, LASER_THICKNESS } from '../constants.js';

export class Laser {
  constructor(speedMult = 1) {
    this.type = 'laser';
    this.horizontal = Math.random() > 0.5;
    this.timer = 0;
    this.phase = 'warning';
    this.done = false;
    this.sweepProgress = 0;
    this.sweepTime = LASER_SWEEP_TIME / speedMult;

    if (this.horizontal) {
      this.y = 30 + Math.random() * (CANVAS_HEIGHT - 60);
      this.fromLeft = Math.random() > 0.5;
    } else {
      this.x = 30 + Math.random() * (CANVAS_WIDTH - 60);
      this.fromTop = Math.random() > 0.5;
    }
  }

  update(dt) {
    this.timer += dt;

    if (this.phase === 'warning' && this.timer >= LASER_WARN_TIME) {
      this.phase = 'sweep';
      this.timer = 0;
    } else if (this.phase === 'sweep') {
      this.sweepProgress = Math.min(1, this.timer / this.sweepTime);
      if (this.timer >= this.sweepTime) {
        this.phase = 'linger';
        this.timer = 0;
      }
    } else if (this.phase === 'linger' && this.timer >= LASER_LINGER_TIME) {
      this.done = true;
    }
  }

  isColliding() {
    return this.phase === 'sweep' || this.phase === 'linger';
  }

  getLineSegment() {
    if (this.horizontal) {
      const startX = this.fromLeft ? 0 : CANVAS_WIDTH;
      const endX = this.fromLeft ? CANVAS_WIDTH : 0;
      const currentEnd = this.phase === 'linger'
        ? endX
        : startX + (endX - startX) * this.sweepProgress;
      return { x1: startX, y1: this.y, x2: currentEnd, y2: this.y };
    } else {
      const startY = this.fromTop ? 0 : CANVAS_HEIGHT;
      const endY = this.fromTop ? CANVAS_HEIGHT : 0;
      const currentEnd = this.phase === 'linger'
        ? endY
        : startY + (endY - startY) * this.sweepProgress;
      return { x1: this.x, y1: startY, x2: this.x, y2: currentEnd };
    }
  }

  draw(ctx) {
    ctx.save();

    if (this.phase === 'warning') {
      const pulse = 0.4 + 0.4 * Math.sin(this.timer * 6);
      ctx.strokeStyle = `rgba(0, 200, 255, ${pulse})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 8]);
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#00c8ff';
      ctx.beginPath();

      if (this.horizontal) {
        ctx.moveTo(0, this.y);
        ctx.lineTo(CANVAS_WIDTH, this.y);
      } else {
        ctx.moveTo(this.x, 0);
        ctx.lineTo(this.x, CANVAS_HEIGHT);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    } else {
      const seg = this.getLineSegment();
      let alpha = 1;
      if (this.phase === 'linger') {
        alpha = 1 - this.timer / LASER_LINGER_TIME;
      }

      ctx.shadowBlur = 25;
      ctx.shadowColor = `rgba(0, 200, 255, ${alpha})`;
      ctx.strokeStyle = `rgba(0, 200, 255, ${alpha})`;
      ctx.lineWidth = LASER_THICKNESS;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();

      ctx.shadowBlur = 0;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(seg.x1, seg.y1);
      ctx.lineTo(seg.x2, seg.y2);
      ctx.stroke();
    }

    ctx.restore();
  }
}
