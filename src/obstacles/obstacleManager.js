import { SPAWN_INTERVAL_START, SPAWN_INTERVAL_END, DIFFICULTY } from '../constants.js';
import { Rectangle } from './rectangle.js';
import { CircleStrike } from './circleStrike.js';
import { Laser } from './laser.js';
import { Swirl } from './swirl.js';
import { Star } from './star.js';
import { Lightning } from './lightning.js';
import { RainDrop } from './rainDrop.js';

export class ObstacleManager {
  constructor() {
    this.obstacles = [];
    this.spawnTimer = 0;
    this.elapsed = 0;
    this.difficulty = 'normal';
    this.round = 1;
  }

  reset(difficulty, round) {
    this.obstacles = [];
    this.spawnTimer = 0;
    this.elapsed = 0;
    this.difficulty = difficulty;
    this.round = round || 1;
  }

  getSpawnInterval() {
    const duration = DIFFICULTY[this.difficulty].duration;
    const progress = Math.min(1, this.elapsed / duration);
    return SPAWN_INTERVAL_START + (SPAWN_INTERVAL_END - SPAWN_INTERVAL_START) * progress;
  }

  getSpeedMultiplier() {
    if (this.difficulty === 'nightmare') return 1.5;
    if (this.difficulty === 'hard') return 1.25;
    return 1.0;
  }

  spawnCircleStorm() {
    const count = 8 + Math.floor(Math.random() * 5);
    const warnTime = this.difficulty === 'nightmare' ? 0.8 : 1.0;
    for (let i = 0; i < count; i++) {
      this.obstacles.push(new CircleStrike(warnTime));
    }
  }

  spawnRain() {
    const count = 6 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      this.obstacles.push(new RainDrop());
    }
  }

  spawn() {
    const roll = Math.random();
    let starChance, swirlChance, stormChance;

    if (this.difficulty === 'nightmare') {
      starChance = 0.10;
      swirlChance = 0.20;
      stormChance = 0.24;
    } else if (this.difficulty === 'hard') {
      starChance = 0.05;
      swirlChance = 0.15;
      stormChance = 0.19;
    } else {
      starChance = 0.03;
      swirlChance = 0.12;
      stormChance = 0;
    }

    let laserChance;
    if (this.difficulty === 'nightmare') {
      laserChance = 0.35;
    } else if (this.difficulty === 'hard') {
      laserChance = 0.30;
    } else {
      laserChance = 0.25;
    }

    if (roll < 0.04) {
      this.obstacles.push(new Lightning());
    } else if (roll < 0.10) {
      this.spawnRain();
    } else if (roll < starChance + 0.10) {
      if (this.difficulty === 'nightmare') {
        if (Math.random() < 0.35) {
          // Random position star
          this.obstacles.push(new Star(undefined, true));
          this.obstacles.push(new Star(undefined, true));
        } else {
          // Paired stars on opposite corners
          const pair = Math.random() > 0.5 ? [0, 3] : [1, 2];
          this.obstacles.push(new Star(pair[0]));
          this.obstacles.push(new Star(pair[1]));
        }
      } else {
        this.obstacles.push(new Star());
      }
    } else if (roll < swirlChance) {
      this.obstacles.push(new Swirl());
    } else if (roll < stormChance) {
      this.spawnCircleStorm();
    } else if (roll < 0.35) {
      const useVertical = this.round >= 3 && Math.random() < 0.4;
      this.obstacles.push(new Rectangle(useVertical, false, this.getSpeedMultiplier()));
    } else if (roll < 0.5) {
      this.obstacles.push(new Rectangle(true, true, this.getSpeedMultiplier()));
    } else if (roll < (1 - laserChance)) {
      this.obstacles.push(new CircleStrike());
    } else {
      this.obstacles.push(new Laser(this.getSpeedMultiplier()));
    }
  }

  update(dt) {
    this.elapsed += dt;
    this.spawnTimer += dt;

    const interval = this.getSpawnInterval();
    if (this.spawnTimer >= interval) {
      this.spawnTimer = 0;
      this.spawn();
    }

    for (const obs of this.obstacles) {
      obs.update(dt);
    }

    this.obstacles = this.obstacles.filter(o => !o.done);
  }

  getObstacles() {
    return this.obstacles;
  }
}
