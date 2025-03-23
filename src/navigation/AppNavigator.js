import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import HomeScreen from "../screens/HomeScreen";
import PortfolioScreen from "../screens/PortfolioScreen";
import AuthScreen from "../screens/AuthScreen";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="PortfolioScreen" component={PortfolioScreen} />
        <Stack.Screen name="TradeScreen" component={TradeScreen} />
        <Stack.Screen name="AuthScreen" component={AuthScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
