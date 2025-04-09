import React from "react";
import { View, Text, ScrollView, SafeAreaView, StyleSheet } from "react-native";
import WelcomeBanner from "../../components/WelcomeBanner";
import TrendingCoins from "../../components/TrendingCoins";
import TopExchanges from "../../components/TopExchanges";
import CryptoPricesTable from "../../components/CryptoPricesTable";
import RightSidebar from "../../components/RightSidebar";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <WelcomeBanner />
        <Text style={styles.heading}>Crypto Dashboard</Text>

        {/* Trending Coins & Exchanges */}
        <View style={styles.row}>
          <TrendingCoins />
          <TopExchanges />
        </View>

        {/* Crypto Prices Table */}
        <CryptoPricesTable />

        {/* Right Sidebar */}
        <View style={styles.sidebar}>
          <RightSidebar />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  scrollContainer: { padding: 16 },
  heading: { fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 16 },
  row: { flexDirection: "column", marginBottom: 16 },
  sidebar: {
    marginTop: 16,
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
