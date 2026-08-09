/* ==========================================================================
   Little Smashers - Web Audio API Synthesizer & Speech Engine
   ========================================================================== */

class SoundSynthesizer {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.volume = 0.8;
    this.theme = 'xylophone';
    this.speechEnabled = true;
    this.speechSynth = window.speechSynthesis || null;

    // Musical scale frequencies (Pentatonic & Diatonic ranges)
    this.notes = [
      261.63, // C4
      293.66, // D4
      329.63, // E4
      349.23, // F4
      392.00, // G4
      440.00, // A4
      493.88, // B4
      523.25, // C5
      587.33, // D5
      659.25, // E5
      698.46, // F5
      783.99, // G5
      880.00, // A5
      987.77, // B5
      1046.50 // C6
    ];
  }

  init() {
    if (this.ctx) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  setTheme(theme) {
    this.theme = theme;
  }

  setSpeechEnabled(enabled) {
    this.speechEnabled = enabled;
  }

  // Play musical tone based on seed index or random
  playTone(index = null) {
    this.ensureContext();
    if (!this.ctx) return;

    const freqIndex = index !== null ? index % this.notes.length : Math.floor(Math.random() * this.notes.length);
    const freq = this.notes[freqIndex];
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    switch (this.theme) {
      case 'xylophone':
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        break;

      case 'chimes':
        osc.type = 'triangle';
        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        break;

      case 'synth':
        osc.type = 'square';
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
        break;

      case 'marimba':
      default:
        osc.type = 'sine';
        gain.gain.setValueAtTime(1.0, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        break;
    }

    osc.frequency.setValueAtTime(freq, now);
    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.3);
  }

  // Synthesize fun cute animal sounds
  playAnimalSound(animalType) {
    this.ensureContext();
    if (!this.ctx) return;

    // Early return for unknown animal types — avoids creating orphaned audio nodes
    if (!['dog', 'cat', 'duck', 'bird', 'lion'].includes(animalType)) {
      this.playTone();
      return;
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Connect audio graph BEFORE starting oscillator to prevent silent playback
    osc.connect(gain);
    gain.connect(this.masterGain);

    switch (animalType) {
      case 'dog': // Woof!
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.15);
        gain.gain.setValueAtTime(0.8, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
        osc.start(now);
        osc.stop(now + 0.2);
        break;

      case 'cat': // Meow~
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.2);
        osc.frequency.linearRampToValueAtTime(600, now + 0.4);
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.5);
        break;

      case 'duck': // Quack!
        osc.type = 'square';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(250, now + 0.15);
        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.22);
        break;

      case 'bird': // Tweet!
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.linearRampToValueAtTime(1800, now + 0.08);
        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.15);
        break;

      case 'lion': // Roar!
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.4);
        gain.gain.setValueAtTime(0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.55);
        break;
    }
  }

  // Bubble Pop Sound Effect
  playPop() {
    this.ensureContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const startFreq = 400 + Math.random() * 400;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 2, now + 0.06);

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // Speak text (Letters / Numbers) using Web Speech API
  speak(text) {
    if (!this.speechEnabled || !this.speechSynth) return;

    // Cancel ongoing speech to stay responsive to fast smashing
    this.speechSynth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.2; // Slightly higher friendly pitch for kids
    utterance.volume = this.volume;

    this.speechSynth.speak(utterance);
  }
}

window.soundEngine = new SoundSynthesizer();
