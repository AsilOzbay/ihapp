import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Picker,
} from "react-native";
import TradeScreen from "../screens/TradeScreen";

const CryptoPricesTable = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    timeframe: "1H",
    currency: "USD",
    rowCount: 30,
  });

  const conversionRates = { USD: 1, EUR: 0.90, GBP: 0.80, TRY: 27 };
  const currencySymbols = { USD: "$", EUR: "€", GBP: "£", TRY: "₺" };

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch(`https://your-api.com/crypto-data?timeframe=${filters.timeframe}`);
        const result = await response.json();
        setCryptoData(result.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching crypto data:", error);
        setLoading(false);
      }
    };

    setLoading(true);
    fetchCryptoData();
  }, [filters.timeframe]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (selectedCrypto) {
    return <TradeScreen crypto={selectedCrypto} onBack={() => setSelectedCrypto(null)} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crypto Prices</Text>

      {/* Filtreleme ve Arama */}
      <View style={styles.filterContainer}>
        <Picker selectedValue={filters.currency} onValueChange={(value) => setFilters({ ...filters, currency: value })}>
          <Picker.Item label="USD" value="USD" />
          <Picker.Item label="EUR" value="EUR" />
          <Picker.Item label="GBP" value="GBP" />
          <Picker.Item label="TRY" value="TRY" />
        </Picker>

        <TextInput
          style={styles.searchInput}
          placeholder="Search by name or symbol"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Kripto Para Listesi */}
      <FlatList
        data={cryptoData
          .filter((item) => item.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
          .slice(0, filters.rowCount)}
        keyExtractor={(item) => item.symbol}
        renderItem={({ item }) => {
          const symbol = currencySymbols[filters.currency] || "$";
          const price = item.price ? item.price * conversionRates[filters.currency] : 0;
          const dailyChange = item.dailyChange ? item.dailyChange.toFixed(2) : "0.00";

          return (
            <View style={styles.cryptoItem}>
              <Text style={styles.cryptoText}>{item.symbol}</Text>
              <Text style={styles.cryptoText}>{symbol}{price.toLocaleString()}</Text>
              <Text style={[styles.cryptoText, dailyChange > 0 ? styles.positiveChange : styles.negativeChange]}>
                {dailyChange}%
              </Text>
              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => setSelectedCrypto(item)}
              >
                <Text style={styles.buttonText}>Details</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 10, backgroundColor: "#fff", flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  filterContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  searchInput: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 8, flex: 1, marginLeft: 10 },
  cryptoItem: { flexDirection: "row", justifyContent: "space-between", padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd" },
  cryptoText: { fontSize: 16 },
  positiveChange: { color: "green" },
  negativeChange: { color: "red" },
  detailsButton: { backgroundColor: "#007bff", padding: 5, borderRadius: 5 },
  buttonText: { color: "white", fontSize: 14 },
});

export default CryptoPricesTable;
