const test = require('node:test');
const assert = require('node:assert/strict');

const TicketCardFactoryService =
  require('../../services/neverHaveIEver/TicketCardFactoryService').default;

test('createNextCard builds a question card and delegates placeholder resolution', () => {
  const questionSessionService = {
    drawNextUniqueQuestion() {
      return {
        questionId: 'joker:{player} skåler',
        title: 'Joker',
        cornerLabel: 'Joker',
        body: '{player} skåler',
        backgroundColor: '#123456',
      };
    },
  };

  const playerPlaceholderService = {
    resolvePlayerPlaceholders(text, players) {
      assert.equal(text, '{player} skåler');
      assert.deepEqual(players, ['Anna']);

      return {
        resolvedText: 'Anna skåler',
        highlightedPlayerNames: ['Anna'],
      };
    },
  };

  const factory = new TicketCardFactoryService(
    questionSessionService,
    playerPlaceholderService
  );

  factory.createCardPresentationRandomness = () => ({
    tilt: 1,
    offsetX: 2,
    offsetY: 3,
  });

  const result = factory.createNextCard('card-1', 'Fallback body', ['Anna']);

  assert.deepEqual(result, {
    id: 'card-1',
    questionId: 'joker:{player} skåler',
    title: 'Joker',
    body: 'Anna skåler',
    cornerLabel: 'Joker',
    tilt: 1,
    backgroundColor: '#123456',
    offsetX: 2,
    offsetY: 3,
    isExhausted: false,
    highlightedPlayerNames: ['Anna'],
  });
});

test('createNextCard falls back to the provided body when a question has no body', () => {
  const questionSessionService = {
    drawNextUniqueQuestion() {
      return {
        questionId: 'joker:missing',
        title: 'Joker',
        cornerLabel: 'Joker',
        body: '',
        backgroundColor: '#abcdef',
      };
    },
  };

  const playerPlaceholderService = {
    resolvePlayerPlaceholders(text) {
      return {
        resolvedText: text,
        highlightedPlayerNames: [],
      };
    },
  };

  const factory = new TicketCardFactoryService(
    questionSessionService,
    playerPlaceholderService
  );

  factory.createCardPresentationRandomness = () => ({
    tilt: 0,
    offsetX: 0,
    offsetY: 0,
  });

  const result = factory.createNextCard('card-2', 'Fallback body', []);

  assert.equal(result.body, 'Fallback body');
  assert.equal(result.isExhausted, false);
});

test('createNextCard returns an exhausted card when the session has no more questions', () => {
  const questionSessionService = {
    drawNextUniqueQuestion() {
      return null;
    },
    getQuestionCategoryColors() {
      return ['#111111', '#222222'];
    },
  };

  const factory = new TicketCardFactoryService(questionSessionService);

  factory.createCardPresentationRandomness = () => ({
    tilt: 4,
    offsetX: 5,
    offsetY: 6,
  });
  factory.randomFrom = (items) => items[1];

  const result = factory.createNextCard('card-3', 'Fallback body', ['Anna']);

  assert.deepEqual(result, {
    id: 'card-3',
    questionId: 'exhausted:card-3',
    title: 'Tak for i aften. Vand anbefales',
    body: 'Der er ikke flere spørgsmål tilbage. Nustil spørgsmål eller gå tilbage til hovedmenu.',
    cornerLabel: '☠️',
    tilt: 4,
    backgroundColor: '#222222',
    offsetX: 5,
    offsetY: 6,
    isExhausted: true,
    highlightedPlayerNames: [],
  });
});
