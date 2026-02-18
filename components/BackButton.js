import React from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';

const BackButton = ({ navigation }) => {
    const handleBackToHome = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
        });
    };

    return (
        <View style={styles.content}>
            <Pressable style={styles.backButton} onPress={handleBackToHome}>
                <Text style={styles.backButtonText}>←</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    backButton: {
    position: 'absolute',
    top: 24,
    left: 16,
    zIndex: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#ffffff',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '700',
  },
});

export default BackButton;