import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WelcomeBanner = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error fetching user from storage:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>
        Welcome {user ? user.firstName : "Guest"}!
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: { width: "100%", backgroundColor: "#007bff", padding: 15, alignItems: "center" },
  text: { color: "white", fontSize: 20, fontWeight: "bold" },
});

export default WelcomeBanner;
