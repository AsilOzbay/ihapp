import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAuth } from "../context/AuthContext";

const WelcomeBanner = () => {
  const { user } = useAuth();

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        Welcome {user ? user.firstName : "Guest"}!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    width: "100%",
    backgroundColor: "#007bff",
    padding: 15,
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
});

export default WelcomeBanner;
