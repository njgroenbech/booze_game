import questions from '../../data/questions.json';
import questionsEn from '../../data/questions.en.json';
import { STRINGS } from '../../i18n/strings';

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

    // questionBankByColor er "master copy": deduplikeret og stabil pr. app-livscyklus.
    // remainingQuestionsByColor er "session copy": herfra trækker vi spørgsmål og muterer løbende.
    // På den måde kan vi resette en session uden at genindlæse eller rededuplikere data.
    this.questionBankByColor = this.buildQuestionBankByColor();
    this.remainingQuestionsByColor = this.createSessionBucketsFromQuestionBank();
    // Slår dansk spørgsmålstekst op til den engelske oversættelse, pr. farve.
    // Bygges positionsbaseret fra questions.json/questions.en.json, som holdes i sync
    // af test/neverHaveIEver/questions-i18n-parity.test.cjs.
    this.danishToEnglishByColor = this.buildDanishToEnglishByColor();
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

  // Bygger farve -> Map(normaliseret dansk tekst -> engelsk tekst).
  // Går igennem de rå (ikke-deduplikerede) arrays i lås-trin, så indekset i
  // questions.json altid matcher det tilsvarende indeks i questions.en.json.
  buildDanishToEnglishByColor() {
    const danishToEnglishByColor = {};

    for (const color of this.questionCategoryColors) {
      const questionType = this.questionTypeByColor[color];
      const daQuestionsForType = Array.isArray(questions[questionType]) ? questions[questionType] : [];
      const enQuestionsForType = Array.isArray(questionsEn[questionType]) ? questionsEn[questionType] : [];

      const danishToEnglish = new Map();
      daQuestionsForType.forEach((question, index) => {
        danishToEnglish.set(this.normalizeQuestion(question), enQuestionsForType[index]);
      });

      danishToEnglishByColor[color] = danishToEnglish;
    }

    return danishToEnglishByColor;
  }

  // Nøgle + sprog -> label der vises på kortet. Falder tilbage til dansk,
  // og til appens navn hvis nøglen slet ikke findes i ordbogen.
  getQuestionLabel(questionType, language) {
    const entry = STRINGS.neverHaveIEver?.cardLabels?.[questionType];
    if (!entry) {
      return 'Booze Game';
    }
    return entry[language] ?? entry.da;
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

  // Fælles træk-logik: vælger kategori/farve ud fra procentfordelingen, trækker
  // et tilfældigt spørgsmål fra den kategori, og fjerner det fra session-listen.
  // Returnerer null hvis alle kategorier er tomme.
  // Delt af drawNextUniqueQuestion og drawNextUniqueQuestionBilingual, så
  // udvælgelses-/mutations-logikken kun findes ét sted.
  _drawNextRaw() {
    const colorsWithRemainingQuestions = this.getColorsWithRemainingQuestions();
    if (colorsWithRemainingQuestions.length === 0) {
      return null;
    }

    const selectedColor = this.pickColorFromPercentages(colorsWithRemainingQuestions);
    if (!selectedColor) {
      return null;
    }

    const selectedQuestionType = this.questionTypeByColor[selectedColor];
    const remainingQuestionsForColor = this.remainingQuestionsByColor[selectedColor];
    const randomQuestionIndex = Math.floor(Math.random() * remainingQuestionsForColor.length);
    // splice muterer session-listen og returnerer de fjernede elementer.
    const removedQuestions = remainingQuestionsForColor.splice(randomQuestionIndex, 1);
    const selectedQuestionBody = removedQuestions[0];
    const normalizedQuestionBody = this.normalizeQuestion(selectedQuestionBody);

    return { selectedColor, selectedQuestionType, selectedQuestionBody, normalizedQuestionBody };
  }

  // Trækker næste unikke spørgsmål til UI-laget.
  //
  // Returnerer:
  // - et objekt med card-data hvis der findes spørgsmål
  // - null hvis alle kategorier er tomme
  //
  // language er valgfri (default 'da'), så eksisterende kald/tests er uændrede.
  // Uddrag/session-tracking sker altid på den danske tekst, så en sprogskift
  // midt i en session ikke mister styr på hvilke spørgsmål der er trukket.
  drawNextUniqueQuestion(language = 'da') {
    const raw = this._drawNextRaw();
    if (!raw) {
      return null;
    }
    const { selectedColor, selectedQuestionType, selectedQuestionBody, normalizedQuestionBody } = raw;

    const selectedQuestionLabel = this.getQuestionLabel(selectedQuestionType, language);

    let displayBody = selectedQuestionBody;
    if (language === 'en') {
      const englishBody = this.danishToEnglishByColor[selectedColor].get(normalizedQuestionBody);
      if (englishBody) {
        displayBody = englishBody;
      }
    }

    // questionId bygges deterministisk ud fra type + normaliseret DANSK tekst,
    // så tests og UI kan identificere et spørgsmål stabilt på tværs af sessioner og sprog.
    return {
      questionId: `${selectedQuestionType}:${normalizedQuestionBody}`,
      title: selectedQuestionLabel,
      cornerLabel: selectedQuestionLabel,
      body: displayBody,
      backgroundColor: selectedColor,
    };
  }

  // Samme som drawNextUniqueQuestion, men returnerer BEGGE sprog for title/
  // cornerLabel/body i stedet for at vælge ét sprog. Bruges af UI-laget når
  // kortet skal kunne skifte sprog live uden at trække et nyt kort.
  drawNextUniqueQuestionBilingual() {
    const raw = this._drawNextRaw();
    if (!raw) {
      return null;
    }
    const { selectedColor, selectedQuestionType, selectedQuestionBody, normalizedQuestionBody } = raw;

    const labelDa = this.getQuestionLabel(selectedQuestionType, 'da');
    const labelEn = this.getQuestionLabel(selectedQuestionType, 'en');
    const englishBody = this.danishToEnglishByColor[selectedColor].get(normalizedQuestionBody) ?? selectedQuestionBody;

    return {
      questionId: `${selectedQuestionType}:${normalizedQuestionBody}`,
      title: { da: labelDa, en: labelEn },
      cornerLabel: { da: labelDa, en: labelEn },
      body: { da: selectedQuestionBody, en: englishBody },
      backgroundColor: selectedColor,
    };
  }
}

const questionSessionService = new QuestionSessionService();

export default questionSessionService;
