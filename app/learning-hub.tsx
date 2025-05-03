import React from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

import VideoSection from "../components/VideoSection";
import QuizSection from "../components/QuizSection";
import InfoSection from "../components/InfoSection";
import ChartQuizSection from "../components/ChartQuizSection";

export default function LearningHubScreen() {
  const { isDarkMode: isDark } = useTheme();
  const styles = getStyles(isDark);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to the Learning Hub</Text>
          <Text style={styles.subtitle}>
            Explore cryptocurrencies and blockchain through videos, quizzes, and educational articles.
          </Text>
        </View>

        <View style={styles.section}>
          <VideoSection />
        </View>

        <View style={styles.section}>
          <QuizSection />
          <View style={styles.spacer} />
          <InfoSection />
          <View style={styles.spacer} />
          <ChartQuizSection />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? "#0f172a" : "#f3f4f6",
    },
    scrollContainer: {
      padding: 16,
      alignItems: "center",
    },
    header: {
      alignItems: "center",
      marginBottom: 24,
    },
    title: {
      fontSize: 26,
      fontWeight: "bold",
      textAlign: "center",
      color: isDark ? "#e0f2fe" : "#1E40AF",
    },
    subtitle: {
      fontSize: 14,
      textAlign: "center",
      marginTop: 8,
      maxWidth: 600,
      color: isDark ? "#94a3b8" : "#4B5563",
    },
    section: {
      width: "100%",
      maxWidth: 800,
      marginBottom: 24,
    },
    spacer: {
      height: 20,
    },
  });
