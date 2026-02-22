import React, { useState } from 'react';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut, SlideInUp, SlideOutDown, FadeInLeft, FadeInRight, FadeInUp, FadeInDown } from "react-native-reanimated";
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, TextInput, Modal, Pressable } from 'react-native';
import { Search, MapPin, Star, SlidersHorizontal, X, Check } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

const SPORTS_FILTERS = ['All', 'Cricket', 'Football', 'Pickleball', 'Badminton'];

const MOCK_VENUES = [
  { 
    id: '1', 
    name: 'Thunderbolt Arena', 
    location: 'Satellite, Ahmedabad', 
    distance: '1.2 km', 
    rating: '4.8', 
    price: '₹800/hr', 
    image: 'https://picsum.photos/id/102/800/600', 
    sports: ['Football', 'Cricket'] 
  },
  { 
    id: '2', 
    name: 'Skyline Sports Hub', 
    location: 'Prahlad Nagar', 
    distance: '2.5 km', 
    rating: '4.5', 
    price: '₹600/hr', 
    image: 'https://picsum.photos/id/73/800/600', 
    sports: ['Pickleball'] 
  },
  { 
    id: '3', 
    name: 'Ace Badminton Club', 
    location: 'Bopal, Ahmedabad', 
    distance: '0.8 km', 
    rating: '4.9', 
    price: '₹400/hr', 
    image: 'https://picsum.photos/id/43/800/600', 
    sports: ['Badminton'] 
  },
];

export default function ExploreScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSport, setSelectedSport] = useState('All');

  const filteredVenues = selectedSport === 'All' 
    ? MOCK_VENUES 
    : MOCK_VENUES.filter(v => v.sports.includes(selectedSport));

  const renderVenue = ({ item }: { item: typeof MOCK_VENUES[0] }) => (
    <Animated.View entering={FadeInUp.duration(300)} exiting={FadeOut.duration(200)}  
       
       
      style={styles.venueCard}
    >
      <Image 
        source={{ uri: item.image }} 
        style={styles.venueImage} 
        resizeMode="cover" 
        onLoad={() => console.log(`Image loaded: ${item.name}`)}
        onError={(e) => console.log(`Image error: ${item.name}`, e.nativeEvent.error)}
      />
      <View style={styles.badgeContainer}>
        {item.sports.map((s, i) => (
          <View key={i} style={styles.sportBadge}>
            <Text style={styles.sportBadgeText}>{s}</Text>
          </View>
        ))}
      </View>
      <View style={styles.cardContent}>
        <View style={styles.rowBetween}>
          <Text style={styles.venueName}>{item.name}</Text>
          <View style={styles.ratingBox}>
            <Star color="#00FF00" size={12} fill="#00FF00" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        <View style={styles.locationRow}>
          <MapPin color="#94A3B8" size={14} />
          <Text style={styles.locationText}>{item.location} • {item.distance}</Text>
        </View>
        <View style={[styles.rowBetween, styles.footerRow]}>
          <Text style={styles.priceText}>{item.price}</Text>
          <TouchableOpacity style={styles.bookBtn}>
            <Text style={styles.bookBtnText}>BOOK NOW</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Search color="#64748B" size={20} />
          <TextInput 
            placeholder="Search venues..." 
            placeholderTextColor="#64748B" 
            style={styles.searchInput} 
          />
        </View>
        <TouchableOpacity 
          style={styles.filterBtn} 
          onPress={() => setModalVisible(true)}
        >
          <SlidersHorizontal color="#00FF00" size={20} />
          {selectedSport !== 'All' && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredVenues}
        renderItem={renderVenue}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={<Text style={styles.resultsTitle}>{selectedSport} Arenas</Text>}
      />

      <Modal 
        animationType="slide" 
        transparent={true} 
        visible={modalVisible} 
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setModalVisible(false)}
        >
          <Animated.View entering={FadeInUp.duration(300)} exiting={FadeOut.duration(200)}  
             
             
            style={styles.modalContent}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Sport</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color="#FFFFFF" size={24} />
              </TouchableOpacity>
            </View>
            <View style={styles.filterGrid}>
              {SPORTS_FILTERS.map((sport) => (
                <TouchableOpacity 
                  key={sport} 
                  style={[
                    styles.filterOption, 
                    selectedSport === sport && styles.activeOption
                  ]}
                  onPress={() => { setSelectedSport(sport); setModalVisible(false); }}
                >
                  <Text 
                    style={[
                      styles.filterOptionText, 
                      selectedSport === sport && styles.activeOptionText
                    ]}
                  >
                    {sport}
                  </Text>
                  {selectedSport === sport && <Check color="#00FF00" size={16} />}
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#070A14' 
  },
  header: { 
    paddingTop: 60, 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    gap: 12, 
    paddingBottom: 20, 
    backgroundColor: '#0F172A' 
  },
  searchBar: { 
    flex: 1, 
    flexDirection: 'row', 
    backgroundColor: '#1E293B', 
    borderRadius: 12, 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    height: 50 
  },
  searchInput: { 
    color: '#FFFFFF', 
    flex: 1, 
    marginLeft: 10 
  },
  filterBtn: { 
    width: 50, 
    height: 50, 
    backgroundColor: '#1E293B', 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  filterDot: { 
    position: 'absolute', 
    top: 12, 
    right: 12, 
    width: 8, 
    height: 8, 
    borderRadius: 4, 
    backgroundColor: '#00FF00' 
  },
  listContainer: { 
    padding: 20, 
    paddingBottom: 100 
  },
  resultsTitle: { 
    color: '#FFFFFF', 
    fontSize: 18, 
    fontWeight: '900', 
    marginBottom: 20 
  },
  venueCard: { 
    backgroundColor: '#1E293B', 
    borderRadius: 20, 
    overflow: 'hidden', 
    marginBottom: 25 
  },
  venueImage: { 
    width: '100%', 
    height: 180, 
    backgroundColor: '#1E293B' 
  },
  badgeContainer: { 
    position: 'absolute', 
    top: 15, 
    left: 15, 
    flexDirection: 'row', 
    gap: 8 
  },
  sportBadge: { 
    backgroundColor: 'rgba(0, 0, 0, 0.7)', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: '#00FF00' 
  },
  sportBadgeText: { 
    color: '#00FF00', 
    fontSize: 10, 
    fontWeight: 'bold' 
  },
  cardContent: { 
    padding: 15 
  },
  rowBetween: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  venueName: { 
    color: '#FFFFFF', 
    fontSize: 18, 
    fontWeight: '800' 
  },
  ratingBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    backgroundColor: 'rgba(0, 255, 0, 0.1)', 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 6 
  },
  ratingText: { 
    color: '#00FF00', 
    fontWeight: 'bold' 
  },
  locationRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    marginTop: 8 
  },
  locationText: { 
    color: '#94A3B8', 
    fontSize: 13 
  },
  footerRow: { 
    marginTop: 15, 
    paddingTop: 15, 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.1)' 
  },
  priceText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '900' 
  },
  bookBtn: { 
    backgroundColor: '#00FF00', 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 10 
  },
  bookBtnText: { 
    color: '#000000', 
    fontWeight: '900', 
    fontSize: 12 
  },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.7)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    backgroundColor: '#1E293B', 
    borderTopLeftRadius: 30, 
    borderTopRightRadius: 30, 
    padding: 25, 
    minHeight: 400 
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 30 
  },
  modalTitle: { 
    color: '#FFFFFF', 
    fontSize: 20, 
    fontWeight: '900' 
  },
  filterGrid: { 
    gap: 12 
  },
  filterOption: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    padding: 18, 
    borderRadius: 15 
  },
  activeOption: { 
    backgroundColor: 'rgba(0, 255, 0, 0.08)', 
    borderWidth: 1, 
    borderColor: '#00FF00' 
  },
  filterOptionText: { 
    color: '#94A3B8', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  activeOptionText: { 
    color: '#FFFFFF' 
  }
});