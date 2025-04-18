import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import boyAvatar from "../assets/images/boy_3984629.png";
import girlAvatar from "../assets/images/girl_3984664.png";
import { API_BASE_URL } from "./env-config";

const PortfolioCustomization = ({ portfolio, userId, onBack }) => {
  const [portfolioName, setPortfolioName] = useState(portfolio?.name || "");
  const [selectedAvatar, setSelectedAvatar] = useState(portfolio?.avatar || "boy");
  const [isLoading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (portfolio) {
      setPortfolioName(portfolio.name || "");
      setSelectedAvatar(portfolio.avatar || "boy");
    }
  }, [portfolio]);

  const getAvatarImage = (avatarName) => {
    return avatarName === "girl" ? girlAvatar : boyAvatar;
  };

  const savePortfolio = async () => {
    if (!portfolioName.trim()) {
      setMessage("Portfolio name is required.");
      return;
    }

    setLoading(true);

    const endpoint = portfolio
      ? `http://${API_BASE_URL}/portfolio/${portfolio._id}`
      : `http://${API_BASE_URL}/create-portfolio`;

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

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error:", errorText);
        setMessage("An error occurred. Please try again.");
        return;
      }

      await response.json();
      setMessage("Portfolio saved successfully!");
      Alert.alert("Success", "Portfolio saved successfully!", [{ text: "OK", onPress: onBack }]);
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
          value={portfolioName}
          onChangeText={setPortfolioName}
          style={styles.input}
          placeholder="Enter portfolio name"
        />

        <Text style={styles.label}>Select Avatar</Text>
        <View style={styles.avatarContainer}>
          {["boy", "girl"].map((type) => (
            <TouchableOpacity key={type} onPress={() => setSelectedAvatar(type)}>
              <Image
                source={getAvatarImage(type)}
                style={[
                  styles.avatar,
                  selectedAvatar === type && styles.selectedAvatar,
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  backButton: {
    marginBottom: 20,
    alignSelf: "flex-start",
    backgroundColor: "#6B7280",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: { color: "#fff" },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  label: { marginBottom: 4, fontWeight: "500" },
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
  saveButtonText: { color: "#fff", fontWeight: "bold" },
  message: {
    marginTop: 12,
    textAlign: "center",
    color: "#10B981",
  },
});

export default PortfolioCustomization;
