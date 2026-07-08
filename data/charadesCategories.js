import WordCategory from '../models/charades/WordCategory';
import MixedWordCategory from '../models/charades/MixedWordCategory';

const ANIMALS = [
  'Elefant', 'Giraf', 'Løve', 'Tiger', 'Bjørn', 'Kænguru', 'Pingvin', 'Delfin',
  'Haj', 'Slange', 'Krokodille', 'Flamingo', 'Zebra', 'Gorilla', 'Ræv', 'Ulv',
  'Kanin', 'Egern', 'Sommerfugl', 'Myre', 'Edderkop', 'Frø', 'Skildpadde',
  'Papegøje', 'Struds', 'Flodhest', 'Næsehorn', 'Koala', 'Panda', 'Ugle',
];

const CELEBRITIES = [
  'Albert Einstein', 'Marilyn Monroe', 'Michael Jackson', 'Elvis Presley',
  'Freddie Mercury', 'Charlie Chaplin', 'Leonardo DiCaprio', 'Beyoncé',
  'Elon Musk', 'Barack Obama', 'Dronning Margrethe', 'Mads Mikkelsen',
  'Lars Ulrich', 'Viggo Mortensen', 'Taylor Swift', 'Cristiano Ronaldo',
  'Lionel Messi', 'Serena Williams', 'Usain Bolt', 'Oprah Winfrey',
  'Johnny Depp', 'Angelina Jolie', 'Brad Pitt', 'Adele', 'Ed Sheeran',
  'Rihanna', 'Will Smith', 'Tom Hanks', 'Morgan Freeman', 'Keanu Reeves',
];

const MOVIES_TV = [
  'Star Wars', 'Titanic', 'Frost', 'Jurassic Park', 'Matrix', 'Harry Potter',
  'Ringenes Herre', 'Vikings', 'Game of Thrones', 'Friends', 'Squid Game',
  'Breaking Bad', 'Spider-Man', 'Batman', 'Toy Story', 'Find Nemo', 'Grease',
  'Rocky', 'Terminator', 'Shrek', 'Madagascar', 'Ice Age',
  'Pirates of the Caribbean', 'Familien Simpson', 'Svampebob Firkant',
  'Vild Med Dans', 'X Factor', 'Borgen', 'Klovn', 'Baywatch',
];

const baseCategories = [
  new WordCategory('animals', 'Dyr', ANIMALS, '#C9EAD3'),
  new WordCategory('celebrities', 'Kendte personer', CELEBRITIES, '#F6D6E0'),
  new WordCategory('movies-tv', 'Film & TV', MOVIES_TV, '#CDE0F7'),
];

export const CHARADES_CATEGORIES = [
  ...baseCategories,
  new MixedWordCategory(baseCategories),
];

export function findCharadesCategory(id) {
  return CHARADES_CATEGORIES.find((category) => category.id === id) ?? CHARADES_CATEGORIES[0];
}
