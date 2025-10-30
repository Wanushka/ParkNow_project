// app/components/SpotCard.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface Props {
  title: string;
  description: string;
  price: number;
  isAvailable: boolean;
  availableCount?: number;
  capacity?: number;
  onPress?: () => void;
}

const SpotCard: React.FC<Props> = ({ title, description, price, isAvailable, availableCount, capacity, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.title}>{title}</Text>
      <Text numberOfLines={2} style={styles.description}>{description}</Text>
      <Text style={styles.price}>Rs. {price.toFixed(2)} / hour</Text>
      <Text style={[styles.status, { color: isAvailable ? "green" : "red" }]}> 
        {isAvailable ? "Available" : "Not Available"}
      </Text>
      {typeof (availableCount) !== 'undefined' && typeof (capacity) !== 'undefined' && (
        <Text style={styles.countText}>{`${availableCount} / ${capacity} available`}</Text>
      )}
    </TouchableOpacity>
  );
};

export default SpotCard;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    backgroundColor: "#fff",
    elevation: 2,
  },
  title: { fontWeight: "bold", fontSize: 18 },
  description: { color: "#555", marginVertical: 5 },
  price: { fontWeight: "500", color: "#222" },
  status: { fontWeight: "bold", marginTop: 5 },
  countText: { color: '#374151', marginTop: 6, fontSize: 13, fontWeight: '600' },
});
