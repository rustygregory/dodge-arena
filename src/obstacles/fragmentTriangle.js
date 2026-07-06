import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants.js';

const SIZE = 18;
const SPEED = 220;

const DURATION = {
  normal: 10,
  hard: 15,
  nightmare: 30,
};

export class FragmentTriangle {
  constructor(x, y, vx, vy, isFragment = false, difficulty = 'normal') {
    this.type = 'fragmentTriangle';
    this.size = isFragment ? SIZE * 0.7 : SIZE;
    this.speed = SPEED;
    this.done = false;
    this.rotation = 0;
    this.isFragment = isFragment;
    this.difficulty = difficulty;
    this.duration = DURATION[difficulty] || 10;
    this.timer = 0;
    this.children = [];

    if (x !== undefined) {
      this.x = x;
      this.y = y;
      this.vx = vx;
      this.vy = vy;
    } else {
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
        + (Math.random() - 0.5) * 0.6;
      this.vx = Math.cos(angle) * this.speed;
      this.vy = Math.sin(angle) * this.speed;
    }

    this.entered = false;
    this.fadeTimer = 0;
    this.fading = false;
  }

  update(dt) {
    if (this.fading) {
      this.fadeTimer += dt;
      if (this.fadeTimer >= 0.3) {
        this.done = true;
      }
      return;
    }

    this.timer += dt;
    if (this.timer >= this.duration) {
      this.fading = true;
      return;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.rotation += dt * 5;

    const inBounds = this.x > this.size && this.x < CANVAS_WIDTH - this.size &&
                     this.y > this.size && this.y < CANVAS_HEIGHT - this.size;

    if (!this.entered && inBounds) {
      this.entered = true;
    }

    if (this.entered) {
      let hitWall = false;

      if (this.x - this.size < 0) {
        this.x = this.size;
        this.vx = Math.abs(this.vx);
        hitWall = true;
      } else if (this.x + this.size > CANVAS_WIDTH) {
        this.x = CANVAS_WIDTH - this.size;
        this.vx = -Math.abs(this.vx);
        hitWall = true;
      }

      if (this.y - this.size < 0) {
        this.y = this.size;
        this.vy = Math.abs(this.vy);
        hitWall = true;
      } else if (this.y + this.size > CANVAS_HEIGHT) {
        this.y = CANVAS_HEIGHT - this.size;
        this.vy = -Math.abs(this.vy);
        hitWall = true;
      }

      if (hitWall && !this.isFragment) {
        this.spawnFragments();
      }
      if (hitWall && this.isFragment) {
        this.fading = true;
      }
    }
  }

  spawnFragments() {
    const baseAngle = Math.atan2(this.vy, this.vx);
    const spread = Math.PI * 0.4;

    const angle1 = baseAngle + spread;
    const angle2 = baseAngle - spread;

    this.children.push(new FragmentTriangle(
      this.x, this.y,
      Math.cos(angle1) * this.speed,
      Math.sin(angle1) * this.speed,
      true,
      this.difficulty
    ));
    this.children.push(new FragmentTriangle(
      this.x, this.y,
      Math.cos(angle2) * this.speed,
      Math.sin(angle2) * this.speed,
      true,
      this.difficulty
    ));
  }

  getChildren() {
    const c = this.children;
    this.children = [];
    return c;
  }

  checkCollision(px, py, pr) {
    if (this.fading) return false;
    const dist = Math.hypot(px - this.x, py - this.y);
    return dist < pr + this.size * 0.8;
  }

  draw(ctx) {
    ctx.save();

    let alpha = 1;
    if (this.fading) {
      alpha = 1 - this.fadeTimer / 0.3;
    }
    if (!this.entered) {
      const edgeDist = Math.min(
        Math.abs(this.x), Math.abs(this.y),
        Math.abs(CANVAS_WIDTH - this.x), Math.abs(CANVAS_HEIGHT - this.y)
      );
      alpha = Math.min(1, edgeDist / 40);
    }

    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    const color = this.isFragment ? 'rgba(255, 120, 50,' : 'rgba(255, 80, 30,';

    ctx.shadowBlur = 12;
    ctx.shadowColor = `rgba(255, 100, 40, ${alpha})`;
    ctx.fillStyle = `${color} ${alpha * 0.8})`;
    ctx.strokeStyle = `rgba(255, 200, 150, ${alpha})`;
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

    if (!this.isFragment) {
      ctx.strokeStyle = `rgba(255, 220, 180, ${alpha * 0.4})`;
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
    }

    ctx.restore();
  }
}
