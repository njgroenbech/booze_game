import TriviaCard from '../models/trivia/TriviaCard';
import { RAW_QUESTIONS_EN } from './triviaQuestions.en';

const RAW_QUESTIONS = [
  ['Hvilket land gav Frihedsgudinden til USA?', 'Frankrig'],
  ['Hvilket land opfandt papir?', 'Kina'],
  ['Hvilket land har flest indbyggere?', 'Indien'],
  ['Hvor mange hjertekamre har et menneske?', 'Fire'],
  ['Hvem instruerede Pulp Fiction?', 'Quentin Tarantino'],
  ['Hvilket band udgav albummet Abbey Road?', 'The Beatles'],
  ['Hvad hedder verdens største hav?', 'Stillehavet'],
  ['Hvilket år faldt Berlinmuren?', '1989'],
  ['Hvad betyder IPA i øl?', 'India Pale Ale'],
  ['Hvilket land kommer Guinness fra?', 'Irland'],
];

export const TRIVIA_CARDS = RAW_QUESTIONS.map(([question, answer], index) => {
  const [questionEn, answerEn] = RAW_QUESTIONS_EN[index] ?? [question, answer];
  return new TriviaCard({ da: question, en: questionEn }, { da: answer, en: answerEn });
});
