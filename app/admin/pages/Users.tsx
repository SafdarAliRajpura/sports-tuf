import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Image, Alert, Platform, Modal, Pressable } from 'react-native';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInRight, SlideInRight, SlideOutRight } from 'react-native-reanimated';
import moment from 'moment';
import api from '../../config/api';

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);
  const [selectedUserActivity, setSelectedUserActivity] = useState<any>(null);

  // Fetch users from the backend
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth'); // Calls the new GET route we added
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (userId: string, currentStatus: string) => {
    setActiveDropdownId(null);
    try {
      const newStatus = currentStatus === 'active' ? 'banned' : 'active';
      const response = await api.put(`/auth/${userId}/status`, { status: newStatus });
      setUsers(users.map(u => u._id === userId ? { ...u, status: response.data.status } : u));
    } catch (err: any) {
      console.error(err);
      if (Platform.OS === 'web') alert('Error updating status: ' + err.message);
      else Alert.alert('Error', 'Failed to update status');
    }
  };

  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      
      {/* Header Area */}
      <Animated.View entering={FadeInUp.duration(600)} style={styles.headerRow}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>USER MANAGEMENT</Text>
          <Text style={styles.headerSubtitle}>Manage user access and roles.</Text>
        </View>
      </Animated.View>

      {/* Filter and Search Bar */}
      <Animated.View entering={FadeInUp.duration(600).delay(200)} style={styles.filterBar}>
        <View style={styles.searchBox}>
          <Feather name="search" color="#64748B" size={18} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor="#64748B"
            value={searchQuery}
            onChangeText={setSearchQuery}
            // @ts-ignore
            outlineStyle="none"
          />
        </View>

        <View style={styles.dropdownGroup}>
          <TouchableOpacity style={styles.dropdownBtn}>
            <Text style={styles.dropdownText}>All Roles</Text>
            <Feather name="chevron-down" size={14} color="#94A3B8" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.dropdownBtn}>
            <Text style={styles.dropdownText}>All Status</Text>
            <Feather name="chevron-down" size={14} color="#94A3B8" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Main Table Content */}
      <Animated.View entering={FadeInUp.duration(800).delay(400)} style={styles.tableCard}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.thText, { flex: 2 }]}>USER</Text>
          <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>ROLE</Text>
          <Text style={[styles.thText, { flex: 1, textAlign: 'center' }]}>STATUS</Text>
          <Text style={[styles.thText, { flex: 1.5, textAlign: 'center' }]}>JOINED</Text>
          <Text style={[styles.thText, { flex: 0.5, textAlign: 'right' }]}>ACTIONS</Text>
        </View>

        {loading ? (
           <View style={{ padding: 40, alignItems: 'center' }}>
             <ActivityIndicator size="large" color="#00FF00" />
           </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {filteredUsers.map((user, index) => {
              const isAdmin = user.role === 'admin';
              
              return (
                <Animated.View entering={FadeInRight.duration(500).delay(600 + index * 100)} key={user._id} style={[styles.tableRow, { zIndex: filteredUsers.length - index }]}>
                  {/* USER INFO */}
                  <View style={[styles.cell, { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start' }]}>
                    <Image source={{ uri: user.avatar || 'https://api.dicebear.com/7.x/avataaars/png?seed=' + user.fullName }} style={styles.avatar} />
                    <View>
                      <Text style={styles.nameText}>{user.fullName}</Text>
                      <Text style={styles.emailText}>{user.email}</Text>
                    </View>
                  </View>

                  {/* ROLE BADGE */}
                  <View style={[styles.cell, { flex: 1, alignItems: 'center' }]}>
                     <View style={[styles.roleBadge, isAdmin ? styles.adminRole : styles.userRole]}>
                       <Feather name="user" size={10} color={isAdmin ? "#FFF" : "#94A3B8"} />
                       <Text style={[styles.roleText, isAdmin && { color: '#FFF' }]}>
                          {isAdmin ? 'Admin' : 'User'}
                       </Text>
                     </View>
                  </View>

                  {/* STATUS BADGE */}
                  <View style={[styles.cell, { flex: 1, alignItems: 'center' }]}>
                    <View style={[styles.statusBadge, user.status === 'banned' && styles.statusBanned]}>
                      <Feather name={user.status === 'banned' ? "x-circle" : "check-circle"} size={12} color={user.status === 'banned' ? "#EF4444" : "#22C55E"} />
                      <Text style={[styles.statusText, user.status === 'banned' && { color: '#EF4444' }]}>
                        {user.status === 'banned' ? 'Banned' : 'Active'}
                      </Text>
                    </View>
                  </View>

                  {/* JOINED DATE */}
                  <View style={[styles.cell, { flex: 1.5, alignItems: 'center' }]}>
                    <Text style={styles.dateText}>
                      {moment(user.createdAt).format('DD MMM YYYY')}
                    </Text>
                  </View>

                  {/* ACTIONS */}
                  <View style={[styles.cell, { flex: 0.5, alignItems: 'flex-end', paddingRight: 10, position: 'relative' }]}>
                    <TouchableOpacity onPress={() => setActiveDropdownId(activeDropdownId === user._id ? null : user._id)}>
                      <Feather name="more-vertical" size={18} color="#64748B" />
                    </TouchableOpacity>
                    
                    {activeDropdownId === user._id && (
                      <View style={styles.dropdownMenu}>
                        <TouchableOpacity style={styles.dropItem} onPress={() => { setActiveDropdownId(null); setSelectedUserActivity(user); }}>
                           <Feather name="activity" size={14} color="#E2E8F0" />
                           <Text style={styles.dropItemText}>View Activity</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.dropItem} onPress={() => handleUpdateStatus(user._id, user.status || 'active')}>
                           <Feather name={user.status === 'banned' ? "check" : "slash"} size={14} color={user.status === 'banned' ? "#22C55E" : "#EF4444"} />
                           <Text style={[styles.dropItemText, { color: user.status === 'banned' ? "#22C55E" : "#EF4444" }]}>
                             {user.status === 'banned' ? 'Unban User' : 'Ban User'}
                           </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>

                </Animated.View>
              );
            })}
            
            {filteredUsers.length === 0 && (
               <View style={{ padding: 40, alignItems: 'center' }}>
                 <Text style={{ color: '#64748B' }}>No users found.</Text>
               </View>
            )}
            
            <View style={{ height: 20 }} />
          </ScrollView>
        )}
      </Animated.View>

      {/* Activity Panel Modal */}
      <Modal visible={!!selectedUserActivity} transparent animationType="fade">
        <View style={styles.activityOverlay}>
          <TouchableOpacity style={styles.activityCloseArea} onPress={() => setSelectedUserActivity(null)} activeOpacity={1} />
          
          {/* Animated Panel sliding in from the right */}
          <Animated.View entering={SlideInRight.duration(400)} style={styles.activityPanel}>
            <View style={styles.panelHeader}>
              <Text style={styles.panelTitle}>User Activity</Text>
              <TouchableOpacity onPress={() => setSelectedUserActivity(null)}>
                <Feather name="x" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            
            {selectedUserActivity && (
              <ScrollView style={styles.panelContent} showsVerticalScrollIndicator={false}>
                <View style={styles.panelProfile}>
                  <Image source={{ uri: selectedUserActivity.avatar || 'https://api.dicebear.com/7.x/avataaars/png?seed=' + selectedUserActivity.fullName }} style={styles.panelAvatar} />
                  <Text style={styles.panelName}>{selectedUserActivity.fullName}</Text>
                  <Text style={styles.panelEmail}>{selectedUserActivity.email}</Text>
                  
                  <View style={styles.panelStatsRow}>
                    <View style={styles.panelStatBox}>
                      <Text style={styles.panelStatValue}>₹12,400</Text>
                      <Text style={styles.panelStatLabel}>Total Spent</Text>
                    </View>
                    <View style={styles.panelStatBox}>
                      <Text style={styles.panelStatValue}>14</Text>
                      <Text style={styles.panelStatLabel}>Bookings</Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.panelSectionTitle}>Recent Bookings (Dummy Data)</Text>
                
                {[1, 2, 3].map((_, i) => (
                  <View key={i} style={styles.panelBookingItem}>
                     <View style={styles.bookingIconBg}>
                       <Feather name="calendar" size={16} color="#00FF00" />
                     </View>
                     <View style={{ flex: 1 }}>
                       <Text style={styles.bookingVenue}>Premium Turf {i === 0 ? 'Alpha' : i === 1 ? 'Beta' : 'Gamma'}</Text>
                       <Text style={styles.bookingDate}>12 Oct 2024 • 18:00 - 19:00</Text>
                     </View>
                     <Text style={styles.bookingPrice}>₹1,200</Text>
                  </View>
                ))}
              </ScrollView>
            )}
          </Animated.View>
        </View>
      </Modal>

    </View>
  );
}

const styles: any = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  
  // --- HEADER SECTION ---
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTextContainer: {
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00FF00',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 13,
  },

  // --- FILTER BAR SECTION ---
  filterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0F1623',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#070B14',
    borderRadius: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginRight: 20,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
  },
  dropdownGroup: {
    flexDirection: 'row',
    gap: 12,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#070B14',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 12,
  },
  dropdownText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },

  // --- TABLE SECTION ---
  tableCard: {
    flex: 1,
    backgroundColor: '#0F1623',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0A0F1A',
  },
  thText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  cell: {
    justifyContent: 'center',
  },
  
  // Cell Specifics
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    marginRight: 12,
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  emailText: {
    color: '#64748B',
    fontSize: 12,
  },
  
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
  },
  userRole: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  adminRole: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  roleText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  statusBanned: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  statusText: {
    color: '#22C55E',
    fontSize: 11,
    fontWeight: '700',
  },
  
  dateText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 30,
    right: 10,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 8,
    minWidth: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  dropItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 10,
  },
  dropItemText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
  activityOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(7, 11, 20, 0.7)',
  },
  activityCloseArea: {
    flex: 1,
  },
  activityPanel: {
    width: Platform.OS === 'web' ? 400 : '85%',
    backgroundColor: '#0F1623',
    height: '100%',
    borderLeftWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: -5, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0A0F1A',
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  panelContent: {
    flex: 1,
    padding: 24,
  },
  panelProfile: {
    alignItems: 'center',
    marginBottom: 30,
  },
  panelAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E293B',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#00FF00',
  },
  panelName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  panelEmail: {
    fontSize: 14,
    color: '#94A3B8',
    marginBottom: 24,
  },
  panelStatsRow: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  panelStatBox: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  panelStatValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#00FF00',
    marginBottom: 4,
  },
  panelStatLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  panelSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  panelBookingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 12,
  },
  bookingIconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookingVenue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  bookingDate: {
    color: '#94A3B8',
    fontSize: 12,
  },
  bookingPrice: {
    color: '#00FF00',
    fontSize: 15,
    fontWeight: '800',
  }
});
