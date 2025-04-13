import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { LineChart } from "react-native-chart-kit";
import DateTimePicker from "@react-native-community/datetimepicker";

const TradePage = ({ crypto, onBack }) => {
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState(crypto?.price || 0);
  const [action, setAction] = useState("");
  const [timeframe, setTimeframe] = useState("1M");
  const [message, setMessage] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState("");
  const [chartData, setChartData] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  if (!crypto) {
    console.log("No crypto selected. `crypto` is:", crypto);
    return null;
  }

  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const userId = JSON.parse(localStorage.getItem("user")).id;
        const response = await fetch(`http://localhost:5000/portfolios?userId=${userId}`);
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
        const response = await fetch(`http://localhost:5000/graph-data/${crypto.symbol}?timeframe=${timeframe}`);
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
    if (!action) {
      Alert.alert("Error", "Please select Buy or Sell.");
      return;
    }

    if (!selectedPortfolioId) {
      Alert.alert("Error", "Please select a portfolio.");
      return;
    }

    if (quantity <= 0 || price <= 0) {
      Alert.alert("Error", "Please enter valid quantity and price.");
      return;
    }

    const total = (Number(quantity) && Number(price))
    ? (Number(quantity) * Number(price)).toFixed(2)
    : '0.00';
  
    try {
      const response = await fetch(`http://localhost:5000/portfolio/${selectedPortfolioId}/transaction`, {
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
        <Text style={[
  styles.cryptoChange, 
  crypto?.change > 0 ? styles.positiveChange : styles.negativeChange
]}>
  ({typeof crypto?.change === 'number' ? crypto.change.toFixed(2) : '0.00'}%)
</Text>
      </View>

      {/* Portfolio Selection */}
      <Picker selectedValue={selectedPortfolioId} onValueChange={(value) => setSelectedPortfolioId(value)} style={styles.picker}>
        <Picker.Item label="-- Select Portfolio --" value="" />
        {portfolios.map((portfolio) => (
          <Picker.Item key={portfolio._id} label={portfolio.name} value={portfolio._id} />
        ))}
      </Picker>

      {/* Trade Input Fields */}
      <View style={styles.tradeContainer}>
        <View style={styles.buttonGroup}>
          <TouchableOpacity onPress={() => setAction("buy")} style={[styles.actionButton, action === "buy" && styles.buyAction]}>
            <Text style={styles.actionText}>Buy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAction("sell")} style={[styles.actionButton, action === "sell" && styles.sellAction]}>
            <Text style={styles.actionText}>Sell</Text>
          </TouchableOpacity>
        </View>

        <TextInput style={styles.input} keyboardType="numeric" placeholder="Quantity" value={quantity} onChangeText={setQuantity} />
        <TextInput style={styles.input} keyboardType="numeric" placeholder="Price" value={String(price)} onChangeText={setPrice} />

        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
          <Text style={styles.datePickerText}>{transactionDate.toDateString()}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker value={transactionDate} mode="datetime" display="default" onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setTransactionDate(date);
          }} />
        )}

<Text style={styles.totalText}>
  Total: ${(!isNaN(quantity) && !isNaN(price)) 
    ? (Number(quantity) * Number(price)).toFixed(2) 
    : '0.00'}
</Text>
        <TouchableOpacity onPress={handleTrade} style={styles.tradeButton}>
          <Text style={styles.tradeButtonText}>Execute Trade</Text>
        </TouchableOpacity>
      </View>

      {/* Chart Section */}
      {chartData && (
        <LineChart
          data={chartData}
          width={350}
          height={250}
          chartConfig={{
            backgroundGradientFrom: "#f3f3f3",
            backgroundGradientTo: "#fff",
            color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: "#f9f9f9", alignItems: "center" },
  backButton: { padding: 10, backgroundColor: "#ddd", borderRadius: 5, marginBottom: 10 },
  backButtonText: { fontSize: 16, color: "#333" },
  card: { padding: 20, backgroundColor: "#fff", borderRadius: 10, alignItems: "center", marginBottom: 10 },
  cryptoTitle: { fontSize: 22, fontWeight: "bold" },
  cryptoPrice: { fontSize: 20, color: "#007bff" },
  cryptoChange: { fontSize: 18 },
  positiveChange: { color: "green" },
  negativeChange: { color: "red" },
  picker: { width: "100%", backgroundColor: "#ddd", marginBottom: 10 },
  tradeContainer: { width: "100%", backgroundColor: "#fff", padding: 15, borderRadius: 8 },
  input: { borderBottomWidth: 1, marginBottom: 10, fontSize: 16, padding: 5 },
  tradeButton: { backgroundColor: "#007bff", padding: 12, borderRadius: 5, alignItems: "center" },
  tradeButtonText: { color: "white", fontSize: 16 },
});

export default TradePage;
