import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Image, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

const myTurfs = [
    { 
        id: '1', 
        name: 'Neon Arena Main', 
        location: 'Andheri West, Mumbai', 
        price: '1,200', 
        status: 'ACTIVE', 
        image: 'https://images.unsplash.com/photo-1574629810360-7efbb1925713?q=80&w=600' 
    },
    { 
        id: '2', 
        name: 'Sky Badminton Court', 
        location: 'Juhu, Mumbai', 
        price: '800', 
        status: 'ACTIVE', 
        image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=600' 
    },
    { 
        id: '3', 
        name: 'Box Cricket Zone', 
        location: 'Bandra, Mumbai', 
        price: '1,500', 
        status: 'MAINTENANCE', 
        image: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?q=80&w=600' 
    },
];

export default function MyTurfs() {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <Animated.View entering={FadeInUp.duration(600)} style={[styles.header, isMobile && styles.headerMobile]}>
                <View style={styles.headerTextGroup}>
                    <Text style={styles.headerTitle}>MY TURFS</Text>
                    <Text style={styles.headerSubtitle}>Manage your sports venues and pricing.</Text>
                </View>
                <TouchableOpacity style={styles.addTurfButton}>
                    <Feather name="plus" size={16} color="#FFFFFF" />
                    <Text style={styles.addTurfButtonText}>Add New Turf</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Turfs Grid */}
            <View style={styles.grid}>
                {myTurfs.map((turf, index) => {
                    const isActive = turf.status === 'ACTIVE';

                    return (
                        <Animated.View 
                            entering={FadeInUp.duration(600).delay(100 + index * 100)} 
                            key={turf.id} 
                            style={[
                                styles.card,
                                isMobile ? styles.cardMobile : 
                                isTablet ? styles.cardTablet : 
                                styles.cardDesktop
                            ]}
                        >
                            {/* Card Image Thumbnail */}
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: turf.image }} style={styles.image} />
                                <View style={styles.imageOverlay} />
                                
                                {/* Status Badge inside Image */}
                                <View style={[
                                    styles.statusBadge, 
                                    { backgroundColor: isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(148, 163, 184, 0.2)' }
                                ]}>
                                    <Text style={[
                                        styles.statusText,
                                        { color: isActive ? '#22C55E' : '#94A3B8' }
                                    ]}>
                                        {turf.status}
                                    </Text>
                                </View>
                            </View>

                            {/* Card Content Details */}
                            <View style={styles.cardContent}>
                                <View style={styles.titleRow}>
                                    <Text style={styles.turfName} numberOfLines={1}>{turf.name}</Text>
                                    <TouchableOpacity style={styles.moreIconBtn}>
                                        <Feather name="more-vertical" size={18} color="#64748B" />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.locationRow}>
                                    <Feather name="map-pin" size={12} color="#64748B" />
                                    <Text style={styles.locationText} numberOfLines={1}>{turf.location}</Text>
                                </View>

                                {/* Footer Row: Price & Actions */}
                                <View style={styles.footerRow}>
                                    <Text style={styles.priceText}>
                                        ₹ <Text style={styles.priceValue}>{turf.price}</Text>
                                        <Text style={styles.priceUnit}>/hr</Text>
                                    </Text>
                                    <View style={styles.actionButtons}>
                                        <TouchableOpacity style={styles.actionIconBtn}>
                                            <Feather name="edit" size={16} color="#94A3B8" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionIconBtn}>
                                            <Feather name="power" size={16} color="#94A3B8" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Animated.View>
                    );
                })}
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
    addTurfButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'transparent',
        paddingHorizontal: 0,
        gap: 8,
    },
    addTurfButtonText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: 14,
    },
    
    // Grid Setup
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 24,
    },
    
    // Turf Card Styling
    card: {
        backgroundColor: '#121927', // Match dark card bg
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1E293B',
        overflow: 'hidden',
    },
    cardDesktop: {
        width: Platform.OS === 'web' ? 'calc(33.333% - 16px)' as any : '31%',
        minWidth: 300,
        flex: 1,
    },
    cardTablet: {
        width: Platform.OS === 'web' ? 'calc(50% - 12px)' as any : '48%',
        minWidth: 300,
        flex: 1,
    },
    cardMobile: {
        width: '100%',
    },

    // Image & Status Badge
    imageContainer: {
        height: 180,
        width: '100%',
        position: 'relative',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imageOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent',
        // In case a very subtle shadow or gradient over image is needed
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B', 
    },
    statusBadge: {
        position: 'absolute',
        top: 16,
        right: 16,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },

    // Details Content
    cardContent: {
        padding: 24,
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    turfName: {
        fontSize: 18,
        fontWeight: '800',
        color: '#FFFFFF',
        flex: 1,
        marginRight: 10,
    },
    moreIconBtn: {
        padding: 2,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24, // spacing before details
    },
    locationText: {
        color: '#94A3B8',
        fontSize: 13,
        marginLeft: 6,
        fontWeight: '500',
    },

    // Price and Action Footer
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16, // optional if adding border
        // borderTopWidth: 1, // disabled to match your exact image style cleanly
        // borderTopColor: '#1E293B',
    },
    priceText: {
        color: '#64748B',
        fontSize: 14,
        fontWeight: '500',
    },
    priceValue: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: '800',
    },
    priceUnit: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '700',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 16,
    },
    actionIconBtn: {
        padding: 4,
    },
});
