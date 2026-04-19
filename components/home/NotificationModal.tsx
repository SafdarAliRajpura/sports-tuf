import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { X, CheckCircle, Bell, Info, AlertTriangle, Calendar, Trophy, Zap } from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import apiClient from '../../src/api/apiClient';

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function NotificationModal({
  visible,
  onClose
}: NotificationModalProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient.get('/api/notifications');
      if (res.data && res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchNotifications();
    }
  }, [visible]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await apiClient.put(`/api/notifications/${id}/read`);
      if (res.data.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleNotificationPress = async (item: any) => {
    // 1. Mark as read if it's unread
    if (!item.isRead) {
      await markAsRead(item._id);
    }

    // 2. Navigate based on type
    const upType = item.type?.toUpperCase();
    if (upType === 'BOOKING') {
      router.push('/(tabs)/bookings');
    } else if (upType === 'TOURNAMENT') {
      router.push('/tournament/all');
    }

    // 3. Close the modal
    onClose();
  };

  const markAllAsRead = async () => {
    try {
      const res = await apiClient.put('/api/notifications/read-all');
      if (res.data.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getIcon = (type: string) => {
    const upType = type?.toUpperCase();
    switch (upType) {
      case 'BOOKING':
        return <Calendar color="#00FF00" size={20} />;
      case 'TOURNAMENT':
        return <Trophy color="#F59E0B" size={20} />;
      case 'ALERT':
        return <AlertTriangle color="#EF4444" size={20} />;
      case 'XP':
      case 'SYSTEM':
        return <Zap color="#A855F7" size={20} />;
      default:
        return <Info color="#3B82F6" size={20} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

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
                  {unreadCount > 0 && (
                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>{unreadCount} New</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X color="#94A3B8" size={24} />
                </TouchableOpacity>
              </View>

              {/* LIST */}
              <ScrollView
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00FF00" />
                }
              >
                {loading ? (
                  <View style={styles.centerBox}>
                    <ActivityIndicator color="#00FF00" />
                    <Text style={styles.loadingText}>Fetching updates...</Text>
                  </View>
                ) : notifications.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Bell color="#1E293B" size={60} />
                    <Text style={styles.emptyTitle}>All caught up!</Text>
                    <Text style={styles.emptyDesc}>No new notifications at the moment.</Text>
                  </View>
                ) : (
                  notifications.map((item) => (
                    <TouchableOpacity
                      key={item._id}
                      style={[
                        styles.notificationItem,
                        !item.isRead && styles.unreadItem
                      ]}
                      onPress={() => handleNotificationPress(item)}
                    >
                      <View style={styles.iconBox}>
                        {getIcon(item.type)}
                      </View>

                      <View style={styles.contentBox}>
                        <View style={styles.row}>
                          <Text
                            style={[
                              styles.title,
                              !item.isRead && styles.unreadTitle
                            ]}
                            numberOfLines={1}
                          >
                            {item.title || (item.type === 'BOOKING' ? 'Booking Confirmed' : 'Notification')}
                          </Text>
                          <Text style={styles.timeText}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Just now'}</Text>
                        </View>
                        <Text
                          style={styles.messageText}
                          numberOfLines={3}
                        >
                          {item.message}
                        </Text>
                      </View>

                      {!item.isRead && <View style={styles.dot} />}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>

              {notifications.length > 0 && unreadCount > 0 && (
                <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
                  <Text style={styles.markAllText}>Mark all as read</Text>
                </TouchableOpacity>
              )}
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
  },
  centerBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    color: '#94A3B8',
    marginTop: 10,
    fontSize: 13
  },
  emptyContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.6
  },
  emptyTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 15
  },
  emptyDesc: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8
  }
});
