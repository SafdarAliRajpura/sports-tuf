import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';
import api from '../../config/api';

export default function PartnerBookings() {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;

    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await api.get('/bookings/partner');
            setBookings(res.data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return '#22C55E';
            case 'completed': return '#3B82F6';
            case 'cancelled': return '#EF4444';
            default: return '#94A3B8';
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <Animated.View entering={FadeInUp.duration(600)} style={[styles.header, isMobile && styles.headerMobile]}>
                <View style={styles.headerTextGroup}>
                    <Text style={styles.headerTitle}>BOOKINGS</Text>
                    <Text style={styles.headerSubtitle}>Monitor and manage upcoming reservations.</Text>
                </View>
                <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statLabel}>Total Bookings</Text>
                        <Text style={styles.statValue}>{bookings.length}</Text>
                    </View>
                </View>
            </Animated.View>

            {/* Bookings List */}
            {loading ? (
                <View style={styles.centerBox}>
                    <ActivityIndicator size="large" color="#00D1FF" />
                </View>
            ) : bookings.length === 0 ? (
                <View style={styles.centerBox}>
                    <Feather name="calendar" size={40} color="#64748B" style={{ marginBottom: 16 }} />
                    <Text style={styles.emptyText}>No bookings found for your turfs.</Text>
                </View>
            ) : (
                <View style={styles.listContainer}>
                    {bookings.map((booking, index) => (
                        <Animated.View 
                            entering={FadeInUp.duration(600).delay(100 + index * 50)} 
                            key={booking._id} 
                            style={[styles.bookingCard, isMobile && styles.bookingCardMobile]}
                        >
                            <View style={styles.cardHeader}>
                                <View style={styles.userInfo}>
                                    <View style={styles.userAvatar}>
                                        <Text style={styles.avatarText}>
                                            {booking.userId?.fullName?.charAt(0) || 'U'}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={styles.userName}>{booking.userId?.fullName || 'Unknown User'}</Text>
                                        <Text style={styles.userContact}>{booking.userId?.phone || 'No phone'}</Text>
                                    </View>
                                </View>
                                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(booking.status)}20` }]}>
                                    <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                                        {booking.status.toUpperCase()}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.bookingDetailsRow}>
                                <View style={styles.detailItem}>
                                    <Feather name="map-pin" size={14} color="#64748B" />
                                    <View style={styles.detailTextGroup}>
                                        <Text style={styles.detailLabel}>Turf</Text>
                                        <Text style={styles.detailValue} numberOfLines={1}>{booking.turfName}</Text>
                                    </View>
                                </View>
                                <View style={styles.detailItem}>
                                    <Feather name="calendar" size={14} color="#64748B" />
                                    <View style={styles.detailTextGroup}>
                                        <Text style={styles.detailLabel}>Date</Text>
                                        <Text style={styles.detailValue}>{booking.date}</Text>
                                    </View>
                                </View>
                                <View style={styles.detailItem}>
                                    <Feather name="clock" size={14} color="#64748B" />
                                    <View style={styles.detailTextGroup}>
                                        <Text style={styles.detailLabel}>Time</Text>
                                        <Text style={styles.detailValue}>{booking.timeSlot}</Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.cardFooter}>
                                <Text style={styles.priceLabel}>Amount Paid</Text>
                                <Text style={styles.priceValue}>₹{booking.price}</Text>
                            </View>

                        </Animated.View>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
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
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    statBox: {
        backgroundColor: '#1E293B',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        alignItems: 'center',
    },
    statLabel: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    statValue: {
        color: '#00D1FF',
        fontSize: 20,
        fontWeight: '800',
    },
    centerBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: '#94A3B8',
        fontSize: 16,
    },
    listContainer: {
        gap: 16,
    },
    bookingCard: {
        backgroundColor: '#121927',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1E293B',
        padding: 20,
    },
    bookingCardMobile: {
        padding: 16,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    userAvatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#1E293B',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },
    userName: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 2,
    },
    userContact: {
        color: '#94A3B8',
        fontSize: 13,
        fontWeight: '500',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    divider: {
        height: 1,
        backgroundColor: '#1E293B',
        marginVertical: 16,
    },
    bookingDetailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 16,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        flex: 1,
        minWidth: 120,
    },
    detailTextGroup: {
        flex: 1,
    },
    detailLabel: {
        color: '#64748B',
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 4,
    },
    detailValue: {
        color: '#E2E8F0',
        fontSize: 14,
        fontWeight: '700',
    },
    cardFooter: {
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#1E293B',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceLabel: {
        color: '#94A3B8',
        fontSize: 14,
        fontWeight: '600',
    },
    priceValue: {
        color: '#00FF00',
        fontSize: 22,
        fontWeight: '900',
    }
});
