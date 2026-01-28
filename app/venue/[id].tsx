import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, CheckCircle, ChevronRight, Coffee, Info, MapPin, ParkingCircle, Share2, Shield, Star, Users, Wifi, X } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { Dimensions, Image, Modal, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { VENUES } from '../../data/venues';

const { width } = Dimensions.get('window');

import { useBookingStore } from '../../store/bookingStore';

export default function VenueDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { id, title } = params;
    const [selectedDate, setSelectedDate] = useState(0);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const addBooking = useBookingStore(state => state.addBooking);

    const TIME_SLOTS = [
        { id: '06:00', label: '06:00 AM', status: 'available' },
        { id: '07:00', label: '07:00 AM', status: 'available' },
        { id: '08:00', label: '08:00 AM', status: 'booked' },
        { id: '09:00', label: '09:00 AM', status: 'available' },
        { id: '16:00', label: '04:00 PM', status: 'available' },
        { id: '17:00', label: '05:00 PM', status: 'booked' },
        { id: '18:00', label: '06:00 PM', status: 'available' },
        { id: '19:00', label: '07:00 PM', status: 'available' },
        { id: '20:00', label: '08:00 PM', status: 'booked' },
        { id: '21:00', label: '09:00 PM', status: 'available' },
        { id: '22:00', label: '10:00 PM', status: 'available' },
        { id: '23:00', label: '11:00 PM', status: 'available' },
    ];

    const toggleSlot = (id: string) => {
        if (selectedSlots.includes(id)) {
            setSelectedSlots(prev => prev.filter(mid => mid !== id));
        } else {
            setSelectedSlots(prev => [...prev, id]);
        }
    };

    const handlePayment = () => {
        // Create a display string for time (e.g. "06:00 PM" or "06:00 PM - 08:00 PM")
        const timeDisplay = selectedSlots.sort().map(sid => {
            const slot = TIME_SLOTS.find(s => s.id === sid);
            return slot ? slot.label : sid;
        }).join(' & ');

        const newBooking = {
            id: Date.now().toString(),
            arena: venueData.title || title as string,
            sport: 'Football', // Default to Football or derive from venue type if available
            date: ['27 Jan', '28 Jan', '29 Jan', '30 Jan', '31 Jan'][selectedDate] + ', 2026',
            time: timeDisplay,
            location: venueData.location || 'Ahmedabad',
            image: (venueData.image as string) || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=500',
            status: 'Confirmed'
        };

        addBooking(newBooking);

        setShowBookingModal(false);
        setTimeout(() => {
            setShowSuccessModal(true);
            setSelectedSlots([]);
        }, 300);
    };

    const venueData: any = VENUES.find(v => v.id === id || v.title === title) || {
        ...params,
        location: 'Sindhu Bhavan Road, Ahmedabad',
        description: 'This premium arena features FIFA-approved artificial grass, high-intensity LED floodlights. Perfect for matches.',
        amenities: [
            { id: 'parking', label: 'Parking', iconName: 'ParkingCircle' },
            { id: 'wifi', label: 'Free WiFi', iconName: 'Wifi' },
        ]
    };

    const getIcon = (iconName: string) => {
        const props = { color: "#00FF00", size: 20 };
        switch (iconName) {
            case 'ParkingCircle': return <ParkingCircle {...props} />;
            case 'Wifi': return <Wifi {...props} />;
            case 'Coffee': return <Coffee {...props} />;
            case 'Shield': return <Shield {...props} />;
            case 'Info': return <Info {...props} />;
            case 'Users': return <Users {...props} />;
            default: return <Info {...props} />;
        }
    };

    const onShare = async () => {
        try {
            await Share.share({ message: `Check out this amazing turf: ${venueData.title} on ArenaPro!` });
        } catch (error) { console.log(error); }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* 1. HERO IMAGE BLOCK */}
            <View style={styles.heroContainer}>
                <Image source={{ uri: venueData.image as string }} style={styles.heroImage} />
                <View style={styles.heroOverlay}>
                    <TouchableOpacity style={styles.roundButton} onPress={() => router.back()}>
                        <ArrowLeft color="#FFFFFF" size={24} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.roundButton} onPress={onShare}>
                        <Share2 color="#FFFFFF" size={20} />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* 2. TITLE & RATING BLOCK */}
                <View style={styles.infoSection}>
                    <View style={styles.titleRow}>
                        <Text style={styles.mainTitle}>{venueData.title}</Text>
                        <View style={styles.ratingBadge}>
                            <Star color="#00FF00" size={14} fill="#00FF00" />
                            <Text style={styles.ratingText}>{venueData.rating}</Text>
                        </View>
                    </View>
                    <View style={styles.locationRow}>
                        <MapPin color="#94A3B8" size={16} />
                        <Text style={styles.locationText}>{venueData.location}</Text>
                    </View>
                </View>

                {/* 3. AMENITIES BLOCK */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Amenities</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.amenitiesList}>
                    {venueData.amenities?.map((item: any, index: number) => (
                        <View key={index} style={styles.amenityItem}>
                            {getIcon(item.iconName)}
                            <Text style={styles.amenityLabel}>{item.label}</Text>
                        </View>
                    ))}
                </ScrollView>

                {/* 4. DATE SELECTION BLOCK */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Select Date</Text>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateList}>
                    {['27 Jan', '28 Jan', '29 Jan', '30 Jan', '31 Jan'].map((date, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => setSelectedDate(index)}
                            style={[styles.dateCard, selectedDate === index && styles.selectedDateCard]}
                        >
                            <Text style={[styles.dateText, selectedDate === index && styles.activeDateText]}>{date.split(' ')[0]}</Text>
                            <Text style={[styles.monthText, selectedDate === index && styles.activeDateText]}>{date.split(' ')[1]}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* 5. ABOUT BLOCK */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>About Venue</Text>
                </View>
                <Text style={styles.aboutText}>
                    {venueData.description}
                </Text>

            </ScrollView>

            {/* 6. BOTTOM BOOKING BAR */}
            <View style={styles.bottomBar}>
                <View>
                    <Text style={styles.priceLabel}>Starting from</Text>
                    <Text style={styles.bottomPrice}>{venueData.price}<Text style={styles.perHr}>/hr</Text></Text>
                </View>
                <TouchableOpacity style={styles.bookButton} onPress={() => setShowBookingModal(true)}>
                    <Text style={styles.bookButtonText}>SELECT SLOTS</Text>
                    <ChevronRight color="#000" size={20} />
                </TouchableOpacity>
            </View>

            {/* 7. BOOKING SLOTS MODAL */}
            <Modal
                visible={showBookingModal}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowBookingModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <BlurView intensity={20} tint="dark" style={styles.modalBlur} />
                    <MotiView
                        from={{ translateY: 500 }}
                        animate={{ translateY: 0 }}
                        transition={{ type: 'timing', duration: 300 }}
                        style={styles.modalContainer}
                    >
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Select Slots</Text>
                                <Text style={styles.modalSubtitle}>Duration: 60 min</Text>
                            </View>
                            <TouchableOpacity style={styles.closeButton} onPress={() => setShowBookingModal(false)}>
                                <X color="#FFF" size={20} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.legendContainer}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, styles.dotAvailable]} />
                                <Text style={styles.legendText}>Available</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, styles.dotBooked]} />
                                <Text style={styles.legendText}>Booked</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, styles.dotSelected]} />
                                <Text style={styles.legendText}>Selected</Text>
                            </View>
                        </View>

                        <ScrollView contentContainerStyle={styles.slotsGrid} showsVerticalScrollIndicator={false}>
                            {TIME_SLOTS.map((slot) => {
                                const isSelected = selectedSlots.includes(slot.id);
                                const isBooked = slot.status === 'booked';
                                return (
                                    <TouchableOpacity
                                        key={slot.id}
                                        style={[
                                            styles.slotCard,
                                            isBooked && styles.slotCardBooked,
                                            isSelected && styles.slotCardSelected
                                        ]}
                                        disabled={isBooked}
                                        onPress={() => toggleSlot(slot.id)}
                                    >
                                        <Text style={[
                                            styles.slotText,
                                            isBooked && styles.slotTextBooked,
                                            isSelected && styles.slotTextSelected
                                        ]}>{slot.label}</Text>
                                        {isSelected && <View style={styles.checkMark} />}
                                    </TouchableOpacity>
                                )
                            })}
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <View style={styles.totalInfo}>
                                <Text style={styles.totalLabel}>Total Amount</Text>
                                <Text style={styles.totalPrice}>
                                    ₹{selectedSlots.length * parseInt(venueData.price.replace('₹', ''))}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.payButton, selectedSlots.length === 0 && styles.payButtonDisabled]}
                                disabled={selectedSlots.length === 0}
                                onPress={handlePayment}
                            >
                                <Text style={styles.payButtonText}>CHECKOUT</Text>
                                <ArrowLeft color="#000" size={20} style={{ transform: [{ rotate: '180deg' }] }} />
                            </TouchableOpacity>
                        </View>
                    </MotiView>
                </View>
            </Modal>
            {/* 8. SUCCESS MODAL */}
            <Modal
                visible={showSuccessModal}
                transparent={true}
                animationType="fade"
            >
                <BlurView intensity={50} tint="dark" style={styles.successOverlay}>
                    <MotiView
                        from={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'timing', duration: 300 }}
                        style={styles.successCard}
                    >
                        <View style={styles.successIconCircle}>
                            <CheckCircle color="#00FF00" size={40} />
                        </View>
                        <Text style={styles.successTitle}>BOOKING CONFIRMED!</Text>
                        <Text style={styles.successMessage}>Get ready to play! Your slot has been successfully reserved.</Text>
                        <TouchableOpacity style={styles.homeButton} onPress={() => {
                            setShowSuccessModal(false);
                            router.push('/(tabs)/home');
                        }}>
                            <Text style={styles.homeButtonText}>GO TO HOME</Text>
                        </TouchableOpacity>
                    </MotiView>
                </BlurView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    // --- CORE BLOCKS ---
    container: { flex: 1, backgroundColor: '#070A14' },
    scrollContent: { paddingBottom: 120 },

    // --- HERO BLOCKS ---
    heroContainer: { height: 300, width: '100%' },
    heroImage: { width: '100%', height: '100%' },
    heroOverlay: {
        ...StyleSheet.absoluteFillObject,
        paddingTop: 50,
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0,0,0,0.2)',
    },
    roundButton: {
        width: 45, height: 45, borderRadius: 22.5,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
    },

    // --- INFO SECTION BLOCKS ---
    infoSection: { padding: 20 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    mainTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '900', flex: 1 },
    ratingBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
        paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12
    },
    ratingText: { color: '#00FF00', fontWeight: '800', fontSize: 14 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
    locationText: { color: '#94A3B8', fontSize: 14, fontWeight: '500' },

    // --- AMENITIES BLOCKS ---
    sectionHeader: { paddingHorizontal: 20, marginTop: 25, marginBottom: 15 },
    sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
    amenitiesList: { paddingLeft: 20, gap: 15 },
    amenityItem: {
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: '#1E293B', padding: 15, borderRadius: 18, width: 90
    },
    amenityLabel: { color: '#94A3B8', fontSize: 11, fontWeight: '700', marginTop: 8 },

    // --- DATE BLOCKS ---
    dateList: { paddingLeft: 20, gap: 12 },
    dateCard: {
        width: 70, height: 80, backgroundColor: '#1E293B',
        borderRadius: 16, justifyContent: 'center', alignItems: 'center',
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
    },
    selectedDateCard: { backgroundColor: '#00FF00', borderColor: '#00FF00' },
    dateText: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
    monthText: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
    activeDateText: { color: '#000000' },

    // --- ABOUT BLOCKS ---
    aboutText: { color: '#94A3B8', fontSize: 15, lineHeight: 24, paddingHorizontal: 20, fontWeight: '500' },

    // --- BOTTOM BAR BLOCKS ---
    bottomBar: {
        position: 'absolute', bottom: 0, width: '100%',
        backgroundColor: '#0F172A', padding: 25,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)',
        borderTopLeftRadius: 30, borderTopRightRadius: 30,
    },
    priceLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
    bottomPrice: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
    perHr: { fontSize: 14, color: '#94A3B8' },
    bookButton: {
        backgroundColor: '#00FF00', flexDirection: 'row',
        alignItems: 'center', paddingHorizontal: 25, paddingVertical: 15,
        borderRadius: 16, gap: 8, elevation: 5, shadowColor: '#00FF00',
        shadowOpacity: 0.3, shadowRadius: 10,
    },
    bookButtonText: { color: '#000', fontWeight: '900', fontSize: 14 },

    // --- MODAL STYLES ---
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalBlur: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContainer: {
        backgroundColor: '#0F172A',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        padding: 25,
        height: '75%',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    modalTitle: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: 0.5 },
    modalSubtitle: { color: '#94A3B8', fontSize: 13, fontWeight: '500', marginTop: 4 },
    closeButton: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center', justifyContent: 'center'
    },

    legendContainer: {
        flexDirection: 'row', gap: 20, marginBottom: 25,
        paddingBottom: 25, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)'
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    dotAvailable: { backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#475569' },
    dotBooked: { backgroundColor: '#334155', opacity: 0.4 },
    dotSelected: { backgroundColor: '#00FF00', shadowColor: '#00FF00', shadowOpacity: 0.8, shadowRadius: 5 },
    legendText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },

    slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 40 },
    slotCard: {
        width: '30%', paddingVertical: 14, borderRadius: 16,
        backgroundColor: '#1E293B', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center', justifyContent: 'center',
    },
    slotCardBooked: { backgroundColor: 'transparent', borderColor: 'transparent', opacity: 0.3 },
    slotCardSelected: {
        backgroundColor: '#00FF00', borderColor: '#00FF00',
        transform: [{ scale: 1.05 }],
        shadowColor: '#00FF00', shadowOpacity: 0.4, shadowRadius: 10, elevation: 5
    },
    checkMark: { position: 'absolute', top: 6, right: 6, width: 6, height: 6, borderRadius: 3, backgroundColor: '#000' },
    slotText: { color: '#FFF', fontSize: 13, fontWeight: '700' },
    slotTextBooked: { color: '#64748B', textDecorationLine: 'line-through' },
    slotTextSelected: { color: '#000', fontWeight: '800' },

    modalFooter: {
        marginTop: 'auto', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)',
    },
    totalInfo: { gap: 2 },
    totalLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
    totalPrice: { color: '#FFF', fontSize: 26, fontWeight: '900', letterSpacing: 0.5 },
    payButton: {
        backgroundColor: '#00FF00', flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 30, paddingVertical: 16, borderRadius: 18, gap: 10,
        shadowColor: '#00FF00', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5,
    },
    payButtonDisabled: { backgroundColor: '#334155', shadowOpacity: 0 },
    payButtonText: { color: '#000', fontWeight: '900', fontSize: 14, letterSpacing: 1 },

    // --- SUCCESS MODAL STYLES ---
    successOverlay: {
        flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)',
    },
    successCard: {
        width: '85%', backgroundColor: '#0F172A', padding: 35, borderRadius: 24,
        alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
        elevation: 10, shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20,
    },
    successIconCircle: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(0, 255, 0, 0.1)',
        justifyContent: 'center', alignItems: 'center', marginBottom: 20,
        borderWidth: 1, borderColor: '#00FF00',
    },
    successTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', textAlign: 'center', marginBottom: 8, letterSpacing: 0.5 },
    successMessage: { color: '#94A3B8', fontSize: 13, textAlign: 'center', marginBottom: 25, lineHeight: 20, paddingHorizontal: 10 },
    homeButton: {
        backgroundColor: '#00FF00', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 14,
        flexDirection: 'row', alignItems: 'center', gap: 8,
        shadowColor: '#00FF00', shadowOpacity: 0.2, shadowRadius: 10,
    },
    homeButtonText: { color: '#000', fontWeight: '900', fontSize: 13, letterSpacing: 1 },
});