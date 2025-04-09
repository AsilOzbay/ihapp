import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

const TopLosers = () => {
  const [timeframe, setTimeframe] = useState("daily");
  const [losersData, setLosersData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLosers = async (tf) => {
    try {
      setLoading(true);
      const response = await fetch(`https://your-api.com/losers?timeframe=${tf}`);
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
      <Text style={styles.header}>Top 5 {timeframe} Losers</Text>

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
      ) : losers.length === 0 ? (
        <Text style={styles.emptyText}>No data available</Text>
      ) : (
        losers.map((item, index) => (
          <View key={index} style={styles.row}>
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
  negativeChange: { color: "red" },
  emptyText: { fontSize: 16, color: "#555", textAlign: "center", marginTop: 10 },
});

export default TopLosers;
