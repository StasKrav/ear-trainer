import { describe, it, expect } from 'vitest';
import { Exercise } from './base.js';

describe('Exercise (base)', () => {
  const base = new Exercise({});

  it('pool бросает', () => expect(() => base.pool()).toThrow());
  it('generate бросает', () => expect(() => base.generate()).toThrow());
  it('play бросает', () => expect(() => base.play()).toThrow());
  it('getAnswerOptions бросает', () =>
    expect(() => base.getAnswerOptions()).toThrow());
  it('getAnswerLabel бросает', () =>
    expect(() => base.getAnswerLabel('x')).toThrow());
});