// All sound is synthesized with the Web Audio API — no audio files,
// no network, just short blips that answer a tap at once.

let audioContext = null;

export function unlockAudio() {
  try {
    if (!audioContext) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return;
      audioContext = new Ctor();
    }
    if (audioContext.state === 'suspended') void audioContext.resume();
  } catch (err) {
    audioContext = null;
  }
}

function tone(freq, length, kind, loud) {
  if (!audioContext) return;
  try {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = kind;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(loud, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + length);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start();
    osc.stop(audioContext.currentTime + length);
  } catch (err) {
    // Sound is garnish; a silent game is still a complete game.
  }
}

export const sfx = {
  add() { tone(520, 0.09, 'triangle', 0.12); },
  cookReady() { tone(660, 0.12, 'sine', 0.14); tone(880, 0.16, 'sine', 0.12); },
  serve() { tone(740, 0.1, 'triangle', 0.14); setTimeout(() => tone(990, 0.14, 'triangle', 0.14), 70); },
  perfect() { tone(880, 0.1, 'sine', 0.14); setTimeout(() => tone(1174, 0.2, 'sine', 0.14), 80); },
  error() { tone(180, 0.16, 'sawtooth', 0.08); },
  burnt() { tone(140, 0.3, 'sawtooth', 0.1); },
  lost() { tone(220, 0.25, 'square', 0.07); },
  win() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.22, 'triangle', 0.13), i * 110)); },
};
