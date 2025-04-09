import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function RootLayout() {
  return (
    <Tabs
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
    />
  );
}
