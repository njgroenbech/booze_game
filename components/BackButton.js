import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
                <Ionicons name="chevron-back" size={22} color="white" style={{ marginLeft: -2 }} />
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    backButton: {
    position: 'absolute',
    top: 25,
    left: 20,
    zIndex: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
});

export default BackButton;