// app/components/LoadingSpinner.tsx
import React from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";

const LoadingSpinner = ({ text = "Loading..." }: { text?: string }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007BFF" />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

export default LoadingSpinner;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    marginTop: 10,
    fontSize: 16,
    color: "#555",
  },
});
