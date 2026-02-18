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
                
                let geocode: Location.LocationGeocodedAddress[] = [];
                try {
                    geocode = await Location.reverseGeocodeAsync({
                        latitude: currentLocation.coords.latitude,
                        longitude: currentLocation.coords.longitude
                    });
                } catch (geocodeError) {
                    console.warn("Native geocoding failed, trying fallback:", geocodeError);
                    
                    try {
                        // Fallback to OpenStreetMap Nominatim API
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${currentLocation.coords.latitude}&lon=${currentLocation.coords.longitude}&zoom=18&addressdetails=1`,
                            {
                                headers: {
                                    'User-Agent': 'FootballTurfApp/1.0'
                                }
                            }
                        );
                        const data = await response.json();
                        
                        // Map Nominatim data to Expo Location format
                        if (data && data.address) {
                            geocode = [{
                                city: data.address.city || data.address.town || data.address.village,
                                district: data.address.suburb || data.address.neighbourhood,
                                street: data.address.road,
                                region: data.address.state,
                                subregion: data.address.county,
                                country: data.address.country,
                                postalCode: data.address.postcode,
                                name: data.name || data.address.road || data.display_name.split(',')[0], // Use name or road as fallback
                                isoCountryCode: data.address.country_code?.toUpperCase(),
                                timezone: null,
                                streetNumber: data.address.house_number || null,
                                formattedAddress: data.display_name
                            }];
                        }
                    } catch (fallbackError) {
                        console.warn("Fallback geocoding also failed:", fallbackError);
                    }
                }

                // Use the first result if available
                const address = geocode[0];
                const city = address?.city ?? address?.region ?? "Unknown City";
                const area = address?.district ?? address?.name ?? "Current Location";

                setLocation({
                    coords: {
                        latitude: currentLocation.coords.latitude,
                        longitude: currentLocation.coords.longitude
                    },
                    address: {
                        city: city,
                        formatted: address ? `${area}, ${city}` : "Location Found",
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
