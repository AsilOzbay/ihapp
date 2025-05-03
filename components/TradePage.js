import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { LineChart } from "react-native-chart-kit";
import DateTimePicker from "@react-native-community/datetimepicker";
import { API_BASE_URL } from "./env-config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/ThemeContext";

const TradePage = ({ crypto, onBack }) => {
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState(crypto?.price || 0);
  const [action, setAction] = useState("");
  const [timeframe, setTimeframe] = useState("1M");
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState("");
  const [chartData, setChartData] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const { isDarkMode: isDark } = useTheme();
  const styles = getStyles(isDark);

  if (!crypto) return null;

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (!userData) return;
        const user = JSON.parse(userData);
        const response = await fetch(`http://${API_BASE_URL}/portfolios?userId=${user.id}`);
        const data = await response.json();
        setPortfolios(data);
      } catch (error) {
        console.error("Error fetching portfolios:", error);
      }
    };
    fetchPortfolios();
  }, []);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch(`http://${API_BASE_URL}/graph-data/${crypto.symbol}?timeframe=${timeframe}`);
        const data = await response.json();
        setChartData({
          labels: data.map((point) => point.time),
          datasets: [{ data: data.map((point) => point.price) }],
        });
      } catch (error) {
        console.error("Error fetching graph data:", error);
      }
    };
    fetchGraphData();
  }, [crypto.symbol, timeframe]);

  const handleTrade = async () => {
    if (!action || !selectedPortfolioId || quantity <= 0 || price <= 0) {
      Alert.alert("Error", "Please fill all fields and select Buy or Sell.");
      return;
    }

    const total = (Number(quantity) && Number(price)) ? (Number(quantity) * Number(price)).toFixed(2) : '0.00';

    try {
      const response = await fetch(`http://${API_BASE_URL}/portfolio/${selectedPortfolioId}/transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: crypto.symbol,
          action,
          quantity,
          price,
          total,
          transactionDate,
        }),
      });

      if (response.ok) {
        Alert.alert("Success", `Successfully ${action} ${quantity} ${crypto.symbol} at $${price} each.`);
      } else {
        Alert.alert("Error", "Failed to execute the transaction.");
      }
    } catch (error) {
      console.error("Error executing trade:", error);
      Alert.alert("Error", "An error occurred while processing your request.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.cryptoTitle}>{crypto.symbol}</Text>
        <Text style={styles.cryptoPrice}>${crypto.price.toLocaleString()}</Text>
        <Text style={[styles.cryptoChange, crypto?.change > 0 ? styles.positiveChange : styles.negativeChange]}>
          ({typeof crypto?.change === "number" ? crypto.change.toFixed(2) : "0.00"}%)
        </Text>
      </View>

      {chartData && (
        <LineChart
          data={{ ...chartData, labels: Array(chartData.labels.length).fill("") }}
          width={350}
          height={250}
          chartConfig={{
            backgroundGradientFrom: isDark ? "#1e293b" : "#f3f3f3",
            backgroundGradientTo: isDark ? "#0f172a" : "#fff",
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
            labelColor: () => isDark ? "#e2e8f0" : "#555",
            propsForDots: { r: "3", strokeWidth: "1", stroke: "#007bff" },
          }}
          withVerticalLabels
          withHorizontalLabels
          withInnerLines
          withOuterLines={false}
          style={{ borderRadius: 8 }}
        />
      )}

      <Picker
        selectedValue={selectedPortfolioId}
        onValueChange={(value) => setSelectedPortfolioId(value)}
        style={styles.picker}
      >
        <Picker.Item label="-- Select Portfolio --" value="" />
        {portfolios.map((portfolio) => (
          <Picker.Item key={portfolio._id} label={portfolio.name} value={portfolio._id} />
        ))}
      </Picker>

      <View style={styles.tradeContainer}>
        <View style={styles.buttonGroup}>
          <TouchableOpacity onPress={() => setAction("buy")} style={[styles.actionButton, action === "buy" && styles.buyAction]}>
            <Text style={styles.actionText}>Buy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAction("sell")} style={[styles.actionButton, action === "sell" && styles.sellAction]}>
            <Text style={styles.actionText}>Sell</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Quantity"
          placeholderTextColor={isDark ? "#ccc" : "#888"}
          value={quantity}
          onChangeText={setQuantity}
        />
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          placeholder="Price"
          placeholderTextColor={isDark ? "#ccc" : "#888"}
          value={String(price)}
          onChangeText={setPrice}
        />

        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
          <Text style={styles.datePickerText}>{transactionDate.toDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={transactionDate}
            mode="datetime"
            display="default"
            onChange={(event, date) => {
              setShowDatePicker(false);
              if (date) setTransactionDate(date);
            }}
          />
        )}

        <Text style={styles.totalText}>
          Total: ${!isNaN(quantity) && !isNaN(price) ? (Number(quantity) * Number(price)).toFixed(2) : "0.00"}
        </Text>

        <TouchableOpacity onPress={handleTrade} style={styles.tradeButton}>
          <Text style={styles.tradeButtonText}>Execute Trade</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const getStyles = (isDark) => StyleSheet.create({
  container: { padding: 15, backgroundColor: isDark ? "#0f172a" : "#f9f9f9", alignItems: "center" },
  backButton: { padding: 10, backgroundColor: isDark ? "#334155" : "#ddd", borderRadius: 8, marginBottom: 10 },
  backButtonText: { fontSize: 16, color: isDark ? "#f1f5f9" : "#333" },
  card: {
    padding: 20,
    backgroundColor: isDark ? "#1e293b" : "#ffffff",
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    elevation: 3,
  },
  cryptoTitle: { fontSize: 24, fontWeight: "bold", color: isDark ? "#e2e8f0" : "#111" },
  cryptoPrice: { fontSize: 22, color: "#007bff", marginTop: 4 },
  cryptoChange: { fontSize: 18, marginTop: 4 },
  positiveChange: { color: "green" },
  negativeChange: { color: "red" },
  picker: {
    width: "100%",
    backgroundColor: isDark ? "#1e293b" : "#e5e7eb",
    marginBottom: 12,
    borderRadius: 8,
    color: isDark ? "#f1f5f9" : "#000",
  },
  tradeContainer: {
    width: "100%",
    backgroundColor: isDark ? "#1e293b" : "#ffffff",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  buttonGroup: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: isDark ? "#334155" : "#e5e7eb",
    alignItems: "center",
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  buyAction: { backgroundColor: "#d1fae5", borderColor: "#34d399" },
  sellAction: { backgroundColor: "#fee2e2", borderColor: "#f87171" },
  actionText: { fontSize: 16, fontWeight: "bold", color: isDark ? "#f1f5f9" : "#1f2937" },
  input: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 12,
    fontSize: 16,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: isDark ? "#334155" : "#f9f9f9",
    color: isDark ? "#fff" : "#000",
    borderRadius: 6,
  },
  datePickerButton: {
    padding: 10,
    backgroundColor: isDark ? "#475569" : "#e2e8f0",
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 10,
  },
  datePickerText: { fontSize: 15, color: "#1e40af" },
  totalText: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 8,
    textAlign: "center",
    color: isDark ? "#f8fafc" : "#000",
  },
  tradeButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  tradeButtonText: { color: "#ffffff", fontSize: 17, fontWeight: "bold" },
});

export default TradePage;
