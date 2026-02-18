import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Camera, Check, CheckCircle2, User } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
// import { auth, db } from '../config/firebase';
// import { doc, getDoc, updateDoc } from 'firebase/firestore';

const AVATARS = [
  { id: '1', url: 'https://api.dicebear.com/7.x/avataaars/png?seed=Felix' },
  { id: '2', url: 'https://api.dicebear.com/7.x/avataaars/png?seed=Aneka' },
  { id: '3', url: 'https://api.dicebear.com/7.x/avataaars/png?seed=Max' },
  { id: '4', url: 'https://api.dicebear.com/7.x/avataaars/png?seed=Sophia' },
  { id: '5', url: 'https://api.dicebear.com/7.x/avataaars/png?seed=Jack' },
  { id: '6', url: 'https://api.dicebear.com/7.x/avataaars/png?seed=Amaya' },
  { id: '7', url: 'https://api.dicebear.com/7.x/avataaars/png?seed=James' },
  { id: '8', url: 'https://api.dicebear.com/7.x/avataaars/png?seed=Mimi' },
  { id: '9', url: 'https://api.dicebear.com/7.x/avataaars/png?seed=Leo' },
  { id: '10', url: 'https://api.dicebear.com/7.x/avataaars/png?seed=Luna' },
];

export default function EditProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form States
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');

  useEffect(() => {
    const loadUserData = async () => {
      try {
          const jsonValue = await AsyncStorage.getItem('userInfo');
          if (jsonValue != null) {
            const user = JSON.parse(jsonValue);
            setName(user.fullName || '');
            // Check if user's avatar is in our list, if not use the first one or keep it as is
            setSelectedAvatar(user.avatar || AVATARS[0].url);
          }
      } catch (error) {
        console.error("Error loading user data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
        // Read existing user info to preserve other fields (like email, id)
        const jsonValue = await AsyncStorage.getItem('userInfo');
        let updatedUser = {};
        if (jsonValue != null) {
            updatedUser = JSON.parse(jsonValue);
        }

        // Update with new values
        updatedUser = {
            ...updatedUser,
            fullName: name,
            avatar: selectedAvatar
        };

        // Save back to AsyncStorage
        await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUser));
        
        // Go back to profile screen
        router.back();
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setSaving(false);
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
      
      {/* HEADER BLOCK */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ArrowLeft color="#FFFFFF" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color="#00FF00" /> : <Check color="#00FF00" size={24} />}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* CURRENT PREVIEW BLOCK */}
          <View style={styles.previewSection}>
            <View style={styles.mainAvatarContainer}>
              <Image source={{ uri: selectedAvatar }} style={styles.mainAvatar} />
              <View style={styles.cameraBadge}>
                <Camera color="#000" size={16} />
              </View>
            </View>
          </View>

          {/* AVATAR SELECTOR BLOCK */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CHOOSE YOUR PLAYER</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarList}>
              {AVATARS.map((item) => (
                <TouchableOpacity key={item.id} onPress={() => setSelectedAvatar(item.url)} style={styles.avatarWrapper}>
                  <Image source={{ uri: item.url }} style={[styles.avatarOption, selectedAvatar === item.url && styles.activeAvatar]} />
                  {selectedAvatar === item.url && (
                    <MotiView from={{ scale: 0 }} animate={{ scale: 1 }} style={styles.miniCheck}>
                      <CheckCircle2 color="#00FF00" size={16} fill="#000" />
                    </MotiView>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* INPUT BLOCK */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>FULL NAME</Text>
            <View style={styles.inputWrapper}>
              <User color="#94A3B8" size={20} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="#64748B"
              />
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
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

  // --- HEADER BLOCK ---
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#0F172A',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  saveButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- PREVIEW BLOCK ---
  scrollContent: {
    padding: 25,
  },
  previewSection: {
    alignItems: 'center',
    marginVertical: 30,
  },
  mainAvatarContainer: {
    position: 'relative',
  },
  mainAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#00FF00',
    backgroundColor: '#1E293B',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#00FF00',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#070A14',
  },

  // --- AVATAR SELECTION BLOCK ---
  section: {
    marginBottom: 35,
  },
  sectionLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 15,
    letterSpacing: 1,
  },
  avatarList: {
    gap: 15,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarOption: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#1E293B',
  },
  activeAvatar: {
    borderColor: '#00FF00',
  },
  miniCheck: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#000',
    borderRadius: 10,
  },

  // --- INPUT BLOCK ---
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 16,
    paddingHorizontal: 20,
    height: 65,
    gap: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});