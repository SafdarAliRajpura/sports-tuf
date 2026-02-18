import LoadingScreen from '@/components/ui/LoadingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';

export default function AppEntry() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Simple artificial delay for the splash animation
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const userInfo = await AsyncStorage.getItem('userInfo');
        if (userInfo) {
           router.replace('/(tabs)/home');
        } else {
           router.replace('/onboarding');
        }
      } catch (e) {
         router.replace('/onboarding');
      }
    };
    
    checkSession();
  }, []);

  // Show the Loading Screen while the timer runs
  return <LoadingScreen />;
}