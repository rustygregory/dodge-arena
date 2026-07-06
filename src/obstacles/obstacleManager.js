import { SPAWN_INTERVAL_START, SPAWN_INTERVAL_END, DIFFICULTY } from '../constants.js';
import { Rectangle } from './rectangle.js';
import { CircleStrike } from './circleStrike.js';
import { Laser } from './laser.js';
import { Swirl } from './swirl.js';
import { Star } from './star.js';
import { Lightning } from './lightning.js';
import { RainDrop } from './rainDrop.js';
import { Triangle } from './triangle.js';
import { GoldSpark } from './goldSpark.js';
import { DiagonalRect } from './diagonalRect.js';
import { NovaCircle } from './novaCircle.js';
import { FragmentTriangle } from './fragmentTriangle.js';

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
    if (this.difficulty === 'ghost' || this.difficulty === 'nightmare') return 1.5;
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

    if (this.difficulty === 'nightmare' || this.difficulty === 'ghost') {
      if (roll < 0.03) {
        this.obstacles.push(new GoldSpark());
      } else if (roll < 0.07) {
        this.obstacles.push(new Lightning());
      } else if (roll < 0.12) {
        this.spawnRain();
      } else if (roll < 0.22) {
        this.obstacles.push(new NovaCircle());
      } else if (roll < 0.29) {
        if (Math.random() < 0.35) {
          this.obstacles.push(new Star(undefined, true));
          this.obstacles.push(new Star(undefined, true));
        } else {
          const pair = Math.random() > 0.5 ? [0, 3] : [1, 2];
          this.obstacles.push(new Star(pair[0]));
          this.obstacles.push(new Star(pair[1]));
        }
      } else if (roll < 0.36) {
        this.obstacles.push(new Swirl());
      } else if (roll < 0.39) {
        this.spawnCircleStorm();
      } else if (roll < 0.44) {
        this.obstacles.push(new Triangle(this.difficulty));
      } else if (roll < 0.56) {
        this.obstacles.push(new FragmentTriangle(undefined, undefined, undefined, undefined, false, this.difficulty));
      } else if (roll < 0.66) {
        this.obstacles.push(new DiagonalRect(this.getSpeedMultiplier()));
      } else if (roll < 0.72) {
        const useVertical = this.round >= 3 && Math.random() < 0.4;
        this.obstacles.push(new Rectangle(useVertical, false, this.getSpeedMultiplier()));
      } else if (roll < 0.77) {
        this.obstacles.push(new Rectangle(true, true, this.getSpeedMultiplier()));
      } else if (roll < 0.88) {
        this.obstacles.push(new CircleStrike());
      } else {
        this.obstacles.push(new Laser(this.getSpeedMultiplier()));
      }
    } else if (this.difficulty === 'hard') {
      if (roll < 0.04) {
        this.obstacles.push(new Lightning());
      } else if (roll < 0.10) {
        this.spawnRain();
      } else if (roll < 0.16) {
        this.obstacles.push(new Star());
      } else if (roll < 0.24) {
        this.obstacles.push(new Swirl());
      } else if (roll < 0.30) {
        this.obstacles.push(new Triangle(this.difficulty));
      } else if (roll < 0.40) {
        this.obstacles.push(new FragmentTriangle(undefined, undefined, undefined, undefined, false, this.difficulty));
      } else if (roll < 0.50) {
        this.obstacles.push(new DiagonalRect(this.getSpeedMultiplier()));
      } else if (roll < 0.58) {
        const useVertical = this.round >= 3 && Math.random() < 0.4;
        this.obstacles.push(new Rectangle(useVertical, false, this.getSpeedMultiplier()));
      } else if (roll < 0.64) {
        this.obstacles.push(new Rectangle(true, true, this.getSpeedMultiplier()));
      } else if (roll < 0.80) {
        this.obstacles.push(new CircleStrike());
      } else {
        this.obstacles.push(new Laser(this.getSpeedMultiplier()));
      }
    } else {
      if (roll < 0.04) {
        this.obstacles.push(new Lightning());
      } else if (roll < 0.10) {
        this.spawnRain();
      } else if (roll < 0.15) {
        this.obstacles.push(new Triangle(this.difficulty));
      } else if (roll < 0.20) {
        this.obstacles.push(new FragmentTriangle(undefined, undefined, undefined, undefined, false, this.difficulty));
      } else if (roll < 0.28) {
        this.obstacles.push(new DiagonalRect(this.getSpeedMultiplier()));
      } else if (roll < 0.42) {
        const useVertical = this.round >= 3 && Math.random() < 0.4;
        this.obstacles.push(new Rectangle(useVertical, false, this.getSpeedMultiplier()));
      } else if (roll < 0.50) {
        this.obstacles.push(new Rectangle(true, true, this.getSpeedMultiplier()));
      } else if (roll < 0.75) {
        this.obstacles.push(new CircleStrike());
      } else {
        this.obstacles.push(new Laser(this.getSpeedMultiplier()));
      }
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

    const newObstacles = [];
    for (const obs of this.obstacles) {
      obs.update(dt);
      if (obs.type === 'fragmentTriangle' && obs.children.length > 0) {
        newObstacles.push(...obs.getChildren());
      }
    }

    if (newObstacles.length > 0) {
      this.obstacles.push(...newObstacles);
    }

    this.obstacles = this.obstacles.filter(o => !o.done);
  }

  getObstacles() {
    return this.obstacles;
  }
}
