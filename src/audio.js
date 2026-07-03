let audioCtx = null;
let musicGain = null;
let masterGain = null;
let musicNodes = [];
let musicPlaying = false;
let musicVolume = 0.3;
let musicTempo = 1.0;
let musicTimeout = null;

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);
    musicGain = audioCtx.createGain();
    musicGain.gain.value = musicVolume;
    musicGain.connect(masterGain);
  }
  return audioCtx;
}

export function resumeAudio() {
  const ctx = getContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }
}

export function getMusicVolume() {
  return musicVolume;
}

export function setMusicVolume(vol) {
  musicVolume = Math.max(0, Math.min(1, vol));
  if (musicGain) {
    musicGain.gain.value = musicVolume;
  }
}

export function setMusicTempo(tempo) {
  musicTempo = tempo;
}

export function startMusic() {
  if (musicPlaying) return;
  const ctx = getContext();
  if (ctx.state === 'suspended') return;
  musicPlaying = true;
  scheduleMusic();
}

export function stopMusic() {
  musicPlaying = false;
  if (musicTimeout) {
    clearTimeout(musicTimeout);
    musicTimeout = null;
  }
  for (const node of musicNodes) {
    try { node.stop(); } catch (e) {}
  }
  musicNodes = [];
}

function scheduleMusic() {
  if (!musicPlaying) return;
  const ctx = getContext();
  const now = ctx.currentTime;

  const baseLoopDuration = 4;
  const loopDuration = baseLoopDuration / musicTempo;

  const bassNotes = [55, 55, 73.4, 65.4, 55, 55, 82.4, 73.4];
  const arpNotes = [220, 330, 440, 330, 262, 392, 523, 392];

  for (let i = 0; i < bassNotes.length; i++) {
    const startTime = now + (i * loopDuration / bassNotes.length);
    const duration = loopDuration / bassNotes.length - 0.02;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(musicGain);

    osc.type = 'sawtooth';
    osc.frequency.value = bassNotes[i];
    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration);
    musicNodes.push(osc);
  }

  for (let i = 0; i < arpNotes.length; i++) {
    const startTime = now + (i * loopDuration / arpNotes.length);
    const duration = loopDuration / arpNotes.length * 0.6;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(musicGain);

    osc.type = 'sine';
    osc.frequency.value = arpNotes[i];
    gain.gain.setValueAtTime(0.08, startTime);
    gain.gain.setValueAtTime(0.08, startTime + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
    musicNodes.push(osc);
  }

  // Hi-hat pattern — more hits at higher tempo for intensity
  const hatCount = musicTempo > 1.4 ? 32 : 16;
  for (let i = 0; i < hatCount; i++) {
    const startTime = now + (i * loopDuration / hatCount);

    const bufferSize = ctx.sampleRate * 0.03;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let s = 0; s < bufferSize; s++) {
      data[s] = (Math.random() * 2 - 1) * (1 - s / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noise.connect(noiseGain);
    noiseGain.connect(musicGain);

    const vol = i % 4 === 0 ? 0.06 : 0.025;
    noiseGain.gain.setValueAtTime(vol, startTime);

    noise.start(startTime);
    noise.stop(startTime + 0.03);
    musicNodes.push(noise);
  }

  // Pad chord
  const padFreqs = [130.8, 164.8, 196];
  for (const freq of padFreqs) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(musicGain);

    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.03, now);
    gain.gain.setValueAtTime(0.03, now + loopDuration - 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + loopDuration);

    osc.start(now);
    osc.stop(now + loopDuration);
    musicNodes.push(osc);
  }

  musicNodes = musicNodes.filter(n => {
    try { return n.context.currentTime < now + loopDuration + 1; } catch { return false; }
  });

  musicTimeout = setTimeout(() => {
    if (musicPlaying) scheduleMusic();
  }, (loopDuration - 0.1) * 1000);
}

export function playElimination() {
  const ctx = getContext();
  if (ctx.state === 'suspended') return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(masterGain);

  osc.type = 'square';
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.3);

  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

  osc.start();
  osc.stop(ctx.currentTime + 0.35);
}

export function playRoundStart() {
  const ctx = getContext();
  if (ctx.state === 'suspended') return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(masterGain);

  osc.type = 'sine';
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.15);

  gain.gain.setValueAtTime(0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);

  osc.start();
  osc.stop(ctx.currentTime + 0.25);
}

export function playRoundEnd() {
  const ctx = getContext();
  if (ctx.state === 'suspended') return;

  const notes = [523, 659, 784, 1047];
  for (let i = 0; i < notes.length; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(masterGain);

    osc.type = 'sine';
    const start = ctx.currentTime + i * 0.12;
    osc.frequency.setValueAtTime(notes[i], start);

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
    gain.gain.setValueAtTime(0.2, start + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, start + 0.4);

    osc.start(start);
    osc.stop(start + 0.45);
  }

  // Shimmer layer
  for (let i = 0; i < 3; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(masterGain);

    osc.type = 'triangle';
    const start = ctx.currentTime + 0.3 + i * 0.08;
    osc.frequency.setValueAtTime(1200 + i * 200, start);

    gain.gain.setValueAtTime(0.06, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

    osc.start(start);
    osc.stop(start + 0.35);
  }
}
