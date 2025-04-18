import React, { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

function SplashScreen() {
  return (
    <View style={styles.splashContainer}>
      <Text style={styles.splashText}>INVESTING HUB</Text>
    </View>
  );
}

function LayoutTabs() {
  const { user, loading } = useAuth();
  const [splashVisible, setSplashVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashVisible(false);
    }, 3000); // 3 saniyelik splash ekran

    return () => clearTimeout(timer);
  }, []);

  if (loading || splashVisible) {
    return <SplashScreen />;
  }

  return (
    <Tabs
      key={user ? "logged-in" : "guest"}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "home") iconName = "home";
          else if (route.name === "portfolio") iconName = "briefcase";
          else if (route.name === "learning-hub") iconName = "school";
          else if (route.name === "auth") iconName = "log-in";
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "gray",
        headerShown: true,
      })}
    >
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="home" />
      <Tabs.Screen name="portfolio" />
      <Tabs.Screen name="learning-hub" />
      {!user && <Tabs.Screen name="auth" />}
    </Tabs>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <LayoutTabs />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  splashText: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 2,
  },
});
