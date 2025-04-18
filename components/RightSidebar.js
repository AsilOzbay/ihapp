import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
  StyleSheet,
  Modal,
} from "react-native";
import axios from "axios";
import { API_BASE_URL } from "./env-config";

const RightSidebar = () => {
  const [visible, setVisible] = useState(false);
  const [newsType, setNewsType] = useState("cryptoPanic");
  const [cryptoPanicNews, setCryptoPanicNews] = useState([]);
  const [dailyAnalysis, setDailyAnalysis] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const togglePanel = () => setVisible(!visible);

  useEffect(() => {
    const fetchAllNews = async () => {
      try {
        const [cryptoPanicRes, geminiRes] = await Promise.all([
          axios.get(`http://${API_BASE_URL}/crypto-news`),
          axios.get(`http://${API_BASE_URL}/geminicrypto-news?lang=en`),
        ]);

        setCryptoPanicNews(cryptoPanicRes.data.news || []);
        setDailyAnalysis(geminiRes.data.news || "No analysis available.");
        setLastUpdated(
          geminiRes.data.lastUpdated
            ? new Date(geminiRes.data.lastUpdated).toLocaleString()
            : "N/A"
        );
      } catch (err) {
        console.error("Error fetching news:", err);
      }
    };

    fetchAllNews();
  }, []);

  return (
    <>
      <TouchableOpacity style={styles.newsButton} onPress={togglePanel}>
        <Text style={styles.newsButtonText}>📰</Text>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent onRequestClose={togglePanel}>
        <View style={styles.modalOverlay}>
          <View style={styles.panel}>
            <View style={styles.header}>
              <Text style={styles.title}>📢 Crypto News</Text>
              <TouchableOpacity onPress={togglePanel}>
                <Text style={styles.close}>✖</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tabs}>
              <TouchableOpacity
                style={[styles.tabButton, newsType === "cryptoPanic" && styles.activeTab]}
                onPress={() => setNewsType("cryptoPanic")}
              >
                <Text style={newsType === "cryptoPanic" ? styles.activeText : styles.tabText}>
                  CryptoPanic News
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, newsType === "dailyAnalysis" && styles.activeTab]}
                onPress={() => setNewsType("dailyAnalysis")}
              >
                <Text style={newsType === "dailyAnalysis" ? styles.activeText : styles.tabText}>
                  Daily Analysis
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content}>
              {newsType === "cryptoPanic" ? (
                cryptoPanicNews.length > 0 ? (
                  cryptoPanicNews.map((item, index) => (
                    <TouchableOpacity key={index} onPress={() => Linking.openURL(item.url)}>
                      <Text style={styles.newsItem}>{item.title}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text>No news available.</Text>
                )
              ) : (
                <Text>{dailyAnalysis}</Text>
              )}
              <Text style={styles.timestamp}>Last updated: {lastUpdated}</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  newsButton: {
    backgroundColor: "#2563eb",
    padding: 10,
    borderRadius: 30,
  },
  newsButtonText: {
    fontSize: 20,
    color: "white",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  panel: {
    backgroundColor: "white",
    height: "80%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  close: {
    fontSize: 20,
    color: "#ef4444",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  tabs: {
    flexDirection: "row",
    marginVertical: 10,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
    backgroundColor: "#e5e7eb",
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: "#2563eb",
  },
  tabText: {
    color: "#374151",
  },
  activeText: {
    color: "white",
    fontWeight: "bold",
  },
  content: {
    marginTop: 10,
  },
  newsItem: {
    color: "#2563eb",
    marginBottom: 12,
    fontSize: 14,
  },
  timestamp: {
    marginTop: 20,
    fontSize: 12,
    color: "#9ca3af",
  },
});

export default RightSidebar;
