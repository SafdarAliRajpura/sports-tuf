import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Trophy, Calendar, MapPin, Users, CheckCircle, Info, Shield } from 'lucide-react-native';
import api from '../../config/api';

export default function TournamentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (id) fetchTournamentDetails();
  }, [id]);

  const fetchTournamentDetails = async () => {
    try {
      const res = await api.get(`/tournaments/${id}`);
      setTournament(res.data);
    } catch (error) {
      console.error('Error fetching tournament details:', error);
      Alert.alert('Error', 'Failed to load tournament details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!teamName.trim()) {
        Alert.alert('Error', 'Please enter a team name');
        return;
    }

    setIsProcessing(true);

    // Mock payment gateway delay for premium feel
    setTimeout(async () => {
        try {
            // Mock user ID for captain (In real app, get from Auth context)
            const captainId = '65d4c8f9a4b3c2e1d0000002'; 
            
            await api.post(`/tournaments/${id}/register`, {
                teamName,
                captainId,
                memberIds: [] // Can add improved member selection later
            });

            setIsProcessing(false);
            setRegisterModalVisible(false);
            setShowSuccessModal(true);
            fetchTournamentDetails(); // Refresh to update team count
        } catch (error: any) {
            setIsProcessing(false);
            Alert.alert('Registration Failed', error.response?.data?.msg || 'Something went wrong');
        }
    }, 1500);
  };

  if (loading) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00FF00" />
        </View>
    );
  }

  if (!tournament) return null;

  const isFull = (tournament.registeredTeams?.length || 0) >= tournament.maxTeams;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* HERO IMAGE */}
        <Image 
            source={{ uri: tournament.image || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1000' }} 
            style={styles.heroImage} 
        />
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft color="#FFF" size={24} />
        </TouchableOpacity>

        <View style={styles.content}>
            {/* TITLE & META */}
            <View style={styles.headerRow}>
                <View style={styles.gameBadge}>
                    <Text style={styles.gameText}>{tournament.game}</Text>
                </View>
                <View style={[styles.statusBadge, isFull && { backgroundColor: '#EF4444' }]}>
                    <Text style={[styles.statusText, isFull && { color: '#FFF' }]}>
                        {isFull ? 'FULL' : tournament.status || 'OPEN'}
                    </Text>
                </View>
            </View>

            <Text style={styles.title}>{tournament.title}</Text>
            
            <View style={styles.metaGrid}>
                <View style={styles.metaItem}>
                    <Calendar color="#94A3B8" size={16} />
                    <Text style={styles.metaText}>{new Date(tournament.startDate).toLocaleDateString()}</Text>
                </View>
                <View style={styles.metaItem}>
                    <MapPin color="#94A3B8" size={16} />
                    <Text style={styles.metaText}>{tournament.location}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Users color="#94A3B8" size={16} />
                    <Text style={styles.metaText}>{tournament.registeredTeams?.length}/{tournament.maxTeams} Teams</Text>
                </View>
            </View>

            {/* PRIZE POOL CARD */}
            <View style={styles.prizeCard}>
                <View style={styles.prizeHeader}>
                    <Trophy color="#FFD700" size={24} fill="#FFD700" />
                    <Text style={styles.prizeTitle}>PRIZE POOL</Text>
                </View>
                <Text style={styles.prizeAmount}>{tournament.prizePool}</Text>
                <Text style={styles.entryFee}>Entry Fee: ₹{tournament.entryFee}/team</Text>
            </View>

            {/* DESCRIPTION */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About Tournament</Text>
                <Text style={styles.descriptionText}>
                    {tournament.description || 'Compete with the best teams in the city and prove your skills. Standard 5v5 rules apply. Ensure full squad presence 30 mins before kick-off.'}
                </Text>
            </View>

            {/* RULES */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Rules & Format</Text>
                
                {tournament.format && (
                    <View style={styles.ruleItem}>
                        <Shield color="#00FF00" size={16} />
                        <Text style={styles.ruleText}>Format: {tournament.format}</Text>
                    </View>
                )}
                
                {tournament.courts && (
                    <View style={styles.ruleItem}>
                        <Shield color="#00FF00" size={16} />
                        <Text style={styles.ruleText}>Played across {tournament.courts} {tournament.courts === 1 ? 'Court' : 'Courts'}</Text>
                    </View>
                )}
                
                <View style={styles.ruleItem}>
                    <Shield color="#00FF00" size={16} />
                    <Text style={styles.ruleText}>5 Main + 3 Subs allowed</Text>
                </View>
                <View style={styles.ruleItem}>
                    <Shield color="#00FF00" size={16} />
                    <Text style={styles.ruleText}>Professional Referees</Text>
                </View>
            </View>

            {/* REGISTERED TEAMS */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Registered Teams ({tournament.registeredTeams?.length || 0}/{tournament.maxTeams})</Text>
                {tournament.registeredTeams && tournament.registeredTeams.length > 0 ? (
                    <View style={styles.teamsGrid}>
                        {tournament.registeredTeams.map((team: any, i: number) => (
                            <View key={i} style={styles.teamTag}>
                                <Text style={styles.teamTagText}>{team.name}</Text>
                            </View>
                        ))}
                    </View>
                ) : (
                    <Text style={styles.descriptionText}>No teams joined yet. Be the first!</Text>
                )}
            </View>

        </View>
      </ScrollView>

      {/* BOTTOM ACTION BAR */}
      <View style={styles.bottomBar}>
        <View>
            <Text style={styles.priceLabel}>Total Entry Fee</Text>
            <Text style={styles.totalPrice}>₹{tournament.entryFee}</Text>
        </View>
        <TouchableOpacity 
            style={[styles.registerButton, isFull && styles.disabledButton]} 
            onPress={() => setRegisterModalVisible(true)}
            disabled={isFull}
        >
            <Text style={styles.registerButtonText}>{isFull ? 'REGISTRATION FULL' : 'REGISTER TEAM'}</Text>
        </TouchableOpacity>
      </View>

      {/* REGISTRATION MODAL */}
      <Modal
        visible={registerModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRegisterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Register Your Team</Text>
                <Text style={styles.modalSubtitle}>Enter your team name to join {tournament.title}</Text>
                
                <TextInput 
                    style={styles.input}
                    placeholder="Team Name (e.g. Thunder FC)"
                    placeholderTextColor="#64748B"
                    value={teamName}
                    onChangeText={setTeamName}
                />

                <View style={styles.modalButtons}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setRegisterModalVisible(false)} disabled={isProcessing}>
                        <Text style={styles.cancelText}>CANCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.confirmButton, isProcessing && { opacity: 0.7 }]} onPress={handleRegister} disabled={isProcessing}>
                        {isProcessing ? (
                            <ActivityIndicator size="small" color="#000000" />
                        ) : (
                            <Text style={styles.confirmText}>PAY & JOIN</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>

      {/* SUCCESS MODAL */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { alignItems: 'center', padding: 30 }]}>
                <CheckCircle color="#00FF00" size={60} style={{ marginBottom: 20 }} />
                <Text style={styles.modalTitle}>Registration Successful!</Text>
                <Text style={styles.modalSubtitle}>Your team "{teamName}" is officially in the bracket. Prepare for victory!</Text>
                
                <TouchableOpacity style={[styles.confirmButton, { width: '100%', marginTop: 20 }]} onPress={() => setShowSuccessModal(false)}>
                    <Text style={styles.confirmText}>AWESOME</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090E1A' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#090E1A' },
  scrollContent: { paddingBottom: 100 },
  
  heroImage: { width: '100%', height: 250 },
  backButton: { position: 'absolute', top: 50, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },

  content: { padding: 20, marginTop: -30, backgroundColor: '#090E1A', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  gameBadge: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  gameText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  statusBadge: { backgroundColor: '#00FF00', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#000', fontSize: 11, fontWeight: '900' },

  title: { color: '#FFF', fontSize: 24, fontWeight: '800', marginBottom: 15 },
  
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, marginBottom: 25 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { color: '#94A3B8', fontSize: 13, fontWeight: '500' },

  prizeCard: { backgroundColor: '#1E293B', borderRadius: 20, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: '#FFD700', marginBottom: 25 },
  prizeHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 5 },
  prizeTitle: { color: '#FFD700', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  prizeAmount: { color: '#FFF', fontSize: 32, fontWeight: '900', marginBottom: 5 },
  entryFee: { color: '#94A3B8', fontSize: 12 },

  section: { marginBottom: 25 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: '700', marginBottom: 10 },
  descriptionText: { color: '#94A3B8', lineHeight: 22, fontSize: 14 },
  
  ruleItem: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  ruleText: { color: '#E2E8F0', fontSize: 14 },

  bottomBar: { position: 'absolute', bottom: 0, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#1E293B', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  priceLabel: { color: '#94A3B8', fontSize: 12 },
  totalPrice: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  registerButton: { backgroundColor: '#00FF00', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 12 },
  disabledButton: { backgroundColor: '#334155', opacity: 0.7 },
  registerButtonText: { color: '#000', fontWeight: '900', fontSize: 14 },

  // MODAL
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', backgroundColor: '#1E293B', borderRadius: 20, padding: 25 },
  modalTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', marginBottom: 5, textAlign: 'center' },
  modalSubtitle: { color: '#94A3B8', fontSize: 13, marginBottom: 20, textAlign: 'center' },
  input: { backgroundColor: '#0F172A', color: '#FFF', borderRadius: 12, padding: 15, fontSize: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 20 },
  modalButtons: { flexDirection: 'row', gap: 15 },
  cancelButton: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 12, borderWidth: 1, borderColor: '#EF4444', justifyContent: 'center' },
  cancelText: { color: '#EF4444', fontWeight: '800' },
  confirmButton: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 12, backgroundColor: '#00FF00', justifyContent: 'center' },
  confirmText: { color: '#000', fontWeight: '800' },

  // TEAMS
  teamsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  teamTag: { backgroundColor: 'rgba(0,255,0,0.1)', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#00FF00' },
  teamTagText: { color: '#00FF00', fontWeight: '800', fontSize: 13 }
});
