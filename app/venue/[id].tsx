import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, CheckCircle, ChevronRight, ChevronDown, Coffee, Info, MapPin, ParkingCircle, Share2, Shield, Star, Users, Wifi, X, ArrowRight, Navigation2, CreditCard, Banknote, Smartphone } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut, SlideInUp, SlideOutDown, SlideInDown, FadeInLeft, FadeInRight, FadeInUp, FadeInDown } from "react-native-reanimated";
import { Dimensions, Image, Modal, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View, Pressable, Linking, ActivityIndicator } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { WebView } from 'react-native-webview';
import { Feather } from '@expo/vector-icons';
import { VENUES } from '../../data/venues';
import { useBookingStore } from '../../store/bookingStore';
import apiClient from '../../src/api/apiClient';

const { width } = Dimensions.get('window');

export default function VenueDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { id, title } = params;
    const [fetchedVenue, setFetchedVenue] = useState<any>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showWebView, setShowWebView] = useState(false);
    const [checkoutUrl, setCheckoutUrl] = useState('');
    
    const venueData: any = fetchedVenue || VENUES.find(v => v.id === id || v.title === title) || {
        ...params,
        location: params.dist || 'Sindhu Bhavan Road, Ahmedabad',
        description: 'This premium arena features FIFA-approved artificial grass, high-intensity LED floodlights. Perfect for matches.',
        amenities: [],
        price: params.price ? String(params.price).replace('₹', '') : '1500',
        images: []
    };

    useEffect(() => {
        if (id) {
            apiClient.get(`/api/venues/${id}`)
               .then(res => {
                   const v = res.data.data;
                   setFetchedVenue(v);
                   if (v.courts && Array.isArray(v.courts)) {
                       const sportCourts = v.courts.filter((c: any) => !params.sport || c.category === params.sport);
                       if (sportCourts.length > 0) {
                           setSelectedCourt(sportCourts[0].name);
                       }
                   }
               })
               .catch(err => console.error('Error fetching venue from backend', err));
        }
    }, [id]);

    const dates = React.useMemo(() => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < 8; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const day = d.getDate();
            const month = d.toLocaleString('default', { month: 'short' });
            const year = d.getFullYear();
            days.push({ day, month, fullDate: `${day} ${month} ${year}` });
        }
        return days;
    }, []);

    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(0);
    const [selectedCourt, setSelectedCourt] = useState<string>('');
    const [showCourtDropdown, setShowCourtDropdown] = useState(false);
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [loading, setLoading] = useState(false);
    const addBooking = useBookingStore((state: any) => state.addBooking);

    // Dynamic Slots Logic
    const dynamicSlots = React.useMemo(() => {
        if (venueData && venueData.slots && venueData.slots.length > 0) {
            return venueData.slots.map((s: string) => ({ id: s, label: s, status: 'available' }));
        }
        const baseSlots = ["06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM"];
        return baseSlots.map(s => ({ id: s, label: s, status: 'available' }));
    }, [venueData.slots]);

    useEffect(() => {
        if (showBookingModal) fetchBookedSlots();
    }, [selectedDate, selectedCourt, showBookingModal]);

    const fetchBookedSlots = async () => {
        try {
            const dateStr = dates[selectedDate].fullDate;
            const venueName = venueData.name || venueData.title || title;
            const res = await apiClient.get(`/api/bookings/public?turfName=${encodeURIComponent(venueName)}&date=${encodeURIComponent(dateStr)}`);
            const matchingBookings = res.data.data || [];
            const allBookedTimes = matchingBookings.filter((b: any) => !selectedCourt || b.timeSlot.includes(selectedCourt)).map((b: any) => b.timeSlot.split(' (')[0]);
            setBookedSlots(allBookedTimes);
        } catch (error) { console.error('Error fetching booked slots:', error); }
    };

    // Deep Link Payment Listener
    useEffect(() => {
        const handleDeepLink = async (event: { url: string }) => {
            const { url } = event;
            if (url.includes('payment-success')) {
                const queryParams = new URLSearchParams(url.split('?')[1]);
                const razorpay_payment_id = queryParams.get('razorpay_payment_id');
                const razorpay_order_id = queryParams.get('razorpay_order_id');
                const razorpay_signature = queryParams.get('razorpay_signature');
                const bookingId = queryParams.get('bookingId');

                if (razorpay_payment_id && bookingId) {
                    setLoading(true);
                    try {
                        await apiClient.post('/api/payments/verify', { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId });
                        WebBrowser.dismissBrowser();
                        setLoading(false);
                        setShowPaymentModal(false);
                        setShowSuccessModal(true);
                        setSelectedSlots([]);
                    } catch (error) {
                        setLoading(false);
                        alert("Payment Verification Failed.");
                    }
                }
            } else if (url.includes('payment-cancel')) {
                WebBrowser.dismissBrowser();
                setLoading(false);
                alert("Payment Cancelled");
            }
        };
        const sub = Linking.addEventListener('url', handleDeepLink);
        return () => sub.remove();
    }, []);

    const toggleSlot = (id: string) => {
        setSelectedSlots(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleConfirmPayment = async () => {
        if (paymentMethod === 'cash') {
            submitCashBooking();
            return;
        }
        setLoading(true);
        try {
            const userData = await AsyncStorage.getItem('userInfo');
            const user = userData ? JSON.parse(userData) : null;
            if (!user?._id) return alert("Please login first.");

            const sortedSlots = [...selectedSlots].sort();
            const timeDisplay = sortedSlots.map(sid => dynamicSlots.find((s: any) => s.id === sid)?.label || sid).join(' & ');
            const finalCourt = selectedCourt || 'Main Arena (5v5)';
            const venuePrice = venueData.price ? String(venueData.price).replace('₹', '') : '1500';
            const amount = selectedSlots.length * parseInt(venuePrice);

            const res = await apiClient.post('/api/payments/order', {
                amount,
                bookingData: { 
                    turfName: venueData.title || title, 
                    sport: 'Football', 
                    date: dates[selectedDate].fullDate, 
                    timeSlot: `${timeDisplay} (${finalCourt}) - 1h` 
                }
            });

            if (res.data.success) {
                const url = `${apiClient.defaults.baseURL}/api/payments/checkout/${res.data.order.id}`;
                setCheckoutUrl(url);
                setShowWebView(true);
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            alert("Checkout Initiation Failed.");
        }
    };

    const handleWebViewNavigationStateChange = async (newNavState: any) => {
        const { url } = newNavState;
        if (!url) return;

        if (url.includes('payment-success')) {
            setShowWebView(false);
            setLoading(true);
            
            // Extract data from URL manually for maximum reliability
            const urlParts = url.split('?');
            const queryStr = urlParts.length > 1 ? urlParts[1] : '';
            const params: any = {};
            queryStr.split('&').forEach((part: any) => {
                const [key, val] = part.split('=');
                if (key) params[key] = decodeURIComponent(val || '');
            });

            const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId } = params;

            try {
                await apiClient.post('/api/payments/verify', { 
                    razorpay_payment_id, 
                    razorpay_order_id, 
                    razorpay_signature, 
                    bookingId 
                });
                setLoading(false);
                setShowPaymentModal(false);
                setShowSuccessModal(true);
                setSelectedSlots([]);
            } catch (error) {
                setLoading(false);
                alert("Payment Verification Failed.");
            }
        } else if (url.includes('payment-cancel')) {
            setShowWebView(false);
            alert("Payment Cancelled");
        }
    };

    const submitCashBooking = async () => {
        setLoading(true);
        try {
            const userData = await AsyncStorage.getItem('userInfo');
            const user = userData ? JSON.parse(userData) : null;
            if (!user?._id) return alert("Please login first.");

            const sortedSlots = [...selectedSlots].sort();
            const timeDisplay = sortedSlots.map(sid => dynamicSlots.find((s: any) => s.id === sid)?.label || sid).join(' & ');
            const finalCourt = selectedCourt || 'Main Arena (5v5)';
            const venuePrice = venueData.price ? String(venueData.price).replace('₹', '') : '1500';
            const price = selectedSlots.length * parseInt(venuePrice);

            await apiClient.post('/api/bookings', {
                userId: user?._id,
                turfName: venueData.title || title,
                sport: 'Football',
                date: dates[selectedDate].fullDate,
                timeSlot: `${timeDisplay} (${finalCourt}) - 1h`,
                price: String(price),
                status: 'Pending'
            });
            setLoading(false);
            setShowPaymentModal(false);
            setShowSuccessModal(true);
            setSelectedSlots([]);
        } catch (error) { 
            setLoading(false); 
            alert("Booking Failed."); 
        }
    };

    const imageArray = venueData.images?.length > 0 ? venueData.images : [venueData.image || 'https://images.unsplash.com/photo-1574629810360-7efbb1925713?q=80&w=600'];

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Hero Section */}
                <View style={styles.heroContainer}>
                    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={(e) => setActiveImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))}>
                        {imageArray.map((img: string, i: number) => <Image key={i} source={{ uri: img }} style={styles.heroImage} />)}
                    </ScrollView>
                    <View style={styles.heroOverlay}>
                        <TouchableOpacity style={styles.roundButton} onPress={() => router.back()}><ArrowLeft color="#FFF" size={24} /></TouchableOpacity>
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <TouchableOpacity style={styles.roundButton} onPress={() => router.push({ pathname: '/explore', params: { focusId: id } })}><Feather name="map" color="#00FF00" size={20} /></TouchableOpacity>
                            <TouchableOpacity style={styles.roundButton} onPress={() => Share.share({ message: `Check out ${venueData.title}!` })}><Share2 color="#FFF" size={20} /></TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Info Section */}
                <View style={styles.infoSection}>
                    <View style={styles.titleRow}>
                        <Text style={styles.mainTitle}>{venueData.title}</Text>
                        <View style={styles.ratingBadge}><Star color="#00FF00" size={14} fill="#00FF00" /><Text style={styles.ratingText}>{venueData.rating || '4.5'}</Text></View>
                    </View>
                    <View style={styles.locationRow}><MapPin color="#94A3B8" size={16} /><Text style={styles.locationText}>{venueData.location}</Text></View>
                </View>

                {/* Date Selection */}
                <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Select Date</Text></View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateList}>
                    {dates.map((d, i) => (
                        <TouchableOpacity key={i} onPress={() => setSelectedDate(i)} style={[styles.dateCard, selectedDate === i && styles.selectedDateCard]}>
                            <Text style={[styles.dateText, selectedDate === i && styles.activeDateText]}>{d.day}</Text>
                            <Text style={[styles.monthText, selectedDate === i && styles.activeDateText]}>{d.month}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* About Section */}
                <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>About Venue</Text></View>
                <Text style={styles.aboutText}>{venueData.description}</Text>
            </ScrollView>

            {/* Bottom Bar */}
            <View style={styles.bottomBar}>
                <View><Text style={styles.priceLabel}>Starting from</Text><Text style={styles.bottomPrice}>₹{venueData.price}<Text style={styles.perHr}>/hr</Text></Text></View>
                <TouchableOpacity style={styles.bookButton} onPress={() => setShowBookingModal(true)}><Text style={styles.bookButtonText}>SELECT SLOTS</Text><ChevronRight color="#000" size={20} /></TouchableOpacity>
            </View>

            {/* Booking Modal */}
            <Modal visible={showBookingModal} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowBookingModal(false)}><View style={styles.modalOverlaySolid} /></Pressable>
                    <Animated.View entering={FadeInUp} style={styles.modalContainer}>
                        <View style={styles.modalHeader}><Text style={styles.modalTitle}>Select Slots</Text><TouchableOpacity onPress={() => setShowBookingModal(false)}><X color="#FFF" size={24} /></TouchableOpacity></View>
                        
                        <ScrollView style={{ maxHeight: 400 }}>
                            <View style={styles.slotsGrid}>
                                {dynamicSlots.map((slot: any) => {
                                    const isBooked = bookedSlots.includes(slot.label);
                                    const isSelected = selectedSlots.includes(slot.id);
                                    return (
                                        <TouchableOpacity 
                                            key={slot.id} 
                                            style={[styles.slotCard, isBooked && styles.slotCardBooked, isSelected && styles.slotCardSelected]}
                                            onPress={() => !isBooked && toggleSlot(slot.id)}
                                            disabled={isBooked}
                                        >
                                            <Text style={[styles.slotText, isSelected && styles.slotTextSelected, isBooked && styles.slotTextBooked]}>{slot.label}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <View><Text style={styles.totalLabel}>Total Amount</Text><Text style={styles.totalPrice}>₹{selectedSlots.length * parseInt(String(venueData.price).replace('₹', ''))}</Text></View>
                            <TouchableOpacity disabled={selectedSlots.length === 0} style={[styles.payButton, selectedSlots.length === 0 && styles.payButtonDisabled]} onPress={() => { setShowBookingModal(false); setTimeout(() => setShowPaymentModal(true), 300); }}>
                                <Text style={styles.payButtonText}>CHECKOUT</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>

            {/* Payment Modal */}
            <Modal visible={showPaymentModal} transparent={true} animationType="slide">
                <View style={styles.modalOverlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowPaymentModal(false)}><View style={styles.modalOverlaySolid} /></Pressable>
                    <Animated.View entering={SlideInDown} style={styles.paymentModalContainer}>
                        <View style={styles.modalHeader}><Text style={styles.modalTitle}>Checkout</Text><TouchableOpacity onPress={() => setShowPaymentModal(false)}><X color="#FFF" size={24} /></TouchableOpacity></View>
                        
                        <View style={styles.orderSummaryBox}>
                            <Text style={styles.summaryValue}>₹{selectedSlots.length * parseInt(String(venueData.price).replace('₹', ''))}</Text>
                            <Text style={styles.summaryVenueText}>{venueData.title} • {selectedSlots.length} slot(s)</Text>
                        </View>

                        <TouchableOpacity onPress={() => setPaymentMethod('card')} style={[styles.paymentMethodCard, paymentMethod === 'card' && styles.paymentMethodCardActive]}>
                            <CreditCard size={20} color={paymentMethod === 'card' ? "#00FF00" : "#94A3B8"} />
                            <Text style={[styles.paymentMethodTitle, paymentMethod === 'card' && styles.paymentMethodTitleActive]}>Razorpay (Online)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setPaymentMethod('cash')} style={[styles.paymentMethodCard, paymentMethod === 'cash' && styles.paymentMethodCardActive]}>
                            <Banknote size={20} color={paymentMethod === 'cash' ? "#00FF00" : "#94A3B8"} />
                            <Text style={[styles.paymentMethodTitle, paymentMethod === 'cash' && styles.paymentMethodTitleActive]}>Pay at Arena</Text>
                        </TouchableOpacity>

                        <TouchableOpacity disabled={loading} style={[styles.confirmPayBtn, loading && styles.confirmPayBtnLoading]} onPress={handleConfirmPayment}>
                            <Text style={styles.confirmPayBtnText}>{loading ? 'PROCESSING...' : 'CONFIRM BOOKING'}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>

            {/* RAZORPAY WEBVIEW MODAL */}
            <Modal
                visible={showWebView}
                animationType="slide"
                onRequestClose={() => setShowWebView(false)}
            >
                <View style={{ flex: 1, backgroundColor: '#070A14' }}>
                    <View style={[styles.modalHeader, { padding: 20, paddingTop: 50, backgroundColor: '#131C31' }]}>
                        <Text style={styles.modalTitle}>Secure Checkout</Text>
                        <TouchableOpacity onPress={() => setShowWebView(false)}>
                            <X color="#FFF" size={24} />
                        </TouchableOpacity>
                    </View>
                    {checkoutUrl ? (
                        <WebView 
                            source={{ uri: checkoutUrl }}
                            onNavigationStateChange={handleWebViewNavigationStateChange}
                            style={{ flex: 1 }}
                            startInLoadingState={true}
                            renderLoading={() => (
                                <View style={[StyleSheet.absoluteFill, { backgroundColor: '#070A14', justifyContent: 'center', alignItems: 'center' }]}>
                                    <ActivityIndicator size="large" color="#00FF00" />
                                    <Text style={{ color: '#00FF00', marginTop: 10, fontWeight: '900' }}>INITIALIZING GATEWAY...</Text>
                                </View>
                            )}
                        />
                    ) : null}
                </View>
            </Modal>

            {/* Success Modal */}
            <Modal visible={showSuccessModal} transparent={true} animationType="fade">
                <View style={styles.successOverlay}>
                    <View style={styles.modalOverlaySolid} />
                    <Animated.View entering={ZoomIn} style={styles.successCard}>
                        <CheckCircle color="#00FF00" size={60} />
                        <Text style={styles.successTitle}>BOOKING CONFIRMED!</Text>
                        <TouchableOpacity style={styles.homeButton} onPress={() => { setShowSuccessModal(false); router.push('/(tabs)/home'); }}><Text style={styles.homeButtonText}>GO TO HOME</Text></TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#070A14' },
    scrollContent: { paddingBottom: 120 },
    heroContainer: { height: 300, width: '100%' },
    heroImage: { width: width, height: '100%', resizeMode: 'cover' },
    heroOverlay: { ...StyleSheet.absoluteFillObject, paddingTop: 50, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between' },
    roundButton: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    infoSection: { padding: 20 },
    titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    mainTitle: { color: '#FFF', fontSize: 24, fontWeight: '900', flex: 1 },
    ratingBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0, 255, 0, 0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    ratingText: { color: '#00FF00', fontWeight: '800' },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
    locationText: { color: '#94A3B8', fontSize: 14 },
    sectionHeader: { paddingHorizontal: 20, marginTop: 25, marginBottom: 15 },
    sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
    dateList: { paddingLeft: 20, gap: 12 },
    dateCard: { width: 70, height: 80, backgroundColor: '#1E293B', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    selectedDateCard: { backgroundColor: '#00FF00' },
    dateText: { color: '#FFF', fontSize: 18, fontWeight: '900' },
    monthText: { color: '#94A3B8', fontSize: 12 },
    activeDateText: { color: '#000' },
    aboutText: { color: '#94A3B8', fontSize: 15, lineHeight: 24, paddingHorizontal: 20 },
    bottomBar: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: '#0F172A', padding: 25, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
    priceLabel: { color: '#94A3B8', fontSize: 12 },
    bottomPrice: { color: '#FFF', fontSize: 22, fontWeight: '900' },
    perHr: { fontSize: 14, color: '#94A3B8' },
    bookButton: { backgroundColor: '#00FF00', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingVertical: 15, borderRadius: 16, gap: 8 },
    bookButtonText: { color: '#000', fontWeight: '900' },
    modalOverlay: { flex: 1, justifyContent: 'flex-end' },
    modalOverlaySolid: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)' },
    modalContainer: { backgroundColor: '#131C31', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    modalTitle: { color: '#FFF', fontSize: 20, fontWeight: '900' },
    slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    slotCard: { width: '31%', padding: 15, backgroundColor: '#1E293B', borderRadius: 12, alignItems: 'center' },
    slotCardBooked: { opacity: 0.3 },
    slotCardSelected: { backgroundColor: '#00FF00', borderWidth: 1, borderColor: '#00FF00' },
    slotText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
    slotTextSelected: { color: '#000' },
    slotTextBooked: { color: '#475569', textDecorationLine: 'line-through' },
    modalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25 },
    totalLabel: { color: '#94A3B8', fontSize: 12 },
    totalPrice: { color: '#FFF', fontSize: 20, fontWeight: '900' },
    payButton: { backgroundColor: '#00FF00', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15 },
    payButtonDisabled: { backgroundColor: '#1E293B' },
    payButtonText: { color: '#000', fontWeight: '900' },
    paymentModalContainer: { backgroundColor: '#131C31', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, paddingBottom: 40 },
    orderSummaryBox: { backgroundColor: 'rgba(0,255,0,0.1)', padding: 20, borderRadius: 20, marginBottom: 20, alignItems: 'center' },
    summaryValue: { color: '#00FF00', fontSize: 32, fontWeight: '900' },
    summaryVenueText: { color: '#FFF', marginTop: 5 },
    paymentMethodCard: { flexDirection: 'row', alignItems: 'center', gap: 15, padding: 20, backgroundColor: '#1E293B', borderRadius: 20, marginBottom: 10, borderWidth: 1, borderColor: 'transparent' },
    paymentMethodCardActive: { borderColor: '#00FF00', backgroundColor: 'rgba(0,255,0,0.05)' },
    paymentMethodTitle: { color: '#94A3B8', fontSize: 16, fontWeight: '700' },
    paymentMethodTitleActive: { color: '#FFF' },
    confirmPayBtn: { backgroundColor: '#00FF00', padding: 20, borderRadius: 20, alignItems: 'center', marginTop: 20 },
    confirmPayBtnLoading: { opacity: 0.7 },
    confirmPayBtnText: { color: '#000', fontWeight: '900', fontSize: 16 },
    successOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    successCard: { width: '80%', backgroundColor: '#131C31', borderRadius: 30, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,255,0,0.2)' },
    successTitle: { color: '#FFF', fontSize: 20, fontWeight: '900', marginTop: 20, textAlign: 'center' },
    homeButton: { backgroundColor: '#00FF00', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15, marginTop: 30 },
    homeButtonText: { color: '#000', fontWeight: '900' }
});