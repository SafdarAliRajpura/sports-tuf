import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

export interface LocationData {
    coords: {
        latitude: number;
        longitude: number;
    };
    address?: {
        city?: string | null;
        region?: string | null;
        district?: string | null;
        name?: string | null;
        formatted?: string | null;
    };
}

export function useUserLocation() {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMsg('Permission to access location was denied');
                    setLoading(false);
                    return;
                }

                let currentLocation = await Location.getCurrentPositionAsync({});

                let geocode = await Location.reverseGeocodeAsync({
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude
                });

                // Use the first result
                const address = geocode[0];
                const city = address?.city ?? address?.subregion ?? "Unknown City";
                const area = address?.district ?? address?.name ?? "Current Location";

                setLocation({
                    coords: {
                        latitude: currentLocation.coords.latitude,
                        longitude: currentLocation.coords.longitude
                    },
                    address: {
                        city: city,
                        formatted: `${area}, ${city}`,
                        name: address?.name,
                        district: address?.district,
                        region: address?.region,
                    }
                });
            } catch (error) {
                setErrorMsg('Error fetching location');
                console.error(error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    return { location, errorMsg, loading };
}
