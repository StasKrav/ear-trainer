import { Exercise } from './base.js';
import { AudioEngine } from '../audio.js';

// Группы аккордов. «Трезвучия» — база, её нельзя выключить.
export const CHORD_GROUPS = [
  { id: 'triads',   name: 'Трезвучия',        members: ['maj', 'min'] },
  { id: 'sevenths', name: 'Септаккорды',      members: ['maj7', 'min7'] },
  { id: 'ninths',   name: 'Нонаккорды',       members: ['maj9', 'min9'] },
  { id: 'altered',  name: 'Уменьш./Увелич.',  members: ['dim', 'aug'] },
];

// Типы аккордов. intervals — полутоны от корня.
// quality — то, что отвечает пользователь: 'major' | 'minor'.
export const CHORD_TYPES = [
  { id: 'maj',  name: 'Мажорное трезвучие',        intervals: [0, 4, 7],        quality: 'major' },
  { id: 'min',  name: 'Минорное трезвучие',         intervals: [0, 3, 7],        quality: 'minor' },
  { id: 'maj7', name: 'Большой мажорный септаккорд', intervals: [0, 4, 7, 11],   quality: 'major' },
  { id: 'min7', name: 'Малый минорный септаккорд',   intervals: [0, 3, 7, 10],   quality: 'minor' },
  { id: 'maj9', name: 'Большой мажорный нонаккорд',  intervals: [0, 4, 7, 11, 14], quality: 'major' },
  { id: 'min9', name: 'Малый минорный нонаккорд',    intervals: [0, 3, 7, 10, 14], quality: 'minor' },
  { id: 'dim',  name: 'Уменьшенное трезвучие',      intervals: [0, 3, 6],        quality: 'minor' },
  { id: 'aug',  name: 'Увеличенное трезвучие',      intervals: [0, 4, 8],        quality: 'major' },
];

// Ответы всегда две кнопки — независимо от включённых групп.
export const CHORD_ANSWERS = [
  { id: 'major', name: 'Мажор' },
  { id: 'minor', name: 'Минор' },
];

export class ChordExercise extends Exercise {
  constructor(opts) {
    super(opts);
    this._bag = [];
  }

  // Все типы аккордов из включённых групп
  pool() {
    const allowedGroups = this.opts.allowedGroups || ['triads'];
    return CHORD_TYPES.filter((ct) =>
      CHORD_GROUPS.some(
        (g) => allowedGroups.includes(g.id) && g.members.includes(ct.id)
      )
    );
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
    const type = this._bag.pop();

    const { min, max } = this.opts.range;
    const span = Math.max(...type.intervals);
    const rootLow = min;
    const rootHigh = max - span;
    const root =
      rootLow + Math.floor(Math.random() * (rootHigh - rootLow + 1));

    let notes = type.intervals.map((iv) => root + iv);

    if (this.opts.mode === 'melodic') {
      let dir = this.opts.direction || 'up';
      if (dir === 'mix') dir = Math.random() < 0.5 ? 'up' : 'down';
      if (dir === 'down') notes = [...notes].reverse();
    }

    return {
      notes,
      answer: type.quality,
      chordType: type.id,
      direction: this.opts.direction,
      mode: this.opts.mode,
    };
  }

  play(ex) {
    if (ex.mode === 'harmonic') {
      AudioEngine.playHarmonic(ex.notes);
    } else {
      AudioEngine.playMelodic(ex.notes);
    }
  }

  getAnswerOptions() {
    return CHORD_ANSWERS.map((a) => ({ id: a.id, label: a.name }));
  }

  getAnswerLabel(id) {
    return CHORD_ANSWERS.find((a) => a.id === id)?.name ?? id;
  }
}