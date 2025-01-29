import React, { useState, useEffect } from "react";
import { Chart } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { CandlestickController, CandlestickElement } from "chartjs-chart-financial";

ChartJS.register(
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  CandlestickController,
  CandlestickElement
);

const FibonacciGraph = ({ cryptoSymbol }) => {
  const [timeframe, setTimeframe] = useState("7"); // Default: 1 week
  const [ohlcData, setOhlcData] = useState([]); // OHLC data for candlestick chart
  const [labels, setLabels] = useState([]);
  const [fibonacciLevels, setFibonacciLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch OHLC data from backend
  useEffect(() => {
    if (!cryptoSymbol) {
      setError("Invalid cryptocurrency symbol.");
      return;
    }

    const fetchFibonacciData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/fibonacci/${cryptoSymbol}/${timeframe}`);
        if (!response.ok) {
          throw new Error("Failed to fetch Fibonacci data from backend.");
        }

        const { marketChart } = await response.json();
        console.log("Fetched marketChart:", marketChart);

        // Extract price data for candlestick chart
        const ohlc = marketChart.prices.map(([timestamp, close], index, arr) => {
          const open = index === 0 ? close : arr[index - 1][1]; // Open = Previous Close
          const high = Math.max(open, close);
          const low = Math.min(open, close);
          return { x: new Date(timestamp), o: open, h: high, l: low, c: close };
        });

        setOhlcData(ohlc);
        setLabels(ohlc.map((entry) => entry.x.toLocaleDateString("en-US")));

        // Calculate Fibonacci retracement levels
        const high = Math.max(...ohlc.map((entry) => entry.h));
        const low = Math.min(...ohlc.map((entry) => entry.l));

        setFibonacciLevels([
          { label: "0% (High)", value: high },
          { label: "23.6%", value: high - (high - low) * 0.236 },
          { label: "38.2%", value: high - (high - low) * 0.382 },
          { label: "50.0%", value: high - (high - low) * 0.5 },
          { label: "61.8%", value: high - (high - low) * 0.618 },
          { label: "78.6%", value: high - (high - low) * 0.786 },
          { label: "100% (Low)", value: low },
        ]);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching Fibonacci data:", error);
        setError(error.message || "Something went wrong.");
        setLoading(false);
      }
    };

    fetchFibonacciData();
  }, [cryptoSymbol, timeframe]);

  if (loading) return <p>Loading Fibonacci data...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="bg-gray-100 p-6">
      {/* Timeframe Selector */}
      <div className="flex justify-center space-x-4 mb-4">
        {["1", "7", "30", "365"].map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-4 py-2 rounded ${
              timeframe === tf ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
          >
            {tf === "1" ? "1 Day" : tf === "7" ? "1 Week" : tf === "30" ? "1 Month" : "1 Year"}
          </button>
        ))}
      </div>

      {/* Fibonacci Candlestick Chart */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-bold mb-4">Fibonacci Retracement</h2>
        <div style={{ height: "400px" }}>
          <Chart
            type="candlestick"
            data={{
              labels: labels,
              datasets: [
                {
                  label: "Candlestick Data",
                  data: ohlcData,
                  borderColor: "black",
                  borderWidth: 1,
                },
                ...fibonacciLevels.map((level) => ({
                  label: level.label,
                  data: Array(labels.length).fill(level.value), // Horizontal lines
                  borderColor: "rgba(255, 99, 132, 0.5)", // Soft red color
                  borderDash: [5, 5], // Dashed line style
                  pointRadius: 0,
                  borderWidth: 1.5,
                })),
              ],
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: true },
              },
              scales: {
                x: { title: { display: true, text: "Date" } },
                y: { title: { display: true, text: "Price (USD)" } },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default FibonacciGraph;
