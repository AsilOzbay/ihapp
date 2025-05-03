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
import { useTheme } from "../context/ThemeContext";

const DetailsScreen = ({ crypto, onBack, onTrade }) => {
  const [chartData, setChartData] = useState(null);
  const [loadingChart, setLoadingChart] = useState(true);
  const [timeframe] = useState("1M");
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch(
          `http://${API_BASE_URL}/graph-data/${crypto.symbol}?timeframe=${timeframe}`
        );
        const data = await response.json();
        setChartData({
          labels: Array(data.length).fill(""),
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

  const styles = getStyles(isDarkMode);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{crypto.symbol} Details</Text>

      <View style={styles.chartContainer}>
        <Text style={styles.chartLabel}>Price History ({timeframe})</Text>
        {loadingChart ? (
          <ActivityIndicator size="large" color="#3b82f6" />
        ) : chartData ? (
          <LineChart
            data={chartData}
            width={Dimensions.get("window").width - 40}
            height={220}
            fromZero
            withHorizontalLabels
            withVerticalLabels
            withInnerLines
            withOuterLines={false}
            verticalLabelRotation={0}
            chartConfig={{
              backgroundGradientFrom: isDarkMode ? "#1e293b" : "#ffffff",
              backgroundGradientTo: isDarkMode ? "#0f172a" : "#ffffff",
              decimalPlaces: 0,
              color: (opacity = 1) =>
                isDarkMode
                  ? `rgba(96, 165, 250, ${opacity})`
                  : `rgba(0, 123, 255, ${opacity})`,
              labelColor: () => (isDarkMode ? "#f1f5f9" : "#555"),
              propsForDots: { r: "3", strokeWidth: "1", stroke: "#3b82f6" },
              propsForLabels: { fontSize: 10 },
            }}
            style={{ borderRadius: 8 }}
          />
        ) : (
          <Text style={styles.chartError}>Chart data not available.</Text>
        )}
      </View>

      <View style={styles.detailBox}>
        <Text style={styles.label}>Current Price:</Text>
        <Text style={styles.value}>${crypto.price?.toLocaleString()}</Text>

        <Text style={styles.label}>24H Change:</Text>
        <Text
          style={[
            styles.value,
            +crypto.dailyChange > 0 ? styles.green : styles.red,
          ]}
        >
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

      <TouchableOpacity
        style={styles.tradeButton}
        onPress={() => onTrade(crypto)}
      >
        <Text style={styles.tradeButtonText}>Trade</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const getStyles = (isDark) =>
  StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: isDark ? "#0f172a" : "#f8fafc",
    },
    backButton: {
      marginBottom: 15,
      alignSelf: "flex-start",
      backgroundColor: isDark ? "#1e293b" : "#e2e8f0",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
    },
    backButtonText: {
      color: isDark ? "#93c5fd" : "#1e40af",
      fontSize: 16,
      fontWeight: "bold",
    },
    title: {
      fontSize: 26,
      fontWeight: "bold",
      marginBottom: 20,
      textAlign: "center",
      color: isDark ? "#f1f5f9" : "#0f172a",
    },
    chartContainer: {
      marginBottom: 24,
      backgroundColor: isDark ? "#1e293b" : "#fff",
      padding: 12,
      borderRadius: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
      alignItems: "center",
    },
    chartLabel: {
      fontSize: 16,
      fontWeight: "600",
      marginBottom: 12,
      textAlign: "center",
      color: isDark ? "#e2e8f0" : "#334155",
    },
    chartError: {
      fontSize: 14,
      color: isDark ? "#94a3b8" : "#888",
      textAlign: "center",
      marginTop: 10,
    },
    detailBox: {
      backgroundColor: isDark ? "#1e293b" : "#ffffff",
      padding: 16,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 1,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      marginTop: 12,
      color: isDark ? "#cbd5e1" : "#475569",
    },
    value: {
      fontSize: 16,
      marginTop: 4,
      color: isDark ? "#f8fafc" : "#0f172a",
    },
    green: {
      color: "#16a34a",
    },
    red: {
      color: "#dc2626",
    },
    tradeButton: {
      marginTop: 24,
      backgroundColor: "#2563eb",
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 3,
    },
    tradeButtonText: {
      color: "#ffffff",
      fontSize: 18,
      fontWeight: "bold",
    },
  });

export default DetailsScreen;
