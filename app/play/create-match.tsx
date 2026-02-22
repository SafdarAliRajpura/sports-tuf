import { useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Clock, MapPin, Users, DollarSign, ChevronDown, Check, Search, X, CheckCircle } from 'lucide-react-native';
import React, { useState } from 'react';
import Animated, { FadeIn, FadeOut, ZoomIn, ZoomOut, SlideInUp, SlideOutDown, FadeInLeft, FadeInRight, FadeInUp, FadeInDown } from "react-native-reanimated";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Modal, FlatList } from 'react-native';
import api from '../../config/api';
// @ts-ignore
import { VENUES } from '../../data/venues';

export default function CreateMatchScreen() {
  const router = useRouter();

  const [sport, setSport] = useState('Football');
  
  const [venue, setVenue] = useState('');
  const [showVenueDropdown, setShowVenueDropdown] = useState(false);

  const [date, setDate] = useState('Today');
  
  const [time, setTime] = useState('');
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);

  const [playersTotal, setPlayersTotal] = useState('10');
  const [showPlayersDropdown, setShowPlayersDropdown] = useState(false);
  const playersOptions = ['2', '4', '6', '8', '10', '12', '14', '16', '18', '20', '22'];

  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);

  const [validationError, setValidationError] = useState('');

  const [venueSearch, setVenueSearch] = useState('');

  // Hardcoded for now, ideal would be to select from list
  const sports = ['Football', 'Cricket', 'Pickleball', 'Badminton'];

  const filteredVenues = VENUES.filter((v: any) => 
    v.title.toLowerCase().includes(venueSearch.toLowerCase())
  );

  const timeSlots = [
    '06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM',
    '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM'
  ];
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCreate = async () => {
    if (!venue || !time || !price) {
      setValidationError('Please fill in all fields (Venue, Time, Price) to create a lobby.');
      return;
    }
    
    if (isNaN(Number(price))) {
      setValidationError('Price must be a valid number.');
      return;
    }

    setLoading(true);
    try {
      // Create match object matching backend schema
      const matchData = {
        hostId: '65d4c8f9a4b3c2e1d0000001', // Mock User ID (must be 24 hex chars)
        sport,
        venue,
        date,
        time,
        playersTotal: Number(playersTotal),
        pricePerPerson: Number(price),
        description: `Join my ${sport} match!`
      };

      await api.post('/matches', matchData);

      setLoading(false);
      setShowSuccess(true);
      
    } catch (error) {
      setLoading(false);
      console.error(error);
      Alert.alert('Error', 'Failed to create match. Is the backend running?');
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#FFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Host a Match</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* SPORT SELECTOR */}
        <Text style={styles.label}>Select Sport</Text>
        <View style={styles.sportList}>
          {sports.map(s => (
            <TouchableOpacity 
              key={s} 
              style={[styles.sportChip, sport === s && styles.sportChipActive]}
              onPress={() => setSport(s)}
            >
              <Text style={[styles.sportText, sport === s && styles.sportTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* INPUT FIELDS */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Venue Name</Text>
          <TouchableOpacity 
            style={styles.dropdownButton} 
            onPress={() => {
              setVenueSearch('');
              setShowVenueDropdown(true);
            }}
          >
            <View style={styles.inputIconRow}>
              <MapPin color="#64748B" size={20} />
              <Text style={[styles.inputText, !venue && styles.placeholderText]}>
                {venue || 'Select Venue'}
              </Text>
            </View>
            <ChevronDown color="#64748B" size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Date</Text>
            <View style={styles.inputContainer}>
              <Calendar color="#64748B" size={20} />
              <TextInput 
                style={styles.input} 
                value={date}
                editable={false} // Hardcoded for demo
              />
            </View>
          </View>
          <View style={{ width: 15 }} />
          <View style={[styles.formGroup, { flex: 1 }]}>
            <Text style={styles.label}>Time</Text>
            <TouchableOpacity 
              style={styles.dropdownButton} 
              onPress={() => setShowTimeDropdown(true)}
            >
              <View style={styles.inputIconRow}>
                <Clock color="#64748B" size={20} />
                <Text style={[styles.inputText, !time && styles.placeholderText]}>
                  {time || 'Select Time'}
                </Text>
              </View>
              <ChevronDown color="#64748B" size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Total Players</Text>
          <TouchableOpacity 
            style={styles.dropdownButton} 
            onPress={() => setShowPlayersDropdown(true)}
          >
            <View style={styles.inputIconRow}>
              <Users color="#64748B" size={20} />
              <Text style={styles.inputText}>{playersTotal} Players</Text>
            </View>
            <ChevronDown color="#64748B" size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Price Per Person (₹)</Text>
          <View style={styles.inputContainer}>
            <DollarSign color="#64748B" size={20} />
            <TextInput 
              style={styles.input} 
              placeholder="200" 
              placeholderTextColor="#64748B"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
        </View>

      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.createButton} onPress={handleCreate} disabled={loading}>
          <Text style={styles.createButtonText}>{loading ? 'CREATING...' : 'CREATE LOBBY'}</Text>
        </TouchableOpacity>
      </View>

      {/* VALIDATION ERROR MODAL */}
      {validationError ? (
        <View style={styles.errorOverlay}>
          <View style={styles.errorCard}>
            <View style={styles.errorIcon}>
              <Text style={styles.exclamation}>!</Text>
            </View>
            <Text style={styles.errorTitle}>Oops!</Text>
            <Text style={styles.errorMessage}>{validationError}</Text>
            <TouchableOpacity style={styles.errorButton} onPress={() => setValidationError('')}>
              <Text style={styles.errorButtonText}>GOT IT</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* SUCCESS MODAL */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.successOverlay}>
          <Animated.View entering={ZoomIn.duration(250)} exiting={ZoomOut.duration(200)}  
            
            
            
            style={styles.successCard}
          >
            <View style={styles.successIconOuter}>
              <View style={styles.successIconInner}>
                <CheckCircle color="#00FF00" size={40} strokeWidth={3} />
              </View>
            </View>
            <Text style={styles.successTitle}>Lobby Created!</Text>
            <Text style={styles.successMessage}>Your match is now live. Players can join your lobby.</Text>
            
            <TouchableOpacity 
              style={styles.successButton} 
              onPress={() => {
                setShowSuccess(false);
                router.back();
              }}
            >
              <Text style={styles.successButtonText}>CONTINUE</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* VENUE SELECTION MODAL */}
      <Modal visible={showVenueDropdown} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowVenueDropdown(false)}>
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownTitle}>Select Venue</Text>
            
            {/* Search Input */}
            <View style={styles.modalSearchBar}>
              <Search color="#94A3B8" size={18} />
              <TextInput 
                style={styles.modalSearchInput}
                placeholder="Search venue..."
                placeholderTextColor="#64748B"
                value={venueSearch}
                onChangeText={setVenueSearch}
                autoFocus
              />
              {venueSearch ? (
                <TouchableOpacity onPress={() => setVenueSearch('')}>
                  <X color="#94A3B8" size={16} />
                </TouchableOpacity>
              ) : null}
            </View>

            <FlatList
              data={filteredVenues}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<Text style={styles.emptyText}>No venues found</Text>}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.dropdownItem, venue === item.title && styles.dropdownItemActive]}
                  onPress={() => {
                    setVenue(item.title);
                    setShowVenueDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, venue === item.title && styles.dropdownItemTextActive]}>{item.title}</Text>
                  {venue === item.title && <Check color="#000" size={16} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* TIME SELECTION MODAL */}
      <Modal visible={showTimeDropdown} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTimeDropdown(false)}>
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownTitle}>Select Time</Text>
            <FlatList
              data={timeSlots}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.dropdownItem, time === item && styles.dropdownItemActive]}
                  onPress={() => {
                    setTime(item);
                    setShowTimeDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, time === item && styles.dropdownItemTextActive]}>{item}</Text>
                  {time === item && <Check color="#000" size={16} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* PLAYERS SELECTION MODAL */}
      <Modal visible={showPlayersDropdown} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowPlayersDropdown(false)}>
          <View style={styles.dropdownModal}>
            <Text style={styles.dropdownTitle}>Select Total Players</Text>
            <FlatList
              data={playersOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={[styles.dropdownItem, playersTotal === item && styles.dropdownItemActive]}
                  onPress={() => {
                    setPlayersTotal(item);
                    setShowPlayersDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, playersTotal === item && styles.dropdownItemTextActive]}>{item} Players</Text>
                  {playersTotal === item && <Check color="#000" size={16} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090E1A' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20,
    backgroundColor: '#0F172A', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  
  content: { padding: 20 },
  
  label: { color: '#94A3B8', fontSize: 13, fontWeight: '700', marginBottom: 10, marginTop: 15 },
  sportList: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  sportChip: {
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25,
    backgroundColor: '#1E293B', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  sportChipActive: { backgroundColor: '#00FF00', borderColor: '#00FF00' },
  sportText: { color: '#94A3B8', fontWeight: '700' },
  sportTextActive: { color: '#000' },

  formGroup: { marginBottom: 5 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1E293B', borderRadius: 16, paddingHorizontal: 15, height: 55,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  input: { flex: 1, color: '#FFF', marginLeft: 10, fontWeight: '600', fontSize: 15 },
  row: { flexDirection: 'row' },

  footer: {
    padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
    backgroundColor: '#0F172A'
  },
  createButton: {
    backgroundColor: '#00FF00', borderRadius: 16, height: 55,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#00FF00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10
  },
  createButtonText: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

  // ERROR MODAL STYLES
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100
  },
  errorCard: {
    width: '80%',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10
  },
  errorIcon: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2, borderColor: '#FF3B30'
  },
  exclamation: { color: '#FF3B30', fontSize: 32, fontWeight: '900' },
  errorTitle: { color: '#FFF', fontSize: 20, fontWeight: '900', marginBottom: 10 },
  errorMessage: { color: '#94A3B8', fontSize: 14, textAlign: 'center', marginBottom: 25, lineHeight: 20 },
  errorButton: {
    backgroundColor: '#FF3B30', paddingHorizontal: 30, paddingVertical: 14, borderRadius: 14,
    width: '100%', alignItems: 'center'
  },
  errorButtonText: { color: '#FFF', fontSize: 13, fontWeight: '900', letterSpacing: 1 },

  // DROPDOWN STYLES
  dropdownButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#1E293B', borderRadius: 16, paddingHorizontal: 15, height: 55,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)'
  },
  inputIconRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  inputText: { color: '#FFF', fontWeight: '600', fontSize: 15 },
  placeholderText: { color: '#64748B' },
  
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center'
  },
  dropdownModal: {
    width: '85%', maxHeight: '60%', backgroundColor: '#1E293B', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)'
  },
  dropdownTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 15, textAlign: 'center' },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 15, paddingHorizontal: 15, borderRadius: 12, marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.02)'
  },
  dropdownItemActive: { backgroundColor: '#00FF00' },
  dropdownItemText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
  dropdownItemTextActive: { color: '#000', fontWeight: '800' },

  modalSearchBar: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A',
    borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10,
    marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', gap: 10
  },
  modalSearchInput: {
    flex: 1, color: '#FFF', fontSize: 14, fontWeight: '500'
  },
  emptyText: {
    color: '#64748B', textAlign: 'center', marginTop: 20, fontStyle: 'italic'
  },

  // SUCCESS MODAL STYLES
  successOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center'
  },
  successCard: {
    width: '80%', backgroundColor: '#1E293B', borderRadius: 30, padding: 30,
    alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(0, 255, 0, 0.2)',
    shadowColor: '#00FF00', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 30, elevation: 20
  },
  successIconOuter: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(0, 255, 0, 0.1)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
    borderWidth: 1, borderColor: 'rgba(0, 255, 0, 0.3)'
  },
  successIconInner: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(0, 255, 0, 0.2)',
    justifyContent: 'center', alignItems: 'center'
  },
  successTitle: { color: '#FFF', fontSize: 22, fontWeight: '900', marginBottom: 10, textAlign: 'center' },
  successMessage: { color: '#94A3B8', fontSize: 14, textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  successButton: {
    backgroundColor: '#00FF00', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 16,
    width: '100%', alignItems: 'center',
    shadowColor: '#00FF00', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10
  },
  successButtonText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 1 }
});
