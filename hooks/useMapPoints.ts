import { useState } from 'react';

export const usePoints = () => {
  const [points, setPoints] = useState<Coordinate[]>([]);
  const [isAddingPoints, setIsAddingPoints] = useState(false);

  const handleAddPointsToggle = () => {
    setIsAddingPoints((prev) => {
      if (!prev) {
        setPoints([]); // 켜지는 경우에만 초기화
      }
      return !prev;
    });
  };

  const handleRemoveLastPoint = () => {
    if (points.length === 0) return;
    setPoints((prev) => prev.slice(0, -1));
  };

  const handleMapPress = (e: any, activeFunction: string | null) => {
    if (activeFunction !== 'addPoints') return;
    const newPoint = e.nativeEvent.coordinate;
    setPoints((prev) => [...prev, newPoint]);
  };

  return {
    points,
    setPoints,
    isAddingPoints,
    handleAddPointsToggle,
    handleRemoveLastPoint,
    handleMapPress,
  };
};

// 타입 정의 (MapScreen.tsx로 이동했으므로 여기서는 제거)
interface Coordinate {
  latitude: number;
  longitude: number;
}