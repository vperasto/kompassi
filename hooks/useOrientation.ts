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

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    let heading = 0;
    let isAbsolute = false;

    // iOS specific property
    if (typeof (event as any).webkitCompassHeading === 'number') {
      heading = (event as any).webkitCompassHeading;
      isAbsolute = true;
    } 
    // Android / Standard
    else if (event.alpha !== null) {
      // alpha is the device's rotation around the z-axis. 
      // It creates a counter-clockwise rotation, so we invert it.
      // Note: Without 'absolute' property or deviceorientationabsolute event, 
      // this is relative to the device's initial position on some Android devices.
      heading = 360 - event.alpha;
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
      // Non-iOS devices usually don't need explicit permission trigger, 
      // but if we are here, we attach the listener.
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