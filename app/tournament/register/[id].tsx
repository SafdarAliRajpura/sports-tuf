import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ImageBackground, SafeAreaView, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, User, Mail, Phone, Plus, Trash2, Trophy, Shield, CheckCircle, Users, Check } from 'lucide-react-native';
import apiClient from '../../../src/api/apiClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

export default function TournamentRegistrationScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
    const [registrationData, setRegistrationData] = useState<any>(null);
    const [modalConfig, setModalConfig] = useState<{ visible: boolean; type: 'success' | 'error'; message: string }>({
        visible: false,
        type: 'success',
        message: ''
    });
    
    const [tournament, setTournament] = useState<any>(null);
    const [formData, setFormData] = useState({
        teamName: '',
        contactNumber: '',
        players: ['', '', '', '', ''] 
    });

    useEffect(() => {
        if (id) {
            fetchTournament();
            checkExistingRegistration();
        }
    }, [id]);

    const checkExistingRegistration = async () => {
        try {
            const res = await apiClient.get('/api/tournaments/my-registrations');
            if (res.data && res.data.success) {
                const existing = res.data.data.find((reg: any) => (reg.tournamentId._id || reg.tournamentId) === id);
                if (existing) {
                    setIsAlreadyRegistered(true);
                    setRegistrationData(existing);
                }
            }
        } catch (err) {
            console.error("Error checking existing registration:", err);
        }
    };

    const fetchTournament = async () => {
        try {
            const res = await apiClient.get(`/api/tournaments/${id}`);
            if (res.data && res.data.success) {
                const data = res.data.data;
                setTournament(data);
                const min = data.minPlayers || 5;
                setFormData(prev => ({
                    ...prev,
                    players: Array(min).fill('')
                }));
            }
        } catch (err) {
            console.error("Error fetching tournament details:", err);
            setModalConfig({
                visible: true,
                type: 'error',
                message: 'Failed to retrieve tournament intelligence. Please check your uplink.'
            });
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
            setModalConfig({
                visible: true,
                type: 'error',
                message: `Maximum squad limit reached (${tournament?.maxPlayers || 11} athletes).`
            });
        }
    };

    const removePlayer = (index: number) => {
        if (formData.players.length > (tournament?.minPlayers || 5)) {
            const newPlayers = formData.players.filter((_, i) => i !== index);
            setFormData({ ...formData, players: newPlayers });
        } else {
            setModalConfig({
                visible: true,
                type: 'error',
                message: `Minimum ${tournament?.minPlayers || 5} athletes required for deployment.`
            });
        }
    };

    const handleSubmit = async () => {
        if (!formData.teamName.trim() || !formData.contactNumber.trim()) {
            setModalConfig({
                visible: true,
                type: 'error',
                message: 'Team Name and Contact Protocol are mandatory.'
            });
            return;
        }

        const filledPlayers = formData.players.filter(p => p.trim().length > 0);
        if (filledPlayers.length < (tournament?.minPlayers || 5)) {
            setModalConfig({
                visible: true,
                type: 'error',
                message: `Incomplete Roster: Minimum ${tournament?.minPlayers || 5} players required.`
            });
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
            setModalConfig({
                visible: true,
                type: 'success',
                message: `Your squad ${formData.teamName} is officially deployed to the arena.`
            });
        } catch (error: any) {
            console.error("Registration Error:", error.response?.data);
            setModalConfig({
                visible: true,
                type: 'error',
                message: error.response?.data?.message || 'Deployment Failed: Unable to confirm registration.'
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#00FF00" /></View>;

    if (isAlreadyRegistered) {
        return (
            <View style={styles.container}>
                <StatusBar style="light" />
                <SafeAreaView style={styles.header}>
                    <View style={styles.headerContent}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                            <ArrowLeft color="#FFF" size={24} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>DEPLOYMENT STATUS</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </SafeAreaView>

                <View style={[styles.center, { padding: 30 }]}>
                    <Animated.View entering={ZoomIn.duration(500)} style={styles.successCard}>
                        <View style={styles.glowCircle}>
                            <View style={styles.innerCircle}>
                                <Shield color="#00FF00" size={40} />
                            </View>
                        </View>
                        <Text style={styles.successTitle}>SQUAD DEPLOYED</Text>
                        <Text style={styles.successSubtitle}>
                            Your squad <Text style={{ color: '#00FF00' }}>{registrationData?.teamName}</Text> is currently on active duty in this tournament.
                        </Text>
                        
                        <View style={styles.statusDetailCard}>
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>DEPLOYMENT ID</Text>
                                <Text style={styles.statusValue}>{registrationData?._id.slice(-8).toUpperCase()}</Text>
                            </View>
                            <View style={styles.statusRow}>
                                <Text style={styles.statusLabel}>STATUS</Text>
                                <Text style={[styles.statusValue, { color: '#00FF00' }]}>CONFIRMED</Text>
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={styles.historyBtn} 
                            onPress={() => router.replace('/profile/history')}
                        >
                            <Text style={styles.historyBtnText}>MANAGE SQUAD</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.closeBtn} 
                            onPress={() => router.replace('/(tabs)/home')}
                        >
                            <Text style={styles.closeBtnText}>BACK TO HQ</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            
            <SafeAreaView style={styles.header}>
                <View style={styles.headerContent}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <ArrowLeft color="#FFF" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>TOURNAMENT PASS</Text>
                    <View style={{ width: 40 }} />
                </View>
            </SafeAreaView>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    
                    {/* TACTICAL PASS HEADER */}
                    <View style={styles.passCard}>
                        <ImageBackground 
                            source={{ uri: tournament?.image || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=600' }} 
                            style={styles.passBg}
                            imageStyle={{ opacity: 0.15 }}
                        >
                            <View style={styles.passContent}>
                                <View style={styles.passLeft}>
                                    <View style={styles.passHeader}>
                                        <Trophy color="#00FF00" size={16} />
                                        <Text style={styles.passTypeText}>OFFICIAL ENTRY</Text>
                                    </View>
                                    <Text style={styles.passTitle} numberOfLines={2}>{tournament?.name}</Text>
                                    <Text style={styles.passMeta}>{tournament?.location.split(',')[0].toUpperCase()} • {tournament?.date}</Text>
                                </View>
                                <View style={styles.passRight}>
                                    <View style={styles.qrPlaceholder}>
                                        <Shield color="#00FF00" size={30} />
                                    </View>
                                </View>
                            </View>
                            <View style={styles.passFooter}>
                                <Text style={styles.passId}>ID: {id?.toString().slice(-8).toUpperCase()}</Text>
                                <View style={styles.passStatus}>
                                    <View style={styles.pulseDot} />
                                    <Text style={styles.statusText}>PENDING CLEARANCE</Text>
                                </View>
                            </View>
                        </ImageBackground>
                    </View>

                    {/* SQUAD INTEL */}
                    <View style={styles.formSection}>
                        <View style={styles.sectionHeading}>
                            <Shield color="#00FF00" size={18} />
                            <Text style={styles.sectionLabel}>SQUAD INTEL</Text>
                        </View>

                        <View style={styles.inputGroup}>
                           <Text style={styles.fieldLabel}>TEAM NAME</Text>
                           <View style={styles.inputBox}>
                                <TextInput 
                                    style={styles.input}
                                    placeholder="e.g. TITANS FC"
                                    placeholderTextColor="#475569"
                                    value={formData.teamName}
                                    onChangeText={(text) => setFormData({ ...formData, teamName: text })}
                                    autoCapitalize="characters"
                                />
                           </View>
                        </View>

                        <View style={styles.inputGroup}>
                           <Text style={styles.fieldLabel}>CONTACT PROTOCOL</Text>
                           <View style={styles.inputBox}>
                                <TextInput 
                                    style={styles.input}
                                    placeholder="Primary Mobile Number"
                                    placeholderTextColor="#475569"
                                    keyboardType="phone-pad"
                                    value={formData.contactNumber}
                                    onChangeText={(text) => setFormData({ ...formData, contactNumber: text })}
                                />
                                <Phone color="#00FF00" size={18} style={{ opacity: 0.5 }} />
                           </View>
                        </View>
                    </View>

                    {/* ROSTER CLEARANCE */}
                    <View style={styles.formSection}>
                        <View style={styles.sectionHeading}>
                            <Users color="#00FF00" size={18} />
                            <Text style={styles.sectionLabel}>ROSTER CLEARANCE ({formData.players.length})</Text>
                            <TouchableOpacity onPress={addPlayer} style={styles.addButton}>
                                <Plus color="#FFF" size={14} />
                                <Text style={styles.addText}>DEPLOY PLAYER</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.rosterContainer}>
                            {formData.players.map((p, index) => (
                                <View key={index} style={styles.playerRow}>
                                    <View style={styles.playerNum}>
                                        <Text style={styles.numText}>{index + 1 < 10 ? `0${index + 1}` : index + 1}</Text>
                                    </View>
                                    <TextInput 
                                        style={styles.playerInput}
                                        placeholder={`ENTER ATHLETE NAME`}
                                        placeholderTextColor="#1E293B"
                                        value={p}
                                        onChangeText={(text) => handlePlayerChange(index, text)}
                                        autoCapitalize="characters"
                                    />
                                    {formData.players.length > (tournament?.minPlayers || 5) && (
                                        <TouchableOpacity onPress={() => removePlayer(index)} style={styles.removeBtn}>
                                            <Trash2 color="#EF4444" size={16} />
                                        </TouchableOpacity>
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* ACTION FOOTER */}
            <SafeAreaView style={styles.footer}>
                <View style={styles.footerPrice}>
                    <Text style={styles.entryLabel}>DEPLOYMENT FEE</Text>
                    <Text style={styles.entryValue}>₹{tournament?.entryFee}</Text>
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
                            <Text style={styles.submitText}>CONFIRM DEPLOYMENT</Text>
                            <CheckCircle color="#000" size={18} />
                        </>
                    )}
                </TouchableOpacity>
            </SafeAreaView>

            {/* STATUS MODAL */}
            <Modal visible={modalConfig.visible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <Animated.View entering={ZoomIn.duration(400)} style={[styles.successCard, modalConfig.type === 'error' && { borderColor: '#EF4444' }]}>
                        <View style={[styles.glowCircle, modalConfig.type === 'error' && { shadowColor: '#EF4444' }]}>
                            <Animated.View entering={ZoomIn.delay(300)} style={[styles.innerCircle, modalConfig.type === 'error' && { borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                                {modalConfig.type === 'success' ? (
                                    <Check color="#00FF00" size={40} strokeWidth={4} />
                                ) : (
                                    <Feather name="alert-triangle" size={40} color="#EF4444" />
                                )}
                            </Animated.View>
                        </View>
                        
                        <Text style={styles.successTitle}>{modalConfig.type === 'success' ? 'CLEARANCE GRANTED' : 'DEPLOYMENT BLOCKED'}</Text>
                        <Text style={styles.successSubtitle}>
                            {modalConfig.message}
                        </Text>

                        <View style={styles.divider} />

                        {modalConfig.type === 'success' ? (
                            <>
                                <TouchableOpacity 
                                    style={styles.historyBtn} 
                                    onPress={() => {
                                        setModalConfig({ ...modalConfig, visible: false });
                                        router.replace('/profile/history');
                                    }}
                                >
                                    <Text style={styles.historyBtnText}>VIEW DEPLOYMENT DATA</Text>
                                </TouchableOpacity>

                                <TouchableOpacity 
                                    style={styles.closeBtn} 
                                    onPress={() => {
                                        setModalConfig({ ...modalConfig, visible: false });
                                        router.replace('/(tabs)/home');
                                    }}
                                >
                                    <Text style={styles.closeBtnText}>BACK TO HQ</Text>
                                </TouchableOpacity>
                            </>
                        ) : (
                            <TouchableOpacity 
                                style={[styles.historyBtn, { backgroundColor: '#EF4444' }]} 
                                onPress={() => setModalConfig({ ...modalConfig, visible: false })}
                            >
                                <Text style={[styles.historyBtnText, { color: '#FFF' }]}>ACKNOWLEDGE</Text>
                            </TouchableOpacity>
                        )}
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#090E1A' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#090E1A' },
    header: { backgroundColor: '#131C31' },
    headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
    backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    headerTitle: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 3 },
    
    scrollContent: { padding: 25 },
    
    passCard: { height: 180, borderRadius: 24, overflow: 'hidden', backgroundColor: '#131C31', borderWidth: 1, borderColor: 'rgba(0,255,0,0.1)', marginBottom: 35 },
    passBg: { flex: 1, padding: 20 },
    passContent: { flexDirection: 'row', justifyContent: 'space-between', flex: 1 },
    passLeft: { flex: 1, justifyContent: 'center' },
    passHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    passTypeText: { color: '#00FF00', fontSize: 9, fontWeight: '900', letterSpacing: 2 },
    passTitle: { color: '#FFF', fontSize: 24, fontWeight: '900', marginBottom: 5, letterSpacing: -0.5 },
    passMeta: { color: '#94A3B8', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
    passRight: { width: 80, alignItems: 'center', justifyContent: 'center' },
    qrPlaceholder: { width: 60, height: 60, borderRadius: 12, backgroundColor: 'rgba(0,255,0,0.05)', borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(0,255,0,0.2)', justifyContent: 'center', alignItems: 'center' },
    passFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
    passId: { color: '#475569', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
    passStatus: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFD700' },
    statusText: { color: '#FFD700', fontSize: 9, fontWeight: '900', letterSpacing: 1 },

    formSection: { marginBottom: 35 },
    sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
    sectionLabel: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 1, flex: 1 },
    
    inputGroup: { marginBottom: 15 },
    fieldLabel: { color: '#475569', fontSize: 9, fontWeight: '900', letterSpacing: 1.5, marginBottom: 8, marginLeft: 5 },
    inputBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131C31', borderRadius: 16, paddingHorizontal: 15, height: 55, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    input: { flex: 1, color: '#FFF', fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
    
    addButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#00FF00', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
    addText: { color: '#000', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },

    rosterContainer: { gap: 10 },
    playerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.02)', padding: 10, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.03)' },
    playerNum: { width: 35, height: 35, borderRadius: 10, backgroundColor: 'rgba(0,255,0,0.05)', justifyContent: 'center', alignItems: 'center' },
    numText: { color: '#00FF00', fontSize: 12, fontWeight: '900' },
    playerInput: { flex: 1, height: 40, color: '#FFF', fontSize: 13, fontWeight: '700', letterSpacing: 1 },
    removeBtn: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },

    footer: { backgroundColor: '#0F172A', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 25, paddingVertical: 20, flexDirection: 'row', alignItems: 'center', gap: 20 },
    footerPrice: { flex: 0.4 },
    entryLabel: { color: '#475569', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
    entryValue: { color: '#FFF', fontSize: 22, fontWeight: '900' },
    submitBtn: { flex: 1, height: 60, backgroundColor: '#00FF00', borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, shadowColor: '#00FF00', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
    submitText: { color: '#000', fontSize: 12, fontWeight: '900', letterSpacing: 1 },

    // SUCCESS MODAL STYLES
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 30 },
    successCard: { backgroundColor: '#131C31', borderRadius: 35, padding: 40, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,255,0,0.2)' },
    glowCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(0,255,0,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 25, shadowColor: '#00FF00', shadowOpacity: 0.5, shadowRadius: 20 },
    innerCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(0,255,0,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#00FF00' },
    successTitle: { color: '#FFF', fontSize: 24, fontWeight: '900', letterSpacing: 1, marginBottom: 15, textAlign: 'center' },
    successSubtitle: { color: '#94A3B8', fontSize: 14, textAlign: 'center', lineHeight: 22, fontWeight: '500', marginBottom: 30 },
    divider: { width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 30 },
    historyBtn: { backgroundColor: '#00FF00', width: '100%', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 15, shadowColor: '#00FF00', shadowOpacity: 0.3, shadowRadius: 10 },
    historyBtnText: { color: '#000', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
    closeBtn: { width: '100%', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    closeBtnText: { color: '#94A3B8', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
    
    statusDetailCard: { width: '100%', backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    statusRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    statusLabel: { color: '#475569', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    statusValue: { color: '#FFF', fontSize: 13, fontWeight: '800' }
});
