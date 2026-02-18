import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react-native';
import { AnimatePresence, MotiView } from 'moti';
import React, { useState } from 'react';
import { ActivityIndicator, ImageBackground, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../config/api';

export default function LoginScreen() {
  const router = useRouter();
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);

  // Validation States
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  
  // Custom Popup State
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMsg, setModalMsg] = useState('');

  // Real-time Validation Logic
  const validateField = (field: string, value: string) => {
    let errorMsg = null;
    if (field === 'email') {
      if (!value.toLowerCase().endsWith('@gmail.com')) {
        errorMsg = 'Must be a valid @gmail.com address';
      }
    } else if (field === 'password') {
      if (value.length < 6) {
        errorMsg = 'Password must be at least 6 characters';
      }
    }
    setErrors(prev => ({ ...prev, [field]: errorMsg }));
  };



  // Loading State
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setModalMsg('Please enter your credentials to enter the arena.');
      setModalVisible(true);
      return;
    }

    if (errors.email || errors.password) {
      setModalMsg('Please fix the errors in the fields above.');
      setModalVisible(true);
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      if (response.data && response.data.user) {
        await AsyncStorage.setItem('userInfo', JSON.stringify(response.data.user));
        // You can also store a token here if you implement JWT later
        // await AsyncStorage.setItem('userToken', response.data.token);
        
        router.replace('/(tabs)/home' as any);
      }
    } catch (error: any) {
      let friendlyMsg = "Something went wrong. Please try again.";
      if (error.response && error.response.data && error.response.data.msg) {
        friendlyMsg = error.response.data.msg;
      } else if (error.message) {
         friendlyMsg = error.message;
      }
      setModalMsg(friendlyMsg);
      setModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1000' }} 
      style={styles.container}
    >
      <View style={styles.overlay} />
      <StatusBar style="light" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexOne}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <MotiView 
            from={{ opacity: 0, translateY: -50 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 1000 }}
            style={styles.header}
          >
            <Text style={styles.title}>ArenaPro</Text>
            <Text style={styles.subtitle}>Where Champions Book. Where Legends Play.</Text>
          </MotiView>

          <View style={styles.inputContainer}>
            
            <MotiView
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', duration: 600, delay: 200 }}
            >
              <View style={[styles.inputWrapper, errors.email && styles.errorBorder, isFocused === 'email' && styles.activeBorder]}>
                <Mail color={errors.email ? "#FF4444" : isFocused === 'email' ? "#00FF00" : "#94A3B8"} size={20} />
                <TextInput
                  placeholder="Email Address"
                  placeholderTextColor="#64748B"
                  style={styles.input}
                  value={email}
                  autoCapitalize="none"
                  onFocus={() => setIsFocused('email')}
                  onBlur={() => { setIsFocused(null); validateField('email', email); }}
                  onChangeText={(text) => { setEmail(text); validateField('email', text); }}
                />
              </View>
              <AnimatePresence>
                {errors.email && (
                  <MotiView from={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 25 }} transition={{ type: 'timing', duration: 200 }}>
                    <Text style={styles.errorText}>{errors.email}</Text>
                  </MotiView>
                )}
              </AnimatePresence>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: 'timing', duration: 600, delay: 400 }}
            >
              <View style={[styles.inputWrapper, errors.password && styles.errorBorder, isFocused === 'pass' && styles.activeBorder]}>
                <Lock color={errors.password ? "#FF4444" : isFocused === 'pass' ? "#00FF00" : "#94A3B8"} size={20} />
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#64748B"
                  style={styles.input}
                  value={password}
                  secureTextEntry={!showPass}
                  onFocus={() => setIsFocused('pass')}
                  onBlur={() => { setIsFocused(null); validateField('password', password); }}
                  onChangeText={(text) => { setPassword(text); validateField('password', text); }}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                  {showPass ? <EyeOff color="#94A3B8" size={20} /> : <Eye color="#94A3B8" size={20} />}
                </TouchableOpacity>
              </View>
              <AnimatePresence>
                {errors.password && (
                  <MotiView from={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 25 }} transition={{ type: 'timing', duration: 200 }}>
                    <Text style={styles.errorText}>{errors.password}</Text>
                  </MotiView>
                )}
              </AnimatePresence>
            </MotiView>

            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 600, delay: 600 }}
            >
              <TouchableOpacity activeOpacity={0.9} style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                {loading ? (
                   <ActivityIndicator size="large" color="#000000" />
                ) : (
                   <View style={styles.buttonInner}>
                     <Text style={styles.loginButtonText}>LOGIN TO ARENA</Text>
                     <ArrowRight color="#000000" size={22} strokeWidth={3} />
                   </View>
                )}
              </TouchableOpacity>
            </MotiView>

            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'timing', duration: 1000, delay: 800 }}
            >
              <TouchableOpacity style={styles.footer} onPress={() => router.push('/auth/register')}>
                <Text style={styles.footerText}>Join the Pro league? <Text style={styles.linkText}>Create Account</Text></Text>
              </TouchableOpacity>
            </MotiView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <MotiView from={{ scale: 0.8, opacity: 0, translateY: 20 }} animate={{ scale: 1, opacity: 1, translateY: 0 }} style={styles.modalBox}>
            <View style={styles.modalIconBg}><AlertCircle color="#FF4444" size={40} /></View>
            <Text style={styles.modalTitle}>Authentication Error</Text>
            <Text style={styles.modalMessage}>{modalMsg}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.modalButtonText}>TRY AGAIN</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flexOne: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7, 10, 20, 0.88)' },
  content: { flexGrow: 1, justifyContent: 'center', padding: 25 },
  header: { marginBottom: 50, alignItems: 'center' },
  title: { fontSize: 52, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1 },
  subtitle: { fontSize: 16, color: '#94A3B8', marginTop: 5, fontWeight: '500', textAlign: 'center' },
  inputContainer: { gap: 12 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 20,
    height: 70,
    gap: 15,
  },
  activeBorder: { borderColor: '#00FF00', backgroundColor: 'rgba(0, 255, 0, 0.03)' },
  errorBorder: { borderColor: '#FF4444' },
  input: { flex: 1, color: '#FFFFFF', fontSize: 17, height: '100%', fontWeight: '500' },
  
  // FIXED: No negative margins, added marginTop for clear visibility
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
    marginTop: 5,   // Pushes text down from the border
    lineHeight: 16, // Ensures the container has enough height
  },
  
  loginButton: {
    height: 70,
    backgroundColor: '#00FF00',
    borderRadius: 15,
    marginTop: 15,
    shadowColor: '#00FF00',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
    justifyContent: 'center', // Center vertically
    alignItems: 'center',     // Center horizontally
  },
  buttonInner: {flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  loginButtonText: { color: '#000000', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  footer: { marginTop: 40, alignItems: 'center' },
  footerText: { color: '#94A3B8', fontSize: 15 },
  linkText: { color: '#00FF00', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.9)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  modalBox: { width: '100%', backgroundColor: '#1E293B', borderRadius: 30, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)', shadowColor: '#FF4444', shadowOpacity: 0.2, shadowRadius: 20 },
  modalIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 68, 68, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  modalMessage: { color: '#94A3B8', fontSize: 16, textAlign: 'center', marginTop: 12, lineHeight: 24 },
  modalButton: { backgroundColor: '#FF4444', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 15, marginTop: 30, width: '100%', alignItems: 'center' },
  modalButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
});