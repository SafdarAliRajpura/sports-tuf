import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView, Image } from 'react-native';
import { X, Search, Filter, MapPin, Star, ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import api from '../../config/api'; // Ensure this exists for real API calls

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
}

const FILTERS = ['All', 'Football', 'Cricket', 'Pickleball', 'Badminton'];

export default function SearchModal({ visible, onClose }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock Data for "Recent Searches" or "Trending"
  const RECENT_SEARCHES = ['Kick Off Turf', 'Sardar Patel Stadium', 'Apex Pickleball'];

  useEffect(() => {
    if (query.length > 2) {
      handleSearch();
    } else {
      setResults([]);
    }
  }, [query, activeFilter]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Replace with real backend call: /venues/search?q={query}&sport={activeFilter}
      // Simulating API delay and response for now unless backend is ready
      // const res = await api.get(`/venues/search?q=${query}&sport=${activeFilter}`);
      // setResults(res.data);
      
      // MOCK LOGIC for demo
      setTimeout(() => {
        const mockResults = [
            { id: '1', title: 'Kick Off Turf', sport: 'Football', rating: 4.8, dist: '2.5 km', image: 'https://images.unsplash.com/photo-1529900748604-07564a03e7a6?q=80&w=500' },
            { id: '2', title: 'Box Cricket Arena', sport: 'Cricket', rating: 4.5, dist: '3.0 km', image: 'https://images.unsplash.com/photo-1593341646782-e0b495cff86d?q=80&w=500' },
            { id: '3', title: 'Smash Badminton', sport: 'Badminton', rating: 4.6, dist: '1.2 km', image: 'https://images.unsplash.com/photo-1626224583764-847890e058f5?q=80&w=500' },
        ].filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase()) && 
            (activeFilter === 'All' || item.sport === activeFilter)
        );
        setResults(mockResults);
        setLoading(false);
      }, 500);

    } catch (error) {
      console.log('Search error:', error);
      setLoading(false);
    }
  };

  const navigateToVenue = (venue: any) => {
    onClose();
    router.push({
        pathname: "/venue/[id]",
        params: { id: venue.title, title: venue.title, image: venue.image, rating: venue.rating }
    });
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <ChevronLeft color="#FFF" size={24} />
            </TouchableOpacity>
            <View style={styles.searchBar}>
                <Search color="#94A3B8" size={20} />
                <TextInput 
                    style={styles.searchInput}
                    placeholder="Search venues, sports..."
                    placeholderTextColor="#64748B"
                    autoFocus
                    value={query}
                    onChangeText={setQuery}
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => setQuery('')}>
                        <X color="#94A3B8" size={18} />
                    </TouchableOpacity>
                )}
            </View>
        </View>

        {/* FILTERS */}
        <View style={styles.filterSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                {FILTERS.map(f => (
                    <TouchableOpacity 
                        key={f} 
                        style={[styles.filterChip, activeFilter === f && styles.activeFilterChip]}
                        onPress={() => setActiveFilter(f)}
                    >
                        <Text style={[styles.filterText, activeFilter === f && styles.activeFilterText]}>{f}</Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>

        {/* CONTENT */}
        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
            
            {loading ? (
                <Text style={styles.loadingText}>Searching...</Text>
            ) : query.length === 0 ? (
                // EMPTY STATE / RECENT
                <View style={styles.recentSection}>
                    <Text style={styles.sectionTitle}>Recent Searches</Text>
                    {RECENT_SEARCHES.map((item, index) => (
                        <TouchableOpacity key={index} style={styles.recentItem} onPress={() => setQuery(item)}>
                            <Search color="#64748B" size={16} />
                            <Text style={styles.recentText}>{item}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            ) : results.length === 0 ? (
                // NO RESULTS
                <View style={styles.noResults}>
                    <Text style={styles.noResultsText}>No venues found matching "{query}"</Text>
                </View>
            ) : (
                // RESULTS LIST
                results.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.resultCard} onPress={() => navigateToVenue(item)}>
                        <Image source={{ uri: item.image }} style={styles.resultImage} />
                        <View style={styles.resultInfo}>
                            <Text style={styles.resultTitle}>{item.title}</Text>
                            <Text style={styles.resultSport}>{item.sport}</Text>
                            <View style={styles.resultMeta}>
                                <View style={styles.metaRow}>
                                    <Star color="#FDB813" size={12} fill="#FDB813" />
                                    <Text style={styles.metaText}>{item.rating}</Text>
                                </View>
                                <View style={styles.metaRow}>
                                    <MapPin color="#94A3B8" size={12} />
                                    <Text style={styles.metaText}>{item.dist}</Text>
                                </View>
                            </View>
                        </View>
                    </TouchableOpacity>
                ))
            )}

        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    gap: 15
  },
  backButton: {
    padding: 5
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 10
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500'
  },
  filterSection: {
    paddingVertical: 15,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 10
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  activeFilterChip: {
    backgroundColor: '#00FF00',
    borderColor: '#00FF00'
  },
  filterText: {
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 13
  },
  activeFilterText: {
    color: '#000',
    fontWeight: '800'
  },
  content: {
    flex: 1,
    paddingHorizontal: 20
  },
  sectionTitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  recentSection: {
    marginTop: 10
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.03)'
  },
  recentText: {
    color: '#E2E8F0',
    fontSize: 15
  },
  loadingText: {
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 30
  },
  noResults: {
    marginTop: 50,
    alignItems: 'center'
  },
  noResultsText: {
    color: '#64748B',
    fontSize: 16
  },
  resultCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
    gap: 15
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#334155'
  },
  resultInfo: {
    flex: 1
  },
  resultTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2
  },
  resultSport: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 6
  },
  resultMeta: {
    flexDirection: 'row',
    gap: 12
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  metaText: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '600'
  }
});
