import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ChevronRight, CreditCard, HelpCircle, History, LogOut, Medal, Settings, Trophy, Edit3 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { auth, db } from '../config/firebase'; 
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function ProfileScreen() {
  const router = useRouter();
  
  // Local states for real user data
  const [userData, setUserData] = useState<{ fullName: string; email: string; avatar?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data() as { fullName: string; email: string; avatar?: string });
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
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
              source={{ uri: userData?.avatar || 'https://api.dicebear.com/7.x/avataaars/png?seed=Felix' }}
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
            <Text style={styles.rankText}>Elite Division</Text>
          </View>
        </View>
      </View>

      {/* STATS OVERVIEW */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>42</Text>
          <Text style={styles.statLabel}>Matches</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>850</Text>
          <Text style={styles.statLabel}>Karma</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>12</Text>
          <Text style={styles.statLabel}>MVP</Text>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionHeader}>ACCOUNT</Text>

        <TouchableOpacity style={styles.menuItem}>
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

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconBox}>
            <Settings color="#FFFFFF" size={20} />
          </View>
          <Text style={styles.menuText}>Preferences</Text>
          <ChevronRight color="#475569" size={20} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconBox}>
            <HelpCircle color="#FFFFFF" size={20} />
          </View>
          <Text style={styles.menuText}>Help & Support</Text>
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