import { useState, useEffect, useCallback } from 'react';
import { CompassState, PermissionState } from '../types';

export const useOrientation = () => {
  const [compassState, setCompassState] = useState<CompassState>({
    heading: 0,
    accuracy: 0,
    isAbsolute: false,
  });

  const [permission, setPermission] = useState<PermissionState>({
    granted: false,
    required: false,
  });

  const [error, setError] = useState<string | null>(null);

  // Check if permission is required (iOS 13+)
  useEffect(() => {
    const isIOS =
      typeof (DeviceOrientationEvent as any).requestPermission === 'function';
    setPermission((prev) => ({ ...prev, required: isIOS, granted: !isIOS }));
  }, []);

  const getOrientationOffset = () => {
    // Check screen orientation to compensate for Landscape/Portrait modes
    if (window.screen?.orientation?.angle !== undefined) {
      return window.screen.orientation.angle;
    }
    if (typeof window.orientation === 'number') {
      return window.orientation;
    }
    return 0;
  };

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let heading = 0;
    let isAbsolute = false;

    // iOS specific property (Webkit)
    if (typeof (event as any).webkitCompassHeading === 'number') {
      heading = (event as any).webkitCompassHeading;
      // iOS usually handles screen orientation internally in this property, 
      // but sometimes adding window.orientation is needed depending on version.
      // Usually keeping it as is works best for iOS.
      heading = heading + getOrientationOffset(); 
      isAbsolute = true;
    } 
    // Android / Standard
    else if (event.alpha !== null) {
      // alpha is the device's rotation around the z-axis.
      // 0 is North, increasing counter-clockwise on Android usually.
      heading = 360 - event.alpha;
      
      // Critical: Compensate for screen orientation (Portrait vs Landscape)
      // This fixes the 90-degree error often seen when pointing South but showing West.
      heading -= getOrientationOffset();

      if ((event as any).absolute) {
        isAbsolute = true;
      }
    }

    // Normalize to 0-360
    heading = heading % 360;
    if (heading < 0) heading += 360;

    setCompassState({
      heading,
      accuracy: (event as any).webkitCompassAccuracy || 0,
      isAbsolute,
    });
  }, []);

  const requestAccess = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setPermission({ granted: true, required: true });
          window.addEventListener('deviceorientation', handleOrientation);
        } else {
          setError('Lupa evätty. Salli anturit asetuksista.');
        }
      } catch (e) {
        setError('Virhe lupaa pyydettäessä.');
        console.error(e);
      }
    } else {
      setPermission({ granted: true, required: false });
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
  };

  useEffect(() => {
    if (permission.granted) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [permission.granted, handleOrientation]);

  return {
    heading: compassState.heading,
    isAbsolute: compassState.isAbsolute,
    permissionGranted: permission.granted,
    permissionRequired: permission.required,
    requestAccess,
    error,
  };
};