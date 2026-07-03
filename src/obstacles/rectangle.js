import { CANVAS_WIDTH, CANVAS_HEIGHT, RECT_SPEED, RECT_HEIGHT, RECT_SLIM_HEIGHT, GAP_WIDTH } from '../constants.js';

export class Rectangle {
  constructor(vertical = false, slim = false, speedMult = 1) {
    this.type = 'rectangle';
    this.vertical = vertical;
    this.slim = slim;
    const baseSpeed = slim ? RECT_SPEED + 60 + Math.random() * 80 : RECT_SPEED + Math.random() * 60;
    this.speed = baseSpeed * speedMult;
    this.done = false;

    const thickness = slim ? RECT_SLIM_HEIGHT : RECT_HEIGHT;

    if (vertical) {
      this.width = thickness;
      const fromTop = Math.random() > 0.5;
      this.direction = fromTop ? 1 : -1;
      this.x = Math.random() * (CANVAS_WIDTH - this.width);
      this.gapCenter = GAP_WIDTH / 2 + Math.random() * (CANVAS_HEIGHT - GAP_WIDTH);
      this.y = fromTop ? -CANVAS_HEIGHT : CANVAS_HEIGHT;
    } else {
      this.height = thickness;
      const fromLeft = Math.random() > 0.5;
      this.direction = fromLeft ? 1 : -1;
      this.y = Math.random() * (CANVAS_HEIGHT - this.height);
      this.gapCenter = GAP_WIDTH / 2 + Math.random() * (CANVAS_WIDTH - GAP_WIDTH);
      this.x = fromLeft ? -CANVAS_WIDTH : CANVAS_WIDTH;
    }
  }

  update(dt) {
    if (this.vertical) {
      this.y += this.direction * this.speed * dt;
      if (this.direction === 1 && this.y > CANVAS_HEIGHT) this.done = true;
      else if (this.direction === -1 && this.y < -CANVAS_HEIGHT) this.done = true;
    } else {
      this.x += this.direction * this.speed * dt;
      if (this.direction === 1 && this.x > CANVAS_WIDTH) this.done = true;
      else if (this.direction === -1 && this.x < -CANVAS_WIDTH) this.done = true;
    }
  }

  getCollisionRects() {
    if (this.vertical) {
      const worldY = this.y;
      const gapStart = this.gapCenter - GAP_WIDTH / 2;
      const gapEnd = this.gapCenter + GAP_WIDTH / 2;
      return [
        { x: this.x, y: worldY, w: this.width, h: gapStart },
        { x: this.x, y: worldY + gapEnd, w: this.width, h: CANVAS_HEIGHT - gapEnd },
      ];
    } else {
      const worldX = this.x;
      const gapStart = this.gapCenter - GAP_WIDTH / 2;
      const gapEnd = this.gapCenter + GAP_WIDTH / 2;
      return [
        { x: worldX, y: this.y, w: gapStart, h: this.height },
        { x: worldX + gapEnd, y: this.y, w: CANVAS_WIDTH - gapEnd, h: this.height },
      ];
    }
  }

  draw(ctx) {
    const rects = this.getCollisionRects();
    let color;
    if (this.slim) {
      color = '#00ffaa';
    } else if (this.vertical) {
      color = '#cc33ff';
    } else {
      color = '#ff3366';
    }

    ctx.save();
    ctx.shadowBlur = this.slim ? 12 : 15;
    ctx.shadowColor = color;
    ctx.fillStyle = color + '88';
    ctx.strokeStyle = color;
    ctx.lineWidth = this.slim ? 1 : 2;

    for (const r of rects) {
      if (r.w > 0 && r.h > 0) {
        ctx.fillRect(r.x, r.y, r.w, r.h);
        ctx.strokeRect(r.x, r.y, r.w, r.h);
      }
    }
    ctx.restore();
  }
}
