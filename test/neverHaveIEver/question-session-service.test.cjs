const test = require('node:test');
const assert = require('node:assert/strict');

const questionSessionService =
  require('../../services/neverHaveIEver/QuestionSessionService').default;

test.beforeEach(() => {
  questionSessionService.resetSessionQuestions();
});

test('drawNextUniqueQuestion removes a question from the current session and returns card metadata', () => {
  const originalRandom = Math.random;
  Math.random = () => 0;

  try {
    const firstColor = questionSessionService.getQuestionCategoryColors()[0];
    const initialCount = questionSessionService.remainingQuestionsByColor[firstColor].length;
    const firstQuestion = questionSessionService.remainingQuestionsByColor[firstColor][0];

    const result = questionSessionService.drawNextUniqueQuestion();

    assert.deepEqual(result, {
      questionId: `jegHarAldrig:${questionSessionService.normalizeQuestion(firstQuestion)}`,
      title: 'Jeg har aldrig..',
      cornerLabel: 'Jeg har aldrig..',
      body: firstQuestion,
      backgroundColor: firstColor,
    });
    assert.equal(
      questionSessionService.remainingQuestionsByColor[firstColor].length,
      initialCount - 1
    );
    assert.equal(
      questionSessionService.remainingQuestionsByColor[firstColor].includes(firstQuestion),
      false
    );
  } finally {
    Math.random = originalRandom;
  }
});

test('drawNextUniqueQuestion returns null when every category has been exhausted', () => {
  for (const color of questionSessionService.getQuestionCategoryColors()) {
    questionSessionService.remainingQuestionsByColor[color] = [];
  }

  assert.equal(questionSessionService.drawNextUniqueQuestion(), null);
  assert.deepEqual(questionSessionService.getColorsWithRemainingQuestions(), []);
});

test('resetSessionQuestions restores the full question buckets after draws', () => {
  const color = questionSessionService.getQuestionCategoryColors()[0];
  const fullCount = questionSessionService.questionBankByColor[color].length;

  questionSessionService.remainingQuestionsByColor[color].splice(0, 3);
  assert.equal(questionSessionService.remainingQuestionsByColor[color].length, fullCount - 3);

  questionSessionService.resetSessionQuestions();

  assert.equal(questionSessionService.remainingQuestionsByColor[color].length, fullCount);
  assert.notEqual(
    questionSessionService.remainingQuestionsByColor[color],
    questionSessionService.questionBankByColor[color]
  );
});

test('drawNextUniqueQuestion eventually returns every deduplicated question exactly once', () => {
  const expectedQuestionIds = new Set();

  for (const color of questionSessionService.getQuestionCategoryColors()) {
    const questionType = questionSessionService.questionTypeByColor[color];
    for (const question of questionSessionService.questionBankByColor[color]) {
      expectedQuestionIds.add(
        `${questionType}:${questionSessionService.normalizeQuestion(question)}`
      );
    }
  }

  const drawnQuestionIds = new Set();
  const drawnBodies = new Set();
  let drawnCount = 0;
  let drawnQuestion = questionSessionService.drawNextUniqueQuestion();

  while (drawnQuestion) {
    assert.equal(
      drawnQuestionIds.has(drawnQuestion.questionId),
      false,
      `Question was drawn more than once: ${drawnQuestion.questionId}`
    );
    assert.equal(
      expectedQuestionIds.has(drawnQuestion.questionId),
      true,
      `Unexpected question was drawn: ${drawnQuestion.questionId}`
    );

    drawnQuestionIds.add(drawnQuestion.questionId);
    drawnBodies.add(drawnQuestion.body);
    drawnCount += 1;
    drawnQuestion = questionSessionService.drawNextUniqueQuestion();
  }

  assert.equal(drawnCount, expectedQuestionIds.size);
  assert.equal(drawnQuestionIds.size, expectedQuestionIds.size);
  assert.deepEqual([...drawnQuestionIds].sort(), [...expectedQuestionIds].sort());
  assert.equal(questionSessionService.drawNextUniqueQuestion(), null);
  assert.deepEqual(questionSessionService.getColorsWithRemainingQuestions(), []);
});
