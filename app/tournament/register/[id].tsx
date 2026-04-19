import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, User, Mail, Phone, Plus, Trash2, Trophy, Shield, CheckCircle } from 'lucide-react-native';
import apiClient from '../../../src/api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';

export default function TournamentRegistrationScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    const [tournament, setTournament] = useState<any>(null);
    const [formData, setFormData] = useState({
        teamName: '',
        contactNumber: '',
        players: ['', '', '', '', ''] // Default to 5
    });

    useEffect(() => {
        if (id) fetchTournament();
    }, [id]);

    const fetchTournament = async () => {
        try {
            const res = await apiClient.get(`/api/tournaments/${id}`);
            if (res.data && res.data.success) {
                const data = res.data.data;
                setTournament(data);
                // Pre-fill player list based on minPlayers if available
                const min = data.minPlayers || 5;
                setFormData(prev => ({
                    ...prev,
                    players: Array(min).fill('')
                }));
            }
        } catch (err) {
            console.error("Error fetching tournament details:", err);
            Alert.alert('Error', 'Could not load tournament details');
        } finally {
            setLoading(false);
        }
    };

    const handlePlayerChange = (index: number, value: string) => {
        const newPlayers = [...formData.players];
        newPlayers[index] = value;
        setFormData({ ...formData, players: newPlayers });
    };

    const addPlayer = () => {
        if (formData.players.length < (tournament?.maxPlayers || 11)) {
            setFormData({ ...formData, players: [...formData.players, ''] });
        } else {
            Alert.alert('Limit Reached', `Maximum ${tournament?.maxPlayers || 11} players allowed`);
        }
    };

    const removePlayer = (index: number) => {
        if (formData.players.length > (tournament?.minPlayers || 5)) {
            const newPlayers = formData.players.filter((_, i) => i !== index);
            setFormData({ ...formData, players: newPlayers });
        } else {
            Alert.alert('Required', `Minimum ${tournament?.minPlayers || 5} players required`);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.teamName.trim() || !formData.contactNumber.trim()) {
            Alert.alert('Required', 'Team Name and Contact Number are required');
            return;
        }

        const filledPlayers = formData.players.filter(p => p.trim().length > 0);
        if (filledPlayers.length < (tournament?.minPlayers || 5)) {
            Alert.alert('Incomplete', `Please enter at least ${tournament?.minPlayers || 5} player names`);
            return;
        }

        setSubmitting(true);
        try {
            const jsonValue = await AsyncStorage.getItem('userInfo');
            const user = jsonValue ? JSON.parse(jsonValue) : null;
            
            const payload = {
                teamName: formData.teamName,
                captainName: user?.fullName || user?.name || 'Athlete',
                email: user?.email,
                contactNumber: formData.contactNumber,
                players: filledPlayers
            };

            await apiClient.post(`/api/tournaments/${id}/register`, payload);
            
            Alert.alert('Success!', 'Registration complete. Get ready for glory!', [
                { text: 'View History', onPress: () => router.replace('/profile/history') },
                { text: 'Home', onPress: () => router.replace('/(tabs)/home') }
            ]);

        } catch (error: any) {
            console.error("Registration Error:", error.response?.data);
            Alert.alert('Registration Failed', error.response?.data?.message || 'Something went wrong');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#00FF00" /></View>;

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            
            {/* TOP HEADER */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft color="#FFF" size={24} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Team Registration</Text>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
                    
                    {/* EVENT PREVIEW */}
                    <View style={styles.eventPreview}>
                        <ImageBackground 
                            source={{ uri: tournament?.image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600' }} 
                            style={styles.previewBg}
                            imageStyle={{ opacity: 0.4 }}
                        >
                            <Trophy color="#FFD700" size={32} />
                            <Text style={styles.previewTitle}>{tournament?.name}</Text>
                            <Text style={styles.previewSubtitle}>{tournament?.location} • ₹{tournament?.entryFee}</Text>
                        </ImageBackground>
                    </View>

                    {/* TEAM DETAILS */}
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>SQUAD IDENTITY</Text>
                        <View style={styles.inputBox}>
                            <Shield color="#94A3B8" size={20} />
                            <TextInput 
                                style={styles.input}
                                placeholder="Team Name (e.g. Titans FC)"
                                placeholderTextColor="#64748B"
                                value={formData.teamName}
                                onChangeText={(text) => setFormData({ ...formData, teamName: text })}
                            />
                        </View>
                        <View style={styles.inputBox}>
                            <Phone color="#94A3B8" size={20} />
                            <TextInput 
                                style={styles.input}
                                placeholder="Contact Number"
                                placeholderTextColor="#64748B"
                                keyboardType="phone-pad"
                                value={formData.contactNumber}
                                onChangeText={(text) => setFormData({ ...formData, contactNumber: text })}
                            />
                        </View>
                    </View>

                    {/* PLAYERS LIST */}
                    <View style={styles.section}>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionLabel}>ROSTER ({formData.players.length}/{tournament?.maxPlayers})</Text>
                            <TouchableOpacity onPress={addPlayer} style={styles.addButton}>
                                <Plus color="#00FF00" size={16} />
                                <Text style={styles.addText}>ADD</Text>
                            </TouchableOpacity>
                        </View>

                        {formData.players.map((p, index) => (
                            <View key={index} style={styles.playerInputRow}>
                                <View style={styles.playerIndex}>
                                    <Text style={styles.indexText}>{index + 1}</Text>
                                </View>
                                <TextInput 
                                    style={styles.playerInput}
                                    placeholder={`Player ${index + 1} Name`}
                                    placeholderTextColor="#475569"
                                    value={p}
                                    onChangeText={(text) => handlePlayerChange(index, text)}
                                />
                                {formData.players.length > (tournament?.minPlayers || 5) && (
                                    <TouchableOpacity onPress={() => removePlayer(index)} style={styles.removeBtn}>
                                        <Trash2 color="#EF4444" size={18} />
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* ACTION BUTTON */}
            <View style={styles.footer}>
                <View style={styles.totalInfo}>
                    <Text style={styles.totalLabel}>Total Fee</Text>
                    <Text style={styles.totalValue}>₹{tournament?.entryFee}</Text>
                </View>
                <TouchableOpacity 
                    style={[styles.submitBtn, submitting && { opacity: 0.7 }]} 
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <ActivityIndicator color="#000" />
                    ) : (
                        <>
                            <Text style={styles.submitText}>CONFIRM REGISTRATION</Text>
                            <CheckCircle color="#000" size={20} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#090E1A' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#090E1A' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: '#0F172A' },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
    
    scrollContent: { padding: 20, paddingBottom: 120 },
    
    eventPreview: { height: 120, borderRadius: 20, overflow: 'hidden', marginBottom: 25, backgroundColor: '#1E293B' },
    previewBg: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    previewTitle: { color: '#FFF', fontSize: 20, fontWeight: '900', marginTop: 5 },
    previewSubtitle: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },

    section: { marginBottom: 30 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    sectionLabel: { color: '#64748B', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
    
    inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131C31', borderRadius: 15, paddingHorizontal: 15, height: 55, gap: 12, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    input: { flex: 1, color: '#FFF', fontSize: 15, fontWeight: '600' },
    
    addButton: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,255,0,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    addText: { color: '#00FF00', fontSize: 11, fontWeight: '800' },

    playerInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
    playerIndex: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center' },
    indexText: { color: '#94A3B8', fontSize: 12, fontWeight: '800' },
    playerInput: { flex: 1, height: 45, backgroundColor: '#0F172A', borderRadius: 10, paddingHorizontal: 15, color: '#FFF', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
    removeBtn: { padding: 5 },

    footer: { position: 'absolute', bottom: 0, width: '100%', padding: 20, backgroundColor: '#0F172A', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', flexDirection: 'row', alignItems: 'center', gap: 20 },
    totalInfo: { flex: 0.4 },
    totalLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '600' },
    totalValue: { color: '#FFF', fontSize: 20, fontWeight: '900' },
    submitBtn: { flex: 1, height: 55, backgroundColor: '#00FF00', borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, shadowColor: '#00FF00', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
    submitText: { color: '#000', fontSize: 13, fontWeight: '900', letterSpacing: 0.5 }
});
