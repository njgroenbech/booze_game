import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const TicketCard = ({
  title = 'Jeg har aldrig',
  body = '...glemt at mobilepay for drinks i byen',
  cornerLabel = 'Jeg har aldrig',
  brand = 'Booze Game',
  backgroundColor = '#f85d63',
  tilt = -3,
  style,
}) => {
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
        <View style={styles.cornerCutout} />
        <Text style={styles.cornerLabel}>{cornerLabel}</Text>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{body}</Text>

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
    width: '75%',
    minHeight: 240,
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
    color: '#ee7272ff',
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
