const test = require('node:test');
const assert = require('node:assert/strict');

const questionsDa = require('../../data/questions.json');
const questionsEn = require('../../data/questions.en.json');

test('questions.en.json has the same keys as questions.json', () => {
  assert.deepEqual(Object.keys(questionsEn).sort(), Object.keys(questionsDa).sort());
});

test('questions.en.json arrays have the same length as questions.json, per key', () => {
  for (const key of Object.keys(questionsDa)) {
    assert.equal(
      questionsEn[key].length,
      questionsDa[key].length,
      `Length mismatch for "${key}": da has ${questionsDa[key].length}, en has ${questionsEn[key].length}`
    );
  }
});
