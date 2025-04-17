import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { API_BASE_URL } from "./env-config";

const DetailsScreen = ({ crypto, onBack, onTrade }) => {
  const [chartData, setChartData] = useState(null);
  const [loadingChart, setLoadingChart] = useState(true);
  const [timeframe] = useState("1M");

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch(
          `http://${API_BASE_URL}/graph-data/${crypto.symbol}?timeframe=${timeframe}`
        );
        const data = await response.json();

        setChartData({
          labels: data.map((point) => point.time),
          datasets: [{ data: data.map((point) => point.price) }],
        });
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoadingChart(false);
      }
    };

    fetchGraphData();
  }, [crypto.symbol, timeframe]);

  if (!crypto) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{crypto.symbol} Details</Text>

      {/* Chart Section */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartLabel}>Price History ({timeframe})</Text>
        {loadingChart ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : chartData ? (
          <LineChart
            data={chartData}
            width={Dimensions.get("window").width - 30}
            height={220}
            fromZero
            verticalLabelRotation={90} // Dikey X ekseni etiketleri
            chartConfig={{
              backgroundGradientFrom: "#ffffff",
              backgroundGradientTo: "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 123, 255, ${opacity})`,
              labelColor: () => "#555",
              propsForDots: { r: "3", strokeWidth: "1", stroke: "#007bff" },
              propsForLabels: { fontSize: 10 },
            }}
            style={{ borderRadius: 8, marginVertical: 8 }}
          />
        ) : (
          <Text style={styles.chartError}>Chart data not available.</Text>
        )}
      </View>

      {/* Details */}
      <View style={styles.detailBox}>
        <Text style={styles.label}>Current Price:</Text>
        <Text style={styles.value}>${crypto.price?.toLocaleString()}</Text>

        <Text style={styles.label}>24H Change:</Text>
        <Text style={[styles.value, +crypto.dailyChange > 0 ? styles.green : styles.red]}>
          {crypto.dailyChange?.toFixed(2)}%
        </Text>

        <Text style={styles.label}>High (24h):</Text>
        <Text style={styles.value}>${crypto.highPrice?.toLocaleString()}</Text>

        <Text style={styles.label}>Low (24h):</Text>
        <Text style={styles.value}>${crypto.lowPrice?.toLocaleString()}</Text>

        <Text style={styles.label}>Volume:</Text>
        <Text style={styles.value}>{crypto.volume?.toLocaleString()}</Text>

        <Text style={styles.label}>Market Cap:</Text>
        <Text style={styles.value}>${crypto.mktCap?.toLocaleString()}</Text>
      </View>

      {/* 🚀 Trade Butonu */}
      <TouchableOpacity
  style={styles.tradeButton}
  onPress={() => onTrade(crypto)}
>
  <Text style={styles.tradeButtonText}>Trade</Text>
</TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff" },
  backButton: { marginBottom: 15 },
  backButtonText: { color: "#007bff", fontSize: 16 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },

  chartContainer: { marginBottom: 20, alignItems: "center" },
  chartLabel: { fontSize: 16, fontWeight: "bold", marginBottom: 10, textAlign: "center" },
  chartError: { fontSize: 14, color: "#888", textAlign: "center", marginTop: 10 },

  detailBox: { backgroundColor: "#f9f9f9", padding: 15, borderRadius: 8 },
  label: { fontSize: 14, fontWeight: "600", marginTop: 10 },
  value: { fontSize: 16, marginTop: 4 },
  green: { color: "green" },
  red: { color: "red" },

  tradeButton: {
    marginTop: 20,
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  tradeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DetailsScreen;
