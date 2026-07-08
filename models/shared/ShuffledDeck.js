export default class ShuffledDeck {
  constructor(items) {
    this._original = [...items];
    this._queue = [];
    this._lastItem = null;
    this._refill();
  }

  draw() {
    if (this._queue.length === 0) {
      this._refill();
    }

    let item = this._queue.pop();
    if (item === this._lastItem && this._queue.length > 0) {
      this._queue.unshift(item);
      item = this._queue.pop();
    }

    this._lastItem = item;
    return item;
  }

  _refill() {
    this._queue = ShuffledDeck.shuffle(this._original);
  }

  static shuffle(list) {
    const copy = [...list];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}
