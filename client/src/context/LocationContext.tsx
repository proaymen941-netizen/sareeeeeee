import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LocationState {
  position: GeolocationPosition | null;
  hasPermission: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LocationContextType {
  location: LocationState;
  requestPermission: () => void;
  getCurrentLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationState>({
    position: null,
    hasPermission: false,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    if ('permissions' in navigator && navigator.permissions?.query) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        if (permission.state === 'granted') {
          setLocation(prev => ({ ...prev, hasPermission: true }));
          getCurrentLocation();
        }
      } catch (error: any) {
        // Permissions query may not be supported or restricted in iframe
        console.warn('Permissions query notice:', error?.message || error);
      }
    }
  };

  const requestPermission = () => {
    getCurrentLocation();
  };

  const getCurrentLocation = () => {
    if (!('geolocation' in navigator) || !navigator.geolocation) {
      setLocation(prev => ({ 
        ...prev, 
        error: 'الموقع الجغرافي غير مدعوم في هذا المتصفح' 
      }));
      return;
    }

    setLocation(prev => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          position,
          hasPermission: true,
          isLoading: false,
          error: null,
        });
      },
      (error: GeolocationPositionError) => {
        let errorMessage = 'تعذر الحصول على الموقع بدقة';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'تم رفض الإذن للوصول للموقع';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'الموقع غير متاح حالياً';
            break;
          case error.TIMEOUT:
            errorMessage = 'انتهت مهلة الحصول على الموقع';
            break;
        }

        console.warn('LocationContext geolocation status:', errorMessage);

        setLocation(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
          hasPermission: false,
        }));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  return (
    <LocationContext.Provider value={{ location, requestPermission, getCurrentLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useUserLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useUserLocation must be used within a LocationProvider');
  }
  return context;
}