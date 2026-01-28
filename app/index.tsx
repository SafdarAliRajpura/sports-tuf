import LoadingScreen from '@/components/ui/LoadingScreen';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { auth } from './config/firebase';

export default function AppEntry() {
  const router = useRouter();

  useEffect(() => {
    // Matches your ArenaPro typewriter duration
    const timer = setTimeout(() => {
      // Check Firebase status after the animation ends
      const user = auth.currentUser;

      if (user) {
        // If logged in, go straight to Home
        router.replace('/(tabs)/home');
      } else {
        // If new user, go to Onboarding
        router.replace('/onboarding');
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  // Show the Loading Screen while the timer runs
  return <LoadingScreen />;
}