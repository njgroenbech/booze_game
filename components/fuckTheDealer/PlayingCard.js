import {
  Image,
  Dimensions,
} from 'react-native';
import { CARD_IMAGES } from '../../assets/playingCards/CARD_IMAGES.js';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = Math.min(width, height) * 0.8;
const CARD_WIDTH = CARD_HEIGHT * (5 / 7); // standard playing card aspect ratio

const PlayingCard = ({ cardId }) => {
    // If cardId is null (empty deck), show the back of the card
    const source = cardId !== null ? CARD_IMAGES[cardId] : CARD_IMAGES.back;

    return (
        <Image
            source={source}
            style={{ height: CARD_HEIGHT, width: CARD_WIDTH }}
            resizeMode="contain"
        />
    );
};

export default PlayingCard;