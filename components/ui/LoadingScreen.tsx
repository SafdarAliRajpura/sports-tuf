import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

const APP_NAME = "ARENAPRO";
const LETTER_WIDTH = 26;
const TOTAL_WIDTH = APP_NAME.length * LETTER_WIDTH;
const ANIMATION_DURATION = 2200; 

export default function LoadingScreen() {
  // Start the ball exactly at the center of the first letter "A"
  const ballX = useSharedValue(-(TOTAL_WIDTH / 2) + LETTER_WIDTH / 2);
  const ballRotation = useSharedValue(0);

  useEffect(() => {
    const startDelay = 500;

    // 1. Move Ball: Start at "A" and stop one full width AFTER the "O"
    ballX.value = withDelay(
      startDelay,
      withTiming((TOTAL_WIDTH / 2) + (LETTER_WIDTH / 2) + 10, { // Added extra offset to clear the O
        duration: ANIMATION_DURATION,
        easing: Easing.bezier(0.4, 0, 0.2, 1), 
      })
    );

    // 2. Rotation: Increased degrees for a more natural roll over the longer distance
    ballRotation.value = withDelay(
      startDelay,
      withTiming(900, {
        duration: ANIMATION_DURATION,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      })
    );
  }, []);

  const ballStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: ballX.value },
      { rotate: `${ballRotation.value}deg` }
    ],
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.contentWrapper}>
        <View style={styles.textContainer}>
          {APP_NAME.split('').map((letter, index) => (
            <Letter key={index} letter={letter} index={index} />
          ))}
        </View>

        <View style={styles.ballTrackContainer}>
          <Animated.View style={[styles.ballWrapper, ballStyle]}>
            <Text style={styles.ballText}>⚽</Text>
            <View style={styles.ballGlow} />
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

function Letter({ letter, index }: { letter: string; index: number }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.5);

  useEffect(() => {
    const startDelay = 500;
    // Calculate timing so letters appear as the ball center passes over them
    const singleLetterTime = ANIMATION_DURATION / (APP_NAME.length); 
    const myDelay = startDelay + index * singleLetterTime;

    opacity.value = withDelay(myDelay, withTiming(1, { duration: 150 }));
    scale.value = withDelay(myDelay, withTiming(1, { duration: 250 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={{ width: LETTER_WIDTH, alignItems: 'center' }}>
      <Animated.Text style={[styles.letterText, style]}>{letter}</Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A14',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    width: '100%',
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  ballTrackContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    marginTop: 6, // Aligns ball baseline with letters
  },
  ballWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: 40,
  },
  ballText: {
    fontSize: 22,
  },
  letterText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    textShadowColor: '#00FF00',
    textShadowRadius: 15,
  },
  ballGlow: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 255, 0, 0.4)',
    shadowColor: '#00FF00',
    shadowOpacity: 1,
    shadowRadius: 20,
    zIndex: -1,
  },
});