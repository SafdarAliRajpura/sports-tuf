import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../../src/api/apiClient';
import { useFocusEffect, useRouter } from 'expo-router';
import { getAvatarUrl } from '../../src/utils/imageUtils';
import { StatusBar } from 'expo-status-bar';
import { ChevronRight, CreditCard, Edit3, HelpCircle, History, LogOut, Medal, Settings, Shield, Trophy } from 'lucide-react-native';
import { Feather } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import { auth, db } from '../config/firebase'; 
// import { signOut } from 'firebase/auth';
// import { doc, getDoc } from 'firebase/firestore';

export default function ProfileScreen() {
  const router = useRouter();
  
  // Local states for real user data
  const [userData, setUserData] = useState<{ fullName: string; email: string; avatar?: string; user_profile?: string; skillLevel?: string; stats?: any; xp?: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const fetchUserData = async () => {
        try {
          // Fetch real stats from the backend /api/auth/me
          const res = await apiClient.get('/api/auth/me');
          if (res.data && res.data.success) {
            const serverUser = res.data.data;
            const jsonValue = await AsyncStorage.getItem('userInfo');
            const localUser = jsonValue ? JSON.parse(jsonValue) : {};
            
            const mergedUser = {
                ...serverUser,
                token: localUser.token, // Preserve token for API calls
                fullName: `${serverUser.first_name} ${serverUser.last_name}`.trim(),
                avatar: serverUser.user_profile
            };
            
            setUserData(mergedUser);
            // Optional: Update storage so we have it offline
            await AsyncStorage.setItem('userInfo', JSON.stringify(mergedUser));
          }
        } catch (error) {
          console.error("Error fetching user data from server:", error);
          // Fallback to local storage if offline
          const jsonValue = await AsyncStorage.getItem('userInfo');
          if (jsonValue) setUserData(JSON.parse(jsonValue));
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }, [])
  );

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userInfo');
      await AsyncStorage.removeItem('userToken');
      // Navigate to login and reset history
      router.replace('/auth/login');
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00FF00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* HEADER SECTION */}
      <View style={styles.header}>
        {/* EDIT BUTTON */}
        <TouchableOpacity 
          style={styles.editButton} 
          onPress={() => router.push('/profile/edit')}
        >
          <Edit3 color="#00FF00" size={20} />
        </TouchableOpacity>

        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: getAvatarUrl(userData?.avatar || userData?.user_profile) }}
              style={styles.avatar}
            />
            <View style={styles.onlineBadge} />
          </View>
          
          <Text style={styles.name}>
            {userData?.fullName || 'Pro Athlete'}
          </Text>
          <Text style={styles.handle}>
            {userData?.email || 'Searching for team...'}
          </Text>

          <View style={styles.rankBadge}>
            <Trophy color="#00FF00" size={14} />
            <Text style={styles.rankText}>{userData?.skillLevel || 'Rookie'} Division</Text>
          </View>
        </View>
      </View>

      {/* STATS OVERVIEW */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{userData?.stats?.totalBookings || 0}</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{userData?.xp || 0}</Text>
          <Text style={styles.statLabel}>XP</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{userData?.stats?.tournamentEntries || 0}</Text>
          <Text style={styles.statLabel}>Events</Text>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionHeader}>ACCOUNT</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile/history')}>
          <View style={styles.menuIconBox}>
            <History color="#FFFFFF" size={20} />
          </View>
          <Text style={styles.menuText}>Match History</Text>
          <ChevronRight color="#475569" size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconBox}>
            <CreditCard color="#FFFFFF" size={20} />
          </View>
          <Text style={styles.menuText}>Payment Methods</Text>
          <ChevronRight color="#475569" size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconBox}>
            <Medal color="#FFFFFF" size={20} />
          </View>
          <Text style={styles.menuText}>Achievements</Text>
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>2 New</Text>
          </View>
          <ChevronRight color="#475569" size={20} />
        </TouchableOpacity>

        <Text style={[styles.sectionHeader, { marginTop: 30 }]}>SETTINGS</Text>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile/security')}>
          <View style={styles.menuIconBox}>
            <Shield color="#FFFFFF" size={20} />
          </View>
          <Text style={styles.menuText}>Security & Password</Text>
          <ChevronRight color="#475569" size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile/help')}>
          <View style={styles.menuIconBox}>
            <HelpCircle color="#FFFFFF" size={20} />
          </View>
          <Text style={styles.menuText}>Help Center</Text>
          <ChevronRight color="#475569" size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile/contact')}>
          <View style={styles.menuIconBox}>
            <Feather name="message-circle" color="#FFFFFF" size={20} />
          </View>
          <Text style={styles.menuText}>Contact Us</Text>
          <ChevronRight color="#475569" size={20} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <LogOut color="#FF3B30" size={20} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // --- MAIN CONTAINER ---
  container: {
    flex: 1,
    backgroundColor: '#070A14',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#070A14',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- HEADER SECTION ---
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 30,
    backgroundColor: '#0F172A',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
  },
  editButton: {
    position: 'absolute',
    top: 60,
    right: 25,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.2)',
  },
  profileInfo: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#00FF00',
    backgroundColor: '#1E293B',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    backgroundColor: '#00FF00',
    borderRadius: 10,
    borderWidth: 3,
    borderColor: '#0F172A',
  },
  name: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  handle: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 15,
  },
  rankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.3)',
  },
  rankText: {
    color: '#00FF00',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },

  // --- STATS OVERVIEW ---
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    marginHorizontal: 20,
    marginTop: -25,
    borderRadius: 20,
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  divider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  // --- MENU ITEMS ---
  scrollContent: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: Platform.OS === 'ios' ? 120 : 100,
  },
  sectionHeader: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 15,
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  notificationBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },

  // --- LOGOUT ---
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FF3B30',
    gap: 8,
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '700',
  },
});