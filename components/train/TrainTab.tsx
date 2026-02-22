import { useRouter } from 'expo-router';
import { Dumbbell, MapPin, Play, Star, TrendingUp, Users } from 'lucide-react-native';
import React from 'react';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut, SlideInUp, SlideOutDown, FadeInLeft, FadeInRight, FadeInUp, FadeInDown } from "react-native-reanimated";
import { Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TrainTab() {
  const router = useRouter();

  const handleBook = () => {
    // Navigate to a coach booking or details page
    // router.push('/train/coach/123');
  };

  const coaches = [
    {
      id: '1',
      name: 'Rahul Dravid',
      role: 'Cricket Coach',
      exp: '15 Years Exp.',
      rating: '4.9',
      image: 'https://images.unsplash.com/photo-1566933293069-b55c7f326dd4?q=80&w=200',
    },
    {
      id: '2',
      name: 'Sunil Chhetri',
      role: 'Football Coach',
      exp: '10 Years Exp.',
      rating: '5.0',
      image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=200',
    },
  ];

  return (
    <View style={styles.container}>
      {/* HEADER BANNER */}
      <View style={styles.bannerContainer}>
        <ImageBackground 
          source={{ uri: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1000' }} 
          style={styles.banner} 
          imageStyle={{ borderRadius: 20, opacity: 0.6 }}
        >
          <View style={styles.bannerContent}>
            <View style={styles.bannerBadge}>
              <Text style={styles.bannerBadgeText}>PRO TRAINING</Text>
            </View>
            <Text style={styles.bannerTitle}>Elevate Your Game</Text>
            <Text style={styles.bannerSubtitle}>Train with top-tier coaches and professional academies.</Text>
            <TouchableOpacity style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>FIND A COACH</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>

      {/* CATEGORIES */}
      <View style={styles.categoryRow}>
        <TouchableOpacity style={styles.categoryItem}>
          <View style={[styles.categoryIcon, { backgroundColor: 'rgba(0, 255, 0, 0.1)' }]}>
            <Users color="#00FF00" size={20} />
          </View>
          <Text style={styles.categoryText}>Personal</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryItem}>
          <View style={[styles.categoryIcon, { backgroundColor: 'rgba(255, 215, 0, 0.1)' }]}>
            <Users color="#FFD700" size={20} />
          </View>
          <Text style={styles.categoryText}>Academies</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryItem}>
          <View style={[styles.categoryIcon, { backgroundColor: 'rgba(0, 191, 255, 0.1)' }]}>
            <Dumbbell color="#00BFFF" size={20} />
          </View>
          <Text style={styles.categoryText}>Drills</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.categoryItem}>
          <View style={[styles.categoryIcon, { backgroundColor: 'rgba(255, 69, 0, 0.1)' }]}>
            <TrendingUp color="#FF4500" size={20} />
          </View>
          <Text style={styles.categoryText}>Analytics</Text>
        </TouchableOpacity>
      </View>

      {/* FEATURED COACHES */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Featured Coaches</Text>
        <TouchableOpacity><Text style={styles.seeAllText}>VIEW ALL</Text></TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
        {coaches.map((coach, index) => (
          <Animated.View entering={ZoomIn.duration(300)} exiting={ZoomOut.duration(200)}  
            key={coach.id}
            
            
            
            style={styles.coachCard}
          >
            <Image source={{ uri: coach.image }} style={styles.coachImage} />
            <View style={styles.coachInfo}>
              <Text style={styles.coachName}>{coach.name}</Text>
              <Text style={styles.coachRole}>{coach.role}</Text>
              <View style={styles.ratingRow}>
                <Star color="#FFD700" size={12} fill="#FFD700" />
                <Text style={styles.ratingText}>{coach.rating}</Text>
                <Text style={styles.expText}>• {coach.exp}</Text>
              </View>
              <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
                <Text style={styles.bookButtonText}>BOOK SESSION</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      {/* ACADEMIES NEAR YOU */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Top Academies</Text>
      </View>
      
      <View style={styles.academyCard}>
        <Image source={{ uri: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=500' }} style={styles.academyImage} />
        <View style={styles.academyContent}>
          <Text style={styles.academyName}>Elite Football Academy</Text>
          <View style={styles.academyDetailRow}>
            <MapPin color="#64748B" size={14} />
            <Text style={styles.academyDetailText}>Sindhu Bhavan Road • 2.5 km</Text>
          </View>
          <View style={styles.academyDetailRow}>
             <Text style={styles.academyPrice}>From ₹2000/mo</Text>
             <TouchableOpacity style={styles.viewAcademyButton}>
               <Text style={styles.viewAcademyText}>VIEW</Text>
             </TouchableOpacity>
          </View>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20 },
  
  // BANNER
  bannerContainer: { paddingHorizontal: 20, marginBottom: 25 },
  banner: { width: '100%', height: 180, justifyContent: 'center', backgroundColor: '#000' },
  bannerContent: { padding: 20 },
  bannerBadge: { backgroundColor: '#00FF00', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 10 },
  bannerBadgeText: { color: '#000', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  bannerTitle: { color: '#FFF', fontSize: 24, fontWeight: '900', marginBottom: 5 },
  bannerSubtitle: { color: '#CBD5E1', fontSize: 12, width: '80%', marginBottom: 15, lineHeight: 18 },
  bannerButton: { backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, alignSelf: 'flex-start' },
  bannerButtonText: { color: '#000', fontSize: 12, fontWeight: '800' },

  // CATEGORIES
  categoryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 30 },
  categoryItem: { alignItems: 'center', gap: 8 },
  categoryIcon: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  categoryText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },

  // SECTION HEADERS
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  seeAllText: { color: '#00FF00', fontSize: 12, fontWeight: '700' },

  // COACHES
  horizontalList: { paddingHorizontal: 20, paddingBottom: 20, gap: 15 },
  coachCard: { 
    width: 160, backgroundColor: '#1E293B', borderRadius: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  coachImage: { width: '100%', height: 120 },
  coachInfo: { padding: 12 },
  coachName: { color: '#FFF', fontSize: 14, fontWeight: '700', marginBottom: 2 },
  coachRole: { color: '#94A3B8', fontSize: 11, marginBottom: 6 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 },
  ratingText: { color: '#FFD700', fontSize: 11, fontWeight: '700' },
  expText: { color: '#64748B', fontSize: 11 },
  bookButton: { 
    backgroundColor: 'rgba(0, 255, 0, 0.1)', paddingVertical: 8, borderRadius: 8, 
    alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0, 255, 0, 0.2)' 
  },
  bookButtonText: { color: '#00FF00', fontSize: 10, fontWeight: '800' },

  // ACADEMY CARD
  academyCard: { 
    flexDirection: 'row', marginHorizontal: 20, backgroundColor: '#1E293B', borderRadius: 16, padding: 10, marginBottom: 30,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  academyImage: { width: 80, height: 80, borderRadius: 12 },
  academyContent: { flex: 1, marginLeft: 15, justifyContent: 'center' },
  academyName: { color: '#FFF', fontSize: 16, fontWeight: '700', marginBottom: 4 },
  academyDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6, justifyContent: 'space-between' },
  academyDetailText: { color: '#94A3B8', fontSize: 12 },
  academyPrice: { color: '#00FF00', fontSize: 14, fontWeight: '700' },
  viewAcademyButton: { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  viewAcademyText: { color: '#000', fontSize: 10, fontWeight: '800' }
});
