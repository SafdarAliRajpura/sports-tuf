import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, User, Phone, ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { MotiView, MotiText, AnimatePresence } from 'moti';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isFocused, setIsFocused] = useState<string | null>(null);

  return (
    <ImageBackground 
      // UPDATED: High-energy multi-sport court background
      source={{ uri: 'https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?q=80&w=1000' }} 
      style={styles.container}
    >
      <View style={styles.overlay} />
      <StatusBar style="light" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* 1. Entrance: Back Button */}
          <MotiView
            from={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', delay: 100 }}
          >
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft color="#00FF00" size={28} />
            </TouchableOpacity>
          </MotiView>

          {/* 2. Entrance: Header */}
          <MotiView 
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 800 }}
            style={styles.header}
          >
            {/* UPDATED: Branded Title */}
            <Text style={styles.title}>Claim Your Spot</Text>
            <MotiText 
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 300 }}
              style={styles.subtitle}
            >
              Join the Pro league. Access elite arenas.
            </MotiText>
          </MotiView>

          <View style={styles.inputContainer}>
            
            {/* 3. Entrance: Full Name */}
            <MotiView 
              from={{ opacity: 0, translateX: -30 }}
              animate={{ 
                opacity: 1, translateX: 0,
                borderColor: isFocused === 'name' ? '#00FF00' : 'rgba(255, 255, 255, 0.1)',
                backgroundColor: isFocused === 'name' ? 'rgba(0, 255, 0, 0.03)' : 'rgba(255, 255, 255, 0.05)',
              }}
              transition={{ 
                opacity: { delay: 400 }, translateX: { delay: 400 },
                borderColor: { type: 'timing', duration: 200 }, backgroundColor: { type: 'timing', duration: 200 }
              }}
              style={styles.inputWrapper}
            >
              <User color={isFocused === 'name' ? "#00FF00" : "#94A3B8"} size={20} />
              <TextInput
                placeholder="Full Name"
                placeholderTextColor="#64748B"
                selectionColor="#00FF00"
                style={styles.input}
                onFocus={() => setIsFocused('name')}
                onBlur={() => setIsFocused(null)}
                value={name}
                onChangeText={setName}
              />
              <AnimatePresence>
                {isFocused === 'name' && (
                  <MotiView from={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 25 }} exit={{ opacity: 0, height: 0 }} style={styles.activeIndicator} />
                )}
              </AnimatePresence>
            </MotiView>

            {/* 4. Entrance: Email */}
            <MotiView 
              from={{ opacity: 0, translateX: -30 }}
              animate={{ 
                opacity: 1, translateX: 0,
                borderColor: isFocused === 'email' ? '#00FF00' : 'rgba(255, 255, 255, 0.1)',
                backgroundColor: isFocused === 'email' ? 'rgba(0, 255, 0, 0.03)' : 'rgba(255, 255, 255, 0.05)',
              }}
              transition={{ 
                opacity: { delay: 500 }, translateX: { delay: 500 },
                borderColor: { type: 'timing', duration: 200 }, backgroundColor: { type: 'timing', duration: 200 }
              }}
              style={styles.inputWrapper}
            >
              <Mail color={isFocused === 'email' ? "#00FF00" : "#94A3B8"} size={20} />
              <TextInput
                placeholder="Email Address"
                placeholderTextColor="#64748B"
                selectionColor="#00FF00"
                style={styles.input}
                onFocus={() => setIsFocused('email')}
                onBlur={() => setIsFocused(null)}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <AnimatePresence>
                {isFocused === 'email' && (
                  <MotiView from={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 25 }} exit={{ opacity: 0, height: 0 }} style={styles.activeIndicator} />
                )}
              </AnimatePresence>
            </MotiView>

            {/* 5. Entrance: Phone */}
            <MotiView 
              from={{ opacity: 0, translateX: -30 }}
              animate={{ 
                opacity: 1, translateX: 0,
                borderColor: isFocused === 'phone' ? '#00FF00' : 'rgba(255, 255, 255, 0.1)',
                backgroundColor: isFocused === 'phone' ? 'rgba(0, 255, 0, 0.03)' : 'rgba(255, 255, 255, 0.05)',
              }}
              transition={{ 
                opacity: { delay: 600 }, translateX: { delay: 600 },
                borderColor: { type: 'timing', duration: 200 }, backgroundColor: { type: 'timing', duration: 200 }
              }}
              style={styles.inputWrapper}
            >
              <Phone color={isFocused === 'phone' ? "#00FF00" : "#94A3B8"} size={20} />
              <TextInput
                placeholder="Phone Number"
                placeholderTextColor="#64748B"
                selectionColor="#00FF00"
                style={styles.input}
                onFocus={() => setIsFocused('phone')}
                onBlur={() => setIsFocused(null)}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <AnimatePresence>
                {isFocused === 'phone' && (
                  <MotiView from={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 25 }} exit={{ opacity: 0, height: 0 }} style={styles.activeIndicator} />
                )}
              </AnimatePresence>
            </MotiView>

            {/* 6. Entrance: Password */}
            <MotiView 
              from={{ opacity: 0, translateX: -30 }}
              animate={{ 
                opacity: 1, translateX: 0,
                borderColor: isFocused === 'pass' ? '#00FF00' : 'rgba(255, 255, 255, 0.1)',
                backgroundColor: isFocused === 'pass' ? 'rgba(0, 255, 0, 0.03)' : 'rgba(255, 255, 255, 0.05)',
              }}
              transition={{ 
                opacity: { delay: 700 }, translateX: { delay: 700 },
                borderColor: { type: 'timing', duration: 200 }, backgroundColor: { type: 'timing', duration: 200 }
              }}
              style={styles.inputWrapper}
            >
              <Lock color={isFocused === 'pass' ? "#00FF00" : "#94A3B8"} size={20} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#64748B"
                selectionColor="#00FF00"
                style={styles.input}
                onFocus={() => setIsFocused('pass')}
                onBlur={() => setIsFocused(null)}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              <AnimatePresence>
                {isFocused === 'pass' && (
                  <MotiView from={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 25 }} exit={{ opacity: 0, height: 0 }} style={styles.activeIndicator} />
                )}
              </AnimatePresence>
            </MotiView>

            {/* 7. Entrance: Confirm Password */}
            <MotiView 
              from={{ opacity: 0, translateX: -30 }}
              animate={{ 
                opacity: 1, translateX: 0,
                borderColor: isFocused === 'confirm' ? '#00FF00' : 'rgba(255, 255, 255, 0.1)',
                backgroundColor: isFocused === 'confirm' ? 'rgba(0, 255, 0, 0.03)' : 'rgba(255, 255, 255, 0.05)',
              }}
              transition={{ 
                opacity: { delay: 800 }, translateX: { delay: 800 },
                borderColor: { type: 'timing', duration: 200 }, backgroundColor: { type: 'timing', duration: 200 }
              }}
              style={styles.inputWrapper}
            >
              <ShieldCheck color={isFocused === 'confirm' ? "#00FF00" : "#94A3B8"} size={20} />
              <TextInput
                placeholder="Confirm Password"
                placeholderTextColor="#64748B"
                selectionColor="#00FF00"
                style={styles.input}
                onFocus={() => setIsFocused('confirm')}
                onBlur={() => setIsFocused(null)}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              <AnimatePresence>
                {isFocused === 'confirm' && (
                  <MotiView from={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 25 }} exit={{ opacity: 0, height: 0 }} style={styles.activeIndicator} />
                )}
              </AnimatePresence>
            </MotiView>

            {/* 8. Entrance: Button Wrapper */}
            <MotiView
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ delay: 900, type: 'timing', duration: 600 }}
            >
              <TouchableOpacity 
                activeOpacity={0.9}
                style={styles.registerButton} 
                onPress={() => router.replace('/(tabs)/home')}
              >
                <MotiView
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ loop: true, type: 'timing', duration: 2500, delay: 1500 }}
                  style={styles.buttonInner}
                >
                  <Text style={styles.registerButtonText}>CREATE PRO ACCOUNT</Text>
                </MotiView>
              </TouchableOpacity>
            </MotiView>
          </View>

          {/* 9. Entrance: Footer */}
          <MotiView 
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1100 }}
            style={styles.footer}
          >
            <TouchableOpacity onPress={() => router.push('/auth/login')}>
              <Text style={styles.footerText}>
                Already a member? <Text style={styles.linkText}>Log In</Text>
              </Text>
            </TouchableOpacity>
          </MotiView>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7, 10, 20, 0.92)' },
  content: { padding: 25, paddingTop: 60 },
  backButton: { width: 50, height: 50, justifyContent: 'center', marginBottom: 10 },
  header: { marginBottom: 30 },
  title: { 
    fontSize: 40, fontWeight: '900', color: '#FFFFFF', textTransform: 'uppercase',
    textShadowColor: 'rgba(0, 255, 0, 0.4)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 15,
  },
  subtitle: { fontSize: 16, color: '#94A3B8', marginTop: 5 },
  inputContainer: { gap: 15 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 15, borderWidth: 1,
    paddingHorizontal: 20, height: 65, gap: 15, position: 'relative',
  },
  input: { flex: 1, color: '#FFFFFF', fontSize: 16, height: '100%', fontWeight: '500' },
  activeIndicator: {
    position: 'absolute', left: 0, width: 4, backgroundColor: '#00FF00',
    borderRadius: 2, shadowColor: '#00FF00', shadowOpacity: 1, shadowRadius: 10,
  },
  registerButton: {
    height: 65, backgroundColor: '#00FF00', borderRadius: 15, marginTop: 15,
    shadowColor: '#00FF00', shadowOpacity: 0.5, shadowRadius: 15, elevation: 8,
  },
  buttonInner: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  registerButtonText: { color: '#000000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  footer: { marginTop: 30, alignItems: 'center', marginBottom: 50 },
  footerText: { color: '#94A3B8', fontSize: 15 },
  linkText: { color: '#00FF00', fontWeight: 'bold' },
});