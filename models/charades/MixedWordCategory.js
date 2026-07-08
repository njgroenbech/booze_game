import WordCategory from './WordCategory';

export default class MixedWordCategory extends WordCategory {
  constructor(categories, color = '#F6D9B8') {
    const words = [...new Set(categories.flatMap((category) => category.getWords()))];
    super('mixed', 'Mixed', words, color);
  }
}
