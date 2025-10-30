// src/types/types.ts
export interface Spot {
  id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  is_available: boolean;
  price_per_hour: number;
}
