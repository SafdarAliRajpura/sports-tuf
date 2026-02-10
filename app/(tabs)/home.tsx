import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ImageBackground, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// FIXED: Ensure useRouter is imported here
import { useUserLocation } from '@/hooks/useUserLocation';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { doc, getDoc } from 'firebase/firestore';
import { Bell, Calendar, ChevronRight, Flame, MapPin, Search, Star, Trophy, Users } from 'lucide-react-native';
import { MotiView } from 'moti';
import { auth, db } from '../config/firebase';

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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName((userData.fullName || 'Champion').split(' ')[0]);
            if (userData.avatar) setAvatar(userData.avatar);
          }
        }
      } catch (error) {
        console.error("Error fetching user for home:", error);
      }
    };
    fetchUser();
  }, []);

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

        {/* 2. LIVE STATUS BLOCK */}
        <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={styles.liveStatusCard}>
          <View style={styles.liveIndicatorRow}>
            <View style={styles.liveDot} />
            <Text style={styles.liveLabel}>ARENA STATUS: ACTIVE</Text>
          </View>
          <Text style={styles.liveTitle}>12 Matches being played right now in Ahmedabad</Text>
          <TouchableOpacity style={styles.joinButton}>
            <Text style={styles.joinButtonText}>JOIN A GAME</Text>
          </TouchableOpacity>
        </MotiView>

        {/* 3. TAB SELECTOR BLOCK */}
        <View style={styles.tabContainer}>
          {['Play', 'Book', 'Train'].map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={styles.tabItem}>
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              {activeTab === tab && <MotiView from={{ width: 0 }} animate={{ width: 25 }} style={styles.activeUnderline} />}
            </TouchableOpacity>
          ))}
        </View>

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
  container: { flex: 1, backgroundColor: '#070A14' },
  scrollContent: { paddingBottom: 120 },

  // --- HEADER BLOCKS ---
  topHeader: {
    paddingTop: 65, paddingBottom: 25, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#0F172A', borderBottomLeftRadius: 25, borderBottomRightRadius: 25,
  },
  locationSection: { flex: 1 },
  greetingText: { color: '#00FF00', fontSize: 18, fontWeight: '900', letterSpacing: 1, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  areaText: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconCircle: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  profileCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#00FF00', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%', backgroundColor: '#1E293B' },
  badge: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B30', borderWidth: 1.5, borderColor: '#0F172A' },

  // --- LIVE CARD BLOCKS ---
  liveStatusCard: {
    backgroundColor: '#1E293B', margin: 20, borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: 'rgba(0, 255, 0, 0.2)',
  },
  liveIndicatorRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#00FF00' },
  liveLabel: { color: '#00FF00', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  liveTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', lineHeight: 22, marginBottom: 15 },
  joinButton: { backgroundColor: '#00FF00', paddingVertical: 10, borderRadius: 12, alignItems: 'center' },
  joinButtonText: { color: '#000', fontWeight: '900', fontSize: 12 },

  // --- TAB SELECTOR BLOCKS ---
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 10, gap: 30 },
  tabItem: { paddingBottom: 10, alignItems: 'center' },
  tabText: { color: '#94A3B8', fontSize: 20, fontWeight: '800' },
  activeTabText: { color: '#FFFFFF' },
  activeUnderline: { height: 4, backgroundColor: '#00FF00', marginTop: 6, borderRadius: 2 },

  // --- SEARCH BLOCKS ---
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', margin: 20, padding: 16, borderRadius: 16, gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  searchPlaceholder: { color: '#64748B', fontSize: 15, fontWeight: '500' },

  // --- CATEGORY GRID BLOCKS ---
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, marginBottom: 15 },
  gridItemWrapper: { width: '25%', padding: 6 },
  gridItem: { backgroundColor: '#1E293B', borderRadius: 18, paddingVertical: 18, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  gridIcon: { fontSize: 26, marginBottom: 8 },
  gridText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800', textAlign: 'center', textTransform: 'uppercase' },

  // --- TRENDING BLOCKS ---
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  horizontalScroll: { paddingLeft: 20 },
  trendingCard: { width: 280, marginRight: 15, borderRadius: 20, overflow: 'hidden' },
  trendingImage: { width: '100%', height: 160, borderRadius: 20 },
  priceBadge: { position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.8)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  priceText: { color: '#00FF00', fontWeight: '900', fontSize: 12 },
  trendingTitle: { color: '#FFF', fontWeight: '800', fontSize: 14, marginTop: 10, marginLeft: 5 },

  // --- OFFER BANNER BLOCKS ---
  offerBanner: { backgroundColor: '#1E293B', marginHorizontal: 20, marginVertical: 30, borderRadius: 22, padding: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 5, borderLeftColor: '#00FF00' },
  offerContent: { flex: 1 },
  offerTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 17 },
  offerSubtitle: { color: '#94A3B8', fontSize: 12, marginTop: 6, fontWeight: '600' },

  // --- VENUE CARD BLOCKS ---
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginVertical: 15 },
  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  seeAllText: { color: '#00FF00', fontSize: 12, fontWeight: '800' },
  venueCard: { width: 240, marginRight: 18, backgroundColor: '#1E293B', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  venueImage: { width: '100%', height: 135 },
  venueInfo: { padding: 15 },
  venueTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },
  venueMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  venueMetaText: { color: '#94A3B8', fontSize: 12, marginLeft: 5, fontWeight: '600' },
  dotSeparator: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#475569', marginHorizontal: 10 },

  // --- TOURNAMENT BLOCKS ---
  tournamentCard: { marginHorizontal: 20, height: 180, marginBottom: 40 },
  tournamentBg: { flex: 1 },
  tournamentOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20, padding: 20, justifyContent: 'flex-end' },
  regBadge: { alignSelf: 'flex-start', backgroundColor: '#00FF00', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 10 },
  regBadgeText: { color: '#000', fontSize: 10, fontWeight: '900' },
  tournamentTitle: { color: '#FFF', fontSize: 20, fontWeight: '900', marginBottom: 10 },
  tournamentDetailRow: { flexDirection: 'row', alignItems: 'center' },
  tournamentDetailText: { color: '#FFF', fontSize: 12, fontWeight: '600', marginLeft: 6 },
});