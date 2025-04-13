import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator, Alert } from "react-native";
import boyAvatar from "../assets/images/boy_3984629.png";
import girlAvatar from "../assets/images/girl_3984664.png";

const PortfolioCustomization = ({ portfolio, userId, onBack }) => {
  const [portfolioName, setPortfolioName] = useState(portfolio?.name || "");
  const [selectedAvatar, setSelectedAvatar] = useState(portfolio?.avatar || boyAvatar);
  const [transactions, setTransactions] = useState(portfolio?.transactions || []);
  const [isEditingTransaction, setEditingTransaction] = useState(null);
  const [isLoading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (portfolio && Object.keys(portfolio).length > 0) {
      setPortfolioName(portfolio.name);
      setSelectedAvatar(portfolio.avatar || boyAvatar);
      setTransactions(portfolio.transactions || []);
    } else {
      setPortfolioName(""); // Ensure new portfolio starts empty
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
      ? `http://localhost:5000/portfolio/${portfolio._id}`
      : "http://localhost:5000/create-portfolio";

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
        onBack(); // Return to portfolio list after saving
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

  const addTransaction = async (transaction) => {
    try {
      const response = await fetch(`http://localhost:5000/portfolio/${portfolio._id}/transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transaction),
      });

      const result = await response.json();
      if (response.ok) {
        setTransactions(result.portfolio.transactions);
      } else {
        console.error("Failed to add transaction:", result.message);
      }
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const deleteTransaction = async (transactionId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/portfolio/${portfolio._id}/transaction/${transactionId}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();
      if (response.ok) {
        setTransactions(result.transactions); // Update the list
        setMessage("Transaction deleted successfully!");
      } else {
        console.error("Failed to delete transaction:", result.message);
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  const handleEditSubmit = async (editedTransaction) => {
    try {
      const response = await fetch(
        `http://localhost:5000/portfolio/${portfolio._id}/transaction/${editedTransaction._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editedTransaction),
        }
      );

      const result = await response.json();
      if (response.ok) {
        setTransactions(result.transactions);
        setEditingTransaction(null); // Exit editing mode
      } else {
        console.error("Failed to update transaction:", result.message);
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
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
          value={portfolioName}
          onChangeText={setPortfolioName}
          style={styles.input}
          placeholder="Enter portfolio name"
        />

        <Text style={styles.label}>Select Avatar</Text>
        <View style={styles.avatarContainer}>
          {[boyAvatar, girlAvatar].map((avatar, index) => (
            <TouchableOpacity key={index} onPress={() => setSelectedAvatar(avatar)}>
              <Image
                source={avatar}
                style={[
                  styles.avatar,
                  selectedAvatar === avatar && styles.selectedAvatar,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={savePortfolio}
          style={styles.saveButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Portfolio</Text>
          )}
        </TouchableOpacity>

        {!!message && <Text style={styles.message}>{message}</Text>}
      </View>

      {portfolio && (
        <View style={styles.card}>
          <Text style={styles.title}>Transactions</Text>
          {transactions.map((transaction) => (
            <View key={transaction._id} style={styles.transactionRow}>
              {isEditingTransaction?._id === transaction._id ? (
                <View style={styles.editRow}>
                  <TextInput
                    value={isEditingTransaction.symbol}
                    onChangeText={(val) => setEditingTransaction({ ...isEditingTransaction, symbol: val })}
                    style={styles.transactionInput}
                  />
                  <TextInput
                    value={String(isEditingTransaction.quantity)}
                    keyboardType="numeric"
                    onChangeText={(val) => setEditingTransaction({ ...isEditingTransaction, quantity: +val })}
                    style={styles.transactionInput}
                  />
                  <TextInput
                    value={String(isEditingTransaction.price)}
                    keyboardType="numeric"
                    onChangeText={(val) => setEditingTransaction({ ...isEditingTransaction, price: +val })}
                    style={styles.transactionInput}
                  />
                  <TouchableOpacity
                    onPress={() => handleEditSubmit(isEditingTransaction)}
                    style={styles.editSaveButton}
                  >
                    <Text style={styles.buttonText}>Save</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <Text>
                    {transaction.action.toUpperCase()} {transaction.quantity} {transaction.symbol} @ ${transaction.price.toFixed(2)}
                  </Text>
                  <View style={styles.buttonGroup}>
                    <TouchableOpacity
                      onPress={() => setEditingTransaction(transaction)}
                      style={styles.editButton}
                    >
                      <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteTransaction(transaction._id)}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.buttonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  backButton: {
    marginBottom: 20,
    alignSelf: "flex-start",
    backgroundColor: "#6B7280",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },
  label: {
    marginBottom: 4,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  avatarContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 10,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 10,
  },
  selectedAvatar: {
    borderWidth: 2,
    borderColor: "#3B82F6",
  },
  saveButton: {
    backgroundColor: "#3B82F6",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  message: {
    marginTop: 12,
    textAlign: "center",
    color: "#10B981",
  },
  transactionRow: {
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 8,
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  transactionInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 6,
    width: "20%",
    marginRight: 6,
  },
  buttonGroup: {
    flexDirection: "row",
    marginTop: 4,
  },
  editButton: {
    backgroundColor: "#F59E0B",
    padding: 8,
    borderRadius: 6,
    marginRight: 6,
  },
  deleteButton: {
    backgroundColor: "#EF4444",
    padding: 8,
    borderRadius: 6,
  },
  editSaveButton: {
    backgroundColor: "#10B981",
    padding: 8,
    borderRadius: 6,
    marginLeft: 6,
  },
  buttonText: {
    color: "#fff",
  },
});

export default PortfolioCustomization;
