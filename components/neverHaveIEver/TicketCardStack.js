import React, { useRef, useState } from 'react';
import { ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import TicketCard from './TicketCard';
import CardThrowAnimation from './CardThrowAnimation';
import questionSessionService from '../../services/neverHaveIEver/QuestionSessionService';
import TicketCardFactoryService from '../../services/neverHaveIEver/TicketCardFactoryService';
import { useGame } from '../../context/GameContext';
import { useLanguage } from '../../context/LanguageContext';
import { STRINGS } from '../../i18n/strings';
import AnimatedText from '../AnimatedText';

// Service-instans som bygger hvert kort (spørgsmål eller exhausted-kort).
const ticketCardService = new TicketCardFactoryService(questionSessionService);

// Vi holder kort-id'er stabile, så hvert kort har en entydig identitet i React-listen.
const FIRST_CARD_ID = 1;
const NEXT_CARD_ID_AFTER_RESET = 2;

const TicketCardStack = ({
  body,
  brand,
  maxCards = 10,
  backgroundImageSource,
}) => {
  const { players } = useGame();
  const { t, language } = useLanguage();
  // Begge sprog, ikke kun det aktive - så et allerede trukket exhausted-kort
  // også kan skifte sprog live, ligesom almindelige spørgsmålskort.
  const exhaustedTextBilingual = {
    title: STRINGS.neverHaveIEver.exhaustedTitle,
    body: STRINGS.neverHaveIEver.exhaustedBody,
  };
  // Ref bruges til næste kort-id uden at trigge rerenders.
  const nextCardIdRef = useRef(NEXT_CARD_ID_AFTER_RESET);
  // Stack starter med ét kort, så skærmen aldrig er tom.
  const [cards, setCards] = useState(() => [ticketCardService.createNextCardBilingual(FIRST_CARD_ID, body, players, exhaustedTextBilingual)]);
  // Når spørgsmål er opbrugt, låses træk og reset-knap vises.
  const [hasNoMoreQuestions, setHasNoMoreQuestions] = useState(false);

  // Begrænser antal kort i stacken, så UI ikke vokser uendeligt.
  const trimCardsToMaxLimit = (cardList) => {
    if (cardList.length <= maxCards) {
      return cardList;
    }

    const startIndex = cardList.length - maxCards;
    return cardList.slice(startIndex);
  };

  // Opretter næste kort og flytter tælleren frem til næste træk.
  const createNextCardAndIncreaseId = () => {
    const nextCard = ticketCardService.createNextCardBilingual(nextCardIdRef.current, body, players, exhaustedTextBilingual);
    nextCardIdRef.current += 1;
    return nextCard;
  };

  // Kører når brugeren trykker på stacken for at trække et nyt kort.
  const addCardToStack = () => {
    if (hasNoMoreQuestions) {
      return;
    }

    const nextCard = createNextCardAndIncreaseId();

    if (nextCard.isExhausted) {
      setHasNoMoreQuestions(true);
    }

    // Tilføjer kortet og trimmer bagefter til ønsket max-længde.
    setCards((prevCards) => {
      const updatedCards = [...prevCards, nextCard];
      return trimCardsToMaxLimit(updatedCards);
    });
  };

  // Starter en ny spørgsmålsrunde i services og nulstiller lokal stack-state.
  const resetQuestionSession = () => {
    questionSessionService.resetSessionQuestions();
    const firstCard = ticketCardService.createNextCardBilingual(FIRST_CARD_ID, body, players, exhaustedTextBilingual);
    nextCardIdRef.current = NEXT_CARD_ID_AFTER_RESET;
    setCards([firstCard]);

    if (firstCard.isExhausted) {
      setHasNoMoreQuestions(true);
    } else {
      setHasNoMoreQuestions(false);
    }
  };

  // Renderer alle kort i stacken med kast-animation.
  const renderCards = () => {
    return cards.map((card, index) => {
      let shouldSkipAnimation = false;
      // Første kort ved initial render skal ikke "flyve ind".
      if (index === 0 && cards.length === 1) {
        shouldSkipAnimation = true;
      }

      return (
        <CardThrowAnimation
          key={`${card.id}:${card.questionId}`}
          offsetX={card.offsetX}
          offsetY={card.offsetY}
          tilt={card.tilt}
          skipAnimation={shouldSkipAnimation}
          style={[styles.absoluteCard, { zIndex: index + 1 }]}
        >
          <TicketCard
            title={card.title[language]}
            body={card.body[language]}
            highlightedPlayerNames={card.highlightedPlayerNames}
            cornerLabel={card.cornerLabel[language]}
            brand={brand}
            backgroundColor={card.backgroundColor}
            tilt={card.tilt}
          />
        </CardThrowAnimation>
      );
    });
  };

  // Nederste hjælpetekst eller reset-knap afhængigt af game-state.
  const renderFooterContent = () => {
    let footerContent = null;

    if (!hasNoMoreQuestions) {
      footerContent = (
        <View style={styles.hintWrapper}>
          <AnimatedText style={styles.hintText}>{t('neverHaveIEver.footerHint')}</AnimatedText>
        </View>
      );
    }

    if (hasNoMoreQuestions) {
      footerContent = (
        <View style={styles.actionsWrapper}>
          <Pressable style={styles.actionButton} onPress={resetQuestionSession}>
            <AnimatedText style={styles.actionButtonText}>{t('neverHaveIEver.resetButton')}</AnimatedText>
          </Pressable>
        </View>
      );
    }

    return footerContent;
  };

  // Klikbar stack-beholder der samler kort og footer i samme lag.
  const renderStackContent = () => {
    return (
      <Pressable style={styles.stackLayer} onPress={addCardToStack} disabled={hasNoMoreQuestions}>
        {renderCards()}
        {renderFooterContent()}
      </Pressable>
    );
  };

  // Wrapper indholdet i baggrundsbillede, hvis der er sendt et ind.
  const renderContentWithOptionalBackground = () => {
    const stackContent = renderStackContent();

    if (!backgroundImageSource) {
      return stackContent;
    }

    return (
      <ImageBackground
        source={backgroundImageSource}
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        {stackContent}
      </ImageBackground>
    );
  };

  return <View style={styles.container}>{renderContentWithOptionalBackground()}</View>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  backgroundImage: {},
  stackLayer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  absoluteCard: {
    position: 'absolute',
    width: '100%',
  },
  hintWrapper: {
    position: 'absolute',
    bottom: 24,
  },
  hintText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  actionsWrapper: {
    position: 'absolute',
    bottom: 2,
    width: '100%',
    alignItems: 'center',
    gap: 10,
  },
  actionButton: {
    minWidth: 220,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default TicketCardStack;
