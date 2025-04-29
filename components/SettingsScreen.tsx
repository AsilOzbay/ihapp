// components/SettingsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../components/env-config";

const availableCoins = [
  "BTC", "ETH", "BNB", "XRP", "ADA", "SOL", "DOGE", "MATIC", "DOT", "SHIB",
  "LTC", "AVAX", "TRX", "ATOM", "LINK", "BCH", "XLM", "NEAR", "ETC", "FIL"
];

const SettingsScreen = ({ onBack }: { onBack: () => void }) => {
  const { user } = useAuth();
  const [selectedCoins, setSelectedCoins] = useState<string[]>([]);

  useEffect(() => {
    const loadSettings = async () => {
      if (user) {
        try {
          const res = await axios.get(`http://${API_BASE_URL}/settings/${user.id}`);
          if (res.data.selectedCoins) {
            setSelectedCoins(res.data.selectedCoins);
          }
        } catch (err) {
          console.error("Error loading user settings:", err);
        }
      } else {
        const stored = await AsyncStorage.getItem("guest_selectedCoins");
        if (stored) setSelectedCoins(JSON.parse(stored));
      }
    };
    loadSettings();
  }, [user]);

  const toggleCoin = (symbol: string) => {
    setSelectedCoins((prev) =>
      prev.includes(symbol)
        ? prev.filter((c) => c !== symbol)
        : [...prev, symbol]
    );
  };

  const saveSettings = async () => {
    if (user) {
      try {
        await axios.put(`http://${API_BASE_URL}/settings/${user.id}`, { selectedCoins });
      } catch (err) {
        console.error("Error saving settings:", err);
      }
    } else {
      await AsyncStorage.setItem("guest_selectedCoins", JSON.stringify(selectedCoins));
    }
    onBack();
  };

  const handleSelectAll = () => {
    setSelectedCoins([...availableCoins]);
  };

  const handleClearAll = () => {
    setSelectedCoins([]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Select Your Favorite Coins</Text>

        {/* Select All / Clear All Buttons */}
        <View style={styles.actionsRow}>
          <TouchableOpacity onPress={handleSelectAll} style={styles.selectButton}>
            <Text style={styles.selectButtonText}>Select All</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClearAll} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>

        {/* Coin List */}
        <View style={styles.coinsGrid}>
          {availableCoins.map((coin) => (
            <TouchableOpacity
              key={coin}
              onPress={() => toggleCoin(coin)}
              style={[styles.coinBox, selectedCoins.includes(coin) && styles.selectedCoinBox]}
            >
              <Text
                style={[styles.coinText, selectedCoins.includes(coin) && styles.selectedCoinText]}
              >
                {coin}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={saveSettings} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  scrollContainer: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  actionsRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 16 },
  selectButton: {
    backgroundColor: "#22c55e",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  clearButton: {
    backgroundColor: "#ef4444",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  selectButtonText: { color: "white", fontWeight: "bold" },
  clearButtonText: { color: "white", fontWeight: "bold" },
  coinsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "center",
  },
  coinBox: {
    backgroundColor: "#e5e7eb",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  selectedCoinBox: { backgroundColor: "#2563EB" },
  coinText: { fontSize: 16, color: "#1f2937" },
  selectedCoinText: { color: "white", fontWeight: "bold" },
  backButton: { marginBottom: 20, alignSelf: "flex-start", padding: 10 },
  backButtonText: { fontSize: 16, color: "#2563EB" },
  saveButton: {
    backgroundColor: "#2563EB",
    padding: 14,
    borderRadius: 10,
    marginTop: 30,
    alignItems: "center",
  },
  saveButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
});

export default SettingsScreen;
