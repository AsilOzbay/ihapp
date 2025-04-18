import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import DetailsScreen from "./DetailsScreen";
import TradePage from "./TradePage";
import { API_BASE_URL } from "./env-config";

const CryptoPricesTable = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [viewMode, setViewMode] = useState("list");
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

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={currency}
          onValueChange={(value) => setCurrency(value)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
          dropdownIconColor="#333"
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
            <Text style={styles.cell}>
              {symbol}
              {price.toLocaleString()}
            </Text>
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
  container: {
    padding: 16,
    backgroundColor: "#f1f5f9",
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
    color: "#111",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: 6,
  },
  pickerWrapper: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
    overflow: "hidden",
    height: 48,
    justifyContent: "center",
  },
  picker: {
    height: 52,
    color: "#111",
    paddingHorizontal: 8,
  },
  pickerItem: {
    fontSize: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#cbd5e1",
    marginBottom: 6,
  },
  headerCell: {
    flex: 1,
    fontWeight: "bold",
    fontSize: 14,
    color: "#1e293b",
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 8,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cell: {
    flex: 1,
    fontSize: 14,
    textAlign: "center",
    color: "#1f2937",
  },
  green: {
    color: "#16a34a",
  },
  red: {
    color: "#dc2626",
  },
  detailsButton: {
    alignItems: "center",
    backgroundColor: "#2563EB",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    minWidth: 70,
  },  
  detailsButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "bold",
  },
});

export default CryptoPricesTable;
