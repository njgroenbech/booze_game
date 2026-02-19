import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

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
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" style={{ marginLeft: -2 }}>
                    <Polyline
                        points="15,6 9,12 15,18"
                        stroke="white"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </Svg>
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