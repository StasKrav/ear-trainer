export class Exercise {
  constructor(opts) {
    this.opts = opts;
  }
  pool() {
    throw new Error('not implemented');
  }
  generate() {
    throw new Error('not implemented');
  }
  play() {
    throw new Error('not implemented');
  }
}