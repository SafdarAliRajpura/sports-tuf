import React, { useRef } from 'react';
import { StyleSheet, View, Text, Image, Dimensions, Animated as RNAnimated, TouchableOpacity } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { useRouter } from 'expo-router';
import { Trophy, ChevronRight, Check, Zap, Target } from 'lucide-react-native'; 
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'The Elite Arena',
    text: 'Premium turfs for Cricket, Football, and more. Your game deserves the best pitch.',
    // New High-Stability Image: Cricket/Stadium
    image: 'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?q=80&w=1000&auto=format&fit=crop',
    icon: <Target color="#00FF00" size={32} />,
  },
  {
    id: '2',
    title: 'Pro Courtyard',
    text: 'Instant access to top-tier Pickleball and Badminton courts. Book, play, repeat.',
    // New High-Stability Image: Indoor Sports Court
    image: 'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?auto=format&fit=crop&q=80&w=1000',
    icon: <Zap color="#00FF00" size={32} />,
  },
  {
    id: '3',
    title: 'Dominate Now',
    text: 'Join 10k+ players. Track your stats, win tournaments, and claim your trophy.',
    image: null, 
    icon: <Trophy color="#00FF00" size={60} />,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const sliderRef = useRef<AppIntroSlider>(null);
  const scrollX = useRef(new RNAnimated.Value(0)).current;

  const onDone = () => router.replace('/auth/login' as any);

  const handleSkip = () => {
    sliderRef.current?.goToSlide(slides.length - 1, true);
  };

  const renderPagination = (activeIndex: number) => {
    return (
      <View style={styles.paginationWrapper}>
        <View style={styles.leftButtonContainer}>
           {activeIndex < slides.length - 1 && (
             <TouchableOpacity onPress={handleSkip} style={styles.neonSkipButton}>
               <Text style={styles.skipText}>SKIP</Text>
             </TouchableOpacity>
           )}
        </View>

        <View style={styles.paginationDots}>
          {slides.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 32, 10],
              extrapolate: 'clamp',
            });
            return (
              <RNAnimated.View
                key={i}
                style={[styles.dot, { width: dotWidth }, i === activeIndex ? { backgroundColor: '#00FF00' } : { backgroundColor: 'rgba(255,255,255,0.3)' }]}
              />
            );
          })}
        </View>

        <View style={styles.rightButtonContainer}>
          <TouchableOpacity 
            onPress={() => activeIndex < slides.length - 1 ? sliderRef.current?.goToSlide(activeIndex + 1, true) : onDone()}
            style={activeIndex < slides.length - 1 ? styles.neonNextButton : styles.neonDoneButton}
          >
            {activeIndex < slides.length - 1 ? <ChevronRight color="#00FF00" size={28} /> : <Check color="#000000" size={28} />}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.slide}>
      <StatusBar style="light" />
      {item.image && (
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.image} 
            resizeMode="cover"
          />
        </View>
      )}
      
      <View style={[styles.contentContainer, !item.image && styles.fullContent]}>
        <View style={styles.iconCircle}>{item.icon}</View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0F172A' }}>
      <AppIntroSlider
        ref={sliderRef}
        renderItem={renderItem}
        data={slides}
        renderPagination={renderPagination}
        onScroll={RNAnimated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  slide: { flex: 1, backgroundColor: '#0F172A' },
  imageContainer: {
    width: width,
    height: height * 0.6, // Ensures the image has a defined physical area
    position: 'absolute',
    top: 0,
  },
  image: { 
    width: '100%', 
    height: '100%',
  },
  contentContainer: {
    flex: 1, 
    backgroundColor: '#0F172A', 
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40,
    marginTop: height * 0.45, 
    padding: 40, 
    alignItems: 'center',
    zIndex: 10,
  },
  fullContent: {
    marginTop: 0,
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },
  iconCircle: { 
    padding: 20, 
    borderRadius: 30, 
    marginBottom: 20, 
    borderWidth: 1.5, 
    borderColor: '#00FF00',
    backgroundColor: 'rgba(0, 255, 0, 0.05)'
  },
  title: { fontSize: 30, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', textTransform: 'uppercase' },
  description: { fontSize: 16, color: '#94A3B8', textAlign: 'center', marginTop: 15, lineHeight: 24 },
  paginationWrapper: {
    position: 'absolute',
    bottom: 50,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 25,
  },
  leftButtonContainer: { width: 80 },
  rightButtonContainer: { width: 80, alignItems: 'flex-end' },
  paginationDots: { flexDirection: 'row', alignItems: 'center' },
  dot: { height: 10, borderRadius: 5, marginHorizontal: 5 },
  neonSkipButton: { paddingVertical: 10, paddingHorizontal: 15, borderRadius: 20, borderWidth: 1, borderColor: '#00FF00' },
  skipText: { color: '#00FF00', fontSize: 13, fontWeight: '800' },
  neonNextButton: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#00FF00', justifyContent: 'center', alignItems: 'center' },
  neonDoneButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#00FF00', justifyContent: 'center', alignItems: 'center' },
});