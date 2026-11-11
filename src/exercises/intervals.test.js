import { describe, it, expect } from 'vitest';
import { IntervalExercise, INTERVALS } from './intervals.js';

const RANGE = { min: 55, max: 76 };

function makeExercise(overrides = {}) {
  return new IntervalExercise({
    allowed: ['M3', 'm3', 'P5'],
    mode: 'melodic',
    direction: 'up',
    range: RANGE,
    ...overrides,
  });
}

describe('IntervalExercise', () => {
  it('generate возвращает answer из allowed', () => {
    const ex = makeExercise();
    for (let i = 0; i < 50; i++) {
      const q = ex.generate();
      expect(['M3', 'm3', 'P5']).toContain(q.answer);
    }
  });

  it('generate не выходит за диапазон при direction=up', () => {
    const ex = makeExercise({ direction: 'up' });
    for (let i = 0; i < 100; i++) {
      const q = ex.generate();
      const [low, high] = q.notes;
      expect(low).toBeGreaterThanOrEqual(RANGE.min);
      expect(high).toBeLessThanOrEqual(RANGE.max);
      expect(high).toBeGreaterThan(low);
    }
  });

  it('generate не выходит за диапазон при direction=down', () => {
    const ex = makeExercise({ direction: 'down' });
    for (let i = 0; i < 100; i++) {
      const q = ex.generate();
      const [high, low] = q.notes;
      expect(low).toBeGreaterThanOrEqual(RANGE.min);
      expect(high).toBeLessThanOrEqual(RANGE.max);
      expect(high).toBeGreaterThan(low);
    }
  });

  it('direction=mix даёт оба направления', () => {
    const ex = makeExercise({ direction: 'mix' });
    const dirs = new Set();
    for (let i = 0; i < 200; i++) {
      dirs.add(ex.generate().direction);
    }
    expect(dirs.has('up')).toBe(true);
    expect(dirs.has('down')).toBe(true);
  });

  it('мешок не повторяет интервал, пока не опустеет', () => {
    const ex = makeExercise({ allowed: ['M3', 'm3', 'P5'] });
    const firstThree = [
      ex.generate().answer,
      ex.generate().answer,
      ex.generate().answer,
    ];
    // за три вопроса все три интервала должны встретиться ровно по разу
    expect(new Set(firstThree).size).toBe(3);
  });

  it('getAnswerOptions возвращает только allowed и сортирует по полутонам', () => {
    const ex = makeExercise({ allowed: ['P5', 'm3', 'M3'] });
    const opts = ex.getAnswerOptions();
    expect(opts.map((o) => o.id)).toEqual(['m3', 'M3', 'P5']);
    opts.forEach((o) => {
      expect(o.label).toBeTruthy();
    });
  });

  it('getAnswerLabel возвращает имя интервала', () => {
    const ex = makeExercise();
    const label = ex.getAnswerLabel('M3');
    expect(label).toBe('б.3');
  });

  it('getAnswerLabel для неизвестного id возвращает id', () => {
    const ex = makeExercise();
    expect(ex.getAnswerLabel('nope')).toBe('nope');
  });
});