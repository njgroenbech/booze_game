const test = require('node:test');
const assert = require('node:assert/strict');

const { TRIVIA_CARDS } = require('../../data/triviaQuestions');

test('every trivia card has both a non-empty Danish and English question and answer', () => {
  for (const card of TRIVIA_CARDS) {
    assert.equal(typeof card.question.da, 'string');
    assert.equal(typeof card.question.en, 'string');
    assert.equal(typeof card.answer.da, 'string');
    assert.equal(typeof card.answer.en, 'string');
    assert.notEqual(card.question.da.trim(), '');
    assert.notEqual(card.question.en.trim(), '');
    assert.notEqual(card.answer.da.trim(), '');
    assert.notEqual(card.answer.en.trim(), '');
  }
});
