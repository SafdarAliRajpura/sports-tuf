import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ImageBackground, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useUserLocation } from '@/hooks/useUserLocation';
import { useFocusEffect, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import NextMatchCard from '../../components/home/NextMatchCard';
import WeatherWidget from '../../components/home/WeatherWidget';
import NotificationModal from '../../components/home/NotificationModal';
import SearchModal from '../../components/home/SearchModal';
import apiClient from '../../src/api/apiClient';
import { getAvatarUrl } from '../../src/utils/imageUtils';

const Bell = (props: any) => <Feather name="bell" {...props} />;
const Calendar = (props: any) => <Feather name="calendar" {...props} />;
const ChevronRight = (props: any) => <Feather name="chevron-right" {...props} />;
const Crown = (props: any) => <FontAwesome5 name="crown" {...props} />;
const Flame = (props: any) => <Feather name="zap" {...props} />; 
const MapPin = (props: any) => <Feather name="map-pin" {...props} />;
const Medal = (props: any) => <FontAwesome5 name="medal" {...props} />;
const Search = (props: any) => <Feather name="search" {...props} />;
const Star = (props: any) => <Feather name="star" {...props} />;
const Trophy = (props: any) => <FontAwesome5 name="trophy" {...props} />;
const Users = (props: any) => <Feather name="users" {...props} />;

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: '1', name: 'Cricket', icon: '🏏' },
  { id: '2', name: 'Football', icon: '⚽' },
  { id: '3', name: 'Pickleball', icon: '🎾' },
  { id: '4', name: 'Badminton', icon: '🏸' },
];

export default function ArenaHomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Venues');
  const [userName, setUserName] = useState('Champion');
  const [avatar, setAvatar] = useState('https://api.dicebear.com/7.x/avataaars/png?seed=Felix');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [venues, setVenues] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const [activeCommunitySubTab, setActiveCommunitySubTab] = useState('Leaderboard');
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [platformStats, setPlatformStats] = useState<any>({ users: 0 });
  const [selectedDiscussion, setSelectedDiscussion] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });
  const [newEventData, setNewEventData] = useState({ title: '5v5 Friendly Match', date: new Date().toISOString().split('T')[0], location: '', maxAttendees: '10' });
  const [showTitleDropdown, setShowTitleDropdown] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { location, loading: locationLoading } = useUserLocation();

  useFocusEffect(
    React.useCallback(() => {
      const refreshHomeData = async () => {
        try {
          // 1. Initial Load from Storage for Speed
          const userData = await AsyncStorage.getItem('userInfo');
          if (userData) {
            const user = JSON.parse(userData);
            setFirstName(user.first_name || user.name || 'Athlete');
            setAvatar(getAvatarUrl(user.avatar || user.user_profile));
            setCurrentUserId(user._id || user.id || null);
          }

          // 2. Parallel API Fetch for everything
          const [
            userRes, 
            venueRes, 
            tournamentRes, 
            leaderboardRes, 
            discRes, 
            eventRes, 
            statsRes, 
            notifRes
          ] = await Promise.all([
            apiClient.get('/api/users/profile').catch(() => ({ data: null })),
            apiClient.get('/api/venues').catch(() => ({ data: null })),
            apiClient.get('/api/tournaments').catch(() => ({ data: null })),
            apiClient.get('/api/leaderboard').catch(() => ({ data: null })),
            apiClient.get('/api/community/discussions').catch(() => ({ data: null })),
            apiClient.get('/api/community/events').catch(() => ({ data: null })),
            apiClient.get('/api/analytics/platform-stats').catch(() => ({ data: null })),
            apiClient.get('/api/notifications').catch(() => ({ data: null }))
          ]);

          // Update State Safely
          if (userRes?.data?.success) {
            const u = userRes.data.data;
            setFirstName(u.first_name);
            setAvatar(getAvatarUrl(u.user_profile));
            setCurrentUserId(u._id);
            AsyncStorage.setItem('userInfo', JSON.stringify(u));
          }

          if (venueRes?.data) {
            setVenues(venueRes.data.success ? venueRes.data.data : venueRes.data);
          }

          if (tournamentRes?.data) {
            setTournaments(tournamentRes.data.data || tournamentRes.data || []);
          }

          if (leaderboardRes?.data?.success) {
            setLeaderboard(leaderboardRes.data.data);
          }

          if (discRes?.data) {
            const discs = discRes.data;
            setDiscussions(discs);
            if (selectedDiscussion) {
               const updated = discs.find((d: any) => d._id === selectedDiscussion._id);
               if (updated) setSelectedDiscussion(updated);
            }
          }

          if (eventRes?.data) {
            const evts = eventRes.data;
            setEvents(evts);
            if (selectedEvent) {
               const updated = evts.find((e: any) => e._id === selectedEvent._id);
               if (updated) setSelectedEvent(updated);
            }
          }

          if (statsRes?.data?.success) setPlatformStats(statsRes.data.data);

          if (notifRes?.data?.success) {
            const unread = notifRes.data.data.some((n: any) => !n.isRead);
            setHasUnread(unread);
          }

        } catch (e: any) {
          console.error("Home Refresh Error:", e.message);
        }
      };

      refreshHomeData();
    }, [])
  );

  const handleLike = async (id: string) => {
    try {
      await apiClient.put(`/api/community/discussions/${id}/like`);
      // Refresh local data
      const [discRes] = await Promise.all([apiClient.get('/api/community/discussions')]);
      setDiscussions(discRes.data || []);
      if (selectedDiscussion && selectedDiscussion._id === id) {
          const updated = discRes.data.find((d: any) => d._id === id);
          if (updated) setSelectedDiscussion(updated);
      }
    } catch (e) {
      console.error("Like error", e);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || !selectedDiscussion) return;
    setIsSubmitting(true);
    try {
      await apiClient.post(`/api/community/discussions/${selectedDiscussion._id}/comment`, { text: commentText });
      setCommentText('');
      // Refresh data
      const [discRes] = await Promise.all([apiClient.get('/api/community/discussions')]);
      setDiscussions(discRes.data || []);
      const updated = discRes.data.find((d: any) => d._id === selectedDiscussion._id);
      if (updated) setSelectedDiscussion(updated);
    } catch (e) {
      console.error("Comment error", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content) return;
    setIsSubmitting(true);
    try {
      await apiClient.post('/api/community/discussions', newPost);
      setNewPost({ title: '', content: '', category: 'General' });
      setShowCreatePost(false);
      // Refresh
      const [discRes] = await Promise.all([apiClient.get('/api/community/discussions')]);
      setDiscussions(discRes.data || []);
    } catch (e) {
      console.error("Post creation error", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinEvent = async (id: string) => {
    try {
      await apiClient.put(`/api/community/events/${id}/join`);
      const [eventRes] = await Promise.all([apiClient.get('/api/community/events')]);
      setEvents(eventRes.data || []);
      if (selectedEvent && selectedEvent._id === id) {
          const updated = eventRes.data.find((e: any) => e._id === id);
          if (updated) setSelectedEvent(updated);
      }
    } catch (e) {
      console.error("Join event error", e);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEventData.title || !newEventData.date || !newEventData.location) return;
    setIsSubmitting(true);
    try {
      await apiClient.post('/api/community/events', {
        ...newEventData,
        maxAttendees: parseInt(newEventData.maxAttendees)
      });
      setNewEventData({ title: '', date: '', location: '', maxAttendees: '10' });
      setShowCreateEvent(false);
      // Refresh
      const [eventRes] = await Promise.all([apiClient.get('/api/community/events')]);
      setEvents(eventRes.data || []);
    } catch (e) {
      console.error("Event creation error", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* 1. TOP HEADER BLOCK */}
      <View style={styles.topHeader}>
        <View style={styles.locationSection}>
          <Text style={styles.greetingText}>HELLO, {userName.toUpperCase()}!</Text>
          <View style={styles.locationRow}>
            <MapPin color="#00FF00" size={14} />
            <Text style={styles.areaText}>
              {locationLoading ? 'Locating...' : (location?.address?.formatted || 'Location Unavailable')}
            </Text>
            <ChevronRight color="#00FF00" size={14} />
          </View>
        </View>

        <View style={styles.headerIcons}>
          <WeatherWidget />
          <TouchableOpacity style={styles.iconCircle} onPress={() => {
            setShowNotifications(true);
            setHasUnread(false); // Optimistically clear dot when opening
          }}>
            <Bell color="#FFFFFF" size={20} />
            {hasUnread && <View style={styles.badge} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.profileCircle} onPress={() => router.push('/(tabs)/profile')}>
            <Image source={{ uri: avatar }} style={styles.avatarImage} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. PERSISTENT TAB SELECTOR (NEW POSITION & STYLE) */}
      <View style={styles.persistentTabContainer}>
        {['Venues', 'Tournaments', 'Community'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            onPress={() => setActiveTab(tab)} 
            style={[styles.persistentTabItem, activeTab === tab && styles.activePersistentTabItem]}
          >
            <Text style={[styles.persistentTabText, activeTab === tab && styles.activePersistentTabText]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>



        {activeTab === 'Tournaments' ? (
          <View style={{ marginTop: 10 }}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Elite Tournaments</Text>
              <TouchableOpacity onPress={() => router.push('/tournament/all')}>
                <Text style={styles.seeAllText}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>
            <View style={{ paddingBottom: 100 }}>
               {tournaments.length > 0 ? tournaments.map(t => (
                  <TournamentListItem key={t._id} tournament={t} />
               )) : (
                  <Text style={{ color: '#94A3B8', fontSize: 13, marginTop: 20, textAlign: 'center' }}>No tournaments found.</Text>
               )}
            </View>
          </View>
        ) : activeTab === 'Community' ? (
          <View style={{ marginTop: 10 }}>
            {/* Community Sub-Tabs */}
            <View style={styles.communitySubTabRow}>
              {['Leaderboard', 'Discussions', 'Events'].map(sub => (
                <TouchableOpacity 
                  key={sub} 
                  onPress={() => setActiveCommunitySubTab(sub)}
                  style={[styles.communitySubTab, activeCommunitySubTab === sub && styles.activeCommunitySubTab]}
                >
                  <Text style={[styles.communitySubTabText, activeCommunitySubTab === sub && styles.activeCommunitySubTabText]}>
                    {sub}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {activeCommunitySubTab === 'Leaderboard' ? (
              <>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Crown color="#FFD700" size={20} fill="#FFD700" />
                    <Text style={styles.sectionTitle}>Global Leaderboard</Text>
                  </View>
                </View>
                <View style={{ paddingHorizontal: 20, paddingBottom: 120 }}>
                  {leaderboard.length > 0 ? leaderboard.slice(0, 10).map((player, idx) => (
                    <PlayerListItem 
                      key={player._id || idx}
                      rank={idx + 1} 
                      name={player.fullName || `${player.first_name} ${player.last_name}`} 
                      points={player.xp || player.points || 0} 
                      avatar={getAvatarUrl(player.avatar || player.user_profile)} 
                    />
                  )) : (
                    <Text style={{ color: '#94A3B8', fontSize: 13, textAlign: 'center' }}>Loading rankings...</Text>
                  )}
                </View>
              </>
            ) : activeCommunitySubTab === 'Discussions' ? (
              <View style={{ paddingHorizontal: 20, paddingBottom: 120 }}>
                 <View style={styles.statsStrip}>
                    <Text style={styles.statsStripText}>{platformStats.users?.toLocaleString() || '1,000'}+ Athletes Online</Text>
                    <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreatePost(true)}>
                      <Feather name="plus" color="#090E1A" size={16} />
                      <Text style={styles.createBtnText}>POST</Text>
                    </TouchableOpacity>
                 </View>
                 {discussions.length > 0 ? discussions.map((post, idx) => (
                   <DiscussionListItem 
                     key={post._id || idx} 
                     post={post} 
                     userId={currentUserId} 
                     onPress={() => setSelectedDiscussion(post)}
                     onLike={() => handleLike(post._id)}
                   />
                 )) : (
                   <View style={styles.emptyHub}>
                      <Feather name="message-circle" size={40} color="#1E293B" />
                      <Text style={styles.emptyHubText}>No active threads yet. Start the conversation!</Text>
                   </View>
                 )}
              </View>
            ) : (
              <View style={{ paddingHorizontal: 20, paddingBottom: 120 }}>
                 <View style={styles.statsStrip}>
                    <Text style={styles.statsStripText}>{events.length} Live Meetups</Text>
                    <TouchableOpacity style={[styles.createBtn, { backgroundColor: '#00D1FF' }]} onPress={() => setShowCreateEvent(true)}>
                      <Feather name="calendar" color="#090E1A" size={16} />
                      <Text style={styles.createBtnText}>HOST</Text>
                    </TouchableOpacity>
                 </View>
                 {events.length > 0 ? events.map((event, idx) => (
                   <EventListItem 
                    key={event._id || idx} 
                    event={event} 
                    userId={currentUserId} 
                    onPress={() => setSelectedEvent(event)}
                    onJoin={() => handleJoinEvent(event._id)}
                   />
                 )) : (
                   <View style={styles.emptyHub}>
                      <Feather name="calendar" size={40} color="#1E293B" />
                      <Text style={styles.emptyHubText}>No upcoming meetups. Why not organize one?</Text>
                   </View>
                 )}
              </View>
            )}
          </View>
        ) : (
          <>
            {/* 4. SEARCH BLOCK */}
            <TouchableOpacity style={styles.searchContainer} onPress={() => setShowSearch(true)}>
              <Search color="#94A3B8" size={20} />
              <Text style={styles.searchPlaceholder}>Search for venues, sports...</Text>
            </TouchableOpacity>

            {/* 5. SPORT GRID BLOCK */}
            <View style={styles.gridContainer}>
              {CATEGORIES.map((item) => (
                <View key={item.id} style={styles.gridItemWrapper}>
                  <TouchableOpacity style={styles.gridItem} onPress={() => {
                      // Optionally filter venues by sport
                      setShowSearch(true);
                  }}>
                    <Text style={styles.gridIcon}>{item.icon}</Text>
                    <Text style={styles.gridText}>{item.name}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* 5.5 PREMIUM SECTION: SEASON LEADERBOARD (MINI) */}
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Crown color="#FFD700" size={20} fill="#FFD700" />
                <Text style={styles.sectionTitle}>Top Performers</Text>
              </View>
              <TouchableOpacity onPress={() => setActiveTab('Community')}><Text style={styles.seeAllText}>VIEW ALL</Text></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {leaderboard.length > 0 ? leaderboard.map((player, idx) => (
                <PlayerCard 
                  key={player._id || idx}
                  rank={idx + 1} 
                  name={player.fullName || `${player.first_name} ${player.last_name}`} 
                  points={player.xp || player.points || 0} 
                  avatar={getAvatarUrl(player.avatar || player.user_profile)} 
                  tag={idx === 0 ? 'MVP' : (idx < 3 ? 'PRO' : null)}
                />
              )) : (
                <Text style={{ color: '#94A3B8', fontSize: 13, marginLeft: 20 }}>Updating rankings...</Text>
              )}
            </ScrollView>
    
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Flame color="#FF4500" size={20} fill="#FF4500" />
                <Text style={styles.sectionTitle}>Trending Venues</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {venues.length > 0 ? venues.map((venue) => (
                  <TrendingCard key={venue._id} id={venue._id} title={venue.name} price={'₹' + venue.price} image={venue.images && venue.images.length > 0 ? venue.images[0] : venue.image} rating="4.9" />
              )) : (
                  <Text style={{ color: '#94A3B8', fontSize: 13, marginTop: 10 }}>No venues available.</Text>
              )}
            </ScrollView>
    
            {/* 7. OFFER BLOCK */}
            <View style={styles.offerBanner}>
              <View style={styles.offerContent}>
                <Text style={styles.offerTitle}>EARN XP POINTS</Text>
                <Text style={styles.offerSubtitle}>Get rewards on every booking</Text>
              </View>
              <Trophy color="#00FF00" size={32} />
            </View>
    
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Venues around you</Text>
              <TouchableOpacity onPress={() => router.push('/explore')}><Text style={styles.seeAllText}>VIEW ALL</Text></TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {venues.length > 0 ? venues.map((venue) => (
                  <VenueCard key={`around-${venue._id}`} id={venue._id} title={venue.name} image={venue.images && venue.images.length > 0 ? venue.images[0] : venue.image} dist={venue.location} rating="4.8" price={'₹' + venue.price} />
              )) : (
                  <Text style={{ color: '#94A3B8', fontSize: 13, marginTop: 10 }}>No venues available nearby.</Text>
              )}
            </ScrollView>
    
            {/* 9. TOURNAMENT BLOCK */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Elite Tournaments</Text>
              <TouchableOpacity onPress={() => setActiveTab('Tournaments')}>
                <Text style={styles.seeAllText}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, paddingRight: 20, marginBottom: 120 }}>
            {tournaments.length > 0 ? tournaments.map(t => (
                <TournamentCard key={t._id} tournament={t} />
             )) : (
                 <Text style={{ color: '#94A3B8', fontSize: 13, marginTop: 10, marginBottom: 40, marginLeft: 20 }}>No elite tournaments active.</Text>
             )}
            </ScrollView>
          </>
        )}
      </ScrollView>

      <NotificationModal visible={showNotifications} onClose={() => setShowNotifications(false)} />
      <SearchModal visible={showSearch} onClose={() => setShowSearch(false)} />

      {/* --- DISCUSSION DETAIL MODAL --- */}
      <Modal
        visible={!!selectedDiscussion}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedDiscussion(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalOverlaySolid} onPress={() => setSelectedDiscussion(null)} />
          <View style={[styles.modalContainer, { height: '90%' }]}>
            <View style={styles.modalHeader}>
              <View style={styles.authorRow}>
                  <Image source={{ uri: getAvatarUrl(selectedDiscussion?.author?.user_profile) }} style={styles.smallAvatar} />
                  <View>
                      <Text style={styles.authorName}>{selectedDiscussion?.author?.first_name || 'Athlete'}</Text>
                      <Text style={styles.postMeta}>{selectedDiscussion?.category}</Text>
                  </View>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedDiscussion(null)}>
                <Feather name="x" color="#FFF" size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, padding: 20 }}>
               <Text style={styles.detailTitle}>{selectedDiscussion?.title}</Text>
               <Text style={styles.detailContent}>{selectedDiscussion?.content}</Text>
               
               <View style={styles.detailActionRow}>
                  <TouchableOpacity style={styles.detailAction} onPress={() => handleLike(selectedDiscussion?._id)}>
                    <Feather 
                      name="heart" 
                      size={20} 
                      color={selectedDiscussion?.likes?.includes(currentUserId) ? "#FF3B30" : "#94A3B8"} 
                      fill={selectedDiscussion?.likes?.includes(currentUserId) ? "#FF3B30" : "transparent"} 
                    />
                    <Text style={[styles.detailActionText, selectedDiscussion?.likes?.includes(currentUserId) && { color: '#FF3B30' }]}>
                      {selectedDiscussion?.likes?.length || 0} Likes
                    </Text>
                  </TouchableOpacity>
                  <View style={styles.detailAction}>
                    <Feather name="message-square" size={20} color="#00FF00" />
                    <Text style={[styles.detailActionText, { color: '#00FF00' }]}>{selectedDiscussion?.comments?.length || 0} Comments</Text>
                  </View>
               </View>

               <View style={styles.commentSection}>
                  <Text style={styles.commentHeader}>COMMUNITY INSIGHTS</Text>
                  {selectedDiscussion?.comments?.length > 0 ? selectedDiscussion.comments.map((comment: any, idx: number) => (
                    <View key={idx} style={styles.commentItem}>
                       <Image source={{ uri: getAvatarUrl(comment.user?.user_profile) }} style={styles.commentAvatar} />
                       <View style={styles.commentContentBox}>
                          <View style={styles.commentUserRow}>
                             <Text style={styles.commentUserName}>{comment.user?.first_name} {comment.user?.last_name || ''}</Text>
                             <Text style={styles.commentDate}>{new Date(comment.createdAt).toLocaleDateString()}</Text>
                          </View>
                          <Text style={styles.commentText}>{comment.text}</Text>
                       </View>
                    </View>
                  )) : (
                    <Text style={styles.noCommentsText}>No comments yet. Be the first to reply!</Text>
                  )}
               </View>
            </ScrollView>

            <View style={styles.commentInputContainer}>
                <Image source={{ uri: avatar }} style={styles.commentAvatar} />
                <View style={styles.inputWrapper}>
                  <TextInput 
                    style={styles.commentInput}
                    placeholder="Share your insights..."
                    placeholderTextColor="#64748B"
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                  />
                  <TouchableOpacity 
                    style={[styles.sendBtn, !commentText.trim() && { opacity: 0.5 }]} 
                    onPress={handleComment}
                    disabled={!commentText.trim() || isSubmitting}
                  >
                    <Feather name="send" size={16} color="#090E1A" />
                  </TouchableOpacity>
                </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- EVENT DETAIL MODAL --- */}
      <Modal
        visible={!!selectedEvent}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedEvent(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalOverlaySolid} onPress={() => setSelectedEvent(null)} />
          <View style={[styles.modalContainer, { height: '85%' }]}>
            <View style={[styles.modalHeader, { borderBottomColor: '#00D1FF' }]}>
               <View>
                 <Text style={styles.eventStatus}>ARENA MEETUP</Text>
                 <Text style={styles.modalTitle}>{selectedEvent?.title}</Text>
               </View>
               <TouchableOpacity style={styles.closeButton} onPress={() => setSelectedEvent(null)}>
                <Feather name="x" color="#FFF" size={20} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, padding: 25 }}>
               <View style={styles.eventInfoStrip}>
                  <View style={styles.infoBox}>
                     <Feather name="calendar" color="#00D1FF" size={20} />
                     <View>
                        <Text style={styles.infoLabel}>DATE</Text>
                        <Text style={styles.infoValue}>{new Date(selectedEvent?.date).toLocaleDateString('default', { day: 'numeric', month: 'long' })}</Text>
                     </View>
                  </View>
                  <View style={styles.infoBox}>
                     <Feather name="map-pin" color="#00D1FF" size={20} />
                     <View>
                        <Text style={styles.infoLabel}>LOCATION</Text>
                        <Text style={styles.infoValue}>{selectedEvent?.location}</Text>
                     </View>
                  </View>
               </View>

               <View style={styles.organizerSection}>
                  <Text style={styles.commentHeader}>ORGANIZER</Text>
                  <View style={styles.authorRow}>
                      <Image source={{ uri: 'https://api.dicebear.com/7.x/avataaars/png?seed=Host' }} style={styles.smallAvatar} />
                      <View>
                          <Text style={styles.authorName}>{selectedEvent?.organizer?.first_name || 'Arena Lead'}</Text>
                          <Text style={styles.postMeta}>Community Champion</Text>
                      </View>
                  </View>
               </View>

               <View style={styles.attendeesSection}>
                  <View style={styles.attendeeHeaderRow}>
                     <Text style={styles.commentHeader}>ATTENDEES ({selectedEvent?.attendees?.length || 0})</Text>
                     <Text style={styles.capacityText}>MAX {selectedEvent?.maxAttendees || 10}</Text>
                  </View>
                  <View style={styles.avatarGrid}>
                     {selectedEvent?.attendees?.map((at: any, idx: number) => (
                       <View key={idx} style={styles.attendeeIcon}>
                          <Image source={{ uri: getAvatarUrl(at.user_profile) }} style={styles.attendeeImg} />
                          <Text style={styles.attendeeName} numberOfLines={1}>{at.first_name || 'Athlete'}</Text>
                       </View>
                     ))}
                     {selectedEvent?.attendees?.length === 0 && (
                       <Text style={styles.noCommentsText}>No athletes joined yet. Lead the pack!</Text>
                     )}
                  </View>
               </View>
            </ScrollView>

            <View style={styles.modalFooter}>
               <TouchableOpacity 
                style={[styles.joinEventBtn, selectedEvent?.attendees?.some((a: any) => a._id === currentUserId) && styles.leaveEventBtn]} 
                onPress={() => handleJoinEvent(selectedEvent._id)}
               >
                  <Text style={styles.joinEventBtnText}>
                    {selectedEvent?.attendees?.some((a: any) => a._id === currentUserId) ? 'LEAVE MEETUP' : 'RESERVE MY SPOT'}
                  </Text>
                  <Feather name={selectedEvent?.attendees?.some((a: any) => a._id === currentUserId) ? "user-minus" : "user-plus"} size={18} color="#090E1A" />
               </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- HOST EVENT MODAL --- */}
      <Modal
        visible={showCreateEvent}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCreateEvent(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalOverlaySolid} onPress={() => setShowCreateEvent(false)} />
          <View style={[styles.modalContainer, { height: 'auto', maxHeight: '85%' }]}>
            <View style={[styles.modalHeader, { borderBottomColor: '#00D1FF' }]}>
              <Text style={styles.modalTitle}>Host Global Meetup</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowCreateEvent(false)}>
                <Feather name="x" color="#FFF" size={20} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={{ padding: 25 }} scrollEnabled={!showTitleDropdown && !showLocationDropdown}>
               <Text style={styles.inputLabel}>MEETUP TYPE / TITLE</Text>
               <View style={{ zIndex: 10, marginBottom: 25 }}>
                  <TouchableOpacity 
                    style={styles.dropdownTrigger} 
                    onPress={() => setShowTitleDropdown(!showTitleDropdown)}
                  >
                    <Text style={styles.dropdownValue}>{newEventData.title}</Text>
                    <Feather name={showTitleDropdown ? "chevron-up" : "chevron-down"} size={16} color="#00D1FF" />
                  </TouchableOpacity>
                  {showTitleDropdown && (
                    <View style={styles.dropdownMenu}>
                      {['5v5 Friendly Match', 'Turf Trials & Scouting', 'Pro Strategy Bootcamp', 'Under-The-Lights Challenge', 'Skill Drills Session', 'Weekend Community League'].map(opt => (
                        <TouchableOpacity 
                          key={opt} 
                          style={styles.dropdownOption} 
                          onPress={() => {
                            setNewEventData({...newEventData, title: opt});
                            setShowTitleDropdown(false);
                          }}
                        >
                          <Text style={[styles.dropdownOptionText, newEventData.title === opt && { color: '#00D1FF' }]}>{opt}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
               </View>

               <View style={{ flexDirection: 'row', gap: 15, zIndex: 5 }}>
                  <View style={{ flex: 1 }}>
                     <Text style={styles.inputLabel}>SELECT DATE</Text>
                     <TouchableOpacity 
                        style={styles.formInput} 
                        onPress={() => setShowDatePicker(true)}
                      >
                        <Text style={{ color: '#FFF' }}>{newEventData.date || 'Choose Date'}</Text>
                        <Feather name="calendar" size={14} color="#00D1FF" style={{ position: 'absolute', right: 15, top: 20 }} />
                     </TouchableOpacity>
                     
                     {showDatePicker && (
                        <DateTimePicker
                          value={new Date(newEventData.date)}
                          mode="date"
                          display="default"
                          minimumDate={new Date()}
                          onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) {
                              setNewEventData({...newEventData, date: selectedDate.toISOString().split('T')[0]});
                            }
                          }}
                        />
                     )}
                  </View>
                  <View style={{ flex: 1 }}>
                     <Text style={styles.inputLabel}>MAX CAPACITY</Text>
                     <TextInput 
                       style={styles.formInput}
                       placeholder="10"
                       placeholderTextColor="#475569"
                       keyboardType="numeric"
                       value={newEventData.maxAttendees}
                       onChangeText={(txt) => setNewEventData({...newEventData, maxAttendees: txt})}
                     />
                  </View>
               </View>

               <Text style={styles.inputLabel}>SELECT ARENA (LOCATION)</Text>
               <View style={{ zIndex: 1, marginBottom: 25 }}>
                  <TouchableOpacity 
                    style={styles.dropdownTrigger} 
                    onPress={() => setShowLocationDropdown(!showLocationDropdown)}
                  >
                    <Text style={styles.dropdownValue}>{newEventData.location || 'Select a Turf...'}</Text>
                    <Feather name={showLocationDropdown ? "chevron-up" : "chevron-down"} size={16} color="#00D1FF" />
                  </TouchableOpacity>
                  {showLocationDropdown && (
                    <View style={[styles.dropdownMenu, { maxHeight: 200 }]}>
                      <ScrollView nestedScrollEnabled>
                        {venues.map((v: any) => (
                          <TouchableOpacity 
                            key={v._id} 
                            style={styles.dropdownOption} 
                            onPress={() => {
                              setNewEventData({...newEventData, location: v.name});
                              setShowLocationDropdown(false);
                            }}
                          >
                            <Text style={[styles.dropdownOptionText, newEventData.location === v.name && { color: '#00D1FF' }]}>{v.name} - {v.location}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
               </View>

               <TouchableOpacity 
                style={[styles.submitPostBtn, { backgroundColor: '#00D1FF', shadowColor: '#00D1FF' }, (!newEventData.title || !newEventData.date) && { opacity: 0.5 }]} 
                onPress={handleCreateEvent}
                disabled={!newEventData.title || !newEventData.date || isSubmitting}
               >
                 <Text style={styles.submitPostBtnText}>{isSubmitting ? 'ORGANIZING...' : 'HOST EVENT NOW'}</Text>
                 <Feather name="calendar" size={16} color="#090E1A" />
               </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* --- CREATE POST MODAL --- */}
      <Modal
        visible={showCreatePost}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowCreatePost(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalOverlaySolid} onPress={() => setShowCreatePost(false)} />
          <View style={[styles.modalContainer, { height: 'auto', maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Discussion</Text>
              <TouchableOpacity style={styles.closeButton} onPress={() => setShowCreatePost(false)}>
                <Feather name="x" color="#FFF" size={20} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={{ padding: 25 }}>
               <Text style={styles.inputLabel}>TITLE</Text>
               <TextInput 
                 style={styles.formInput}
                 placeholder="What's on your mind?"
                 placeholderTextColor="#475569"
                 value={newPost.title}
                 onChangeText={(txt) => setNewPost({...newPost, title: txt})}
               />

               <Text style={styles.inputLabel}>CATEGORY</Text>
               <View style={styles.categoryPicker}>
                 {['General', 'Strategy', 'Team Up', 'Reviews'].map(cat => (
                   <TouchableOpacity 
                    key={cat} 
                    onPress={() => setNewPost({...newPost, category: cat})}
                    style={[styles.catOption, newPost.category === cat && styles.catOptionActive]}
                   >
                     <Text style={[styles.catOptionText, newPost.category === cat && styles.catOptionTextActive]}>{cat}</Text>
                   </TouchableOpacity>
                 ))}
               </View>

               <Text style={styles.inputLabel}>CONTENT</Text>
               <TextInput 
                 style={[styles.formInput, { height: 120, textAlignVertical: 'top' }]}
                 placeholder="Describe your discussion in detail..."
                 placeholderTextColor="#475569"
                 value={newPost.content}
                 onChangeText={(txt) => setNewPost({...newPost, content: txt})}
                 multiline
               />

               <TouchableOpacity 
                style={[styles.submitPostBtn, (!newPost.title || !newPost.content) && { opacity: 0.5 }]} 
                onPress={handleCreatePost}
                disabled={!newPost.title || !newPost.content || isSubmitting}
               >
                 <Text style={styles.submitPostBtnText}>{isSubmitting ? 'POSTING...' : 'LANCEMENT POST'}</Text>
                 <Feather name="send" size={16} color="#090E1A" />
               </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// SHARED COMPONENTS
function TournamentCard({ tournament }: any) {
    const router = useRouter();
    const totalSlots = tournament.totalSlots || tournament.maxTeams || 16;
    const registered = tournament.registeredTeams || 0;
    const slotsLeft = Math.max(0, totalSlots - registered);
    
    let statusLabel = 'REGISTRATION OPEN';
    let statusColor = '#00FF00';
    
    if (tournament.status === 'Completed') {
        statusLabel = 'COMPLETED';
        statusColor = '#64748B';
    } else if (tournament.status === 'Ongoing') {
        statusLabel = 'IN PROGRESS';
        statusColor = '#F59E0B';
    } else if (slotsLeft === 0) {
        statusLabel = 'HOUSEFULL';
        statusColor = '#EF4444';
    } else if (slotsLeft < 5) {
        statusLabel = 'FILLING FAST';
        statusColor = '#F59E0B';
    }

    return (
        <TouchableOpacity style={styles.tournamentCard} onPress={() => router.push(`/tournament/${tournament._id}`)}>
            <ImageBackground source={{ uri: tournament.image || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800' }} style={styles.tournamentBg} imageStyle={{ borderRadius: 20 }}>
                <View style={styles.tournamentOverlay}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={[styles.regBadge, { backgroundColor: statusColor }]}>
                            <Text style={[styles.regBadgeText, (statusLabel !== 'REGISTRATION OPEN') && { color: '#FFF' }]}>
                                {statusLabel}
                            </Text>
                        </View>
                        {tournament.prizePool && (
                            <View style={{ backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#FFD700' }}>
                                <Text style={{ color: '#FFD700', fontSize: 10, fontWeight: '900' }}>₹{tournament.prizePool} PRIZE</Text>
                            </View>
                        )}
                    </View>
                    
                    <Text style={styles.tournamentTitle}>{tournament.name || tournament.title}</Text>
                    <View style={styles.tournamentDetailRow}>
                        <Calendar color="#00FF00" size={14} />
                        <Text style={styles.tournamentDetailText}>{tournament.date || new Date(tournament.startDate).toLocaleDateString()}</Text>
                        <Users color="#00FF00" size={14} style={{ marginLeft: 15 }} />
                        <Text style={styles.tournamentDetailText}>{registered} / {totalSlots} Teams</Text>
                    </View>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );
}

function TournamentListItem({ tournament }: any) {
    const router = useRouter();
    return (
        <TouchableOpacity style={styles.tournamentListItem} onPress={() => router.push(`/tournament/${tournament._id}`)}>
            <Image source={{ uri: tournament.image || 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800' }} style={styles.listImage} />
            <View style={styles.listInfo}>
                <Text style={styles.listTitle} numberOfLines={1}>{tournament.name || tournament.title}</Text>
                <Text style={styles.listSub}>{tournament.location || 'Stadium Arena'}</Text>
                <View style={styles.listMeta}>
                    <Calendar color="#00FF00" size={12} />
                    <Text style={styles.listMetaText}>{new Date(tournament.startDate).toLocaleDateString()}</Text>
                </View>
            </View>
            <View style={styles.listAction}>
                <ChevronRight color="#00FF00" size={20} />
            </View>
        </TouchableOpacity>
    );
}

function PlayerListItem({ rank, name, points, avatar }: any) {
    return (
        <View style={styles.playerListItem}>
            <Text style={styles.rankTextList}>{rank}</Text>
            <Image source={{ uri: avatar }} style={styles.playerItemAvatar} />
            <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.playerNameList}>{name}</Text>
                <Text style={styles.playerPointsList}>{points} XP</Text>
            </View>
            <Medal color={rank === 1 ? "#FFD700" : (rank === 2 ? "#C0C0C0" : "#CD7F32")} size={20} />
        </View>
    );
}

function DiscussionListItem({ post, userId, onPress, onLike }: any) {
    const isLiked = userId && post.likes?.includes(userId);
    return (
        <TouchableOpacity style={styles.communityCard} onPress={onPress}>
            <View style={styles.cardHeader}>
                <View style={styles.authorRow}>
                    <Image source={{ uri: getAvatarUrl(post.author?.user_profile) }} style={styles.smallAvatar} />
                    <View>
                        <Text style={styles.authorName}>{post.author?.first_name || 'Athlete'}</Text>
                        <Text style={styles.postMeta}>{post.category} • {new Date(post.createdAt).toLocaleDateString()}</Text>
                    </View>
                </View>
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{post.category?.toUpperCase()}</Text>
                </View>
            </View>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent} numberOfLines={2}>{post.content}</Text>
            <View style={styles.cardFooter}>
                <TouchableOpacity style={styles.footerAction} onPress={(e) => { e.stopPropagation(); onLike(); }}>
                    <Feather name="heart" size={16} color={isLiked ? "#FF3B30" : "#94A3B8"} fill={isLiked ? "#FF3B30" : "transparent"} />
                    <Text style={[styles.footerActionText, isLiked && { color: '#FF3B30' }]}>{post.likes?.length || 0}</Text>
                </TouchableOpacity>
                <View style={styles.footerAction}>
                    <Feather name="message-square" size={16} color="#94A3B8" />
                    <Text style={styles.footerActionText}>{post.comments?.length || 0}</Text>
                </View>
                <TouchableOpacity style={{ marginLeft: 'auto' }}>
                    <Feather name="share-2" size={16} color="#94A3B8" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

function EventListItem({ event, userId, onJoin, onPress }: any) {
    const isJoined = userId && event.attendees?.some((a: any) => (a._id || a) === userId);
    return (
        <TouchableOpacity style={[styles.communityCard, { borderLeftWidth: 4, borderLeftColor: '#00D1FF' }]} onPress={onPress}>
            <View style={styles.cardHeader}>
                <View style={styles.eventInfo}>
                    <Text style={styles.eventStatus}>LIVE MEETUP</Text>
                    <Text style={styles.postTitle}>{event.title}</Text>
                </View>
                <View style={styles.eventDateBox}>
                    <Text style={styles.eventMonth}>{new Date(event.date).toLocaleString('default', { month: 'short' }).toUpperCase()}</Text>
                    <Text style={styles.eventDay}>{new Date(event.date).getDate()}</Text>
                </View>
            </View>
            <View style={styles.eventDetails}>
                <View style={styles.eventDetailItem}>
                    <Feather name="map-pin" size={12} color="#00D1FF" />
                    <Text style={styles.eventDetailText} numberOfLines={1}>{event.location}</Text>
                </View>
                <View style={styles.eventDetailItem}>
                    <Feather name="users" size={12} color="#00D1FF" />
                    <Text style={styles.eventDetailText}>{event.attendees?.length || 0} / {event.maxAttendees || 10} Joined</Text>
                </View>
            </View>
            <TouchableOpacity style={[styles.joinBtn, isJoined && styles.joinedBtn]} onPress={(e) => { e.stopPropagation(); onJoin(); }}>
                <Text style={[styles.joinBtnText, isJoined && { color: '#00D1FF' }]}>
                    {isJoined ? 'JOINED ✔' : 'RESERVE SPOT'}
                </Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

function PlayerCard({ rank, name, points, avatar, tag }: any) {
    const getRankColor = (r: number) => {
        if (r === 1) return '#FFD700';
        if (r === 2) return '#C0C0C0';
        if (r === 3) return '#CD7F32';
        return '#64748B';
    };

    return (
        <TouchableOpacity style={styles.playerCard}>
            <View style={[styles.rankBadge, { backgroundColor: getRankColor(rank) }]}>
                <Text style={styles.rankText}>{rank}</Text>
            </View>
            <Image source={{ uri: avatar }} style={[styles.playerAvatar, { borderColor: getRankColor(rank) }]} />
            <Text style={styles.playerName} numberOfLines={1}>{name}</Text>
            <Text style={styles.playerPoints}>{points} XP</Text>
            {tag && (
                <View style={[styles.mvpBadge, { backgroundColor: tag === 'MVP' ? '#FFD700' : '#3B82F6' }]}>
                    <Text style={styles.mvpText}>{tag}</Text>
                </View>
            )}
            <TouchableOpacity style={styles.challengeButton}>
                <Text style={styles.challengeText}>CHALLENGE</Text>
            </TouchableOpacity>
        </TouchableOpacity>
    );
}

function VenueCard({ id, title, image, dist, rating, price }: any) {
    const router = useRouter();
    return (
      <TouchableOpacity
        style={styles.venueCard}
        onPress={() => router.push({
          pathname: "/venue/[id]",
          params: { id: id || title, title, image, price, rating }
        })}
      >
        <Image source={{ uri: image }} style={styles.venueImage} />
        <View style={styles.venueInfo}>
          <Text style={styles.venueTitle} numberOfLines={1}>{title}</Text>
          <View style={styles.venueMetaRow}>
            <MapPin color="#94A3B8" size={12} />
            <Text style={styles.venueMetaText}>{dist}</Text>
            <View style={styles.dotSeparator} />
            <Star color="#00FF00" size={12} fill="#00FF00" />
            <Text style={styles.venueMetaText}>{rating}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
}

function TrendingCard({ id, title, image, price, rating }: any) {
    const router = useRouter();
    return (
      <TouchableOpacity
        style={styles.trendingCard}
        onPress={() => router.push({
          pathname: "/venue/[id]",
          params: { id: id || title, title, image, price, rating }
        })}
      >
        <Image source={{ uri: image }} style={styles.trendingImage} />
        <View style={styles.priceBadge}><Text style={styles.priceText}>{price}/hr</Text></View>
        <Text style={styles.trendingTitle}>{title}</Text>
      </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090E1A' },
  scrollContent: { paddingBottom: 120 },

  topHeader: {
    paddingTop: 65, paddingBottom: 25, paddingHorizontal: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#0F172A', 
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  locationSection: { flex: 1 },
  greetingText: { color: '#00FF00', fontSize: 20, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  areaText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconCircle: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  profileCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#00FF00', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%', backgroundColor: '#1E293B' },
  badge: { position: 'absolute', top: 10, right: 10, width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF3B30', borderWidth: 2, borderColor: '#0F172A' },

  persistentTabContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#131C31', 
    marginHorizontal: 20, 
    borderRadius: 15, 
    padding: 5, 
    marginTop: 15, 
    marginBottom: 5,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  persistentTabItem: { 
    flex: 1, 
    paddingVertical: 12, 
    alignItems: 'center', 
    borderRadius: 12 
  },
  activePersistentTabItem: { 
    backgroundColor: '#00FF00', 
    shadowColor: '#00FF00', shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
  },
  persistentTabText: { 
    color: '#94A3B8', 
    fontSize: 12, 
    fontWeight: '800',
    letterSpacing: 0.5
  },
  activePersistentTabText: { 
    color: '#090E1A', 
  },

  searchContainer: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: '#131C31', 
    margin: 20, padding: 18, borderRadius: 20, gap: 14, 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' 
  },
  searchPlaceholder: { color: '#64748B', fontSize: 15, fontWeight: '500' },

  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, marginBottom: 20 },
  gridItemWrapper: { width: '25%', padding: 8 },
  gridItem: { 
    backgroundColor: '#131C31', borderRadius: 20, paddingVertical: 20, alignItems: 'center', 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  gridIcon: { fontSize: 28, marginBottom: 10 },
  gridText: { color: '#E2E8F0', fontSize: 11, fontWeight: '700', textAlign: 'center', letterSpacing: 0.5 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 15 },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  seeAllText: { color: '#00FF00', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  horizontalScroll: { paddingLeft: 20, paddingRight: 20 },

  trendingCard: { width: 280, marginRight: 20, borderRadius: 24, overflow: 'hidden', backgroundColor: '#131C31', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  trendingImage: { width: '100%', height: 170, borderRadius: 24 },
  priceBadge: { 
    position: 'absolute', top: 15, right: 15, 
    backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,255,0,0.3)' 
  },
  priceText: { color: '#00FF00', fontWeight: '800', fontSize: 13 },
  trendingTitle: { color: '#FFF', fontWeight: '700', fontSize: 16, marginTop: 12, marginLeft: 12, marginBottom: 12 },

  offerBanner: { 
    backgroundColor: '#131C31', marginHorizontal: 20, marginVertical: 30, borderRadius: 24, padding: 24, 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    borderLeftWidth: 4, borderLeftColor: '#00FF00',
    shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 6
  },
  offerContent: { flex: 1 },
  offerTitle: { color: '#FFFFFF', fontWeight: '800', fontSize: 18, letterSpacing: 0.5 },
  offerSubtitle: { color: '#94A3B8', fontSize: 13, marginTop: 8, fontWeight: '500', lineHeight: 18 },

  venueCard: { 
    width: 250, marginRight: 20, 
    backgroundColor: '#131C31', borderRadius: 24, overflow: 'hidden', 
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4
  },
  venueImage: { width: '100%', height: 150 },
  venueInfo: { padding: 18 },
  venueTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  venueMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  venueMetaText: { color: '#94A3B8', fontSize: 13, marginLeft: 6, fontWeight: '500' },
  dotSeparator: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#475569', marginHorizontal: 8 },

  tournamentCard: { width: 330, marginRight: 20, height: 200, borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  tournamentBg: { flex: 1 },
  tournamentOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', padding: 24, justifyContent: 'flex-end' },
  regBadge: { alignSelf: 'flex-start', backgroundColor: '#00FF00', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginBottom: 12 },
  regBadgeText: { color: '#090E1A', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  tournamentTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 12, lineHeight: 28 },
  tournamentDetailRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  tournamentDetailText: { color: '#E2E8F0', fontSize: 12, fontWeight: '600', marginLeft: 6 },

  tournamentListItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#131C31', 
    marginHorizontal: 20, 
    marginBottom: 12, 
    borderRadius: 18, 
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  listImage: { width: 60, height: 60, borderRadius: 12 },
  listInfo: { flex: 1, marginLeft: 15 },
  listTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  listSub: { color: '#64748B', fontSize: 12, marginTop: 2 },
  listMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 5 },
  listMetaText: { color: '#00FF00', fontSize: 11, fontWeight: '600' },
  listAction: { padding: 5 },

  playerListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 15,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  rankTextList: { color: '#94A3B8', fontSize: 16, fontWeight: '900', width: 25 },
  playerItemAvatar: { width: 45, height: 45, borderRadius: 22.5, marginLeft: 10 },
  playerNameList: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  playerPointsList: { color: '#00FF00', fontSize: 12, fontWeight: '600', marginTop: 2 },

  playerCard: {
    width: 140,
    backgroundColor: '#131C31',
    borderRadius: 20,
    padding: 15,
    marginRight: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5
  },
  rankBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
  },
  rankText: { fontSize: 12, fontWeight: '900', color: '#000' },
  playerAvatar: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, marginTop: 10, marginBottom: 10, backgroundColor: '#0F172A' },
  playerName: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  playerPoints: { color: '#94A3B8', fontSize: 11, fontWeight: '600', marginBottom: 12 },
  challengeButton: { width: '100%', paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(0, 255, 0, 0.1)', borderWidth: 1, borderColor: 'rgba(0, 255, 0, 0.3)', alignItems: 'center' },
  challengeText: { color: '#00FF00', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  mvpBadge: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  mvpText: { color: '#000', fontSize: 8, fontWeight: '900' },

  // Community Hub Styles
  communitySubTabRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15, gap: 10 },
  communitySubTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
  activeCommunitySubTab: { backgroundColor: '#00FF00' },
  communitySubTabText: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },
  activeCommunitySubTabText: { color: '#090E1A' },

  statsStrip: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, backgroundColor: 'rgba(255,255,255,0.03)', padding: 15, borderRadius: 18 },
  statsStripText: { color: '#94A3B8', fontSize: 12, fontWeight: '800' },
  createBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#00FF00', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 5 },
  createBtnText: { color: '#090E1A', fontSize: 10, fontWeight: '900' },

  communityCard: { backgroundColor: '#131C31', borderRadius: 20, padding: 18, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  smallAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#0F172A' },
  authorName: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  postMeta: { color: '#64748B', fontSize: 10, marginTop: 2 },
  categoryBadge: { backgroundColor: 'rgba(0,255,0,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  categoryText: { color: '#00FF00', fontSize: 8, fontWeight: '900' },
  postTitle: { color: '#FFF', fontSize: 16, fontWeight: '800', marginBottom: 8 },
  postContent: { color: '#94A3B8', fontSize: 13, lineHeight: 18, marginBottom: 15 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  footerAction: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerActionText: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },

  eventInfo: { flex: 1 },
  eventStatus: { color: '#00D1FF', fontSize: 10, fontWeight: '900', marginBottom: 5 },
  eventDateBox: { backgroundColor: '#1E293B', padding: 8, borderRadius: 12, alignItems: 'center', minWidth: 45 },
  eventMonth: { color: '#00D1FF', fontSize: 10, fontWeight: '900' },
  eventDay: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  eventDetails: { flexDirection: 'row', gap: 15, marginBottom: 15 },
  eventDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  eventDetailText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  joinBtn: { backgroundColor: '#FFF', paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  joinedBtn: { backgroundColor: 'rgba(0,209,255,0.1)', borderWidth: 1, borderColor: 'rgba(0,209,255,0.3)' },
  joinBtnText: { color: '#000', fontSize: 12, fontWeight: '900' },

  emptyHub: { alignItems: 'center', paddingVertical: 60, gap: 15 },
  emptyHubText: { color: '#475569', fontSize: 13, fontWeight: '600', textAlign: 'center', maxWidth: 200 },

  // Detail Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalOverlaySolid: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)' },
  modalContainer: { backgroundColor: '#090E1A', borderTopLeftRadius: 35, borderTopRightRadius: 35, overflow: 'hidden' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  modalTitle: { color: '#FFF', fontSize: 20, fontWeight: '900' },
  closeButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center' },
  
  detailTitle: { color: '#FFF', fontSize: 26, fontWeight: '900', marginBottom: 15 },
  detailContent: { color: '#94A3B8', fontSize: 16, lineHeight: 24, marginBottom: 25 },
  detailActionRow: { flexDirection: 'row', gap: 20, paddingBottom: 25, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', marginBottom: 25 },
  detailAction: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.03)', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12 },
  detailActionText: { color: '#94A3B8', fontSize: 13, fontWeight: '800' },

  commentSection: { marginBottom: 100 },
  commentHeader: { color: '#00FF00', fontSize: 12, fontWeight: '900', letterSpacing: 1, marginBottom: 20 },
  commentItem: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1E293B' },
  commentContentBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  commentUserRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  commentUserName: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  commentDate: { color: '#475569', fontSize: 10 },
  commentText: { color: '#E2E8F0', fontSize: 14, lineHeight: 20 },
  noCommentsText: { color: '#475569', fontSize: 13, textAlign: 'center', marginTop: 20 },

  commentInputContainer: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#131C31', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', gap: 12 },
  inputWrapper: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#090E1A', borderRadius: 25, paddingHorizontal: 15, paddingVertical: 8 },
  commentInput: { flex: 1, color: '#FFF', fontSize: 14, maxHeight: 100 },
  sendBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#00FF00', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },

  // Create Post Styles
  inputLabel: { color: '#00FF00', fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 10 },
  formInput: { backgroundColor: '#131C31', borderRadius: 15, padding: 18, color: '#FFF', fontSize: 15, marginBottom: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  categoryPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  catOption: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  catOptionActive: { backgroundColor: '#00FF00', borderColor: '#00FF00' },
  catOptionText: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  catOptionTextActive: { color: '#090E1A' },
  submitPostBtn: { backgroundColor: '#00FF00', paddingVertical: 18, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, shadowColor: '#00FF00', shadowOpacity: 0.3, shadowRadius: 10, elevation: 5, marginBottom: 40 },
  submitPostBtnText: { color: '#090E1A', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },

  // Dropdown Styles
  dropdownTrigger: { backgroundColor: '#131C31', borderRadius: 15, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  dropdownValue: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  dropdownMenu: { backgroundColor: '#1E293B', borderRadius: 15, marginTop: 5, padding: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', shadowColor: '#000', shadowOpacity: 0.5, shadowRadius: 10, elevation: 10 },
  dropdownOption: { padding: 15, borderRadius: 10 },
  dropdownOptionText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },

  // Event Detail Styles
  eventInfoStrip: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  infoBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', padding: 15, borderRadius: 15, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  infoLabel: { color: '#475569', fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  infoValue: { color: '#FFF', fontSize: 12, fontWeight: '700', marginTop: 2 },
  organizerSection: { marginBottom: 30 },
  attendeesSection: { marginBottom: 30 },
  attendeeHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  capacityText: { color: '#00D1FF', fontSize: 10, fontWeight: '900' },
  avatarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  attendeeIcon: { alignItems: 'center', width: 60 },
  attendeeImg: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1E293B', borderWidth: 1, borderColor: '#00D1FF' },
  attendeeName: { color: '#94A3B8', fontSize: 9, fontWeight: '600', marginTop: 6, textAlign: 'center' },
  modalFooter: { padding: 25, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)', backgroundColor: '#131C31' },
  joinEventBtn: { backgroundColor: '#00FF00', paddingVertical: 18, borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  leaveEventBtn: { backgroundColor: 'rgba(0,209,255,0.1)', borderWidth: 1, borderColor: '#00D1FF' },
  joinEventBtnText: { color: '#090E1A', fontSize: 14, fontWeight: '900', letterSpacing: 0.5 }
});