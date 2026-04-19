import React, { useState, useEffect } from 'react';
import Animated, { FadeInUp, FadeOut } from "react-native-reanimated";
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, TextInput, Modal, Pressable } from 'react-native';
import { Search, MapPin, Star, SlidersHorizontal, X, Check, Target, IndianRupee } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import apiClient from '../../src/api/apiClient';

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
            const res = await apiClient.get('/api/venues');
            const formatted = res.data.data.map((v: any) => ({
                id: v._id,
                name: v.name,
                location: v.location || 'Ahmedabad',
                distance: '1.2 km',
                rating: String(v.rating || 4.5),
                price: v.price,
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

  const renderVenue = ({ item, index }: { item: any, index: number }) => (
    <Animated.View entering={FadeInUp.delay(index * 100).duration(400)} style={styles.cardContainer}>
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => router.push({
            pathname: "/venue/[id]",
            params: { id: item.id }
        })}
      >
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        <View style={styles.cardOverlay}>
            <View style={styles.cardHeader}>
                <View style={styles.categoryBadge}>
                    <Target color="#00FF00" size={12} />
                    <Text style={styles.categoryText}>{item.sports[0]}</Text>
                </View>
                <View style={styles.priceBadge}>
                    <Text style={styles.priceText}>₹{item.price}/hr</Text>
                </View>
            </View>
            
            <View style={styles.cardFooter}>
                <View style={styles.infoCol}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <View style={styles.cardMeta}>
                        <MapPin color="#FFF" size={14} />
                        <Text style={styles.metaText}>{item.location} • {item.distance}</Text>
                    </View>
                </View>
                <View style={styles.ratingBadge}>
                    <Star color="#FFD700" size={12} fill="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
            </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View style={styles.topRow}>
            <Text style={styles.mainHeading}>Discover <Text style={styles.highlightText}>Arenas</Text></Text>
            <TouchableOpacity 
              style={styles.filterBtn} 
              onPress={() => setModalVisible(true)}
            >
              <SlidersHorizontal color="#FFF" size={20} />
              {selectedSport !== 'All' && <View style={styles.filterDot} />}
            </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Search color="#64748B" size={20} />
          <TextInput 
            placeholder="Search venues, areas or sports..." 
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
      </View>

      <FlatList
        data={filteredVenues}
        renderItem={renderVenue}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                    {loading ? "Searching for the best arenas..." : "No arenas found matching your criteria."}
                </Text>
            </View>
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
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter by Sport</Text>
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
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090E1A' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 25, backgroundColor: '#0F172A', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  mainHeading: { color: '#FFF', fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  highlightText: { color: '#00FF00' },
  searchBar: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 16, alignItems: 'center', paddingHorizontal: 15, height: 55, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  searchInput: { color: '#FFFFFF', flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '500' },
  filterBtn: { width: 50, height: 50, backgroundColor: '#1E293B', borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  filterDot: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#00FF00', borderWidth: 2, borderColor: '#1E293B' },
  
  listContainer: { padding: 20, paddingBottom: 100 },
  cardContainer: { marginBottom: 20 },
  card: { height: 220, borderRadius: 25, overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 15 },
  cardImage: { width: '100%', height: '100%' },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)', padding: 20, justifyContent: 'space-between' },
  
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(0,255,0,0.3)' },
  categoryText: { color: '#FFF', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  priceBadge: { backgroundColor: '#00FF00', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  priceText: { color: '#000', fontSize: 11, fontWeight: '900' },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  infoCol: { flex: 1 },
  cardTitle: { color: '#FFF', fontSize: 24, fontWeight: '900', marginBottom: 6, textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#E2E8F0', fontSize: 13, fontWeight: '700' },
  
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)' },
  ratingText: { color: '#FFF', fontWeight: '800', fontSize: 13 },
  
  emptyContainer: { marginTop: 100, alignItems: 'center' },
  emptyText: { color: '#94A3B8', textAlign: 'center', fontSize: 15, fontWeight: '600' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#131C31', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 30, minHeight: 450 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 35 },
  modalTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  filterGrid: { gap: 12 },
  filterOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)', padding: 20, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  activeOption: { backgroundColor: 'rgba(0, 255, 0, 0.05)', borderColor: '#00FF00' },
  filterOptionText: { color: '#94A3B8', fontSize: 16, fontWeight: '700' },
  activeOptionText: { color: '#FFFFFF' }
});