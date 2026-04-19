import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, CheckCircle, ChevronRight, ChevronDown, Coffee, Info, MapPin, ParkingCircle, Share2, Shield, Star, Users, Wifi, X, ArrowRight, Navigation2, CreditCard, Banknote, Smartphone } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut, SlideInUp, SlideOutDown, SlideInDown, FadeInLeft, FadeInRight, FadeInUp, FadeInDown } from "react-native-reanimated";
import { Dimensions, Image, Modal, ScrollView, Share, StyleSheet, Text, TouchableOpacity, View, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { VENUES } from '../../data/venues';

const { width } = Dimensions.get('window');

import { useBookingStore } from '../../store/bookingStore';
import apiClient from '../../src/api/apiClient';


export default function VenueDetailsScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { id, title } = params;
    const [fetchedVenue, setFetchedVenue] = useState<any>(null);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    
    // 1. Move venueData to the top to avoid temporal dead zone / reference errors
    const venueData: any = fetchedVenue || VENUES.find(v => v.id === id || v.title === title) || {
        ...params,
        location: params.dist || 'Sindhu Bhavan Road, Ahmedabad',
        description: 'This premium arena features FIFA-approved artificial grass, high-intensity LED floodlights. Perfect for matches.',
        amenities: [
            { id: 'parking', label: 'Parking', iconName: 'ParkingCircle' },
            { id: 'wifi', label: 'Free WiFi', iconName: 'Wifi' },
        ],
        price: params.price ? String(params.price).replace('₹', '') : '1500',
        images: []
    };

    useEffect(() => {
        if (id) {
            apiClient.get(`/api/venues/${id}`)
               .then(res => {
                   const v = res.data.data;
                   setFetchedVenue(v);
                   // Auto-select first court if available for this sport
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

    // Generate dynamic dates (Next 14 days)
    const dates = React.useMemo(() => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < 8; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            const day = d.getDate();
            const month = d.toLocaleString('default', { month: 'short' });
            const year = d.getFullYear();
            days.push({
                day: day,
                month: month,
                fullDate: `${day} ${month} ${year}`, // Format: "18 Feb 2026" (No comma, matching site)
            });
        }
        return days;
    }, []);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(0);
    const [selectedCourt, setSelectedCourt] = useState<string>('');
    const [showCourtDropdown, setShowCourtDropdown] = useState(false);
    const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
    const addBooking = useBookingStore((state: any) => state.addBooking);

    // Payment specific state
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');

    // Dynamically derive time slots from backend venue data
    const dynamicSlots = React.useMemo(() => {
        // Log for debugging (will show in the console)
        if (fetchedVenue) {
            console.log(`Venue "${fetchedVenue.name}" loaded with ${fetchedVenue.slots?.length || 0} slots from DB.`);
        }

        if (venueData && venueData.slots && venueData.slots.length > 0) {
            return venueData.slots.map((s: string) => ({
                id: s,
                label: s,
                status: 'available'
            }));
        }

        // Improved Fallback: If it's a mock venue, provide varied slots to feel more "dynamic"
        // If it's a real venue but has no slots, we use these as a base
        const baseSlots = [
            "06:00 AM", "07:00 AM", "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM",
            "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM", "09:00 PM"
        ];

        // Seeded randomization based on ID to make different venues look different
        const seed = String(id).length;
        const filtered = baseSlots.filter((_, idx) => (idx + seed) % 2 === 0 || idx > 6);

        return filtered.map(s => ({
            id: s,
            label: s,
            status: 'available'
        }));
    }, [fetchedVenue, id, venueData.slots]);

    const toggleSlot = (id: string) => {
        if (selectedSlots.includes(id)) {
            setSelectedSlots(prev => prev.filter(mid => mid !== id));
        } else {
            setSelectedSlots(prev => [...prev, id]);
        }
    };

    const [bookedSlots, setBookedSlots] = useState<string[]>([]);

    useEffect(() => {
        if (showBookingModal) {
            fetchBookedSlots();
        }
    }, [selectedDate, selectedCourt, showBookingModal]);

    const fetchBookedSlots = async () => {
        try {
            // Use the dynamic date string
            const dateStr = dates[selectedDate].fullDate;
            const venueName = venueData.name || venueData.title || title;
            
            // Use the specific public endpoint designed for UI slot blocking
            // This endpoint is much faster and doesn't filter by your own user ID
            const res = await apiClient.get(`/api/bookings/public?turfName=${encodeURIComponent(venueName)}&date=${encodeURIComponent(dateStr)}`);
            
            const matchingBookings = res.data.data || [];
            const slots = matchingBookings.map((b: any) => b.timeSlot);
                        // Handle multi-slot bookings and format matching
            const allBookedTimes: string[] = [];
            slots.forEach((s: string) => {
                if (s && typeof s === 'string') {
                    // If the backend slot is "12:00 PM (Turf A) - 1h"
                    // and the app slot is "12:00 PM", we need to match it.
                    // Also filter by selected court if the user has picked one
                    if (selectedCourt && !s.includes(selectedCourt)) return;
                    
                    const timePart = s.split(' (')[0]; // Extracts "12:00 PM"
                    allBookedTimes.push(timePart);
                }
            });
            setBookedSlots(allBookedTimes);
        } catch (error: any) {
            console.error('Error fetching booked slots:', error.message);
            // If it's a 404, the endpoint might be missing or renamed, fallback to empty
            if (error.response?.status === 404) {
                setBookedSlots([]);
            }
        }
    };

    const [loading, setLoading] = useState(false);

    const openPaymentGateway = () => {
        if (selectedSlots.length === 0) return;
        setShowBookingModal(false);
        setTimeout(() => setShowPaymentModal(true), 300); // Slight delay for smooth modal transition
    };

    const handleConfirmPayment = async () => {
        setLoading(true);
        
        // Simulate real-world payment gateway processing delay (3 seconds)
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // After "payment" is successful, finalize booking
        await submitBooking();
    };

    const submitBooking = async () => {
        // Create a display string for time
        const timeDisplay = selectedSlots.sort().map(sid => {
            const slot = dynamicSlots.find(s => s.id === sid);
            return slot ? slot.label : sid;
        }).join(' & ');

        try {
            const userData = await AsyncStorage.getItem('userInfo');
            const user = userData ? JSON.parse(userData) : null;
            const uid = user?._id || user?.id;

            if (!uid) {
                alert("Please login first to make a booking.");
                setLoading(false);
                setShowPaymentModal(false); // Close payment modal if login required
                return;
            }

            // Use selected court or default to first from the array
            const finalCourt = selectedCourt || (Array.isArray(venueData.courts) && venueData.courts.length > 0 
                ? venueData.courts.find((c: any) => !params.sport || c.category === params.sport)?.name || venueData.courts[0].name
                : 'Main Arena (5v5)');

            const finalBookingPayload = {
                userId: uid,
                turfName: venueData.title || title as string,
                sport: 'Football',
                date: dates[selectedDate].fullDate,
                timeSlot: `${timeDisplay} (${finalCourt}) - 1h`,
                price: String(selectedSlots.length * parseInt(String(venueData.price).replace('₹', ''))),
                status: 'Confirmed'
            };

            await apiClient.post('/api/bookings', finalBookingPayload);

            
            // Update local store as well for UI consistency if needed
            const newBooking = {
                id: Date.now().toString(),
                arena: finalBookingPayload.turfName,
                sport: finalBookingPayload.sport,
                date: finalBookingPayload.date,
                time: finalBookingPayload.timeSlot,
                location: venueData.location || 'Ahmedabad',
                image: (venueData.image as string) || 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=500',
                status: 'Confirmed'
            };
            addBooking(newBooking);

            setLoading(false);
            setShowPaymentModal(false);
            setTimeout(() => {
                setShowSuccessModal(true);
                setSelectedSlots([]);
            }, 300);

        } catch (error: any) {
            setLoading(false);
            console.error(error);
            // Close modal to show alert clearly
            setShowPaymentModal(false);
            setTimeout(() => {
                 // Using simple alert as backup
                 alert(error.response?.data?.msg || 'Booking Failed. Is backend running?');
            }, 500);
        }
    };



    // Prepare robust image array
    const imageArray = venueData.images && venueData.images.length > 0 
        ? venueData.images 
        : [venueData.image || params.image || 'https://images.unsplash.com/photo-1574629810360-7efbb1925713?q=80&w=600'];

    // Map backend amenities string array to icon objects
    const finalAmenities = React.useMemo(() => {
        const source = (fetchedVenue && fetchedVenue.amenities) ? fetchedVenue.amenities : (venueData.amenities || []);
        
        return source.map((am: any) => {
            // If it's already an object (from mock data), return it
            if (typeof am === 'object') return am;

            let iconName = 'Info';
            const lowerAm = am.toLowerCase();
            
            if (lowerAm.includes('park')) iconName = 'ParkingCircle';
            else if (lowerAm.includes('wifi')) iconName = 'Wifi';
            else if (lowerAm.includes('water') || lowerAm.includes('drink') || lowerAm.includes('coffee') || lowerAm.includes('cafe')) iconName = 'Coffee';
            else if (lowerAm.includes('security') || lowerAm.includes('cctv') || lowerAm.includes('safe') || lowerAm.includes('guard')) iconName = 'Shield';
            else if (lowerAm.includes('medical') || lowerAm.includes('aid') || lowerAm.includes('doctor')) iconName = 'Info';
            else if (lowerAm.includes('change') || lowerAm.includes('wash') || lowerAm.includes('shower') || lowerAm.includes('toilet') || lowerAm.includes('restroom')) iconName = 'Users';
            else if (lowerAm.includes('light') || lowerAm.includes('flood')) iconName = 'Star';
            else if (lowerAm.includes('ball') || lowerAm.includes('equip') || lowerAm.includes('rent')) iconName = 'Info';
            
            return { id: am, label: am, iconName };
        });
    }, [fetchedVenue, venueData]);

    const getIcon = (iconName: string) => {
        const props = { color: "#00FF00", size: 24 };
        switch (iconName) {
            case 'ParkingCircle': return <ParkingCircle {...props} />;
            case 'Wifi': return <Wifi {...props} />;
            case 'Coffee': return <Coffee {...props} />;
            case 'Shield': return <Shield {...props} />;
            case 'Users': return <Users {...props} />;
            case 'Star': return <Star {...props} />;
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
                <ScrollView 
                    horizontal 
                    pagingEnabled 
                    showsHorizontalScrollIndicator={false}
                    onScroll={(e) => {
                        const slide = Math.round(e.nativeEvent.contentOffset.x / width);
                        setActiveImageIndex(slide);
                    }}
                    scrollEventThrottle={16}
                >
                    {imageArray.map((img: string, idx: number) => (
                        <Image key={idx} source={{ uri: img }} style={styles.heroImage} />
                    ))}
                </ScrollView>
                <View style={styles.paginationDots}>
                    {imageArray.length > 1 && imageArray.map((_: any, idx: number) => (
                        <View key={idx} style={[styles.dot, activeImageIndex === idx ? styles.activeDot : null]} />
                    ))}
                </View>
                <View style={styles.heroOverlay} pointerEvents="box-none">
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
                    {finalAmenities?.map((item: any, index: number) => (
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
                    {dates.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => setSelectedDate(index)}
                            style={[styles.dateCard, selectedDate === index && styles.selectedDateCard]}
                        >
                            <Text style={[styles.dateText, selectedDate === index && styles.activeDateText]}>{item.day}</Text>
                            <Text style={[styles.monthText, selectedDate === index && styles.activeDateText]}>{item.month}</Text>
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
                <View style={StyleSheet.absoluteFill}>
                    <Pressable style={styles.modalOverlay} onPress={() => setShowBookingModal(false)}>
                        <View style={styles.modalOverlaySolid} />
                    </Pressable>
                    <View style={styles.modalOverlay} pointerEvents="box-none">
                        <Animated.View entering={FadeInUp.duration(300)} exiting={FadeOut.duration(200)} 
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

                        {/* COURT SELECTOR (DROPDOWN STYLE LIKE SITE) */}
                        <View style={styles.modalSection}>
                            <Text style={styles.courtLabel}>PICK ARENA / COURT</Text>
                            <TouchableOpacity 
                                style={styles.dropdownTrigger}
                                onPress={() => setShowCourtDropdown(!showCourtDropdown)}
                            >
                                <Text style={styles.dropdownText}>
                                    {selectedCourt || "Choose your preferred ground..."}
                                </Text>
                                <ChevronDown color="#64748B" size={18} />
                            </TouchableOpacity>

                            {showCourtDropdown && (
                                <View style={styles.dropdownMenu}>
                                    {Array.isArray(venueData.courts) && venueData.courts.length > 0 ? (
                                        venueData.courts
                                            .filter((c: any) => {
                                                if (!params.sport) return true;
                                                return c.category?.toLowerCase() === (params.sport as string).toLowerCase();
                                            })
                                            .map((court: any) => (
                                                <TouchableOpacity 
                                                    key={court._id || court.name} 
                                                    onPress={() => {
                                                        setSelectedCourt(court.name);
                                                        setShowCourtDropdown(false);
                                                    }}
                                                    style={styles.dropdownItem}
                                                >
                                                    <View>
                                                        <Text style={styles.dropdownItemText}>{court.name}</Text>
                                                        <Text style={{ color: '#00FF00', fontSize: 10, fontWeight: '600', marginTop: 2 }}>{court.category}</Text>
                                                    </View>
                                                    <Text style={[styles.dropdownItemText, { color: '#FFF' }]}>₹{court.price || venueData.price}</Text>
                                                </TouchableOpacity>
                                            ))
                                    ) : (
                                        <TouchableOpacity 
                                            onPress={() => {
                                                setSelectedCourt('Main Arena (5v5)');
                                                setShowCourtDropdown(false);
                                            }}
                                            style={styles.dropdownItem}
                                        >
                                            <Text style={styles.dropdownItemText}>Main Arena (5v5)</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            )}
                        </View>

                        <ScrollView contentContainerStyle={styles.slotsGrid} showsVerticalScrollIndicator={false}>
                            {dynamicSlots.map((slot) => {
                                const isSelected = selectedSlots.includes(slot.id);
                                const isBooked = bookedSlots.includes(slot.label) || slot.status === 'booked'; // Check dynamic booking or static
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
                                    ₹{selectedSlots.length * parseInt(String(venueData.price).replace('₹', ''))}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.payButton, selectedSlots.length === 0 && styles.payButtonDisabled]}
                                disabled={selectedSlots.length === 0}
                                onPress={openPaymentGateway}
                            >
                                <Text style={styles.payButtonText}>CHECKOUT</Text>
                                <ArrowLeft color="#000" size={20} style={{ transform: [{ rotate: '180deg' }] }} />
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </View>
        </Modal>

            {/* PAYMENT GATEWAY MODAL */}
            <Modal
                visible={showPaymentModal}
                transparent={true}
                animationType="slide"
            >
                <View style={StyleSheet.absoluteFill}>
                    <Pressable style={styles.modalOverlay} onPress={() => setShowPaymentModal(false)}>
                        <View style={styles.modalOverlaySolid} />
                    </Pressable>
                    <View style={styles.modalOverlay} pointerEvents="box-none">
                        <Animated.View entering={SlideInDown.duration(400)} style={styles.paymentModalContainer}>
                        <View style={styles.modalHeader}>
                            <View>
                                <Text style={styles.modalTitle}>Checkout</Text>
                                <Text style={styles.modalSubtitle}>Select payment method</Text>
                            </View>
                            <TouchableOpacity style={styles.closeButton} onPress={() => setShowPaymentModal(false)}>
                                <Feather name="x" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        {/* Order Summary Strip */}
                        <View style={styles.orderSummaryBox}>
                            <View>
                                <Text style={styles.summaryLabel}>Total Amount</Text>
                                <Text style={styles.summaryValue}>₹{selectedSlots.length * parseInt(String(venueData.price).replace('₹', ''))}</Text>
                            </View>
                            <View style={styles.summaryVenue}>
                                <Text style={styles.summaryVenueText}>{venueData.title}</Text>
                                <Text style={styles.summaryTimeText}>{selectedSlots.length} slot(s)</Text>
                            </View>
                        </View>

                        {/* Payment Methods */}
                        <Text style={styles.paymentSectionTitle}>Payment Options</Text>
                        
                        <TouchableOpacity 
                            style={[styles.paymentMethodCard, paymentMethod === 'card' && styles.paymentMethodCardActive]}
                            onPress={() => setPaymentMethod('card')}
                        >
                            <View style={styles.paymentMethodLeft}>
                                <View style={[styles.paymentIconBox, paymentMethod === 'card' && styles.paymentIconBoxActive]}>
                                    <CreditCard size={20} color={paymentMethod === 'card' ? "#00FF00" : "#94A3B8"} />
                                </View>
                                <View>
                                    <Text style={[styles.paymentMethodTitle, paymentMethod === 'card' && styles.paymentMethodTitleActive]}>Credit / Debit Card</Text>
                                    <Text style={styles.paymentMethodDesc}>Pay securely with Visa, Mastercard, etc.</Text>
                                </View>
                            </View>
                            <View style={[styles.radioCircle, paymentMethod === 'card' && styles.radioCircleActive]}>
                                {paymentMethod === 'card' && <View style={styles.radioDot} />}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.paymentMethodCard, paymentMethod === 'upi' && styles.paymentMethodCardActive]}
                            onPress={() => setPaymentMethod('upi')}
                        >
                            <View style={styles.paymentMethodLeft}>
                                <View style={[styles.paymentIconBox, paymentMethod === 'upi' && styles.paymentIconBoxActive]}>
                                    <Smartphone size={20} color={paymentMethod === 'upi' ? "#00FF00" : "#94A3B8"} />
                                </View>
                                <View>
                                    <Text style={[styles.paymentMethodTitle, paymentMethod === 'upi' && styles.paymentMethodTitleActive]}>UPI (GPay, PhonePe)</Text>
                                    <Text style={styles.paymentMethodDesc}>Instant payment via UPI apps.</Text>
                                </View>
                            </View>
                            <View style={[styles.radioCircle, paymentMethod === 'upi' && styles.radioCircleActive]}>
                                {paymentMethod === 'upi' && <View style={styles.radioDot} />}
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={[styles.paymentMethodCard, paymentMethod === 'cash' && styles.paymentMethodCardActive]}
                            onPress={() => setPaymentMethod('cash')}
                        >
                            <View style={styles.paymentMethodLeft}>
                                <View style={[styles.paymentIconBox, paymentMethod === 'cash' && styles.paymentIconBoxActive]}>
                                    <Banknote size={20} color={paymentMethod === 'cash' ? "#00FF00" : "#94A3B8"} />
                                </View>
                                <View>
                                    <Text style={[styles.paymentMethodTitle, paymentMethod === 'cash' && styles.paymentMethodTitleActive]}>Pay at Arena</Text>
                                    <Text style={styles.paymentMethodDesc}>Pay in cash when you arrive.</Text>
                                </View>
                            </View>
                            <View style={[styles.radioCircle, paymentMethod === 'cash' && styles.radioCircleActive]}>
                                {paymentMethod === 'cash' && <View style={styles.radioDot} />}
                            </View>
                        </TouchableOpacity>

                        {/* Pay Button */}
                        <View style={styles.paymentFooter}>
                            <TouchableOpacity
                                style={[styles.confirmPayBtn, loading && styles.confirmPayBtnLoading]}
                                disabled={loading}
                                onPress={handleConfirmPayment}
                            >
                                <Text style={styles.confirmPayBtnText}>
                                    {loading ? 'PROCESSING SECURELY...' : `PAY ₹${selectedSlots.length * parseInt(String(venueData.price).replace('₹', ''))}`}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </View>
        </Modal>
            {/* 8. SUCCESS MODAL */}
            <Modal
                visible={showSuccessModal}
                transparent={true}
                animationType="fade"
            >
                <Pressable style={styles.successOverlay} onPress={() => setShowSuccessModal(false)}>
                    <View style={styles.modalOverlaySolid} />
                </Pressable>
                <View style={styles.successOverlay} pointerEvents="box-none">
                    <Animated.View entering={ZoomIn.duration(300)} exiting={ZoomOut.duration(200)} 
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
                    </Animated.View>
                </View>
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
    heroImage: { width: width, height: '100%', resizeMode: 'cover' },
    paginationDots: { position: 'absolute', bottom: 30, flexDirection: 'row', width: '100%', justifyContent: 'center', gap: 8 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.4)' },
    activeDot: { backgroundColor: '#00FF00', width: 24 },
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
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
    },
    modalOverlaySolid: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
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

    modalSection: { paddingHorizontal: 20, marginBottom: 25 },
    courtLabel: { color: '#00FF00', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15 },
    dropdownTrigger: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        backgroundColor: '#070A14', 
        paddingHorizontal: 20, 
        paddingVertical: 18, 
        borderRadius: 20, 
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.1)' 
    },
    dropdownText: { color: '#FFF', fontSize: 14, fontWeight: '800', italic: 'true' },
    dropdownMenu: { 
        backgroundColor: '#131C31', 
        marginTop: 10, 
        borderRadius: 20, 
        borderWidth: 1, 
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden'
    },
    dropdownItem: { 
        padding: 18, 
        borderBottomWidth: 1, 
        borderBottomColor: 'rgba(255,255,255,0.05)',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    dropdownItemText: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },

    slotsGrid: { padding: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 40 },
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
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
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

    // --- PAYMENT MODAL STYLES ---
    paymentModalContainer: {
        backgroundColor: '#070A14',
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        padding: 25,
        height: '80%',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#00FF00',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 30,
        elevation: 10,
    },
    orderSummaryBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#1E293B',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(0, 255, 0, 0.2)',
        marginBottom: 30,
    },
    summaryLabel: { color: '#94A3B8', fontSize: 12, fontWeight: '700', marginBottom: 4 },
    summaryValue: { color: '#00FF00', fontSize: 28, fontWeight: '900', letterSpacing: 1 },
    summaryVenue: { alignItems: 'flex-end' },
    summaryVenueText: { color: '#FFF', fontSize: 15, fontWeight: '800', marginBottom: 4 },
    summaryTimeText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
    
    paymentSectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', marginBottom: 15 },
    paymentMethodCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#0F172A',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    paymentMethodCardActive: {
        borderColor: '#00FF00',
        backgroundColor: 'rgba(0, 255, 0, 0.05)',
    },
    paymentMethodLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        flex: 1,
    },
    paymentIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
    },
    paymentIconBoxActive: {
        backgroundColor: 'rgba(0, 255, 0, 0.15)',
    },
    paymentMethodTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 4 },
    paymentMethodTitleActive: { color: '#00FF00' },
    paymentMethodDesc: { color: '#64748B', fontSize: 12, fontWeight: '500' },
    radioCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: '#334155',
        justifyContent: 'center',
        alignItems: 'center',
    },
    radioCircleActive: {
        borderColor: '#00FF00',
    },
    radioDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#00FF00',
    },
    paymentFooter: {
        marginTop: 'auto',
        paddingTop: 15,
    },
    confirmPayBtn: {
        backgroundColor: '#00FF00',
        paddingVertical: 18,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#00FF00',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    confirmPayBtnLoading: {
        backgroundColor: '#22C55E',
        opacity: 0.8,
    },
    confirmPayBtnText: {
        color: '#000',
        fontWeight: '900',
        fontSize: 16,
        letterSpacing: 1,
    },
});