import { useState, useEffect } from 'react';
import Constants from 'expo-constants';

type Crew = {
  id: string;
  name: string;
  members: number;
};

type AllCrewsResponse = {
  crews: Array<{
    crew_id: number;
    crew_nm: string;
    max: number;
    created_at: string;
    crew_context: string;
    crew_keyword: string | null;
    crew_pic_url: string | null;
    crew_region: any[];
    status: string;
  }>;
  message: string;
};

type MyCrewsResponse = Array<{
  crew_id: number;
  crew_nm: string;
  crew_context: string;
  crew_pic_url: string | null;
  max: number;
  created_at: string;
  status: string;
  crewMembers: any[];
}>;

const API_URL = Constants.expoConfig?.extra?.apiUrl;

export const useCrew = (userId?: string) => {
  const [allCrews, setAllCrews] = useState<Crew[]>([]);
  const [myCrews, setMyCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const mapToCrew = (apiCrew: AllCrewsResponse['crews'][0] | MyCrewsResponse[0]): Crew => ({
    id: apiCrew.crew_id.toString(), // crew_id를 문자열로 변환
    name: apiCrew.crew_nm,
    members: apiCrew.max, // max를 members로 사용
  });

  const fetchAllCrews = async () => {
    try {
      if (!API_URL) {
        throw new Error('API URL is not configured');
      }

      const response = await fetch(`${API_URL}/crew`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch all crews: ${response.status}`);
      }

      const data: AllCrewsResponse = await response.json();
      console.log('All Crews Response:', data);

      if (data && Array.isArray(data.crews)) {
        setAllCrews(data.crews.map(mapToCrew));
      } else {
        throw new Error('Invalid response format for all crews');
      }
    } catch (err: any) {
      console.error('Error fetching all crews:', err);
      setError(err.message || 'Failed to fetch all crews');
      setAllCrews([]);
    }
  };

  const fetchMyCrews = async () => {
    if (!userId) {
      setMyCrews([]);
      return;
    }

    try {
      if (!API_URL) {
        throw new Error('API URL is not configured');
      }

      const response = await fetch(`${API_URL}/users/${userId}/crew`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch my crews: ${response.status}`);
      }

      const data: MyCrewsResponse = await response.json();
      console.log('My Crews Response:', data);

      if (Array.isArray(data)) {
        setMyCrews(data.map(mapToCrew));
      } else {
        throw new Error('Invalid response format for my crews');
      }
    } catch (err: any) {
      console.error('Error fetching my crews:', err);
      setError(err.message || 'Failed to fetch my crews');
      setMyCrews([]);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await Promise.all([fetchAllCrews(), fetchMyCrews()]);
      setLoading(false);
    };

    fetchData();
  }, [userId]);

  return { allCrews, myCrews, loading, error };
};