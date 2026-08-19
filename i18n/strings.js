// Centralized Danish/English UI-chrome dictionary. Keys are dot-namespaced
// per screen/component. Leaves are { da, en } strings; dynamic values use
// {name} placeholder tokens resolved by LanguageContext's t().
//
// Game content (data/questions.json, data/triviaQuestions.js, the charades
// word lists) is intentionally NOT covered here — it stays Danish-only.
export const STRINGS = {
  home: {
    title: { da: 'Booze Game', en: 'Booze Game' },
    play: { da: 'Spil', en: 'Play' },
    games: {
      neverHaveIEver: { da: 'Jeg Har Aldrig', en: 'Never Have I Ever' },
      meyer: { da: 'Meyer', en: 'Meyer' },
      classicCards: { da: 'Klassisk Kortspil', en: 'Classic Card Game' },
      charades: { da: 'Charades', en: 'Charades' },
      trivia: { da: 'Trivia', en: 'Trivia' },
    },
  },

  addPlayer: {
    header: {
      da: "Spillet er federe,\nhvis du tilføjer\nspillere",
      en: "The game is better\nif you add\nplayers",
    },
    placeholder: { da: 'Skriv navn...', en: 'Type a name...' },
    start: { da: 'Start', en: 'Start' },
  },

  charades: {
    hint: { da: 'Sæt telefonen på panden...', en: 'Put the phone on your forehead...' },
    tiltHint: {
      da: 'Vip ned = rigtigt   ·   Vip op = pas',
      en: 'Tilt down = correct   ·   Tilt up = pass',
    },
    timeUp: { da: 'Tiden er gået! 🎉', en: "Time's up! 🎉" },
    result: {
      correctCount: { da: '{count} rigtige', en: '{count} correct' },
      correctLabel: { da: 'Rigtige', en: 'Correct' },
      skippedLabel: { da: 'Sprunget over', en: 'Skipped' },
      tapToReveal: { da: 'Tryk for at se', en: 'Tap to view' },
    },
    playAgain: { da: 'Spil igen', en: 'Play again' },
    backHome: { da: 'Til forsiden', en: 'Back to home' },
  },

  charadesCategoryPicker: {
    title: { da: 'Vælg kategori', en: 'Choose category' },
    subtitle: {
      da: 'Mixed blander ord fra alle kategorier',
      en: 'Mixed combines words from all categories',
    },
    wordCount: { da: '{count} ord', en: '{count} words' },
  },

  charadesWordList: {
    empty: { da: 'Ingen ord her endnu', en: 'No words here yet' },
  },

  charadesCategories: {
    animals: { da: 'Dyr', en: 'Animals' },
    celebrities: { da: 'Kendte personer', en: 'Celebrities' },
    moviesTv: { da: 'Film & TV', en: 'Movies & TV' },
    mixed: { da: 'Mixed', en: 'Mixed' },
  },

  classicCard: {
    reset: { da: 'Reset', en: 'Reset' },
    hint: { da: 'Tryk for at trække et kort', en: 'Tap to draw a card' },
  },

  shared: {
    diceHidden: {
      title: { da: 'Terningerne er skjult', en: 'The dice are hidden' },
      subtitle: {
        da: 'Tryk på ikonet oppe i højre hjørne for at vise terningerne.',
        en: 'Tap the icon in the top right corner to show the dice.',
      },
    },
  },

  meyer: {
    coverTitle: { da: 'Skjult', en: 'Hidden' },
    coverBody: {
      da: 'Tryk hvor som helst for at slå, eller vælg at se forrige spillers terninger.',
      en: "Tap anywhere to roll, or choose to see the previous player's dice.",
    },
    shakeHint: { da: 'Ryst telefonen for at kaste terningerne', en: 'Shake the phone to roll the dice' },
  },

  trivia: {
    questionLabel: { da: 'Spørgsmål', en: 'Question' },
    answerLabel: { da: 'Svar', en: 'Answer' },
    hintReveal: { da: 'Tryk for at se svaret', en: 'Tap to see the answer' },
    hintNext: { da: 'Tryk for næste spørgsmål', en: 'Tap for next question' },
  },

  yatzy: {
    sheet: {
      rows: {
        navn: { da: 'Navn', en: 'Name' },
        ones: { da: "1'ere", en: 'Ones' },
        twos: { da: "2'ere", en: 'Twos' },
        threes: { da: "3'ere", en: 'Threes' },
        fours: { da: "4'ere", en: 'Fours' },
        fives: { da: "5'ere", en: 'Fives' },
        sixes: { da: "6'ere", en: 'Sixes' },
        total: { da: 'Total', en: 'Total' },
        bonus: { da: 'Bonus 50 point (min. 63)', en: 'Bonus (min. 63)' },
        onePair: { da: '1 par', en: 'Pair' },
        twoPairs: { da: '2 par', en: '2 pairs' },
        threeOfKind: { da: '3 ens', en: '3 of a kind' },
        fourOfKind: { da: '4 ens', en: '4 of a kind' },
        smallStraight: { da: 'Lille straight 1-2-3-4-5', en: 'Sm. straight (1-5)' },
        largeStraight: { da: 'Stor straight 2-3-4-5-6', en: 'Lg. straight (2-6)' },
        fullHouse: { da: 'Hus 3+2 ens', en: 'Full house' },
        chance: { da: 'Chance', en: 'Chance' },
        yatzy: { da: 'Yatzy', en: 'Yatzy' },
        ialt: { da: 'I alt', en: 'Grand total' },
      },
    },
    cancel: { da: 'Annullér', en: 'Cancel' },
    save: { da: 'Gem', en: 'Save' },
  },

  neverHaveIEver: {
    footerHint: { da: 'Tryk for at trække et nyt kort', en: 'Tap to draw a new card' },
    resetButton: { da: 'Nulstil spørgsmål', en: 'Reset questions' },
    exhaustedTitle: { da: 'Tak for i aften. Vand anbefales', en: 'Thanks for tonight. Water is recommended' },
    exhaustedBody: {
      da: 'Der er ikke flere spørgsmål tilbage. Nustil spørgsmål eller gå tilbage til hovedmenu.',
      en: 'There are no more questions left. Reset questions or go back to the main menu.',
    },
    cardLabels: {
      jegHarAldrig: { da: 'Jeg har aldrig..', en: 'Never have I ever..' },
      kategori: { da: 'Kategori', en: 'Category' },
      mestTilbøjeligTil: { da: 'Mest tilbøjelig til..', en: 'Most likely to..' },
      joker: { da: 'Joker', en: 'Joker' },
    },
  },

  loading: {
    title: { da: 'Booze Game', en: 'Booze Game' },
    subtitle: { da: 'Tryk for at lukke', en: 'Tap to dismiss' },
  },
};
