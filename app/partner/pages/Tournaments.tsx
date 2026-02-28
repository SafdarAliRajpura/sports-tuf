import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Platform, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp, SlideInUp, SlideOutDown } from 'react-native-reanimated';
import api from '../../config/api';

const AVAILABLE_SPORTS = ['Football', 'Cricket', 'Pickleball', 'Badminton', 'Basketball'];

export default function Tournaments() {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    const [tournaments, setTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Manage Bracket State
    const [manageModalVisible, setManageModalVisible] = useState(false);
    const [activeTournament, setActiveTournament] = useState<any>(null);
    const [manageTab, setManageTab] = useState<'TEAMS'|'BRACKET'>('TEAMS');
    
    // Form fields
    const [title, setTitle] = useState('');
    const [game, setGame] = useState('Football');
    const [location, setLocation] = useState('');
    const [startDate, setStartDate] = useState('');
    const [prizePool, setPrizePool] = useState('');
    const [entryFee, setEntryFee] = useState('');
    const [maxTeams, setMaxTeams] = useState('16');
    const [description, setDescription] = useState('');
    
    // Additional Tournament Options
    const [courts, setCourts] = useState('1');
    const [format, setFormat] = useState('Knockout');

    useEffect(() => {
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/tournaments');
            setTournaments(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const generateBracket = async () => {
        if (!activeTournament || !activeTournament.registeredTeams || activeTournament.registeredTeams.length < 2) {
            Alert.alert("Not enough teams", "You need at least 2 registered teams to generate a bracket.");
            return;
        }

        const teams = activeTournament.registeredTeams;
        const shuffled = [...teams].sort(() => 0.5 - Math.random());
        const matches = [];

        for (let i = 0; i < shuffled.length; i += 2) {
            matches.push({
                teamA: shuffled[i]?.name || 'TBD',
                teamB: shuffled[i + 1]?.name || 'BYE',
                scoreA: 0,
                scoreB: 0,
                winner: null
            });
        }

        const newRounds = [{
            name: "Round 1",
            matches: matches
        }];

        try {
            const res = await api.put(`/tournaments/${activeTournament._id}`, { rounds: newRounds, status: 'Ongoing' });
            setActiveTournament(res.data);
            setTournaments(tournaments.map(t => t._id === activeTournament._id ? res.data : t));
            setManageTab('BRACKET');
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Failed to generate bracket");
        }
    };

    const resetForm = () => {
        setTitle('');
        setGame('Football');
        setLocation('');
        setStartDate('');
        setPrizePool('');
        setEntryFee('');
        setMaxTeams('16');
        setDescription('');
    };

    const handleCreateTournament = async () => {
        if (!title || !location || !startDate || !prizePool || !entryFee) {
            if (Platform.OS === 'web') alert('Please fill all required fields');
            else Alert.alert('Error', 'Please fill all required fields');
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = {
                title,
                game,
                location,
                startDate,
                prizePool,
                entryFee: Number(entryFee),
                maxTeams: Number(maxTeams),
                description,
                format,
                courts: Number(courts),
                image: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=800' // Default banner
            };

            const res = await api.post('/tournaments', payload);
            setTournaments([...tournaments, res.data]);
            setModalVisible(false);
            resetForm();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <Animated.View entering={FadeInUp.duration(600)} style={[styles.header, isMobile && styles.headerMobile]}>
                <View style={styles.headerTextGroup}>
                    <Text style={styles.headerTitle}>TOURNAMENT BUILDER</Text>
                    <Text style={styles.headerSubtitle}>Create and manage competitive leagues.</Text>
                </View>
                <TouchableOpacity style={styles.actionButton} onPress={() => { resetForm(); setModalVisible(true); }}>
                    <Feather name="plus" size={16} color="#000000" />
                    <Text style={styles.actionButtonText}>Create Tournament</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Tournaments Grid */}
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
                    <ActivityIndicator size="large" color="#00FF00" />
                </View>
            ) : tournaments.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
                    <Feather name="award" size={40} color="#64748B" style={{ marginBottom: 16 }} />
                    <Text style={{ color: '#94A3B8', fontSize: 16 }}>No tournaments active. Host one now!</Text>
                </View>
            ) : (
                <View style={styles.grid}>
                    {tournaments.map((t, index) => (
                        <Animated.View 
                            entering={FadeInUp.duration(600).delay(100 + index * 100)} 
                            key={t._id} 
                            style={[styles.card, isMobile ? styles.cardMobile : isTablet ? styles.cardTablet : styles.cardDesktop]}
                        >
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardStatus}>{t.status}</Text>
                                <Feather name="more-horizontal" size={20} color="#94A3B8" />
                            </View>
                            
                            <View style={styles.cardContent}>
                                <Text style={styles.gameTag}>{t.game.toUpperCase()}</Text>
                                <Text style={styles.title} numberOfLines={2}>{t.title}</Text>
                                
                                <View style={styles.detailsRow}>
                                    <Feather name="calendar" size={12} color="#64748B" />
                                    <Text style={styles.detailText}>{new Date(t.startDate).toLocaleDateString() || t.startDate}</Text>
                                </View>
                                <View style={styles.detailsRow}>
                                    <Feather name="map-pin" size={12} color="#64748B" />
                                    <Text style={styles.detailText}>{t.location}</Text>
                                </View>
                                <View style={styles.detailsRow}>
                                    <Feather name="users" size={12} color="#64748B" />
                                    <Text style={styles.detailText}>{t.registeredTeams?.length || 0} / {t.maxTeams} Teams</Text>
                                </View>
                            </View>
                            
                            <View style={styles.cardFooter}>
                                <View>
                                    <Text style={styles.footerLabel}>Prize Pool</Text>
                                    <Text style={styles.footerValue}>{t.prizePool}</Text>
                                </View>
                                <TouchableOpacity style={styles.manageBtn} onPress={() => {
                                    setActiveTournament(t);
                                    setManageTab('TEAMS');
                                    setManageModalVisible(true);
                                }}>
                                    <Text style={styles.manageBtnText}>Manage Bracket</Text>
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    ))}
                </View>
            )}

            {/* Create Modal */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <Animated.View entering={SlideInUp.duration(400)} exiting={SlideOutDown.duration(300)} style={[styles.modalBox, isMobile && { width: '90%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Host New Tournament</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Feather name="x" size={24} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Tournament Title</Text>
                                <TextInput style={styles.inputField} placeholder="e.g. Summer Cup 2026" placeholderTextColor="#64748B" value={title} onChangeText={setTitle} />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Sport</Text>
                                <View style={styles.chipWrap}>
                                    {AVAILABLE_SPORTS.map(s => (
                                        <TouchableOpacity 
                                            key={s}
                                            style={[styles.chip, game === s && styles.chipActive]}
                                            onPress={() => setGame(s)}
                                        >
                                            <Text style={[styles.chipText, game === s && styles.chipTextActive]}>{s}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                            
                            <View style={styles.rowWrapper}>
                                <View style={[styles.inputGroup, {flex: 1, marginRight: 10}]}>
                                    <Text style={styles.inputLabel}>Location</Text>
                                    <TextInput style={styles.inputField} placeholder="e.g. Satellite" placeholderTextColor="#64748B" value={location} onChangeText={setLocation} />
                                </View>
                                <View style={[styles.inputGroup, {flex: 1}]}>
                                    <Text style={styles.inputLabel}>Start Date</Text>
                                    <TextInput style={styles.inputField} placeholder="YYYY-MM-DD" placeholderTextColor="#64748B" value={startDate} onChangeText={setStartDate} />
                                </View>
                            </View>

                            <View style={styles.rowWrapper}>
                                <View style={[styles.inputGroup, {flex: 1, marginRight: 10}]}>
                                    <Text style={styles.inputLabel}>Prize Pool (Text)</Text>
                                    <TextInput style={styles.inputField} placeholder="e.g. ₹50,000" placeholderTextColor="#64748B" value={prizePool} onChangeText={setPrizePool} />
                                </View>
                                <View style={[styles.inputGroup, {flex: 1}]}>
                                    <Text style={styles.inputLabel}>Entry Fee (₹)</Text>
                                    <TextInput style={styles.inputField} placeholder="e.g. 2000" placeholderTextColor="#64748B" value={entryFee} onChangeText={setEntryFee} keyboardType="numeric" />
                                </View>
                            </View>

                            <View style={styles.rowWrapper}>
                                <View style={[styles.inputGroup, {flex: 1, marginRight: 10}]}>
                                    <Text style={styles.inputLabel}>Max Teams</Text>
                                    <TextInput style={styles.inputField} placeholder="e.g. 16" placeholderTextColor="#64748B" value={maxTeams} onChangeText={setMaxTeams} keyboardType="numeric" />
                                </View>
                                <View style={[styles.inputGroup, {flex: 1}]}>
                                    <Text style={styles.inputLabel}>Number of Courts</Text>
                                    <TextInput style={styles.inputField} placeholder="e.g. 2" placeholderTextColor="#64748B" value={courts} onChangeText={setCourts} keyboardType="numeric" />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Tournament Format</Text>
                                <View style={styles.chipWrap}>
                                    {['Knockout', 'League', 'Group + Knockout'].map(f => (
                                        <TouchableOpacity 
                                            key={f}
                                            style={[styles.chip, format === f && styles.chipActive]}
                                            onPress={() => setFormat(f)}
                                        >
                                            <Text style={[styles.chipText, format === f && styles.chipTextActive]}>{f}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Description & Rules</Text>
                                <TextInput 
                                    style={[styles.inputField, { height: 80, textAlignVertical: 'top' }]} 
                                    placeholder="Enter requirements or rules..." 
                                    placeholderTextColor="#64748B" 
                                    value={description} 
                                    onChangeText={setDescription} 
                                    multiline 
                                    numberOfLines={4} 
                                />
                            </View>

                            <TouchableOpacity 
                                style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]} 
                                onPress={handleCreateTournament} 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#000000" />
                                ) : (
                                    <Text style={styles.submitButtonText}>Publish Tournament</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </Animated.View>
                </View>
            </Modal>

            {/* Manage Bracket Modal */}
            <Modal visible={manageModalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalBox, { width: 800, minHeight: 600 }]}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>{activeTournament?.title}</Text>
                                <Text style={styles.modalSubtitle}>Manage Teams & Brackets</Text>
                            </View>
                            <TouchableOpacity onPress={() => setManageModalVisible(false)}>
                                <Feather name="x" size={24} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.manageTabs}>
                            <TouchableOpacity 
                                style={[styles.manageTabBtn, manageTab === 'TEAMS' && styles.manageTabActive]} 
                                onPress={() => setManageTab('TEAMS')}
                            >
                                <Text style={[styles.manageTabText, manageTab === 'TEAMS' && styles.manageTabTextActive]}>Registered Teams</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.manageTabBtn, manageTab === 'BRACKET' && styles.manageTabActive]} 
                                onPress={() => setManageTab('BRACKET')}
                            >
                                <Text style={[styles.manageTabText, manageTab === 'BRACKET' && styles.manageTabTextActive]}>Tournament Bracket</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                            {manageTab === 'TEAMS' && (
                                <View>
                                    <View style={styles.teamListHeader}>
                                        <Text style={styles.teamCountText}>{activeTournament?.registeredTeams?.length || 0} / {activeTournament?.maxTeams} Teams Joined</Text>
                                        <TouchableOpacity 
                                            style={[styles.generateBtn, (!activeTournament?.registeredTeams || activeTournament.registeredTeams.length < 2) && { opacity: 0.5 }]} 
                                            onPress={generateBracket}
                                            disabled={!activeTournament?.registeredTeams || activeTournament.registeredTeams.length < 2}
                                        >
                                            <Feather name="git-branch" size={14} color="#000" />
                                            <Text style={styles.generateBtnText}>Generate Bracket</Text>
                                        </TouchableOpacity>
                                    </View>
                                    
                                    {activeTournament?.registeredTeams?.length > 0 ? (
                                        activeTournament.registeredTeams.map((team: any, i: number) => (
                                            <View key={i} style={styles.teamRow}>
                                                <View style={styles.teamInfo}>
                                                    <View style={styles.teamAvatar}><Text style={styles.teamAvatarText}>{team.name.charAt(0).toUpperCase()}</Text></View>
                                                    <Text style={styles.teamNameText}>{team.name}</Text>
                                                </View>
                                                <View style={styles.paymentBadge}>
                                                    <Text style={styles.paymentBadgeText}>{team.paymentStatus}</Text>
                                                </View>
                                            </View>
                                        ))
                                    ) : (
                                        <View style={styles.emptyTeams}>
                                            <Feather name="users" size={32} color="#64748B" />
                                            <Text style={styles.emptyTeamsText}>No teams have registered yet.</Text>
                                        </View>
                                    )}
                                </View>
                            )}

                            {manageTab === 'BRACKET' && (
                                <View style={styles.bracketContainer}>
                                    {!activeTournament?.rounds || activeTournament.rounds.length === 0 ? (
                                        <View style={styles.emptyTeams}>
                                            <Feather name="git-merge" size={32} color="#64748B" />
                                            <Text style={styles.emptyTeamsText}>Bracket hasn't been generated yet.</Text>
                                        </View>
                                    ) : (
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                            <View style={styles.roundList}>
                                                {activeTournament.rounds.map((round: any, rIdx: number) => (
                                                    <View key={rIdx} style={styles.roundColumn}>
                                                        <Text style={styles.roundTitle}>{round.name}</Text>
                                                        {round.matches.map((match: any, mIdx: number) => (
                                                            <View key={mIdx} style={styles.matchCard}>
                                                                <View style={styles.matchTeamRow}>
                                                                    <Text style={styles.matchTeamName}>{match.teamA}</Text>
                                                                    <TextInput style={styles.scoreInput} keyboardType="numeric" defaultValue={String(match.scoreA || 0)} />
                                                                </View>
                                                                <View style={styles.matchDivider} />
                                                                <View style={styles.matchTeamRow}>
                                                                    <Text style={styles.matchTeamName}>{match.teamB}</Text>
                                                                    <TextInput style={styles.scoreInput} keyboardType="numeric" defaultValue={String(match.scoreB || 0)} />
                                                                </View>
                                                            </View>
                                                        ))}
                                                    </View>
                                                ))}
                                            </View>
                                        </ScrollView>
                                    )}
                                </View>
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles: any = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'transparent',
    },
    contentContainer: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    headerMobile: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 16,
    },
    headerTextGroup: {
        gap: 4,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '500',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#00FF00',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    actionButtonText: {
        color: '#000000',
        fontWeight: '800',
        fontSize: 14,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 20,
    },
    card: {
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    cardDesktop: { width: '31%', minWidth: 280, flex: 1 },
    cardTablet: { width: '48%', minWidth: 280, flex: 1 },
    cardMobile: { width: '100%' },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    cardStatus: {
        color: '#00FF00',
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 1,
        textTransform: 'uppercase',
        backgroundColor: 'rgba(0,255,0,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    cardContent: {
        gap: 8,
        marginBottom: 20,
    },
    gameTag: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 8,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    detailText: {
        color: '#94A3B8',
        fontSize: 13,
    },
    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
        paddingTop: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerLabel: {
        color: '#64748B',
        fontSize: 11,
        fontWeight: '600',
    },
    footerValue: {
        color: '#00FF00',
        fontSize: 18,
        fontWeight: '800',
    },
    manageBtn: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
    },
    manageBtnText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 12,
    },
    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalBox: {
        backgroundColor: '#0F172A',
        borderRadius: 24,
        width: 600,
        maxWidth: '100%',
        maxHeight: '90%',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 24,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    modalBody: {
        paddingRight: 10,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        color: '#94A3B8',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
    },
    inputField: {
        backgroundColor: '#1E293B',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        color: '#FFFFFF',
        fontSize: 15,
        borderWidth: 1,
        borderColor: '#334155',
    },
    rowWrapper: {
        flexDirection: 'row',
        width: '100%',
    },
    chipWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
    },
    chipActive: {
        backgroundColor: 'rgba(0, 255, 0, 0.15)',
        borderColor: '#00FF00',
    },
    chipText: {
        color: '#94A3B8',
        fontSize: 13,
        fontWeight: '700',
    },
    chipTextActive: {
        color: '#00FF00',
    },
    submitButton: {
        backgroundColor: '#00FF00',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '800',
    },
    // Manage Bracket Styles
    manageTabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
        marginBottom: 20,
    },
    manageTabBtn: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    manageTabActive: {
        borderBottomColor: '#00FF00',
    },
    manageTabText: {
        color: '#94A3B8',
        fontWeight: '700',
        fontSize: 14,
    },
    manageTabTextActive: {
        color: '#00FF00',
    },
    teamListHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    teamCountText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 16,
    },
    generateBtn: {
        backgroundColor: '#00FF00',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    generateBtnText: {
        color: '#000000',
        fontWeight: '800',
        fontSize: 13,
    },
    teamRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
    },
    teamInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    teamAvatar: {
        width: 40,
        height: 40,
        backgroundColor: '#334155',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    teamAvatarText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 16,
    },
    teamNameText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    paymentBadge: {
        backgroundColor: 'rgba(0,255,0,0.1)',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 6,
    },
    paymentBadgeText: {
        color: '#00FF00',
        fontSize: 11,
        fontWeight: '800',
    },
    emptyTeams: {
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyTeamsText: {
        color: '#94A3B8',
        marginTop: 15,
        fontSize: 15,
    },
    bracketContainer: {
        flexDirection: 'row',
        flex: 1,
    },
    roundList: {
        flexDirection: 'row',
        gap: 40,
    },
    roundColumn: {
        width: 250,
        gap: 20,
    },
    roundTitle: {
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: '800',
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    matchCard: {
        backgroundColor: '#1E293B',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#334155',
        overflow: 'hidden',
    },
    matchTeamRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
    },
    matchTeamName: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    scoreInput: {
        backgroundColor: '#0F172A',
        color: '#FFF',
        width: 40,
        height: 30,
        borderRadius: 6,
        textAlign: 'center',
        fontWeight: 'bold',
        borderWidth: 1,
        borderColor: '#334155',
    },
    matchDivider: {
        height: 1,
        backgroundColor: '#334155',
    },
});
