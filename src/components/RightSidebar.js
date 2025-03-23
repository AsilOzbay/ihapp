import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, StyleSheet, ScrollView, Linking } from "react-native";
import axios from "axios";

const RightSidebar = () => {
  const [newsType, setNewsType] = useState("cryptoPanic"); // Varsayılan CryptoPanic haberleri
  const [cryptoPanicNews, setCryptoPanicNews] = useState([]);
  const [dailyAnalysis, setDailyAnalysis] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const cryptoPanicEndpoint = "https://your-api.com/crypto-news";
      const geminiEndpoint = "https://your-api.com/geminicrypto-news?lang=en";

      // API isteklerini aynı anda çalıştır
      const [cryptoPanicResponse, geminiResponse] = await Promise.all([
        axios.get(cryptoPanicEndpoint),
        axios.get(geminiEndpoint),
      ]);

      // CryptoPanic haberlerini güncelle
      setCryptoPanicNews(cryptoPanicResponse.data.news || []);

      // Gemini günlük analizini güncelle
      setDailyAnalysis(geminiResponse.data.news || "No analysis available.");

      // Güncellenme zamanını ayarla
      setLastUpdated(
        geminiResponse.data.lastUpdated
          ? new Date(geminiResponse.data.lastUpdated).toLocaleString()
          : "N/A"
      );
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("Failed to load news. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllNews();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>📢 Crypto News</Text>

      {/* Haber Türü Seçimi */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={() => setNewsType("cryptoPanic")}
          style={[styles.button, newsType === "cryptoPanic" && styles.activeButton]}
        >
          <Text style={[styles.buttonText, newsType === "cryptoPanic" && styles.activeButtonText]}>
            CryptoPanic News
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setNewsType("dailyAnalysis")}
          style={[styles.button, newsType === "dailyAnalysis" && styles.activeButton]}
        >
          <Text style={[styles.buttonText, newsType === "dailyAnalysis" && styles.activeButtonText]}>
            Daily Analysis
          </Text>
        </TouchableOpacity>
      </View>

      {/* Yükleniyor veya Hata Mesajı */}
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View>
          {newsType === "cryptoPanic" ? (
            // CryptoPanic haberlerini listele
            <FlatList
              data={cryptoPanicNews}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.newsItem}
                  onPress={() => Linking.openURL(item.url)}
                >
                  <Text style={styles.newsText}>{item.title}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>No CryptoPanic news available.</Text>}
            />
          ) : (
            // Günlük Analiz Göster
            <Text style={styles.analysisText}>{dailyAnalysis}</Text>
          )}
          <Text style={styles.lastUpdated}>🕒 Last updated: {lastUpdated}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: "#f9f9f9", alignItems: "center" },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 10, color: "#333" },
  buttonContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 10 },
  button: { padding: 10, backgroundColor: "#ddd", borderRadius: 5, marginHorizontal: 5 },
  activeButton: { backgroundColor: "#007bff" },
  buttonText: { fontSize: 16, color: "#333" },
  activeButtonText: { color: "white" },
  newsItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#ddd", width: "100%" },
  newsText: { fontSize: 16, color: "#007bff" },
  analysisText: { fontSize: 16, color: "#222", padding: 10 },
  lastUpdated: { fontSize: 14, color: "#888", marginTop: 10 },
  errorText: { fontSize: 16, color: "red", marginTop: 10 },
  emptyText: { fontSize: 16, color: "#555", textAlign: "center", marginTop: 10 },
});

export default RightSidebar;
