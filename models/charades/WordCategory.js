export default class WordCategory {
  constructor(id, name, words, color = '#EAEAEA') {
    this.id = id;
    this.name = name;
    this.color = color;
    this._words = words;
  }

  getWords() {
    return [...this._words];
  }

  get wordCount() {
    return this._words.length;
  }
}
