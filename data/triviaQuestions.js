import TriviaCard from '../models/trivia/TriviaCard';

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

export const TRIVIA_CARDS = RAW_QUESTIONS.map(([question, answer]) => new TriviaCard(question, answer));
