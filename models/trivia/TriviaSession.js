import ShuffledDeck from '../shared/ShuffledDeck';

export const TRIVIA_PHASE = {
  QUESTION: 'question',
  ANSWER: 'answer',
};

// Keeps the resting position/rotation of each new card extremely subtle -
// just enough to feel hand-placed, unlike the more scattered NeverHaveIEver
// and ClassicCardGame stacks.
const TILT_RANGE_DEG = 2;
const OFFSET_RANGE_PX = 4;

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

// Orchestrates a single Trivia session: draws a card, flips it to reveal the
// answer on tap, then draws the next one on the following tap. No score or
// timer - the view layer just subscribes and calls handleTap().
export default class TriviaSession {
  constructor(cards) {
    this.deck = new ShuffledDeck(cards);
    this._listeners = new Set();
    this._nextCardId = 1;
    this.phase = TRIVIA_PHASE.QUESTION;
    this.card = this.deck.draw();
    this.cardId = this._nextCardId++;
    this.presentation = this._randomPresentation();
  }

  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  handleTap() {
    if (this.phase === TRIVIA_PHASE.QUESTION) {
      this.phase = TRIVIA_PHASE.ANSWER;
    } else {
      this.card = this.deck.draw();
      this.cardId = this._nextCardId++;
      this.presentation = this._randomPresentation();
      this.phase = TRIVIA_PHASE.QUESTION;
    }
    this._notify();
  }

  get state() {
    return {
      phase: this.phase,
      card: this.card,
      cardId: this.cardId,
      presentation: this.presentation,
    };
  }

  _randomPresentation() {
    return {
      tilt: randomRange(-TILT_RANGE_DEG, TILT_RANGE_DEG),
      offsetX: randomRange(-OFFSET_RANGE_PX, OFFSET_RANGE_PX),
      offsetY: randomRange(-OFFSET_RANGE_PX, OFFSET_RANGE_PX),
    };
  }

  _notify() {
    const { state } = this;
    this._listeners.forEach((listener) => listener(state));
  }
}
