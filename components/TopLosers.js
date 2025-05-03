import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { API_BASE_URL } from "./env-config";
import { useTheme } from "../context/ThemeContext";

const TopLosers = () => {
  const [timeframe, setTimeframe] = useState("daily");
  const [losersData, setLosersData] = useState([]);
  const [loading, setLoading] = useState(true);

  const { isDarkMode } = useTheme();
  const styles = getStyles(isDarkMode);

  const fetchLosers = async (tf) => {
    try {
      setLoading(true);
      const response = await fetch(`http://${API_BASE_URL}/losers?timeframe=${tf}`);
      const result = await response.json();
      setLosersData(result.data);
    } catch (error) {
      console.error("Error fetching losers:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLosers(timeframe);
  }, [timeframe]);

  const losers = losersData.filter((coin) => coin.change < 0);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Top 5 {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Losers
      </Text>

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={timeframe}
          onValueChange={(itemValue) => setTimeframe(itemValue)}
          style={styles.picker}
          dropdownIconColor={isDarkMode ? "#ccc" : "#333"}
        >
          <Picker.Item label="Daily" value="daily" />
          <Picker.Item label="Weekly" value="weekly" />
          <Picker.Item label="Monthly" value="monthly" />
        </Picker>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" />
      ) : losers.length === 0 ? (
        <Text style={styles.emptyText}>No data available</Text>
      ) : (
        losers.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.cell}>{item.symbol}</Text>
            <Text style={styles.cell}>
              ${item.price ? item.price.toLocaleString() : "N/A"}
            </Text>
            <Text style={[styles.cell, styles.negativeChange]}>
              {item.change ? item.change.toFixed(2) : 0}% 
            </Text>
          </View>
        ))
      )}
    </View>
  );
};

const getStyles = (isDark) =>
  StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: isDark ? "#0f172a" : "#f1f5f9",
      flex: 1,
    },
    header: {
      fontSize: 22,
      fontWeight: "bold",
      marginBottom: 12,
      color: isDark ? "#f8fafc" : "#111",
      textAlign: "center",
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "#334155" : "#ccc",
      paddingBottom: 6,
    },
    pickerWrapper: {
      backgroundColor: isDark ? "#1e293b" : "#fff",
      borderRadius: 10,
      borderWidth: 1,
      borderColor: isDark ? "#475569" : "#ccc",
      marginBottom: 16,
      overflow: "hidden",
    },
    picker: {
      height: 54,
      color: isDark ? "#f8fafc" : "#111",
      paddingHorizontal: 8,
    },
    card: {
      backgroundColor: isDark ? "#1e293b" : "#fff",
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      flexDirection: "row",
      justifyContent: "space-between",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    cell: {
      fontSize: 16,
      fontWeight: "500",
      color: isDark ? "#e2e8f0" : "#222",
      flex: 1,
      textAlign: "center",
    },
    negativeChange: {
      color: "#dc2626",
    },
    emptyText: {
      fontSize: 16,
      color: isDark ? "#cbd5e1" : "#555",
      textAlign: "center",
      marginTop: 10,
    },
  });

export default TopLosers;
