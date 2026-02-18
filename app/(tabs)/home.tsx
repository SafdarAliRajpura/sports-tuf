import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// FIXED: Ensure useRouter is imported here
import { useUserLocation } from '@/hooks/useUserLocation';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Bell, Calendar, ChevronRight, Crown, Flame, MapPin, Medal, Search, Star, Trophy, Users } from 'lucide-react-native';
import { MotiView } from 'moti';
import PlayTab from '../../components/home/PlayTab';
import TrainTab from '../../components/train/TrainTab';
// import { auth, db } from '../config/firebase';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: '1', name: 'Cricket', icon: '🏏' },
  { id: '2', name: 'Football', icon: '⚽' },
  { id: '3', name: 'Pickleball', icon: '🎾' },
  { id: '4', name: 'Badminton', icon: '🏸' },
];

export default function ArenaHomeScreen() {
  // FIXED: Initialize router inside the component
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Book');
  const [userName, setUserName] = useState('Champion');
  const [avatar, setAvatar] = useState('https://api.dicebear.com/7.x/avataaars/png?seed=Felix');

  const { location, errorMsg, loading: locationLoading } = useUserLocation();

  useFocusEffect(
    React.useCallback(() => {
      const loadUser = async () => {
        try {
          const userData = await AsyncStorage.getItem('userInfo');
          if (userData) {
            const user = JSON.parse(userData);
            setUserName(user.fullName || 'Champion');
            setAvatar(user.avatar || 'https://api.dicebear.com/7.x/avataaars/png?seed=Felix');
          }
        } catch (e) {
          console.error("Failed to load user info", e);
        }
      };
      loadUser();
    }, [])
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* 1. TOP HEADER BLOCK */}
      <View style={styles.topHeader}>
        <View style={styles.locationSection}>
          <Text style={styles.greetingText}>HELLO, {userName.toUpperCase()}!</Text>
          <View style={styles.locationRow}>
            <MapPin color="#00FF00" size={14} />
            <Text style={styles.areaText}>
              {locationLoading ? 'Locating...' : (location?.address?.formatted || 'Location Unavailable')}
            </Text>
            <ChevronRight color="#00FF00" size={14} />
          </View>
        </View>

        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconCircle}>
            <Bell color="#FFFFFF" size={20} />
            <View style={styles.badge} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileCircle}>
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>



        {/* 3. TAB SELECTOR BLOCK */}
        <View style={styles.tabContainer}>
          {['Play', 'Book', 'Train'].map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={styles.tabItem}>
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              {activeTab === tab && <MotiView from={{ width: 0 }} animate={{ width: 25 }} style={styles.activeUnderline} />}
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'Play' ? (
           <PlayTab />
        ) : activeTab === 'Train' ? (
           <TrainTab />
        ) : (
          <>
            {/* 4. SEARCH BLOCK */}
            <TouchableOpacity style={styles.searchContainer}>
              <Search color="#94A3B8" size={20} />
              <Text style={styles.searchPlaceholder}>Search for venues, sports...</Text>
            </TouchableOpacity>

            {/* 5. SPORT GRID BLOCK */}
            <View style={styles.gridContainer}>
              {CATEGORIES.map((item, index) => (
                <MotiView key={item.id} from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: index * 100 }} style={styles.gridItemWrapper}>
                  <TouchableOpacity style={styles.gridItem}>
                    <Text style={styles.gridIcon}>{item.icon}</Text>
                    <Text style={styles.gridText}>{item.name}</Text>
                  </TouchableOpacity>
                </MotiView>
              ))}
            </View>

            {/* 5.5 NEW PREMIUM SECTION: SEASON LEADERBOARD */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Crown color="#FFD700" size={20} fill="#FFD700" />
                <Text style={styles.sectionTitle}>Season Leaderboard</Text>
              </View>
              <TouchableOpacity><Text style={styles.seeAllText}>FULL RANKINGS</Text></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              <PlayerCard 
                rank={1} 
                name="Alex 'The Jet'" 
                points="2,450" 
                avatar="https://api.dicebear.com/7.x/avataaars/png?seed=Felix" 
                tag="MVP"
              />
              <PlayerCard 
                rank={2} 
                name="Sarah Strike" 
                points="2,120" 
                avatar="https://api.dicebear.com/7.x/avataaars/png?seed=Aneka" 
                tag="PRO"
              />
              <PlayerCard 
                rank={3} 
                name="Mike Defense" 
                points="1,980" 
                avatar="https://api.dicebear.com/7.x/avataaars/png?seed=Max" 
              />
            </ScrollView>
    
            {/* 6. TRENDING SECTION BLOCK */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Flame color="#FF4500" size={20} fill="#FF4500" />
                <Text style={styles.sectionTitle}>Trending in Ahmedabad</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              <TrendingCard title="Decathlon Sports Park" price="₹800" image="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=500" rating="4.9" />
              <TrendingCard title="Kick Off Turf" price="₹1200" image="https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=500" rating="4.7" />
            </ScrollView>
    
            {/* 7. OFFER BLOCK */}
            <View style={styles.offerBanner}>
              <View style={styles.offerContent}>
                <Text style={styles.offerTitle}>EARN KARMA POINTS</Text>
                <Text style={styles.offerSubtitle}>Get discounts on every booking</Text>
              </View>
              <Trophy color="#00FF00" size={32} />
            </View>
    
            {/* 8. NEARBY VENUES BLOCK */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Venues around you</Text>
              <TouchableOpacity><Text style={styles.seeAllText}>VIEW ALL</Text></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              <VenueCard title="Sardar Patel Stadium" image="https://images.unsplash.com/photo-1593341646782-e0b495cff86d?q=80&w=500" dist="2.5 km" rating="4.8" price="₹1500" />
              <VenueCard title="Apex Pickleball" image="https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=500" dist="1.2 km" rating="4.6" price="₹600" />
            </ScrollView>
    
            {/* 9. TOURNAMENT BLOCK */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Elite Tournaments</Text>
            </View>
            <TouchableOpacity style={styles.tournamentCard}>
              <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800' }} style={styles.tournamentBg} imageStyle={{ borderRadius: 20 }}>
                <View style={styles.tournamentOverlay}>
                  <View style={styles.regBadge}><Text style={styles.regBadgeText}>REGISTRATION OPEN</Text></View>
                  <Text style={styles.tournamentTitle}>Ahmedabad Football League 2026</Text>
                  <View style={styles.tournamentDetailRow}>
                    <Calendar color="#00FF00" size={14} />
                    <Text style={styles.tournamentDetailText}>Starts 15 Feb</Text>
                    <Users color="#00FF00" size={14} style={{ marginLeft: 15 }} />
                    <Text style={styles.tournamentDetailText}>16 Teams</Text>
                  </View>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          </>
        )}

      </ScrollView>
    </View>
  );
}

// SHARED COMPONENTS WITH NAVIGATION
function VenueCard({ title, image, dist, rating, price }: any) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.venueCard}
      onPress={() => router.push({
        pathname: "/venue/[id]",
        params: { id: title, title, image, price, rating }
      })}
    >
      <Image source={{ uri: image }} style={styles.venueImage} />
      <View style={styles.venueInfo}>
        <Text style={styles.venueTitle} numberOfLines={1}>{title}</Text>
        <View style={styles.venueMetaRow}>
          <MapPin color="#94A3B8" size={12} />
          <Text style={styles.venueMetaText}>{dist}</Text>
          <View style={styles.dotSeparator} />
          <Star color="#00FF00" size={12} fill="#00FF00" />
          <Text style={styles.venueMetaText}>{rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function TrendingCard({ title, image, price, rating }: any) {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={styles.trendingCard}
      onPress={() => router.push({
        pathname: "/venue/[id]",
        params: { id: title, title, image, price, rating }
      })}
    >
      <Image source={{ uri: image }} style={styles.trendingImage} />
      <View style={styles.priceBadge}><Text style={styles.priceText}>{price}/hr</Text></View>
      <Text style={styles.trendingTitle}>{title}</Text>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  // --- CORE BLOCKS ---
  container: { flex: 1, backgroundColor: '#090E1A' }, // Slightly darker, richer background
  scrollContent: { paddingBottom: 120 },

  // --- HEADER BLOCKS ---
  topHeader: {
    paddingTop: 65, paddingBottom: 25, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#0F172A', 
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30, // More rounded
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10, // Added shadow
  },
  locationSection: { flex: 1 },
  greetingText: { color: '#00FF00', fontSize: 20, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 }, // Slightly larger
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  areaText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 15 }, // Increased gap
  iconCircle: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }, // Translucent background
  profileCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#00FF00', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%', backgroundColor: '#1E293B' },
  badge: { position: 'absolute', top: 10, right: 10, width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF3B30', borderWidth: 2, borderColor: '#0F172A' }, // Adjusted position and border

  // --- LIVE CARD BLOCKS ---
  liveStatusCard: {
    backgroundColor: '#131C31', // Slightly different dark shade
    margin: 20, borderRadius: 24, padding: 24, // Increased padding
    borderWidth: 1, borderColor: 'rgba(0, 255, 0, 0.15)',
    shadowColor: '#00FF00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5, // Green glow
  },
  liveIndicatorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00FF00', shadowColor: '#00FF00', shadowOpacity: 1, shadowRadius: 5 }, // Glowing dot
  liveLabel: { color: '#00FF00', fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  liveTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', lineHeight: 26, marginBottom: 20 }, // Larger title
  joinButton: { backgroundColor: '#00FF00', paddingVertical: 14, borderRadius: 16, alignItems: 'center', shadowColor: '#00FF00', shadowOpacity: 0.4, shadowRadius: 10 }, // Taller button with refined shadow
  joinButtonText: { color: '#090E1A', fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },

  // --- TAB SELECTOR BLOCKS ---
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 10, gap: 35 },
  tabItem: { paddingBottom: 10, alignItems: 'center' },
  tabText: { color: '#64748B', fontSize: 18, fontWeight: '600' }, // Softer inactive color
  activeTabText: { color: '#FFFFFF', fontWeight: '800' },
  activeUnderline: { height: 4, backgroundColor: '#00FF00', marginTop: 6, borderRadius: 2, shadowColor: '#00FF00', shadowOpacity: 0.8, shadowRadius: 8 }, // Glowing line

  // --- SEARCH BLOCKS ---
  searchContainer: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#131C31', 
    margin: 20, padding: 18, borderRadius: 20, gap: 14, 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' 
  },
  searchPlaceholder: { color: '#64748B', fontSize: 15, fontWeight: '500' },

  // --- CATEGORY GRID BLOCKS ---
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, marginBottom: 20 },
  gridItemWrapper: { width: '25%', padding: 8 }, // More padding
  gridItem: { 
    backgroundColor: '#131C31', borderRadius: 20, paddingVertical: 20, alignItems: 'center', 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  gridIcon: { fontSize: 28, marginBottom: 10 },
  gridText: { color: '#E2E8F0', fontSize: 11, fontWeight: '700', textAlign: 'center', letterSpacing: 0.5 },

  // --- TRENDING BLOCKS ---
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  horizontalScroll: { paddingLeft: 20, paddingRight: 20 }, // Added right padding
  trendingCard: { width: 280, marginRight: 20, borderRadius: 24, overflow: 'hidden', backgroundColor: '#131C31', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' }, // Added background and border
  trendingImage: { width: '100%', height: 170, borderRadius: 24 }, // Taller image
  priceBadge: { 
    position: 'absolute', top: 15, right: 15, 
    backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', // Glassmorphism attempt (works on some versions)
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,255,0,0.3)' 
  },
  priceText: { color: '#00FF00', fontWeight: '800', fontSize: 13 },
  trendingTitle: { color: '#FFF', fontWeight: '700', fontSize: 16, marginTop: 12, marginLeft: 12, marginBottom: 12 },

  // --- OFFER BANNER BLOCKS ---
  offerBanner: { 
    backgroundColor: '#131C31', marginHorizontal: 20, marginVertical: 30, borderRadius: 24, padding: 24, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    borderLeftWidth: 4, borderLeftColor: '#00FF00',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 6
  },
  offerContent: { flex: 1 },
  offerTitle: { color: '#FFFFFF', fontWeight: '800', fontSize: 18, letterSpacing: 0.5 },
  offerSubtitle: { color: '#94A3B8', fontSize: 13, marginTop: 8, fontWeight: '500', lineHeight: 18 },

  // --- VENUE CARD BLOCKS ---
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 15 }, // Adjusted spacing
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  seeAllText: { color: '#00FF00', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  venueCard: { 
    width: 250, marginRight: 20, 
    backgroundColor: '#131C31', borderRadius: 24, overflow: 'hidden', 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4
  },
  venueImage: { width: '100%', height: 150 }, // Taller image
  venueInfo: { padding: 18 },
  venueTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  venueMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  venueMetaText: { color: '#94A3B8', fontSize: 13, marginLeft: 6, fontWeight: '500' },
  dotSeparator: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#475569', marginHorizontal: 8 },

  // --- TOURNAMENT BLOCKS ---
  tournamentCard: { marginHorizontal: 20, height: 200, marginBottom: 40, borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 }, // Taller card, rounded, shadowed
  tournamentBg: { flex: 1 },
  tournamentOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', padding: 24, justifyContent: 'flex-end' }, // Darker overlay for text contrast
  regBadge: { alignSelf: 'flex-start', backgroundColor: '#00FF00', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginBottom: 12 },
  regBadgeText: { color: '#090E1A', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  tournamentTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 12, lineHeight: 28 }, // Larger title
  tournamentDetailRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }, // Added background for readability
  tournamentDetailText: { color: '#E2E8F0', fontSize: 12, fontWeight: '600', marginLeft: 6 },

  // --- PLAYER CARD BLOCKS (NEW) ---
  playerCard: {
    width: 140,
    backgroundColor: '#131C31',
    borderRadius: 20,
    padding: 15,
    marginRight: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5
  },
  rankBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  rankText: { fontSize: 12, fontWeight: '900', color: '#000' },
  playerAvatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#0F172A'
  },
  playerName: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4
  },
  playerPoints: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 12
  },
  challengeButton: {
    width: '100%',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.3)',
    alignItems: 'center'
  },
  challengeText: {
    color: '#00FF00',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5
  }
});

function PlayerCard({ rank, name, points, avatar, tag }: any) {
  const getRankColor = (r: number) => {
    if (r === 1) return '#FFD700'; // Gold
    if (r === 2) return '#C0C0C0'; // Silver
    if (r === 3) return '#CD7F32'; // Bronze
    return '#64748B';
  };

  const rankColor = getRankColor(rank);

  return (
    <TouchableOpacity style={styles.playerCard}>
      {/* Rank Badge */}
      <View style={[styles.rankBadge, { backgroundColor: rankColor }]}>
        <Text style={styles.rankText}>{rank}</Text>
      </View>
      
      {/* Avatar with rank border */}
      <Image source={{ uri: avatar }} style={[styles.playerAvatar, { borderColor: rankColor }]} />
      
      <Text style={styles.playerName} numberOfLines={1}>{name}</Text>
      <Text style={styles.playerPoints}>{points} KP</Text>
      
      {tag && (
        <View style={{ position: 'absolute', top: 10, left: 10, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: tag === 'MVP' ? '#FFD700' : '#3B82F6', borderRadius: 4 }}>
          <Text style={{ color: '#000', fontSize: 8, fontWeight: '900' }}>{tag}</Text>
        </View>
      )}

      <TouchableOpacity style={styles.challengeButton}>
        <Text style={styles.challengeText}>CHALLENGE</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}