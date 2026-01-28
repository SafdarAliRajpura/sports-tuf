import { StatusBar } from 'expo-status-bar';
import { Calendar as CalendarIcon, Clock, MapPin, QrCode, Ticket, X } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useState } from 'react';
import { FlatList, Image, Modal, Platform, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useBookingStore } from '../../store/bookingStore';

export default function BookingsScreen() {
  const [activeTab, setActiveTab] = useState('Upcoming');
  const [showTicket, setShowTicket] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  const { upcomingBookings, pastBookings } = useBookingStore();
  const data = activeTab === 'Upcoming' ? upcomingBookings : pastBookings;

  const handleOpenTicket = (booking: any) => {
    setSelectedBooking(booking);
    setShowTicket(true);
  };

  const renderBooking = ({ item, index }: any) => (
    <MotiView
      from={{ opacity: 0, translateX: -20 }}
      animate={{ opacity: 1, translateX: 0 }}
      transition={{ delay: index * 100 }}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <Image source={{ uri: item.image }} style={styles.thumb} />
        <View style={styles.headerInfo}>
          <Text style={styles.sportText}>
            {item.sport.toUpperCase()}
          </Text>
          <Text style={styles.arenaName}>
            {item.arena}
          </Text>
        </View>
        <View style={[
          styles.statusBadge,
          item.status === 'Confirmed' ? styles.confirmedBg : styles.completedBg
        ]}>
          <Text style={styles.statusText}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <CalendarIcon color="#94A3B8" size={16} />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Clock color="#94A3B8" size={16} />
          <Text style={styles.detailText}>{item.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin color="#94A3B8" size={16} />
          <Text style={styles.detailText}>{item.location}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.viewTicketBtn}
        onPress={() => handleOpenTicket(item)}
      >
        <Ticket color="#000000" size={18} />
        <Text style={styles.viewTicketText}>VIEW TICKET</Text>
      </TouchableOpacity>
    </MotiView>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
      </View>

      <View style={styles.tabContainer}>
        {['Upcoming', 'History'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              activeTab === tab && styles.activeTab
            ]}
          >
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.activeTabText
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={data}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No {activeTab.toLowerCase()} bookings found.
            </Text>
          </View>
        }
      />

      {/* TICKET PASS MODAL */}
      <Modal
        visible={showTicket}
        transparent
        animationType="fade"
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowTicket(false)}
        >
          <MotiView
            from={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={styles.ticketContainer}
          >
            {/* Top Ticket Section */}
            <View style={styles.ticketTop}>
              <View style={styles.ticketHeader}>
                <Text style={styles.ticketTag}>ARENAPRO PASS</Text>
                <TouchableOpacity onPress={() => setShowTicket(false)}>
                  <X color="#94A3B8" size={24} />
                </TouchableOpacity>
              </View>

              <Text style={styles.ticketArena}>{selectedBooking?.arena}</Text>

              <View style={styles.ticketRow}>
                <View>
                  <Text style={styles.label}>DATE</Text>
                  <Text style={styles.value}>{selectedBooking?.date}</Text>
                </View>
                <View style={styles.alignRight}>
                  <Text style={styles.label}>TIME</Text>
                  <Text style={styles.value}>{selectedBooking?.time?.split(' - ')[0]}</Text>
                </View>
              </View>
            </View>

            {/* Perforated Divider */}
            <View style={styles.dashedContainer}>
              <View style={styles.cutoutLeft} />
              <View style={styles.dashedLine} />
              <View style={styles.cutoutRight} />
            </View>

            {/* Bottom Ticket Section */}
            <View style={styles.ticketBottom}>
              <Text style={styles.labelCenter}>SCAN AT THE ENTRANCE</Text>
              <View style={styles.qrContainer}>
                <QrCode color="#00FF00" size={130} strokeWidth={1.5} />
              </View>
              <Text style={styles.bookingId}>
                ID: AP-{selectedBooking?.id}00X9
              </Text>
            </View>
          </MotiView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070A14',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 25,
    paddingBottom: 20,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 25,
    backgroundColor: '#1E293B',
    borderRadius: 15,
    padding: 5,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#00FF00',
  },
  tabText: {
    color: '#94A3B8',
    fontWeight: '700',
  },
  activeTabText: {
    color: '#000000',
  },
  list: {
    paddingHorizontal: 25,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 50,
    height: 50,
    borderRadius: 12,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  sportText: {
    color: '#00FF00',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  arenaName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  confirmedBg: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
  },
  completedBg: {
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
  },
  statusText: {
    color: '#00FF00',
    fontSize: 10,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 15,
  },
  detailsContainer: {
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  viewTicketBtn: {
    flexDirection: 'row',
    backgroundColor: '#00FF00',
    marginTop: 20,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  viewTicketText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 16,
  },
  // Ticket Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  ticketContainer: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 25,
    overflow: 'hidden',
  },
  ticketTop: {
    padding: 25,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  ticketTag: {
    color: '#00FF00',
    fontWeight: '900',
    letterSpacing: 2,
    fontSize: 12,
  },
  ticketArena: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 20,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  dashedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
  },
  cutoutLeft: {
    width: 20,
    height: 20,
    backgroundColor: '#070A14',
    borderRadius: 10,
    marginLeft: -10,
  },
  cutoutRight: {
    width: 20,
    height: 20,
    backgroundColor: '#070A14',
    borderRadius: 10,
    marginRight: -10,
  },
  dashedLine: {
    flex: 1,
    height: 1,
    borderWidth: 1,
    borderColor: '#64748B',
    borderStyle: 'dashed',
    marginHorizontal: 10,
  },
  ticketBottom: {
    padding: 25,
    alignItems: 'center',
  },
  labelCenter: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 15,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 20,
    marginBottom: 15,
  },
  bookingId: {
    color: '#94A3B8',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
});