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
      {user && (
        <TouchableOpacity
          style={styles.settingsIcon}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="settings" size={24} color="#374151" />
        </TouchableOpacity>
      )}

      <View style={styles.newsButtonWrapper}>
        <RightSidebar />
      </View>

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
      </ScrollView>

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
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 60,
  },
  heading: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1e3a8a",
    marginBottom: 4,
  },
  subheading: {
    fontSize: 15,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 16,
  },
  row: {
    flexDirection: "column",
    gap: 16,
  },
  settingsIcon: {
    position: "absolute",
    top: 18,
    right: 18,
    zIndex: 10,
    backgroundColor: "#e2e8f0",
    padding: 10,
    borderRadius: 50,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 60,
    paddingRight: 20,
  },
  menuBox: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 6,
    minWidth: 160,
  },
  logout: {
    color: "#ef4444",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "right",
  },
  newsButtonWrapper: {
    position: "absolute",
    top: 66,
    right: 20,
    zIndex: 10,
    transform: [{ scale: 0.9 }],
  },

});
