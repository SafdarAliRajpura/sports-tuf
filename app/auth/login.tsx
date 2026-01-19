import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ImageBackground, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import { MotiView, MotiText, AnimatePresence } from 'moti';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFocused, setIsFocused] = useState<string | null>(null);

  // Direct redirection to the Home Dashboard
  const handleLogin = () => {
    // Replace current route with the Home Dashboard inside the tabs group
    router.replace('/(tabs)/home' as any);
  };

  return (
    <ImageBackground 
      // Multi-sport cinematic background
      source={{ uri: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=1000' }} 
      style={styles.container}
    >
      <View style={styles.overlay} />
      <StatusBar style="light" />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Entrance: Header */}
        <MotiView 
          from={{ opacity: 0, translateY: -30 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 800 }}
          style={styles.header}
        >
          <Text style={styles.title}>ArenaPro</Text>
          <MotiText 
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 300 }}
            style={styles.subtitle}
          >
            Where Champions Book. Where Legends Play.
          </MotiText>
        </MotiView>

        <View style={styles.inputContainer}>
          
          {/* Email Field */}
          <MotiView 
            from={{ opacity: 0, translateX: -30 }}
            animate={{ 
              opacity: 1, 
              translateX: 0,
              borderColor: isFocused === 'email' ? '#00FF00' : 'rgba(255, 255, 255, 0.2)',
              backgroundColor: isFocused === 'email' ? 'rgba(0, 255, 0, 0.03)' : 'transparent',
            }}
            transition={{ 
              opacity: { type: 'timing', duration: 500, delay: 400 },
              translateX: { type: 'timing', duration: 500, delay: 400 },
              borderColor: { type: 'timing', duration: 200 },
              backgroundColor: { type: 'timing', duration: 200 }
            }}
            style={styles.inputWrapper}
          >
            <Mail color={isFocused === 'email' ? "#00FF00" : "#94A3B8"} size={20} />
            <TextInput
              placeholder="Email Address"
              placeholderTextColor="#64748B"
              selectionColor="#00FF00" 
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              onFocus={() => setIsFocused('email')}
              onBlur={() => setIsFocused(null)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <AnimatePresence>
              {isFocused === 'email' && (
                <MotiView 
                  from={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 25 }}
                  exit={{ opacity: 0, height: 0 }}
                  style={styles.activeIndicator}
                />
              )}
            </AnimatePresence>
          </MotiView>

          {/* Password Field */}
          <MotiView 
            from={{ opacity: 0, translateX: -30 }}
            animate={{ 
              opacity: 1, 
              translateX: 0,
              borderColor: isFocused === 'pass' ? '#00FF00' : 'rgba(255, 255, 255, 0.2)',
              backgroundColor: isFocused === 'pass' ? 'rgba(0, 255, 0, 0.03)' : 'transparent',
            }}
            transition={{ 
              opacity: { type: 'timing', duration: 500, delay: 550 },
              translateX: { type: 'timing', duration: 500, delay: 550 },
              borderColor: { type: 'timing', duration: 200 },
              backgroundColor: { type: 'timing', duration: 200 }
            }}
            style={styles.inputWrapper}
          >
            <Lock color={isFocused === 'pass' ? "#00FF00" : "#94A3B8"} size={20} />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#64748B"
              selectionColor="#00FF00" 
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              onFocus={() => setIsFocused('pass')}
              onBlur={() => setIsFocused(null)}
              secureTextEntry
            />
            <AnimatePresence>
              {isFocused === 'pass' && (
                <MotiView 
                  from={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 25 }}
                  exit={{ opacity: 0, height: 0 }}
                  style={styles.activeIndicator}
                />
              )}
            </AnimatePresence>
          </MotiView>

          {/* Login Button */}
          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 700, type: 'timing', duration: 600 }}
          >
            <TouchableOpacity 
              activeOpacity={0.9}
              style={styles.loginButton} 
              onPress={handleLogin}
            >
              <MotiView
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ 
                    loop: true, 
                    type: 'timing', 
                    duration: 2000,
                    delay: 1300 
                }}
                style={styles.buttonInner}
              >
                <Text style={styles.loginButtonText}>LOGIN TO ARENA</Text>
                <ArrowRight color="#000000" size={22} strokeWidth={3} />
              </MotiView>
            </TouchableOpacity>
          </MotiView>
        </View>

        {/* Entrance: Footer */}
        <MotiView 
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 900, duration: 800 }}
          style={styles.footer}
        >
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.footerText}>
              Join the Pro league? <Text style={styles.linkText}>Create Account</Text>
            </Text>
          </TouchableOpacity>
        </MotiView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(7, 10, 20, 0.88)' },
  content: { flex: 1, justifyContent: 'center', padding: 25 },
  header: { marginBottom: 50, alignItems: 'center' },
  title: { fontSize: 52, fontWeight: '900', color: '#FFFFFF', letterSpacing: -1 },
  subtitle: { fontSize: 16, color: '#94A3B8', marginTop: 5, fontWeight: '500' },
  inputContainer: { gap: 25 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 20,
    height: 70,
    gap: 15,
    position: 'relative',
  },
  input: { flex: 1, color: '#FFFFFF', fontSize: 17, height: '100%', fontWeight: '500' },
  activeIndicator: {
    position: 'absolute',
    left: 0,
    width: 4,
    backgroundColor: '#00FF00',
    borderRadius: 2,
    shadowColor: '#00FF00',
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  loginButton: {
    height: 70,
    backgroundColor: '#00FF00',
    borderRadius: 12,
    marginTop: 15,
    shadowColor: '#00FF00',
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 8,
  },
  buttonInner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loginButtonText: { color: '#000000', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  footer: { marginTop: 40, alignItems: 'center' },
  footerText: { color: '#94A3B8', fontSize: 15 },
  linkText: { color: '#00FF00', fontWeight: 'bold' },
});