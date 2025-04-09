import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Image,
} from "react-native";

import { LineChart, PieChart } from "react-native-chart-kit";

const PortfolioDetails = ({ portfolioId, onBack }) => {
  const [portfolio, setPortfolio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [holdings, setHoldings] = useState([]);
  const [totalInvestedData, setTotalInvestedData] = useState([]);

  useEffect(() => {
    const fetchPortfolioDetails = async () => {
      try {
        const response = await fetch(`https://your-api.com/portfolio/${portfolioId}`);
        if (!response.ok) throw new Error("Failed to fetch portfolio details");
        const data = await response.json();
        setPortfolio(data);

        // Calculate holdings
        const calculatedHoldings = {};
        data.transactions.forEach((transaction) => {
          const { symbol, action, quantity, price } = transaction;
          if (!calculatedHoldings[symbol]) {
            calculatedHoldings[symbol] = { quantity: 0, totalCost: 0 };
          }

          if (action === "buy") {
            calculatedHoldings[symbol].quantity += quantity;
            calculatedHoldings[symbol].totalCost += quantity * price;
          } else if (action === "sell") {
            calculatedHoldings[symbol].quantity -= quantity;
            calculatedHoldings[symbol].totalCost -= quantity * price;
          }
        });

        const holdingsArray = Object.keys(calculatedHoldings).map((symbol) => ({
          symbol,
          quantity: calculatedHoldings[symbol].quantity,
          totalCost: calculatedHoldings[symbol].totalCost,
        }));

        // Fetch current prices
        const pricesResponse = await fetch(`https://your-api.com/crypto-data`);
        const pricesData = await pricesResponse.json();
        const updatedHoldings = holdingsArray.map((holding) => {
          const currentPrice = pricesData.data.find(
            (crypto) => crypto.symbol === holding.symbol
          )?.price;
          const currentValue = holding.quantity * (currentPrice || 0);
          const profitLoss = currentValue - holding.totalCost;

          return {
            ...holding,
            currentPrice: currentPrice || 0,
            currentValue,
            profitLoss,
          };
        });

        setHoldings(updatedHoldings);

        // Prepare Total Invested Data
        setTotalInvestedData(prepareTotalInvestedData(data.transactions));
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioDetails();
  }, [portfolioId]);

  const prepareTotalInvestedData = (transactions) => {
    const totalInvestedOverTime = [];
    let runningTotalInvested = 0;

    transactions
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach((transaction) => {
        if (transaction.action === "buy") {
          runningTotalInvested += transaction.quantity * transaction.price;
        } else if (transaction.action === "sell") {
          runningTotalInvested -= transaction.quantity * transaction.price;
        }

        totalInvestedOverTime.push({
          date: new Date(transaction.date).toISOString().split("T")[0],
          totalInvested: runningTotalInvested.toFixed(2),
        });
      });

    return totalInvestedOverTime;
  };

  if (isLoading) return <ActivityIndicator size="large" color="#0000ff" />;
  if (error) return <Text style={styles.errorText}>Error: {error}</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>Portfolio Overview</Text>
        <Text style={styles.info}>Total Value: ${holdings.reduce((sum, h) => sum + h.currentValue, 0).toFixed(2)}</Text>
        <Text style={styles.info}>Total Invested: ${holdings.reduce((sum, h) => sum + h.totalCost, 0).toFixed(2)}</Text>
      </View>

      {/* Line Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Total Invested Over Time</Text>
        <LineChart
          data={{
            labels: totalInvestedData.map((d) => d.date),
            datasets: [{ data: totalInvestedData.map((d) => parseFloat(d.totalInvested)) }],
          }}
          width={350}
          height={250}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#f3f3f3",
            backgroundGradientTo: "#fff",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
        />
      </View>

      {/* Pie Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Holdings Distribution</Text>
        <PieChart
          data={holdings.map((h) => ({
            name: h.symbol,
            amount: h.currentValue,
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
            legendFontColor: "#000",
            legendFontSize: 12,
          }))}
          width={350}
          height={220}
          chartConfig={{
            backgroundGradientFrom: "#f3f3f3",
            backgroundGradientTo: "#fff",
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: "#f9f9f9", alignItems: "center" },
  backButton: { alignSelf: "flex-start", marginBottom: 10 },
  backButtonText: { fontSize: 16, color: "#555" },
  card: { width: "100%", maxWidth: 400, backgroundColor: "#fff", padding: 20, borderRadius: 8, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "#333" },
  info: { fontSize: 16, marginBottom: 5 },
  chartContainer: { marginTop: 20, alignItems: "center" },
  chartTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  errorText: { color: "red", fontSize: 16, textAlign: "center" },
});

export default PortfolioDetails;
