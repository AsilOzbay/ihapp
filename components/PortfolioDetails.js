import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import boyAvatar from "../assets/images/boy_3984629.png";
import girlAvatar from "../assets/images/girl_3984664.png";
import { API_BASE_URL } from "./env-config";

const PortfolioDetails = ({ portfolioId, onBack }) => {
  const [portfolio, setPortfolio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [holdings, setHoldings] = useState([]);
  const [totalInvestedData, setTotalInvestedData] = useState([]);

  useEffect(() => {
    const fetchPortfolioDetails = async () => {
      try {
        const res = await fetch(`http://${API_BASE_URL}/portfolio/${portfolioId}`);
        if (!res.ok) throw new Error("Failed to fetch portfolio details");
        const data = await res.json();
        setPortfolio(data);

        const calculated = {};
        data.transactions.forEach(({ symbol, action, quantity, price }) => {
          if (!calculated[symbol]) calculated[symbol] = { quantity: 0, totalCost: 0 };
          const delta = quantity * price * (action === "buy" ? 1 : -1);
          calculated[symbol].quantity += quantity * (action === "buy" ? 1 : -1);
          calculated[symbol].totalCost += delta;
        });

        const holdingsArr = Object.entries(calculated).map(([symbol, { quantity, totalCost }]) => ({
          symbol,
          quantity,
          totalCost,
        }));

        const pricesRes = await fetch(`http://${API_BASE_URL}/crypto-data`);
        const pricesData = await pricesRes.json();

        const updated = holdingsArr.map((h) => {
          const currentPrice = pricesData.data.find((c) => c.symbol === h.symbol)?.price || 0;
          const currentValue = h.quantity * currentPrice;
          return {
            ...h,
            currentPrice,
            currentValue,
            profitLoss: currentValue - h.totalCost,
          };
        });

        setHoldings(updated);
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
    let runningTotal = 0;
    return transactions
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((t) => {
        const delta = t.quantity * t.price * (t.action === "buy" ? 1 : -1);
        runningTotal += delta;
        return {
          date: new Date(t.date).toISOString().split("T")[0],
          totalInvested: runningTotal.toFixed(2),
        };
      });
  };

  const getAvatar = (avatar) => (avatar === "girl" ? girlAvatar : boyAvatar);
  const totalValue = holdings.reduce((acc, h) => acc + h.currentValue, 0);
  const totalInvested = holdings.reduce((acc, h) => acc + h.totalCost, 0);
  const totalProfitLoss = totalValue - totalInvested;
  const profitPercent = totalInvested > 0 ? ((totalProfitLoss / totalInvested) * 100).toFixed(2) : "0.00";

  if (isLoading) return <ActivityIndicator size="large" color="#2563eb" />;
  if (error) return <Text style={styles.errorText}>Error: {error}</Text>;

  return (
    <FlatList
      data={portfolio.transactions}
      keyExtractor={(item) => item._id}
      ListHeaderComponent={
        <>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <Text style={styles.title}>Portfolio Overview</Text>
            <View style={styles.row}>
              <View style={styles.statBox}>
                <Text style={styles.label}>Value</Text>
                <Text
                  style={styles.value}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  ${totalValue.toLocaleString()}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.label}>Invested</Text>
                <Text
                  style={styles.value}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  ${totalInvested.toLocaleString()}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Text
                  style={[
                    styles.value,
                    { color: totalProfitLoss >= 0 ? "green" : "red" },
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  ${totalProfitLoss.toLocaleString()}
                </Text>
                <Text style={styles.label}>P/L</Text>
              </View>
              <View style={styles.statBox}>
                <Text
                  style={[
                    styles.value,
                    { color: totalProfitLoss >= 0 ? "green" : "red" },
                  ]}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {profitPercent}%
                </Text>
                <Text style={styles.label}>P/L %</Text>
              </View>
            </View>
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Invested Over Time</Text>
            <LineChart
              data={{
                labels: totalInvestedData.map((d) => d.date),
                datasets: [
                  {
                    data: totalInvestedData.map((d) => parseFloat(d.totalInvested)),
                  },
                ],
              }}
              width={Dimensions.get("window").width - 32}
              height={220}
              yLabelsOffset={15}
              withInnerLines={false}
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(37, 99, 235, ${opacity})`,
                labelColor: () => "#374151",
                propsForLabels: {
                  fontSize: 10,
                },
              }}
              style={{ borderRadius: 8 }}
            />
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Holdings Distribution</Text>
            <PieChart
              data={holdings.map((h) => ({
                name: h.symbol,
                amount: h.currentValue,
                color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                legendFontColor: "#000",
                legendFontSize: 12,
              }))}
              width={Dimensions.get("window").width - 32}
              height={220}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              chartConfig={{
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                color: () => "#000",
              }}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>{portfolio.name}</Text>
            <Image source={getAvatar(portfolio.avatar)} style={styles.avatar} />
            <Text style={styles.label}>
              Created:{" "}
              {portfolio.createdAt
                ? new Date(portfolio.createdAt).toLocaleDateString()
                : "Unknown"}
            </Text>
            <Text style={styles.label}>Transactions: {portfolio.transactions.length}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Transaction History</Text>
            <View style={styles.tableHeader}>
              <Text style={styles.tableCol}>Date</Text>
              <Text style={styles.tableCol}>Action</Text>
              <Text style={styles.tableCol}>Symbol</Text>
              <Text style={styles.tableCol}>Qty</Text>
              <Text style={styles.tableCol}>Price</Text>
              <Text style={styles.tableCol}>Total</Text>
            </View>
          </View>
        </>
      }
      renderItem={({ item }) => (
        <View style={styles.transactionRow}>
          <Text style={styles.tableCol}>{new Date(item.date).toLocaleDateString()}</Text>
          <Text style={[styles.tableCol, { color: item.action === "buy" ? "green" : "red" }]}>
            {item.action.toUpperCase()}
          </Text>
          <Text style={styles.tableCol}>{item.symbol}</Text>
          <Text style={styles.tableCol}>{item.quantity.toFixed(2)}</Text>
          <Text style={styles.tableCol}>${item.price.toLocaleString()}</Text>
          <Text style={styles.tableCol}>${(item.quantity * item.price).toLocaleString()}</Text>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  backButton: { padding: 10, marginBottom: 10 },
  backButtonText: { color: "#2563eb", fontSize: 16 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 16,
    elevation: 3,
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  chartCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    marginHorizontal: 16,
    alignItems: "center",
    elevation: 3,
  },
  chartTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  label: { fontSize: 14, color: "#4b5563", marginBottom: 4 },
  value: { fontSize: 16, fontWeight: "bold" },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  statBox: { alignItems: "center", flex: 1, paddingHorizontal: 4 },
  avatar: { width: 64, height: 64, borderRadius: 32, marginVertical: 8 },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
  },
  tableCol: { flex: 1, fontSize: 12, textAlign: "center" },
  errorText: { color: "red", fontSize: 16, textAlign: "center", marginTop: 20 },
});

export default PortfolioDetails;
