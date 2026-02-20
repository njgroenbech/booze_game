const EXHAUSTED_BODY_TEXT = 'Der er ikke flere spørgsmål tilbage. Nustil spørgsmål eller gå tilbage til hovedmenu.';

class TicketCardFactoryService {
  // Fabrikken får en session-service ind, som leverer næste unikke spørgsmål.
  constructor(questionSessionService) {
    this.questionSessionService = questionSessionService;
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
  createExhaustedCard(cardId) {
    const questionCategoryColors = this.questionSessionService.getQuestionCategoryColors();
    const randomPresentation = this.createCardPresentationRandomness();

    return {
      id: cardId,
      questionId: `exhausted:${cardId}`,
      title: 'Tak for i aften. Vand anbefales',
      body: EXHAUSTED_BODY_TEXT,
      cornerLabel: '\u2620\uFE0F',
      tilt: randomPresentation.tilt,
      backgroundColor: this.randomFrom(questionCategoryColors),
      offsetX: randomPresentation.offsetX,
      offsetY: randomPresentation.offsetY,
      isExhausted: true,
    };
  }

  // Opretter et normalt kort fra et spørgsmål.
  createQuestionCard(cardId, questionEntry, defaultBody) {
    const randomPresentation = this.createCardPresentationRandomness();
    // Falder tilbage til defaultBody hvis spørgsmål mangler body.
    let cardBody = questionEntry.body;
    if (!cardBody) {
      cardBody = defaultBody;
    }

    return {
      id: cardId,
      questionId: questionEntry.questionId,
      title: questionEntry.title,
      body: cardBody,
      cornerLabel: questionEntry.cornerLabel,
      tilt: randomPresentation.tilt,
      backgroundColor: questionEntry.backgroundColor,
      offsetX: randomPresentation.offsetX,
      offsetY: randomPresentation.offsetY,
      isExhausted: false,
    };
  }

  // Returnerer enten et normalt kort eller et exhausted-kort.
  createNextCard(cardId, defaultBody) {
    const questionEntry = this.questionSessionService.drawNextUniqueQuestion();

    if (!questionEntry) {
      return this.createExhaustedCard(cardId);
    }

    return this.createQuestionCard(cardId, questionEntry, defaultBody);
  }
}

export default TicketCardFactoryService;
