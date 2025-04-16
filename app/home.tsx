import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";

import WelcomeBanner from "../components/WelcomeBanner";
import TrendingCoins from "../components/TrendingCoins";
import TopExchanges from "../components/TopExchanges";
import CryptoPricesTable from "../components/CryptoPricesTable";
import RightSidebar from "../components/RightSidebar";

export default function HomeScreen() {
  const { logout, user } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleLogout = async () => {
    setMenuVisible(false);
    await logout();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Ayarlar ikonu */}
      {user && (
        <TouchableOpacity
          style={styles.settingsIcon}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="settings" size={24} color="#374151" />
        </TouchableOpacity>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <WelcomeBanner />
        <Text style={styles.heading}>Crypto Dashboard</Text>
        <Text style={styles.subheading}>
          Follow the market, trade smart, grow your portfolio.
        </Text>

        <View style={styles.row}>
          <TrendingCoins />
          <TopExchanges />
        </View>

        <CryptoPricesTable />

        <View style={styles.sidebar}>
          <RightSidebar />
        </View>
      </ScrollView>

      {/* Menü (Modal) */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menuBox}>
            <TouchableOpacity onPress={handleLogout}>
              <Text style={styles.logout}>Logout</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  scrollContainer: { padding: 16 },
  heading: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1f2937",
    marginBottom: 4,
  },
  subheading: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  row: { flexDirection: "column", gap: 16 },
  sidebar: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  settingsIcon: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: "#e5e7eb",
    padding: 8,
    borderRadius: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 50,
    paddingRight: 20,
  },
  menuBox: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  logout: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },
});
