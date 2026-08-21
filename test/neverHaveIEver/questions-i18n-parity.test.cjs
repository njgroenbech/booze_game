const test = require('node:test');
const assert = require('node:assert/strict');

const questions = require('../../data/questions.json');

test('every question entry has both a non-empty Danish and English string', () => {
  for (const [key, entries] of Object.entries(questions)) {
    entries.forEach((entry, index) => {
      assert.equal(typeof entry.da, 'string', `${key}[${index}].da should be a string`);
      assert.equal(typeof entry.en, 'string', `${key}[${index}].en should be a string`);
      assert.notEqual(entry.da.trim(), '', `${key}[${index}].da should not be empty`);
      assert.notEqual(entry.en.trim(), '', `${key}[${index}].en should not be empty`);
    });
  }
});
