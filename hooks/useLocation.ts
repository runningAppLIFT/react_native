import { useEffect } from 'react';
import * as Location from 'expo-location';

export const useLocation = (setRegion: (region: Region) => void) => {
  useEffect(() => {
    async function getCurrentLocation() {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.02,
      });
    }
    getCurrentLocation();
  }, [setRegion]);
};

// 타입 정의 (MapScreen.tsx로 이동했으므로 여기서는 제거)
interface Coordinate {
  latitude: number;
  longitude: number;
}

interface Region extends Coordinate {
  latitudeDelta: number;
  longitudeDelta: number;
}