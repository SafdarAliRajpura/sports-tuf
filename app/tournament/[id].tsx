import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Trophy, Calendar, MapPin, Users, CheckCircle, Info, Shield, Target } from 'lucide-react-native';
import apiClient from '../../src/api/apiClient';
import { StatusBar } from 'expo-status-bar';

export default function TournamentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [tournament, setTournament] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchTournamentDetails();
  }, [id]);

  const fetchTournamentDetails = async () => {
    try {
      const res = await apiClient.get(`/api/tournaments/${id}`);
      if (res.data && res.data.success) {
          setTournament(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching tournament details:', error);
      Alert.alert('Error', 'Failed to load tournament details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00FF00" />
        </View>
    );
  }

  if (!tournament) return null;

  const registeredCount = tournament.registeredTeams || 0;
  const totalSlots = tournament.totalSlots || tournament.maxTeams || 16;
  const isFull = registeredCount >= totalSlots;

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
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
                    <Target color="#00FF00" size={12} />
                    <Text style={styles.gameText}>{tournament.category || 'Football'}</Text>
                </View>
                <View style={[styles.statusBadge, isFull && { backgroundColor: '#EF4444' }]}>
                    <Text style={[styles.statusText, isFull && { color: '#FFF' }]}>
                        {isFull ? 'HOUSEFULL' : tournament.status || 'OPEN'}
                    </Text>
                </View>
            </View>

            <Text style={styles.title}>{tournament.name}</Text>
            
            <View style={styles.metaGrid}>
                <View style={styles.metaItem}>
                    <Calendar color="#94A3B8" size={16} />
                    <Text style={styles.metaText}>{tournament.date}</Text>
                </View>
                <View style={styles.metaItem}>
                    <MapPin color="#94A3B8" size={16} />
                    <Text style={styles.metaText}>{tournament.location}</Text>
                </View>
                <View style={styles.metaItem}>
                    <Users color="#94A3B8" size={16} />
                    <Text style={styles.metaText}>{registeredCount} / {totalSlots} Teams</Text>
                </View>
            </View>

            {/* PRIZE POOL CARD */}
            <View style={styles.prizeCard}>
                <View style={styles.prizeHeader}>
                    <Trophy color="#FFD700" size={24} fill="#FFD700" />
                    <Text style={styles.prizeTitle}>PRIZE POOL</Text>
                </View>
                <Text style={styles.prizeAmount}>₹{tournament.prizePool}</Text>
                <Text style={styles.entryFee}>Entry Fee: ₹{tournament.entryFee}/team</Text>
            </View>

            {/* DESCRIPTION */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>About Tournament</Text>
                <Text style={styles.descriptionText}>
                    {tournament.description || 'Join the ultimate competition and prove your dominance. Standard professional rules apply. Please report 30 minutes before kick-off.'}
                </Text>
            </View>

            {/* RULES */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Rules & Format</Text>
                
                <View style={styles.ruleItem}>
                    <Shield color="#00FF00" size={16} />
                    <Text style={styles.ruleText}>Format: {tournament.teamSize}v{tournament.teamSize}</Text>
                </View>
                
                <View style={styles.ruleItem}>
                    <Shield color="#00FF00" size={16} />
                    <Text style={styles.ruleText}>{tournament.teamSize} Players + {(tournament.maxPlayers || tournament.teamSize) - tournament.teamSize} Substitutes</Text>
                </View>
                
                <View style={styles.ruleItem}>
                    <Shield color="#00FF00" size={16} />
                    <Text style={styles.ruleText}>Minimum {tournament.minPlayers || tournament.teamSize} Squad Members</Text>
                </View>
            </View>

            {/* REGISTRATION PROGRESS */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Registration Progress</Text>
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${Math.min(100, (registeredCount / totalSlots) * 100)}%` }]} />
                </View>
                <Text style={styles.descriptionText}>
                    {registeredCount} squads have registered. {Math.max(0, totalSlots - registeredCount)} slots remaining!
                </Text>
            </View>

        </View>
      </ScrollView>

      {/* BOTTOM ACTION BAR */}
      <View style={styles.bottomBar}>
        <View>
            <Text style={styles.priceLabel}>Entry Fee</Text>
            <Text style={styles.totalPrice}>₹{tournament.entryFee}</Text>
        </View>
        <TouchableOpacity 
            style={[styles.registerButton, isFull && styles.disabledButton]} 
            onPress={() => router.push(`/tournament/register/${id}`)}
            disabled={isFull}
        >
            <Text style={styles.registerButtonText}>{isFull ? 'HOUSEFULL' : 'REGISTER NOW'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090E1A' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#090E1A' },
  scrollContent: { paddingBottom: 100 },
  heroImage: { width: '100%', height: 300 },
  backButton: { position: 'absolute', top: 50, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  content: { padding: 25, marginTop: -30, backgroundColor: '#090E1A', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, alignItems: 'center' },
  gameBadge: { backgroundColor: 'rgba(0,255,0,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: 'rgba(0,255,0,0.2)' },
  gameText: { color: '#00FF00', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  statusBadge: { backgroundColor: '#00FF00', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#000', fontSize: 10, fontWeight: '900' },
  title: { color: '#FFF', fontSize: 28, fontWeight: '900', marginBottom: 15, letterSpacing: 0.5 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, marginBottom: 30 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  prizeCard: { backgroundColor: '#131C31', borderRadius: 24, padding: 25, alignItems: 'center', borderWidth: 1, borderColor: '#FFD700', marginBottom: 30, shadowColor: '#FFD700', shadowOpacity: 0.1, shadowRadius: 15 },
  prizeHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  prizeTitle: { color: '#FFD700', fontSize: 13, fontWeight: '800', letterSpacing: 1.5 },
  prizeAmount: { color: '#FFF', fontSize: 36, fontWeight: '900', marginBottom: 5 },
  entryFee: { color: '#64748B', fontSize: 13, fontWeight: '500' },
  section: { marginBottom: 35 },
  sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 15 },
  descriptionText: { color: '#94A3B8', lineHeight: 22, fontSize: 14, fontWeight: '500' },
  ruleItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  ruleText: { color: '#E2E8F0', fontSize: 14, fontWeight: '600' },
  progressBarContainer: { height: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 5, marginVertical: 15, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#00FF00', borderRadius: 5 },
  bottomBar: { position: 'absolute', bottom: 0, width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, backgroundColor: '#0F172A', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  priceLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  totalPrice: { color: '#FFF', fontSize: 22, fontWeight: '900' },
  registerButton: { backgroundColor: '#00FF00', paddingHorizontal: 35, paddingVertical: 15, borderRadius: 16, shadowColor: '#00FF00', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  disabledButton: { backgroundColor: '#1E293B', opacity: 0.8 },
  registerButtonText: { color: '#000', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
});
