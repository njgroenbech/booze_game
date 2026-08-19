const test = require('node:test');
const assert = require('node:assert/strict');

const PlayerPlaceholderService =
  require('../../services/neverHaveIEver/PlayerPlaceholderService').default;

test('resolvePlayerPlaceholders replaces placeholders with unique player names in token order', () => {
  const service = new PlayerPlaceholderService();
  const originalRandom = Math.random;
  Math.random = () => 0;

  try {
    const result = service.resolvePlayerPlaceholders(
      '{player2} skåler med {player}, og {player} peger på {player3}.',
      [' Anna ', 'Bo', 'Anna', '', 'Clara']
    );

    assert.equal(result.resolvedText, 'Bo skåler med Anna, og Anna peger på Clara.');
    assert.deepEqual(result.highlightedPlayerNames, ['Anna', 'Bo', 'Clara']);
  } finally {
    Math.random = originalRandom;
  }
});

test('resolvePlayerPlaceholders falls back to descriptions when there are too few players', () => {
  const service = new PlayerPlaceholderService();
  const originalRandom = Math.random;
  Math.random = () => 0;

  try {
    const result = service.resolvePlayerPlaceholders(
      '{player} vælger {player2} og {player3}.',
      ['Maja']
    );

    assert.equal(
      result.resolvedText,
      'Maja vælger den højeste spiller og spilleren med de største sko.'
    );
    assert.deepEqual(result.highlightedPlayerNames, ['Maja']);
  } finally {
    Math.random = originalRandom;
  }
});

test('replacePlayerPlaceholdersInText returns the original text when there are no placeholders', () => {
  const service = new PlayerPlaceholderService();

  assert.equal(
    service.replacePlayerPlaceholdersInText('Alle tager en slurk.', ['Anna', 'Bo']),
    'Alle tager en slurk.'
  );
});

test('resolvePlayerPlaceholdersBilingual substitutes the same player name into both language templates', () => {
  const service = new PlayerPlaceholderService();
  const originalRandom = Math.random;
  Math.random = () => 0;

  try {
    const result = service.resolvePlayerPlaceholdersBilingual(
      '{player} skåler med {player2}.',
      '{player} cheers with {player2}.',
      ['Anna', 'Bo']
    );

    assert.equal(result.da, 'Anna skåler med Bo.');
    assert.equal(result.en, 'Anna cheers with Bo.');
    assert.deepEqual(result.highlightedPlayerNames, ['Anna', 'Bo']);
  } finally {
    Math.random = originalRandom;
  }
});

test('resolvePlayerPlaceholdersBilingual picks the same fallback slot in both languages when there are too few players', () => {
  const service = new PlayerPlaceholderService();
  const originalRandom = Math.random;
  Math.random = () => 0;

  try {
    const result = service.resolvePlayerPlaceholdersBilingual(
      '{player} vælger {player2}.',
      '{player} picks {player2}.',
      []
    );

    // Math.random = 0 deterministically picks fallback index 0 for {player},
    // then index 0 of the remaining pool (== original index 1) for {player2}.
    assert.equal(result.da, 'den højeste spiller vælger spilleren med de største sko.');
    assert.equal(result.en, 'the tallest player picks the player with the biggest shoes.');
    assert.deepEqual(result.highlightedPlayerNames, []);
  } finally {
    Math.random = originalRandom;
  }
});
