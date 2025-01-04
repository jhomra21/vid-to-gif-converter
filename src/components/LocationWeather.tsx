import React from 'react';
import { MapPin } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocalStorage } from '../hooks/use-local-storage';

interface LocationData {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface WeatherData {
  temp: number;
  description: string;
  icon: string;
}

interface ApiError {
  message: string;
  status: number;
}

type TempUnit = 'C' | 'F';

const api = {
  location: {
    fetch: async (): Promise<LocationData> => {
      const res = await fetch('https://ipwho.is/');
      if (!res.ok) {
        throw {
          message: 'Failed to fetch location',
          status: res.status,
        } as ApiError;
      }
      const data = await res.json();
      return {
        city: data.city,
        country: data.country_code,
        latitude: data.latitude,
        longitude: data.longitude,
      };
    }
  },
  weather: {
    fetch: async ({ lat, lon }: { lat: number; lon: number }): Promise<WeatherData> => {
      const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!API_KEY) {
        throw {
          message: 'OpenWeather API key not configured',
          status: 500,
        } as ApiError;
      }

      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      
      if (!res.ok) {
        throw {
          message: 'Failed to fetch weather',
          status: res.status,
        } as ApiError;
      }

      const data = await res.json();
      return {
        temp: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
      };
    }
  }
};

const useLocation = () => {
  return useQuery<LocationData, ApiError>({
    queryKey: ['location'],
    queryFn: () => api.location.fetch(),
    staleTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
    refetchOnWindowFocus: false,
  });
};

const useWeather = (location: LocationData | undefined) => {
  return useQuery<WeatherData, ApiError>({
    queryKey: ['weather', location?.latitude, location?.longitude],
    queryFn: () => api.weather.fetch({ 
      lat: location!.latitude, 
      lon: location!.longitude 
    }),
    enabled: !!location,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  });
};

const convertTemp = (celsius: number, unit: TempUnit): number => {
  if (unit === 'C') return celsius;
  return Math.round((celsius * 9/5) + 32);
};

const LocationWeather = () => {
  const [tempUnit, setTempUnit] = useLocalStorage<TempUnit>('tempUnit', 'C');
  const locationQuery = useLocation();
  const weatherQuery = useWeather(locationQuery.data);

  const isLoading = locationQuery.isLoading || weatherQuery.isLoading;
  const isError = locationQuery.isError || weatherQuery.isError;

  const handleToggleUnit = () => {
    setTempUnit(prev => prev === 'C' ? 'F' : 'C');
  };

  if (isLoading) {
    return (
      <div className="hidden sm:flex items-center gap-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-20" />
      </div>
    );
  }

  if (isError || !locationQuery.data || !weatherQuery.data) {
    return null;
  }

  const temp = convertTemp(weatherQuery.data.temp, tempUnit);

  return (
    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-6 text-[10px] sm:text-xs font-mono tracking-tight">
      <div 
        className="flex items-center gap-1.5 px-1.5 sm:px-2 py-1 bg-zinc-100 border border-zinc-200" 
        title="Your location"
      >
        <MapPin className="w-3 h-3" />
        <span className="text-zinc-600 truncate max-w-[120px] sm:max-w-none">
          {locationQuery.data.city}, {locationQuery.data.country}
        </span>
      </div>
      <button
        onClick={handleToggleUnit}
        className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-2 py-1 bg-zinc-100 border border-zinc-200 hover:bg-zinc-200 transition-colors"
        title={`Current weather: ${weatherQuery.data.description} (Click to toggle unit)`}
        aria-label={`Temperature is ${temp}°${tempUnit}. Click to toggle between Celsius and Fahrenheit`}
      >
        <img 
          src={`https://openweathermap.org/img/wn/${weatherQuery.data.icon}.png`}
          alt={weatherQuery.data.description}
          className="w-4 h-4 invert opacity-75"
          loading="lazy"
          width={16}
          height={16}
        />
        <span className="text-zinc-600 tabular-nums">
          {temp}°{tempUnit}
        </span>
      </button>
    </div>
  );
};

export default LocationWeather; 