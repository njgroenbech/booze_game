import {
  Image,
} from 'react-native';
import { CARD_IMAGES } from '../../assets/playingCards/index.js';

const PlayingCard = ({ cardId }) => {
    // If cardId is null (empty deck), show the back of the card
    const source = cardId !== null ? CARD_IMAGES[cardId] : CARD_IMAGES.back;

    return (
        <Image 
            source={source} 
            style={{ width: 100, height: 140, borderRadius: 8 }} 
        />
    );
};

export default PlayingCard;