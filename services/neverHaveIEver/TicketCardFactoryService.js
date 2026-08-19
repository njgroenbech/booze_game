import PlayerPlaceholderService from './PlayerPlaceholderService';

const DEFAULT_EXHAUSTED_TITLE = 'Tak for i aften. Vand anbefales';
const EXHAUSTED_BODY_TEXT = 'Der er ikke flere spørgsmål tilbage. Nustil spørgsmål eller gå tilbage til hovedmenu.';

class TicketCardFactoryService {
  // Fabrikken får en session-service ind, som leverer næste unikke spørgsmål.
  constructor(questionSessionService, playerPlaceholderService = null) {
    this.questionSessionService = questionSessionService;
    this.playerPlaceholderService = playerPlaceholderService;

    if (!this.playerPlaceholderService) {
      this.playerPlaceholderService = new PlayerPlaceholderService();
    }
  }

  // Vælger et tilfældigt element fra en liste.
  randomFrom(items) {
    if (!Array.isArray(items)) {
      return null;
    }
    if (items.length === 0) {
      return null;
    }
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
  }

  // Tilfældig værdi mellem min (inkl.) og max (ekskl.).
  randomRange(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Samler den visuelle randomisering ét sted (rotation + position).
  createCardPresentationRandomness() {
    const randomTilt = this.randomRange(-7, 7);
    const randomOffsetX = this.randomRange(-12, 12);
    const randomOffsetY = this.randomRange(-10, 10);

    return {
      tilt: randomTilt,
      offsetX: randomOffsetX,
      offsetY: randomOffsetY,
    };
  }

  // Opretter et "exhausted"-kort når alle spørgsmål er brugt.
  // exhaustedText er valgfri, så kaldere kan levere oversat tekst; default holder dagens danske tekst.
  createExhaustedCard(cardId, exhaustedText = { title: DEFAULT_EXHAUSTED_TITLE, body: EXHAUSTED_BODY_TEXT }) {
    const questionCategoryColors = this.questionSessionService.getQuestionCategoryColors();
    const randomPresentation = this.createCardPresentationRandomness();

    return {
      id: cardId,
      questionId: `exhausted:${cardId}`,
      title: exhaustedText.title,
      body: exhaustedText.body,
      cornerLabel: '\u2620\uFE0F',
      tilt: randomPresentation.tilt,
      backgroundColor: this.randomFrom(questionCategoryColors),
      offsetX: randomPresentation.offsetX,
      offsetY: randomPresentation.offsetY,
      isExhausted: true,
      highlightedPlayerNames: [],
    };
  }

  // Opretter et normalt kort fra et spørgsmål.
  createQuestionCard(cardId, questionEntry, defaultBody, players, language = 'da') {
    const randomPresentation = this.createCardPresentationRandomness();
    // Falder tilbage til defaultBody hvis spørgsmål mangler body.
    let cardBody = questionEntry.body;
    if (!cardBody) {
      cardBody = defaultBody;
    }
    const placeholderResolution = this.playerPlaceholderService.resolvePlayerPlaceholders(
      cardBody,
      players,
      language
    );
    const resolvedCardBody = placeholderResolution.resolvedText;
    const highlightedPlayerNames = placeholderResolution.highlightedPlayerNames;

    return {
      id: cardId,
      questionId: questionEntry.questionId,
      title: questionEntry.title,
      body: resolvedCardBody,
      cornerLabel: questionEntry.cornerLabel,
      tilt: randomPresentation.tilt,
      backgroundColor: questionEntry.backgroundColor,
      offsetX: randomPresentation.offsetX,
      offsetY: randomPresentation.offsetY,
      isExhausted: false,
      highlightedPlayerNames,
    };
  }

  // Returnerer enten et normalt kort eller et exhausted-kort.
  createNextCard(cardId, defaultBody, players, exhaustedText, language = 'da') {
    const questionEntry = this.questionSessionService.drawNextUniqueQuestion(language);

    if (!questionEntry) {
      return exhaustedText ? this.createExhaustedCard(cardId, exhaustedText) : this.createExhaustedCard(cardId);
    }

    return this.createQuestionCard(cardId, questionEntry, defaultBody, players, language);
  }

  // Opretter et "exhausted"-kort med title/body for BEGGE sprog, så UI-laget
  // kan skifte sprog live uden at trække et nyt kort.
  createExhaustedCardBilingual(cardId, exhaustedTextBilingual = {
    title: { da: DEFAULT_EXHAUSTED_TITLE, en: DEFAULT_EXHAUSTED_TITLE },
    body: { da: EXHAUSTED_BODY_TEXT, en: EXHAUSTED_BODY_TEXT },
  }) {
    const questionCategoryColors = this.questionSessionService.getQuestionCategoryColors();
    const randomPresentation = this.createCardPresentationRandomness();

    return {
      id: cardId,
      questionId: `exhausted:${cardId}`,
      title: exhaustedTextBilingual.title,
      body: exhaustedTextBilingual.body,
      // cornerLabel er sprogneutral, men holdes som {da,en} for samme shape
      // som spørgsmålskort, så UI-laget altid kan slå op via card.cornerLabel[language].
      cornerLabel: { da: '☠️', en: '☠️' },
      tilt: randomPresentation.tilt,
      backgroundColor: this.randomFrom(questionCategoryColors),
      offsetX: randomPresentation.offsetX,
      offsetY: randomPresentation.offsetY,
      isExhausted: true,
      highlightedPlayerNames: [],
    };
  }

  // Opretter et normalt kort med title/body/cornerLabel for BEGGE sprog.
  createQuestionCardBilingual(cardId, questionEntry, defaultBody, players) {
    const randomPresentation = this.createCardPresentationRandomness();
    const cardBodyDa = questionEntry.body.da || defaultBody;
    const cardBodyEn = questionEntry.body.en || defaultBody;

    const placeholderResolution = this.playerPlaceholderService.resolvePlayerPlaceholdersBilingual(
      cardBodyDa,
      cardBodyEn,
      players
    );

    return {
      id: cardId,
      questionId: questionEntry.questionId,
      title: questionEntry.title,
      body: { da: placeholderResolution.da, en: placeholderResolution.en },
      cornerLabel: questionEntry.cornerLabel,
      tilt: randomPresentation.tilt,
      backgroundColor: questionEntry.backgroundColor,
      offsetX: randomPresentation.offsetX,
      offsetY: randomPresentation.offsetY,
      isExhausted: false,
      highlightedPlayerNames: placeholderResolution.highlightedPlayerNames,
    };
  }

  // Returnerer enten et normalt kort eller et exhausted-kort, med title/body/
  // cornerLabel for begge sprog, så kortet kan skifte sprog live i UI-laget.
  createNextCardBilingual(cardId, defaultBody, players, exhaustedTextBilingual) {
    const questionEntry = this.questionSessionService.drawNextUniqueQuestionBilingual();

    if (!questionEntry) {
      return exhaustedTextBilingual
        ? this.createExhaustedCardBilingual(cardId, exhaustedTextBilingual)
        : this.createExhaustedCardBilingual(cardId);
    }

    return this.createQuestionCardBilingual(cardId, questionEntry, defaultBody, players);
  }
}

export default TicketCardFactoryService;
