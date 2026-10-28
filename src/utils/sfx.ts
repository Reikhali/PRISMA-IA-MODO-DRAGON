/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const MUTED_STORAGE_KEY = 'dragon-throne-muted';

export function isAudioMuted(): boolean {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(MUTED_STORAGE_KEY) === '1';
}

export function setAudioMuted(muted: boolean): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MUTED_STORAGE_KEY, muted ? '1' : '0');
}

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx) {
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function createNoiseBuffer(ctx: AudioContext, duration: number): AudioBuffer {
  const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * duration), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  return buffer;
}

export function playDragonRoar(): void {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.value = 0.55;
  masterGain.connect(ctx.destination);

  // Filter & sub-bass envelope
  const roarGain = ctx.createGain();
  roarGain.gain.setValueAtTime(0.0001, t);
  roarGain.gain.exponentialRampToValueAtTime(0.55, t + 0.18);
  roarGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);

  const lowpass = ctx.createBiquadFilter();
  lowpass.type = 'lowpass';
  lowpass.frequency.setValueAtTime(280, t);
  lowpass.frequency.exponentialRampToValueAtTime(900, t + 0.5);
  lowpass.frequency.exponentialRampToValueAtTime(180, t + 1.6);
  lowpass.connect(roarGain).connect(masterGain);

  // Layered sawtooth oscillators for primal harmonic dragon growl
  const baseFreqs = [55, 68, 82];
  baseFreqs.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.62, t + 1.5);

    const oscGain = ctx.createGain();
    oscGain.gain.value = 0.4 / (idx + 1);

    osc.connect(oscGain).connect(lowpass);
    osc.start(t);
    osc.stop(t + 1.7);
  });

  // White noise wind/fire breath surge
  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = createNoiseBuffer(ctx, 2.2);

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.Q.value = 0.8;
  bandpass.frequency.setValueAtTime(400, t);
  bandpass.frequency.exponentialRampToValueAtTime(2600, t + 0.35);
  bandpass.frequency.exponentialRampToValueAtTime(320, t + 1.8);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.0001, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.35, t + 0.25);
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, t + 1.9);

  noiseSource.connect(bandpass).connect(noiseGain).connect(masterGain);
  noiseSource.start(t);
  noiseSource.stop(t + 2.0);
}
