(function () {
  'use strict';

  const GY = window.GY = window.GY || {};

  GY.createAudio = function () {
    let context = null;
    let master = null;
    let unlocked = false;

    function unlock() {
      if (!context) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        context = new AudioContext();
        master = context.createGain();
        master.gain.value = 0.12;
        master.connect(context.destination);
      }
      if (context.state === 'suspended') context.resume();
      unlocked = true;
    }

    function tone(frequency, duration, options) {
      if (!unlocked || !context) return;
      const opts = Object.assign({ type: 'sine', volume: 0.2, slide: 1 }, options || {});
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = opts.type;
      oscillator.frequency.setValueAtTime(frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, frequency * opts.slide), now + duration);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, opts.volume), now + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain);
      gain.connect(master);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.02);
    }

    function play(cue) {
      if (cue === 'attack') tone(250, 0.1, { type: 'sawtooth', volume: 0.1, slide: 1.8 });
      else if (cue === 'skill') {
        tone(310, 0.22, { type: 'triangle', volume: 0.14, slide: 2.2 });
        setTimeout(() => tone(520, 0.25, { type: 'sine', volume: 0.1, slide: 1.4 }), 45);
      } else if (cue === 'heal') tone(460, 0.5, { type: 'sine', volume: 0.13, slide: 1.45 });
      else if (cue === 'danger') tone(130, 0.42, { type: 'sawtooth', volume: 0.13, slide: 0.72 });
      else if (cue === 'checkpoint') {
        tone(330, 0.32, { type: 'triangle', volume: 0.12, slide: 1.5 });
        setTimeout(() => tone(495, 0.42, { type: 'triangle', volume: 0.1, slide: 1.25 }), 120);
      } else if (cue === 'victory') {
        [330, 440, 550].forEach((value, index) => setTimeout(() => tone(value, 0.5, { type: 'triangle', volume: 0.12, slide: 1.12 }), index * 150));
      }
    }

    return { unlock, play };
  };
}());
