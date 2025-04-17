import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DetailsScreen from "./DetailsScreen";
import TradePage from "./TradePage";
import { API_BASE_URL } from "./env-config";

const CryptoPricesTable = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // "list" | "details" | "trade"
  const [searchQuery, setSearchQuery] = useState("");
  const [currency, setCurrency] = useState("USD");

  const conversionRates = { USD: 1, EUR: 0.9, GBP: 0.8, TRY: 27 };
  const currencySymbols = { USD: "$", EUR: "€", GBP: "£", TRY: "₺" };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`http://${API_BASE_URL}/crypto-data?timeframe=1H`);
        const data = await res.json();
        setCryptoData(data.data);
      } catch (err) {
        console.error("Error fetching crypto data:", err);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  if (viewMode === "details" && selectedCrypto) {
    return (
      <DetailsScreen
        crypto={selectedCrypto}
        onBack={() => {
          setSelectedCrypto(null);
          setViewMode("list");
        }}
        onTrade={(crypto) => {
          setSelectedCrypto(crypto);
          setViewMode("trade");
        }}
      />
    );
  }

  if (viewMode === "trade" && selectedCrypto) {
    return (
      <TradePage
        crypto={selectedCrypto}
        onBack={() => {
          setSelectedCrypto(null);
          setViewMode("list");
        }}
      />
    );
  }

  const filteredData = cryptoData.filter((item) =>
    item.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crypto Prices</Text>

      <View style={styles.filterGroup}>
        <Picker
          selectedValue={currency}
          onValueChange={(value) => setCurrency(value)}
          style={styles.picker}
        >
          <Picker.Item label="USD" value="USD" />
          <Picker.Item label="EUR" value="EUR" />
          <Picker.Item label="GBP" value="GBP" />
          <Picker.Item label="TRY" value="TRY" />
        </Picker>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by symbol"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <View style={styles.headerRow}>
        <Text style={styles.headerCell}>Symbol</Text>
        <Text style={styles.headerCell}>Price</Text>
        <Text style={styles.headerCell}>Daily</Text>
        <Text style={styles.headerCell}>Action</Text>
      </View>

      {filteredData.map((item, index) => {
        const rate = conversionRates[currency] || 1;
        const symbol = currencySymbols[currency] || "$";
        const price = (item.price ?? 0) * rate;
        const dailyChange = item.dailyChange?.toFixed(2) || "0.00";

        return (
          <View key={index} style={styles.row}>
            <Text style={styles.cell}>{item.symbol}</Text>
            <Text style={styles.cell}>{symbol}{price.toLocaleString()}</Text>
            <Text style={[styles.cell, +dailyChange > 0 ? styles.green : styles.red]}>
              {dailyChange}%
            </Text>
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => {
                setSelectedCrypto(item);
                setViewMode("details");
              }}
            >
              <Text style={styles.detailsButtonText}>Details</Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10, backgroundColor: "#fff" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  filterGroup: { marginBottom: 10 },
  picker: {
    width: "100%",
    height: 45,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#f9f9f9",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#eee",
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  headerCell: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 12,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#f0f0f0",
  },
  cell: {
    flex: 1,
    fontSize: 13,
    textAlign: "center",
  },
  green: { color: "green" },
  red: { color: "red" },
  detailsButton: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#007bff",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  detailsButtonText: {
    color: "#fff",
    fontSize: 13,
  },
});

export default CryptoPricesTable;
