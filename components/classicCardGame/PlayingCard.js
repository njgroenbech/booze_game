import React from 'react';
import { View, Image, Dimensions } from 'react-native';
import { CARD_IMAGES } from '../../assets/playingCards/CARD_IMAGES.js';

const { width, height } = Dimensions.get('window');
export const CARD_HEIGHT = Math.min(width, height) * 0.8;
export const CARD_WIDTH = CARD_HEIGHT * (500 / 726); // matches webp image dimensions

const CORNER_RADIUS = CARD_WIDTH * (15 / 500);

const PlayingCard = ({ cardId }) => {
    const cardImage = cardId !== null ? CARD_IMAGES[cardId] : CARD_IMAGES.back;
    return (
        <View style={{ borderRadius: CORNER_RADIUS, overflow: 'hidden' }}>
            <Image source={cardImage} style={{ width: CARD_WIDTH, height: CARD_HEIGHT }} />
        </View>
    );
};

export default PlayingCard;
