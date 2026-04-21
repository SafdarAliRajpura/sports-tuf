import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Dimensions, Image, ImageBackground, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut, ZoomIn, FadeInRight } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
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
const MapPin = (props: any) => <Feather name="map-pin" {...props} />;
const ChevronRight = (props: any) => <Feather name="chevron-right" {...props} />;
const Crown = (props: any) => <FontAwesome5 name="crown" {...props} />;
const Star = (props: any) => <Feather name="star" {...props} />;
const Trophy = (props: any) => <FontAwesome5 name="trophy" {...props} />;
const Medal = (props: any) => <FontAwesome5 name="medal" {...props} />;
const MessageSquare = (props: any) => <Feather name="message-square" {...props} />;
const Calendar = (props: any) => <Feather name="calendar" {...props} />;
const Shield = (props: any) => <Feather name="shield" {...props} />;
const Users = (props: any) => <Feather name="users" {...props} />;
const Zap = (props: any) => <Feather name="zap" {...props} />;
const Clock = (props: any) => <Feather name="clock" {...props} />;

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: '1', name: 'Cricket', icon: '🏏' },
  { id: '2', name: 'Football', icon: '⚽' },
  { id: '3', name: 'Pickleball', icon: '🎾' },
  { id: '4', name: 'Badminton', icon: '🏸' },
];

// High-Performance Card Memoization
const VenueCard = React.memo(({ id, title, image, dist, rating, price }: any) => {
    const router = useRouter();
    return (
      <TouchableOpacity 
        style={styles.venueCard} 
        onPress={() => router.push({ 
            pathname: "/venue/[id]", 
            params: { id, title, image, price, rating } 
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
});

const TrendingCard = React.memo(({ id, title, image, price, rating }: any) => {
    const router = useRouter();
    return (
      <TouchableOpacity 
        style={styles.trendingCard} 
        onPress={() => router.push({ 
            pathname: "/venue/[id]", 
            params: { id, title, image, price, rating } 
        })}
      >
        <Image source={{ uri: image }} style={styles.trendingImage} />
        <View style={styles.priceBadge}><Text style={styles.priceText}>₹{price}/hr</Text></View>
        <View style={styles.ratingBadgeOverlay}>
            <Star color="#FDB813" size={12} fill="#FDB813" />
            <Text style={styles.ratingTextOverlay}>{rating}</Text>
        </View>
        <Text style={styles.trendingTitle}>{title}</Text>
      </TouchableOpacity>
    );
});

export default function ArenaHomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('Venues');
  const [userName, setUserName] = useState('Athlete');
  const [avatar, setAvatar] = useState('https://api.dicebear.com/7.x/avataaars/png?seed=Felix');
  const [user, setUser] = useState<any>(null);
  const [venues, setVenues] = useState<any[]>([]);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [discussions, setDiscussions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [platformStats, setPlatformStats] = useState({ users: 0, venues: 0, tournaments: 0, recentAvatars: [] });
  const [selectedDiscussion, setSelectedDiscussion] = useState<any>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: 'General' });
  const [newEvent, setNewEvent] = useState({ title: '5v5 Friendly Match', date: new Date().toISOString(), location: '', maxAttendees: '10' });
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeCommunitySubTab, setActiveCommunitySubTab] = useState('Leaderboard');

  const { location, loading: locationLoading } = useUserLocation();

  const dynamicCategories = useMemo(() => {
    return CATEGORIES.map(cat => {
      const backendCat = categories.find(c => c.title.toLowerCase() === cat.name.toLowerCase());
      return { ...cat, count: backendCat ? backendCat.count : 0 };
    });
  }, [categories]);

  // Enhanced Data Refresh on Focus
  useFocusEffect(
    useCallback(() => {
      let isSubscribed = true;
      const refreshHomeData = async () => {
        try {
          const userData = await AsyncStorage.getItem('userInfo');
          if (userData && isSubscribed) {
            const user = JSON.parse(userData);
            setUserName(user.first_name || user.name || 'Athlete');
            setAvatar(getAvatarUrl(user.avatar || user.user_profile));
          }

          const [userRes, venueRes, tournamentRes, leaderboardRes, catRes, notifRes, discRes, eventRes, platformStatsRes] = await Promise.all([
            apiClient.get('/api/auth/me').catch(() => ({ data: null })),
            apiClient.get('/api/venues').catch(() => ({ data: null })),
            apiClient.get('/api/tournaments').catch(() => ({ data: null })),
            apiClient.get('/api/leaderboard').catch(() => ({ data: null })),
            apiClient.get('/api/venues/categories').catch(() => ({ data: null })),
            apiClient.get('/api/notifications').catch(() => ({ data: null })),
            apiClient.get('/api/community/discussions').catch(() => ({ data: null })),
            apiClient.get('/api/community/events').catch(() => ({ data: null })),
            apiClient.get('/api/analytics/platform-stats').catch(() => ({ data: null }))
          ]);

          if (!isSubscribed) return;

          if (userRes?.data?.success) {
            const u = userRes.data.data;
            setUserName(u.first_name || 'Athlete');
            setAvatar(getAvatarUrl(u.user_profile));
            setUser(u);
            AsyncStorage.setItem('userInfo', JSON.stringify(u));
          }

          if (venueRes?.data) {
            const parsed = venueRes.data?.data ?? venueRes.data;
            if (Array.isArray(parsed)) setVenues(parsed);
          }

          if (tournamentRes?.data) setTournaments(tournamentRes.data.data || tournamentRes.data || []);
          if (leaderboardRes?.data?.success) setLeaderboard(leaderboardRes.data.data);
          if (catRes?.data?.success) setCategories(catRes.data.data);
          if (notifRes?.data?.success) setHasUnread(notifRes.data.data.some((n: any) => !n.isRead));
          
          // Fixed Signal Decoding: Handled raw array responses
          if (discRes?.data) {
            const dData = discRes.data.success ? discRes.data.data : discRes.data;
            if (Array.isArray(dData)) setDiscussions(dData);
          }
          if (eventRes?.data) {
            const eData = eventRes.data.success ? eventRes.data.data : eventRes.data;
            if (Array.isArray(eData)) setEvents(eData);
          }
          if (platformStatsRes?.data?.success) {
            setPlatformStats(platformStatsRes.data.data);
          }

        } catch (e: any) { console.error('Home Refresh Error:', e.message); }
      };
      refreshHomeData();
      return () => { isSubscribed = false; };
    }, [])
  );

  const triggerRefresh = useCallback(async () => {
    try {
        const [discRes, eventRes, leaderboardRes, platformStatsRes] = await Promise.all([
            apiClient.get('/api/community/discussions').catch(() => ({ data: null })),
            apiClient.get('/api/community/events').catch(() => ({ data: null })),
            apiClient.get('/api/leaderboard').catch(() => ({ data: null })),
            apiClient.get('/api/analytics/platform-stats').catch(() => ({ data: null }))
        ]);
        if (discRes?.data) {
            const dData = discRes.data.success ? discRes.data.data : discRes.data;
            if (Array.isArray(dData)) {
                setDiscussions(dData);
                if (selectedDiscussion) {
                    const updated = dData.find((d: any) => d._id === selectedDiscussion._id);
                    if (updated) setSelectedDiscussion(updated);
                }
            }
        }
        if (eventRes?.data) {
            const eData = eventRes.data.success ? eventRes.data.data : eventRes.data;
            if (Array.isArray(eData)) setEvents(eData);
        }
        if (leaderboardRes?.data?.success) setLeaderboard(leaderboardRes.data.data);
        if (platformStatsRes?.data?.success) setPlatformStats(platformStatsRes.data.data);
    } catch (e) { console.error('Silent Refresh Error'); }
  }, [selectedDiscussion]);

  const handleLike = async (id: string) => {
    try {
        await apiClient.put(`/api/community/discussions/${id}/like`);
        triggerRefresh();
    } catch (e) { console.error('Like failed'); }
  };

  const handleComment = async (id: string) => {
    if (!commentText.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
        await apiClient.post(`/api/community/discussions/${id}/comment`, { text: commentText });
        setCommentText('');
        triggerRefresh();
    } catch (e) { console.error('Comment failed'); }
    finally { setIsSubmitting(false); }
  };

  const handleCreatePost = async () => {
    if (!newPost.title || !newPost.content || isSubmitting) return;
    setIsSubmitting(true);
    try {
        await apiClient.post('/api/community/discussions', newPost);
        setNewPost({ title: '', content: '', category: 'General' });
        setIsCreatingPost(false);
        triggerRefresh();
    } catch (e) { console.error('Post creation failed'); }
    finally { setIsSubmitting(false); }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.location || isSubmitting) return;
    setIsSubmitting(true);
    try {
        await apiClient.post('/api/community/events', newEvent);
        setNewEvent({ title: '5v5 Friendly Match', date: new Date().toISOString(), location: '', maxAttendees: '10' });
        setIsCreatingEvent(false);
        triggerRefresh();
    } catch (e) { console.error('Event creation failed'); }
    finally { setIsSubmitting(false); }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewEvent({ ...newEvent, date: selectedDate.toISOString() });
    }
  };

  const handleJoinEvent = async (id: string) => {
    try {
        await apiClient.put(`/api/community/events/${id}/join`);
        triggerRefresh();
    } catch (e) { console.error('Join event failed'); }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.topHeader}>
        <View style={styles.locationSection}>
          <Text style={styles.greetingText}>HELLO, {userName.toUpperCase()}!</Text>
          <View style={styles.locationRow}>
            <MapPin color="#00FF00" size={14} /><Text style={styles.areaText}>{locationLoading ? 'Locating...' : (location?.address?.formatted || 'Location Unavailable')}</Text><ChevronRight color="#00FF00" size={14} />
          </View>
        </View>
        <View style={styles.headerIcons}>
          <WeatherWidget />
          <TouchableOpacity style={styles.iconCircle} onPress={() => setShowNotifications(true)}><Bell color="#FFFFFF" size={20} />{hasUnread && <View style={styles.badge} />}</TouchableOpacity>
          <TouchableOpacity style={styles.profileCircle} onPress={() => router.push('/(tabs)/profile')}><Image source={{ uri: avatar }} style={styles.avatarImage} /></TouchableOpacity>
        </View>
      </View>

      <View style={styles.persistentTabContainer}>
        {['Venues', 'Tournaments', 'Community'].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)} style={[styles.persistentTabItem, activeTab === tab && styles.activePersistentTabItem]}><Text style={[styles.persistentTabText, activeTab === tab && styles.activePersistentTabText]}>{tab.toUpperCase()}</Text></TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {activeTab === 'Tournaments' ? (
          <View style={{ marginTop: 10 }}>
            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Elite Tournaments</Text></View>
            <View style={{ paddingBottom: 100 }}>
               {tournaments.length > 0 ? tournaments.map(t => <TournamentListItem key={t._id} tournament={t} />) : <Text style={{ color: '#94A3B8', fontSize: 13, marginTop: 20, textAlign: 'center' }}>No tournaments found.</Text>}
            </View>
          </View>
        ) : activeTab === 'Community' ? (
          <View style={{ marginTop: 10 }}>
            {/* Community Hero Section - Mirrored from Web */}
            <View style={styles.communityHero}>
              <View style={styles.heroFlexRow}>
                <View style={{ flex: 1 }}>
                  <View style={styles.livePulseRow}>
                    <View style={styles.pulseDot} />
                    <Text style={styles.livePulseText}>COMMUNITY LIVE HUB</Text>
                  </View>
                  <Text style={styles.communityHeroTitle}>
                    CONNECT.{"\n"}
                    <Text style={styles.heroAccent}>COMPETE.</Text>{"\n"}
                    CONQUER.
                  </Text>
                </View>
                <View style={styles.pulseMetricsBox}>
                  <Text style={styles.pulseCountText}>{platformStats.users?.toLocaleString() || '0'}+</Text>
                  <Text style={styles.pulseLabelText}>ACTIVE ATHLETES</Text>
                  <View style={styles.miniAvatarStack}>
                    {(platformStats.recentAvatars || [1, 2, 3]).slice(0, 3).map((av: any, i: number) => (
                      <Image 
                        key={i} 
                        source={{ uri: typeof av === 'string' ? av : `https://api.dicebear.com/7.x/avataaars/png?seed=${i}` }} 
                        style={[styles.miniStackAvatar, { marginLeft: i === 0 ? 0 : -10 }]} 
                      />
                    ))}
                  </View>
                </View>
              </View>
              <Text style={styles.communityHeroSub}>
                Join the ultimate sports ecosystem. Find teammates, discuss strategies, and participate in exclusive events.
              </Text>
            </View>


            <View style={styles.communitySubTabRow}>
              {['Discussions', 'Events', 'Leaderboard'].map(sub => (
                <TouchableOpacity 
                  key={sub} 
                  onPress={() => setActiveCommunitySubTab(sub)} 
                  style={[styles.communitySubTab, activeCommunitySubTab === sub && styles.activeCommunitySubTab]}
                >
                  <Text style={[styles.communitySubTabText, activeCommunitySubTab === sub && styles.activeCommunitySubTabText]}>
                    {sub === 'Events' ? 'GLOBAL EVENTS' : sub.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {activeCommunitySubTab === 'Leaderboard' ? (
              <View style={{ paddingHorizontal: 20, paddingBottom: 120 }}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Crown color="#FFD700" size={20} fill="#FFD700" />
                    <Text style={styles.sectionTitle}>GLOBAL LEADERBOARD</Text>
                  </View>
                </View>
                {leaderboard.length > 0 ? (
                  leaderboard.slice(0, 10).map((player, idx) => (
                    <PlayerListItem 
                      key={player._id || idx} 
                      rank={idx + 1} 
                      name={player.fullName || player.name || `${player.first_name} ${player.last_name}`} 
                      points={player.xp || player.points || 0} 
                      avatar={getAvatarUrl(player.avatar || player.user_profile)} 
                      role={player.primaryRole || 'Athlete'}
                    />
                  ))
                ) : (
                  <Text style={styles.emptyStateText}>Loading rankings...</Text>
                )}
              </View>
            ) : activeCommunitySubTab === 'Discussions' ? (
              <View style={{ paddingHorizontal: 20, paddingBottom: 120 }}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <MessageSquare color="#00FF00" size={20} />
                    <Text style={styles.sectionTitle}>LIVE DISCUSSIONS</Text>
                  </View>
                  <TouchableOpacity style={styles.addPostButton} onPress={() => setIsCreatingPost(true)}>
                    <Feather name="plus" size={16} color="#000" />
                  </TouchableOpacity>
                </View>
                {discussions.length > 0 ? (
                  discussions.map((disc, idx) => (
                    <DiscussionListItem 
                        key={disc._id || idx} 
                        discussion={disc} 
                        userId={user?._id}
                        onPress={() => setSelectedDiscussion(disc)}
                        onLike={() => handleLike(disc._id)}
                    />
                  ))
                ) : (
                  <Text style={styles.emptyStateText}>No active discussions found.</Text>
                )}
              </View>
            ) : (
                <View style={{ paddingHorizontal: 20, paddingBottom: 120 }}>
                    <View style={styles.sectionHeader}>
                      <View style={styles.sectionTitleRow}>
                        <Calendar color="#00FF00" size={20} />
                        <Text style={styles.sectionTitle}>GLOBAL EVENTS</Text>
                      </View>
                      <TouchableOpacity style={styles.addPostButton} onPress={() => setIsCreatingEvent(true)}>
                        <Feather name="plus" size={16} color="#000" />
                      </TouchableOpacity>
                    </View>
                    {events.length > 0 ? (
                      events.map((event, idx) => (
                        <EventListItem 
                            key={event._id || idx} 
                            event={event} 
                            userId={user?._id} 
                            onJoin={() => handleJoinEvent(event._id)}
                        />
                      ))
                    ) : (
                      <Text style={styles.emptyStateText}>No upcoming events scheduled.</Text>
                    )}
                </View>
            )}
          </View>

        ) : (
          <>
            <View style={styles.gridContainer}>
              {dynamicCategories.map((item) => (
                <View key={item.id} style={styles.gridItemWrapper}>
                  <TouchableOpacity style={styles.gridItem} onPress={() => router.push({ pathname: '/(tabs)/explore', params: { category: item.name } })}>
                    <Text style={styles.gridIcon}>{item.icon}</Text>
                    <View style={{ alignItems: 'center' }}><Text style={styles.gridText}>{item.name}</Text><Text style={styles.gridCountText}>{item.count} Turfs</Text></View>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.sectionHeader}><View style={styles.sectionTitleRow}><Crown color="#FFD700" size={20} fill="#FFD700" /><Text style={styles.sectionTitle}>Top Performers</Text></View><TouchableOpacity onPress={() => setActiveTab('Community')}><Text style={styles.seeAllText}>VIEW ALL</Text></TouchableOpacity></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {leaderboard.map((player, idx) => <PlayerCard key={player._id || idx} rank={idx + 1} name={player.fullName || player.name || `${player.first_name} ${player.last_name}`} points={player.xp || player.points || 0} avatar={getAvatarUrl(player.avatar || player.user_profile)} tag={idx === 0 ? 'MVP' : (idx < 3 ? 'PRO' : null)} />)}
            </ScrollView>
    
            <View style={styles.sectionHeader}><View style={styles.sectionTitleRow}><Zap color="#FF4500" size={20} fill="#FF4500" /><Text style={styles.sectionTitle}>Trending Venues</Text></View></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {venues.map((venue) => <TrendingCard key={venue._id} id={venue._id} title={venue.name} price={venue.price} image={venue.images?.[0] || venue.image} rating={venue.rating || "0.0"} />)}
            </ScrollView>
    
            <View style={styles.offerBanner}><View style={styles.offerContent}><Text style={styles.offerTitle}>EARN XP POINTS</Text><Text style={styles.offerSubtitle}>Get rewards on every booking</Text></View><Trophy color="#00FF00" size={32} /></View>
    
            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Venues around you</Text><TouchableOpacity onPress={() => router.push('/explore')}><Text style={styles.seeAllText}>VIEW ALL</Text></TouchableOpacity></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalScroll}>
              {venues.map((venue) => <VenueCard key={`around-${venue._id}`} id={venue._id} title={venue.name} image={venue.images?.[0] || venue.image} dist={venue.location} rating={venue.rating || "0.0"} price={venue.price} />)}
            </ScrollView>

            <View style={styles.sectionHeader}><Text style={styles.sectionTitle}>Elite Tournaments</Text><TouchableOpacity onPress={() => setActiveTab('Tournaments')}><Text style={styles.seeAllText}>VIEW ALL</Text></TouchableOpacity></View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingLeft: 20, paddingRight: 20, marginBottom: 40 }}>
              {tournaments.length > 0 ? tournaments.map(t => <TournamentCard key={t._id} tournament={t} />) : <Text style={{ color: '#94A3B8', fontSize: 13, marginLeft: 20 }}>No elite tournaments active.</Text>}
            </ScrollView>
          </>
        )}
      </ScrollView>
      <NotificationModal visible={showNotifications} onClose={() => setShowNotifications(false)} />

      {/* Discussion Detail Modal */}
      <Modal visible={!!selectedDiscussion} transparent animationType="slide">
          <View style={styles.fullModalOverlay}>
              <View style={styles.fullModalContent}>
                  <View style={styles.modalHeader}>
                      <TouchableOpacity onPress={() => setSelectedDiscussion(null)}>
                          <Feather name="x" size={24} color="#FFF" />
                      </TouchableOpacity>
                      <Text style={styles.modalHeaderTitle}>DISCUSSION</Text>
                      <View style={{ width: 24 }} />
                  </View>

                  <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                      {selectedDiscussion && (
                          <View style={styles.discussionDetailContainer}>
                              <View style={styles.webCardHeader}>
                                  <Image 
                                      source={{ uri: selectedDiscussion.author?.user_profile || 'https://api.dicebear.com/7.x/avataaars/png?seed=Felix' }} 
                                      style={styles.authorAvatarLarge} 
                                  />
                                  <View style={{ flex: 1, marginLeft: 15 }}>
                                      <Text style={styles.authorNameWebLarge}>{selectedDiscussion.author?.first_name || 'Athlete'}</Text>
                                      <Text style={styles.authorRoleWebLarge}>{selectedDiscussion.author?.primaryRole?.toUpperCase() || 'PRO ATHLETE'}</Text>
                                  </View>
                                  <View style={styles.categoryBadgeWebLarge}>
                                      <Text style={styles.categoryTextWeb}>{selectedDiscussion.category?.toUpperCase()}</Text>
                                  </View>
                              </View>

                              <Text style={styles.detailTitle}>{selectedDiscussion.title}</Text>
                              <Text style={styles.detailContent}>{selectedDiscussion.content}</Text>

                              <View style={styles.detailStatsRow}>
                                  <TouchableOpacity style={styles.detailStatBtn} onPress={() => handleLike(selectedDiscussion._id)}>
                                      <Feather name="heart" size={20} color={selectedDiscussion.likes?.includes(user?._id) ? "#FF10F0" : "#94A3B8"} fill={selectedDiscussion.likes?.includes(user?._id) ? "#FF10F0" : "transparent"} />
                                      <Text style={styles.detailStatText}>{selectedDiscussion.likes?.length || 0} Likes</Text>
                                  </TouchableOpacity>
                                  <View style={styles.detailStatBtn}>
                                      <Feather name="message-circle" size={20} color="#00B7FF" />
                                      <Text style={styles.detailStatText}>{selectedDiscussion.comments?.length || 0} Replies</Text>
                                  </View>
                              </View>

                              <View style={styles.commentsSection}>
                                  <Text style={styles.commentsHeading}>INSIGHTS ({selectedDiscussion.comments?.length || 0})</Text>
                                  {selectedDiscussion.comments?.map((comment: any, i: number) => (
                                      <View key={i} style={styles.commentItemWeb}>
                                          <Image source={{ uri: comment.user?.user_profile || 'https://api.dicebear.com/7.x/avataaars/png?seed=User' }} style={styles.commentAvatarWeb} />
                                          <View style={styles.commentBodyWeb}>
                                              <View style={styles.commentHeaderWeb}>
                                                  <Text style={styles.commentAuthorWeb}>{comment.user?.first_name || 'Athlete'}</Text>
                                                  <Text style={styles.commentTimeWeb}>JUST NOW</Text>
                                              </View>
                                              <Text style={styles.commentTextWeb}>{comment.text}</Text>
                                          </View>
                                      </View>
                                  ))}
                              </View>
                          </View>
                      )}
                  </ScrollView>

                  <View style={styles.commentInputContainer}>
                      <TextInput 
                          style={styles.commentInput} 
                          placeholder="Share your insights..." 
                          placeholderTextColor="#64748B"
                          value={commentText}
                          onChangeText={setCommentText}
                      />
                      <TouchableOpacity style={styles.sendCommentBtn} onPress={() => selectedDiscussion && handleComment(selectedDiscussion._id)}>
                          <Feather name="send" size={18} color="#000" />
                      </TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>

      {/* Create Discussion Modal */}
      <Modal visible={isCreatingPost} transparent animationType="fade">
          <View style={styles.modalOverlayBlur}>
              <Animated.View entering={ZoomIn} style={styles.createPostModal}>
                  <View style={styles.createPostHeader}>
                      <Text style={styles.createPostTitle}>NEW DISCUSSION</Text>
                      <TouchableOpacity onPress={() => setIsCreatingPost(false)}>
                          <Feather name="x" size={20} color="#94A3B8" />
                      </TouchableOpacity>
                  </View>
                  
                  <TextInput 
                      style={styles.postInputTitle} 
                      placeholder="Discussion Topic..." 
                      placeholderTextColor="#475569"
                      value={newPost.title}
                      onChangeText={(t) => setNewPost({...newPost, title: t})}
                  />
                  
                  <View style={styles.categoryPickerRow}>
                      {['General', 'Strategy', 'Team Up', 'Reviews'].map(cat => (
                          <TouchableOpacity 
                            key={cat} 
                            style={[styles.miniCatBadge, newPost.category === cat && styles.activeMiniCatBadge]}
                            onPress={() => setNewPost({...newPost, category: cat})}
                          >
                              <Text style={[styles.miniCatText, newPost.category === cat && styles.activeMiniCatText]}>{cat.toUpperCase()}</Text>
                          </TouchableOpacity>
                      ))}
                  </View>

                  <TextInput 
                      style={styles.postInputContent} 
                      placeholder="What's on your mind?" 
                      placeholderTextColor="#475569"
                      multiline
                      value={newPost.content}
                      onChangeText={(t) => setNewPost({...newPost, content: t})}
                  />

                  <TouchableOpacity style={styles.publishBtn} onPress={handleCreatePost}>
                      <Text style={styles.publishBtnText}>PUBLISH POST</Text>
                      <Feather name="send" size={16} color="#000" />
                  </TouchableOpacity>
              </Animated.View>
          </View>
      </Modal>

      {/* Create Event Modal */}
      <Modal visible={isCreatingEvent} transparent animationType="slide">
          <View style={styles.fullModalOverlay}>
              <View style={styles.fullModalContent}>
                  <View style={styles.modalHeader}>
                      <TouchableOpacity onPress={() => setIsCreatingEvent(false)}>
                          <Feather name="x" size={24} color="#FFF" />
                      </TouchableOpacity>
                      <Text style={styles.modalHeaderTitle}>HOST GLOBAL EVENT</Text>
                      <View style={{ width: 24 }} />
                  </View>

                  <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 25, paddingBottom: 100 }}>
                      
                      <View style={styles.livePreviewSection}>
                          <Text style={styles.previewLabel}>LIVE PREVIEW</Text>
                          <EventListItem 
                            event={{ 
                                title: newEvent.title || 'Event Title', 
                                date: newEvent.date, 
                                location: newEvent.location || 'Select Arena',
                                attendees: [],
                                maxAttendees: newEvent.maxAttendees || 10
                            }} 
                            userId={user?._id} 
                          />
                      </View>

                      <View style={styles.formGroupWeb}>
                          <View style={styles.inputIconRow}>
                              <Shield color="#00B7FF" size={16} />
                              <Text style={styles.inputLabelWeb}>EVENT TITLE</Text>
                          </View>
                          <TextInput 
                              style={styles.premiumInputWeb} 
                              placeholder="e.g. Champions League Final" 
                              placeholderTextColor="#475569"
                              value={newEvent.title}
                              onChangeText={(t) => setNewEvent({...newEvent, title: t})}
                          />
                      </View>

                      <View style={styles.gridRowWeb}>
                          <View style={{ flex: 1 }}>
                              <View style={styles.inputIconRow}>
                                  <Users color="#FF10F0" size={16} />
                                  <Text style={styles.inputLabelWeb}>CAPACITY</Text>
                              </View>
                              <TextInput 
                                  style={styles.premiumInputWeb} 
                                  placeholder="10" 
                                  placeholderTextColor="#475569"
                                  keyboardType="numeric"
                                  value={newEvent.maxAttendees}
                                  onChangeText={(t) => setNewEvent({...newEvent, maxAttendees: t})}
                              />
                          </View>
                          <View style={{ flex: 1, marginLeft: 20 }}>
                              <View style={styles.inputIconRow}>
                                  <Clock color="#39FF14" size={16} />
                                  <Text style={styles.inputLabelWeb}>EVENT DATE</Text>
                              </View>
                              <TouchableOpacity style={styles.premiumInputWeb} onPress={() => setShowDatePicker(true)}>
                                  <Text style={{ color: '#FFF' }}>{moment(newEvent.date).format('MMM DD, YYYY')}</Text>
                              </TouchableOpacity>
                          </View>
                      </View>

                      {showDatePicker && (
                          <DateTimePicker
                              value={new Date(newEvent.date)}
                              mode="date"
                              display="default"
                              onChange={onDateChange}
                              minimumDate={new Date()}
                          />
                      )}

                      <View style={styles.formGroupWeb}>
                          <View style={styles.inputIconRow}>
                              <MapPin color="#00B7FF" size={16} />
                              <Text style={styles.inputLabelWeb}>SELECT THE ARENA</Text>
                          </View>
                          <View style={styles.venueGridWeb}>
                              {venues.map((venue: any) => (
                                  <TouchableOpacity 
                                    key={venue._id} 
                                    style={[styles.venueChipWeb, newEvent.location === venue.name && styles.activeVenueChipWeb]}
                                    onPress={() => setNewEvent({...newEvent, location: venue.name})}
                                  >
                                      <Text style={[styles.venueChipTextWeb, newEvent.location === venue.name && styles.activeVenueChipTextWeb]}>{venue.name}</Text>
                                  </TouchableOpacity>
                              ))}
                          </View>
                      </View>

                      <TouchableOpacity style={styles.launchBtnWeb} onPress={handleCreateEvent}>
                          <Text style={styles.launchBtnTextWeb}>LAUNCH GLOBAL EVENT</Text>
                          <Zap size={20} color="#000" fill="#000" />
                      </TouchableOpacity>
                  </ScrollView>
              </View>
          </View>
      </Modal>
    </View>
  );
}

function TournamentListItem({ tournament }: any) {
    const router = useRouter();
    const displayName = tournament.name || tournament.title || 'Elite Tournament';
    return (
        <TouchableOpacity style={styles.tournamentListItem} onPress={() => router.push({ pathname: '/tournament/[id]', params: { id: tournament._id } })}>
            <Image source={{ uri: tournament.image || 'https://images.unsplash.com/photo-1574629810360-7efbb1925713?q=80&w=200' }} style={styles.listImage} />
            <View style={styles.listInfo}><Text style={styles.listTitle}>{displayName}</Text><Text style={styles.listSub}>{tournament.location || 'Ahmedabad'}</Text><View style={styles.listMeta}><Medal color="#00FF00" size={12} /><Text style={styles.listMetaText}>ENTRY: ₹{tournament.entryFee || 'Free'}</Text></View></View>
            <TouchableOpacity style={styles.listAction}><ChevronRight color="#00FF00" size={20} /></TouchableOpacity>
        </TouchableOpacity>
    );
}

function DiscussionListItem({ discussion, userId, onPress, onLike }: any) {
    const isLiked = userId && discussion.likes?.includes(userId);
    return (
        <TouchableOpacity style={styles.webDiscussionCard} onPress={onPress}>
            <View style={styles.webCardHeader}>
                <Image 
                  source={{ uri: discussion.author?.user_profile || 'https://api.dicebear.com/7.x/avataaars/png?seed=Felix' }} 
                  style={styles.authorAvatarSmall} 
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.authorNameWeb}>{discussion.author?.first_name || 'Athlete'}</Text>
                    <Text style={styles.authorRoleWeb}>{discussion.author?.primaryRole?.toUpperCase() || 'PRO ATHLETE'}</Text>
                </View>
                <View style={styles.categoryBadgeWeb}>
                    <Text style={styles.categoryTextWeb}>{discussion.category?.toUpperCase() || 'GENERAL'}</Text>
                </View>
            </View>
            
            <Text style={styles.webDiscussionTitle}>{discussion.title}</Text>
            <Text style={styles.webDiscussionContent} numberOfLines={2}>{discussion.content}</Text>
            
            <View style={styles.webCardFooter}>
                <View style={styles.webFooterLeft}>
                    <TouchableOpacity style={styles.webStatItem} onPress={(e) => { e.stopPropagation(); onLike(); }}>
                        <Feather name="heart" size={14} color={isLiked ? "#FF10F0" : "#94A3B8"} fill={isLiked ? "#FF10F0" : "transparent"} />
                        <Text style={[styles.webStatText, isLiked && { color: '#FF10F0' }]}>{discussion.likes?.length || 0}</Text>
                    </TouchableOpacity>
                    <View style={styles.webStatItem}>
                        <Feather name="message-circle" size={14} color="#94A3B8" />
                        <Text style={styles.webStatText}>{discussion.comments?.length || 0}</Text>
                    </View>
                </View>
                <TouchableOpacity>
                    <Feather name="share-2" size={14} color="#94A3B8" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );
}

function EventListItem({ event, userId, onJoin }: any) {
    const isJoined = userId && event.attendees?.includes(userId);
    return (
        <View style={styles.webEventCard}>
            <View style={styles.webEventInfo}>
                <View style={styles.eventBadgeRow}>
                    <View style={styles.liveEventBadge}>
                        <Text style={styles.liveEventText}>LIVE MEETUP</Text>
                    </View>
                    <Text style={styles.eventDateWeb}>{new Date(event.date).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.webEventTitle}>{event.title}</Text>
                <View style={styles.webEventMetaRow}>
                    <View style={styles.webMetaItem}>
                        <MapPin color="#FF10F0" size={14} />
                        <Text style={styles.webMetaText} numberOfLines={1}>{event.location}</Text>
                    </View>
                    <View style={styles.webMetaItem}>
                        <Feather name="users" color="#00B7FF" size={14} />
                        <Text style={styles.webMetaText}>{event.attendees?.length || 0}/{event.maxAttendees || 10}</Text>
                    </View>
                </View>
            </View>
            <TouchableOpacity 
                style={[styles.webJoinButton, isJoined && styles.webJoinedButton]}
                onPress={onJoin}
            >
                <Text style={[styles.webJoinButtonText, isJoined && styles.webJoinedButtonText]}>
                    {isJoined ? 'JOINED' : 'RESERVE'}
                </Text>
            </TouchableOpacity>
        </View>
    );
}



function PlayerListItem({ rank, name, points, avatar, role }: any) {
    const getMedalIcon = (r: number) => {
        if (r === 1) return <Medal color="#FFD700" size={24} fill="#FFD700" />;
        if (r === 2) return <Medal color="#C0C0C0" size={24} fill="#C0C0C0" />;
        if (r === 3) return <Medal color="#CD7F32" size={24} fill="#CD7F32" />;
        return null;
    };
    return (
        <View style={styles.webPlayerCard}>
            <View style={styles.webRankBox}>
                <Text style={styles.webRankText}>{rank}</Text>
            </View>
            <Image source={{ uri: avatar }} style={styles.webPlayerAvatar} />
            <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.authorRoleWeb}>{role?.toUpperCase() || 'ATHLETE'}</Text>
                <Text style={styles.webPlayerName}>{name}</Text>
            </View>
            <View style={styles.webPointsBox}>
                <Text style={styles.webPointsText}>{points}</Text>
                <Text style={styles.webPointsLabel}>XP</Text>
            </View>
            {getMedalIcon(rank)}
        </View>
    );
}

function PlayerCard({ rank, name, points, avatar, tag }: any) {
    const getRankColor = (r: number) => { if (r === 1) return '#FFD700'; if (r === 2) return '#C0C0C0'; if (r === 3) return '#CD7F32'; return '#64748B'; };
    return (<TouchableOpacity style={styles.playerCard}><View style={[styles.rankBadge, { backgroundColor: getRankColor(rank) }]}><Text style={styles.rankText}>{rank}</Text></View><Image source={{ uri: avatar }} style={[styles.playerAvatar, { borderColor: getRankColor(rank) }]} /><Text style={styles.playerName} numberOfLines={1}>{name}</Text><Text style={styles.playerPoints}>{points} XP</Text>{tag && (<View style={[styles.mvpBadge, { backgroundColor: tag === 'MVP' ? '#FFD700' : '#3B82F6' }]}><Text style={styles.mvpText}>{tag}</Text></View>)}<TouchableOpacity style={styles.challengeButton}><Text style={styles.challengeText}>CHALLENGE</Text></TouchableOpacity></TouchableOpacity>);
}

function TournamentCard({ tournament }: any) {
    const router = useRouter();
    const displayName = tournament.name || tournament.title || 'Tournament';
    return (
        <TouchableOpacity style={styles.tournamentCard} onPress={() => router.push({ pathname: '/tournament/[id]', params: { id: tournament._id } })}>
            <ImageBackground source={{ uri: tournament.image || 'https://images.unsplash.com/photo-1574629810360-7efbb1925713?q=80&w=400' }} style={styles.tournamentBg}>
                <View style={styles.tournamentOverlay}><View style={styles.regBadge}><Text style={styles.regBadgeText}>REGISTRATION OPEN</Text></View><Text style={styles.tournamentTitle} numberOfLines={2}>{displayName}</Text><View style={styles.tournamentDetailRow}><Feather name="calendar" size={12} color="#00FF00" /><Text style={styles.tournamentDetailText}>{tournament.date}</Text></View></View>
            </ImageBackground>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090E1A' },
  scrollContent: { paddingBottom: 120 },
  topHeader: { paddingTop: 65, paddingBottom: 25, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0F172A', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  locationSection: { flex: 1 },
  greetingText: { color: '#00FF00', fontSize: 20, fontWeight: '800', letterSpacing: 0.5, marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  areaText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  headerIcons: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconCircle: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: 'rgba(255,255,255,0.05)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  profileCircle: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#00FF00', overflow: 'hidden' },
  avatarImage: { width: '100%', height: '100%', backgroundColor: '#1E293B' },
  badge: { position: 'absolute', top: 10, right: 10, width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF3B30', borderWidth: 2, borderColor: '#0F172A' },
  persistentTabContainer: { flexDirection: 'row', backgroundColor: '#131C31', marginHorizontal: 20, borderRadius: 15, padding: 5, marginTop: 15, marginBottom: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  persistentTabItem: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  activePersistentTabItem: { backgroundColor: '#00FF00' },
  persistentTabText: { color: '#94A3B8', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  activePersistentTabText: { color: '#090E1A' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 15, marginTop: 15, marginBottom: 20 },
  gridItemWrapper: { width: '25%', padding: 8 },
  gridItem: { backgroundColor: '#131C31', borderRadius: 20, paddingVertical: 20, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  gridIcon: { fontSize: 24, marginBottom: 10 },
  gridText: { color: '#FFF', fontSize: 11, fontWeight: '800', textAlign: 'center', letterSpacing: 0.5 },
  gridCountText: { color: '#64748B', fontSize: 9, fontWeight: '600', marginTop: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 20, marginBottom: 15 },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  seeAllText: { color: '#00FF00', fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  horizontalScroll: { paddingLeft: 20, paddingRight: 20 },
  trendingCard: { width: 280, marginRight: 20, borderRadius: 24, overflow: 'hidden', backgroundColor: '#131C31', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  trendingImage: { width: '100%', height: 170, borderRadius: 24 },
  priceBadge: { position: 'absolute', top: 15, left: 15, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(0,255,0,0.3)' },
  priceText: { color: '#00FF00', fontWeight: '800', fontSize: 13 },
  ratingBadgeOverlay: { position: 'absolute', top: 15, right: 15, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: 'rgba(253, 184, 19, 0.4)' },
  ratingTextOverlay: { color: '#FDB813', fontSize: 12, fontWeight: '900' },
  trendingTitle: { color: '#FFF', fontWeight: '700', fontSize: 16, marginTop: 12, marginLeft: 12, marginBottom: 12 },
  offerBanner: { backgroundColor: '#131C31', marginHorizontal: 20, marginVertical: 30, borderRadius: 24, padding: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderLeftWidth: 4, borderLeftColor: '#00FF00' },
  offerContent: { flex: 1 },
  offerTitle: { color: '#FFFFFF', fontWeight: '800', fontSize: 18, letterSpacing: 0.5 },
  offerSubtitle: { color: '#94A3B8', fontSize: 13, marginTop: 8, fontWeight: '500', lineHeight: 18 },
  venueCard: { width: 250, marginRight: 20, backgroundColor: '#131C31', borderRadius: 24, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  venueImage: { width: '100%', height: 150 },
  venueInfo: { padding: 18 },
  venueTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  venueMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  venueMetaText: { color: '#94A3B8', fontSize: 13, marginLeft: 6, fontWeight: '500' },
  dotSeparator: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#475569', marginHorizontal: 8 },
  playerCard: { width: 140, backgroundColor: '#131C31', borderRadius: 20, padding: 15, marginRight: 15, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  rankBadge: { position: 'absolute', top: 10, right: 10, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  rankText: { fontSize: 12, fontWeight: '900', color: '#000' },
  playerAvatar: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, marginTop: 10, marginBottom: 10 },
  playerName: { color: '#FFFFFF', fontSize: 14, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  playerPoints: { color: '#94A3B8', fontSize: 11, fontWeight: '600', marginBottom: 12 },
  challengeButton: { width: '100%', paddingVertical: 8, borderRadius: 10, backgroundColor: 'rgba(0, 255, 0, 0.1)', borderWidth: 1, borderColor: 'rgba(0, 255, 0, 0.3)', alignItems: 'center' },
  challengeText: { color: '#00FF00', fontSize: 10, fontWeight: '800' },
  mvpBadge: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  mvpText: { color: '#000', fontSize: 8, fontWeight: '900' },
  tournamentCard: { width: 330, marginRight: 20, height: 200, borderRadius: 24, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 16, elevation: 8 },
  tournamentBg: { flex: 1 },
  tournamentOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', padding: 24, justifyContent: 'flex-end' },
  regBadge: { alignSelf: 'flex-start', backgroundColor: '#00FF00', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginBottom: 12 },
  regBadgeText: { color: '#090E1A', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  tournamentTitle: { color: '#FFF', fontSize: 22, fontWeight: '800', marginBottom: 12, lineHeight: 28 },
  tournamentDetailRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  tournamentDetailText: { color: '#E2E8F0', fontSize: 12, fontWeight: '600', marginLeft: 6 },
  tournamentListItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131C31', marginHorizontal: 20, marginBottom: 12, borderRadius: 18, padding: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  listImage: { width: 60, height: 60, borderRadius: 12 },
  listInfo: { flex: 1, marginLeft: 15 },
  listTitle: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  listSub: { color: '#64748B', fontSize: 12, marginTop: 2 },
  listMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 5 },
  listMetaText: { color: '#00FF00', fontSize: 11, fontWeight: '600' },
  listAction: { padding: 5 },
  playerListItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: 15, borderRadius: 18, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  rankTextList: { color: '#94A3B8', fontSize: 16, fontWeight: '900', width: 25 },
  playerItemAvatar: { width: 45, height: 45, borderRadius: 22.5, marginLeft: 10 },
  playerNameList: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  playerPointsList: { color: '#00FF00', fontSize: 12, fontWeight: '600', marginTop: 2 },
  communitySubTabRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 15, gap: 10 },
  communitySubTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)' },
  communitySubTabText: { color: '#94A3B8', fontSize: 13, fontWeight: '700' },
  activeCommunitySubTab: { backgroundColor: '#00FF00' },
  activeCommunitySubTabText: { color: '#090E1A' },
  communityItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#131C31', padding: 18, borderRadius: 22, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  communityIconBox: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(0, 255, 0, 0.1)', justifyContent: 'center', alignItems: 'center' },
  communityTitle: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  communityMeta: { color: '#64748B', fontSize: 11, fontWeight: '600', marginTop: 4, letterSpacing: 0.5 },
  // Web Mirrored Styles
  communityHero: { paddingHorizontal: 25, paddingVertical: 35, marginBottom: 10 },
  livePulseRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 15 },
  pulseDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#39FF14' },
  livePulseText: { color: '#94A3B8', fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  communityHeroTitle: { color: '#FFF', fontSize: 42, fontWeight: '900', letterSpacing: -1, lineHeight: 46 },
  heroAccent: { color: '#00B7FF' },
  communityHeroSub: { color: '#64748B', fontSize: 14, fontWeight: '500', marginTop: 15, lineHeight: 22 },
  emptyStateText: { color: '#475569', fontSize: 13, textAlign: 'center', marginTop: 40, fontWeight: '600', letterSpacing: 0.5 },
  addPostButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  
  // Web Discussion Card
  webDiscussionCard: { backgroundColor: '#0F172A', borderRadius: 24, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  webCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  authorAvatarSmall: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#00B7FF' },
  authorNameWeb: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  authorRoleWeb: { color: '#00B7FF', fontSize: 9, fontWeight: '900', marginTop: 2, letterSpacing: 0.5 },
  categoryBadgeWeb: { backgroundColor: 'rgba(255,255,255,0.05)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryTextWeb: { color: '#94A3B8', fontSize: 9, fontWeight: '900' },
  webDiscussionTitle: { color: '#FFF', fontSize: 18, fontWeight: '800', marginBottom: 8 },
  webDiscussionContent: { color: '#94A3B8', fontSize: 14, lineHeight: 20, marginBottom: 15 },
  webCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' },
  webFooterLeft: { flexDirection: 'row', gap: 15 },
  webStatItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  webStatText: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },

  // Web Event Card
  webEventCard: { backgroundColor: '#0F172A', borderRadius: 24, padding: 25, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', flexDirection: 'row', alignItems: 'center' },
  webEventInfo: { flex: 1 },
  eventBadgeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  liveEventBadge: { backgroundColor: 'rgba(57, 255, 20, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(57, 255, 20, 0.2)' },
  liveEventText: { color: '#39FF14', fontSize: 8, fontWeight: '900' },
  eventDateWeb: { color: '#64748B', fontSize: 11, fontWeight: '700' },
  webEventTitle: { color: '#FFF', fontSize: 20, fontWeight: '900', marginBottom: 12 },
  webEventMetaRow: { flexDirection: 'row', gap: 15 },
  webMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: 150 },
  webMetaText: { color: '#94A3B8', fontSize: 12, fontWeight: '600' },
  webJoinButton: { backgroundColor: '#FFF', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 15, marginLeft: 15 },
  webJoinButtonText: { color: '#000', fontSize: 11, fontWeight: '900' },
  webJoinedButton: { backgroundColor: 'rgba(57, 255, 20, 0.1)', borderWidth: 1, borderColor: '#39FF14' },
  webJoinedButtonText: { color: '#39FF14' },

  // Web Player Card
  webPlayerCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', padding: 20, borderRadius: 24, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  webRankBox: { width: 30 },
  webRankText: { color: '#475569', fontSize: 16, fontWeight: '900' },
  webPlayerAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  webPlayerName: { color: '#FFF', fontSize: 16, fontWeight: '800', marginTop: 2 },
  webPointsBox: { alignItems: 'flex-end', marginRight: 15 },
  webPointsText: { color: '#FFF', fontSize: 18, fontWeight: '900' },
  webPointsLabel: { color: '#39FF14', fontSize: 10, fontWeight: '900' },
  // Hero Upgrade
  heroFlexRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pulseMetricsBox: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  pulseCountText: { color: '#FFF', fontSize: 24, fontWeight: '900' },
  pulseLabelText: { color: '#475569', fontSize: 8, fontWeight: '900', marginTop: 4, letterSpacing: 1 },
  miniAvatarStack: { flexDirection: 'row', marginTop: 12 },
  miniStackAvatar: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#090E1A' },
  // Full Modal Styles
  fullModalOverlay: { flex: 1, backgroundColor: '#090E1A' },
  fullModalContent: { flex: 1, paddingTop: 60 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 20 },
  modalHeaderTitle: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  discussionDetailContainer: { paddingHorizontal: 25 },
  authorAvatarLarge: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#00B7FF' },
  authorNameWebLarge: { color: '#FFF', fontSize: 18, fontWeight: '800' },
  authorRoleWebLarge: { color: '#00B7FF', fontSize: 10, fontWeight: '900', marginTop: 4, letterSpacing: 1 },
  categoryBadgeWebLarge: { backgroundColor: 'rgba(0, 183, 255, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  detailTitle: { color: '#FFF', fontSize: 28, fontWeight: '900', marginTop: 25, lineHeight: 34 },
  detailContent: { color: '#94A3B8', fontSize: 16, lineHeight: 26, marginTop: 20 },
  detailStatsRow: { flexDirection: 'row', gap: 20, marginTop: 30, paddingVertical: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  detailStatBtn: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailStatText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  commentsSection: { marginTop: 30, paddingBottom: 100 },
  commentsHeading: { color: '#475569', fontSize: 12, fontWeight: '900', letterSpacing: 1.5, marginBottom: 20 },
  commentItemWeb: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  commentAvatarWeb: { width: 36, height: 36, borderRadius: 18 },
  commentBodyWeb: { flex: 1, backgroundColor: '#0F172A', padding: 15, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  commentHeaderWeb: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  commentAuthorWeb: { color: '#FFF', fontSize: 13, fontWeight: '700' },
  commentTimeWeb: { color: '#475569', fontSize: 9, fontWeight: '800' },
  commentTextWeb: { color: '#94A3B8', fontSize: 14, lineHeight: 20 },
  commentInputContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#0F172A', padding: 20, paddingBottom: 40, flexDirection: 'row', alignItems: 'center', gap: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  commentInput: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, paddingHorizontal: 20, paddingVertical: 12, color: '#FFF', fontSize: 14 },
  sendCommentBtn: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#00B7FF', justifyContent: 'center', alignItems: 'center' },

  // Create Post Modal
  modalOverlayBlur: { flex: 1, backgroundColor: 'rgba(9, 14, 26, 0.95)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  createPostModal: { width: '100%', backgroundColor: '#0F172A', borderRadius: 30, padding: 25, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  createPostHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  createPostTitle: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  postInputTitle: { color: '#FFF', fontSize: 20, fontWeight: '700', marginBottom: 20 },
  categoryPickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  miniCatBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'transparent' },
  activeMiniCatBadge: { backgroundColor: 'rgba(0, 183, 255, 0.1)', borderColor: '#00B7FF' },
  miniCatText: { color: '#475569', fontSize: 10, fontWeight: '800' },
  activeMiniCatText: { color: '#00B7FF' },
  postInputContent: { color: '#94A3B8', fontSize: 16, lineHeight: 24, minHeight: 120, textAlignVertical: 'top', marginBottom: 25 },
  publishBtn: { backgroundColor: '#00FF00', paddingVertical: 18, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  publishBtnText: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  // Event Creation Styles
  eventLabel: { color: '#475569', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  eventFormGroup: { marginBottom: 20 },
  eventGridRow: { flexDirection: 'row', marginBottom: 10 },
  venueSelectorCard: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 10, borderWidth: 1, borderColor: 'transparent' },
  activeVenueSelector: { backgroundColor: 'rgba(57, 255, 20, 0.1)', borderColor: '#39FF14' },
  venueSelectorText: { color: '#94A3B8', fontSize: 12, fontWeight: '700' },
  activeVenueSelectorText: { color: '#39FF14' },
  // Premium Form Styles
  livePreviewSection: { marginBottom: 35, padding: 5 },
  previewLabel: { color: '#475569', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 15 },
  formGroupWeb: { marginBottom: 25 },
  inputIconRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  inputLabelWeb: { color: '#64748B', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  premiumInputWeb: { backgroundColor: '#0F172A', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 18, color: '#FFF', fontSize: 15, fontWeight: '600', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  gridRowWeb: { flexDirection: 'row', marginBottom: 25 },
  venueGridWeb: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  venueChipWeb: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, backgroundColor: '#0F172A', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  activeVenueChipWeb: { backgroundColor: 'rgba(0, 183, 255, 0.1)', borderColor: '#00B7FF' },
  venueChipTextWeb: { color: '#64748B', fontSize: 12, fontWeight: '700' },
  activeVenueChipTextWeb: { color: '#00B7FF' },
  launchBtnWeb: { backgroundColor: '#39FF14', borderRadius: 20, paddingVertical: 22, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 15, marginTop: 20, shadowColor: '#39FF14', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20 },
  launchBtnTextWeb: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 }
});