// ✅ RootLayout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { View, ActivityIndicator } from "react-native";

function LayoutTabs() {
  const { user, loading } = useAuth();

  if (loading) return <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}><ActivityIndicator size="large" /></View>;

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
