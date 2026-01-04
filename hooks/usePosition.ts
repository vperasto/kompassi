import { useState, useEffect } from 'react';

interface PositionState {
  lat: number | null;
  lon: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

export const usePosition = () => {
  const [position, setPosition] = useState<PositionState>({
    lat: null,
    lon: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setPosition(prev => ({ ...prev, error: 'Ei GPS-tukea', loading: false }));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0,
    };

    const handleSuccess = (pos: GeolocationPosition) => {
      setPosition({
        lat: pos.coords.latitude,
        lon: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        error: null,
        loading: false,
      });
    };

    const handleError = (err: GeolocationPositionError) => {
      setPosition(prev => ({
        ...prev,
        error: err.code === 1 ? 'GPS Estetty' : 'Sijaintivirhe',
        loading: false,
      }));
    };

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return position;
};