import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { X, CheckCircle, Bell, Info } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut
} from 'react-native-reanimated';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

const NOTIFICATIONS = [
  {
    id: '1',
    title: 'Booking Confirmed!',
    message: 'Your slot at Kick Off Turf is booked for Today, 6 PM.',
    type: 'success',
    time: '2 mins ago',
    read: false
  },
  {
    id: '2',
    title: 'Match Invitation',
    message: 'Alex invited you to join "Sunday League" match.',
    type: 'info',
    time: '1 hour ago',
    read: true
  },
  {
    id: '3',
    title: 'Tournament Alert 🏆',
    message: 'Registrations specific for Ahmedabad League are closing soon!',
    type: 'alert',
    time: '5 hours ago',
    read: true
  },
  {
    id: '4',
    title: 'Tip of the Day',
    message: 'Arrive 10 mins early to secure your warm-up spot.',
    type: 'info',
    time: '1 day ago',
    read: true
  }
];

export default function NotificationModal({
  visible,
  onClose
}: NotificationModalProps) {

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle color="#00FF00" size={20} />;
      case 'alert':
        return <Bell color="#F59E0B" size={20} />;
      case 'info':
      default:
        return <Info color="#60A5FA" size={20} />;
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        {visible && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(150)}
            style={styles.modalWrapper}
          >
            <Animated.View
              entering={ZoomIn.duration(250)}
              exiting={ZoomOut.duration(200)}
              style={styles.modalContent}
            >
              {/* HEADER */}
              <View style={styles.header}>
                <View style={styles.headerTitleRow}>
                  <Bell color="#FFFFFF" size={20} fill="#FFFFFF" />
                  <Text style={styles.headerTitle}>Notifications</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>1 New</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X color="#94A3B8" size={24} />
                </TouchableOpacity>
              </View>

              {/* LIST */}
              <ScrollView
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
              >
                {NOTIFICATIONS.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.notificationItem,
                      !item.read && styles.unreadItem
                    ]}
                  >
                    <View style={styles.iconBox}>
                      {getIcon(item.type)}
                    </View>

                    <View style={styles.contentBox}>
                      <View style={styles.row}>
                        <Text
                          style={[
                            styles.title,
                            !item.read && styles.unreadTitle
                          ]}
                        >
                          {item.title}
                        </Text>
                        <Text style={styles.timeText}>{item.time}</Text>
                      </View>
                      <Text
                        style={styles.messageText}
                        numberOfLines={2}
                      >
                        {item.message}
                      </Text>
                    </View>

                    {!item.read && <View style={styles.dot} />}
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity style={styles.markAllButton}>
                <Text style={styles.markAllText}>Mark all as read</Text>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
        )}
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100
  },
  modalWrapper: {
    width: '100%',
    alignItems: 'center'
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#0F172A',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    maxHeight: '60%',
    overflow: 'hidden'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8
  },
  countBadge: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6
  },
  countText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '800'
  },
  closeButton: {
    padding: 5
  },
  listContent: {
    padding: 10
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 16,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.02)',
    alignItems: 'flex-start'
  },
  unreadItem: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)'
  },
  iconBox: {
    marginRight: 15,
    marginTop: 2
  },
  contentBox: {
    flex: 1
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  title: {
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '600'
  },
  unreadTitle: {
    color: '#FFFFFF',
    fontWeight: '800'
  },
  timeText: {
    color: '#64748B',
    fontSize: 11
  },
  messageText: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
    marginLeft: 10,
    marginTop: 6
  },
  markAllButton: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center'
  },
  markAllText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600'
  }
});
