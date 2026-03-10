import questions from '../../data/questions.json';

// De fire farver repræsenterer hver sin spørgsmålskategori i UI'et.
// Farven sendes videre til kort-komponenten, så service-laget og UI-laget bruger samme mapping.
const COLOR_PALETTE = ['#f85d63', '#34b0fcff', '#00d031ff', '#f67efcff'];
// Farve -> key i questions.json.
// Det gør det muligt at holde UI-farver og data-kategorier koblet uden at hardcode begge steder.
const QUESTION_KEY_BY_COLOR = {
  '#f85d63': 'jegHarAldrig',
  '#34b0fcff': 'kategori',
  '#00d031ff': 'mestTilbøjeligTil',
  '#f67efcff': 'joker',
};
// Nøgle -> label der vises på kortet.
const LABEL_BY_QUESTION_KEY = {
  jegHarAldrig: 'Jeg har aldrig..',
  kategori: 'Kategori',
  mestTilbøjeligTil: 'Mest tilbøjelig til..',
  joker: 'Joker',
};
// Sandsynlighedsfordelingen for hvilke kategorier der forsøges først.
// Værdierne læses som almindelige procenttal og holdes samlet ét sted,
// så det er nemt at justere balancen uden at røre resten af logikken.
const QUESTION_DRAW_PERCENTAGES = [
  { questionType: 'jegHarAldrig', percentage: 60 },
  { questionType: 'kategori', percentage: 13.33 },
  { questionType: 'mestTilbøjeligTil', percentage: 13.33 },
  { questionType: 'joker', percentage: 13.33 },
];

class QuestionSessionService {
  constructor() {
    // Konfigurationsdata gemmes på instansen,
    // så resten af servicen arbejder mod ét konsistent sæt mappings.
    this.questionCategoryColors = COLOR_PALETTE;
    this.questionTypeByColor = QUESTION_KEY_BY_COLOR;
    this.displayLabelByQuestionType = LABEL_BY_QUESTION_KEY;

    // questionBankByColor er "master copy": deduplikeret og stabil pr. app-livscyklus.
    // remainingQuestionsByColor er "session copy": herfra trækker vi spørgsmål og muterer løbende.
    // På den måde kan vi resette en session uden at genindlæse eller rededuplikere data.
    this.questionBankByColor = this.buildQuestionBankByColor();
    this.remainingQuestionsByColor = this.createSessionBucketsFromQuestionBank();
  }

  // Returnerer et tilfældigt element fra en liste.
  // Bruges både til valg af farvekategori
  // Denne må IKKE slettes fordi, selvom vi bruger procentfordeling til træk af spørgsmål -
  // Vi bruger stadig randomFrom funktionen til fallback-logikken. 
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

  // Normaliserer spørgsmålstekst for at kunne sammenligne dubletter:
  // "  Hej " og "hej" skal tælle som samme spørgsmål.
  normalizeQuestion(question) {
    if (typeof question !== 'string') {
      return '';
    }
    return question.trim().toLowerCase();
  }

  getQuestionCategoryColors() {
    return this.questionCategoryColors;
  }

  // Bygger den deduplikerede spørgsmålsbank pr. farve/kategori.
  //
  // Flow:
  // 1) Find category key ud fra farve.
  // 2) Læs spørgsmål fra questions.json.
  // 3) Dedupliker via normaliseret tekst.
  // 4) Gem resultat i questionBankByColor[color].
  buildQuestionBankByColor() {
    const questionBankByColor = {};

    for (const color of this.questionCategoryColors) {
      const questionType = this.questionTypeByColor[color];
      const questionsForType = questions[questionType];
      let safeQuestionsForType = [];
      if (Array.isArray(questionsForType)) {
        safeQuestionsForType = questionsForType;
      }

      // Set bruges til hurtig lookup af allerede sete normaliserede spørgsmål.
      // Vi deduplikerer kun på tekstindholdet, så små forskelle i whitespace/casing ikke skaber dubletter.
      const uniqueQuestionsForType = [];
      const seenNormalizedQuestions = new Set();

      for (const question of safeQuestionsForType) {
        const normalizedQuestion = this.normalizeQuestion(question);
        if (!seenNormalizedQuestions.has(normalizedQuestion)) {
          seenNormalizedQuestions.add(normalizedQuestion);
          uniqueQuestionsForType.push(question);
        }
      }

      questionBankByColor[color] = uniqueQuestionsForType;
    }

    return questionBankByColor;
  }

  // Opretter en ny session-kopi fra banken.
  // Vi kloner arrays, så træk i sessionen ikke ændrer i spørgsmålsbanken.
  createSessionBucketsFromQuestionBank() {
    const sessionBucketsByColor = {};
    for (const color of this.questionCategoryColors) {
      // Hver kategori får sit eget array, så mutationer i en session
      // ikke lækker tilbage til master-banken.
      sessionBucketsByColor[color] = [...this.questionBankByColor[color]];
    }
    return sessionBucketsByColor;
  }

  // Nulstiller aktiv session så alle spørgsmål er tilgængelige igen.
  resetSessionQuestions() {
    this.remainingQuestionsByColor = this.createSessionBucketsFromQuestionBank();
  }

  // Finder de farver/kategorier der stadig har mindst ét spørgsmål tilbage.
  // Hvis listen er tom, er runden exhausted.
  getColorsWithRemainingQuestions() {
    const colorsWithRemainingQuestions = [];

    for (const color of this.questionCategoryColors) {
      const questionsForColor = this.remainingQuestionsByColor[color];
      if (questionsForColor.length > 0) {
        colorsWithRemainingQuestions.push(color);
      }
    }

    return colorsWithRemainingQuestions;
  }

  getColorForQuestionType(questionType) {
    for (const color of this.questionCategoryColors) {
      if (this.questionTypeByColor[color] === questionType) {
        return color;
      }
    }

    return null;
  }

  pickColorFromPercentages(colorsWithRemainingQuestions) {
    if (!Array.isArray(colorsWithRemainingQuestions) || colorsWithRemainingQuestions.length === 0) {
      return null;
    }

    // Vi arbejder med farver i resten af flowet, så vi gemmer de resterende farver i et Set
    // og kan hurtigt afgøre om en procentvalgt kategori stadig har spørgsmål tilbage.
    const remainingColors = new Set(colorsWithRemainingQuestions);
    const randomPercentage = Math.random() * 100;
    let cumulativePercentage = 0;

    for (const { questionType, percentage } of QUESTION_DRAW_PERCENTAGES) {
      cumulativePercentage += percentage;
      if (randomPercentage < cumulativePercentage) {
        const matchedColor = this.getColorForQuestionType(questionType);
        if (matchedColor && remainingColors.has(matchedColor)) {
          return matchedColor;
        }
        // Hvis den procentvalgte kategori er tom, falder vi ud af loopen
        // og vælger tilfældigt blandt de kategorier der stadig har spørgsmål.
        break;
      }
    }

    // Fallback gør at spillet fortsætter robust, selv hvis en højvægtet kategori er exhausted
    // eller procentfordelingen ikke summerer helt perfekt til 100.
    return this.randomFrom(colorsWithRemainingQuestions);
  }

  // Trækker næste unikke spørgsmål til UI-laget.
  //
  // Returnerer:
  // - et objekt med card-data hvis der findes spørgsmål
  // - null hvis alle kategorier er tomme
  //
  // Logik:
  // 1) Find kategorier med resterende spørgsmål.
  // 2) Forsøg at vælge kategori ud fra procentfordelingen.
  //    Hvis den valgte kategori er tom, fallback til en tilfældig kategori blandt de resterende.
  // 3) Vælg et spørgsmål tilfældigt fra den kategori.
  // 4) Fjern spørgsmålet fra session-listen (så det ikke kan trækkes igen i samme session).
  // 5) Returnér et objekt med id, labels, body og baggrundsfarve.
  drawNextUniqueQuestion() {
    const colorsWithRemainingQuestions = this.getColorsWithRemainingQuestions();
    if (colorsWithRemainingQuestions.length === 0) {
      return null;
    }

    const selectedColor = this.pickColorFromPercentages(colorsWithRemainingQuestions);
    if (!selectedColor) {
      return null;
    }

    const selectedQuestionType = this.questionTypeByColor[selectedColor];
    let selectedQuestionLabel = this.displayLabelByQuestionType[selectedQuestionType];
    if (!selectedQuestionLabel) {
      selectedQuestionLabel = 'Booze Game';
    }

    const remainingQuestionsForColor = this.remainingQuestionsByColor[selectedColor];
    const randomQuestionIndex = Math.floor(Math.random() * remainingQuestionsForColor.length);
    // splice muterer session-listen og returnerer de fjernede elementer.
    const removedQuestions = remainingQuestionsForColor.splice(randomQuestionIndex, 1);
    const selectedQuestionBody = removedQuestions[0];

    // questionId bygges deterministisk ud fra type + normaliseret tekst,
    // så tests og UI kan identificere et spørgsmål stabilt på tværs af sessioner.
    return {
      questionId: `${selectedQuestionType}:${this.normalizeQuestion(selectedQuestionBody)}`,
      title: selectedQuestionLabel,
      cornerLabel: selectedQuestionLabel,
      body: selectedQuestionBody,
      backgroundColor: selectedColor,
    };
  }
}

const questionSessionService = new QuestionSessionService();

export default questionSessionService;
