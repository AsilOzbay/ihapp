import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { LineChart } from "react-native-chart-kit";

const ChartQuizSection = () => {
  // Grafik Verileri
  const graphs = [
    {
      title: "Bitcoin Price Chart",
      labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"],
      data: [12000, 12500, 11500, 14000, 13500, 15000, 13000, 15500, 14500, 16000],
    },
    {
      title: "Ethereum Price Chart",
      labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"],
      data: [2000, 2100, 1900, 2200, 2150, 2250, 2100, 2300, 2200, 2400],
    },
  ];

  const [selectedGraphIndex, setSelectedGraphIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentGraph = graphs[selectedGraphIndex];
  const maxPrice = Math.max(...currentGraph.data);
  const minPrice = Math.min(...currentGraph.data);
  const maxPriceIndex = currentGraph.data.indexOf(maxPrice);
  const minPriceIndex = currentGraph.data.indexOf(minPrice);

  // Soru Verileri
  const questions = [
    [
      {
        question: "What is the highest price recorded in Bitcoin chart?",
        options: [
          `Day 1: $${currentGraph.data[0]}`,
          `Day 5: $${currentGraph.data[4]}`,
          `Day ${maxPriceIndex + 1}: $${maxPrice}`, // Doğru cevap
          `Day 8: $${currentGraph.data[7]}`,
        ],
        correct: 2,
      },
      {
        question: "What is the lowest price recorded in Bitcoin chart?",
        options: [
          `Day ${minPriceIndex + 1}: $${minPrice}`, // Doğru cevap
          `Day 6: $${currentGraph.data[5]}`,
          `Day 3: $${currentGraph.data[2]}`,
          `Day 9: $${currentGraph.data[8]}`,
        ],
        correct: 0,
      },
    ],
  ];

  const handleOptionClick = (index) => {
    setSelectedOption(index);
    setIsAnswered(true);
  };

  const goToNextQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => Math.min(prevIndex + 1, questions[selectedGraphIndex].length - 1));
    setSelectedOption(null);
    setIsAnswered(false);
  };

  const goToPreviousQuestion = () => {
    setCurrentQuestionIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    setSelectedOption(null);
    setIsAnswered(false);
  };

  const switchGraph = (index) => {
    setSelectedGraphIndex(index);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Interactive Coin Price Charts</Text>

      {/* Grafik Seçim Butonları */}
      <View style={styles.graphSelection}>
        {graphs.map((graph, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => switchGraph(index)}
            style={[
              styles.graphButton,
              selectedGraphIndex === index && styles.selectedGraphButton,
            ]}
          >
            <Text style={styles.graphButtonText}>{graph.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LineChart Bileşeni */}
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: currentGraph.labels,
            datasets: [
              {
                data: currentGraph.data,
                color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                strokeWidth: 2,
              },
            ],
          }}
          width={350}
          height={250}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#f3f3f3",
            backgroundGradientTo: "#fff",
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
        />
      </View>

      {/* Soru Bölümü */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>{questions[selectedGraphIndex][currentQuestionIndex].question}</Text>
        {questions[selectedGraphIndex][currentQuestionIndex].options.map((option, optionIndex) => (
          <TouchableOpacity
            key={optionIndex}
            onPress={() => handleOptionClick(optionIndex)}
            style={[
              styles.optionButton,
              isAnswered && optionIndex === questions[selectedGraphIndex][currentQuestionIndex].correct
                ? styles.correctOption
                : isAnswered && optionIndex === selectedOption
                ? styles.wrongOption
                : styles.defaultOption,
            ]}
            disabled={isAnswered}
          >
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        ))}

        {/* Navigation Buttons */}
        <View style={styles.navigationButtons}>
          <TouchableOpacity onPress={goToPreviousQuestion} disabled={currentQuestionIndex === 0} style={styles.navButton}>
            <Text style={styles.navButtonText}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goToNextQuestion} disabled={currentQuestionIndex === questions[selectedGraphIndex].length - 1} style={styles.navButton}>
            <Text style={styles.navButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 15, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  graphSelection: { flexDirection: "row", justifyContent: "center", marginBottom: 10 },
  graphButton: { padding: 10, margin: 5, backgroundColor: "#ccc", borderRadius: 5 },
  selectedGraphButton: { backgroundColor: "#4caf50" },
  graphButtonText: { color: "#fff", fontSize: 16 },
  chartContainer: { alignItems: "center", marginBottom: 20 },
  questionContainer: { padding: 10, backgroundColor: "#f9f9f9", borderRadius: 5 },
  questionText: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  optionButton: { padding: 10, borderRadius: 5, marginBottom: 5 },
  correctOption: { backgroundColor: "green" },
  wrongOption: { backgroundColor: "red" },
  defaultOption: { backgroundColor: "#ddd" },
  optionText: { fontSize: 16, color: "white" },
  navigationButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  navButton: { padding: 10, backgroundColor: "#007bff", borderRadius: 5 },
  navButtonText: { color: "white", fontSize: 16 },
});

export default ChartQuizSection;
