import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, useWindowDimensions, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInRight, ZoomIn } from 'react-native-reanimated';

const StatCard = ({ title, value, iconName, change, isPositive, iconColor, delay = 0 }: any) => (
    <Animated.View entering={FadeInUp.duration(1000).delay(delay)} style={styles.statCard}>
        <View style={styles.statIconContainer}>
            <View style={[styles.iconWrapper, { borderColor: iconColor + '40' }]}>
                <Feather name={iconName} color={iconColor} size={20} />
            </View>
            <View style={[styles.changeBadge, { backgroundColor: isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)' }]}>
                <Feather name={isPositive ? "arrow-up-right" : "arrow-down-right"}
                    color={isPositive ? '#22C55E' : '#EF4444'} 
                    size={12} 
                    style={{ marginRight: 4 }} 
                />
                <Text style={[styles.changeText, { color: isPositive ? '#22C55E' : '#EF4444' }]}>
                    {change}
                </Text>
            </View>
        </View>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
    </Animated.View>
);

const recentBookings = [
    { id: '1', name: 'Rahul S.', location: 'Urban Arena', amount: '₹1,200', status: 'CONFIRMED', initial: 'R' },
    { id: '2', name: 'Priya M.', location: 'Smash Court', amount: '₹800', status: 'GIVEN', initial: 'P' },
    { id: '3', name: 'Team Vikings', location: 'Salt Lake Stadium', amount: '₹3,500', status: 'CONFIRMED', initial: 'T' },
    { id: '4', name: 'Amit K.', location: 'Oval Maidan', amount: '₹500', status: 'CANCELLED', initial: 'A' },
];

export default function Dashboard() {
    const { width } = useWindowDimensions();
    const [hoveredBar, setHoveredBar] = useState<number | null>(null);
    
    // Simple responsive detection
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <Animated.View entering={FadeInUp.duration(800)} style={[styles.header, isMobile && styles.headerMobile]}>
                <View style={styles.headerTextGroup}>
                    <Text style={styles.headerTitle}>DASHBOARD</Text>
                    <Text style={styles.headerSubtitle}>Welcome back, Admin. Here's what's happening today.</Text>
                </View>
                <View style={[styles.headerActions, isMobile && styles.headerActionsMobile]}>
                    <TouchableOpacity style={styles.actionButtonOutline}>
                        <Text style={styles.actionButtonOutlineText}>Last 7 Days</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButtonPrimary}>
                        <Text style={styles.actionButtonPrimaryText}>Export Report</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>

            {/* Stat Cards Grid */}
            <View style={[
                styles.statsGrid,
                isMobile ? styles.statsGridMobile :
                isTablet ? styles.statsGridTablet :
                styles.statsGridDesktop
            ]}>
                <StatCard title="TOTAL REVENUE" value="₹4,25,000" iconName="dollar-sign" change="+12.5%" isPositive={true} iconColor="#22C55E" delay={300} />
                <StatCard title="TOTAL USER" value="2,450" iconName="users" change="+8.2%" isPositive={true} iconColor="#00D1FF" delay={450} />
                <StatCard title="ACTIVE BOOKINGS" value="142" iconName="calendar" change="+24%" isPositive={true} iconColor="#FACC15" delay={600} />
                <StatCard title="GROWTH RATE" value="18.4%" iconName="trending-up" change="-2.1%" isPositive={false} iconColor="#A855F7" delay={750} />
            </View>

            {/* Main Content Grid */}
            <View style={[styles.mainGrid, isMobile && styles.mainGridMobile]}>
                
                {/* Revenue Overview Chart */}
                <Animated.View entering={FadeInUp.duration(1000).delay(900)} style={[styles.card, isMobile ? styles.fullWidth : styles.chartCard]}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>Revenue Overview</Text>
                        <TouchableOpacity>
                            <Feather name="more-horizontal" color="#64748B" size={20} />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.chartContainer}>
                        {['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'].map((month, i) => {
                            // Static heights for matching UI look
                            const heights = [60, 110, 50, 140, 110, 190, 100, 150, 130, 210, 130, 180];
                            const isHovered = hoveredBar === i;
                            const barColor = isHovered ? '#00A8CC' : '#1E293B'; // Dark Teal matching image
                            
                            // Mocking a percentage calculation based on height
                            const mockMaxHeight = 250;
                            const percentage = Math.round((heights[i] / mockMaxHeight) * 100) + '%';
                            
                            return (
                                <Pressable 
                                    key={month} 
                                    style={styles.barCol}
                                    onHoverIn={() => setHoveredBar(i)}
                                    onHoverOut={() => setHoveredBar(null)}
                                    onPressIn={() => setHoveredBar(i)}
                                    onPressOut={() => setHoveredBar(null)}
                                >
                                    <View style={styles.barWrapper}>
                                        {isHovered && (
                                            <Animated.View entering={ZoomIn.duration(300)} style={styles.tooltip}>
                                                <Text style={styles.tooltipText}>{percentage}</Text>
                                            </Animated.View>
                                        )}
                                        <Animated.View 
                                           entering={FadeInUp.duration(1000).delay(1100 + i * 80)}
                                           style={[
                                               styles.bar, 
                                               { height: heights[i], backgroundColor: barColor },
                                               isHovered && styles.activeBarShadow // Optional subtle glow on hovered bar
                                           ]} 
                                        />
                                    </View>
                                    <Text style={[styles.monthText, isHovered && { color: '#FFFFFF', fontWeight: '800' }]}>{month}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </Animated.View>

                {/* Recent Bookings List */}
                <Animated.View entering={FadeInUp.duration(1000).delay(1000)} style={[styles.card, isMobile ? styles.fullWidth : styles.recentCard]}>
                    <Text style={[styles.cardTitle, { marginBottom: 24 }]}>Recent Bookings</Text>
                    
                    <View style={styles.bookingsList}>
                        {recentBookings.map((booking, index) => (
                            <Animated.View entering={FadeInRight.duration(800).delay(1400 + index * 200)} key={booking.id} style={[styles.bookingItem, index === recentBookings.length - 1 && { borderBottomWidth: 0 }]}>
                                <View style={styles.bookingUser}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>{booking.initial}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.bookingName}>{booking.name}</Text>
                                        <Text style={styles.bookingLocation}>{booking.location}</Text>
                                    </View>
                                </View>
                                <View style={styles.bookingMeta}>
                                    <Text style={styles.bookingAmount}>{booking.amount}</Text>
                                    <Text style={[
                                        styles.bookingStatus, 
                                        booking.status === 'CONFIRMED' ? styles.statusConfirmed :
                                        booking.status === 'CANCELLED' ? styles.statusCancelled : styles.statusGiven
                                    ]}>{booking.status}</Text>
                                </View>
                            </Animated.View>
                        ))}
                    </View>
                    
                    <Animated.View entering={FadeInUp.duration(800).delay(2200)}>
                        <TouchableOpacity style={styles.viewAllButton}>
                            <Text style={styles.viewAllText}>View All Activity</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </Animated.View>

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
    headerActions: {
        flexDirection: 'row',
        gap: 12,
    },
    headerActionsMobile: {
        width: '100%',
        justifyContent: 'flex-start',
    },
    actionButtonOutline: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#1E293B',
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    actionButtonOutlineText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    actionButtonPrimary: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        backgroundColor: '#00D1FF',
    },
    actionButtonPrimaryText: {
        color: '#000000',
        fontSize: 14,
        fontWeight: '700',
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
        backgroundColor: '#0F1623',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    statIconContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    iconWrapper: {
        width: 40,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.02)',
    },
    changeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    changeText: {
        fontSize: 12,
        fontWeight: '700',
    },
    statTitle: {
        fontSize: 11,
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 1,
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
    },

    // Main Grid
    mainGrid: {
        flexDirection: 'row',
        gap: 20,
    },
    mainGridMobile: {
        flexDirection: 'column',
    },
    fullWidth: {
        flex: 1,
        width: '100%',
    },
    card: {
        backgroundColor: '#0F1623',
        borderRadius: 16,
        padding: 24,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    chartCard: {
        flex: 2, // 2/3 width
    },
    recentCard: {
        flex: 1, // 1/3 width
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 32,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    
    // Chart Area
    chartContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        height: 250,
        paddingTop: 30, // Increased top padding for tooltip room
    },
    barCol: {
        alignItems: 'center',
        flex: 1,
        height: '100%',
        justifyContent: 'flex-end',
    },
    barWrapper: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: '100%',
    },
    tooltip: {
        marginBottom: 10, // Positioned right above the bar
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#FFFFFF',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 3,
    },
    tooltipText: {
        color: '#000000',
        fontSize: 10,
        fontWeight: '900',
    },
    bar: {
        width: '60%',
        maxWidth: 32,
        backgroundColor: '#1E293B',
        borderRadius: 4,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    activeBarShadow: {
        shadowColor: '#00A8CC',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.7,
        shadowRadius: 8,
        elevation: 5,
    },
    monthText: {
        marginTop: 12,
        fontSize: 10,
        color: '#64748B',
        fontWeight: '600',
    },

    // Recent Bookings List
    bookingsList: {
        marginBottom: 16,
    },
    bookingItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    bookingUser: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#1E293B',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    avatarText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    bookingName: {
        color: '#FFFFFF',
        fontWeight: '600',
        fontSize: 14,
        marginBottom: 4,
    },
    bookingLocation: {
        color: '#64748B',
        fontSize: 12,
    },
    bookingMeta: {
        alignItems: 'flex-end',
    },
    bookingAmount: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
        marginBottom: 4,
    },
    bookingStatus: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    statusConfirmed: {
        color: '#22C55E', // Match image green
    },
    statusCancelled: {
        color: '#EF4444', // Match image red
    },
    statusGiven: {
        color: '#94A3B8',
    },
    viewAllButton: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 8,
        backgroundColor: '#182130',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    viewAllText: {
        color: '#94A3B8',
        fontSize: 13,
        fontWeight: '600',
    },
});
