import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

const StatCard = ({ title, value, change, isPositive, iconName, iconColor, delay = 0 }: any) => (
    <Animated.View entering={FadeInUp.duration(600).delay(delay)} style={styles.statCard}>
        <View style={styles.statTop}>
            <View style={[styles.iconWrapper, { backgroundColor: iconColor + '15' }]}>
                <Feather name={iconName} color={iconColor} size={20} />
            </View>
            <View style={[styles.changeBadge, { backgroundColor: isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                <Text style={[styles.changeText, { color: isPositive ? '#22C55E' : '#EF4444' }]}>
                    {change}
                </Text>
                <Feather 
                    name={isPositive ? "trending-up" : "trending-down"}
                    color={isPositive ? '#22C55E' : '#EF4444'} 
                    size={12} 
                    style={{ marginLeft: 4 }} 
                />
            </View>
        </View>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
    </Animated.View>
);

import api from '../../config/api';

export default function Dashboard() {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    
    const [stats, setStats] = React.useState({
        revenue: '₹0',
        bookings: 0,
        customers: 0,
        occupancy: '0%'
    });
    
    const [recentBookings, setRecentBookings] = React.useState<any[]>([]);

    React.useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // In a real app we would have a specific stats endpoint, 
            // but for now we aggregate from my-venues and my bookings/all bookings
            
            // Actually let's assume there's a specific route or we build the stats from venues/bookings
            const venuesRes = await api.get('/venues/my-venues');
            const myVenues = venuesRes.data;
            
            // As a quick fallback for this app, we mock the dynamic calc based on total my-venues
            // In a production backend we do an aggregation
            
            setStats({
                revenue: '₹2,45,000', // Mock dynamic calc
                bookings: myVenues.length * 45,
                customers: myVenues.length * 120,
                occupancy: myVenues.length > 0 ? '65%' : '0%'
            });
            
            // Use mock active data until backend provides a raw bookings endpoint for owners
            setRecentBookings([
                { id: '#3024', turf: myVenues[0]?.name || 'N/A', customer: 'Rahul S.', date: 'Today, 18:00', status: 'CONFIRMED', amount: '₹1200' },
                { id: '#3023', turf: myVenues[1]?.name || 'N/A', customer: 'Mike T.', date: 'Today, 20:00', status: 'PENDING', amount: '₹1500' },
                { id: '#3022', turf: myVenues[0]?.name || 'N/A', customer: 'Priya K.', date: 'Tomorrow, 07:00', status: 'CONFIRMED', amount: '₹800' },
                { id: '#3021', turf: myVenues[2]?.name || 'N/A', customer: 'Amit J.', date: 'Tomorrow, 19:00', status: 'CANCELLED', amount: '₹1200' },
            ].filter(b => b.turf !== 'N/A'));
            
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <Animated.View entering={FadeInUp.duration(600)} style={styles.header}>
                <Text style={styles.headerTitle}>DASHBOARD</Text>
                <Text style={styles.headerSubtitle}>Overview of your business performance.</Text>
            </Animated.View>

            {/* Stats Row */}
            <View style={[
                styles.statsGrid,
                isMobile ? styles.statsGridMobile :
                isTablet ? styles.statsGridTablet :
                styles.statsGridDesktop
            ]}>
                <StatCard 
                    title="TOTAL REVENUE" value={stats.revenue} change="+12.5%" 
                    isPositive={true} iconName="dollar-sign" iconColor="#22C55E" delay={100} 
                />
                <StatCard 
                    title="TOTAL BOOKINGS" value={stats.bookings} change="+8.2%" 
                    isPositive={true} iconName="calendar" iconColor="#00D1FF" delay={200} 
                />
                <StatCard 
                    title="ACTIVE CUSTOMERS" value={stats.customers} change="+5.3%" 
                    isPositive={true} iconName="users" iconColor="#FFFFFF" delay={300} 
                />
                <StatCard 
                    title="AVG. OCCUPANCY" value={stats.occupancy} change="-2.1%" 
                    isPositive={false} iconName="clock" iconColor="#C084FC" delay={400} 
                />
            </View>

            {/* Two Column Layout for Main Content */}
            <View style={[styles.mainGrid, isMobile && styles.mainGridMobile]}>
                
                {/* Left Column: Recent Bookings */}
                <Animated.View entering={FadeInUp.duration(600).delay(600)} style={[styles.card, isMobile ? styles.fullWidth : styles.leftCol]}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Recent Bookings</Text>
                        <TouchableOpacity style={styles.viewAllBtn}>
                            <Text style={styles.viewAllText}>View All</Text>
                            <Feather name="arrow-right" size={14} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>

                    {/* Table Header */}
                    {!isMobile && (
                        <View style={styles.tableHeader}>
                            <Text style={[styles.thText, { flex: 1 }]}>ID</Text>
                            <Text style={[styles.thText, { flex: 2 }]}>TURF</Text>
                            <Text style={[styles.thText, { flex: 1.5 }]}>CUSTOMER</Text>
                            <Text style={[styles.thText, { flex: 1.5 }]}>TIME</Text>
                            <Text style={[styles.thText, { flex: 1 }]}>STATUS</Text>
                            <Text style={[styles.thText, { flex: 1 }]}>AMOUNT</Text>
                            <View style={{ width: 20 }} />
                        </View>
                    )}

                    {/* Table Rows */}
                    <View style={styles.tableBody}>
                        {recentBookings.map((booking, index) => (
                            <Animated.View 
                                entering={FadeInRight.duration(500).delay(800 + index * 100)} 
                                key={booking.id} 
                                style={styles.tableRow}
                            >
                                <View style={[styles.td, { flex: 1 }]}>
                                    <Text style={styles.idText}>{booking.id}</Text>
                                </View>
                                <View style={[styles.td, { flex: 2, flexDirection: 'row', alignItems: 'center' }]}>
                                    <View style={styles.turfIcon}>
                                        <Feather name="map-pin" size={12} color="#94A3B8" />
                                    </View>
                                    <Text style={styles.tdTextPrimary}>{booking.turf}</Text>
                                </View>
                                <View style={[styles.td, { flex: 1.5 }]}>
                                    <Text style={styles.tdText}>{booking.customer}</Text>
                                </View>
                                <View style={[styles.td, { flex: 1.5, flexDirection: 'row', alignItems: 'center' }]}>
                                    <Feather name="clock" size={12} color="#94A3B8" style={{ marginRight: 6 }} />
                                    <Text style={styles.tdTextLight}>{booking.date}</Text>
                                </View>
                                <View style={[styles.td, { flex: 1 }]}>
                                    <View style={[
                                        styles.statusBadge,
                                        booking.status === 'CONFIRMED' && styles.statusConfirmedBg,
                                        booking.status === 'PENDING' && styles.statusPendingBg,
                                        booking.status === 'CANCELLED' && styles.statusCancelledBg,
                                    ]}>
                                        <Text style={[
                                            styles.statusText,
                                            booking.status === 'CONFIRMED' && styles.statusConfirmed,
                                            booking.status === 'PENDING' && styles.statusPending,
                                            booking.status === 'CANCELLED' && styles.statusCancelled,
                                        ]}>{booking.status}</Text>
                                    </View>
                                </View>
                                <View style={[styles.td, { flex: 1 }]}>
                                    <Text style={styles.amountText}>{booking.amount}</Text>
                                </View>
                                <TouchableOpacity style={{ width: 20, alignItems: 'center' }}>
                                    <Feather name="more-horizontal" size={16} color="#64748B" />
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>

                {/* Right Column: Mini Cards */}
                <View style={[isMobile ? styles.fullWidth : styles.rightCol, { gap: 24 }]}>
                    
                    {/* Marketing Boost Card */}
                    <Animated.View entering={FadeInUp.duration(600).delay(700)} style={[styles.card, styles.marketingCard]}>
                        <Text style={styles.cardTitle}>Marketing Boost</Text>
                        <Text style={styles.marketingSub}>Promote your empty slots for the weekend with a 20% discount blast.</Text>
                        <TouchableOpacity style={styles.launchBtn}>
                            <Text style={styles.launchBtnText}>Launch Campaign</Text>
                        </TouchableOpacity>
                    </Animated.View>

                    {/* Alerts Card */}
                    <Animated.View entering={FadeInUp.duration(600).delay(800)} style={styles.card}>
                        <Text style={[styles.cardTitle, { marginBottom: 20 }]}>Alerts</Text>
                        
                        <View style={styles.alertList}>
                            <View style={styles.alertItem}>
                                <View style={[styles.alertDot, { backgroundColor: '#FACC15' }]} />
                                <View style={styles.alertContent}>
                                    <Text style={styles.alertTitle}>New Review</Text>
                                    <Text style={styles.alertDesc}>You received a 5 star rating!</Text>
                                    <Text style={styles.alertTime}>2M AGO</Text>
                                </View>
                            </View>
                            
                            <View style={styles.alertItem}>
                                <View style={[styles.alertDot, { backgroundColor: '#00D1FF' }]} />
                                <View style={styles.alertContent}>
                                    <Text style={styles.alertTitle}>Maintenance</Text>
                                    <Text style={styles.alertDesc}>Turf B scheduled for cleaning.</Text>
                                    <Text style={styles.alertTime}>1H AGO</Text>
                                </View>
                            </View>

                            <View style={styles.alertItem}>
                                <View style={[styles.alertDot, { backgroundColor: '#22C55E' }]} />
                                <View style={styles.alertContent}>
                                    <Text style={styles.alertTitle}>System Update</Text>
                                    <Text style={styles.alertDesc}>New booking features available.</Text>
                                    <Text style={styles.alertTime}>5H AGO</Text>
                                </View>
                            </View>
                        </View>
                    </Animated.View>

                </View>

            </View>

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
        marginBottom: 32,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '900',
        color: '#FFFFFF',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#94A3B8',
        fontWeight: '500',
    },
    
    // Stats Grid Layouts
    statsGrid: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 24,
    },
    statsGridDesktop: {
        flexWrap: 'nowrap',
    },
    statsGridTablet: {
        flexWrap: 'wrap',
    },
    statsGridMobile: {
        flexDirection: 'column',
    },
    
    // Stat Card
    statCard: {
        flex: 1,
        minWidth: 200,
        backgroundColor: '#121927', // Match dark card bg
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    statTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    iconWrapper: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    changeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    changeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    statTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#94A3B8',
        letterSpacing: 1,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFFFFF',
    },

    // Main Grid
    mainGrid: {
        flexDirection: 'row',
        gap: 24,
    },
    mainGridMobile: {
        flexDirection: 'column',
    },
    fullWidth: {
        flex: 1,
        width: '100%',
    },
    card: {
        backgroundColor: '#121927',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    leftCol: {
        flex: 2, // Takes up ~2/3 of space
    },
    rightCol: {
        flex: 0.9, // Takes up remaining space
        minWidth: 320,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    viewAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    viewAllText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },

    // Table Styles
    tableHeader: {
        flexDirection: 'row',
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
        marginBottom: 8,
    },
    thText: {
        color: '#64748B',
        fontSize: 11,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    tableBody: {
        flexDirection: 'column',
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    td: {
        justifyContent: 'center',
    },
    idText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 13,
    },
    turfIcon: {
        width: 24,
        height: 24,
        borderRadius: 6,
        backgroundColor: '#1E293B',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    tdTextPrimary: {
        color: '#E2E8F0',
        fontSize: 13,
        fontWeight: '500',
    },
    tdText: {
        color: '#E2E8F0',
        fontSize: 13,
    },
    tdTextLight: {
        color: '#94A3B8',
        fontSize: 12,
    },
    amountText: {
        color: '#FFFFFF',
        fontWeight: '800',
        fontSize: 14,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    statusConfirmedBg: { backgroundColor: 'rgba(34, 197, 94, 0.1)' },
    statusConfirmed: { color: '#22C55E' },
    statusPendingBg: { backgroundColor: 'rgba(250, 204, 21, 0.1)' },
    statusPending: { color: '#FACC15' },
    statusCancelledBg: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
    statusCancelled: { color: '#EF4444' },

    // Right Side Cards
    marketingCard: {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.8)', // bright white outline
    },
    marketingSub: {
        color: '#94A3B8',
        fontSize: 13,
        lineHeight: 20,
        marginTop: 12,
        marginBottom: 24,
    },
    launchBtn: {
        paddingVertical: 12,
        alignItems: 'center',
    },
    launchBtnText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },
    
    // Alerts Card
    alertList: {
        gap: 20,
    },
    alertItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    alertDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginTop: 6,
        marginRight: 16,
    },
    alertContent: {
        flex: 1,
    },
    alertTitle: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2,
    },
    alertDesc: {
        color: '#94A3B8',
        fontSize: 12,
        marginBottom: 6,
    },
    alertTime: {
        color: '#64748B',
        fontSize: 10,
        fontWeight: '700',
    },
});
