import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FAQS = [
  {
    question: "How do I book a turf?",
    answer: "Booking a turf is simple! Navigate to the 'Venues' tab, select your preferred turf, choose a date and time slot, and proceed to payment. You'll receive a confirmation instantly."
  },
  {
    question: "What is the cancellation policy?",
    answer: "You can cancel your booking up to 24 hours before the scheduled time for a full refund. Cancellations made within 24 hours may be subject to a 50% cancellation fee."
  },
  {
    question: "Can I register for tournaments individually?",
    answer: "Most tournaments require a full team to register. However, some casual tournaments allow individual registration where we'll place you in a team. Check specific tournament details."
  },
  {
    question: "How do I become a partner?",
    answer: "Visit the 'Partner with Us' section in our web portal. Fill out the registration form with your business details, and our team will verify your venue within 48 hours."
  },
  {
    question: "Is my payment information secure?",
    answer: "Absolutely. We use industry-standard encryption and trusted payment gateways to ensure your financial data is always protected."
  }
];

export default function HelpCenterScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFaqs = FAQS.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>HELP CENTER</Text>
          <View style={{ width: 40 }} />
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.heroSection}>
          <Text style={styles.heroSubtitle}>ARENA INTELLIGENCE</Text>
          <Text style={styles.heroTitle}>HOW CAN WE{"\n"}<Text style={styles.accentText}>HELP YOU?</Text></Text>
          
          <View style={styles.searchContainer}>
            <Feather name="search" size={20} color="#00FF00" style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput}
              placeholder="Search field intel, policies..."
              placeholderTextColor="#475569"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <View style={styles.categoriesRow}>
          <HelpCategoryCard icon="book" title="Guides" color="#00FF00" />
          <HelpCategoryCard icon="credit-card" title="Payments" color="#00D1FF" />
          <HelpCategoryCard icon="message-circle" title="Rules" color="#A855F7" />
        </View>

        <View style={styles.faqSection}>
          <View style={styles.sectionHeader}>
            <Feather name="help-circle" size={24} color="#00FF00" />
            <Text style={styles.sectionTitle}>FAQ <Text style={styles.fadedText}>LEDGER</Text></Text>
          </View>

          {filteredFaqs.map((faq, index) => (
            <TouchableOpacity 
              key={index} 
              style={[styles.faqCard, openIndex === index && styles.faqCardOpen]}
              onPress={() => toggleFaq(index)}
              activeOpacity={0.7}
            >
              <View style={styles.faqQuestionRow}>
                <Text style={[styles.faqQuestion, openIndex === index && styles.faqQuestionActive]}>{faq.question}</Text>
                <Feather 
                  name={openIndex === index ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={openIndex === index ? "#00FF00" : "#475569"} 
                />
              </View>
              {openIndex === index && (
                <View style={styles.faqAnswerBox}>
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

          {filteredFaqs.length === 0 && (
            <View style={styles.emptyState}>
              <Feather name="search" size={40} color="#1E293B" />
              <Text style={styles.emptyStateText}>No intelligence found for "{searchQuery}"</Text>
            </View>
          )}
        </View>

        <View style={styles.footerContact}>
          <Text style={styles.footerTitle}>STILL IN THE <Text style={styles.accentText}>DARK?</Text></Text>
          <Text style={styles.footerSubtitle}>Our tactical support squad is ready to assist you 24/7.</Text>
          <TouchableOpacity 
            style={styles.contactBtn}
            onPress={() => router.push('/profile/contact')}
          >
            <Text style={styles.contactBtnText}>INITIALIZE SUPPORT LINK</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function HelpCategoryCard({ icon, title, color }: any) {
  return (
    <TouchableOpacity style={styles.catCard}>
      <View style={[styles.catIconBox, { backgroundColor: `${color}10` }]}>
        <Feather name={icon} size={24} color={color} />
      </View>
      <Text style={styles.catTitle}>{title}</Text>
    </TouchableOpacity>
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
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131C31', borderRadius: 20, paddingHorizontal: 20, marginTop: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  searchIcon: { marginRight: 15 },
  searchInput: { flex: 1, height: 60, color: '#FFF', fontSize: 14, fontWeight: '700' },
  
  categoriesRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 15, marginTop: 10 },
  catCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 24, padding: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  catIconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  catTitle: { color: '#FFF', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  
  faqSection: { padding: 25, marginTop: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 25 },
  sectionTitle: { color: '#FFF', fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  fadedText: { color: '#1E293B' },
  
  faqCard: { backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 24, padding: 25, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  faqCardOpen: { borderColor: 'rgba(0,255,0,0.2)', backgroundColor: 'rgba(0,255,0,0.02)' },
  faqQuestionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { color: '#94A3B8', fontSize: 14, fontWeight: '800', flex: 1, paddingRight: 20 },
  faqQuestionActive: { color: '#00FF00' },
  faqAnswerBox: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  faqAnswer: { color: '#64748B', fontSize: 13, lineHeight: 22, fontWeight: '600' },
  
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyStateText: { color: '#475569', fontSize: 12, fontWeight: '700', marginTop: 15 },
  
  footerContact: { margin: 25, padding: 30, backgroundColor: '#131C31', borderRadius: 35, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  footerTitle: { color: '#FFF', fontSize: 20, fontWeight: '900', marginBottom: 10 },
  footerSubtitle: { color: '#475569', fontSize: 12, textAlign: 'center', lineHeight: 20, marginBottom: 25, fontWeight: '600' },
  contactBtn: { backgroundColor: '#FFF', paddingHorizontal: 25, paddingVertical: 15, borderRadius: 15, shadowColor: '#FFF', shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  contactBtnText: { color: '#000', fontSize: 10, fontWeight: '900', letterSpacing: 1 }
});
