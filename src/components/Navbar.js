import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    // AsyncStorage'dan kullanıcı bilgilerini al
    const fetchUser = async () => {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setUser(null);
    navigation.navigate("AuthScreen"); // Çıkış sonrası login ekranına yönlendir
  };

  return (
    <View style={styles.navbar}>
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: "https://i.hizliresim.com/bmkwbe4.png" }}
          style={styles.logo}
        />
        <Text style={styles.title}>INVESTING HUB v2</Text>
      </View>

      <View style={styles.menu}>
        <TouchableOpacity onPress={() => navigation.navigate("HomeScreen")}>
          <Text style={styles.link}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("PortfolioScreen")}>
          <Text style={styles.link}>Portfolio</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate("LearningHubScreen")}>
          <Text style={styles.link}>Learning Hub</Text>
        </TouchableOpacity>

        {user ? (
          <View style={styles.userContainer}>
            <Text style={styles.userText}>{user.firstName} {user.lastName}</Text>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logout}>Logout</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate("AuthScreen")}>
            <Text style={styles.link}>Login/Register</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#222",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
  },
  menu: {
    flexDirection: "row",
    alignItems: "center",
  },
  link: {
    color: "white",
    fontSize: 16,
    marginHorizontal: 10,
  },
  userContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10,
  },
  userText: {
    color: "#ddd",
    marginRight: 10,
  },
  logout: {
    color: "red",
    fontSize: 16,
  },
});
