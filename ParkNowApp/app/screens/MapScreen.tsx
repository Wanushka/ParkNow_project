import React, { useEffect, useState, useRef } from "react";
import { View, StyleSheet, PermissionsAndroid, Platform } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { getSpots } from "../../src/api/api";

const MapScreen = ({ navigation }: any) => {
  const [spots, setSpots] = useState<any[]>([]);
  const mapRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const fetchSpots = async () => {
      const res = await getSpots();
      setSpots(res.data);
    };
    fetchSpots();
  }, []);

  useEffect(() => {
    const requestAndroidPermission = async () => {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Location Permission",
          message: "ParkNow needs access to your location to show it on the map.",
          buttonPositive: "OK",
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    };

    const startWatching = async () => {
      if (Platform.OS === "android") {
        const ok = await requestAndroidPermission();
        if (!ok) return;
      }

      // get current position and center map
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          mapRef.current?.animateToRegion(
            {
              latitude,
              longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            },
            800
          );
        },
        (err) => {
          // silent fail — keep existing behavior
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
      );

      // watch position and update map region as user moves
      const id = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          mapRef.current?.animateToRegion(
            {
              latitude,
              longitude,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            },
            500
          );
        },
        () => {},
        { enableHighAccuracy: true, distanceFilter: 10, maximumAge: 10000 } as any
      );

      watchIdRef.current = id as unknown as number;
    };

    startWatching();

    return () => {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current as any);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude: 6.9271,
          longitude: 79.8612,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation={true}
        followsUserLocation={true}
        showsMyLocationButton={true}
      >
        {spots.map((spot) => {
          const latitude = typeof spot.latitude === "string" ? parseFloat(spot.latitude) : spot.latitude;
          const longitude = typeof spot.longitude === "string" ? parseFloat(spot.longitude) : spot.longitude;

          const avail = typeof spot.available_count === 'number' ? Number(spot.available_count) : (spot.is_available ? 1 : 0);
          return (
            <Marker
              key={spot.id}
              coordinate={{ latitude: isNaN(latitude as number) ? 0 : (latitude as number), longitude: isNaN(longitude as number) ? 0 : (longitude as number) }}
              title={spot.title}
              description={spot.description}
              pinColor={avail > 0 ? "green" : "red"}
              onPress={() => navigation.navigate("SpotDetail", { spot })}
            />
          );
        })}
      </MapView>
    </View>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
});
