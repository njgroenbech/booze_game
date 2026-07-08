import ShuffledDeck from '../shared/ShuffledDeck';

export const ROUND_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  FINISHED: 'finished',
};

export default class CharadesRound {
  constructor(category, { durationSeconds = 60 } = {}) {
    this.category = category;
    this.durationSeconds = durationSeconds;
    this.deck = new ShuffledDeck(category.getWords());
    this.status = ROUND_STATUS.IDLE;
    this.timeLeft = durationSeconds;
    this.currentWord = null;
    this.correctWords = [];
    this.passedWords = [];
  }

  start() {
    this.status = ROUND_STATUS.RUNNING;
    this.timeLeft = this.durationSeconds;
    this.correctWords = [];
    this.passedWords = [];
    this.currentWord = this.deck.draw();
  }

  recordCorrect() {
    if (this.status !== ROUND_STATUS.RUNNING) return;
    this.correctWords.push(this.currentWord);
  }

  recordPass() {
    if (this.status !== ROUND_STATUS.RUNNING) return;
    this.passedWords.push(this.currentWord);
  }

  advance() {
    if (this.status !== ROUND_STATUS.RUNNING) return;
    this.currentWord = this.deck.draw();
  }

  tick(deltaSeconds = 1) {
    if (this.status !== ROUND_STATUS.RUNNING) return;
    this.timeLeft = Math.max(0, this.timeLeft - deltaSeconds);
    if (this.timeLeft === 0) {
      this.finish();
    }
  }

  finish() {
    this.status = ROUND_STATUS.FINISHED;
  }

  isRunning() {
    return this.status === ROUND_STATUS.RUNNING;
  }

  isFinished() {
    return this.status === ROUND_STATUS.FINISHED;
  }

  get score() {
    return this.correctWords.length;
  }
}
