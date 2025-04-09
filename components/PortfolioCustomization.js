import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from "react-native";

const boyAvatar = require("../assets/images/boy_3984629.png");
const girlAvatar = require("../assets/images/girl_3984664.png");

const PortfolioCustomization = ({ portfolio, userId, onBack }) => {
  const [portfolioName, setPortfolioName] = useState(portfolio?.name || "");
  const [selectedAvatar, setSelectedAvatar] = useState(portfolio?.avatar || boyAvatar);
  const [transactions, setTransactions] = useState(portfolio?.transactions || []);
  const [isEditingTransaction, setEditingTransaction] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (portfolio) {
      setPortfolioName(portfolio.name);
      setSelectedAvatar(portfolio.avatar || boyAvatar);
      setTransactions(portfolio.transactions || []);
    } else {
      setPortfolioName("");
      setSelectedAvatar(boyAvatar);
      setTransactions([]);
    }
  }, [portfolio]);

  const savePortfolio = async () => {
    if (!portfolioName.trim()) {
      setMessage("Portfolio name is required.");
      return;
    }

    setLoading(true);
    const endpoint = portfolio
      ? `https://your-api.com/portfolio/${portfolio._id}`
      : "https://your-api.com/create-portfolio";
    const method = portfolio ? "PUT" : "POST";

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          name: portfolioName,
          avatar: selectedAvatar,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("Portfolio saved successfully!");
        onBack();
      } else {
        setMessage(result.message || "Error saving portfolio.");
      }
    } catch (error) {
      console.error("Error saving portfolio:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>{portfolio ? "Edit Portfolio" : "Create Portfolio"}</Text>

        <Text style={styles.label}>Portfolio Name</Text>
        <TextInput
          style={styles.input}
          value={portfolioName}
          onChangeText={setPortfolioName}
          placeholder="Enter portfolio name"
        />

        <Text style={styles.label}>Select Avatar</Text>
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={() => setSelectedAvatar(boyAvatar)}>
            <Image source={boyAvatar} style={[styles.avatar, selectedAvatar === boyAvatar && styles.selectedAvatar]} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelectedAvatar(girlAvatar)}>
            <Image source={girlAvatar} style={[styles.avatar, selectedAvatar === girlAvatar && styles.selectedAvatar]} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={savePortfolio} style={styles.saveButton} disabled={isLoading}>
          <Text style={styles.saveButtonText}>{isLoading ? "Saving..." : "Save Portfolio"}</Text>
        </TouchableOpacity>
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>

      {portfolio && (
        <View style={styles.transactionsContainer}>
          <Text style={styles.title}>Transactions</Text>
          {transactions.map((transaction) => (
            <View key={transaction._id} style={styles.transactionItem}>
              <Text style={styles.transactionText}>
                {transaction.action.toUpperCase()} {transaction.quantity} {transaction.symbol} @ $
                {transaction.price.toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: "#f9f9f9", alignItems: "center" },
  backButton: { alignSelf: "flex-start", marginBottom: 10 },
  backButtonText: { fontSize: 16, color: "#555" },
  card: { width: "100%", maxWidth: 400, backgroundColor: "#fff", padding: 20, borderRadius: 8, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "#333" },
  label: { fontSize: 16, fontWeight: "bold", marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, fontSize: 16, marginBottom: 10 },
  avatarContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 15 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginHorizontal: 10 },
  selectedAvatar: { borderWidth: 2, borderColor: "#007bff" },
  saveButton: { backgroundColor: "#007bff", padding: 12, borderRadius: 5, alignItems: "center", marginTop: 10 },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  message: { marginTop: 10, fontSize: 16, color: "green", textAlign: "center" },
  transactionsContainer: { marginTop: 20, width: "100%", maxWidth: 400, backgroundColor: "#fff", padding: 15, borderRadius: 8, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  transactionItem: { borderBottomWidth: 1, borderBottomColor: "#ddd", paddingVertical: 8 },
  transactionText: { fontSize: 16 },
});

export default PortfolioCustomization;
