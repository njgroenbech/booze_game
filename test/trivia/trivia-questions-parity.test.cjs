const test = require('node:test');
const assert = require('node:assert/strict');

// RAW_QUESTIONS itself isn't exported from triviaQuestions.js (only the built
// TRIVIA_CARDS are), so we compare card counts instead of the raw arrays directly.
const { TRIVIA_CARDS } = require('../../data/triviaQuestions');
const { RAW_QUESTIONS_EN } = require('../../data/triviaQuestions.en');

test('triviaQuestions.en.js has the same number of entries as triviaQuestions.js', () => {
  assert.equal(RAW_QUESTIONS_EN.length, TRIVIA_CARDS.length);
});

test('every trivia card has both a Danish and an English question and answer', () => {
  for (const card of TRIVIA_CARDS) {
    assert.equal(typeof card.question.da, 'string');
    assert.equal(typeof card.question.en, 'string');
    assert.equal(typeof card.answer.da, 'string');
    assert.equal(typeof card.answer.en, 'string');
  }
});
