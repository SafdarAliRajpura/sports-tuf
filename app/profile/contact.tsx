import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import apiClient from '@/src/api/apiClient';

export default function ContactScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, msg: string | null }>({ type: null, msg: null });

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      setStatus({ type: 'error', msg: 'Please fill all fields.' });
      return;
    }

    setIsSubmitting(true);
    setStatus({ type: null, msg: null });

    try {
      await apiClient.post('/api/contacts', formData);
      setStatus({ type: 'success', msg: 'Message sent! Our team will reach out soon.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (e) {
      console.error("Contact submit error", e);
      setStatus({ type: 'error', msg: 'Failed to send message. Try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <StatusBar style="light" />
        <SafeAreaView style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Feather name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>CONTACT US</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.heroSection}>
            <Text style={styles.heroSubtitle}>GET IN TOUCH</Text>
            <Text style={styles.heroTitle}>WE'D LOVE TO{"\n"}<Text style={styles.accentText}>HEAR FROM YOU</Text></Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formHeader}>SEND A MESSAGE</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>YOUR NAME</Text>
              <View style={styles.inputWrapper}>
                <Feather name="user" size={18} color="#475569" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor="#475569"
                  value={formData.name}
                  onChangeText={(txt) => setFormData({...formData, name: txt})}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <View style={styles.inputWrapper}>
                <Feather name="mail" size={18} color="#475569" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  placeholder="john@example.com"
                  placeholderTextColor="#475569"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={formData.email}
                  onChangeText={(txt) => setFormData({...formData, email: txt})}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>SUBJECT</Text>
              <View style={styles.inputWrapper}>
                <Feather name="message-square" size={18} color="#475569" style={styles.inputIcon} />
                <TextInput 
                  style={styles.input}
                  placeholder="How can we help?"
                  placeholderTextColor="#475569"
                  value={formData.subject}
                  onChangeText={(txt) => setFormData({...formData, subject: txt})}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>MESSAGE</Text>
              <View style={[styles.inputWrapper, { alignItems: 'flex-start', paddingTop: 15 }]}>
                <Feather name="edit-3" size={18} color="#475569" style={styles.inputIcon} />
                <TextInput 
                  style={[styles.input, { height: 120, textAlignVertical: 'top' }]}
                  placeholder="Write your message here..."
                  placeholderTextColor="#475569"
                  multiline
                  numberOfLines={5}
                  value={formData.message}
                  onChangeText={(txt) => setFormData({...formData, message: txt})}
                />
              </View>
            </View>

            {status.msg && (
              <View style={[styles.statusBox, status.type === 'success' ? styles.successBox : styles.errorBox]}>
                <Feather name={status.type === 'success' ? 'check-circle' : 'alert-circle'} size={16} color={status.type === 'success' ? '#00FF00' : '#FF4B4B'} />
                <Text style={[styles.statusText, status.type === 'success' ? styles.successText : styles.errorText]}>{status.msg}</Text>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>SEND MESSAGE</Text>
                  <Feather name="arrow-right" size={18} color="#000" />
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.infoSection}>
             <ContactInfoTile icon="mail" title="Email Us" value="support@turfbooking.com" />
             <ContactInfoTile icon="phone" title="Call Us" value="+91 98765 43210" />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

function ContactInfoTile({ icon, title, value }: any) {
  return (
    <View style={styles.infoTile}>
      <View style={styles.infoIconBox}>
        <Feather name={icon} size={20} color="#00FF00" />
      </View>
      <View>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoValue}>{value}</Text>
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
  
  heroSection: { padding: 30, alignItems: 'center' },
  heroSubtitle: { color: '#00FF00', fontSize: 10, fontWeight: '900', letterSpacing: 4, marginBottom: 15 },
  heroTitle: { color: '#FFF', fontSize: 32, fontWeight: '900', textAlign: 'center', lineHeight: 40 },
  accentText: { color: '#00FF00' },

  formCard: { margin: 25, backgroundColor: '#131C31', borderRadius: 35, padding: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  formHeader: { color: '#FFF', fontSize: 18, fontWeight: '900', marginBottom: 25, letterSpacing: 1 },
  
  inputGroup: { marginBottom: 20 },
  label: { color: '#475569', fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 10, marginLeft: 5 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#090E1A', borderRadius: 18, paddingHorizontal: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, height: 55, color: '#FFF', fontSize: 14, fontWeight: '600' },
  
  submitBtn: { backgroundColor: '#00FF00', height: 65, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 10 },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  
  statusBox: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 15, marginBottom: 20, gap: 10 },
  successBox: { backgroundColor: 'rgba(0,255,0,0.05)', borderWidth: 1, borderColor: 'rgba(0,255,0,0.2)' },
  errorBox: { backgroundColor: 'rgba(255,75,75,0.05)', borderWidth: 1, borderColor: 'rgba(255,75,75,0.2)' },
  statusText: { fontSize: 13, fontWeight: '600', flex: 1 },
  successText: { color: '#00FF00' },
  errorText: { color: '#FF4B4B' },

  infoSection: { paddingHorizontal: 25, gap: 15 },
  infoTile: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: 20, borderRadius: 24, gap: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  infoIconBox: { width: 45, height: 45, borderRadius: 15, backgroundColor: 'rgba(0,255,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  infoTitle: { color: '#475569', fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 2 },
  infoValue: { color: '#FFF', fontSize: 14, fontWeight: '700' }
});
