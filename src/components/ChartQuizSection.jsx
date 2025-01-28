import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import { Chart, LineElement, PointElement, LinearScale, Title, Tooltip } from "chart.js";

Chart.register(LineElement, PointElement, LinearScale, Title, Tooltip);

// Grafik ve veri tanımları
const chartData = [
  {
    name: "Bitcoin",
    labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
    data: [30000, 32000, 28000, 40000, 36000, 39000, 42000],
    questions: {
      1: { question: "Why did Bitcoin increase on Day 2?", options: ["New investment", "Market trend", "Partnership", "Whale buying"], correct: 0 },
      2: { question: "Why did Bitcoin drop on Day 3?", options: ["Bad news", "Sell-off", "Market correction", "No reason"], correct: 2 },
      3: { question: "What caused the spike on Day 4?", options: ["Institutional buying", "New regulation", "Technical upgrade", "Rumors"], correct: 0 },
      4: { question: "Why was Day 5 stable?", options: ["Support level", "Low trading volume", "Exchange issue", "No demand"], correct: 0 },
      5: { question: "What caused the dip on Day 6?", options: ["Profit-taking", "Bad news", "Market correction", "Hacking incident"], correct: 0 },
      6: { question: "Why did Bitcoin increase on Day 7?", options: ["Institutional buying", "Retail interest", "Partnership", "Technical upgrade"], correct: 1 },
    },
  },
  {
    name: "Ethereum",
    labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
    data: [2000, 2100, 1900, 2500, 2400, 2300, 2600],
    questions: {
      1: { question: "Why did Ethereum rise on Day 2?", options: ["DeFi adoption", "Market rally", "New upgrade", "Retail interest"], correct: 2 },
      2: { question: "Why did Ethereum drop on Day 3?", options: ["Market correction", "Competition", "Bad news", "Whale selling"], correct: 0 },
      3: { question: "What caused the spike on Day 4?", options: ["Institutional buying", "New dApp", "NFT boom", "Market speculation"], correct: 2 },
      4: { question: "Why was Day 5 stable?", options: ["Support level", "Low trading volume", "Exchange stability", "No reason"], correct: 0 },
      5: { question: "What caused the drop on Day 6?", options: ["Profit-taking", "Security breach", "Market trend", "Regulation"], correct: 0 },
      6: { question: "Why did Ethereum increase on Day 7?", options: ["DeFi boom", "NFT adoption", "Retail interest", "Whale buying"], correct: 1 },
    },
  },
  {
    name: "Binance Coin",
    labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
    data: [350, 370, 340, 390, 380, 370, 400],
    questions: {
      1: { question: "Why did Binance Coin increase on Day 2?", options: ["Exchange usage", "Market rally", "Technical update", "Retail adoption"], correct: 0 },
      2: { question: "Why did Binance Coin drop on Day 3?", options: ["Market correction", "Competitor rise", "Profit-taking", "Bad news"], correct: 2 },
      3: { question: "What caused the spike on Day 4?", options: ["Exchange volume", "Market speculation", "Technical update", "Retail buying"], correct: 0 },
      4: { question: "Why was Day 5 stable?", options: ["Low volatility", "Support level", "Exchange stability", "No reason"], correct: 1 },
      5: { question: "What caused the dip on Day 6?", options: ["Profit-taking", "Market news", "Retail panic", "Whale selling"], correct: 0 },
      6: { question: "Why did Binance Coin increase on Day 7?", options: ["Whale buying", "Retail speculation", "Exchange growth", "Market rally"], correct: 2 },
    },
  },
];

const ChartQuizSection = () => {
  const [selectedChart, setSelectedChart] = useState(0); // Mevcut seçilen grafik (0: Bitcoin, 1: Ethereum, 2: Binance Coin)
  const [selectedPoint, setSelectedPoint] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleChartClick = (event, elements) => {
    if (elements && elements.length > 0) {
      const index = elements[0].index + 1; // Gün (Day 1 - Day 7)
      const currentQuestions = chartData[selectedChart].questions;
      if (currentQuestions[index]) {
        setSelectedPoint(index); // Seçilen gün
        setSelectedOption(null); // Önceki cevabı sıfırla
        setIsAnswered(false); // Sorunun yanıtlanma durumunu sıfırla
      }
    }
  };

  const handleOptionClick = (index) => {
    setSelectedOption(index); // Kullanıcının seçimini güncelle
    setIsAnswered(true); // Sorunun yanıtlandığını işaretle
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold text-blue-600 text-center">
        {chartData[selectedChart].name} Price Trend Quiz
      </h2>

      {/* Grafik Geçişi */}
      <div className="flex justify-center mb-6">
        {chartData.map((chart, index) => (
          <button
            key={index}
            onClick={() => {
              setSelectedChart(index); // Grafik değiştir
              setSelectedPoint(null); // Soruyu sıfırla
              setIsAnswered(false); // Cevap sıfırla
            }}
            className={`px-4 py-2 rounded-lg mx-2 ${
              selectedChart === index
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
            }`}
          >
            {chart.name}
          </button>
        ))}
      </div>

      {/* Grafik */}
      <div className="w-full md:w-2/3 mx-auto">
        <Line
          data={{
            labels: chartData[selectedChart].labels,
            datasets: [
              {
                label: `${chartData[selectedChart].name} Price ($)`,
                data: chartData[selectedChart].data,
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
            onClick: (event, elements) => handleChartClick(event, elements),
          }}
        />
      </div>

      {/* Soru Bölümü */}
      {selectedPoint && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold">
            {chartData[selectedChart].questions[selectedPoint].question}
          </h3>
          <div className="mt-4">
            {chartData[selectedChart].questions[selectedPoint].options.map(
              (option, index) => (
                <button
                  key={index}
                  onClick={() => handleOptionClick(index)}
                  className={`block w-full p-2 rounded-lg mt-2 text-left border ${
                    isAnswered && index === chartData[selectedChart].questions[selectedPoint].correct
                      ? "bg-green-500 text-white"
                      : isAnswered && index === selectedOption
                      ? "bg-red-500 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  disabled={isAnswered}
                >
                  {option}
                </button>
              )
            )}
          </div>
          {isAnswered && (
            <p className="mt-4 text-lg font-semibold">
              {selectedOption ===
              chartData[selectedChart].questions[selectedPoint].correct
                ? "✅ Correct Answer!"
                : "❌ Wrong Answer. Try Again!"}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ChartQuizSection;
