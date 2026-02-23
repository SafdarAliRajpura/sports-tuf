import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Image, Platform, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInRight, SlideInUp, SlideOutDown } from 'react-native-reanimated';
import * as ImagePicker from 'expo-image-picker';
import api from '../../config/api';

const AVAILABLE_AMENITIES = ['Parking', 'Washroom', 'Drinking Water', 'Cafeteria', 'First Aid', 'Change Room', 'Floodlights'];
const AVAILABLE_SPORTS = ['Football', 'Cricket', 'Pickleball', 'Badminton', 'Tennis', 'Basketball'];

export default function MyTurfs() {
    const { width } = useWindowDimensions();
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;

    const [turfs, setTurfs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [modalVisible, setModalVisible] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Add Turf Form
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [selectedSports, setSelectedSports] = useState<string[]>(['Football']);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Delete Modal State
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [turfToDelete, setTurfToDelete] = useState<string | null>(null);

    useEffect(() => {
        fetchTurfs();
    }, []);

    const fetchTurfs = async () => {
        try {
            setLoading(true);
            const res = await api.get('/venues/my-venues');
            setTurfs(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.5,
            base64: true,
        });

        if (!result.canceled && result.assets[0].base64) {
             const base64Img = `data:image/jpeg;base64,${result.assets[0].base64}`;
             setImages([...images, base64Img]);
        }
    };

    const toggleAmenity = (amenity: string) => {
        if (selectedAmenities.includes(amenity)) {
            setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
        } else {
            setSelectedAmenities([...selectedAmenities, amenity]);
        }
    };

    const toggleSport = (sport: string) => {
        if (selectedSports.includes(sport)) {
            setSelectedSports(selectedSports.filter(s => s !== sport));
        } else {
            setSelectedSports([...selectedSports, sport]);
        }
    };

    const resetForm = () => {
        setName('');
        setLocation('');
        setPrice('');
        setDescription('');
        setImages([]);
        setSelectedAmenities([]);
        setSelectedSports(['Football']);
        setEditingId(null);
    };

    const handleSaveTurf = async () => {
        if (!name || !location || !price) {
            if (Platform.OS === 'web') alert('Please fill required fields (Name, Location, Price)');
            else Alert.alert('Error', 'Please fill required fields');
            return;
        }

        try {
            setIsSubmitting(true);
            const payload = { 
                name, 
                location, 
                description,
                price: Number(price),
                amenities: selectedAmenities,
                sports: selectedSports,
                sport: selectedSports.length > 0 ? selectedSports[0] : 'Football',
            };
            if (images.length > 0) {
                (payload as any).images = images;
                (payload as any).image = images[0]; // Set default main image
            }

            if (editingId) {
                // Update existing
                const res = await api.put(`/venues/${editingId}`, payload);
                setTurfs(turfs.map(t => t._id === editingId ? res.data : t));
            } else {
                // Create new
                const res = await api.post('/venues', payload);
                setTurfs([...turfs, res.data]);
            }

            setModalVisible(false);
            resetForm();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (turf: any) => {
        setName(turf.name || '');
        setLocation(turf.location || '');
        setPrice(turf.price ? String(turf.price) : '');
        setDescription(turf.description || '');
        setImages(turf.images || (turf.image ? [turf.image] : []));
        setSelectedAmenities(turf.amenities || []);
        setSelectedSports(turf.sports || (turf.sport ? [turf.sport] : ['Football']));
        setEditingId(turf._id);
        setModalVisible(true);
    };

    const handleToggleStatus = async (turf: any) => {
        try {
            const newStatus = turf.status === 'ACTIVE' ? 'MAINTENANCE' : 'ACTIVE';
            const res = await api.put(`/venues/${turf._id}`, { status: newStatus });
            setTurfs(turfs.map(t => t._id === turf._id ? res.data : t));
        } catch (error) {
            console.error('Failed to toggle status', error);
        }
    };

    const handleDeleteTurf = (id: string) => {
        setTurfToDelete(id);
        setDeleteModalVisible(true);
    };

    const confirmDeleteTurf = async () => {
        if (!turfToDelete) return;
        try {
            await api.delete(`/venues/${turfToDelete}`);
            setTurfs(turfs.filter(t => t._id !== turfToDelete));
            setDeleteModalVisible(false);
            setTurfToDelete(null);
        } catch (err) {
            console.error('Failed to delete', err);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <Animated.View entering={FadeInUp.duration(600)} style={[styles.header, isMobile && styles.headerMobile]}>
                <View style={styles.headerTextGroup}>
                    <Text style={styles.headerTitle}>MY TURFS</Text>
                    <Text style={styles.headerSubtitle}>Manage your sports venues and pricing.</Text>
                </View>
                <TouchableOpacity style={styles.addTurfButton} onPress={() => { resetForm(); setModalVisible(true); }}>
                    <Feather name="plus" size={16} color="#FFFFFF" />
                    <Text style={styles.addTurfButtonText}>Add New Turf</Text>
                </TouchableOpacity>
            </Animated.View>

            {/* Turfs Grid */}
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
                    <ActivityIndicator size="large" color="#00D1FF" />
                </View>
            ) : turfs.length === 0 ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
                    <Feather name="box" size={40} color="#64748B" style={{ marginBottom: 16 }} />
                    <Text style={{ color: '#94A3B8', fontSize: 16 }}>No turfs found. Add one to get started.</Text>
                </View>
            ) : (
                <View style={styles.grid}>
                    {turfs.map((turf, index) => {
                        const isActive = turf.status === 'ACTIVE';

                        return (
                            <Animated.View 
                                entering={FadeInUp.duration(600).delay(100 + index * 100)} 
                                key={turf._id} 
                            style={[
                                styles.card,
                                isMobile ? styles.cardMobile : 
                                isTablet ? styles.cardTablet : 
                                styles.cardDesktop
                            ]}
                        >
                            {/* Card Image Thumbnail */}
                            <View style={styles.imageContainer}>
                                <Image source={{ uri: turf.images && turf.images.length > 0 ? turf.images[0] : (turf.image || 'https://images.unsplash.com/photo-1574629810360-7efbb1925713?q=80&w=600') }} style={styles.image} />
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
                                    <TouchableOpacity style={styles.moreIconBtn} onPress={() => handleDeleteTurf(turf._id)}>
                                        <Feather name="trash-2" size={18} color="#EF4444" />
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
                                        <TouchableOpacity style={styles.actionIconBtn} onPress={() => handleEditClick(turf)}>
                                            <Feather name="edit" size={16} color="#94A3B8" />
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.actionIconBtn} onPress={() => handleToggleStatus(turf)}>
                                            <Feather name="power" size={16} color={isActive ? '#22C55E' : '#EF4444'} />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </Animated.View>
                    );
                })}
            </View>
            )}

            {/* Add Turf Modal */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <Animated.View entering={SlideInUp.duration(400)} exiting={SlideOutDown.duration(300)} style={[styles.modalBox, isMobile && { width: '90%' }]}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{editingId ? 'Edit Turf' : 'Add New Turf'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <Feather name="x" size={24} color="#94A3B8" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Turf Name</Text>
                                <TextInput style={styles.inputField} placeholder="e.g. Neon Arena" placeholderTextColor="#64748B" value={name} onChangeText={setName} />
                            </View>
                            
                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Location / Address</Text>
                                <TextInput style={styles.inputField} placeholder="e.g. Andheri West, Mumbai" placeholderTextColor="#64748B" value={location} onChangeText={setLocation} />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Price per Hour (₹)</Text>
                                <TextInput style={styles.inputField} placeholder="e.g. 1500" placeholderTextColor="#64748B" value={price} onChangeText={setPrice} keyboardType="numeric" />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Description / About Venue</Text>
                                <TextInput 
                                    style={[styles.inputField, { height: 80, textAlignVertical: 'top' }]} 
                                    placeholder="Describe your turf features, sizes, and specs..." 
                                    placeholderTextColor="#64748B" 
                                    value={description} 
                                    onChangeText={setDescription} 
                                    multiline 
                                    numberOfLines={4} 
                                />
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Available Sports</Text>
                                <View style={styles.amenitiesWrap}>
                                    {AVAILABLE_SPORTS.map(sport => {
                                        const isSelected = selectedSports.includes(sport);
                                        return (
                                            <TouchableOpacity 
                                                key={sport}
                                                style={[styles.sportChip, isSelected && styles.sportChipActive]}
                                                onPress={() => toggleSport(sport)}
                                            >
                                                <Text style={[styles.sportChipText, isSelected && styles.sportChipTextActive]}>{sport}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Amenities</Text>
                                <View style={styles.amenitiesWrap}>
                                    {AVAILABLE_AMENITIES.map(amenity => {
                                        const isSelected = selectedAmenities.includes(amenity);
                                        return (
                                            <TouchableOpacity 
                                                key={amenity}
                                                style={[styles.amenityChip, isSelected && styles.amenityChipActive]}
                                                onPress={() => toggleAmenity(amenity)}
                                            >
                                                <Text style={[styles.amenityChipText, isSelected && styles.amenityChipTextActive]}>{amenity}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.inputLabel}>Turf Images</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 10 }}>
                                    {images.map((img, idx) => (
                                        <Image key={idx} source={{ uri: img }} style={styles.uploadedImg} />
                                    ))}
                                    <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
                                        <Feather name="camera" size={24} color="#00D1FF" />
                                        <Text style={styles.imagePickerText}>Add Photo</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>

                            <TouchableOpacity 
                                style={[styles.submitButton, isSubmitting && { opacity: 0.7 }]} 
                                onPress={handleSaveTurf} 
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <ActivityIndicator color="#000000" />
                                ) : (
                                    <Text style={styles.submitButtonText}>{editingId ? 'Save Changes' : 'Add New Turf'}</Text>
                                )}
                            </TouchableOpacity>
                        </ScrollView>
                    </Animated.View>
                </View>
            </Modal>

            {/* Custom Delete Confirmation Modal */}
            <Modal visible={deleteModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <Animated.View entering={SlideInUp.duration(300)} exiting={SlideOutDown.duration(200)} style={styles.deleteModalBox}>
                        <View style={styles.deleteIconCircle}>
                            <Feather name="trash-2" size={32} color="#EF4444" />
                        </View>
                        <Text style={styles.deleteTitle}>Delete Turf?</Text>
                        <Text style={styles.deleteSubtitle}>Are you sure you want to remove this turf? This action cannot be undone.</Text>
                        
                        <View style={styles.deleteActions}>
                            <TouchableOpacity 
                                style={[styles.deleteBtn, styles.cancelBtn]} 
                                onPress={() => setDeleteModalVisible(false)}
                            >
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.deleteBtn, styles.confirmDeleteBtn]} 
                                onPress={confirmDeleteTurf}
                            >
                                <Text style={styles.confirmDeleteText}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>

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

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(7, 11, 20, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalBox: {
        width: 500,
        backgroundColor: '#0F1624',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#1E293B',
        overflow: 'hidden',
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 24,
        borderBottomWidth: 1,
        borderBottomColor: '#1E293B',
        backgroundColor: '#0A0F1A',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    modalBody: {
        padding: 24,
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        color: '#94A3B8',
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 8,
    },
    inputField: {
        backgroundColor: '#121927',
        borderWidth: 1,
        borderColor: '#1E293B',
        borderRadius: 8,
        color: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 15,
        // @ts-ignore
        outlineStyle: Platform.OS === 'web' ? 'none' : undefined,
    },
    submitButton: {
        backgroundColor: '#00D1FF',
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 30, // Extra padding for scroll
    },
    submitButtonText: {
        color: '#000000',
        fontSize: 15,
        fontWeight: '800',
    },
    // Amenities & Sports Chips
    amenitiesWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },
    amenityChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
    },
    amenityChipActive: {
        backgroundColor: 'rgba(0, 209, 255, 0.15)',
        borderColor: '#00D1FF',
    },
    amenityChipText: {
        color: '#94A3B8',
        fontSize: 12,
        fontWeight: '600',
    },
    amenityChipTextActive: {
        color: '#00D1FF',
    },
    sportChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#1E293B',
        borderWidth: 1,
        borderColor: '#334155',
    },
    sportChipActive: {
        backgroundColor: 'rgba(0, 255, 0, 0.15)',
        borderColor: '#00FF00',
    },
    sportChipText: {
        color: '#94A3B8',
        fontSize: 13,
        fontWeight: '700',
    },
    sportChipTextActive: {
        color: '#00FF00',
    },
    uploadedImg: {
        width: 100,
        height: 100,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#1E293B',
    },
    imagePickerBtn: {
        width: 100,
        height: 100,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#00D1FF',
        backgroundColor: 'rgba(0, 209, 255, 0.05)',
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePickerText: {
        color: '#00D1FF',
        fontSize: 12,
        fontWeight: '700',
        marginTop: 8,
    },
    // Delete Modal Styles
    deleteModalBox: {
        backgroundColor: '#121927',
        width: '85%',
        maxWidth: 400,
        borderRadius: 24,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1E293B',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    deleteIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    deleteTitle: {
        color: '#FFFFFF',
        fontSize: 22,
        fontWeight: '800',
        marginBottom: 8,
        letterSpacing: 0.5,
    },
    deleteSubtitle: {
        color: '#94A3B8',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 32,
        lineHeight: 20,
    },
    deleteActions: {
        flexDirection: 'row',
        gap: 16,
        width: '100%',
    },
    deleteBtn: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#334155',
    },
    confirmDeleteBtn: {
        backgroundColor: '#EF4444',
        borderWidth: 1,
        borderColor: '#EF4444',
        shadowColor: '#EF4444',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    cancelBtnText: {
        color: '#94A3B8',
        fontSize: 15,
        fontWeight: '700',
    },
    confirmDeleteText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    }
});
