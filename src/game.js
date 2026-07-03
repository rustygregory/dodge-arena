import {
  CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, COLOR_NAMES,
  DIFFICULTY, DIFFICULTY_KEYS, TOTAL_ROUNDS, SPAWN_POSITIONS,
  LASER_THICKNESS,
} from './constants.js';
import { input } from './input.js';
import { Player } from './player.js';
import { ObstacleManager } from './obstacles/obstacleManager.js';
import { Rectangle } from './obstacles/rectangle.js';
import { CircleStrike } from './obstacles/circleStrike.js';
import { Laser } from './obstacles/laser.js';
import { Swirl } from './obstacles/swirl.js';
import { Star } from './obstacles/star.js';
import { Lightning } from './obstacles/lightning.js';
import { RainDrop } from './obstacles/rainDrop.js';
import { Renderer } from './renderer.js';
import { circleRect, circleCircle, circleLine } from './collision.js';
import {
  playElimination, playRoundStart, playRoundEnd,
  resumeAudio, startMusic, stopMusic,
  getMusicVolume, setMusicVolume, setMusicTempo,
} from './audio.js';

export class Game {
  constructor(canvas) {
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    this.ctx = canvas.getContext('2d');
    this.renderer = new Renderer(this.ctx);
    this.obstacleManager = new ObstacleManager();

    this.state = 'TITLE';
    this.playerCount = 2;
    this.difficultyIndex = 0;
    this.menuSelection = 0;

    this.players = [];
    this.colorSelections = [0, 1, 2];
    this.currentColorPlayer = 0;

    this.currentRound = 1;
    this.roundWinners = [];
    this.elapsed = 0;
    this.scoreAccumulator = 0;

    this.countdown = 0;
    this.countdownTimer = 0;

    this.pauseSelection = 0;

    this.showcaseActive = false;
    this.preShowcaseState = null;

    this.lastTimestamp = 0;

    input.onFirstInput = () => {
      resumeAudio();
      startMusic();
    };
  }

  start() {
    requestAnimationFrame((ts) => {
      this.lastTimestamp = ts;
      this.loop(ts);
    });
  }

  loop(timestamp) {
    let dt = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;
    dt = Math.min(dt, 0.05);

    this.update(dt);
    this.render(dt);
    input.clearPressed();

    requestAnimationFrame((ts) => this.loop(ts));
  }

  update(dt) {
    if (input.wasPressed('0')) {
      const titleEl = document.getElementById('showcase-title');
      if (this.showcaseActive) {
        this.showcaseActive = false;
        this.state = this.preShowcaseState;
        titleEl.style.display = 'none';
      } else {
        this.preShowcaseState = this.state;
        this.showcaseActive = true;
        this.state = 'SHOWCASE';
        this.buildShowcase();
        titleEl.style.display = 'block';
      }
      return;
    }

    switch (this.state) {
      case 'TITLE': this.updateTitle(); break;
      case 'COLOR_SELECT': this.updateColorSelect(); break;
      case 'COUNTDOWN': this.updateCountdown(dt); break;
      case 'PLAYING': this.updatePlaying(dt); break;
      case 'PAUSED': this.updatePaused(); break;
      case 'ROUND_END': this.updateRoundEnd(); break;
      case 'MATCH_END': this.updateMatchEnd(); break;
      case 'SHOWCASE': break;
    }
  }

  render(dt) {
    switch (this.state) {
      case 'TITLE':
        this.renderer.drawTitleScreen(this.playerCount, this.difficultyIndex);
        break;
      case 'COLOR_SELECT':
        this.renderer.drawColorSelect(this.players, this.playerCount, this.colorSelections, this.currentColorPlayer);
        break;
      case 'COUNTDOWN':
        this.renderer.clear();
        this.renderer.drawBackground(dt);
        for (const p of this.players) this.renderer.drawPlayer(p);
        this.renderer.drawCountdown(this.countdown);
        break;
      case 'PLAYING':
        this.renderer.clear();
        this.renderer.drawBackground(dt);
        this.renderer.drawObstacles(this.obstacleManager.getObstacles());
        for (const p of this.players) this.renderer.drawPlayer(p);
        this.renderer.drawHUD(this.elapsed, this.players, this.currentRound, DIFFICULTY_KEYS[this.difficultyIndex]);
        break;
      case 'PAUSED':
        this.renderer.clear();
        this.renderer.drawBackground(0);
        this.renderer.drawObstacles(this.obstacleManager.getObstacles());
        for (const p of this.players) this.renderer.drawPlayer(p);
        this.renderer.drawHUD(this.elapsed, this.players, this.currentRound, DIFFICULTY_KEYS[this.difficultyIndex]);
        this.renderer.drawPauseMenu(this.pauseSelection, getMusicVolume());
        break;
      case 'ROUND_END':
        this.renderer.drawRoundEnd(this.players, this.currentRound);
        break;
      case 'MATCH_END':
        this.renderer.drawMatchEnd(
          this.players.map((p, i) => ({ ...p, index: i, totalScore: p.totalScore })),
          this.roundWinners
        );
        break;
      case 'SHOWCASE':
        this.renderShowcase();
        break;
    }
  }

  updateTitle() {
    if (input.wasPressed('w') || input.wasPressed('W') || input.wasPressed('ArrowUp')) {
      this.menuSelection = (this.menuSelection + 1) % 2;
    }
    if (input.wasPressed('s') || input.wasPressed('S') || input.wasPressed('ArrowDown')) {
      this.menuSelection = (this.menuSelection + 1) % 2;
    }

    if (this.menuSelection === 0) {
      if (input.wasPressed('a') || input.wasPressed('A') || input.wasPressed('ArrowLeft')) {
        this.playerCount = Math.max(1, this.playerCount - 1);
      }
      if (input.wasPressed('d') || input.wasPressed('D') || input.wasPressed('ArrowRight')) {
        this.playerCount = Math.min(3, this.playerCount + 1);
      }
    } else {
      if (input.wasPressed('a') || input.wasPressed('A') || input.wasPressed('ArrowLeft')) {
        this.difficultyIndex = (this.difficultyIndex + DIFFICULTY_KEYS.length - 1) % DIFFICULTY_KEYS.length;
      }
      if (input.wasPressed('d') || input.wasPressed('D') || input.wasPressed('ArrowRight')) {
        this.difficultyIndex = (this.difficultyIndex + 1) % DIFFICULTY_KEYS.length;
      }
    }

    if (input.wasPressed('Enter') || input.wasPressed(' ')) {
      this.startColorSelect();
    }
  }

  startColorSelect() {
    this.state = 'COLOR_SELECT';
    this.currentColorPlayer = 0;
    this.colorSelections = [0, 1, 2];
  }

  updateColorSelect() {
    if (input.wasPressed('Backspace') || input.wasPressed('Delete')) {
      if (this.currentColorPlayer > 0) {
        this.currentColorPlayer--;
      } else {
        this.state = 'TITLE';
      }
      return;
    }

    const p = this.currentColorPlayer;
    const keys = p === 0 ? ['a', 'd'] : p === 1 ? ['j', 'l'] : ['ArrowLeft', 'ArrowRight'];

    if (input.wasPressed(keys[0]) || input.wasPressed(keys[0].toUpperCase())) {
      this.cycleColor(p, -1);
    }
    if (input.wasPressed(keys[1]) || input.wasPressed(keys[1].toUpperCase())) {
      this.cycleColor(p, 1);
    }

    // Arrow keys also cycle for any player
    if (input.wasPressed('ArrowLeft')) {
      this.cycleColor(p, -1);
    }
    if (input.wasPressed('ArrowRight')) {
      this.cycleColor(p, 1);
    }

    if (input.wasPressed('Enter') || input.wasPressed(' ')) {
      this.currentColorPlayer++;
      if (this.currentColorPlayer >= this.playerCount) {
        this.initMatch();
      }
    }
  }

  cycleColor(playerIdx, direction) {
    let current = this.colorSelections[playerIdx];
    if (this.playerCount === 1) {
      current = (current + direction + COLOR_NAMES.length) % COLOR_NAMES.length;
    } else {
      const taken = this.colorSelections.filter((_, i) => i !== playerIdx && i < this.playerCount);
      let attempts = 0;
      do {
        current = (current + direction + COLOR_NAMES.length) % COLOR_NAMES.length;
        attempts++;
      } while (taken.includes(current) && attempts < COLOR_NAMES.length);
    }
    this.colorSelections[playerIdx] = current;
  }

  initMatch() {
    this.players = [];
    for (let i = 0; i < this.playerCount; i++) {
      const colorName = COLOR_NAMES[this.colorSelections[i]];
      const color = COLORS[colorName];
      const pos = SPAWN_POSITIONS[i];
      const player = new Player(i, color, pos.x, pos.y, this.playerCount === 1);
      player.totalScore = 0;
      this.players.push(player);
    }
    this.currentRound = 1;
    this.roundWinners = [];
    this.startRound();
  }

  startRound() {
    const difficulty = DIFFICULTY_KEYS[this.difficultyIndex];
    this.obstacleManager.reset(difficulty, this.currentRound);
    this.elapsed = 0;
    this.scoreAccumulator = 0;

    for (let i = 0; i < this.players.length; i++) {
      this.players[i].reset(SPAWN_POSITIONS[i].x, SPAWN_POSITIONS[i].y);
      this.players[i].score = 0;
    }

    this.state = 'COUNTDOWN';
    this.countdown = 3;
    this.countdownTimer = 0;
    playRoundStart();
  }

  updateCountdown(dt) {
    this.countdownTimer += dt;
    if (this.countdownTimer >= 1) {
      this.countdownTimer = 0;
      this.countdown--;
      if (this.countdown < 0) {
        this.state = 'PLAYING';
      }
    }
  }

  updatePlaying(dt) {
    if (input.wasPressed('Escape') || input.wasPressed(' ')) {
      this.state = 'PAUSED';
      this.pauseSelection = 0;
      return;
    }

    const difficulty = DIFFICULTY_KEYS[this.difficultyIndex];
    const duration = DIFFICULTY[difficulty].duration;
    this.elapsed += dt;

    const progress = Math.min(1, this.elapsed / duration);
    if (difficulty === 'nightmare') {
      setMusicTempo(1.4 + progress * 0.8);
    } else if (difficulty === 'hard') {
      setMusicTempo(1.0 + progress * 0.6);
    } else {
      setMusicTempo(1.0 + progress * 0.4);
    }

    this.scoreAccumulator += dt;
    while (this.scoreAccumulator >= 1.0) {
      this.scoreAccumulator -= 1.0;
      for (const p of this.players) {
        if (p.alive) p.score++;
      }
    }

    for (const p of this.players) {
      p.update(dt);
    }

    this.obstacleManager.update(dt);
    this.checkCollisions();

    const alive = this.players.filter(p => p.alive);
    if (alive.length === 0 || this.elapsed >= duration) {
      this.endRound();
    } else if (this.playerCount > 1 && alive.length === 1) {
      this.endRound();
    }
  }

  updatePaused() {
    if (input.wasPressed('Escape') || input.wasPressed(' ')) {
      this.state = 'PLAYING';
      return;
    }

    if (input.wasPressed('w') || input.wasPressed('W') || input.wasPressed('ArrowUp')) {
      this.pauseSelection = (this.pauseSelection + 2) % 3;
    }
    if (input.wasPressed('s') || input.wasPressed('S') || input.wasPressed('ArrowDown')) {
      this.pauseSelection = (this.pauseSelection + 1) % 3;
    }

    if (this.pauseSelection === 0) {
      if (input.wasPressed('Enter')) {
        this.state = 'PLAYING';
      }
    } else if (this.pauseSelection === 1) {
      if (input.wasPressed('a') || input.wasPressed('A') || input.wasPressed('ArrowLeft')) {
        setMusicVolume(getMusicVolume() - 0.1);
      }
      if (input.wasPressed('d') || input.wasPressed('D') || input.wasPressed('ArrowRight')) {
        setMusicVolume(getMusicVolume() + 0.1);
      }
    } else if (this.pauseSelection === 2) {
      if (input.wasPressed('Enter')) {
        this.state = 'TITLE';
      }
    }
  }

  checkCollisions() {
    const obstacles = this.obstacleManager.getObstacles();

    for (const player of this.players) {
      if (!player.alive) continue;

      for (const obs of obstacles) {
        let hit = false;

        if (obs.type === 'rectangle') {
          const rects = obs.getCollisionRects();
          for (const r of rects) {
            if (r.w > 0 && circleRect(player.x, player.y, player.radius, r.x, r.y, r.w, r.h)) {
              hit = true;
              break;
            }
          }
        } else if (obs.type === 'circleStrike') {
          if (obs.isColliding() && circleCircle(player.x, player.y, player.radius, obs.x, obs.y, obs.radius)) {
            hit = true;
          }
        } else if (obs.type === 'laser') {
          if (obs.isColliding()) {
            const seg = obs.getLineSegment();
            if (circleLine(player.x, player.y, player.radius, seg.x1, seg.y1, seg.x2, seg.y2, LASER_THICKNESS)) {
              hit = true;
            }
          }
        } else if (obs.type === 'swirl') {
          if (obs.checkCollision(player.x, player.y, player.radius)) {
            hit = true;
          }
        } else if (obs.type === 'star') {
          if (obs.checkCollision(player.x, player.y, player.radius)) {
            hit = true;
          }
        } else if (obs.type === 'lightning') {
          if (obs.checkCollision(player.x, player.y, player.radius)) {
            hit = true;
          }
        } else if (obs.type === 'rainDrop') {
          if (obs.isColliding() && circleCircle(player.x, player.y, player.radius, obs.x, obs.y, obs.radius)) {
            hit = true;
          }
        }

        if (hit) {
          player.eliminate();
          playElimination();
          break;
        }
      }
    }
  }

  endRound() {
    const alive = this.players.filter(p => p.alive);
    let winner = null;

    if (alive.length === 1) {
      alive[0].score += 30;
      winner = alive[0].index;
    } else if (alive.length > 1) {
      const maxScore = Math.max(...alive.map(p => p.score));
      const best = alive.filter(p => p.score === maxScore);
      if (best.length === 1) winner = best[0].index;
    } else {
      const maxScore = Math.max(...this.players.map(p => p.score));
      const best = this.players.filter(p => p.score === maxScore);
      if (best.length === 1) winner = best[0].index;
    }

    if (winner !== null) {
      this.players[winner].roundsWon++;
    }
    this.roundWinners.push(winner);

    for (const p of this.players) {
      p.totalScore = (p.totalScore || 0) + p.score;
    }

    setMusicTempo(1.0);
    playRoundEnd();
    this.state = 'ROUND_END';
  }

  updateRoundEnd() {
    if (input.wasPressed('Backspace') || input.wasPressed('Delete')) {
      this.state = 'TITLE';
      return;
    }
    if (input.wasPressed('Enter')) {
      if (this.currentRound >= TOTAL_ROUNDS) {
        this.state = 'MATCH_END';
      } else {
        this.currentRound++;
        this.startRound();
      }
    }
  }

  updateMatchEnd() {
    if (input.wasPressed('Enter') || input.wasPressed(' ')) {
      this.state = 'TITLE';
    }
  }

  buildShowcase() {
    this.showcasePlayers = [
      new Player(0, COLORS.seafoamGreen, CANVAS_WIDTH * 0.3, CANVAS_HEIGHT * 0.35),
      new Player(1, COLORS.orange, CANVAS_WIDTH * 0.65, CANVAS_HEIGHT * 0.6),
      new Player(2, COLORS.yellow, CANVAS_WIDTH * 0.45, CANVAS_HEIGHT * 0.75),
    ];
    this.showcasePlayers[0].score = 47;
    this.showcasePlayers[1].score = 32;
    this.showcasePlayers[2].score = 19;

    this.showcaseObstacles = [];

    // A horizontal rectangle mid-screen
    const rect1 = new Rectangle(false, false, 1);
    rect1.x = 0;
    rect1.y = CANVAS_HEIGHT * 0.45;
    rect1.gapCenter = CANVAS_WIDTH * 0.35;
    this.showcaseObstacles.push(rect1);

    // A slim vertical rectangle
    const rect2 = new Rectangle(true, true, 1);
    rect2.x = CANVAS_WIDTH * 0.8;
    rect2.y = 0;
    rect2.gapCenter = CANVAS_HEIGHT * 0.6;
    this.showcaseObstacles.push(rect2);

    // A circle strike in active phase
    const cs = new CircleStrike();
    cs.x = CANVAS_WIDTH * 0.75;
    cs.y = CANVAS_HEIGHT * 0.25;
    cs.phase = 'active';
    cs.timer = 0.5;
    this.showcaseObstacles.push(cs);

    // A warning circle strike
    const cs2 = new CircleStrike();
    cs2.x = CANVAS_WIDTH * 0.2;
    cs2.y = CANVAS_HEIGHT * 0.65;
    cs2.phase = 'warning';
    cs2.timer = 1.5;
    this.showcaseObstacles.push(cs2);

    // A laser mid-sweep
    const laser = new Laser(1);
    laser.horizontal = true;
    laser.y = CANVAS_HEIGHT * 0.15;
    laser.fromLeft = true;
    laser.phase = 'sweep';
    laser.timer = 0.2;
    laser.sweepProgress = 0.5;
    this.showcaseObstacles.push(laser);

    // A swirl partway through
    const swirl = new Swirl();
    swirl.timer = 1.8;
    this.showcaseObstacles.push(swirl);

    // A star firing from corner
    const star = new Star(3);
    star.phase = 'firing';
    star.timer = 0.3;
    this.showcaseObstacles.push(star);

    // A star in warning phase (about to blast)
    const star2 = new Star(1);
    star2.phase = 'warning';
    star2.timer = 1.6;
    this.showcaseObstacles.push(star2);

    // Lightning bolt in warning phase
    const lightning = new Lightning();
    lightning.phase = 'warning';
    lightning.timer = 0.8;
    this.showcaseObstacles.push(lightning);

    // A few rain drops scattered
    for (let i = 0; i < 4; i++) {
      const drop = new RainDrop();
      drop.y = 100 + i * 120;
      drop.x = 150 + i * 180;
      this.showcaseObstacles.push(drop);
    }
  }

  renderShowcase() {
    this.renderer.clear();
    this.renderer.drawBackground(0);

    for (const obs of this.showcaseObstacles) {
      obs.draw(this.ctx);
    }

    for (const p of this.showcasePlayers) {
      this.renderer.drawPlayer(p);
    }

    this.renderer.drawHUD(73, this.showcasePlayers, 4, 'nightmare');
  }
}
