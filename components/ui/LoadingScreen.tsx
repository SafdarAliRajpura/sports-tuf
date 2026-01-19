import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  Easing,
  withDelay,
} from 'react-native-reanimated'; 
import { StatusBar } from 'expo-status-bar';

const APP_NAME = "ARENAPRO";
const LETTER_WIDTH = 22; 
const TOTAL_WIDTH = APP_NAME.length * LETTER_WIDTH;
const ANIMATION_DURATION = 1500; // Increased speed from 2000 to 1500ms

export default function LoadingScreen() {
  const ballX = useSharedValue(-(TOTAL_WIDTH / 2)); 
  const ballRotation = useSharedValue(0);

  useEffect(() => {
    // 1. Snappier typing movement
    ballX.value = withTiming(TOTAL_WIDTH / 2 + 15, { 
      duration: ANIMATION_DURATION, 
      easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
    });

    // 2. Slower, smoother ball rotation
    ballRotation.value = withRepeat(
      withTiming(360, { 
        duration: 1200, // Slowed down from 600ms to 1200ms
        easing: Easing.linear 
      }),
      -1
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
      
      <View style={styles.contentRow}>
        <View style={styles.textContainer}>
          {APP_NAME.split('').map((letter, index) => (
            <Letter key={index} letter={letter} index={index} />
          ))}
        </View>

        <Animated.View style={[styles.ballWrapper, ballStyle]}>
          <Text style={{ fontSize: 24 }}>⚽</Text>
          <View style={styles.ballGlow} />
        </Animated.View>
      </View>
    </View>
  );
}

function Letter({ letter, index }: { letter: string, index: number }) {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    // Reveal letters slightly faster to match the ball
    opacity.value = withDelay(
      index * (ANIMATION_DURATION / APP_NAME.length), 
      withTiming(1, { duration: 100 })
    );
    scale.value = withDelay(
      index * (ANIMATION_DURATION / APP_NAME.length), 
      withTiming(1, { duration: 200 })
    );
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
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  textContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: '#00FF00',
    textShadowRadius: 10,
  },
  ballWrapper: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  ballGlow: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 255, 0, 0.35)',
    shadowColor: '#00FF00',
    shadowOpacity: 1,
    shadowRadius: 12,
    zIndex: -1,
  },
});