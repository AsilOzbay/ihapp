import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

const videos = [
  {
    id: 1,
    title: "What is Cryptocurrency?",
    url: "https://www.youtube.com/embed/SSo_EIwHSd4",
  },
  {
    id: 2,
    title: "How Blockchain Works",
    url: "https://www.youtube.com/embed/3xGLc-zz9cA",
  },
  {
    id: 3,
    title: "Understanding Smart Contracts",
    url: "https://www.youtube.com/embed/ZE2HxTmxfrI",
  },
];

const VideoSection = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Educational Videos</Text>

      {videos.map((item) => (
        <View key={item.id} style={styles.videoContainer}>
          <Text style={styles.videoTitle}>{item.title}</Text>
          <WebView
            source={{ uri: item.url }}
            style={styles.video}
            javaScriptEnabled
            allowsFullscreenVideo
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: "#f9f9f9" },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  videoContainer: {
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#444",
  },
  video: { height: 200, borderRadius: 10 },
});

export default VideoSection;
