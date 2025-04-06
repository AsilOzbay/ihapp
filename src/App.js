import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons"; // Eğer Expo kullanıyorsan bu kütüphane ikonlar için gerekli

import Home from "./screens/HomeScreen";
import Portfolio from "./screens/PortfolioScreen";
import LearningHub from "./screens/LearningHubScreen";
import Auth from "./screens/AuthScreen";

//deneme

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Portfolio") {
            iconName = "briefcase";
          } else if (route.name === "LearningHub") {
            iconName = "school";
          } else if (route.name === "Auth") {
            iconName = "log-in";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#2563EB", // Aktif sayfanın rengi
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Portfolio" component={Portfolio} />
      <Tab.Screen name="LearningHub" component={LearningHub} />
      <Tab.Screen name="Auth" component={Auth} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
