import { Vibration } from 'react-native';
import CharadesRound from './CharadesRound';
import TiltDetector from './TiltDetector';

export const SESSION_PHASE = {
  COUNTDOWN: 'countdown',
  PLAYING: 'playing',
  FINISHED: 'finished',
};

export const FEEDBACK = {
  CORRECT: 'correct',
  PASS: 'pass',
};

// Orchestrates a single Charades session: the countdown, the round timer,
// the word deck (via CharadesRound) and the tilt detector. The view layer
// just subscribes and calls start()/restart()/stop().
export default class CharadesSession {
  constructor(category, { durationSeconds = 60, countdownSeconds = 3, feedbackDurationMs = 1000 } = {}) {
    this.category = category;
    this.durationSeconds = durationSeconds;
    this.countdownSeconds = countdownSeconds;
    this.feedbackDurationMs = feedbackDurationMs;

    this.round = new CharadesRound(category, { durationSeconds });
    this.phase = SESSION_PHASE.COUNTDOWN;
    this.countdownRemaining = countdownSeconds;
    this.feedback = null;

    this._tiltDetector = new TiltDetector({
      onTiltForward: () => this._handleCorrect(),
      onTiltBackward: () => this._handlePass(),
    });
    this._countdownTimerId = null;
    this._roundTimerId = null;
    this._feedbackTimerId = null;
    this._listeners = new Set();
  }

  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  start() {
    this.phase = SESSION_PHASE.COUNTDOWN;
    this.countdownRemaining = this.countdownSeconds;
    this.feedback = null;
    this._notify();

    this._countdownTimerId = setInterval(() => {
      this.countdownRemaining -= 1;
      if (this.countdownRemaining <= 0) {
        clearInterval(this._countdownTimerId);
        this._countdownTimerId = null;
        this._beginRound();
      } else {
        this._notify();
      }
    }, 1000);
  }

  restart() {
    this.stop();
    this.round = new CharadesRound(this.category, { durationSeconds: this.durationSeconds });
    this.start();
  }

  stop() {
    if (this._countdownTimerId) {
      clearInterval(this._countdownTimerId);
      this._countdownTimerId = null;
    }
    if (this._roundTimerId) {
      clearInterval(this._roundTimerId);
      this._roundTimerId = null;
    }
    if (this._feedbackTimerId) {
      clearTimeout(this._feedbackTimerId);
      this._feedbackTimerId = null;
    }
    this._tiltDetector.stop();
  }

  get state() {
    return {
      phase: this.phase,
      countdownRemaining: this.countdownRemaining,
      timeLeft: this.round.timeLeft,
      currentWord: this.round.currentWord,
      feedback: this.feedback,
      score: this.round.score,
      correctWords: [...this.round.correctWords],
      passedWords: [...this.round.passedWords],
      categoryName: this.category.name,
    };
  }

  _beginRound() {
    this.phase = SESSION_PHASE.PLAYING;
    this.round.start();
    this._tiltDetector.start();

    this._roundTimerId = setInterval(() => {
      this.round.tick(1);
      if (this.round.isFinished()) {
        this._finish();
      }
      this._notify();
    }, 1000);

    this._notify();
  }

  _finish() {
    this.phase = SESSION_PHASE.FINISHED;
    this.feedback = null;
    clearInterval(this._roundTimerId);
    this._roundTimerId = null;
    if (this._feedbackTimerId) {
      clearTimeout(this._feedbackTimerId);
      this._feedbackTimerId = null;
    }
    this._tiltDetector.stop();
  }

  // Guessing doesn't advance the deck immediately: the current word stays on
  // screen under a green/red flash for feedbackDurationMs, and only then do
  // we draw the next word. The feedback lock (this.feedback truthy) also
  // doubles as a debounce so a single tilt gesture can't register twice.
  _handleCorrect() {
    if (this.phase !== SESSION_PHASE.PLAYING || this.feedback) return;
    Vibration.vibrate(40);
    this.round.recordCorrect();
    this.feedback = FEEDBACK.CORRECT;
    this._notify();
    this._scheduleAdvance();
  }

  _handlePass() {
    if (this.phase !== SESSION_PHASE.PLAYING || this.feedback) return;
    Vibration.vibrate([0, 30, 60, 30]);
    this.round.recordPass();
    this.feedback = FEEDBACK.PASS;
    this._notify();
    this._scheduleAdvance();
  }

  _scheduleAdvance() {
    this._feedbackTimerId = setTimeout(() => {
      this._feedbackTimerId = null;
      this.feedback = null;
      this.round.advance();
      this._notify();
    }, this.feedbackDurationMs);
  }

  _notify() {
    const { state } = this;
    this._listeners.forEach((listener) => listener(state));
  }
}
