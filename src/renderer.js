import { CANVAS_WIDTH, CANVAS_HEIGHT, COLORS, COLOR_NAMES, COLOR_LABELS, DIFFICULTY_KEYS, DIFFICULTY, TOTAL_ROUNDS } from './constants.js';

export class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
    this.gridOffset = 0;
  }

  clear() {
    const ctx = this.ctx;
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  drawBackground(dt) {
    const ctx = this.ctx;
    this.gridOffset = (this.gridOffset + dt * 10) % 40;

    ctx.strokeStyle = 'rgba(60, 30, 120, 0.15)';
    ctx.lineWidth = 1;

    for (let x = this.gridOffset; x < CANVAS_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = this.gridOffset; y < CANVAS_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    ctx.shadowBlur = 30;
    ctx.shadowColor = 'rgba(100, 50, 255, 0.3)';
    ctx.strokeStyle = 'rgba(100, 50, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.shadowBlur = 0;
  }

  drawPlayer(player) {
    const ctx = this.ctx;
    if (player.opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = player.opacity;

    const color = player.alive ? player.color : '#666666';
    const r = player.radius;
    const x = player.x;
    const y = player.y;

    this.drawCharacterExtras(ctx, player, color, 'behind');

    ctx.shadowBlur = 20;
    ctx.shadowColor = color;
    ctx.fillStyle = color + '88';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 10;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff88';
    ctx.beginPath();
    ctx.arc(x - 4, y - 4, 4, 0, Math.PI * 2);
    ctx.fill();

    this.drawCharacterExtras(ctx, player, color, 'front');

    ctx.restore();
  }

  drawCharacterExtras(ctx, player, color, layer) {
    const x = player.x;
    const y = player.y;
    const r = player.radius;
    const origColor = player.color;

    if (origColor === '#56E39F') {
      // Seafoam green = fox ears + fox tail
      if (layer === 'front') {
        ctx.fillStyle = color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
        // Left ear
        ctx.beginPath();
        ctx.moveTo(x - r + 2, y - r + 4);
        ctx.lineTo(x - r + 7, y - r - 10);
        ctx.lineTo(x - r + 14, y - r + 6);
        ctx.closePath();
        ctx.fill();
        // Right ear
        ctx.beginPath();
        ctx.moveTo(x + r - 2, y - r + 4);
        ctx.lineTo(x + r - 7, y - r - 10);
        ctx.lineTo(x + r - 14, y - r + 6);
        ctx.closePath();
        ctx.fill();
        // Inner ear
        ctx.fillStyle = '#ffffff44';
        ctx.beginPath();
        ctx.moveTo(x - r + 5, y - r + 2);
        ctx.lineTo(x - r + 7, y - r - 5);
        ctx.lineTo(x - r + 11, y - r + 3);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + r - 5, y - r + 2);
        ctx.lineTo(x + r - 7, y - r - 5);
        ctx.lineTo(x + r - 11, y - r + 3);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      if (layer === 'behind') {
        // Bushy fox tail - multiple layered curves for volume
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x - 4, y + r - 2);
        ctx.quadraticCurveTo(x + 20, y + r + 8, x + 18, y + r + 24);
        ctx.quadraticCurveTo(x + 14, y + r + 30, x + 8, y + r + 28);
        ctx.quadraticCurveTo(x + 4, y + r + 26, x + 2, y + r + 22);
        ctx.quadraticCurveTo(x - 2, y + r + 16, x - 4, y + r - 2);
        ctx.closePath();
        ctx.fill();
        // Second fluff layer (darker)
        ctx.fillStyle = color + 'aa';
        ctx.beginPath();
        ctx.moveTo(x - 2, y + r);
        ctx.quadraticCurveTo(x + 14, y + r + 6, x + 12, y + r + 20);
        ctx.quadraticCurveTo(x + 8, y + r + 24, x + 4, y + r + 22);
        ctx.quadraticCurveTo(x, y + r + 14, x - 2, y + r);
        ctx.closePath();
        ctx.fill();
        // White tip
        ctx.fillStyle = '#ffffffcc';
        ctx.beginPath();
        ctx.moveTo(x + 14, y + r + 22);
        ctx.quadraticCurveTo(x + 18, y + r + 26, x + 14, y + r + 30);
        ctx.quadraticCurveTo(x + 8, y + r + 30, x + 8, y + r + 26);
        ctx.quadraticCurveTo(x + 10, y + r + 22, x + 14, y + r + 22);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    } else if (origColor === '#FFE066') {
      // Yellow = cat ears
      if (layer === 'front') {
        ctx.fillStyle = color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
        // Left ear (pointy triangles)
        ctx.beginPath();
        ctx.moveTo(x - r + 1, y - r + 5);
        ctx.lineTo(x - r + 4, y - r - 12);
        ctx.lineTo(x - r + 13, y - r + 5);
        ctx.closePath();
        ctx.fill();
        // Right ear
        ctx.beginPath();
        ctx.moveTo(x + r - 1, y - r + 5);
        ctx.lineTo(x + r - 4, y - r - 12);
        ctx.lineTo(x + r - 13, y - r + 5);
        ctx.closePath();
        ctx.fill();
        // Inner ear (pink)
        ctx.fillStyle = '#ff99bb88';
        ctx.beginPath();
        ctx.moveTo(x - r + 4, y - r + 3);
        ctx.lineTo(x - r + 5, y - r - 6);
        ctx.lineTo(x - r + 10, y - r + 3);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(x + r - 4, y - r + 3);
        ctx.lineTo(x + r - 5, y - r - 6);
        ctx.lineTo(x + r - 10, y - r + 3);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    } else if (origColor === '#FF6B6B') {
      // Red = fish tail
      if (layer === 'behind') {
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        // Fish tail (two lobes)
        ctx.beginPath();
        ctx.moveTo(x, y + r - 2);
        ctx.quadraticCurveTo(x - 6, y + r + 10, x - 12, y + r + 18);
        ctx.lineTo(x - 8, y + r + 12);
        ctx.lineTo(x, y + r + 6);
        ctx.lineTo(x + 8, y + r + 12);
        ctx.lineTo(x + 12, y + r + 18);
        ctx.quadraticCurveTo(x + 6, y + r + 10, x, y + r - 2);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    } else if (origColor === '#4ECDC4') {
      // Light blue = bunny ears
      if (layer === 'front') {
        ctx.fillStyle = color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
        // Left ear (tall rounded)
        ctx.beginPath();
        ctx.ellipse(x - 6, y - r - 8, 4, 12, -0.15, 0, Math.PI * 2);
        ctx.fill();
        // Right ear
        ctx.beginPath();
        ctx.ellipse(x + 6, y - r - 8, 4, 12, 0.15, 0, Math.PI * 2);
        ctx.fill();
        // Inner ear (pink)
        ctx.fillStyle = '#ffaacc88';
        ctx.beginPath();
        ctx.ellipse(x - 6, y - r - 8, 2, 8, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + 6, y - r - 8, 2, 8, 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    } else if (origColor === '#FF6B9D') {
      // Pink = pig tail (curly)
      if (layer === 'behind') {
        ctx.shadowBlur = 6;
        ctx.shadowColor = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y + r);
        ctx.quadraticCurveTo(x + 8, y + r + 4, x + 6, y + r + 10);
        ctx.quadraticCurveTo(x + 2, y + r + 14, x + 8, y + r + 16);
        ctx.quadraticCurveTo(x + 12, y + r + 18, x + 9, y + r + 22);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    } else if (origColor === '#7AE582') {
      // Green = little wings
      if (layer === 'behind') {
        ctx.shadowBlur = 8;
        ctx.shadowColor = color;
        ctx.fillStyle = color + 'aa';
        // Left wing
        ctx.beginPath();
        ctx.moveTo(x - r + 2, y - 2);
        ctx.quadraticCurveTo(x - r - 10, y - 10, x - r - 14, y - 2);
        ctx.quadraticCurveTo(x - r - 10, y + 4, x - r + 2, y + 4);
        ctx.closePath();
        ctx.fill();
        // Right wing
        ctx.beginPath();
        ctx.moveTo(x + r - 2, y - 2);
        ctx.quadraticCurveTo(x + r + 10, y - 10, x + r + 14, y - 2);
        ctx.quadraticCurveTo(x + r + 10, y + 4, x + r - 2, y + 4);
        ctx.closePath();
        ctx.fill();
        // Wing detail lines
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - r, y);
        ctx.lineTo(x - r - 10, y - 4);
        ctx.moveTo(x - r, y + 1);
        ctx.lineTo(x - r - 8, y + 1);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + r + 10, y - 4);
        ctx.moveTo(x + r, y + 1);
        ctx.lineTo(x + r + 8, y + 1);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    } else if (origColor === '#B266FF') {
      // Purple = wizard hat
      if (layer === 'front') {
        ctx.shadowBlur = 10;
        ctx.shadowColor = color;
        // Hat brim
        ctx.fillStyle = color + 'cc';
        ctx.beginPath();
        ctx.ellipse(x, y - r + 2, r + 4, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        // Hat cone
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(x - 10, y - r + 2);
        ctx.lineTo(x, y - r - 20);
        ctx.lineTo(x + 10, y - r + 2);
        ctx.closePath();
        ctx.fill();
        // Hat tip bent
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(x, y - r - 20);
        ctx.quadraticCurveTo(x + 6, y - r - 22, x + 8, y - r - 16);
        ctx.stroke();
        // Star on hat
        ctx.fillStyle = '#ffdd44';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#ffdd44';
        ctx.beginPath();
        ctx.arc(x + 1, y - r - 10, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    } else if (origColor === '#FF8C42') {
      // Orange = unicorn horn
      if (layer === 'front') {
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffffffaa';
        // Horn (spiral cone)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(x - 3, y - r + 2);
        ctx.lineTo(x, y - r - 18);
        ctx.lineTo(x + 3, y - r + 2);
        ctx.closePath();
        ctx.fill();
        // Spiral lines on horn
        ctx.strokeStyle = '#ffcc88';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x - 2, y - r);
        ctx.lineTo(x + 1, y - r - 4);
        ctx.moveTo(x - 1, y - r - 6);
        ctx.lineTo(x + 2, y - r - 10);
        ctx.moveTo(x, y - r - 12);
        ctx.lineTo(x + 1, y - r - 15);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }
  }

  drawObstacles(obstacles) {
    for (const obs of obstacles) {
      obs.draw(this.ctx);
    }
  }

  drawHUD(elapsed, players, round, difficulty) {
    const ctx = this.ctx;
    const remaining = Math.max(0, DIFFICULTY[difficulty].duration - Math.floor(elapsed));

    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${remaining}s`, CANVAS_WIDTH / 2, 35);

    ctx.font = '14px monospace';
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(`Round ${round}/${TOTAL_ROUNDS}`, CANVAS_WIDTH / 2, 55);

    ctx.textAlign = 'left';
    ctx.font = '14px monospace';
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      ctx.fillStyle = p.alive ? p.color : '#666666';
      ctx.fillText(`P${i + 1}: ${p.score}`, 15, 25 + i * 20);
    }

    ctx.restore();
  }

  drawPauseMenu(selection, musicVolume) {
    const ctx = this.ctx;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.textAlign = 'center';

    ctx.shadowBlur = 25;
    ctx.shadowColor = '#aa44ff';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px monospace';
    ctx.fillText('PAUSED', CANVAS_WIDTH / 2, 200);

    ctx.shadowBlur = 0;
    const items = ['Resume', 'Music Volume', 'Quit to Menu'];
    const baseY = 280;

    for (let i = 0; i < items.length; i++) {
      const y = baseY + i * 60;
      const active = i === selection;

      ctx.fillStyle = active ? '#ffffff' : '#666666';
      ctx.font = `${active ? 'bold ' : ''}22px monospace`;

      if (i === 1) {
        const barWidth = 200;
        const barX = CANVAS_WIDTH / 2 - barWidth / 2;
        const barY = y + 15;
        const filled = Math.round(musicVolume * 10);

        ctx.fillText(items[i], CANVAS_WIDTH / 2, y);

        ctx.strokeStyle = active ? '#aa44ff' : '#444444';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, 16);

        ctx.fillStyle = active ? '#aa44ff' : '#555555';
        ctx.fillRect(barX + 2, barY + 2, (barWidth - 4) * musicVolume, 12);

        if (active) {
          ctx.fillStyle = '#888888';
          ctx.font = '14px monospace';
          ctx.fillText('< A/D to adjust >', CANVAS_WIDTH / 2, barY + 38);
        }
      } else {
        ctx.fillText(active ? `> ${items[i]} <` : items[i], CANVAS_WIDTH / 2, y);
      }
    }

    ctx.fillStyle = '#555555';
    ctx.font = '14px monospace';
    ctx.fillText('SPACE or ESC to resume', CANVAS_WIDTH / 2, 500);

    ctx.restore();
  }

  drawTitleScreen(playerCount, difficultyIndex) {
    const ctx = this.ctx;
    this.clear();
    this.drawBackground(0);

    ctx.save();
    ctx.textAlign = 'center';

    ctx.shadowBlur = 30;
    ctx.shadowColor = '#aa44ff';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 52px monospace';
    ctx.fillText('DODGE ARENA', CANVAS_WIDTH / 2, 150);

    ctx.shadowBlur = 0;
    ctx.fillStyle = '#cccccc';
    ctx.font = '18px monospace';
    ctx.fillText('Players', CANVAS_WIDTH / 2, 250);

    ctx.font = 'bold 28px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`< ${playerCount} >`, CANVAS_WIDTH / 2, 285);

    ctx.font = '18px monospace';
    ctx.fillStyle = '#cccccc';
    ctx.fillText('Difficulty', CANVAS_WIDTH / 2, 340);

    const diffKey = DIFFICULTY_KEYS[difficultyIndex];
    ctx.font = 'bold 28px monospace';
    ctx.fillStyle = diffKey === 'nightmare' ? '#ff4444' : diffKey === 'hard' ? '#ffaa00' : '#44ff44';
    ctx.fillText(`< ${DIFFICULTY[diffKey].label} >`, CANVAS_WIDTH / 2, 375);

    ctx.font = '16px monospace';
    ctx.fillStyle = '#888888';
    ctx.fillText('W/S to switch • A/D to change • ENTER to start', CANVAS_WIDTH / 2, 450);

    ctx.restore();
  }

  drawColorSelect(players, playerCount, selections, currentPlayer) {
    const ctx = this.ctx;
    this.clear();
    this.drawBackground(0);

    ctx.save();
    ctx.textAlign = 'center';

    ctx.shadowBlur = 20;
    ctx.shadowColor = '#aa44ff';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('CHOOSE COLORS', CANVAS_WIDTH / 2, 80);

    ctx.shadowBlur = 0;

    for (let p = 0; p < playerCount; p++) {
      const baseY = 140 + p * 150;
      const isActive = p === currentPlayer;

      ctx.fillStyle = isActive ? '#ffffff' : '#666666';
      ctx.font = `bold 20px monospace`;
      ctx.fillText(`Player ${p + 1}`, CANVAS_WIDTH / 2, baseY);

      const totalWidth = COLOR_NAMES.length * 50;
      const startX = (CANVAS_WIDTH - totalWidth) / 2 + 25;

      for (let i = 0; i < COLOR_NAMES.length; i++) {
        const cx = startX + i * 50;
        const cy = baseY + 40;
        const color = COLORS[COLOR_NAMES[i]];
        const taken = selections.some((s, idx) => idx !== p && s === i);
        const selected = selections[p] === i;

        ctx.beginPath();
        ctx.arc(cx, cy, 16, 0, Math.PI * 2);

        if (taken) {
          ctx.fillStyle = '#33333388';
          ctx.fill();
          ctx.strokeStyle = '#555555';
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          ctx.fillStyle = selected ? color : color + '44';
          ctx.fill();
          if (selected) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
          }
          ctx.strokeStyle = color;
          ctx.lineWidth = selected ? 3 : 1;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      }

      if (isActive) {
        ctx.fillStyle = '#888888';
        ctx.font = '12px monospace';
        const keys = p === 0 ? 'A/D' : p === 1 ? 'J/L' : '←/→';
        ctx.fillText(`${keys} to pick • ENTER to confirm`, CANVAS_WIDTH / 2, baseY + 75);
      }
    }

    ctx.restore();
  }

  drawRoundEnd(players, round) {
    const ctx = this.ctx;
    this.clear();
    this.drawBackground(0);

    ctx.save();
    ctx.textAlign = 'center';

    ctx.shadowBlur = 20;
    ctx.shadowColor = '#aa44ff';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(`ROUND ${round} COMPLETE`, CANVAS_WIDTH / 2, 120);

    ctx.shadowBlur = 0;

    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      const y = 200 + i * 100;
      ctx.fillStyle = p.color;
      ctx.font = 'bold 24px monospace';
      ctx.fillText(`Player ${i + 1}`, CANVAS_WIDTH / 2, y);
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px monospace';
      ctx.fillText(`Round Score: ${p.score}`, CANVAS_WIDTH / 2, y + 30);
      ctx.fillStyle = '#aaaaaa';
      ctx.font = '16px monospace';
      ctx.fillText(`Total: ${p.totalScore || p.score}`, CANVAS_WIDTH / 2, y + 55);
    }

    ctx.fillStyle = '#888888';
    ctx.font = '16px monospace';
    ctx.fillText('Press ENTER to continue', CANVAS_WIDTH / 2, 500);

    ctx.restore();
  }

  drawMatchEnd(players, roundWinners) {
    const ctx = this.ctx;
    this.clear();
    this.drawBackground(0);

    ctx.save();
    ctx.textAlign = 'center';

    ctx.shadowBlur = 30;
    ctx.shadowColor = '#ffdd00';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px monospace';
    ctx.fillText('MATCH OVER', CANVAS_WIDTH / 2, 90);

    ctx.shadowBlur = 0;
    ctx.font = 'bold 22px monospace';
    ctx.fillStyle = '#cccccc';
    ctx.fillText('Total Score / Rounds Won', CANVAS_WIDTH / 2, 130);

    const sorted = [...players].sort((a, b) => {
      if (b.roundsWon !== a.roundsWon) return b.roundsWon - a.roundsWon;
      return b.totalScore - a.totalScore;
    });

    for (let i = 0; i < sorted.length; i++) {
      const p = sorted[i];
      const y = 200 + i * 100;
      const medal = i === 0 ? '\u{1F451}' : '';

      ctx.fillStyle = p.color;
      ctx.font = 'bold 26px monospace';
      ctx.fillText(`${medal} Player ${p.index + 1}`, CANVAS_WIDTH / 2, y);

      ctx.fillStyle = '#ffffff';
      ctx.font = '18px monospace';
      ctx.fillText(`Score: ${p.totalScore}  |  Rounds Won: ${p.roundsWon}`, CANVAS_WIDTH / 2, y + 35);
    }

    ctx.fillStyle = '#888888';
    ctx.font = '16px monospace';
    ctx.fillText('Press ENTER to play again', CANVAS_WIDTH / 2, 550);

    ctx.restore();
  }

  drawCountdown(count) {
    const ctx = this.ctx;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 40;
    ctx.shadowColor = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 80px monospace';
    ctx.fillText(count > 0 ? count.toString() : 'GO!', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
    ctx.restore();
  }
}
