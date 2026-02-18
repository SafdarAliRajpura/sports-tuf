import { useFocusEffect, useRouter } from 'expo-router';
import { Clock, MapPin, Plus, UserPlus, Users, Search, CheckCircle } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Alert } from 'react-native';
import api from '../../config/api';

export default function PlayTab() {
  const router = useRouter();
  const [filter, setFilter] = useState('All');
  const filters = ['All', 'Football', 'Cricket', 'Badminton'];

  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const fetchMatches = async () => {
    try {
      const res = await api.get('/matches');
      setMatches(res.data);
    } catch (error) {
      console.log('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchMatches();
    }, [])
  );

  const handleJoin = async (matchId: string) => {
    setJoiningId(matchId);
    try {
      // Use a fake user ID for joining
      await api.put(`/matches/${matchId}/join`, { userId: '65d4c8f9a4b3c2e1d0000002' });
      
      // Update local state to reflect join
      setMatches(prev => prev.map((m: any) => 
        m._id === matchId 
          ? { ...m, playersJoined: [...m.playersJoined, 'Me'], playersJoinedCount: m.playersJoined.length + 1 } 
          : m
      ));
      
      Alert.alert('Success', 'You receive joined the match lobby!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.msg || 'Failed to join match');
    } finally {
      setJoiningId(null);
    }
  };

  const filteredMatches = matches.filter(m => filter === 'All' || m.sport === filter);

  return (
    <View style={styles.container}>
      {/* ACTION BUTTONS */}
      <View style={styles.actionRow}>
        {/* ... (existing buttons) ... */}
        <TouchableOpacity style={styles.actionButton} onPress={() => router.push('/play/create-match')}>
          <View style={styles.iconBox}>
             <Plus color="#00FF00" size={24} />
           </View>
           <View>
             <Text style={styles.actionTitle}>Host a Match</Text>
             <Text style={styles.actionSubtitle}>Create your own lobby</Text>
           </View>
         </TouchableOpacity>
 
         <TouchableOpacity style={styles.actionButtonSecondary}>
           <View style={styles.iconBoxSecondary}>
             <Search color="#FFF" size={20} />
           </View>
           <View>
             <Text style={styles.actionTitle}>Find Players</Text>
             <Text style={styles.actionSubtitle}>Invite to your team</Text>
           </View>
         </TouchableOpacity>
      </View>

      {/* FILTER TABS */}
      <View style={{ marginBottom: 20 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {filters.map(f => (
            <TouchableOpacity 
              key={f} 
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* LOBBY LIST */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Open Lobbies</Text>
        <TouchableOpacity onPress={fetchMatches}><Text style={styles.seeAllText}>REFRESH</Text></TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#00FF00" style={{ marginTop: 20 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
          {filteredMatches.length === 0 ? (
            <Text style={styles.emptyText}>No open matches found.</Text>
          ) : (
            filteredMatches.map((match: any, index) => {
              // ... existing mapping logic

              const joinedCount = match.playersJoined ? match.playersJoined.length : 0;
              const isFull = joinedCount >= match.playersTotal;
              const isJoined = match.playersJoined?.some((p: any) => p === 'Me' || p._id === '65d4c8f9a4b3c2e1d0000002'); // Check mock ID

              return (
                <MotiView 
                  key={match._id}
                  from={{ opacity: 0, translateY: 10 }}
                  animate={{ opacity: 1, translateY: 0 }}
                  transition={{ delay: index * 100 }}
                  style={styles.lobbyCard}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.sportBadge}>
                      <Text style={styles.sportText}>{match.sport.toUpperCase()}</Text>
                    </View>
                    <View style={styles.priceBadge}>
                      <Text style={styles.priceText}>₹{match.pricePerPerson}/person</Text>
                    </View>
                  </View>
  
                  <Text style={styles.venueName}>{match.venue}</Text>
                  
                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                      <Clock color="#94A3B8" size={14} />
                      <Text style={styles.detailText}>{match.time}</Text>
                    </View>
                    <View style={styles.detailItem}>
                      <Users color={isFull ? "#EF4444" : "#94A3B8"} size={14} />
                      <Text style={[styles.detailText, isFull && { color: '#EF4444' }]}>
                        {joinedCount}/{match.playersTotal} Players
                      </Text>
                    </View>
                  </View>
  
                  <View style={styles.hostRow}>
                    <Text style={styles.hostText}>Hosted by <Text style={styles.hostName}>{match.host?.fullName || 'User'}</Text></Text>
                    
                    {isJoined ? (
                      <View style={styles.joinedBadge}>
                        <CheckCircle color="#000" size={14} />
                        <Text style={styles.joinedText}>JOINED</Text>
                      </View>
                    ) : (
                      <TouchableOpacity 
                        style={[styles.joinButton, isFull && styles.fullButton]} 
                        onPress={() => handleJoin(match._id)}
                        disabled={isFull || joiningId === match._id}
                      >
                        <Text style={styles.joinButtonText}>
                          {joiningId === match._id ? 'JOINING...' : isFull ? 'FULL' : 'JOIN'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </MotiView>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  actionRow: { marginVertical: 20, gap: 15 },
  actionButton: {
    backgroundColor: '#1E293B', borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 15,
    borderWidth: 1, borderColor: 'rgba(0, 255, 0, 0.3)',
    shadowColor: '#00FF00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4
  },
  actionButtonSecondary: {
    backgroundColor: '#1E293B', borderRadius: 20, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 15,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  iconBox: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(0, 255, 0, 0.2)'
  },
  iconBoxSecondary: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center', alignItems: 'center',
  },
  actionTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  actionSubtitle: { color: '#94A3B8', fontSize: 13 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 10 },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  seeAllText: { color: '#00FF00', fontSize: 12, fontWeight: '700' },

  listContent: { paddingBottom: 100 },
  lobbyCard: {
    backgroundColor: '#131C31', borderRadius: 24, padding: 20, marginBottom: 15,
    borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  sportBadge: { backgroundColor: 'rgba(0, 255, 0, 0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  sportText: { color: '#00FF00', fontSize: 10, fontWeight: '800' },
  priceBadge: { backgroundColor: '#0F172A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  priceText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  
  venueName: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  detailsRow: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailText: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },

  hostRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  hostText: { color: '#94A3B8', fontSize: 13 },
  hostName: { color: '#FFF', fontWeight: '700' },
  joinButton: { backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
  joinButtonText: { color: '#000', fontSize: 12, fontWeight: '900' },
  fullButton: { backgroundColor: '#334155', opacity: 0.8 },
  
  joinedBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#00FF00', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, gap: 5 },
  joinedText: { color: '#000', fontSize: 12, fontWeight: '900' },
  emptyText: { color: '#64748B', textAlign: 'center', marginTop: 40, fontStyle: 'italic' },

  // FILTER STYLES
  filterChip: {
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#1E293B', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  filterChipActive: { backgroundColor: '#00FF00', borderColor: '#00FF00' },
  filterText: { color: '#94A3B8', fontWeight: '700', fontSize: 13 },
  filterTextActive: { color: '#000', fontWeight: '800' }
});
