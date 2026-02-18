import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Lock, Mail, Phone, ShieldCheck, User } from 'lucide-react-native';
import { AnimatePresence, MotiView } from 'moti';
import React, { useState } from 'react';
import { Image, ImageBackground, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../config/api';


// 10 PROFESSIONAL SPORTS & CARTOON AVATARS
const AVATARS = [
  { id: '1', url: 'https://cdn-icons-png.flaticon.com/512/1154/1154446.png' }, // Footballer 1
  { id: '2', url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }, // Pro Male
  { id: '3', url: 'https://cdn-icons-png.flaticon.com/512/6997/6997662.png' }, // Referee
  { id: '4', url: 'https://cdn-icons-png.flaticon.com/512/4140/4140047.png' }, // Pro Female
  { id: '5', url: 'https://cdn-icons-png.flaticon.com/512/4333/4333609.png' }, // Footballer 2
  { id: '6', url: 'https://cdn-icons-png.flaticon.com/512/3048/3048122.png' }, // Trophy/Winner
  { id: '7', url: 'https://cdn-icons-png.flaticon.com/512/1864/1864514.png' }, // Fitness Pro
  { id: '8', url: 'https://cdn-icons-png.flaticon.com/512/924/924915.png' },  // Team Captain
  { id: '9', url: 'https://cdn-icons-png.flaticon.com/512/2632/2632839.png' }, // Coach
  { id: '10', url: 'https://cdn-icons-png.flaticon.com/512/3588/3588658.png' }, // Goalkeeper
];

export default function RegisterScreen() {
  const router = useRouter();
  
  // Form States
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].url);
  
  // UI States
  const [isFocused, setIsFocused] = useState<string | null>(null);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Validation and Modal States
  const [errors, setErrors] = useState<{ [key: string]: string | null }>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMsg, setModalMsg] = useState('');

  const validateField = (field: string, value: string) => {
    let errorMsg = null;
    if (field === 'email') {
      if (value.includes(' ')) {
        errorMsg = 'Spaces are not allowed in email';
      } else if (!value.toLowerCase().endsWith('@gmail.com')) {
        errorMsg = 'Email must end with @gmail.com';
      }
    } else if (field === 'phone') {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(value)) errorMsg = 'Enter exactly 10 digits';
    } else if (field === 'password') {
      if (value.length < 6) errorMsg = 'Min 6 characters required';
    } else if (field === 'confirm') {
      if (value !== password) errorMsg = 'Passwords do not match';
    } else if (field === 'name') {
      if (value.length < 2) errorMsg = 'Name is too short';
    }
    setErrors(prev => ({ ...prev, [field]: errorMsg }));
  };



  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      setModalMsg('All fields are mandatory to join the pro league.');
      setModalVisible(true);
      return;
    }
    if (Object.values(errors).some(err => err !== null)) {
      setModalMsg('Please fix the highlighted errors before proceeding.');
      setModalVisible(true);
      return;
    }

    try {
      await api.post('/auth/register', {
        fullName: name,
        email,
        phone,
        password,
        avatar: selectedAvatar
      });
      
      setModalMsg("Welcome to the Pro League! Please log in.");
      setModalVisible(true);

      setTimeout(() => {
         setModalVisible(false);
         router.replace('/auth/login');
      }, 1500);
      
    } catch (error: any) {
      let friendlyMsg = "Something went wrong. Please try again.";
      if (error.response && error.response.data && error.response.data.msg) {
        friendlyMsg = error.response.data.msg;
      } else if (error.message) {
         friendlyMsg = `Error: ${error.message}`;
      }
      console.error("Registration Error:", error);
      setModalMsg(friendlyMsg);
      setModalVisible(true);
    }
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=1000' }} 
      style={styles.container}
    >
      <View style={styles.overlay} />
      <StatusBar style="light" />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flexOne}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          <MotiView from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: 'timing', duration: 1000 }}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft color="#00FF00" size={28} />
            </TouchableOpacity>
          </MotiView>

          <MotiView from={{ opacity: 0, translateY: -50 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 1000, delay: 100 }} style={styles.header}>
            <Text style={styles.title}>Claim Your Spot</Text>
            <Text style={styles.subtitle}>Join the Pro league. Access elite arenas.</Text>
          </MotiView>

          {/* AVATAR SECTION BLOCK */}
          <MotiView 
            from={{ opacity: 0, scale: 0.9, translateY: 20 }} 
            animate={{ opacity: 1, scale: 1, translateY: 0 }} 
            transition={{ type: 'timing', duration: 800, delay: 150 }} 
            style={styles.avatarSection}
          >
            <Text style={styles.avatarLabel}>Choose Your Player</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarList}>
              {AVATARS.map((item) => (
                <TouchableOpacity key={item.id} onPress={() => setSelectedAvatar(item.url)} style={styles.avatarWrapper}>
                  <Image 
                    source={{ uri: item.url }} 
                    style={[styles.avatarImg, selectedAvatar === item.url && styles.selectedAvatar]} 
                  />
                  {selectedAvatar === item.url && (
                    <MotiView from={{ scale: 0 }} animate={{ scale: 1 }} style={styles.checkBadge}>
                      <CheckCircle2 color="#00FF00" size={18} fill="#000" />
                    </MotiView>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </MotiView>

          <View style={styles.inputContainer}>
            {/* FULL NAME */}
            <MotiView from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: 'timing', duration: 600, delay: 200 }}>
              <View style={[styles.inputWrapper, errors.name && styles.errorBorder, isFocused === 'name' && styles.activeBorder]}>
                <User color={errors.name ? "#FF4444" : isFocused === 'name' ? "#00FF00" : "#94A3B8"} size={20} />
                <TextInput placeholder="Full Name" placeholderTextColor="#64748B" style={styles.input} value={name} onFocus={() => setIsFocused('name')} onBlur={() => { setIsFocused(null); validateField('name', name); }} onChangeText={(text) => { setName(text); validateField('name', text); }} />
              </View>
              <AnimatePresence>{errors.name && <MotiView from={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 25 }} transition={{ type: 'timing', duration: 200 }}><Text style={styles.errorText}>{errors.name}</Text></MotiView>}</AnimatePresence>
            </MotiView>

            {/* EMAIL */}
            <MotiView from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: 'timing', duration: 600, delay: 300 }}>
              <View style={[styles.inputWrapper, errors.email && styles.errorBorder, isFocused === 'email' && styles.activeBorder]}>
                <Mail color={errors.email ? "#FF4444" : isFocused === 'email' ? "#00FF00" : "#94A3B8"} size={20} />
                <TextInput placeholder="Email Address" placeholderTextColor="#64748B" style={styles.input} value={email} autoCapitalize="none" onFocus={() => setIsFocused('email')} onBlur={() => { setIsFocused(null); validateField('email', email); }} onChangeText={(text) => { setEmail(text); validateField('email', text); }} />
              </View>
              <AnimatePresence>{errors.email && <MotiView from={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 25 }} transition={{ type: 'timing', duration: 200 }}><Text style={styles.errorText}>{errors.email}</Text></MotiView>}</AnimatePresence>
            </MotiView>

            {/* PHONE */}
            <MotiView from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: 'timing', duration: 600, delay: 400 }}>
              <View style={[styles.inputWrapper, errors.phone && styles.errorBorder, isFocused === 'phone' && styles.activeBorder]}>
                <Phone color={errors.phone ? "#FF4444" : isFocused === 'phone' ? "#00FF00" : "#94A3B8"} size={20} />
                <TextInput placeholder="Phone Number" placeholderTextColor="#64748B" style={styles.input} value={phone} keyboardType="numeric" onFocus={() => setIsFocused('phone')} onBlur={() => { setIsFocused(null); validateField('phone', phone); }} onChangeText={(text) => { setPhone(text); validateField('phone', text); }} />
              </View>
              <AnimatePresence>{errors.phone && <MotiView from={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 25 }} transition={{ type: 'timing', duration: 200 }}><Text style={styles.errorText}>{errors.phone}</Text></MotiView>}</AnimatePresence>
            </MotiView>

            {/* PASSWORD */}
            <MotiView from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: 'timing', duration: 600, delay: 500 }}>
              <View style={[styles.inputWrapper, errors.password && styles.errorBorder, isFocused === 'pass' && styles.activeBorder]}>
                <Lock color={errors.password ? "#FF4444" : isFocused === 'pass' ? "#00FF00" : "#94A3B8"} size={20} />
                <TextInput placeholder="Password" placeholderTextColor="#64748B" style={styles.input} value={password} secureTextEntry={!showPass} onFocus={() => setIsFocused('pass')} onBlur={() => { setIsFocused(null); validateField('password', password); }} onChangeText={(text) => { setPassword(text); validateField('password', text); }} />
                <TouchableOpacity onPress={() => setShowPass(!showPass)}>{showPass ? <EyeOff color="#94A3B8" size={20} /> : <Eye color="#94A3B8" size={20} />}</TouchableOpacity>
              </View>
              <AnimatePresence>{errors.password && <MotiView from={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 25 }} transition={{ type: 'timing', duration: 200 }}><Text style={styles.errorText}>{errors.password}</Text></MotiView>}</AnimatePresence>
            </MotiView>

            {/* CONFIRM PASSWORD */}
            <MotiView from={{ opacity: 0, translateX: -20 }} animate={{ opacity: 1, translateX: 0 }} transition={{ type: 'timing', duration: 600, delay: 600 }}>
              <View style={[styles.inputWrapper, errors.confirm && styles.errorBorder, isFocused === 'confirm' && styles.activeBorder]}>
                <ShieldCheck color={errors.confirm ? "#FF4444" : isFocused === 'confirm' ? "#00FF00" : "#94A3B8"} size={20} />
                <TextInput placeholder="Confirm Password" placeholderTextColor="#64748B" style={styles.input} value={confirmPassword} secureTextEntry={!showConfirmPass} onFocus={() => setIsFocused('confirm')} onBlur={() => { setIsFocused(null); validateField('confirm', confirmPassword); }} onChangeText={(text) => { setConfirmPassword(text); validateField('confirm', text); }} />
                <TouchableOpacity onPress={() => setShowConfirmPass(!showConfirmPass)}>{showConfirmPass ? <EyeOff color="#94A3B8" size={20} /> : <Eye color="#94A3B8" size={20} />}</TouchableOpacity>
              </View>
              <AnimatePresence>{errors.confirm && <MotiView from={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 25 }} transition={{ type: 'timing', duration: 200 }}><Text style={styles.errorText}>{errors.confirm}</Text></MotiView>}</AnimatePresence>
            </MotiView>

            {/* REGISTER BUTTON */}
            <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 600, delay: 750 }}>
              <TouchableOpacity activeOpacity={0.9} style={styles.registerButton} onPress={handleRegister}>
                <Text style={styles.registerButtonText}>CREATE PRO ACCOUNT</Text>
              </TouchableOpacity>
            </MotiView>

            {/* FOOTER */}
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ type: 'timing', duration: 1000, delay: 900 }}>
              <TouchableOpacity style={styles.footer} onPress={() => router.push('/auth/login')}>
                <Text style={styles.footerText}>Already a member? <Text style={styles.linkText}>Log In</Text></Text>
              </TouchableOpacity>
            </MotiView>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <MotiView from={{ scale: 0.8, opacity: 0, translateY: 20 }} animate={{ scale: 1, opacity: 1, translateY: 0 }} style={styles.modalBox}>
            <View style={styles.modalIconBg}><AlertCircle color="#FF4444" size={40} /></View>
            <Text style={styles.modalTitle}>Registration Error</Text>
            <Text style={styles.modalMessage}>{modalMsg}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(false)}><Text style={styles.modalButtonText}>TRY AGAIN</Text></TouchableOpacity>
          </MotiView>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  // --- MAIN CONTAINER ---
  container: { flex: 1 },
  flexOne: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7, 10, 20, 0.92)' },
  content: { padding: 25, paddingTop: 60 },

  // --- HEADER SECTION ---
  backButton: { width: 50, height: 50, justifyContent: 'center', marginBottom: 10 },
  header: { marginBottom: 20 },
  title: { fontSize: 40, fontWeight: '900', color: '#FFFFFF', textTransform: 'uppercase' },
  subtitle: { fontSize: 16, color: '#94A3B8', marginTop: 5 },

  // --- AVATAR SELECTION BLOCKS ---
  avatarSection: { marginBottom: 25 },
  avatarLabel: { color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginBottom: 12, marginLeft: 5 },
  avatarList: { paddingRight: 20, gap: 15 },
  avatarWrapper: { position: 'relative' },
  avatarImg: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(255,255,255,0.1)' },
  selectedAvatar: { borderColor: '#00FF00', shadowColor: '#00FF00', shadowOpacity: 0.5, shadowRadius: 10 },
  checkBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#000', borderRadius: 10 },

  // --- INPUT FIELD BLOCKS ---
  inputContainer: { gap: 10 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 20,
    height: 65,
    gap: 15,
  },
  activeBorder: { borderColor: '#00FF00', backgroundColor: 'rgba(0, 255, 0, 0.03)' },
  errorBorder: { borderColor: '#FF4444' },
  input: { flex: 1, color: '#FFFFFF', fontSize: 16, height: '100%' },
  errorText: { color: '#FF4444', fontSize: 12, fontWeight: '600', marginLeft: 5, marginTop: 5, lineHeight: 16 },

  // --- BUTTON BLOCKS ---
  registerButton: {
    height: 65,
    backgroundColor: '#00FF00',
    borderRadius: 15,
    marginTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00FF00',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  registerButtonText: { color: '#000000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },

  // --- FOOTER BLOCK ---
  footer: { marginTop: 20, alignItems: 'center', marginBottom: 40 },
  footerText: { color: '#94A3B8', fontSize: 15 },
  linkText: { color: '#00FF00', fontWeight: 'bold' },

  // --- MODAL BLOCKS ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.9)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  modalBox: { width: '100%', backgroundColor: '#1E293B', borderRadius: 30, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.1)' },
  modalIconBg: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255, 68, 68, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900' },
  modalMessage: { color: '#94A3B8', fontSize: 16, textAlign: 'center', marginTop: 12, lineHeight: 24 },
  modalButton: { backgroundColor: '#FF4444', paddingHorizontal: 40, paddingVertical: 15, borderRadius: 15, marginTop: 30, width: '100%', alignItems: 'center' },
  modalButtonText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14, letterSpacing: 1 },
});