import { HapticTab } from '@/components/ui/HapticTab';
import { Tabs } from 'expo-router';
import { Calendar, Home, Search, User } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarActiveTintColor: '#00FF00',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        // Ensure icons are centered vertically within the bar
        tabBarItemStyle: styles.tabItem,
      }}>

      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Search size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ color }) => <Calendar size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    // Adjust bottom spacing based on device
    bottom: Platform.OS === 'ios' ? 30 : 20,
    // Horizontal margin creates the "floating" effect
    marginHorizontal: 20,
    backgroundColor: '#1E293B',
    borderRadius: 35,
    height: 60,
    // Fixes the border issue on some devices
    borderTopWidth: 0,
    // Ensures the bar is elevated and visible
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    // Important: Force icons to stay away from the very edges of the pill
    paddingHorizontal: 10,
  },
  tabItem: {
    // This ensures icons are perfectly centered vertically
    height: -50,
    paddingTop: Platform.OS === 'android' ? 0 : 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});