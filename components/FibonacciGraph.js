import React, { useState, useEffect } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";

const FibonacciGraph = ({ cryptoSymbol }) => {
  const [timeframe, setTimeframe] = useState("7"); // Varsayılan: 1 Hafta
  const [ohlcData, setOhlcData] = useState([]); // OHLC verileri
  const [labels, setLabels] = useState([]);
  const [fibonacciLevels, setFibonacciLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cryptoSymbol) {
      setError("Invalid cryptocurrency symbol.");
      return;
    }

    const fetchFibonacciData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://your-api.com/api/fibonacci/${cryptoSymbol}/${timeframe}`);
        if (!response.ok) {
          throw new Error("Failed to fetch Fibonacci data from backend.");
        }

        const { marketChart } = await response.json();
        console.log("Fetched marketChart:", marketChart);

        // Candlestick verilerini ayıkla
        const ohlc = marketChart.prices.map(([timestamp, close], index, arr) => {
          const open = index === 0 ? close : arr[index - 1][1]; // Open = Önceki Close
          const high = Math.max(open, close);
          const low = Math.min(open, close);
          return { x: new Date(timestamp), o: open, h: high, l: low, c: close };
        });

        setOhlcData(ohlc.map((entry) => entry.c)); // Sadece kapanış fiyatları
        setLabels(ohlc.map((entry) => entry.x.toLocaleDateString("en-US")));

        // Fibonacci seviyelerini hesapla
        const high = Math.max(...ohlc.map((entry) => entry.h));
        const low = Math.min(...ohlc.map((entry) => entry.l));

        setFibonacciLevels([
          { label: "0% (High)", value: high },
          { label: "23.6%", value: high - (high - low) * 0.236 },
          { label: "38.2%", value: high - (high - low) * 0.382 },
          { label: "50.0%", value: high - (high - low) * 0.5 },
          { label: "61.8%", value: high - (high - low) * 0.618 },
          { label: "78.6%", value: high - (high - low) * 0.786 },
          { label: "100% (Low)", value: low },
        ]);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching Fibonacci data:", error);
        setError(error.message || "Something went wrong.");
        setLoading(false);
      }
    };

    fetchFibonacciData();
  }, [cryptoSymbol, timeframe]);

  if (loading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text style={styles.errorText}>Error: {error}</Text>;

  return (
    <ScrollView style={styles.container}>
      {/* Zaman Dilimi Seçici */}
      <View style={styles.timeframeContainer}>
        {["1", "7", "30", "365"].map((tf) => (
          <TouchableOpacity
            key={tf}
            onPress={() => setTimeframe(tf)}
            style={[styles.timeframeButton, timeframe === tf && styles.selectedTimeframe]}
          >
            <Text style={styles.timeframeText}>
              {tf === "1" ? "1 Day" : tf === "7" ? "1 Week" : tf === "30" ? "1 Month" : "1 Year"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Fibonacci Çizgisi Grafiği */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Fibonacci Retracement</Text>
        <LineChart
          data={{
            labels: labels,
            datasets: [
              {
                data: ohlcData,
                color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`, // Mavi çizgi
                strokeWidth: 2,
              },
              ...fibonacciLevels.map((level) => ({
                data: Array(labels.length).fill(level.value),
                color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, // Kırmızı çizgiler
                strokeWidth: 1.5,
              })),
            ],
          }}
          width={350}
          height={250}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#f3f3f3",
            backgroundGradientTo: "#fff",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: "#fff", flex: 1 },
  errorText: { color: "red", fontSize: 16, textAlign: "center" },
  timeframeContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 10 },
  timeframeButton: { padding: 10, margin: 5, backgroundColor: "#ccc", borderRadius: 5 },
  selectedTimeframe: { backgroundColor: "#007bff" },
  timeframeText: { color: "white", fontSize: 16 },
  chartContainer: { alignItems: "center", marginBottom: 20 },
  chartTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
});

export default FibonacciGraph;
