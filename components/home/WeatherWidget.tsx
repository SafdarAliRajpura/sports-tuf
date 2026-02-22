import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Cloud, Sun, CloudRain, Wind, CloudLightning, Snowflake } from 'lucide-react-native';
import { useUserLocation } from '@/hooks/useUserLocation';

interface WeatherData {
  temp: number;
  code: number; // WMO Weather interpretation code
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const { location } = useUserLocation();

  useEffect(() => {
    const fetchWeather = async () => {
      if (!location) return;

      try {
        const { latitude, longitude } = location.coords;
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
        );
        const data = await response.json();
        
        if (data.current_weather) {
          setWeather({
            temp: Math.round(data.current_weather.temperature),
            code: data.current_weather.weathercode
          });
        }
      } catch (error) {
        console.log('Error fetching weather:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]); // Re-fetch when location changes

  const getWeatherIcon = (code: number) => {
    // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
    if (code === 0 || code === 1) return <Sun color="#FDB813" size={18} fill="#FDB813" />; // Clear
    if (code === 2 || code === 3) return <Cloud color="#94A3B8" size={18} />; // Cloudy
    if (code >= 45 && code <= 48) return <Wind color="#94A3B8" size={18} />; // Fog
    if (code >= 51 && code <= 67) return <CloudRain color="#60A5FA" size={18} />; // Drizzle/Rain
    if (code >= 71 && code <= 77) return <Snowflake color="#FFFFFF" size={18} />; // Snow
    if (code >= 80 && code <= 82) return <CloudRain color="#60A5FA" size={18} />; // Showers
    if (code >= 95 && code <= 99) return <CloudLightning color="#F59E0B" size={18} />; // Thunderstorm
    
    return <Sun color="#FDB813" size={18} />;
  };

  if (loading || !weather) return null;

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        {getWeatherIcon(weather.code)}
      </View>
      <Text style={styles.tempText}>{weather.temp}°</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)', // Slightly more visible bg
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: 8, 
    height: 36, // Fixed height to match icons
  },
  iconContainer: {
    marginRight: 4
  },
  tempText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  }
});
