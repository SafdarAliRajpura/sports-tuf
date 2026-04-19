import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Image, 
  RefreshControl, 
  Modal,
  Platform
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronRight, 
  Trophy, 
  Shield, 
  Users, 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  AlertCircle 
} from 'lucide-react-native';
import apiClient from '../../src/api/apiClient';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInUp, Layout, ZoomIn } from 'react-native-reanimated';

type TabType = 'TURF' | 'TOURNAMENT';

export default function BookingsScreen() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('TURF');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    const [bookings, setBookings] = useState<any[]>([]);
    const [registrations, setRegistrations] = useState<any[]>([]);
    const [selectedBooking, setSelectedBooking] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchData = async () => {
        try {
            // Fetch both in parallel
            const [bookingRes, regRes] = await Promise.allSettled([
                apiClient.get('/api/bookings'),
                apiClient.get('/api/tournaments/my-registrations')
            ]);

            if (bookingRes.status === 'fulfilled' && bookingRes.value.data.success) {
                setBookings(bookingRes.value.data.data);
            }
            if (regRes.status === 'fulfilled' && regRes.value.data.success) {
                setRegistrations(regRes.value.data.data);
            }
        } catch (error) {
            console.error('Data fetch error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useFocusEffect(
      React.useCallback(() => {
        fetchData();
      }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    const getStatusStyles = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'confirmed' || s === 'completed' || s === 'active') return { color: '#00FF00', bg: 'rgba(0, 255, 0, 0.1)', icon: CheckCircle };
        if (s === 'pending') return { color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)', icon: AlertCircle };
        return { color: '#EF4444', bg: 'rgba(239, 68, 68, 0.1)', icon: XCircle };
    };

    const renderTurfCard = (item: any, index: number) => {
        const { color, bg, icon: Icon } = getStatusStyles(item.status);
        return (
            <Animated.View 
                key={item._id} 
                entering={FadeInUp.delay(index * 100)} 
                layout={Layout.springify()}
                style={styles.card}
            >
                <View style={styles.cardHeader}>
                    <View style={styles.typeBadge}>
                        <MapPin color="#00FF00" size={12} />
                        <Text style={styles.typeText}>TURF BOOKING</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                        <Icon color={color} size={12} />
                        <Text style={[styles.statusText, { color }]}>{item.status?.toUpperCase()}</Text>
                    </View>
                </View>

                <Text style={styles.title}>{item.turfName}</Text>
                
                <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                        <Calendar color="#94A3B8" size={14} />
                        <Text style={styles.metaText}>{item.date}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Clock color="#94A3B8" size={14} />
                        <Text style={styles.metaText}>{item.timeSlot?.split(' (')[0]}</Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.priceBox}>
                        <CreditCard color="#64748B" size={14} />
                        <Text style={styles.priceText}>₹{item.price}</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.detailsBtn} 
                        onPress={() => {
                            setSelectedBooking(item);
                            setModalVisible(true);
                        }}
                    >
                        <Text style={styles.detailsBtnText}>VIEW TICKET</Text>
                        <ChevronRight color="#00FF00" size={16} />
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    };

    const renderTournamentCard = (item: any, index: number) => {
        const { color, bg, icon: Icon } = getStatusStyles('confirmed');
        const tourId = item.tournamentId?._id || item.tournamentId;
        return (
            <Animated.View 
                key={item._id} 
                entering={FadeInUp.delay(index * 100)} 
                layout={Layout.springify()}
                style={styles.card}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.typeBadge, { borderColor: '#FFD700' }]}>
                        <Trophy color="#FFD700" size={12} />
                        <Text style={[styles.typeText, { color: '#FFD700' }]}>TOURNAMENT</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: bg }]}>
                        <Icon color={color} size={12} />
                        <Text style={[styles.statusText, { color }]}>JOINED</Text>
                    </View>
                </View>

                <Text style={styles.title}>{item.tournamentName || item.tournamentId?.name || 'Championship'}</Text>
                
                <View style={styles.teamBox}>
                    <Shield color="#00FF00" size={16} />
                    <Text style={styles.teamName}>{item.teamName}</Text>
                </View>

                <View style={styles.playersRow}>
                    <Users color="#94A3B8" size={14} />
                    <Text style={styles.playersText}>{item.players?.length || 0} Players Registered</Text>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.priceBox}>
                        <CreditCard color="#64748B" size={14} />
                        <Text style={styles.priceText}>₹{item.tournamentId?.entryFee || 'PAID'}</Text>
                    </View>
                </View>
            </Animated.View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            
            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Activities</Text>
            </View>

            {/* TAB SELECTOR */}
            <View style={styles.tabBar}>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'TURF' && styles.activeTab]} 
                    onPress={() => setActiveTab('TURF')}
                >
                    <Text style={[styles.tabText, activeTab === 'TURF' && styles.activeTabText]}>TURF MATCHES</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.tab, activeTab === 'TOURNAMENT' && styles.activeTab]} 
                    onPress={() => setActiveTab('TOURNAMENT')}
                >
                    <Text style={[styles.tabText, activeTab === 'TOURNAMENT' && styles.activeTabText]}>TOURNAMENTS</Text>
                </TouchableOpacity>
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00FF00" />}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#00FF00" />
                        <Text style={styles.hint}>Fetching your arena history...</Text>
                    </View>
                ) : (
                    activeTab === 'TURF' ? (
                        bookings.length > 0 ? bookings.map(renderTurfCard) : (
                            <View style={styles.empty}>
                                <MapPin color="#1E293B" size={80} />
                                <Text style={styles.emptyTitle}>No Turf Matches</Text>
                                <Text style={styles.emptyDesc}>You haven't booked any slots yet. Ready to take the field?</Text>
                                <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/(tabs)/home')}>
                                    <Text style={styles.actionBtnText}>BOOK A SLOT</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    ) : (
                        registrations.length > 0 ? registrations.map(renderTournamentCard) : (
                            <View style={styles.empty}>
                                <Trophy color="#1E293B" size={80} />
                                <Text style={styles.emptyTitle}>No Tournaments</Text>
                                <Text style={styles.emptyDesc}>Join the competitive league and fight for glory!</Text>
                                <TouchableOpacity style={styles.actionBtn} onPress={() => router.push('/tournament/all')}>
                                    <Text style={styles.actionBtnText}>FIND EVENTS</Text>
                                </TouchableOpacity>
                            </View>
                        )
                    )
                )}
            </ScrollView>

            {/* DIGITAL TICKET MODAL */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <Animated.View entering={ZoomIn.duration(300)} style={styles.ticketContainer}>
                        {/* TICKET TOP */}
                        <View style={styles.ticketHeader}>
                            <View>
                                <Text style={styles.ticketBrand}>ARENAPRO PASS</Text>
                                <Text style={styles.ticketId}>ID: {selectedBooking?._id?.toUpperCase().substring(0, 10)}</Text>
                            </View>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                <XCircle color="#94A3B8" size={24} />
                            </TouchableOpacity>
                        </View>

                        {/* TICKET BODY */}
                        <View style={styles.ticketContent}>
                            <Text style={styles.ticketVenue}>{selectedBooking?.turfName}</Text>
                            <View style={styles.ticketInfoGrid}>
                                <View style={styles.ticketInfoItem}>
                                    <Text style={styles.ticketInfoLabel}>{selectedBooking?.isTournament ? 'START DATE' : 'DATE'}</Text>
                                    <Text style={styles.ticketInfoValue}>{selectedBooking?.date}</Text>
                                </View>
                                <View style={styles.ticketInfoItem}>
                                    <Text style={styles.ticketInfoLabel}>{selectedBooking?.isTournament ? 'ENTRY' : 'TIME'}</Text>
                                    <Text style={styles.ticketInfoValue}>{selectedBooking?.timeSlot?.split(' (')[0]}</Text>
                                </View>
                            </View>

                            {/* QR CODE SECTION */}
                            <View style={styles.qrContainer}>
                                <View style={styles.qrFrame}>
                                    <Image 
                                        source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ARENA-${selectedBooking?._id || selectedBooking?.id}` }} 
                                        style={styles.qrImage} 
                                    />
                                </View>
                                <Text style={styles.qrHint}>Present this QR at the venue entry</Text>
                                <Text style={styles.manualId}>{selectedBooking?.isTournament ? 'SQUAD' : 'PASS'} ID: {selectedBooking?._id?.toUpperCase() || selectedBooking?.id?.toUpperCase()}</Text>
                            </View>

                            <View style={styles.ticketStatus}>
                                <CheckCircle color="#00FF00" size={18} />
                                <Text style={styles.ticketStatusText}>{selectedBooking?.isTournament ? 'TEAM REGISTERED' : 'VALID FOR ENTRY'}</Text>
                            </View>
                        </View>

                        {/* TICKET FOOTER */}
                        <View style={styles.ticketFooter}>
                            <Text style={styles.footerNote}>Ensure you arrive 15 mins early. Carry valid ID.</Text>
                        </View>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#090E1A' },
    header: { paddingTop: 60, paddingHorizontal: 25, paddingBottom: 20, backgroundColor: '#0F172A' },
    headerTitle: { color: '#FFF', fontSize: 24, fontWeight: '900', letterSpacing: 0.5 },
    
    tabBar: { flexDirection: 'row', backgroundColor: '#0F172A', paddingHorizontal: 20, paddingBottom: 15 },
    tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
    activeTab: { borderBottomColor: '#00FF00' },
    tabText: { color: '#64748B', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
    activeTabText: { color: '#FFF' },

    scrollContent: { padding: 20, paddingBottom: 120 },
    center: { marginTop: 100, alignItems: 'center' },
    hint: { color: '#64748B', marginTop: 15, fontSize: 13, fontWeight: '600' },

    card: { backgroundColor: '#131C31', borderRadius: 24, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0, 255, 0, 0.2)' },
    typeText: { color: '#00FF00', fontSize: 10, fontWeight: '800' },
    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: '900' },

    title: { color: '#FFF', fontSize: 20, fontWeight: '800', marginBottom: 12 },
    metaRow: { flexDirection: 'row', gap: 15, marginBottom: 15 },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    metaText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },

    teamBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(255,255,255,0.03)', padding: 12, borderRadius: 12, marginBottom: 10 },
    teamName: { color: '#00FF00', fontSize: 14, fontWeight: '800' },
    playersRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
    playersText: { color: '#64748B', fontSize: 12, fontWeight: '600' },

    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
    priceBox: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    priceText: { color: '#FFF', fontSize: 18, fontWeight: '900' },
    detailsBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    detailsBtnText: { color: '#00FF00', fontSize: 12, fontWeight: '900' },

    empty: { marginTop: 60, alignItems: 'center', paddingHorizontal: 40 },
    emptyTitle: { color: '#FFF', fontSize: 22, fontWeight: '900', marginTop: 20, marginBottom: 10 },
    emptyDesc: { color: '#94A3B8', textAlign: 'center', lineHeight: 22, marginBottom: 30, fontSize: 14 },
    actionBtn: { backgroundColor: '#00FF00', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15, shadowColor: '#00FF00', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
    actionBtnText: { color: '#000', fontWeight: '900', letterSpacing: 1, fontSize: 13 },

    // MODAL STYLES
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 25 },
    ticketContainer: { width: '100%', backgroundColor: '#FFF', borderRadius: 30, overflow: 'hidden' },
    ticketHeader: { backgroundColor: '#000', padding: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    ticketBrand: { color: '#00FF00', fontSize: 20, fontWeight: '900', letterSpacing: 2 },
    ticketId: { color: '#00FF00', fontSize: 13, fontWeight: '800', marginTop: 4, letterSpacing: 1 },
    closeBtn: { padding: 5 },
    
    ticketContent: { padding: 30, alignItems: 'center' },
    ticketVenue: { fontSize: 24, fontWeight: '900', color: '#000', textAlign: 'center', marginBottom: 25 },
    ticketInfoGrid: { flexDirection: 'row', gap: 40, marginBottom: 30 },
    ticketInfoItem: { alignItems: 'center' },
    ticketInfoLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '800', marginBottom: 5 },
    ticketInfoValue: { fontSize: 16, color: '#000', fontWeight: '900' },

    qrContainer: { padding: 20, alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: '#E2E8F0', width: '100%' },
    qrFrame: { padding: 15, backgroundColor: '#FFF', borderRadius: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 2 },
    qrImage: { width: 160, height: 160 },
    qrHint: { marginTop: 15, color: '#64748B', fontSize: 11, fontWeight: '700' },
    manualId: { marginTop: 5, color: '#000', fontSize: 13, fontWeight: '900', letterSpacing: 1 },

    ticketStatus: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 25, backgroundColor: 'rgba(0, 255, 0, 0.1)', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30 },
    ticketStatusText: { color: '#008000', fontSize: 12, fontWeight: '900', letterSpacing: 1 },

    ticketFooter: { backgroundColor: '#F1F5F9', padding: 20, borderTopWidth: 1, borderTopColor: '#E2E8F0', borderStyle: 'dashed' },
    footerNote: { color: '#64748B', fontSize: 10, textAlign: 'center', fontWeight: '600' }
});