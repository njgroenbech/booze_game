import TriviaCard from '../models/trivia/TriviaCard';

// Each entry's da/en question+answer live together as one unit, so there's
// no separate index to keep in sync between two files.
const RAW_QUESTIONS = [
  {
    question: { da: 'Hvilket land gav Frihedsgudinden til USA?', en: 'Which country gave the Statue of Liberty to the USA?' },
    answer: { da: 'Frankrig', en: 'France' },
  },
  {
    question: { da: 'Hvilket land opfandt papir?', en: 'Which country invented paper?' },
    answer: { da: 'Kina', en: 'China' },
  },
  {
    question: { da: 'Hvilket land har flest indbyggere?', en: 'Which country has the largest population?' },
    answer: { da: 'Indien', en: 'India' },
  },
  {
    question: { da: 'Hvor mange hjertekamre har et menneske?', en: 'How many chambers does a human heart have?' },
    answer: { da: 'Fire', en: 'Four' },
  },
  {
    question: { da: 'Hvem instruerede Pulp Fiction?', en: 'Who directed Pulp Fiction?' },
    answer: { da: 'Quentin Tarantino', en: 'Quentin Tarantino' },
  },
  {
    question: { da: 'Hvilket band udgav albummet Abbey Road?', en: 'Which band released the album Abbey Road?' },
    answer: { da: 'The Beatles', en: 'The Beatles' },
  },
  {
    question: { da: 'Hvad hedder verdens største hav?', en: 'What is the largest ocean in the world?' },
    answer: { da: 'Stillehavet', en: 'The Pacific Ocean' },
  },
  {
    question: { da: 'Hvilket år faldt Berlinmuren?', en: 'In what year did the Berlin Wall fall?' },
    answer: { da: '1989', en: '1989' },
  },
  {
    question: { da: 'Hvad betyder IPA i øl?', en: 'What does IPA stand for in beer?' },
    answer: { da: 'India Pale Ale', en: 'India Pale Ale' },
  },
  {
    question: { da: 'Hvilket land kommer Guinness fra?', en: 'Which country is Guinness from?' },
    answer: { da: 'Irland', en: 'Ireland' },
  },
];

export const TRIVIA_CARDS = RAW_QUESTIONS.map(
  ({ question, answer }) => new TriviaCard(question, answer)
);
