import { useState, useEffect, useCallback, useRef } from 'react';
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
  
  // Track if we have received an absolute event to prevent fallback jitter
  const hasAbsoluteRef = useRef(false);

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

  // Handler for iOS and standard DeviceOrientation
  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    // If we are already receiving better data from 'deviceorientationabsolute', ignore standard event on Android
    // iOS doesn't fire absolute event, so it continues here.
    if (hasAbsoluteRef.current && !(event as any).webkitCompassHeading) {
      return;
    }

    let heading = 0;
    let isAbsolute = false;

    // iOS specific property (Webkit) - Always Absolute
    if (typeof (event as any).webkitCompassHeading === 'number') {
      heading = (event as any).webkitCompassHeading;
      // iOS usually accounts for orientation in webkitCompassHeading, but sometimes needs adjustment
      // depending on the exact iOS version/browser. For most consistency, we add the offset here
      // matching the logic that landscape rotates the view.
      heading = heading + getOrientationOffset(); 
      isAbsolute = true;
    } 
    // Standard Fallback (likely relative on modern Android Chrome)
    else if (event.alpha !== null) {
      heading = 360 - event.alpha;
      // Compensate for screen orientation
      heading -= getOrientationOffset();
      
      if ((event as any).absolute) {
        isAbsolute = true;
      }
    }

    // Normalize
    heading = heading % 360;
    if (heading < 0) heading += 360;

    setCompassState({
      heading,
      accuracy: (event as any).webkitCompassAccuracy || 0,
      isAbsolute,
    });
  }, []);

  // Handler specifically for Android Absolute Orientation
  const handleAbsoluteOrientation = useCallback((event: DeviceOrientationEvent) => {
    if (event.alpha !== null) {
      hasAbsoluteRef.current = true;
      
      // Calculate heading
      let heading = 360 - event.alpha;
      
      // Critical: Subtract screen orientation
      heading -= getOrientationOffset();

      // Normalize
      heading = heading % 360;
      if (heading < 0) heading += 360;

      setCompassState({
        heading,
        accuracy: (event as any).webkitCompassAccuracy || 0,
        isAbsolute: true, // This event is always absolute
      });
    }
  }, []);

  const requestAccess = async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === 'granted') {
          setPermission({ granted: true, required: true });
          startListeners();
        } else {
          setError('Lupa evätty. Salli anturit asetuksista.');
        }
      } catch (e) {
        setError('Virhe lupaa pyydettäessä.');
        console.error(e);
      }
    } else {
      setPermission({ granted: true, required: false });
      startListeners();
    }
  };

  const startListeners = () => {
    // Standard/iOS
    window.addEventListener('deviceorientation', handleOrientation, true);
    
    // Android Absolute (Chrome 50+)
    if ('ondeviceorientationabsolute' in window) {
      window.addEventListener('deviceorientationabsolute' as any, handleAbsoluteOrientation, true);
    }
  };

  useEffect(() => {
    if (permission.granted) {
      startListeners();
    }
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
      if ('ondeviceorientationabsolute' in window) {
        window.removeEventListener('deviceorientationabsolute' as any, handleAbsoluteOrientation);
      }
    };
  }, [permission.granted, handleOrientation, handleAbsoluteOrientation]);

  return {
    heading: compassState.heading,
    isAbsolute: compassState.isAbsolute,
    permissionGranted: permission.granted,
    permissionRequired: permission.required,
    requestAccess,
    error,
  };
};