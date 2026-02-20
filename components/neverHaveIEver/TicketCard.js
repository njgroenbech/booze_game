import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const escapeTextForRegex = (text) => {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const getUniqueNamesToHighlight = (highlightedPlayerNames) => {
  const uniqueNames = [];

  if (!Array.isArray(highlightedPlayerNames)) {
    return uniqueNames;
  }

  for (const name of highlightedPlayerNames) {
    if (typeof name !== 'string') {
      continue;
    }

    const trimmedName = name.trim();
    if (trimmedName.length === 0) {
      continue;
    }

    if (!uniqueNames.includes(trimmedName)) {
      uniqueNames.push(trimmedName);
    }
  }

  return uniqueNames;
};

const sortByLengthDescending = (items) => {
  const sortedItems = [...items];

  sortedItems.sort((leftItem, rightItem) => {
    if (leftItem.length > rightItem.length) {
      return -1;
    }
    if (leftItem.length < rightItem.length) {
      return 1;
    }
    return 0;
  });

  return sortedItems;
};

const buildBodySegments = (bodyText, highlightedPlayerNames) => {
  const segments = [];

  if (typeof bodyText !== 'string') {
    return segments;
  }

  const uniqueNames = getUniqueNamesToHighlight(highlightedPlayerNames);
  if (uniqueNames.length === 0) {
    segments.push({ text: bodyText, isPlayerName: false });
    return segments;
  }

  const sortedNames = sortByLengthDescending(uniqueNames);
  const escapedNames = sortedNames.map((name) => escapeTextForRegex(name));
  const patternSource = escapedNames.join('|');

  if (patternSource.length === 0) {
    segments.push({ text: bodyText, isPlayerName: false });
    return segments;
  }

  const highlightPattern = new RegExp(patternSource, 'g');
  let currentIndex = 0;
  let match = highlightPattern.exec(bodyText);

  while (match !== null) {
    const matchText = match[0];
    const matchStartIndex = match.index;
    const matchEndIndex = matchStartIndex + matchText.length;

    if (matchStartIndex > currentIndex) {
      segments.push({
        text: bodyText.slice(currentIndex, matchStartIndex),
        isPlayerName: false,
      });
    }

    segments.push({
      text: matchText,
      isPlayerName: true,
    });

    currentIndex = matchEndIndex;
    match = highlightPattern.exec(bodyText);
  }

  if (currentIndex < bodyText.length) {
    segments.push({
      text: bodyText.slice(currentIndex),
      isPlayerName: false,
    });
  }

  if (segments.length === 0) {
    segments.push({ text: bodyText, isPlayerName: false });
  }

  return segments;
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
  const hasSkullLabel = cornerLabel.includes('\u2620');
  let cornerCutoutWidth = null;

  if (hasSkullLabel) {
    cornerCutoutWidth = '15%';
  } else if (backgroundColor === '#f67efcff') {
    cornerCutoutWidth = '20%';
  } else if (backgroundColor === '#34b0fcff') {
    cornerCutoutWidth = '25%';
  }

  const bodySegments = buildBodySegments(body, highlightedPlayerNames);

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.card,
          {
            backgroundColor,
            transform: [{ rotate: `${tilt}deg` }],
          },
        ]}
      >
        <View
          style={[
            styles.cornerCutout,
            cornerCutoutWidth ? { width: cornerCutoutWidth } : null,
          ]}
        />
        <Text style={[styles.cornerLabel, {color: backgroundColor}]}>{cornerLabel}</Text>

        {title ? <Text style={styles.title}>{title}</Text> : null}
        <Text style={styles.body}>
          {bodySegments.map((segment, index) => {
            let segmentStyle = styles.bodyRegular;
            if (segment.isPlayerName) {
              segmentStyle = styles.bodyPlayerName;
            }

            return (
              <Text key={`${index}:${segment.isPlayerName ? 'p' : 'n'}`} style={segmentStyle}>
                {segment.text}
              </Text>
            );
          })}
        </Text>

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
