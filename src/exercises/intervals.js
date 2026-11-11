import { Exercise } from './base.js';
import { AudioEngine } from '../audio.js';

export const INTERVALS = [
  { id: 'm2', name: 'м.2', semitones: 1 },
  { id: 'M2', name: 'б.2', semitones: 2 },
  { id: 'm3', name: 'м.3', semitones: 3 },
  { id: 'M3', name: 'б.3', semitones: 4 },
  { id: 'P4', name: 'ч.4', semitones: 5 },
  { id: 'TT', name: 'ТТ',  semitones: 6 },
  { id: 'P5', name: 'ч.5', semitones: 7 },
  { id: 'm6', name: 'м.6', semitones: 8 },
  { id: 'M6', name: 'б.6', semitones: 9 },
  { id: 'm7', name: 'м.7', semitones: 10 },
  { id: 'M7', name: 'б.7', semitones: 11 },
  { id: 'P8', name: 'ч.8', semitones: 12 },
];

export const INTERVAL_GROUPS = [
  { id: 'seconds',  name: 'Секунды',              members: ['m2', 'M2'] },
  { id: 'thirds',   name: 'Терции',               members: ['m3', 'M3'] },
  { id: 'perfect',  name: 'Кварта/тритон/квинта', members: ['P4', 'TT', 'P5'] },
  { id: 'sixths',   name: 'Сексты',               members: ['m6', 'M6'] },
  { id: 'sevenths', name: 'Септимы',              members: ['m7', 'M7'] },
  { id: 'octaves',  name: 'Октавы',               members: ['P8'] },
];

export class IntervalExercise extends Exercise {
  constructor(opts) {
    super(opts);
    this._bag = [];
  }

  pool() {
    return INTERVALS.filter((i) => this.opts.allowed.includes(i.id));
  }

  _refillBag() {
    const arr = [...this.pool()];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    this._bag = arr;
  }

  generate() {
    if (this._bag.length === 0) this._refillBag();
    const target = this._bag.pop();

    const { min, max } = this.opts.range;

    let direction = 'up';
    if (this.opts.mode === 'melodic') {
      if (this.opts.direction === 'mix') {
        direction = Math.random() < 0.5 ? 'up' : 'down';
      } else {
        direction = this.opts.direction || 'up';
      }
    }

    let root;
    if (direction === 'down') {
      const low = min + target.semitones;
      const high = max;
      root = low + Math.floor(Math.random() * (high - low + 1));
    } else {
      const low = min;
      const high = max - target.semitones;
      root = low + Math.floor(Math.random() * (high - low + 1));
    }

    const notes =
      direction === 'down'
        ? [root, root - target.semitones]
        : [root, root + target.semitones];

    return { notes, answer: target.id, direction, mode: this.opts.mode };
  }

  play(ex) {
    if (ex.mode === 'harmonic') {
      AudioEngine.playHarmonic(ex.notes);
    } else {
      AudioEngine.playMelodic(ex.notes);
    }
  }

  getAnswerOptions() {
    return this.pool()
      .sort((a, b) => a.semitones - b.semitones)
      .map((iv) => ({ id: iv.id, label: iv.name }));
  }

  getAnswerLabel(id) {
    return INTERVALS.find((iv) => iv.id === id)?.name ?? id;
  }
}