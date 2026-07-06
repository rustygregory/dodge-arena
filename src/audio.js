let audioCtx = null;
let musicGain = null;
let masterGain = null;
let musicNodes = [];
let musicPlaying = false;
let musicVolume = 0.3;
let musicTempo = 1.0;
let musicTimeout = null;
let musicTrack = 0;

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
    ctx.resume().then(() => {
      if (!musicPlaying) startMusic();
    });
  } else {
    if (!musicPlaying) startMusic();
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

export function getMusicTrack() {
  return musicTrack;
}

export function setMusicTrack(track) {
  musicTrack = track;
  if (musicPlaying) {
    stopMusic();
    startMusic();
  }
}

export function startMusic() {
  if (musicPlaying) return;
  const ctx = getContext();
  if (ctx.state === 'suspended') {
    ctx.resume().then(() => {
      if (!musicPlaying) {
        musicPlaying = true;
        scheduleMusic();
      }
    });
    return;
  }
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
  if (musicTrack === 0) {
    scheduleMusicA();
  } else if (musicTrack === 1) {
    scheduleMusicB();
  } else if (musicTrack === 2) {
    scheduleMusicC();
  } else {
    scheduleMusicD();
  }
}

function scheduleMusicA() {
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

function scheduleMusicB() {
  if (!musicPlaying) return;
  const ctx = getContext();
  const now = ctx.currentTime;

  const baseLoopDuration = 4;
  const loopDuration = baseLoopDuration / musicTempo;

  // Deeper bass with a minor key feel
  const bassNotes = [41.2, 41.2, 55, 49, 41.2, 46.2, 55, 49];
  for (let i = 0; i < bassNotes.length; i++) {
    const startTime = now + (i * loopDuration / bassNotes.length);
    const duration = loopDuration / bassNotes.length - 0.02;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(musicGain);

    osc.type = 'square';
    osc.frequency.value = bassNotes[i];
    gain.gain.setValueAtTime(0.1, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration);
    musicNodes.push(osc);
  }

  // Descending minor arpeggio
  const arpNotes = [330, 392, 494, 392, 294, 349, 440, 349];
  for (let i = 0; i < arpNotes.length; i++) {
    const startTime = now + (i * loopDuration / arpNotes.length);
    const duration = loopDuration / arpNotes.length * 0.5;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(musicGain);

    osc.type = 'triangle';
    osc.frequency.value = arpNotes[i];
    gain.gain.setValueAtTime(0.07, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
    musicNodes.push(osc);
  }

  // Syncopated hi-hat with kick-like hits
  const hatCount = musicTempo > 1.4 ? 32 : 16;
  for (let i = 0; i < hatCount; i++) {
    const startTime = now + (i * loopDuration / hatCount);

    const bufferSize = ctx.sampleRate * 0.04;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let s = 0; s < bufferSize; s++) {
      data[s] = (Math.random() * 2 - 1) * (1 - s / bufferSize) * (1 - s / bufferSize);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noise.connect(noiseGain);
    noiseGain.connect(musicGain);

    const vol = i % 4 === 0 ? 0.07 : i % 2 === 0 ? 0.035 : 0.02;
    noiseGain.gain.setValueAtTime(vol, startTime);

    noise.start(startTime);
    noise.stop(startTime + 0.04);
    musicNodes.push(noise);
  }

  // Kick hits on beat
  for (let i = 0; i < 4; i++) {
    const startTime = now + (i * loopDuration / 4);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(musicGain);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, startTime);
    osc.frequency.exponentialRampToValueAtTime(40, startTime + 0.08);
    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

    osc.start(startTime);
    osc.stop(startTime + 0.15);
    musicNodes.push(osc);
  }

  // Dark pad chord (minor)
  const padFreqs = [110, 130.8, 164.8];
  for (const freq of padFreqs) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(musicGain);

    osc.type = 'sawtooth';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.setValueAtTime(0.02, now + loopDuration - 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + loopDuration);

    osc.start(now);
    osc.stop(now + loopDuration);
    musicNodes.push(osc);
  }

  // High shimmer accents
  const shimmerTimes = [0.25, 0.75];
  for (const t of shimmerTimes) {
    const startTime = now + loopDuration * t;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(musicGain);

    osc.type = 'sine';
    osc.frequency.value = 880 + t * 220;
    gain.gain.setValueAtTime(0.04, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

    osc.start(startTime);
    osc.stop(startTime + 0.35);
    musicNodes.push(osc);
  }

  musicNodes = musicNodes.filter(n => {
    try { return n.context.currentTime < now + loopDuration + 1; } catch { return false; }
  });

  musicTimeout = setTimeout(() => {
    if (musicPlaying) scheduleMusic();
  }, (loopDuration - 0.1) * 1000);
}

function scheduleMusicC() {
  if (!musicPlaying) return;
  const ctx = getContext();
  const now = ctx.currentTime;

  const baseLoopDuration = 4;
  const loopDuration = baseLoopDuration / musicTempo;

  // Punchy four-on-the-floor kick
  for (let i = 0; i < 8; i++) {
    const startTime = now + (i * loopDuration / 8);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(musicGain);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, startTime);
    osc.frequency.exponentialRampToValueAtTime(45, startTime + 0.07);
    gain.gain.setValueAtTime(i % 2 === 0 ? 0.25 : 0.15, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.1);

    osc.start(startTime);
    osc.stop(startTime + 0.12);
    musicNodes.push(osc);
  }

  // Snappy snare on 2 and 4
  for (let i = 0; i < 4; i++) {
    if (i % 2 === 0) continue;
    const startTime = now + (i * loopDuration / 4);

    const bufferSize = ctx.sampleRate * 0.06;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let s = 0; s < bufferSize; s++) {
      data[s] = (Math.random() * 2 - 1) * Math.pow(1 - s / bufferSize, 2);
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noise.connect(noiseGain);
    noiseGain.connect(musicGain);
    noiseGain.gain.setValueAtTime(0.12, startTime);

    noise.start(startTime);
    noise.stop(startTime + 0.06);
    musicNodes.push(noise);

    // Snare body tone
    const snareOsc = ctx.createOscillator();
    const snareGain = ctx.createGain();
    snareOsc.connect(snareGain);
    snareGain.connect(musicGain);
    snareOsc.type = 'triangle';
    snareOsc.frequency.setValueAtTime(200, startTime);
    snareOsc.frequency.exponentialRampToValueAtTime(120, startTime + 0.04);
    snareGain.gain.setValueAtTime(0.1, startTime);
    snareGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.05);
    snareOsc.start(startTime);
    snareOsc.stop(startTime + 0.06);
    musicNodes.push(snareOsc);
  }

  // Offbeat hi-hats (pop groove)
  for (let i = 0; i < 16; i++) {
    const startTime = now + (i * loopDuration / 16);
    const bufferSize = ctx.sampleRate * 0.02;
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

    const vol = i % 2 === 1 ? 0.05 : 0.025;
    noiseGain.gain.setValueAtTime(vol, startTime);

    noise.start(startTime);
    noise.stop(startTime + 0.02);
    musicNodes.push(noise);
  }

  // Bouncy bass line (pop-synth)
  const bassNotes = [130.8, 130.8, 164.8, 146.8, 130.8, 174.6, 164.8, 146.8];
  for (let i = 0; i < bassNotes.length; i++) {
    const startTime = now + (i * loopDuration / bassNotes.length);
    const duration = loopDuration / bassNotes.length * 0.7;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(musicGain);

    osc.type = 'square';
    osc.frequency.value = bassNotes[i];
    gain.gain.setValueAtTime(0.09, startTime);
    gain.gain.setValueAtTime(0.09, startTime + duration * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
    musicNodes.push(osc);
  }

  // Catchy melody hook (major, upbeat)
  const melodyNotes = [523, 587, 659, 784, 659, 587, 523, 659];
  const melodyRhythm = [0, 0.12, 0.25, 0.37, 0.5, 0.62, 0.75, 0.87];
  for (let i = 0; i < melodyNotes.length; i++) {
    const startTime = now + melodyRhythm[i] * loopDuration;
    const duration = loopDuration / melodyNotes.length * 0.55;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(musicGain);

    osc.type = 'sine';
    osc.frequency.value = melodyNotes[i];
    gain.gain.setValueAtTime(0.1, startTime);
    gain.gain.setValueAtTime(0.1, startTime + duration * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
    musicNodes.push(osc);

    // Harmony an octave below, softer
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(musicGain);

    osc2.type = 'triangle';
    osc2.frequency.value = melodyNotes[i] / 2;
    gain2.gain.setValueAtTime(0.04, startTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc2.start(startTime);
    osc2.stop(startTime + duration + 0.01);
    musicNodes.push(osc2);
  }

  // Bright chord stabs on beat 1 and 3
  const chordFreqs = [[261.6, 329.6, 392], [293.7, 370, 440]];
  for (let c = 0; c < 2; c++) {
    const startTime = now + (c * loopDuration / 2);
    for (const freq of chordFreqs[c]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(musicGain);

      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.04, startTime);
      gain.gain.setValueAtTime(0.04, startTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
      musicNodes.push(osc);
    }
  }

  musicNodes = musicNodes.filter(n => {
    try { return n.context.currentTime < now + loopDuration + 1; } catch { return false; }
  });

  musicTimeout = setTimeout(() => {
    if (musicPlaying) scheduleMusic();
  }, (loopDuration - 0.1) * 1000);
}

function scheduleMusicD() {
  if (!musicPlaying) return;
  const ctx = getContext();
  const now = ctx.currentTime;

  const baseLoopDuration = 3.2;
  const loopDuration = baseLoopDuration / musicTempo;

  // Tight punchy kick — short and modern
  for (let i = 0; i < 8; i++) {
    const startTime = now + (i * loopDuration / 8);
    if (i === 3 || i === 7) continue; // ghost hits for groove
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(musicGain);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, startTime);
    osc.frequency.exponentialRampToValueAtTime(35, startTime + 0.04);
    gain.gain.setValueAtTime(0.22, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08);

    osc.start(startTime);
    osc.stop(startTime + 0.09);
    musicNodes.push(osc);
  }

  // Clap/snap on 2 and 4 — tight noise burst
  for (let i = 1; i < 4; i += 2) {
    const startTime = now + (i * loopDuration / 4);

    const bufferSize = ctx.sampleRate * 0.035;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let s = 0; s < bufferSize; s++) {
      const env = Math.pow(1 - s / bufferSize, 4);
      data[s] = (Math.random() * 2 - 1) * env;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseGain = ctx.createGain();
    noise.connect(noiseGain);
    noiseGain.connect(musicGain);
    noiseGain.gain.setValueAtTime(0.14, startTime);

    noise.start(startTime);
    noise.stop(startTime + 0.035);
    musicNodes.push(noise);
  }

  // Shaker — fast 16th note pattern, modern feel
  for (let i = 0; i < 32; i++) {
    const startTime = now + (i * loopDuration / 32);
    const bufferSize = ctx.sampleRate * 0.012;
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

    const vol = i % 4 === 0 ? 0.035 : i % 2 === 0 ? 0.02 : 0.012;
    noiseGain.gain.setValueAtTime(vol, startTime);

    noise.start(startTime);
    noise.stop(startTime + 0.012);
    musicNodes.push(noise);
  }

  // Sliding sub bass — smooth and modern
  const bassPattern = [
    { note: 110, time: 0 },
    { note: 110, time: 0.125 },
    { note: 130.8, time: 0.25 },
    { note: 146.8, time: 0.375 },
    { note: 130.8, time: 0.5 },
    { note: 110, time: 0.625 },
    { note: 146.8, time: 0.75 },
    { note: 164.8, time: 0.875 },
  ];
  for (const b of bassPattern) {
    const startTime = now + b.time * loopDuration;
    const duration = loopDuration / 8 * 0.8;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(musicGain);

    osc.type = 'sine';
    osc.frequency.value = b.note;
    gain.gain.setValueAtTime(0.12, startTime);
    gain.gain.setValueAtTime(0.12, startTime + duration * 0.6);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
    musicNodes.push(osc);
  }

  // Plucky synth melody — short staccato, modern pop
  const melody = [
    { note: 587, time: 0 },
    { note: 659, time: 0.1 },
    { note: 784, time: 0.2 },
    { note: 880, time: 0.35 },
    { note: 784, time: 0.5 },
    { note: 659, time: 0.6 },
    { note: 784, time: 0.72 },
    { note: 880, time: 0.85 },
  ];
  for (const m of melody) {
    const startTime = now + m.time * loopDuration;
    const duration = 0.08;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(musicGain);

    osc.type = 'sine';
    osc.frequency.value = m.note;
    gain.gain.setValueAtTime(0.1, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.01);
    musicNodes.push(osc);

    // Slight detune layer for width
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(musicGain);

    osc2.type = 'sine';
    osc2.frequency.value = m.note * 1.003;
    gain2.gain.setValueAtTime(0.06, startTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc2.start(startTime);
    osc2.stop(startTime + duration + 0.01);
    musicNodes.push(osc2);
  }

  // Chord pads — smooth filtered swell
  const chords = [
    { freqs: [293.7, 370, 440], time: 0 },
    { freqs: [329.6, 415.3, 493.9], time: 0.5 },
  ];
  for (const chord of chords) {
    const startTime = now + chord.time * loopDuration;
    const duration = loopDuration * 0.45;
    for (const freq of chord.freqs) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(musicGain);

      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.035, startTime + 0.05);
      gain.gain.setValueAtTime(0.035, startTime + duration * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.01);
      musicNodes.push(osc);
    }
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
