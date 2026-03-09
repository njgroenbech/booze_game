import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const escapeRegexText = (text) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // regex for replacement of player names in questions.
};

const getUniqueHighlightedNames = (highlightedPlayerNames) => {
  const uniqueHighlightedNames = [];

  if (!Array.isArray(highlightedPlayerNames)) {
    return uniqueHighlightedNames;
  }

  for (const playerName of highlightedPlayerNames) {
    if (typeof playerName !== 'string') {
      continue;
    }

    const normalizedPlayerName = playerName.trim();
    if (normalizedPlayerName.length === 0) {
      continue;
    }

    if (!uniqueHighlightedNames.includes(normalizedPlayerName)) {
      uniqueHighlightedNames.push(normalizedPlayerName);
    }
  }

  return uniqueHighlightedNames;
};

const sortNamesByLengthDesc = (names) => {
  const sortedNames = names.slice();

  // Sort longer names first so the regex matches full names before shorter partial matches.
  sortedNames.sort((leftName, rightName) => {
    if (leftName.length > rightName.length) {
      return -1;
    }
    if (leftName.length < rightName.length) {
      return 1;
    }
    return 0;
  });

  return sortedNames;
};

const buildHighlightPattern = (highlightedPlayerNames) => {
  // Build one regex that can find every player name that should be italicized.
  const uniqueHighlightedNames = getUniqueHighlightedNames(highlightedPlayerNames);
  if (uniqueHighlightedNames.length === 0) {
    return null;
  }

  const sortedHighlightedNames = sortNamesByLengthDesc(uniqueHighlightedNames);
  const escapedHighlightedNames = [];

  for (const playerName of sortedHighlightedNames) {
    escapedHighlightedNames.push(escapeRegexText(playerName));
  }

  const patternSource = escapedHighlightedNames.join('|');

  if (patternSource.length === 0) {
    return null;
  }

  return new RegExp(patternSource, 'g');
};

const buildBodyTextSegments = (bodyText, highlightedPlayerNames) => {
  if (typeof bodyText !== 'string') {
    return [];
  }

  const highlightPattern = buildHighlightPattern(highlightedPlayerNames);
  if (!highlightPattern) {
    return [{ text: bodyText, isHighlightedName: false }];
  }

  // We build the result from left to right.
  // `nextPlainTextStart` marks where the next non-highlighted text begins.
  const segments = [];
  let nextPlainTextStart = 0;
  let currentMatch = highlightPattern.exec(bodyText);

  while (currentMatch !== null) {
    const matchedName = currentMatch[0];
    const matchedNameStart = currentMatch.index;
    const matchedNameEnd = matchedNameStart + matchedName.length;

    // Add the plain text that appears before the matched player name.
    if (matchedNameStart > nextPlainTextStart) {
      const plainTextBeforeName = bodyText.slice(nextPlainTextStart, matchedNameStart);
      segments.push({
        text: plainTextBeforeName,
        isHighlightedName: false,
      });
    }

    // Add the player name itself as a highlighted segment.
    segments.push({
      text: matchedName,
      isHighlightedName: true,
    });

    // Continue reading from the end of the matched name.
    nextPlainTextStart = matchedNameEnd;
    currentMatch = highlightPattern.exec(bodyText);
  }

  // Add any plain text that appears after the last matched player name.
  if (nextPlainTextStart < bodyText.length) {
    const remainingPlainText = bodyText.slice(nextPlainTextStart);
    segments.push({
      text: remainingPlainText,
      isHighlightedName: false,
    });
  }

  if (segments.length === 0) {
    return [{ text: bodyText, isHighlightedName: false }];
  }

  return segments;
};

const getCornerCutoutWidth = (cornerLabel, backgroundColor) => {
  // Different labels need slightly different cutout widths to fit visually according to the labels text length
  if (cornerLabel.includes('\u2620')) {
    return '15%';
  }

  if (backgroundColor === '#f67efcff') {
    return '20%';
  }

  if (backgroundColor === '#34b0fcff') {
    return '25%';
  }

  return null;
};

const TicketCardBody = ({ bodyText, highlightedPlayerNames }) => {
  const textSegments = buildBodyTextSegments(bodyText, highlightedPlayerNames);
  const renderedSegments = [];

  // Render each segment as a nested Text node so only player names become italic.
  for (let index = 0; index < textSegments.length; index += 1) {
    const segment = textSegments[index];
    let textStyle = styles.bodyRegular;

    if (segment.isHighlightedName) {
      textStyle = styles.bodyPlayerName;
    }

    renderedSegments.push(
      <Text key={`${index}:${segment.isHighlightedName ? 'p' : 'n'}`} style={textStyle}>
        {segment.text}
      </Text>
    );
  }

  return (
    <Text style={styles.body}>{renderedSegments}</Text>
  );
};

const TicketCard = ({
  title = '',
  body = '',
  highlightedPlayerNames = [],
  cornerLabel = '',
  brand = '',
  backgroundColor = '#f85d63',
  tilt = -3,
  style,
}) => {
  const cornerCutoutWidth = getCornerCutoutWidth(cornerLabel, backgroundColor);
  const cardStyle = {
    backgroundColor,
    transform: [{ rotate: `${tilt}deg` }],
  };
  const cornerCutoutStyle = [styles.cornerCutout];

  if (cornerCutoutWidth) {
    cornerCutoutStyle.push({ width: cornerCutoutWidth });
  }

  const cornerLabelStyle = [styles.cornerLabel, { color: backgroundColor }];

  return (
    <View style={[styles.wrapper, style]}>
      <View style={[styles.card, cardStyle]}>
        <View style={cornerCutoutStyle} />
        <Text style={cornerLabelStyle}>{cornerLabel}</Text>

        {title ? <Text style={styles.title}>{title}</Text> : null}
        <TicketCardBody bodyText={body} highlightedPlayerNames={highlightedPlayerNames} />

        <Text style={styles.brand}>{brand}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: '60%',
    minHeight: 260,
    borderRadius: 34,
    borderWidth: 9,
    borderColor: '#ffffff',
    paddingVertical: 24,
    paddingHorizontal: 22,
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 8,
    overflow: 'hidden',
  },
  cornerCutout: {
    position: 'absolute',
    top: -9,
    right: -9,
    width: '42%',
    height: '34%',
    backgroundColor: '#ffffff',
    borderTopRightRadius: 34,
    borderBottomLeftRadius: 26,
  },
  cornerLabel: {
    position: 'absolute',
    top: 16,
    right: 20,
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    color: '#ffffff',
    fontSize: 42,
    lineHeight: 44,
    fontWeight: '700',
    marginBottom: 14,
    maxWidth: '82%',
  },
  body: {
    color: '#ffffff',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '600',
    maxWidth: '88%',
  },
  bodyRegular: {
    fontWeight: '600',
  },
  bodyPlayerName: {
    fontWeight: '600',
    fontStyle: 'italic',
  },
  brand: {
    position: 'absolute',
    right: 18,
    bottom: 14,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default TicketCard;
