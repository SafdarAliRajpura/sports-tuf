import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, TextInput, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, Trophy, Calendar, MapPin, Target, IndianRupee, ChevronRight, Filter } from 'lucide-react-native';
import apiClient from '../../src/api/apiClient';
import { StatusBar } from 'expo-status-bar';

const FILTERS = ['All', 'Football', 'Cricket', 'Badminton'];

export default function AllTournamentsScreen() {
    const router = useRouter();
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('All');

    const fetchTournaments = async () => {
        try {
            const res = await apiClient.get('/api/tournaments');
            if (res.data && res.data.success) {
                setTournaments(res.data.data);
            }
        } catch (error: any) {
            console.error('Error fetching tournaments:', error.message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTournaments();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTournaments();
    };

    const filteredTournaments = tournaments.filter(t => {
        const matchesCategory = activeFilter === 'All' || t.category === activeFilter;
        const matchesSearch = (t.name || t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                             (t.location || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            
            {/* HEADER */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <ArrowLeft color="#FFF" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Tournaments</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* SEARCH & FILTERS */}
            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Search color="#64748B" size={20} />
                    <TextInput 
                        style={styles.searchInput}
                        placeholder="Search events, locations..."
                        placeholderTextColor="#64748B"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                
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

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00FF00" />}
            >
                {loading ? (
                    <View style={styles.centerBox}>
                        <ActivityIndicator size="large" color="#00FF00" />
                        <Text style={styles.loadingText}>Loading Glory...</Text>
                    </View>
                ) : filteredTournaments.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Trophy color="#1E293B" size={80} />
                        <Text style={styles.emptyTitle}>No Tournaments</Text>
                        <Text style={styles.emptyDesc}>Try adjusting your filters or search query.</Text>
                    </View>
                ) : (
                    filteredTournaments.map((t, index) => {
                        const totalSlots = t.totalSlots || t.maxTeams || 16;
                        const registered = t.registeredTeams || 0;
                        const slotsLeft = Math.max(0, totalSlots - registered);
                        
                        return (
                            <TouchableOpacity 
                                key={t._id || index} 
                                style={styles.card}
                                onPress={() => router.push(`/tournament/${t._id}`)}
                            >
                                <Image source={{ uri: t.image || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800' }} style={styles.cardImage} />
                                <View style={styles.cardOverlay}>
                                    <View style={styles.cardHeader}>
                                        <View style={styles.categoryBadge}>
                                            <Target color="#00FF00" size={12} />
                                            <Text style={styles.categoryText}>{t.category || 'Football'}</Text>
                                        </View>
                                        <View style={styles.prizeBadge}>
                                            <Text style={styles.prizeText}>₹{t.prizePool} PRIZE</Text>
                                        </View>
                                    </View>
                                    
                                    <View style={styles.cardFooter}>
                                        <Text style={styles.cardTitle}>{t.name || t.title}</Text>
                                        <View style={styles.cardMeta}>
                                            <View style={styles.metaItem}>
                                                <Calendar color="#FFF" size={14} />
                                                <Text style={styles.metaText}>{t.date || 'TBD'}</Text>
                                            </View>
                                            <View style={styles.metaItem}>
                                                <Users color="#FFF" size={14} />
                                                <Text style={styles.metaText}>{slotsLeft} Spots Left</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#090E1A' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: '#0F172A' },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800' },
    
    searchSection: { backgroundColor: '#0F172A', paddingBottom: 15 },
    searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E293B', marginHorizontal: 20, paddingHorizontal: 15, height: 50, borderRadius: 15, gap: 10, marginBottom: 15 },
    searchInput: { flex: 1, color: '#FFF', fontSize: 15 },
    filterScroll: { paddingHorizontal: 20, gap: 10 },
    filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    activeFilterChip: { backgroundColor: '#00FF00', borderColor: '#00FF00' },
    filterText: { color: '#94A3B8', fontWeight: '600', fontSize: 13 },
    activeFilterText: { color: '#000', fontWeight: '800' },

    scrollContent: { padding: 20, paddingBottom: 50 },
    centerBox: { marginTop: 100, alignItems: 'center' },
    loadingText: { color: '#94A3B8', marginTop: 15, fontSize: 14 },
    emptyContainer: { marginTop: 80, alignItems: 'center', opacity: 0.5 },
    emptyTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', marginTop: 20 },
    emptyDesc: { color: '#94A3B8', marginTop: 10 },

    card: { height: 200, borderRadius: 25, overflow: 'hidden', marginBottom: 20, elevation: 5, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10 },
    cardImage: { width: '100%', height: '100%' },
    cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)', padding: 20, justifyContent: 'space-between' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
    categoryBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0,255,0,0.3)' },
    categoryText: { color: '#FFF', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
    prizeBadge: { backgroundColor: '#FFD700', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    prizeText: { color: '#000', fontSize: 10, fontWeight: '900' },
    cardFooter: {},
    cardTitle: { color: '#FFF', fontSize: 22, fontWeight: '900', marginBottom: 8, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 },
    cardMeta: { flexDirection: 'row', gap: 15 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaText: { color: '#E2E8F0', fontSize: 12, fontWeight: '700' }
});
