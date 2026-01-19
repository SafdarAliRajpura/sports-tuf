import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {/* CRITICAL: index MUST be the first screen listed to play the animation first */}
        <Stack.Screen name="index" /> 
        
        {/* Onboarding Screen */}
        <Stack.Screen name="onboarding" /> 

        {/* Auth Group */}
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/register" />

        {/* Tab Group - Only loads after redirection from Login */}
        <Stack.Screen name="(tabs)" />

        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}