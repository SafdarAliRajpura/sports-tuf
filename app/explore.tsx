import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Dimensions, Platform, Linking } from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Navigation, MapPin, Star, Zap, Info, LocateFixed, Trophy } from 'lucide-react-native';
import apiClient from '@/src/api/apiClient';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Tactical Dark Map Style
const MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#090E1A" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#475569" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#090E1A" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#1E293B" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#1E293B" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#64748B" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#131C31" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#1E293B" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#94A3B8" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0F172A" }] }
];

export default function ExploreScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { focusId } = params;
    
    const mapRef = useRef<MapView>(null);
    const { location, loading: locationLoading } = useUserLocation();
    const [venues, setVenues] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVenue, setSelectedVenue] = useState<any>(null);

    useEffect(() => {
        fetchVenues();
    }, []);

    const fetchVenues = async () => {
        try {
            const res = await apiClient.get('/api/venues');
            if (res.data) {
                const venueData = res.data.success ? res.data.data : res.data;
                setVenues(venueData);

                if (focusId && Array.isArray(venueData)) {
                    const venueToFocus = venueData.find(v => v._id === focusId);
                    if (venueToFocus) {
                        setSelectedVenue(venueToFocus);
                        setTimeout(() => {
                            if (mapRef.current) {
                                mapRef.current.animateToRegion({
                                    latitude: venueToFocus.coordinates?.lat || 23.0225,
                                    longitude: venueToFocus.coordinates?.lng || 72.5714,
                                    latitudeDelta: 0.01,
                                    longitudeDelta: 0.01,
                                }, 1500);
                            }
                        }, 500);
                    }
                }
            }
        } catch (error) {
            console.error("Explore Fetch Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const centerOnUser = () => {
        if (location && mapRef.current) {
            mapRef.current.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            }, 1000);
        }
    };

    const openDirections = () => {
        if (!selectedVenue) return;
        const lat = selectedVenue.coordinates?.lat || 23.0225;
        const lng = selectedVenue.coordinates?.lng || 72.5714;
        const label = selectedVenue.name;
        
        const url = Platform.select({
            ios: `maps:0,0?q=${label}@${lat},${lng}`,
            android: `geo:0,0?q=${lat},${lng}(${label})`
        });

        if (url) {
            Linking.canOpenURL(url).then(supported => {
                if (supported) {
                    Linking.openURL(url);
                } else {
                    console.error("Don't know how to open URI: " + url);
                }
            });
        }
    };

    const handleNavigationPress = () => {
        if (selectedVenue) {
            openDirections();
        } else {
            centerOnUser();
        }
    };

    if (locationLoading || loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#00FF00" />
                <Text style={styles.loadingText}>BOOTING SCOUTING RADAR...</Text>
            </View>
        );
    }

    const initialRegion = {
        latitude: location?.coords.latitude || 23.0225,
        longitude: location?.coords.longitude || 72.5714,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            
            <MapView
                ref={mapRef}
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={initialRegion}
                customMapStyle={MAP_STYLE}
                showsUserLocation
                showsMyLocationButton={false}
                onPress={() => setSelectedVenue(null)}
            >
                {venues.map((venue) => (
                    <Marker
                        key={venue._id}
                        coordinate={{
                            latitude: venue.coordinates?.lat || 23.0225,
                            longitude: venue.coordinates?.lng || 72.5714
                        }}
                        onPress={() => setSelectedVenue(venue)}
                        zIndex={selectedVenue?._id === venue._id ? 999 : 1}
                        anchor={{ x: 0.5, y: 0.5 }}
                    >
                        <View style={styles.markerOuterContainer}>
                            <View style={[styles.markerContainer, selectedVenue?._id === venue._id && styles.markerContainerActive]}>
                                <Trophy 
                                    size={selectedVenue?._id === venue._id ? 24 : 20} 
                                    color={selectedVenue?._id === venue._id ? "#000" : "#00FF00"} 
                                    fill={selectedVenue?._id === venue._id ? "#00FF00" : "transparent"} 
                                />
                            </View>
                        </View>
                        
                        <Callout tooltip onPress={() => router.push(`/venue/${venue._id}`)}>
                            <View style={styles.calloutContainer}>
                                <Text style={styles.calloutTitle}>{venue.name}</Text>
                                <View style={styles.calloutMeta}>
                                    <Star size={10} color="#00FF00" fill="#00FF00" />
                                    <Text style={styles.calloutRating}>{venue.rating || '4.8'}</Text>
                                    <View style={styles.dot} />
                                    <Text style={styles.calloutPrice}>₹{venue.price}/hr</Text>
                                </View>
                                <TouchableOpacity style={styles.calloutBtn}>
                                    <Text style={styles.calloutBtnText}>VIEW ARENA</Text>
                                </TouchableOpacity>
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>

            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <ArrowLeft color="#FFF" size={24} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>ARENA EXPLORER</Text>
                    <Text style={styles.headerSubtitle}>SCOUTING ACTIVE TURFS</Text>
                </View>
            </View>

            <TouchableOpacity 
                style={[
                    styles.locationBtn, 
                    selectedVenue && { backgroundColor: '#FFFFFF', borderColor: '#00FF00', borderWidth: 2 }
                ]} 
                onPress={handleNavigationPress}
            >
                {selectedVenue ? (
                    <Navigation color="#000" size={28} fill="#00FF00" />
                ) : (
                    <LocateFixed color="#000" size={28} />
                )}
            </TouchableOpacity>

            {selectedVenue && (
                <Animated.View entering={FadeInUp} style={styles.venuePreview}>
                    <Image source={{ uri: selectedVenue.image || selectedVenue.images?.[0] }} style={styles.previewImage} />
                    <View style={styles.previewInfo}>
                        <Text style={styles.previewTitle} numberOfLines={1}>{selectedVenue.name}</Text>
                        <View style={styles.previewMeta}>
                            <MapPin size={12} color="#94A3B8" />
                            <Text style={styles.previewLocation} numberOfLines={1}>{selectedVenue.location}</Text>
                        </View>
                        <View style={styles.previewFooter}>
                            <Text style={styles.previewPrice}>₹{selectedVenue.price}<Text style={{ fontSize: 10, color: '#475569' }}>/hr</Text></Text>
                            <TouchableOpacity 
                                style={styles.bookBtn}
                                onPress={() => router.push(`/venue/${selectedVenue._id}`)}
                            >
                                <Text style={styles.bookBtnText}>BOOK NOW</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Animated.View>
            )}

            <View style={styles.statsPanel}>
                <View style={styles.statItem}>
                    <Text style={styles.statVal}>{venues.length}</Text>
                    <Text style={styles.statLabel}>ARENAS</Text>
                </View>
                <View style={styles.vDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statVal}>{venues.filter(v => v.status === 'ACTIVE').length}</Text>
                    <Text style={styles.statLabel}>ONLINE</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#090E1A' },
    map: { width: '100%', height: '100%' },
    loadingContainer: { flex: 1, backgroundColor: '#090E1A', justifyContent: 'center', alignItems: 'center' },
    loadingText: { color: '#00FF00', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginTop: 20 },
    
    header: { position: 'absolute', top: 60, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', gap: 15 },
    backBtn: { width: 45, height: 45, borderRadius: 15, backgroundColor: 'rgba(9, 14, 26, 0.8)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    headerTitleContainer: { flex: 1 },
    headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
    headerSubtitle: { color: '#00FF00', fontSize: 8, fontWeight: '900', letterSpacing: 2, marginTop: 2 },

    locationBtn: { 
        position: 'absolute', 
        bottom: 125, 
        right: 20, 
        width: 60, 
        height: 60, 
        borderRadius: 30, 
        backgroundColor: '#00FF00', 
        justifyContent: 'center', 
        alignItems: 'center', 
        shadowColor: '#00FF00', 
        shadowOpacity: 0.5, 
        shadowRadius: 15, 
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },

    markerOuterContainer: { 
        width: 50, 
        height: 50, 
        alignItems: 'center', 
        justifyContent: 'center',
    }, 
    markerContainer: { 
        width: 44, 
        height: 44, 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#090E1A',
        borderRadius: 22,
        borderWidth: 2,
        borderColor: '#00FF00',
        shadowColor: '#00FF00',
        shadowOpacity: 0.5,
        shadowRadius: 5,
        elevation: 5
    },
    markerContainerActive: { 
        backgroundColor: '#FFF',
        borderColor: '#00FF00',
        borderWidth: 3,
        width: 50,
        height: 50,
        borderRadius: 25,
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 10
    },
    markerGlow: { display: 'none' }, // Remove complex glows for clarity
    markerPin: { backgroundColor: 'transparent', borderWidth: 0 },
    markerPinActive: { backgroundColor: 'transparent', borderWidth: 0 },

    calloutContainer: { width: 160, backgroundColor: '#131C31', borderRadius: 18, padding: 12, borderWidth: 1, borderColor: 'rgba(0,255,0,0.3)', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 10 },
    calloutTitle: { color: '#FFF', fontSize: 14, fontWeight: '900', marginBottom: 6 },
    calloutMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    calloutRating: { color: '#00FF00', fontSize: 10, fontWeight: '900', marginLeft: 4 },
    dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#475569', marginHorizontal: 8 },
    calloutPrice: { color: '#94A3B8', fontSize: 10, fontWeight: '800' },
    calloutBtn: { backgroundColor: 'rgba(0,255,0,0.1)', paddingVertical: 6, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,255,0,0.2)' },
    calloutBtnText: { color: '#00FF00', fontSize: 8, fontWeight: '900', letterSpacing: 1 },

    venuePreview: { position: 'absolute', bottom: 30, left: 20, right: 20, backgroundColor: '#131C31', borderRadius: 24, padding: 15, flexDirection: 'row', alignItems: 'center', gap: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 20, elevation: 10 },
    previewImage: { width: 80, height: 80, borderRadius: 18 },
    previewInfo: { flex: 1 },
    previewTitle: { color: '#FFF', fontSize: 16, fontWeight: '900', marginBottom: 4 },
    previewMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
    previewLocation: { color: '#94A3B8', fontSize: 11, fontWeight: '600', flex: 1 },
    previewFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    previewPrice: { color: '#FFF', fontSize: 18, fontWeight: '900' },
    bookBtn: { backgroundColor: '#00FF00', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12 },
    bookBtnText: { color: '#000', fontSize: 10, fontWeight: '900' },

    statsPanel: { position: 'absolute', bottom: 120, left: 20, backgroundColor: 'rgba(9, 14, 26, 0.8)', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    statItem: { alignItems: 'center' },
    statVal: { color: '#FFF', fontSize: 16, fontWeight: '900' },
    statLabel: { color: '#475569', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
    vDivider: { width: 1, height: 20, backgroundColor: 'rgba(255,255,255,0.1)' }
});
