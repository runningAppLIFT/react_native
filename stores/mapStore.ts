import { create } from 'zustand';
import { Building } from '@/types/building';


type MapStore = {
    region: {
      latitude: number;
      longitude: number;
      latitudeDelta: number;
      longitudeDelta: number;
    } | null;
    polygons: { id: number; coordinates: { latitude: number; longitude: number }[] }[];
    setRegion: (region: MapStore['region']) => void;
    fetchPolygons: (latitude: number, longitude: number) => Promise<void>;
  };
 
  export const useMapStore = create<MapStore>((set) => ({
    region: null,
    polygons: [],
    setRegion: (region) => set({ region }),
    fetchPolygons: async (latitude, longitude) => {
      try {
        const response = await fetch(
          `https://nest-practice-88013499747.asia-northeast2.run.app/bldg/nearby?x=${longitude}&y=${latitude}&radius=200`
        );
        const data: Building[] = await response.json();
 
        // 폴리곤 데이터 변환 및 null 제거
        const polygons = data
          .map((building) => {
            const coordinatesArray = building.bldg_geom.coordinates?.[0]?.[0];
            if (!coordinatesArray || !Array.isArray(coordinatesArray)) return null;
 
            const coordinates = coordinatesArray
              .filter((coord): coord is [number, number] => Array.isArray(coord) && coord.length === 2)
              .map((coord) => ({
                latitude: coord[1],
                longitude: coord[0],
              }));
 
            return { id: building.bldg_id, coordinates };
          })
          .filter(
            (polygon): polygon is { id: number; coordinates: { latitude: number; longitude: number }[] } =>
              polygon !== null
          );
 
        set({ polygons });
      } catch (error) {
        console.error('Error fetching polygons:', error);
      }
    },
  }));



