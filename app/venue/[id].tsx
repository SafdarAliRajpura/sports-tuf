import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, CheckCircle, ChevronRight, ChevronDown, Coffee, Info, MapPin, ParkingCircle, Share2, Shield, Star, Users, Wifi, X, ArrowRight, Navigation2, CreditCard, Banknote, Smartphone, Zap, Trophy, Medal, Target } from 'lucide-react-native';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut, SlideInUp, SlideOutDown, SlideInDown, FadeInLeft, FadeInRight, FadeInUp, FadeInDown } from "react-native-reanimated";
import { Dimensions, Image, Modal, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View, Pressable, Linking, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { WebView } from 'react-native-webview';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { VENUES } from '../../data/venues';
import { useBookingStore } from '../../store/bookingStore';
import apiClient from '../../src/api/apiClient';

const { width, height } = Dimensions.get('window');

// Optimized Sub-Components for Performance
const ReviewItem = React.memo(({ rev, idx }: { rev: any, idx: number }) => (
    <Animated.View entering={FadeInRight.delay(idx * 50)} style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
            <View style={styles.reviewerInfo}>
                <View style={styles.reviewerAvatar}><Text style={styles.avatarInitial}>{(rev.user || 'A')[0]}</Text></View>
                <View><Text style={styles.reviewerName}>{rev.user}</Text><Text style={styles.reviewDate}>{new Date(rev.createdAt).toLocaleDateString()}</Text></View>
            </View>
            <View style={styles.reviewStars}>
                {[1,2,3,4,5].map((s) => (<Star key={s} size={10} color={s <= rev.rating ? "#FDB813" : "#334155"} fill={s <= rev.rating ? "#FDB813" : "transparent"} />))}
            </View>
        </View>
        <Text style={styles.reviewComment}>{rev.comment}</Text>
    </Animated.View>
));

export default function VenueDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { id, title, image, price, rating: initialRating } = params;
    
    const [fetchedVenue, setFetchedVenue] = useState<any>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showWebView, setShowWebView] = useState(false);
    const [checkoutUrl, setCheckoutUrl] = useState('');
    
    // UI Speed Optimization: Use params for immediate rendering
    const venueData: any = useMemo(() => {
        return fetchedVenue || {
            _id: id,
            name: title,
            title: title,
            image: image,
            price: price ? String(price).replace('₹', '') : '1500',
            location: 'Ahmedabad',
            description: 'Loading premium venue details...',
            sports: ['Football'],
            rating: initialRating || '4.5'
        };
    }, [fetchedVenue, id, title, image, price, initialRating]);

    const [reviews, setReviews] = useState<any[]>([]);
    const [avgRating, setAvgRating] = useState(String(initialRating || '0.0'));
    const [totalReviews, setTotalReviews] = useState(0);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showReviewSuccess, setShowReviewSuccess] = useState(false);
    const [userRating, setUserRating] = useState(5);
    const [userComment, setUserComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    // Parallel Fetch Protocol
    useEffect(() => {
        if (!id) return;
        
        const loadVenueData = async () => {
            try {
                // High-Speed Burst: Fetch everything in parallel
                const [venueRes, reviewsRes] = await Promise.all([
                    apiClient.get(`/api/venues/${id}`).catch(() => null),
                    apiClient.get(`/api/reviews/${id}`).catch(() => null)
                ]);

                if (venueRes?.data?.success) {
                    setFetchedVenue(venueRes.data.data);
                }
                if (reviewsRes?.data?.success) {
                    setReviews(reviewsRes.data.data);
                    setAvgRating(reviewsRes.data.meta?.averageRating || String(initialRating || '0.0'));
                    setTotalReviews(reviewsRes.data.meta?.totalCount || 0);
                }
            } catch (error) {
                console.log('Parallel Fetch Failure:', error);
            }
        };

        loadVenueData();
    }, [id]);

    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(0);
    const [selectedCourt, setSelectedCourt] = useState<string>('');
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [loading, setLoading] = useState(false);

    const dates = useMemo(() => {
        const days = []; const today = new Date();
        for (let i = 0; i < 8; i++) {
            const d = new Date(today); d.setDate(today.getDate() + i);
            const day = d.getDate(); const month = d.toLocaleString('default', { month: 'short' }); const year = d.getFullYear();
            days.push({ day, month, fullDate: `${day} ${month} ${year}` });
        }
        return days;
    }, []);

    const dynamicSlots = useMemo(() => {
        if (venueData?.slots?.length > 0) return venueData.slots.map((s: string) => ({ id: s, label: s, status: 'available' }));
        const baseSlots = ["06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM"];
        return baseSlots.map(s => ({ id: s, label: s, status: 'available' }));
    }, [venueData?.slots]);

    const fetchBookedSlots = useCallback(async () => {
        if (!showBookingModal) return;
        try {
            const dateStr = dates[selectedDate].fullDate;
            const venueName = venueData.name || venueData.title || title;
            const res = await apiClient.get(`/api/bookings/public?turfName=${encodeURIComponent(venueName)}&date=${encodeURIComponent(dateStr)}`);
            const allBookedTimes = (res.data.data || []).filter((b: any) => !selectedCourt || b.timeSlot.includes(selectedCourt)).map((b: any) => b.timeSlot.split(' (')[0]);
            
            if (selectedDate === 0) {
                const now = new Date(); const currentHour = now.getHours();
                const getH = (l: string) => { let [t, p] = l.split(' '); let [h] = t.split(':').map(Number); if (p === 'PM' && h !== 12) h += 12; if (p === 'AM' && h === 12) h = 0; return h; };
                const past = dynamicSlots.filter((s: any) => getH(s.label) <= currentHour).map((s: any) => s.label);
                setBookedSlots(Array.from(new Set([...allBookedTimes, ...past])));
            } else setBookedSlots(allBookedTimes);
        } catch (e) { console.error('Error fetching booked slots:', e); }
    }, [selectedDate, selectedCourt, showBookingModal, venueData, dates, dynamicSlots]);

    useEffect(() => { fetchBookedSlots(); }, [fetchBookedSlots]);

    const toggleSlot = (sId: string) => {
        setSelectedSlots(prev => prev.includes(sId) ? prev.filter(s => s !== sId) : [...prev, sId]);
    };

    const handleConfirmPayment = async () => {
        if (paymentMethod === 'cash') { submitCashBooking(); return; }
        setLoading(true);
        try {
            const userData = await AsyncStorage.getItem('userInfo');
            const user = userData ? JSON.parse(userData) : null;
            if (!user?._id) {
                setLoading(false);
                return alert("Authentication Required: Please login to reserve your slot.");
            }
            const sSlots = [...selectedSlots].sort();
            const timeDisplay = sSlots.map(sid => dynamicSlots.find((s: any) => s.id === sid)?.label || sid).join(' & ');
            const priceVal = selectedSlots.length * parseInt(String(venueData.price).replace(/[^\d]/g, '') || '1500');
            const res = await apiClient.post('/api/payments/order', { amount: priceVal, bookingData: { turfName: venueData.title || title, sport: 'Multi', date: dates[selectedDate].fullDate, timeSlot: `${timeDisplay} (${selectedCourt || 'Main Arena'}) - 1h` } });
            if (res.data.success) { setCheckoutUrl(`${apiClient.defaults.baseURL}/api/payments/checkout/${res.data.order.id}`); setShowWebView(true); setLoading(false); }
        } catch (e: any) { 
            setLoading(false); 
            const errorMsg = e.response?.data?.message || "Payment Initialization Failed.";
            alert(`Error: ${errorMsg}`);
            console.error("Payment Error:", e.response?.data || e.message);
        }
    };

    const submitReview = async () => {
        if (!userComment.trim()) return alert("Please enter a comment for your review.");
        if (submittingReview) return;
        
        setSubmittingReview(true);
        try {
            const userData = await AsyncStorage.getItem('userInfo');
            const user = userData ? JSON.parse(userData) : null;
            if (!user?._id) {
                setSubmittingReview(false);
                return alert("Authentication Required: Please login to leave a review.");
            }
            
            const reviewData = {
                venueId: id,
                userId: user._id,
                user: user.fullName || user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Athlete',
                rating: userRating,
                comment: userComment
            };
            
            const res = await apiClient.post('/api/reviews', reviewData);
            
            if (res.data?.success) {
                setReviews([res.data.data, ...reviews]);
                setUserComment('');
                setUserRating(5);
                setShowReviewModal(false);
                setTimeout(() => setShowReviewSuccess(true), 300);
            } else {
                alert(res.data?.message || "Failed to submit review.");
            }
        } catch (e: any) {
            console.error("Submit Review Error:", e.response?.data || e.message);
            alert(e.response?.data?.message || "Failed to submit review.");
        } finally {
            setSubmittingReview(false);
        }
    };

    const submitCashBooking = async () => {
        setLoading(true);
        try {
            const userData = await AsyncStorage.getItem('userInfo');
            const user = userData ? JSON.parse(userData) : null;
            if (!user?._id) {
                setLoading(false);
                return alert("Authentication Required: Please login to reserve your slot.");
            }
            const sSlots = [...selectedSlots].sort();
            const timeDisplay = sSlots.map(sid => dynamicSlots.find((s: any) => s.id === sid)?.label || sid).join(' & ');
            const priceVal = selectedSlots.length * parseInt(String(venueData.price).replace(/[^\d]/g, '') || '1500');
            await apiClient.post('/api/bookings', { userId: user?._id, turfName: venueData.title || title, sport: 'Multi', date: dates[selectedDate].fullDate, timeSlot: `${timeDisplay} (${selectedCourt || 'Main Arena'}) - 1h`, price: String(priceVal), status: 'Confirmed', color: 'bg-emerald-500' });
            setLoading(false); setShowPaymentModal(false); setShowSuccessModal(true); setSelectedSlots([]);
        } catch (e: any) { 
            setLoading(false); 
            const errorMsg = e.response?.data?.message || "Booking Failed.";
            alert(`Error: ${errorMsg}`);
            console.error("Booking Error:", e.response?.data || e.message);
        }
    };

    const imageArray = useMemo(() => {
        return venueData?.images?.length > 0 ? venueData.images : [venueData?.image || 'https://images.unsplash.com/photo-1574629810360-7efbb1925713?q=80&w=600'];
    }, [venueData]);

    const getQueryParam = (url: string, key: string) => {
        const regex = new RegExp(`[?&]${key}=([^&]*)`);
        const results = regex.exec(url);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    };

    const handleNavigationStateChange = async (navState: any) => {
        const url = navState.url;
        if (url.startsWith('footballturf://payment-success')) {
            setShowWebView(false);
            setLoading(true);
            
            const razorpay_payment_id = getQueryParam(url, 'razorpay_payment_id');
            const razorpay_order_id = getQueryParam(url, 'razorpay_order_id');
            const razorpay_signature = getQueryParam(url, 'razorpay_signature');
            const bookingId = getQueryParam(url, 'bookingId');
            
            try {
                const verifyRes = await apiClient.post('/api/payments/verify', {
                    razorpay_order_id,
                    razorpay_payment_id,
                    razorpay_signature,
                    bookingId
                });
                
                setLoading(false);
                if (verifyRes.data?.success) {
                    setShowPaymentModal(false);
                    setShowSuccessModal(true);
                    setSelectedSlots([]);
                    fetchBookedSlots();
                } else {
                    alert(verifyRes.data?.message || 'Payment Verification Failed!');
                }
            } catch (err: any) {
                setLoading(false);
                alert('Verification Error: ' + (err.response?.data?.message || err.message));
            }
        } else if (url.startsWith('footballturf://payment-cancel')) {
            setShowWebView(false);
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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

                <View style={styles.infoSection}>
                    <View style={styles.titleRow}>
                        <Text style={styles.mainTitle}>{venueData.title}</Text>
                        <View style={styles.ratingBadge}><Star color="#00FF00" size={14} fill="#00FF00" /><Text style={styles.ratingText}>{avgRating}</Text><Text style={styles.reviewCountText}>({totalReviews})</Text></View>
                    </View>
                    <View style={styles.locationRow}><MapPin color="#94A3B8" size={16} /><Text style={styles.locationText}>{venueData.location}</Text></View>
                    
                    <View style={styles.sportBadgeContainer}>
                        {venueData.sports?.map((s: string, idx: number) => (
                            <View key={idx} style={styles.sportBadge}><Target color="#00FF00" size={12} /><Text style={styles.sportBadgeText}>{s.toUpperCase()}</Text></View>
                        ))}
                    </View>
                </View>

                <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Select Date</Text></View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateList}>
                    {dates.map((d, i) => (<TouchableOpacity key={i} onPress={() => setSelectedDate(i)} style={[styles.dateCard, selectedDate === i && styles.selectedDateCard]}><Text style={[styles.dateText, selectedDate === i && styles.activeDateText]}>{d.day}</Text><Text style={[styles.monthText, selectedDate === i && styles.activeDateText]}>{d.month}</Text></TouchableOpacity>))}
                </ScrollView>

                <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>About Venue</Text></View>
                <Text style={styles.aboutText}>{venueData.description || 'Premium multi-sport arena.'}</Text>

                <View style={styles.reviewsSection}>
                    <View style={styles.sectionHeaderInner}><Text style={styles.sectionTitle}>Athlete Feedback</Text><TouchableOpacity style={styles.leaveReviewBtnSmall} onPress={() => setShowReviewModal(true)}><Text style={styles.leaveReviewTextSmall}>LEAVE REVIEW</Text></TouchableOpacity></View>
                    {reviews.length > 0 ? reviews.map((rev, idx) => <ReviewItem key={rev._id || idx} rev={rev} idx={idx} />) : <View style={styles.emptyReviews}><Text style={styles.emptyReviewsText}>No battle reports yet.</Text></View>}
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>

            <View style={styles.bottomBar}><View><Text style={styles.priceLabel}>Starting from</Text><Text style={styles.bottomPrice}>₹{venueData.price}<Text style={styles.perHr}>/hr</Text></Text></View><TouchableOpacity style={styles.bookButton} onPress={() => setShowBookingModal(true)}><Text style={styles.bookButtonText}>SELECT SLOTS</Text><ChevronRight color="#000" size={20} /></TouchableOpacity></View>

            {/* MODALS RENDERED CONDITIONALLY TO SAVE MEMORY */}
            {showBookingModal && (
                <Modal visible={true} animationType="fade" transparent={true}><View style={styles.modalOverlay}><Pressable style={StyleSheet.absoluteFill} onPress={() => setShowBookingModal(false)}><View style={styles.modalOverlaySolid} /></Pressable><Animated.View entering={FadeInUp} style={styles.modalContainer}><View style={styles.modalHeader}><Text style={styles.modalTitle}>Select Slots</Text><TouchableOpacity onPress={() => setShowBookingModal(false)}><X color="#FFF" size={24} /></TouchableOpacity></View><View style={{ paddingHorizontal: 20, marginBottom: 15 }}><Text style={styles.inputLabel}>CHOOSE ARENA / COURT</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 10 }}>{(venueData.courts || [{ name: 'Main Arena', category: 'Football' }]).map((court: any, idx: number) => (<TouchableOpacity key={idx} style={[styles.courtCard, selectedCourt === court.name && styles.courtCardActive]} onPress={() => setSelectedCourt(court.name)}><Text style={[styles.courtName, selectedCourt === court.name && styles.courtNameActive]}>{court.name}</Text><Text style={styles.courtCategory}>{court.category}</Text></TouchableOpacity>))}</ScrollView></View><ScrollView style={{ maxHeight: 350 }}><View style={styles.slotsGrid}>{dynamicSlots.map((slot: any) => { const isB = bookedSlots.includes(slot.label); const isS = selectedSlots.includes(slot.id); return (<TouchableOpacity key={slot.id} style={[styles.slotCard, isB && styles.slotCardBooked, isS && styles.slotCardSelected]} onPress={() => !isB && toggleSlot(slot.id)} disabled={isB}><Text style={[styles.slotText, isS && styles.slotTextSelected, isB && styles.slotTextBooked]}>{slot.label}</Text></TouchableOpacity>); })}</View></ScrollView><View style={styles.modalFooter}><View><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalPrice}>₹{selectedSlots.length * parseInt(String(venueData.price).replace(/[^\d]/g, '') || '1500')}</Text></View><TouchableOpacity disabled={selectedSlots.length === 0} style={[styles.payButton, selectedSlots.length === 0 && styles.payButtonDisabled]} onPress={() => { setShowBookingModal(false); setTimeout(() => setShowPaymentModal(true), 300); }}><Text style={styles.payButtonText}>CHECKOUT</Text></TouchableOpacity></View></Animated.View></View></Modal>
            )}

            {showPaymentModal && (
                <Modal visible={true} transparent animationType="slide"><View style={styles.modalOverlay}><Pressable style={StyleSheet.absoluteFill} onPress={() => setShowPaymentModal(false)}><View style={styles.modalOverlaySolid} /></Pressable><Animated.View entering={SlideInDown} style={styles.paymentModalContainer}><View style={styles.modalHeader}><Text style={styles.modalTitle}>Checkout</Text><TouchableOpacity onPress={() => setShowPaymentModal(false)}><X color="#FFF" size={24} /></TouchableOpacity></View><View style={styles.orderSummaryBox}><Text style={styles.summaryValue}>₹{selectedSlots.length * parseInt(String(venueData.price).replace(/[^\d]/g, '') || '1500')}</Text><Text style={styles.summaryVenueText}>{venueData.title} • {selectedSlots.length} slot(s)</Text></View><TouchableOpacity onPress={() => setPaymentMethod('card')} style={[styles.paymentMethodCard, paymentMethod === 'card' && styles.paymentMethodCardActive]}><CreditCard size={20} color={paymentMethod === 'card' ? "#00FF00" : "#94A3B8"} /><Text style={[styles.paymentMethodTitle, paymentMethod === 'card' && styles.paymentMethodTitleActive]}>Razorpay</Text></TouchableOpacity><TouchableOpacity onPress={() => setPaymentMethod('cash')} style={[styles.paymentMethodCard, paymentMethod === 'cash' && styles.paymentMethodCardActive]}><Banknote size={20} color={paymentMethod === 'cash' ? "#00FF00" : "#94A3B8"} /><Text style={[styles.paymentMethodTitle, paymentMethod === 'cash' && styles.paymentMethodTitleActive]}>Pay at Arena</Text></TouchableOpacity><TouchableOpacity disabled={loading} style={[styles.confirmPayBtn, loading && styles.confirmPayBtnLoading]} onPress={handleConfirmPayment}><Text style={styles.confirmPayBtnText}>{loading ? 'PROCESSING...' : 'CONFIRM'}</Text></TouchableOpacity></Animated.View></View></Modal>
            )}
            
            {showSuccessModal && (
                <Modal visible={true} transparent animationType="fade">
                    <View style={styles.modalOverlayBlur}>
                        <Animated.View entering={ZoomIn} style={styles.successModalCard}>
                            <View style={styles.successIconBox}>
                                <CheckCircle color="#000" size={50} strokeWidth={2.5} />
                            </View>
                            <Text style={styles.successTitle}>ARENA SECURED</Text>
                            <Text style={styles.successSubtitle}>Your match at {venueData.title} is confirmed. Gear up, Champion!</Text>
                            
                            <View style={styles.successDetailsBox}>
                                <View style={styles.successDetailRow}>
                                    <MapPin color="#00FF00" size={18} />
                                    <Text style={styles.successDetailText}>{venueData.title}</Text>
                                </View>
                                <View style={[styles.successDetailRow, { marginBottom: 0 }]}>
                                    <Target color="#00FF00" size={18} />
                                    <Text style={styles.successDetailText}>{dates[selectedDate]?.fullDate}</Text>
                                </View>
                            </View>

                            <TouchableOpacity 
                                style={styles.successActionBtn} 
                                onPress={() => { setShowSuccessModal(false); router.push('/(tabs)/home'); }}
                            >
                                <Text style={styles.successActionText}>VIEW DASHBOARD</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </Modal>
            )}

            {showReviewModal && (
                <Modal visible={true} transparent animationType="fade">
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                        <View style={styles.modalOverlayBlur}>
                            <Animated.View entering={ZoomIn} style={styles.reviewModalCard}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>Leave Feedback</Text>
                                    <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                                        <X color="#FFF" size={24} />
                                    </TouchableOpacity>
                                </View>
                                
                                <View style={styles.ratingSelectRow}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <TouchableOpacity key={star} onPress={() => setUserRating(star)}>
                                            <Star size={32} color={star <= userRating ? "#FDB813" : "#334155"} fill={star <= userRating ? "#FDB813" : "transparent"} />
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <TextInput
                                    style={styles.reviewInput}
                                    placeholder="Share your experience at this arena..."
                                    placeholderTextColor="#475569"
                                    multiline
                                    value={userComment}
                                    onChangeText={setUserComment}
                                />

                                <TouchableOpacity 
                                    style={[styles.confirmPayBtn, submittingReview && styles.confirmPayBtnLoading]} 
                                    onPress={submitReview}
                                    disabled={submittingReview}
                                >
                                    <Text style={styles.confirmPayBtnText}>{submittingReview ? 'SUBMITTING...' : 'POST REVIEW'}</Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            )}

            {showReviewSuccess && (
                <Modal visible={true} transparent animationType="fade">
                    <View style={styles.modalOverlayBlur}>
                        <Animated.View entering={ZoomIn} style={styles.successModalCard}>
                            <View style={[styles.successIconBox, { backgroundColor: '#FDB813', shadowColor: '#FDB813' }]}>
                                <Star color="#000" size={50} strokeWidth={2.5} fill="#000" />
                            </View>
                            <Text style={styles.successTitle}>FEEDBACK LIVE</Text>
                            <Text style={styles.successSubtitle}>Your intelligence report has been verified and added to the arena's community logs.</Text>
                            
                            <TouchableOpacity 
                                style={[styles.successActionBtn, { backgroundColor: '#FDB813' }]} 
                                onPress={() => setShowReviewSuccess(false)}
                            >
                                <Text style={styles.successActionText}>CONTINUE EXPLORING</Text>
                            </TouchableOpacity>
                        </Animated.View>
                    </View>
                </Modal>
            )}

            {showWebView && (
                <Modal visible={true} animationType="slide" onRequestClose={() => setShowWebView(false)}><View style={{ flex: 1, backgroundColor: '#070A14' }}><View style={[styles.modalHeader, { padding: 20, paddingTop: 50, backgroundColor: '#131C31' }]}><Text style={styles.modalTitle}>Secure Checkout</Text><TouchableOpacity onPress={() => setShowWebView(false)}><X color="#FFF" size={24} /></TouchableOpacity></View>{checkoutUrl ? (<WebView source={{ uri: checkoutUrl }} style={{ flex: 1 }} onNavigationStateChange={handleNavigationStateChange} />) : null}</View></Modal>
            )}
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
    reviewCountText: { color: '#94A3B8', fontSize: 12, marginLeft: 4 },
    locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
    locationText: { color: '#94A3B8', fontSize: 14 },
    sportBadgeContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 15 },
    sportBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0, 255, 0, 0.05)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(0, 255, 0, 0.15)' },
    sportBadgeText: { color: '#00FF00', fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
    sectionHeader: { paddingHorizontal: 20, marginTop: 25, marginBottom: 15 },
    sectionTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
    dateList: { paddingLeft: 20, gap: 12 },
    dateCard: { width: 70, height: 80, backgroundColor: '#1E293B', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    selectedDateCard: { backgroundColor: '#00FF00' },
    dateText: { color: '#FFF', fontSize: 18, fontWeight: '900' },
    monthText: { color: '#94A3B8', fontSize: 12 },
    activeDateText: { color: '#000' },
    aboutText: { color: '#94A3B8', fontSize: 15, lineHeight: 24, paddingHorizontal: 20 },
    reviewsSection: { paddingHorizontal: 20, marginTop: 30 },
    sectionHeaderInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    reviewCard: { backgroundColor: '#1E293B', padding: 20, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    reviewerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    reviewerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0, 255, 0, 0.1)', justifyContent: 'center', alignItems: 'center' },
    avatarInitial: { color: '#00FF00', fontSize: 16, fontWeight: '900' },
    reviewerName: { color: '#FFF', fontSize: 14, fontWeight: '800' },
    reviewDate: { color: '#64748B', fontSize: 10 },
    reviewStars: { flexDirection: 'row', gap: 2 },
    reviewComment: { color: '#94A3B8', fontSize: 14, lineHeight: 20 },
    emptyReviews: { alignItems: 'center', paddingVertical: 20 },
    emptyReviewsText: { color: '#475569', fontSize: 13 },
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
    slotCardSelected: { backgroundColor: '#00FF00' },
    slotText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
    slotTextSelected: { color: '#000' },
    slotTextBooked: { color: '#475569', textDecorationLine: 'line-through' },
    modalFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 25 },
    totalLabel: { color: '#94A3B8', fontSize: 12 },
    totalPrice: { color: '#FFF', fontSize: 20, fontWeight: '900' },
    payButton: { backgroundColor: '#00FF00', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 15 },
    payButtonDisabled: { backgroundColor: '#1E293B' },
    payButtonText: { color: '#000', fontWeight: '900' },
    courtCard: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#1E293B', borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', minWidth: 120 },
    courtCardActive: { borderColor: '#00FF00', backgroundColor: 'rgba(0, 255, 0, 0.1)' },
    courtName: { color: '#FFF', fontSize: 14, fontWeight: '800' },
    courtNameActive: { color: '#00FF00' },
    courtCategory: { color: '#64748B', fontSize: 10, fontWeight: '600', marginTop: 2 },
    leaveReviewBtnSmall: { backgroundColor: 'rgba(0, 255, 0, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    leaveReviewTextSmall: { color: '#00FF00', fontSize: 10, fontWeight: '800' },
    paymentModalContainer: { backgroundColor: '#131C31', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
    orderSummaryBox: { backgroundColor: 'rgba(0,255,0,0.1)', padding: 20, borderRadius: 20, marginBottom: 20, alignItems: 'center' },
    summaryValue: { color: '#00FF00', fontSize: 32, fontWeight: '900' },
    summaryVenueText: { color: '#FFF', marginTop: 5 },
    paymentMethodCard: { flexDirection: 'row', alignItems: 'center', gap: 15, padding: 20, backgroundColor: '#1E293B', borderRadius: 20, marginBottom: 10 },
    paymentMethodCardActive: { borderColor: '#00FF00', borderWidth: 1 },
    paymentMethodTitle: { color: '#94A3B8', fontSize: 16, fontWeight: '700' },
    paymentMethodTitleActive: { color: '#FFF' },
    confirmPayBtn: { backgroundColor: '#00FF00', padding: 20, borderRadius: 20, alignItems: 'center', marginTop: 20 },
    confirmPayBtnLoading: { opacity: 0.7 },
    confirmPayBtnText: { color: '#000', fontWeight: '900', fontSize: 16 },
    inputLabel: { color: '#64748B', fontSize: 11, fontWeight: '800', marginBottom: 8, letterSpacing: 1 },
    // Review Modal Styles
    reviewModalCard: { width: '100%', backgroundColor: '#0F172A', borderRadius: 30, padding: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    ratingSelectRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginVertical: 20 },
    reviewInput: { backgroundColor: '#1E293B', borderRadius: 15, padding: 20, color: '#FFF', minHeight: 120, textAlignVertical: 'top', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 20 },
    // Premium Success Modal Styles
    modalOverlayBlur: { flex: 1, backgroundColor: 'rgba(9, 14, 26, 0.95)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    successModalCard: { width: '100%', backgroundColor: '#0F172A', borderRadius: 30, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0, 255, 0, 0.2)', shadowColor: '#00FF00', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 30 },
    successIconBox: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#00FF00', justifyContent: 'center', alignItems: 'center', marginBottom: 25, shadowColor: '#00FF00', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 15 },
    successTitle: { color: '#FFF', fontSize: 26, fontWeight: '900', letterSpacing: 1, marginBottom: 10 },
    successSubtitle: { color: '#94A3B8', fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 30 },
    successDetailsBox: { width: '100%', backgroundColor: '#131C31', borderRadius: 20, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    successDetailRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
    successDetailText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
    successActionBtn: { width: '100%', backgroundColor: '#00FF00', paddingVertical: 18, borderRadius: 20, alignItems: 'center' },
    successActionText: { color: '#000', fontSize: 15, fontWeight: '900', letterSpacing: 1 }
});