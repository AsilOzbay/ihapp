import React from "react";
import { View, Text, ScrollView, SafeAreaView, StyleSheet } from "react-native";
import VideoSection from "../../components/VideoSection";
import QuizSection from "../../components/QuizSection";
import InfoSection from "../../components/InfoSection";
import ChartQuizSection from "../../components/ChartQuizSection";

export default function LearningHubScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to the Learning Hub</Text>
          <Text style={styles.subtitle}>
            Explore cryptocurrencies and blockchain through videos, quizzes, and educational articles.
          </Text>
        </View>

        {/* Video Bölümü */}
        <View style={styles.section}>
          <VideoSection />
        </View>

        {/* Quiz, Bilgi ve Grafik Bölümü */}
        <View style={styles.section}>
          <QuizSection />
          <InfoSection />
          <ChartQuizSection />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  scrollContainer: { padding: 16, alignItems: "center" },
  header: { alignItems: "center", marginBottom: 16 },
  title: { fontSize: 24, fontWeight: "bold", color: "#1E40AF", textAlign: "center" },
  subtitle: { fontSize: 14, color: "#4B5563", textAlign: "center", marginTop: 8 },
  section: { width: "100%", maxWidth: 800, marginBottom: 20 },
});
