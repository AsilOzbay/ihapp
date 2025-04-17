import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { API_BASE_URL } from "./env-config";
const TopGainers = () => {
  const [timeframe, setTimeframe] = useState("daily");
  const [gainersData, setGainersData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGainers = async (tf) => {
    try {
      setLoading(true);
      const response = await fetch(`http://${API_BASE_URL}/gainers?timeframe=${tf}`);
      const result = await response.json();
      setGainersData(result.data);
    } catch (error) {
      console.error("Error fetching gainers:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGainers(timeframe);
  }, [timeframe]);

  const gainers = gainersData.filter((coin) => coin.change > 0);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Top 5 {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)} Gainers</Text>

      <Picker
        selectedValue={timeframe}
        onValueChange={(itemValue) => setTimeframe(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Daily" value="daily" />
        <Picker.Item label="Weekly" value="weekly" />
        <Picker.Item label="Monthly" value="monthly" />
      </Picker>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : gainers.length === 0 ? (
        <Text style={styles.emptyText}>No data available</Text>
      ) : (
        gainers.map((item, index) => (
          <View key={index} style={styles.row}>
            <Text style={styles.cell}>{item.symbol}</Text>
            <Text style={styles.cell}>
              ${item.price ? item.price.toLocaleString() : "N/A"}
            </Text>
            <Text style={[styles.cell, styles.positiveChange]}>
              {item.change ? item.change.toFixed(2) : 0}%
            </Text>
          </View>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: "#f9f9f9", alignItems: "center" },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "#333" },
  picker: { width: "100%", backgroundColor: "#ddd", marginBottom: 10 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    width: "100%",
  },
  cell: { fontSize: 16, color: "#222", flex: 1, textAlign: "center" },
  positiveChange: { color: "green" },
  emptyText: { fontSize: 16, color: "#555", textAlign: "center", marginTop: 10 },
});

export default TopGainers;
