// app/components/MapMarker.tsx
import React from "react";
import { Marker } from "react-native-maps";

interface Props {
  spot: {
    id: number;
    title: string;
    description: string;
    latitude: number | string;
    longitude: number | string;
    is_available: boolean;
  };
  onPress?: () => void;
}

const MapMarker: React.FC<Props> = ({ spot, onPress }) => {
  const latitude = typeof spot.latitude === "string" ? parseFloat(spot.latitude) : spot.latitude;
  const longitude = typeof spot.longitude === "string" ? parseFloat(spot.longitude) : spot.longitude;

  return (
    <Marker
      coordinate={{
        latitude: isNaN(latitude as number) ? 0 : (latitude as number),
        longitude: isNaN(longitude as number) ? 0 : (longitude as number),
      }}
      title={spot.title}
      description={spot.description}
      pinColor={spot.is_available ? "green" : "red"}
      onPress={onPress}
    />
  );
};

export default MapMarker;
