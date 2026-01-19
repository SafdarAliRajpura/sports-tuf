import LoadingScreen from '@/components/ui/LoadingScreen';
import { Redirect } from 'expo-router';
import React, { useEffect, useState } from 'react';

export default function AppEntry() {
  const [isAppReady, setIsAppReady] = useState(false);

  useEffect(() => {
    // Matches your ArenaPro typewriter duration
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  // 1. Show ONLY the Loading Screen first
  if (!isAppReady) {
    return <LoadingScreen />;
  }

  // 2. Redirect to Onboarding
  // Note: Using replace ensures the user can't "Go Back" to the loading screen
  return <Redirect href="/onboarding" />;
}