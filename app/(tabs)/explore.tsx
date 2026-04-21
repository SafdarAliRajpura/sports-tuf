import React, { useState, useEffect } from 'react';
import Animated, { FadeInUp, FadeOut } from "react-native-reanimated";
import { StyleSheet, View, Text, FlatList, Image, TouchableOpacity, TextInput, Modal, Pressable } from 'react-native';
import { Search, MapPin, Star, SlidersHorizontal, X, Check, Target, IndianRupee } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useLocalSearchParams } from 'expo-router';
import apiClient from '../../src/api/apiClient';

const SPORTS_FILTERS = ['All', 'Cricket', 'Football', 'Pickleball', 'Badminton'];

export default function ExploreScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { category } = params; 
  
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSport, setSelectedSport] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (category && typeof category === 'string') {
      const matchedSport = SPORTS_FILTERS.find(s => s.toLowerCase() === category.toLowerCase());
      if (matchedSport) setSelectedSport(matchedSport);
    }
  }, [category]);

  useEffect(() => {
    const fetchVenues = async () => {
        try {
            const res = await apiClient.get('/api/venues');
            const formatted = res.data.data.map((v: any) => ({
                id: v._id,
                name: v.name,
                location: v.location || 'Ahmedabad',
                distance: v.distance || '1.2 km',
                rating: String(v.rating || 4.5),
                price: v.price,
                image: v.images && v.images.length > 0 ? v.images[0] : (v.image || 'https://images.unsplash.com/photo-1574629810360-7efbb1925713?q=80&w=500'),
                sports: v.sports && v.sports.length > 0 ? v.sports : ['Football']
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
    <Animated.View key={item.id} entering={FadeInUp.delay(index * 100).duration(400)} style={styles.cardContainer}>
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => router.push({
            pathname: "/venue/[id]",
            params: { 
                id: item.id,
                title: item.name,
                image: item.image,
                price: item.price,
                rating: item.rating
            } // SYNCED: Passing full payload for instant navigation
        })}
      >
        <Image source={{ uri: item.image }} style={styles.cardImage} />
        
        <View style={styles.cardTopOverlay}>
             <View style={styles.sportsBadgeRow}>
                {item.sports.map((s: string, idx: number) => (
                    <View key={idx} style={styles.sportBadgeSmall}>
                        <Text style={styles.sportBadgeTextSmall}>{s.toUpperCase()}</Text>
                    </View>
                ))}
             </View>
             <View style={styles.priceBadge}>
                <Text style={styles.priceText}>₹{item.price}/hr</Text>
             </View>
        </View>

        <View style={styles.cardOverlayGradient}>
            <View style={styles.cardFooter}>
                <View style={styles.infoCol}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <View style={styles.cardMeta}>
                        <MapPin color="#00FF00" size={14} />
                        <Text style={styles.metaText}>{item.location} • {item.distance}</Text>
                    </View>
                </View>
                <View style={styles.ratingBadge}>
                    <Star color="#FDB813" size={12} fill="#FDB813" />
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
      
      <View style={styles.header}>
        <View style={styles.topRow}>
            <Text style={styles.mainHeading}>Discover <Text style={styles.highlightText}>Arenas</Text></Text>
            <TouchableOpacity style={styles.filterBtn} onPress={() => setModalVisible(true)}>
              <SlidersHorizontal color="#FFF" size={20} />
              {selectedSport !== 'All' && <View style={styles.filterDot} />}
            </TouchableOpacity>
        </View>

        <View style={styles.searchBar}>
          <Search color="#64748B" size={20} />
          <TextInput placeholder="Search venues, areas or sports..." placeholderTextColor="#64748B" style={styles.searchInput} value={searchQuery} onChangeText={setSearchQuery} />
          {searchQuery.length > 0 && (<TouchableOpacity onPress={() => setSearchQuery('')}><X color="#94A3B8" size={16} /></TouchableOpacity>)}
        </View>
      </View>

      <FlatList
        data={filteredVenues}
        renderItem={renderVenue}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>{loading ? "Searching..." : "No arenas found matching your criteria."}</Text></View>}
      />

      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalTitle}>Filter by Sport</Text><TouchableOpacity onPress={() => setModalVisible(false)}><X color="#FFFFFF" size={24} /></TouchableOpacity></View>
            <View style={styles.filterGrid}>
              {SPORTS_FILTERS.map((sport) => (
                <TouchableOpacity key={sport} style={[styles.filterOption, selectedSport === sport && styles.activeOption]} onPress={() => { setSelectedSport(sport); setModalVisible(false); }}>
                  <Text style={[styles.filterOptionText, selectedSport === sport && styles.activeOptionText]}>{sport}</Text>
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
  cardContainer: { marginBottom: 25 },
  card: { height: 240, borderRadius: 30, overflow: 'hidden', elevation: 10, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 15 },
  cardImage: { width: '100%', height: '100%' },
  
  cardTopOverlay: { position: 'absolute', top: 15, left: 15, right: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sportsBadgeRow: { flexDirection: 'row', gap: 6 },
  sportBadgeSmall: { backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,255,0,0.3)' },
  sportBadgeTextSmall: { color: '#00FF00', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  
  priceBadge: { backgroundColor: '#00FF00', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  priceText: { color: '#000', fontSize: 11, fontWeight: '900' },
  
  cardOverlayGradient: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end', padding: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  infoCol: { flex: 1 },
  cardTitle: { color: '#FFF', fontSize: 22, fontWeight: '900', marginBottom: 6 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#E2E8F0', fontSize: 13, fontWeight: '700' },
  
  ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(253,184,19,0.3)' },
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