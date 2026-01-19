import React, { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Image, TextInput, Dimensions } from 'react-native';
import { Search, MapPin, Bell, Star, ChevronRight, Trophy } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: '1', name: 'Cricket', icon: '🏏' },
  { id: '2', name: 'Football', icon: '⚽' },
  { id: '3', name: 'Pickleball', icon: '🎾' },
  { id: '4', name: 'Badminton', icon: '🏸' },
];

export default function ArenaHomeScreen() {
  const [activeTab, setActiveTab] = useState('Book');

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* 1. TOP HEADER */}
      <View style={styles.topHeader}>
        <View style={styles.locationSection}>
          <View style={styles.locationRow}>
            <Text style={styles.locationTitle}>AHMEDABAD</Text>
            <ChevronRight color="#00FF00" size={16} />
          </View>
          <Text style={styles.areaText}>South Bopal, Gujarat</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconCircle}>
            <Bell color="#FFFFFF" size={20} />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* 2. TAB SELECTOR */}
        <View style={styles.tabContainer}>
          {['Play', 'Book', 'Train'].map((tab) => (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)}
              style={styles.tabItem}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              {activeTab === tab && (
                <MotiView 
                  from={{ width: 0 }} 
                  animate={{ width: 25 }} 
                  style={styles.activeUnderline} 
                />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* 3. SEARCH BAR */}
        <TouchableOpacity style={styles.searchContainer}>
          <Search color="#94A3B8" size={20} />
          <Text style={styles.searchPlaceholder}>Search for venues, sports...</Text>
        </TouchableOpacity>

        {/* 4. SPORT GRID */}
        <View style={styles.gridContainer}>
          {CATEGORIES.map((item, index) => (
            <MotiView 
              key={item.id}
              from={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 100, type: 'timing' }}
              style={styles.gridItemWrapper}
            >
              <TouchableOpacity style={styles.gridItem}>
                <Text style={styles.gridIcon}>{item.icon}</Text>
                <Text style={styles.gridText}>{item.name}</Text>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>

        {/* 5. OFFER BANNER */}
        <View style={styles.offerBanner}>
          <View style={styles.offerTextContent}>
            <Text style={styles.offerTitle}>EARN KARMA POINTS</Text>
            <Text style={styles.offerSub}>Get discounts on every booking</Text>
          </View>
          <Trophy color="#00FF00" size={32} />
        </View>

        {/* 6. NEARBY VENUES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Venues around you</Text>
          <TouchableOpacity><Text style={styles.seeAll}>VIEW ALL</Text></TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.venueScroll}>
          <VenueCard 
            title="Sardar Patel Stadium" 
            image="https://images.unsplash.com/photo-1593341646782-e0b495cff86d?q=80&w=500" 
            dist="2.5 km"
            rating="4.8"
          />
          <VenueCard 
            title="Apex Pickleball" 
            image="https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=500" 
            dist="1.2 km"
            rating="4.6"
          />
        </ScrollView>

      </ScrollView>
    </View>
  );
}

function VenueCard({ title, image, dist, rating }: any) {
  return (
    <TouchableOpacity style={styles.venueCard}>
      <Image source={{ uri: image }} style={styles.venueImage} />
      <View style={styles.venueInfo}>
        <Text style={styles.venueTitle} numberOfLines={1}>{title}</Text>
        <View style={styles.venueDetailRow}>
          <MapPin color="#94A3B8" size={12} />
          <Text style={styles.venueDetailText}>{dist}</Text>
          <View style={styles.dotSeparator} />
          <Star color="#00FF00" size={12} fill="#00FF00" />
          <Text style={styles.venueDetailText}>{rating}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#070A14' },
  topHeader: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  locationSection: { flex: 1 },
  locationTitle: { color: '#00FF00', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  areaText: { color: '#94A3B8', fontSize: 12, marginTop: 2 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
  badge: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF3B30', borderWidth: 1.5, borderColor: '#0F172A' },
  
  scrollContent: { paddingBottom: 100 },
  
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 20, gap: 30 },
  tabItem: { paddingBottom: 10, alignItems: 'center' },
  tabText: { color: '#94A3B8', fontSize: 18, fontWeight: '700' },
  activeTabText: { color: '#FFFFFF' },
  activeUnderline: { height: 3, backgroundColor: '#00FF00', marginTop: 5, borderRadius: 2 },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    gap: 12,
  },
  searchPlaceholder: { color: '#64748B', fontSize: 15 },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, marginBottom: 20 },
  gridItemWrapper: { width: '25%', padding: 5 },
  gridItem: { 
    backgroundColor: '#1E293B', 
    borderRadius: 16, 
    paddingVertical: 15, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  gridIcon: { fontSize: 24, marginBottom: 8 },
  gridText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', textAlign: 'center' },

  offerBanner: {
    backgroundColor: '#1E293B',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#00FF00'
  },
  offerTextContent: { flex: 1 },
  offerTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },
  offerSub: { color: '#94A3B8', fontSize: 12, marginTop: 4 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 10 },
  sectionTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', textTransform: 'uppercase' },
  seeAll: { color: '#00FF00', fontSize: 12, fontWeight: '800' },

  venueScroll: { paddingLeft: 20, paddingTop: 15 },
  venueCard: { width: 220, marginRight: 15, backgroundColor: '#1E293B', borderRadius: 20, overflow: 'hidden' },
  venueImage: { width: '100%', height: 120 },
  venueInfo: { padding: 12 },
  venueTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  venueDetailRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  venueDetailText: { color: '#94A3B8', fontSize: 11, marginLeft: 4 },
  dotSeparator: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#64748B', marginHorizontal: 8 },
});