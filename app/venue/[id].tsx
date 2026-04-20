import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, CheckCircle, ChevronRight, ChevronDown, Coffee, Info, MapPin, ParkingCircle, Share2, Shield, Star, Users, Wifi, X, ArrowRight, Navigation2, CreditCard, Banknote, Smartphone, Zap, Trophy, Medal } from 'lucide-react-native';
import React, { useState, useEffect, useCallback } from 'react';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut, SlideInUp, SlideOutDown, SlideInDown, FadeInLeft, FadeInRight, FadeInUp, FadeInDown } from "react-native-reanimated";
import { Dimensions, Image, Modal, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View, Pressable, Linking, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { WebView } from 'react-native-webview';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { VENUES } from '../../data/venues';
import { useBookingStore } from '../../store/bookingStore';
import apiClient from '../../src/api/apiClient';

const { width, height } = Dimensions.get('window');

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

    // Review States
    const [reviews, setReviews] = useState<any[]>([]);
    const [avgRating, setAvgRating] = useState('0.0');
    const [totalReviews, setTotalReviews] = useState(0);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [showReviewSuccess, setShowReviewSuccess] = useState(false);
    const [userRating, setUserRating] = useState(5);
    const [userComment, setUserComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    // Fetch Reviews Logic
    const fetchReviews = useCallback(async (vId: string) => {
        if (!vId || vId.length < 10) return;
        try {
            const res = await apiClient.get(`/api/reviews/${vId}`);
            if (res.data.success) {
                setReviews(res.data.data);
                setAvgRating(res.data.meta?.averageRating || '0.0');
                setTotalReviews(res.data.meta?.totalCount || 0);
            }
        } catch (error) {
            console.log('Review fetch error:', error);
        }
    }, []);

    useEffect(() => {
        if (id) {
            apiClient.get(`/api/venues/${id}`)
               .then(res => {
                   const v = res.data.data;
                   setFetchedVenue(v);
                   if (v?._id) fetchReviews(v._id);
                   if (v.courts && Array.isArray(v.courts)) {
                       const sportCourts = v.courts.filter((c: any) => !params.sport || c.category === params.sport);
                       if (sportCourts.length > 0) setSelectedCourt(sportCourts[0].name);
                   }
               })
               .catch(err => {
                   if (id.length > 20) fetchReviews(id as string);
               });
        }
    }, [id, fetchReviews]);

    const submitReview = async () => {
        const vId = fetchedVenue?._id || id;
        if (!vId || vId.length < 10) return alert("Calibrating ID...");
        if (!userComment.trim()) return;
        
        setSubmittingReview(true);
        try {
            const userData = await AsyncStorage.getItem('userInfo');
            const user = userData ? JSON.parse(userData) : null;
            
            await apiClient.post('/api/reviews', {
                venueId: vId,
                user: user ? `${user.first_name} ${user.last_name}` : 'Athletic Player',
                rating: userRating,
                comment: userComment
            });
            
            setUserComment('');
            setShowReviewModal(false);
            fetchReviews(vId);
            // Show Premium Success Modal instead of alert
            setTimeout(() => setShowReviewSuccess(true), 400);
        } catch (error) {
            alert("Submission Failed.");
        } finally {
            setSubmittingReview(false);
        }
    };

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
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [loading, setLoading] = useState(false);

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
            
            const isToday = selectedDate === 0;
            if (isToday) {
                const now = new Date();
                const currentHour = now.getHours();
                const getHourFromLabel = (label: string) => {
                    const [time, period] = label.split(' ');
                    let [hour] = time.split(':').map(Number);
                    if (period === 'PM' && hour !== 12) hour += 12;
                    if (period === 'AM' && hour === 12) hour = 0;
                    return hour;
                };
                const pastSlots = dynamicSlots.filter((s: any) => getHourFromLabel(s.label) <= currentHour).map((s: any) => s.label);
                setBookedSlots(Array.from(new Set([...allBookedTimes, ...pastSlots])));
            } else {
                setBookedSlots(allBookedTimes);
            }
        } catch (error) { console.error('Error fetching booked slots:', error); }
    };

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
            const venuePrice = venueData.price ? String(venueData.price).replace(/[^\d]/g, '') : '1500';
            const amount = selectedSlots.length * parseInt(venuePrice || '1500');

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
            const urlParts = url.split('?');
            const queryStr = urlParts.length > 1 ? urlParts[1] : '';
            const params: any = {};
            queryStr.split('&').forEach((part: any) => {
                const [key, val] = part.split('=');
                if (key) params[key] = decodeURIComponent(val || '');
            });
            const { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId } = params;
            try {
                await apiClient.post('/api/payments/verify', { razorpay_payment_id, razorpay_order_id, razorpay_signature, bookingId });
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
                status: 'Confirmed',
                color: 'bg-emerald-500'
            });
            setLoading(false);
            setShowPaymentModal(false);
            setShowSuccessModal(true);
            setSelectedSlots([]);
        } catch (error) { setLoading(false); alert("Booking Failed."); }
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
                        <View style={styles.ratingBadge}>
                            <Star color="#00FF00" size={14} fill="#00FF00" />
                            <Text style={styles.ratingText}>{avgRating}</Text>
                            <Text style={styles.reviewCountText}>({totalReviews})</Text>
                        </View>
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
                <Text style={styles.aboutText}>
                    {venueData.description || venueData.about || `${venueData.title} offers a world-class playing experience.`}
                </Text>

                {/* Amenities Section */}
                {venueData.amenities && venueData.amenities.length > 0 && (
                    <>
                        <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Amenities</Text></View>
                        <View style={styles.amenitiesGrid}>
                            {venueData.amenities.map((item: string, idx: number) => (
                                <View key={idx} style={styles.amenityItem}>
                                    <View style={styles.amenityIconBox}>
                                        {item.toLowerCase().includes('light') && <Zap color="#00FF00" size={16} />}
                                        {item.toLowerCase().includes('park') && <ParkingCircle color="#00FF00" size={16} />}
                                        {item.toLowerCase().includes('water') && <Coffee color="#00FF00" size={16} />}
                                        {item.toLowerCase().includes('wifi') && <Wifi color="#00FF00" size={16} />}
                                        {item.toLowerCase().includes('wash') && <Users color="#00FF00" size={16} />}
                                        {!['light', 'park', 'water', 'wifi', 'wash'].some(k => item.toLowerCase().includes(k)) && <Info color="#00FF00" size={16} />}
                                    </View>
                                    <Text style={styles.amenityText}>{item}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}

                {/* Reviews Section */}
                <View style={styles.reviewsSection}>
                    <View style={styles.sectionHeaderInner}>
                        <Text style={styles.sectionTitle}>Athlete Feedback</Text>
                        <TouchableOpacity style={styles.leaveReviewBtnSmall} onPress={() => setShowReviewModal(true)}>
                            <Text style={styles.leaveReviewTextSmall}>LEAVE REVIEW</Text>
                        </TouchableOpacity>
                    </View>

                    {reviews.length > 0 ? reviews.map((rev, idx) => (
                        <Animated.View key={rev._id || idx} entering={FadeInRight.delay(idx * 100)} style={styles.reviewCard}>
                            <View style={styles.reviewHeader}>
                                <View style={styles.reviewerInfo}>
                                    <View style={styles.reviewerAvatar}><Text style={styles.avatarInitial}>{(rev.user || 'A')[0]}</Text></View>
                                    <View>
                                        <Text style={styles.reviewerName}>{rev.user}</Text>
                                        <Text style={styles.reviewDate}>{new Date(rev.createdAt).toLocaleDateString()}</Text>
                                    </View>
                                </View>
                                <View style={styles.reviewStars}>
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} size={10} color={s <= rev.rating ? "#FDB813" : "#334155"} fill={s <= rev.rating ? "#FDB813" : "transparent"} />
                                    ))}
                                </View>
                            </View>
                            <Text style={styles.reviewComment}>{rev.comment}</Text>
                        </Animated.View>
                    )) : (
                        <View style={styles.emptyReviews}>
                            <Feather name="message-square" size={30} color="#1E293B" />
                            <Text style={styles.emptyReviewsText}>No battle reports yet. Be the first to review!</Text>
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* --- PREMIUM REVIEW MODAL (SMOOTHLinear) --- */}
            <Modal visible={showReviewModal} animationType="fade" transparent statusBarTranslucent>
                <View style={styles.modalOverlay}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={() => setShowReviewModal(false)}>
                        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                    </Pressable>
                    
                    <Animated.View entering={FadeInDown.duration(400)} style={styles.reviewModalContainer}>
                        <View style={styles.modalHandle} />
                        <View style={styles.modalHeader}>
                            <View><Text style={styles.modalTitle}>Commend Arena</Text><Text style={styles.modalSubtitle}>Rate your tactical experience</Text></View>
                            <TouchableOpacity onPress={() => setShowReviewModal(false)} style={styles.modalCloseCircle}><X color="#FFF" size={20} /></TouchableOpacity>
                        </View>

                        <View style={styles.modalBody}>
                            <View style={styles.ratingSection}>
                                <View style={styles.starPickerContainer}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <TouchableOpacity key={star} activeOpacity={0.7} onPress={() => setUserRating(star)} style={[styles.starBox, userRating === star && styles.starBoxActive]}>
                                            <Star size={32} color={star <= userRating ? "#FDB813" : "#334155"} fill={star <= userRating ? "#FDB813" : "transparent"} />
                                            {userRating === star && <Animated.View entering={ZoomIn} style={styles.activeStarDot} />}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <Text style={styles.ratingTextDisplay}>{userRating === 5 ? 'Elite' : userRating === 4 ? 'Great' : userRating === 3 ? 'Good' : userRating === 2 ? 'Fair' : 'Poor'}</Text>
                            </View>

                            <View style={styles.inputSection}>
                                <Text style={styles.inputLabel}>TACTICAL FEEDBACK</Text>
                                <View style={styles.premiumInputWrapper}>
                                    <TextInput style={styles.reviewInput} placeholder="Share your thoughts..." placeholderTextColor="#475569" multiline numberOfLines={4} value={userComment} onChangeText={setUserComment} />
                                </View>
                            </View>

                            <TouchableOpacity style={[styles.submitReviewBtn, (!userComment.trim() || submittingReview) && styles.submitBtnDisabled]} onPress={submitReview} disabled={!userComment.trim() || submittingReview}>
                                {submittingReview ? <ActivityIndicator color="#090E1A" /> : (
                                    <>
                                        <Text style={styles.submitReviewBtnText}>SUBMIT BATTLE REPORT</Text>
                                        <Zap color="#090E1A" size={16} fill="#090E1A" />
                                    </>
                                )}
                            </TouchableOpacity>
                            <View style={styles.xpRewardBadge}><FontAwesome5 name="medal" size={12} color="#FDB813" /><Text style={styles.xpRewardText}>EARN +20 XP ON SUBMISSION</Text></View>
                        </View>
                    </Animated.View>
                </View>
            </Modal>

            {/* --- REVIEW SUCCESS MODAL --- */}
            <Modal visible={showReviewSuccess} transparent animationType="fade">
                <View style={styles.successOverlay}>
                    <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
                    <Animated.View entering={ZoomIn.duration(400)} style={styles.victoryCard}>
                        <View style={styles.trophyContainer}>
                            <Medal color="#00FF00" size={60} />
                            <Animated.View entering={FadeIn.delay(300)} style={styles.xpBadgeSuccess}>
                                <Text style={styles.xpBadgeText}>+20 XP</Text>
                            </Animated.View>
                        </View>
                        <Text style={styles.victoryTitle}>COMMENDATION SAVED!</Text>
                        <Text style={styles.victorySubtitle}>Your battle report has been verified. XP added to your athlete profile.</Text>
                        <TouchableOpacity style={styles.returnButton} onPress={() => setShowReviewSuccess(false)}>
                            <Text style={styles.returnButtonText}>RETURN TO ARENA</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>

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
                        <View style={{ paddingHorizontal: 20, marginBottom: 15 }}>
                            <Text style={styles.inputLabel}>CHOOSE ARENA / COURT</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingTop: 10 }}>
                                {(venueData.courts || [{ name: 'Main Arena (5v5)', category: 'Football' }]).map((court: any, idx: number) => (
                                    <TouchableOpacity key={idx} style={[styles.courtCard, selectedCourt === court.name && styles.courtCardActive]} onPress={() => setSelectedCourt(court.name)}>
                                        <Text style={[styles.courtName, selectedCourt === court.name && styles.courtNameActive]}>{court.name}</Text>
                                        <Text style={styles.courtCategory}>{court.category || 'Football'}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                        <ScrollView style={{ maxHeight: 400 }}><View style={styles.slotsGrid}>
                            {dynamicSlots.map((slot: any) => {
                                const isBooked = bookedSlots.includes(slot.label);
                                const isSelected = selectedSlots.includes(slot.id);
                                return (<TouchableOpacity key={slot.id} style={[styles.slotCard, isBooked && styles.slotCardBooked, isSelected && styles.slotCardSelected]} onPress={() => !isBooked && toggleSlot(slot.id)} disabled={isBooked}><Text style={[styles.slotText, isSelected && styles.slotTextSelected, isBooked && styles.slotTextBooked]}>{slot.label}</Text></TouchableOpacity>);
                            })}
                        </View></ScrollView>
                        <View style={styles.modalFooter}>
                            <View><Text style={styles.totalLabel}>Total Amount</Text><Text style={styles.totalPrice}>₹{selectedSlots.length * parseInt(String(venueData.price).replace('₹', ''))}</Text></View>
                            <TouchableOpacity disabled={selectedSlots.length === 0} style={[styles.payButton, selectedSlots.length === 0 && styles.payButtonDisabled]} onPress={() => { setShowBookingModal(false); setTimeout(() => setShowPaymentModal(true), 300); }}><Text style={styles.payButtonText}>CHECKOUT</Text></TouchableOpacity>
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
                        <View style={styles.orderSummaryBox}><Text style={styles.summaryValue}>₹{selectedSlots.length * parseInt(String(venueData.price).replace('₹', ''))}</Text><Text style={styles.summaryVenueText}>{venueData.title} • {selectedSlots.length} slot(s)</Text></View>
                        <TouchableOpacity onPress={() => setPaymentMethod('card')} style={[styles.paymentMethodCard, paymentMethod === 'card' && styles.paymentMethodCardActive]}><CreditCard size={20} color={paymentMethod === 'card' ? "#00FF00" : "#94A3B8"} /><Text style={[styles.paymentMethodTitle, paymentMethod === 'card' && styles.paymentMethodTitleActive]}>Razorpay (Online)</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => setPaymentMethod('cash')} style={[styles.paymentMethodCard, paymentMethod === 'cash' && styles.paymentMethodCardActive]}><Banknote size={20} color={paymentMethod === 'cash' ? "#00FF00" : "#94A3B8"} /><Text style={[styles.paymentMethodTitle, paymentMethod === 'cash' && styles.paymentMethodTitleActive]}>Pay at Arena</Text></TouchableOpacity>
                        <TouchableOpacity disabled={loading} style={[styles.confirmPayBtn, loading && styles.confirmPayBtnLoading]} onPress={handleConfirmPayment}><Text style={styles.confirmPayBtnText}>{loading ? 'PROCESSING...' : 'CONFIRM BOOKING'}</Text></TouchableOpacity>
                    </Animated.View>
                </View>
            </Modal>

            {/* Webview */}
            <Modal visible={showWebView} animationType="slide" onRequestClose={() => setShowWebView(false)}>
                <View style={{ flex: 1, backgroundColor: '#070A14' }}>
                    <View style={[styles.modalHeader, { padding: 20, paddingTop: 50, backgroundColor: '#131C31' }]}><Text style={styles.modalTitle}>Secure Checkout</Text><TouchableOpacity onPress={() => setShowWebView(false)}><X color="#FFF" size={24} /></TouchableOpacity></View>
                    {checkoutUrl ? (<WebView source={{ uri: checkoutUrl }} onNavigationStateChange={handleWebViewNavigationStateChange} style={{ flex: 1 }} startInLoadingState={true} renderLoading={() => (<View style={[StyleSheet.absoluteFill, { backgroundColor: '#070A14', justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator size="large" color="#00FF00" /><Text style={{ color: '#00FF00', marginTop: 10, fontWeight: '900' }}>INITIALIZING GATEWAY...</Text></View>)} />) : null}
                </View>
            </Modal>

            {/* Booking Success Modal */}
            <Modal visible={showSuccessModal} transparent={true} animationType="fade">
                <View style={styles.successOverlay}>
                    <View style={styles.modalOverlaySolid} />
                    <Animated.View entering={ZoomIn} style={styles.successCard}><CheckCircle color="#00FF00" size={60} /><Text style={styles.successTitle}>BOOKING CONFIRMED!</Text><TouchableOpacity style={styles.homeButton} onPress={() => { setShowSuccessModal(false); router.push('/(tabs)/home'); }}><Text style={styles.homeButtonText}>GO TO HOME</Text></TouchableOpacity></Animated.View>
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
    amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingHorizontal: 20, marginTop: 10 },
    amenityItem: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1E293B', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    amenityIconBox: { width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(0,255,0,0.1)', justifyContent: 'center', alignItems: 'center' },
    amenityText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
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
    homeButtonText: { color: '#000', fontWeight: '900' },
    inputLabel: { color: '#64748B', fontSize: 11, fontWeight: '800', marginBottom: 8, letterSpacing: 1 },
    courtCard: { paddingHorizontal: 20, paddingVertical: 12, backgroundColor: '#1E293B', borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', minWidth: 100, alignItems: 'center' },
    courtCardActive: { borderColor: '#00FF00', backgroundColor: 'rgba(0, 255, 0, 0.1)' },
    courtName: { color: '#FFF', fontSize: 14, fontWeight: '800' },
    courtNameActive: { color: '#00FF00' },
    courtCategory: { color: '#64748B', fontSize: 10, fontWeight: '600', marginTop: 2 },
    
    // Review Styles
    reviewsSection: { paddingHorizontal: 20, marginTop: 30 },
    sectionHeaderInner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    reviewCard: { backgroundColor: '#1E293B', padding: 20, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
    reviewerInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    reviewerAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0, 255, 0, 0.1)', justifyContent: 'center', alignItems: 'center' },
    avatarInitial: { color: '#00FF00', fontSize: 16, fontWeight: '900' },
    reviewerName: { color: '#FFF', fontSize: 14, fontWeight: '800' },
    reviewDate: { color: '#64748B', fontSize: 10, marginTop: 2 },
    reviewStars: { flexDirection: 'row', gap: 2 },
    reviewComment: { color: '#94A3B8', fontSize: 14, lineHeight: 20 },
    emptyReviews: { alignItems: 'center', paddingVertical: 40, gap: 15 },
    emptyReviewsText: { color: '#475569', fontSize: 13, textAlign: 'center', maxWidth: 200 },
    seeAllText: { color: '#00FF00', fontSize: 12, fontWeight: '700' },
    reviewModalContainer: { backgroundColor: '#131C31', borderTopLeftRadius: 35, borderTopRightRadius: 35, padding: 25, paddingBottom: 50, width: '100%' },
    ratingLabel: { color: '#00FF00', fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 15, marginTop: 10 },
    starPicker: { flexDirection: 'row', justifyContent: 'center', gap: 15, marginBottom: 25 },
    reviewInputContainer: { backgroundColor: '#1E293B', borderRadius: 20, padding: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', marginBottom: 25 },
    reviewInput: { color: '#FFF', fontSize: 15, textAlignVertical: 'top', height: 120, padding: 15 },
    submitReviewBtn: { backgroundColor: '#00FF00', paddingVertical: 18, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    submitReviewBtnText: { color: '#090E1A', fontSize: 14, fontWeight: '900' },
    xpBonusText: { color: '#64748B', fontSize: 10, fontWeight: '800', textAlign: 'center', marginTop: 15, letterSpacing: 1 },
    modalBody: { paddingVertical: 10 },
    reviewCountText: { color: '#94A3B8', fontSize: 12, marginLeft: 4, fontWeight: '600' },

    leaveReviewBtnSmall: { backgroundColor: 'rgba(0, 255, 0, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(0, 255, 0, 0.2)' },
    leaveReviewTextSmall: { color: '#00FF00', fontSize: 10, fontWeight: '800' },
    modalHandle: { width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
    modalSubtitle: { color: '#94A3B8', fontSize: 12, marginTop: 4 },
    modalCloseCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
    ratingSection: { alignItems: 'center', paddingVertical: 20 },
    starPickerContainer: { flexDirection: 'row', gap: 12 },
    starBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: '#1E293B', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
    starBoxActive: { borderColor: '#FDB813', backgroundColor: 'rgba(253, 184, 19, 0.05)' },
    activeStarDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#FDB813', marginTop: 4 },
    ratingTextDisplay: { color: '#FDB813', fontSize: 14, fontWeight: '900', marginTop: 15, letterSpacing: 2, textTransform: 'uppercase' },
    inputSection: { marginTop: 10 },
    premiumInputWrapper: { backgroundColor: '#1E293B', borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', overflow: 'hidden' },
    submitBtnDisabled: { opacity: 0.5, backgroundColor: '#1E293B' },
    xpRewardBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center', marginTop: 20, backgroundColor: 'rgba(253, 184, 19, 0.05)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    xpRewardText: { color: '#FDB813', fontSize: 10, fontWeight: '800' },

    // Success Modal Styles
    victoryCard: { width: '85%', backgroundColor: '#131C31', borderRadius: 35, padding: 35, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0, 255, 0, 0.2)', shadowColor: '#00FF00', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
    trophyContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(0, 255, 0, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
    xpBadgeSuccess: { position: 'absolute', bottom: 0, backgroundColor: '#00FF00', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10 },
    xpBadgeText: { color: '#000', fontSize: 12, fontWeight: '900' },
    victoryTitle: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: 1, textAlign: 'center' },
    victorySubtitle: { color: '#94A3B8', fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 22 },
    returnButton: { backgroundColor: '#00FF00', paddingHorizontal: 40, paddingVertical: 18, borderRadius: 20, marginTop: 35, width: '100%', alignItems: 'center' },
    returnButtonText: { color: '#000', fontSize: 16, fontWeight: '900' }
});