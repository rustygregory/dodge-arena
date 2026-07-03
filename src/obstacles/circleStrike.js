import { CANVAS_WIDTH, CANVAS_HEIGHT, CIRCLE_STRIKE_WARN_TIME, CIRCLE_STRIKE_PERSIST_TIME, CIRCLE_STRIKE_RADIUS } from '../constants.js';

export class CircleStrike {
  constructor(warnTime) {
    this.type = 'circleStrike';
    this.x = 50 + Math.random() * (CANVAS_WIDTH - 100);
    this.y = 50 + Math.random() * (CANVAS_HEIGHT - 100);
    this.radius = CIRCLE_STRIKE_RADIUS;
    this.warnTime = warnTime || CIRCLE_STRIKE_WARN_TIME;
    this.timer = 0;
    this.phase = 'warning';
    this.done = false;
  }

  update(dt) {
    this.timer += dt;

    if (this.phase === 'warning' && this.timer >= this.warnTime) {
      this.phase = 'active';
      this.timer = 0;
    } else if (this.phase === 'active' && this.timer >= CIRCLE_STRIKE_PERSIST_TIME) {
      this.phase = 'fading';
      this.timer = 0;
    } else if (this.phase === 'fading' && this.timer >= 0.5) {
      this.done = true;
    }
  }

  isColliding() {
    return this.phase === 'active';
  }

  draw(ctx) {
    ctx.save();

    if (this.phase === 'warning') {
      const progress = this.timer / this.warnTime;
      const currentRadius = this.radius * progress;
      const pulse = 0.5 + 0.5 * Math.sin(this.timer * 8);

      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ffaa00';
      ctx.strokeStyle = `rgba(255, 170, 0, ${0.3 + pulse * 0.4})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.arc(this.x, this.y, currentRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (this.phase === 'active') {
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ffaa00';
      ctx.fillStyle = 'rgba(255, 170, 0, 0.4)';
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (this.phase === 'fading') {
      const alpha = 1 - this.timer / 0.5;
      ctx.shadowBlur = 20 * alpha;
      ctx.shadowColor = '#ffaa00';
      ctx.fillStyle = `rgba(255, 170, 0, ${0.4 * alpha})`;
      ctx.strokeStyle = `rgba(255, 170, 0, ${alpha})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }
}
