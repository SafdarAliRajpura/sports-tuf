import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '@/src/api/apiClient';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';

export default function SecurityScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState({ old: false, new: false, confirm: false });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalConfig, setModalConfig] = useState<{ visible: boolean; type: 'success' | 'error'; message: string }>({
    visible: false,
    type: 'success',
    message: ''
  });

  const handleUpdatePassword = async () => {
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      setModalConfig({
        visible: true,
        type: 'error',
        message: 'All tactical clearance fields are required.'
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setModalConfig({
        visible: true,
        type: 'error',
        message: 'Credential mismatch: New passwords do not align.'
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      setModalConfig({
        visible: true,
        type: 'error',
        message: 'Weak Intel: Password must be at least 6 characters.'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await apiClient.put('/api/auth/change-password', {
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });
      setModalConfig({
        visible: true,
        type: 'success',
        message: 'Credentials updated successfully. Security clearance maintained.'
      });
    } catch (error: any) {
      console.error("Change password error", error.response?.data);
      setModalConfig({
        visible: true,
        type: 'error',
        message: error.response?.data?.message || 'Breach detected: Failed to update credentials.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>SECURITY</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={styles.heroSection}>
            <View style={styles.iconCircle}>
              <Feather name="shield" size={40} color="#00FF00" />
            </View>
            <Text style={styles.heroTitle}>ACCOUNT{"\n"}<Text style={styles.accentText}>SECURITY</Text></Text>
            <Text style={styles.heroSubtitle}>Ensure your arena credentials are locked down.</Text>
          </View>

          <View style={styles.formCard}>
            <PasswordField 
              label="CURRENT PASSWORD"
              value={formData.oldPassword}
              onChangeText={(txt) => setFormData({...formData, oldPassword: txt})}
              secureTextEntry={!showPass.old}
              toggleVisible={() => setShowPass({...showPass, old: !showPass.old})}
            />

            <PasswordField 
              label="NEW PASSWORD"
              value={formData.newPassword}
              onChangeText={(txt) => setFormData({...formData, newPassword: txt})}
              secureTextEntry={!showPass.new}
              toggleVisible={() => setShowPass({...showPass, new: !showPass.new})}
            />

            <PasswordField 
              label="CONFIRM NEW PASSWORD"
              value={formData.confirmPassword}
              onChangeText={(txt) => setFormData({...formData, confirmPassword: txt})}
              secureTextEntry={!showPass.confirm}
              toggleVisible={() => setShowPass({...showPass, confirm: !showPass.confirm})}
            />

            <TouchableOpacity 
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleUpdatePassword}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>UPDATE CREDENTIALS</Text>
                  <Feather name="lock" size={18} color="#000" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.securityTips}>
            <Text style={styles.tipTitle}>TACTICAL ADVICE</Text>
            <View style={styles.tipRow}>
              <Feather name="check" size={14} color="#00FF00" />
              <Text style={styles.tipText}>Use at least 8 characters with numbers and symbols.</Text>
            </View>
            <View style={styles.tipRow}>
              <Feather name="check" size={14} color="#00FF00" />
              <Text style={styles.tipText}>Avoid using names or common words.</Text>
            </View>
          </View>
        </ScrollView>

        {/* STATUS MODAL */}
        <Modal visible={modalConfig.visible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <Animated.View entering={ZoomIn.duration(400)} style={[styles.statusCard, modalConfig.type === 'error' && { borderColor: '#EF4444' }]}>
              <View style={[styles.glowCircle, modalConfig.type === 'error' && { shadowColor: '#EF4444' }]}>
                <Animated.View entering={ZoomIn.delay(300)} style={[styles.innerCircle, modalConfig.type === 'error' && { borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  {modalConfig.type === 'success' ? (
                    <Feather name="check" size={40} color="#00FF00" />
                  ) : (
                    <Feather name="alert-octagon" size={40} color="#EF4444" />
                  )}
                </Animated.View>
              </View>
              
              <Text style={styles.successTitle}>{modalConfig.type === 'success' ? 'CLEARANCE MAINTAINED' : 'BREACH DETECTED'}</Text>
              <Text style={styles.successSubtitle}>
                {modalConfig.message}
              </Text>

              <View style={styles.divider} />

              <TouchableOpacity 
                style={[styles.historyBtn, modalConfig.type === 'error' && { backgroundColor: '#EF4444' }]} 
                onPress={() => {
                  setModalConfig({ ...modalConfig, visible: false });
                  if (modalConfig.type === 'success') router.back();
                }}
              >
                <Text style={[styles.historyBtnText, modalConfig.type === 'error' && { color: '#FFF' }]}>
                  {modalConfig.type === 'success' ? 'BACK TO HQ' : 'RE-VERIFY'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}

function PasswordField({ label, value, onChangeText, secureTextEntry, toggleVisible }: any) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <Feather name="key" size={18} color="#475569" style={styles.inputIcon} />
        <TextInput 
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#475569"
          secureTextEntry={secureTextEntry}
          value={value}
          onChangeText={onChangeText}
        />
        <TouchableOpacity onPress={toggleVisible} style={styles.eyeBtn}>
          <Feather name={secureTextEntry ? "eye-off" : "eye"} size={18} color="#475569" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090E1A' },
  header: { backgroundColor: '#131C31' },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  
  heroSection: { padding: 40, alignItems: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(0,255,0,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: 'rgba(0,255,0,0.1)' },
  heroTitle: { color: '#FFF', fontSize: 32, fontWeight: '900', textAlign: 'center', lineHeight: 40, letterSpacing: -1 },
  accentText: { color: '#00FF00' },
  heroSubtitle: { color: '#475569', fontSize: 12, textAlign: 'center', marginTop: 15, fontWeight: '600' },

  formCard: { margin: 25, backgroundColor: '#131C31', borderRadius: 35, padding: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  inputGroup: { marginBottom: 20 },
  label: { color: '#475569', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10, marginLeft: 5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#090E1A', borderRadius: 18, paddingHorizontal: 15, height: 60, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, color: '#FFF', fontSize: 14, fontWeight: '700', letterSpacing: 2 },
  eyeBtn: { padding: 5 },
  
  submitBtn: { backgroundColor: '#00FF00', height: 65, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 10, shadowColor: '#00FF00', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#000', fontSize: 12, fontWeight: '900', letterSpacing: 1 },

  securityTips: { paddingHorizontal: 40, gap: 10 },
  tipTitle: { color: '#FFF', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 5 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  tipText: { color: '#475569', fontSize: 11, fontWeight: '600' },

  // STATUS MODAL STYLES
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  statusCard: { backgroundColor: '#131C31', borderRadius: 35, padding: 40, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,255,0,0.2)' },
  glowCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(0,255,0,0.05)', justifyContent: 'center', alignItems: 'center', marginBottom: 25, shadowColor: '#00FF00', shadowOpacity: 0.5, shadowRadius: 20 },
  innerCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(0,255,0,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#00FF00' },
  successTitle: { color: '#FFF', fontSize: 24, fontWeight: '900', letterSpacing: 1, marginBottom: 15, textAlign: 'center' },
  successSubtitle: { color: '#94A3B8', fontSize: 14, textAlign: 'center', lineHeight: 22, fontWeight: '500', marginBottom: 30 },
  divider: { width: '100%', height: 1, backgroundColor: 'rgba(255,255,255,0.05)', marginBottom: 30 },
  historyBtn: { backgroundColor: '#00FF00', width: '100%', height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#00FF00', shadowOpacity: 0.3, shadowRadius: 10 },
  historyBtnText: { color: '#000', fontSize: 12, fontWeight: '900', letterSpacing: 1 }
});
