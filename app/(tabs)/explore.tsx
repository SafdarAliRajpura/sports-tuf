import React, { useState, useEffect } from 'react';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut, SlideInUp, SlideOutDown, FadeInLeft, FadeInRight, FadeInUp, FadeInDown } from "react-native-reanimated";
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, TextInput, Modal, Pressable } from 'react-native';
import { Search, MapPin, Star, SlidersHorizontal, X, Check } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import api from '../../config/api';

const SPORTS_FILTERS = ['All', 'Cricket', 'Football', 'Pickleball', 'Badminton'];

export default function ExploreScreen() {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSport, setSelectedSport] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenues = async () => {
        try {
            const res = await api.get('/venues');
            
            // Format API data to match the component's needs
            const formatted = res.data.map((v: any) => ({
                id: v._id,
                name: v.name,
                location: v.location || 'Ahmedabad',
                distance: '1.2 km', // Mock distance
                rating: String(v.rating || 4.5),
                price: `₹${v.price}/hr`,
                image: v.images && v.images.length > 0 ? v.images[0] : (v.image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=500'),
                sports: [v.sport || 'Football']
            }));
            
            setVenues(formatted);
        } catch (error) {
            console.error('Error fetching venues:', error);
        } finally {
            setLoading(false);
        }
    };
    fetchVenues();
  }, []);

  const filteredVenues = venues.filter(v => {
    const matchesSport = selectedSport === 'All' || v.sports.includes(selectedSport);
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSport && matchesSearch;
  });

  const renderVenue = ({ item }: { item: any }) => (
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
        {item.sports.map((s: string, i: number) => (
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
          <TouchableOpacity 
            style={styles.bookBtn}
            onPress={() => router.push({
                pathname: "/venue/[id]",
                params: { id: item.id, title: item.name, image: item.image, rating: item.rating }
            })}
          >
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
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X color="#94A3B8" size={16} />
            </TouchableOpacity>
          )}
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
        ListEmptyComponent={
            <Text style={{ color: '#94A3B8', textAlign: 'center', marginTop: 50 }}>
                {loading ? "Loading arenas..." : "No arenas found matching your criteria."}
            </Text>
        }
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