import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, MapPin, CheckCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import api from '../../config/api';

export default function NextMatchCard({ userId }: { userId: string }) {
  const router = useRouter();
  const [nextMatch, setNextMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNextMatch = async () => {
      try {
        // Ideally fetch from an endpoint like /bookings/upcoming?limit=1
        // For now, we will fetch all and filter client side or assume backend support
        // This is a placeholder for the actual logic
        const res = await api.get(`/bookings/filter?userId=${userId}`);
        // Mocking logic: find the first upcoming booking
        // In real app: Backend should return sorted upcoming bookings
        if (res.data && res.data.length > 0) {
            // Simple logic: just take the first one for now
            setNextMatch(res.data[0]); 
        }
      } catch (error) {
        console.log('Error fetching next match', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchNextMatch();
  }, [userId]);

  if (!nextMatch || loading) return null;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>YOUR NEXT MATCH</Text>
        <View style={styles.liveBadge}>
            <Text style={styles.liveText}>UPCOMING</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push({
            pathname: "/venue/[id]",
            params: { id: nextMatch.turfName, title: nextMatch.turfName } // Simplified param passing
        })}
      >
        <View style={styles.matchInfo}>
            <Text style={styles.turfName}>{nextMatch.turfName}</Text>
            <View style={styles.row}>
                <Clock color="#00FF00" size={14} />
                <Text style={styles.timeText}>{nextMatch.date} • {nextMatch.timeSlot}</Text>
            </View>
            <View style={styles.row}>
                <MapPin color="#94A3B8" size={14} />
                <Text style={styles.locationText}>Kick Off Turf, Ahmedabad</Text>
            </View>
        </View>
        
        <View style={styles.statusSection}>
            <View style={styles.statusIcon}>
                <CheckCircle color="#000" size={20} />
            </View>
            <Text style={styles.statusText}>Confirmed</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 5
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  headerTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1
  },
  liveBadge: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 0, 0.2)'
  },
  liveText: {
    color: '#00FF00',
    fontSize: 10,
    fontWeight: '800'
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4
  },
  matchInfo: {
    flex: 1
  },
  turfName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4
  },
  timeText: {
    color: '#00FF00',
    fontSize: 13,
    fontWeight: '600'
  },
  locationText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500'
  },
  statusSection: {
    alignItems: 'center',
    gap: 6,
    paddingLeft: 15,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)'
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#00FF00',
    justifyContent: 'center',
    alignItems: 'center'
  },
  statusText: {
    color: '#00FF00',
    fontSize: 10,
    fontWeight: '700'
  }
});
