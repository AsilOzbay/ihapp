import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, LineElement, PointElement, LinearScale, Title, Tooltip } from "chart.js";

Chart.register(LineElement, PointElement, LinearScale, Title, Tooltip);

const ChartQuizSection = () => {
  // Data for two different graphs
  const graphs = [
    {
      title: "Bitcoin Price Chart",
      labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"],
      data: [12000, 12500, 11500, 14000, 13500, 15000, 13000, 15500, 14500, 16000], // Bitcoin data
    },
    {
      title: "Ethereum Price Chart",
      labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7", "Day 8", "Day 9", "Day 10"],
      data: [2000, 2100, 1900, 2200, 2150, 2250, 2100, 2300, 2200, 2400], // Ethereum data
    },
  ];

  const [selectedGraphIndex, setSelectedGraphIndex] = useState(0); // Active graph
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentGraph = graphs[selectedGraphIndex];
  const maxPrice = Math.max(...currentGraph.data);
  const minPrice = Math.min(...currentGraph.data);
  const maxPriceIndex = currentGraph.data.indexOf(maxPrice);
  const minPriceIndex = currentGraph.data.indexOf(minPrice);

  // Questions for both graphs
  const questions = [
    [
      {
        question: "What is the highest price recorded in Bitcoin chart?",
        options: [
          `Day 1: $${currentGraph.data[0]}`,
          `Day 5: $${currentGraph.data[4]}`,
          `Day ${maxPriceIndex + 1}: $${maxPrice}`, // Correct answer
          `Day 8: $${currentGraph.data[7]}`,
        ],
        correct: 2,
      },
      {
        question: "What is the lowest price recorded in Bitcoin chart?",
        options: [
          `Day ${minPriceIndex + 1}: $${minPrice}`, // Correct answer
          `Day 6: $${currentGraph.data[5]}`,
          `Day 3: $${currentGraph.data[2]}`,
          `Day 9: $${currentGraph.data[8]}`,
        ],
        correct: 0,
      },
      {
        question: "Which day had the largest price increase in Bitcoin chart?",
        options: ["Day 4", "Day 7", "Day 2", "Day 8"], // Example; adjust dynamically if needed
        correct: 0,
      },
      {
        question: "What is the overall trend of Bitcoin chart?",
        options: ["Uptrend", "Downtrend", "Flat", "Volatile"],
        correct: 0,
      },
    ],
    [
      {
        question: "What is the highest price recorded in Ethereum chart?",
        options: [
          `Day 1: $${currentGraph.data[0]}`,
          `Day 5: $${currentGraph.data[4]}`,
          `Day ${maxPriceIndex + 1}: $${maxPrice}`, // Correct answer
          `Day 8: $${currentGraph.data[7]}`,
        ],
        correct: 2,
      },
      {
        question: "What is the lowest price recorded in Ethereum chart?",
        options: [
          `Day ${minPriceIndex + 1}: $${minPrice}`, // Correct answer
          `Day 6: $${currentGraph.data[5]}`,
          `Day 3: $${currentGraph.data[2]}`,
          `Day 9: $${currentGraph.data[8]}`,
        ],
        correct: 0,
      },
      {
        question: "Which day had the largest price increase in Ethereum chart?",
        options: ["Day 4", "Day 7", "Day 2", "Day 8"], // Example; adjust dynamically if needed
        correct: 0,
      },
      {
        question: "What is the overall trend of Ethereum chart?",
        options: ["Uptrend", "Downtrend", "Flat", "Volatile"],
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
    setCurrentQuestionIndex(0); // Reset question index for the new graph
    setSelectedOption(null);
    setIsAnswered(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold text-blue-600 text-center">Interactive Coin Price Charts</h2>

      {/* Graph Selection */}
      <div className="flex justify-center space-x-4 mb-6">
        {graphs.map((graph, index) => (
          <button
            key={index}
            onClick={() => switchGraph(index)}
            className={`px-4 py-2 rounded-lg ${
              selectedGraphIndex === index
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {graph.title}
          </button>
        ))}
      </div>

      {/* Chart Section */}
      <div className="w-full md:w-2/3 mx-auto">
        <Line
          data={{
            labels: currentGraph.labels,
            datasets: [
              {
                label: "Coin Price ($)",
                data: currentGraph.data,
                borderColor: "#4caf50",
                backgroundColor: "rgba(76, 175, 80, 0.2)",
                pointRadius: 5,
                pointHoverRadius: 8,
              },
            ],
          }}
          options={{
            responsive: true,
            plugins: { legend: { display: false }, tooltip: { enabled: true } },
          }}
        />
      </div>

      {/* Question Section */}
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">{questions[selectedGraphIndex][currentQuestionIndex].question}</h3>
        {questions[selectedGraphIndex][currentQuestionIndex].options.map((option, optionIndex) => (
          <button
            key={optionIndex}
            onClick={() => handleOptionClick(optionIndex)}
            className={`block w-full text-left px-4 py-2 rounded-lg mb-2 border ${
              isAnswered && optionIndex === questions[selectedGraphIndex][currentQuestionIndex].correct
                ? "bg-green-500 text-white"
                : isAnswered && optionIndex === selectedOption
                ? "bg-red-500 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            disabled={isAnswered}
          >
            {option}
          </button>
        ))}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-4">
          <button
            onClick={goToPreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`px-4 py-2 rounded-lg ${
              currentQuestionIndex === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Previous
          </button>
          <button
            onClick={goToNextQuestion}
            disabled={currentQuestionIndex === questions[selectedGraphIndex].length - 1}
            className={`px-4 py-2 rounded-lg ${
              currentQuestionIndex === questions[selectedGraphIndex].length - 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChartQuizSection;
