import { describe, it, expect } from 'vitest';
import { ChordExercise, CHORD_TYPES, CHORD_GROUPS } from './chords.js';
import { CHORD_RANGES } from '../constants.js';

const RANGE = CHORD_RANGES.medium;

function makeExercise(overrides = {}) {
  return new ChordExercise({
    mode: 'harmonic',
    direction: 'up',
    range: RANGE,
    allowedGroups: ['triads', 'sevenths'],
    ...overrides,
  });
}

describe('ChordExercise', () => {
  it('answer всегда major или minor', () => {
    const ex = makeExercise();
    for (let i = 0; i < 200; i++) {
      expect(['major', 'minor']).toContain(ex.generate().answer);
    }
  });

  it('не выходит за диапазон с учётом расширения аккорда', () => {
    const ex = makeExercise({ allowedGroups: ['triads', 'sevenths', 'ninths'] });
    for (let i = 0; i < 200; i++) {
      const q = ex.generate();
      const low = Math.min(...q.notes);
      const high = Math.max(...q.notes);
      expect(low).toBeGreaterThanOrEqual(RANGE.min);
      expect(high).toBeLessThanOrEqual(RANGE.max);
    }
  });

  it('играет только аккорды из включённых групп', () => {
    const ex = makeExercise({ allowedGroups: ['triads'] });
    const allowedIds = new Set(
      CHORD_GROUPS.find((g) => g.id === 'triads').members
    );
    for (let i = 0; i < 100; i++) {
      const q = ex.generate();
      expect(allowedIds.has(q.chordType)).toBe(true);
    }
  });

  it('не выпадает аккордов из выключенных групп', () => {
    const ex = makeExercise({ allowedGroups: ['sevenths'] });
    const allowedIds = new Set(
      CHORD_GROUPS.find((g) => g.id === 'sevenths').members
    );
    for (let i = 0; i < 100; i++) {
      const q = ex.generate();
      expect(allowedIds.has(q.chordType)).toBe(true);
    }
  });

  it('мешок не повторяет аккорд, пока не опустеет', () => {
    const ex = makeExercise({ allowedGroups: ['triads'] });
    const firstTwo = [ex.generate().chordType, ex.generate().chordType];
    expect(new Set(firstTwo).size).toBe(2);
  });

  it('quality каждого типа соответствует ожиданию', () => {
    const expected = {
      maj: 'major',
      min: 'minor',
      maj7: 'major',
      min7: 'minor',
      maj9: 'major',
      min9: 'minor',
      dim: 'minor',
      aug: 'major',
    };
    CHORD_TYPES.forEach((ct) => {
      expect(ct.quality).toBe(expected[ct.id]);
    });
  });

  it('арпеджио вниз идёт от высоких нот к низким', () => {
    const ex = makeExercise({
      mode: 'melodic',
      direction: 'down',
      allowedGroups: ['triads'],
    });
    for (let i = 0; i < 50; i++) {
      const q = ex.generate();
      for (let j = 1; j < q.notes.length; j++) {
        expect(q.notes[j]).toBeLessThan(q.notes[j - 1]);
      }
    }
  });

  it('getAnswerOptions — только major и minor', () => {
    const ex = makeExercise({
      allowedGroups: ['triads', 'sevenths', 'ninths', 'altered'],
    });
    const opts = ex.getAnswerOptions();
    expect(opts.map((o) => o.id).sort()).toEqual(['major', 'minor']);
  });

  it('getAnswerLabel возвращает русское название', () => {
    const ex = makeExercise();
    expect(ex.getAnswerLabel('major')).toBe('Мажор');
    expect(ex.getAnswerLabel('minor')).toBe('Минор');
  });

  it('все диапазоны вмещают самый широкий аккорд', () => {
    const maxSpan = Math.max(
      ...CHORD_TYPES.map((ct) => Math.max(...ct.intervals))
    );
    Object.entries(CHORD_RANGES).forEach(([name, r]) => {
      expect(
        r.max - r.min,
        `диапазон ${name}: ширина ${r.max - r.min}, нужно ${maxSpan}`
      ).toBeGreaterThanOrEqual(maxSpan);
    });
  });
});