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
  // Список вариантов ответа: [{ id, label }]
  getAnswerOptions() {
    throw new Error('not implemented');
  }
  // Человекочитаемое имя ответа по id — для тоста
  getAnswerLabel(id) {
    throw new Error('not implemented');
  }
}