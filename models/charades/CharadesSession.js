import { Vibration } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';
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

    // The screen is locked to landscape but not to a specific rotation, so
    // the same physical "nod down" gesture flips sign on the gyroscope
    // depending on whether the phone is currently held landscape-left or
    // landscape-right. Default to landscape-left until the real reading
    // comes back from ScreenOrientation (see start()).
    this._orientation = ScreenOrientation.Orientation.LANDSCAPE_LEFT;

    this._tiltDetector = new TiltDetector({
      onTiltPositive: () => this._handleTiltSign(1),
      onTiltNegative: () => this._handleTiltSign(-1),
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

    // Re-check every round: the player may have picked the phone back up
    // rotated the other way since the last round.
    ScreenOrientation.getOrientationAsync()
      .then((orientation) => {
        this._orientation = orientation;
      })
      .catch(() => {});

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
    // A fast trill of short pulses, clearly different in feel from the single
    // 40ms "correct" buzz and the 30/60/30 "pass" double-buzz, so it reads as
    // an alarm rather than another tilt confirmation.
    Vibration.vibrate([0, 50, 50, 50, 50, 50, 50, 50, 50, 50]);
  }

  // TiltDetector only reports the raw sign of whichever gyroscope axis
  // dominated the gesture - it has no way to know which way round the
  // phone is currently held. Landscape-right is a 180-degree roll from
  // landscape-left, which flips the sign of the same physical "nod down"
  // gesture, so correct for that here using the orientation captured in
  // start(). (LANDSCAPE_LEFT was picked as the untouched reference case
  // arbitrarily - if correct/pass come out swapped specifically when held
  // one particular way, flip which branch gets the -1 below.)
  _handleTiltSign(rawSign) {
    const flip = this._orientation === ScreenOrientation.Orientation.LANDSCAPE_RIGHT ? -1 : 1;
    const sign = rawSign * flip;
    if (sign < 0) {
      this._handleCorrect();
    } else {
      this._handlePass();
    }
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
