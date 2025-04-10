import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import PortfolioCustomization from "../../components/PortfolioCustomization";
import PortfolioDetails from "../../components/PortfolioDetails";

export default function PortfolioScreen() {
  const [isDetailsVisible, setDetailsVisible] = useState(false);
  const [isCustomizationVisible, setCustomizationVisible] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [portfolios, setPortfolios] = useState([]);
  const [user, setUser] = useState(null);

  // Fetch portfolios
  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("user");
        const userData = userDataString ? JSON.parse(userDataString) : null;
        if (userData) {
          setUser(userData);
          const response = await fetch(`http://localhost:5000/portfolios?userId=${userData.id}`);
          const data = await response.json();
          setPortfolios(data);
        }
      } catch (error) {
        console.error("Error fetching portfolios:", error);
      }
    };

    fetchPortfolios();
  }, []);

  const reloadPortfolios = async () => {
    try {
      const response = await fetch(`http://localhost:5000/portfolios?userId=${user?.id}`);
      const data = await response.json();
      setPortfolios(data);
    } catch (error) {
      console.error("Error reloading portfolios:", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {!isCustomizationVisible && !isDetailsVisible ? (
          <View style={styles.centeredContainer}>
            <Text style={styles.heading}>Crypto Portfolio Tracker</Text>
            <Text style={styles.subtitle}>
              Keep track of your profits, losses, and portfolio valuation.
            </Text>

            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setCustomizationVisible(true)}
            >
              <Text style={styles.createButtonText}>Create New Portfolio</Text>
            </TouchableOpacity>

            {portfolios.length > 0 && (
              <View style={styles.portfolioList}>
                <Text style={styles.sectionTitle}>Your Portfolios</Text>
                {portfolios.map((portfolio) => (
                  <View key={portfolio._id} style={styles.portfolioCard}>
                    <View>
                      <Text style={styles.portfolioName}>{portfolio.name}</Text>
                      <Text style={styles.transactionCount}>
                        Transactions: {portfolio.transactions.length}
                      </Text>
                    </View>
                    <View style={styles.buttonGroup}>
                      <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => {
                          setSelectedPortfolio(portfolio);
                          setCustomizationVisible(true);
                        }}
                      >
                        <Text style={styles.buttonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() => {
                          setSelectedPortfolio(portfolio);
                          setDetailsVisible(true);
                        }}
                      >
                        <Text style={styles.buttonText}>View Details</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : isCustomizationVisible ? (
          <PortfolioCustomization
            portfolio={selectedPortfolio}
            userId={user?.id}
            onBack={() => {
              setCustomizationVisible(false);
              reloadPortfolios();
            }}
          />
        ) : (
          <PortfolioDetails
            portfolioId={selectedPortfolio?._id}
            onBack={() => {
              setDetailsVisible(false);
              reloadPortfolios();
            }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  scrollContainer: { padding: 16 },
  centeredContainer: { alignItems: "center", justifyContent: "center" },
  heading: { fontSize: 24, fontWeight: "bold", color: "#1E40AF", textAlign: "center", marginBottom: 10 },
  subtitle: { fontSize: 14, color: "#4B5563", textAlign: "center", marginBottom: 16 },
  createButton: { backgroundColor: "#2563EB", padding: 12, borderRadius: 8, marginBottom: 16 },
  createButtonText: { color: "white", fontSize: 16, fontWeight: "bold" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8, color: "#374151" },
  portfolioList: { width: "100%", marginTop: 16 },
  portfolioCard: {
    backgroundColor: "white",
    padding: 12,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  portfolioName: { fontSize: 16, fontWeight: "bold", color: "#1E293B" },
  transactionCount: { fontSize: 14, color: "#6B7280" },
  buttonGroup: { flexDirection: "row", gap: 10 },
  editButton: { backgroundColor: "#facc15", padding: 8, borderRadius: 6 },
  viewButton: { backgroundColor: "#10b981", padding: 8, borderRadius: 6 },
  buttonText: { color: "white", fontWeight: "bold" },
});

