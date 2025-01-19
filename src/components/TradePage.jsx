import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const TradePage = ({ crypto, onBack }) => {
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(crypto?.price || 0);
  const [action, setAction] = useState("");
  const [message, setMessage] = useState("");
  const [chartData, setChartData] = useState(null);
  const [yAxisRange, setYAxisRange] = useState(null); // We'll set once and not depend on it in useEffect

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/graph-data/${crypto.symbol}`
        );
        const data = await response.json();

        const prices = data.map((point) => point.price);
        const times = data.map((point) => point.time);

        // Set the Y-axis range (only once, so no re-render loop)
        const minPrice = Math.min(...prices) * 0.9; // 10% below the lowest price
        const maxPrice = Math.max(...prices) * 1.1; // 10% above the highest price
        setYAxisRange({ min: minPrice, max: maxPrice });

        // Prepare chart data
        setChartData({
          labels: times,
          datasets: [
            {
              label: `${crypto.symbol} Price`,
              data: prices,
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              tension: 0.3,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching graph data:", error.message);
      }
    };

    fetchGraphData();
  }, [crypto.symbol]); 
  // NOTE: Only depend on 'crypto.symbol' so we don't continuously recalc yAxisRange

  const handleTrade = async () => {
    if (!action) {
      setMessage("Please select Buy or Sell.");
      return;
    }

    if (quantity <= 0 || price <= 0) {
      setMessage("Please enter valid quantity and price.");
      return;
    }

    const total = (quantity * price).toFixed(2);
    try {
      const response = await fetch("http://localhost:5000/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: crypto.symbol,
          action,
          quantity,
          price,
          total,
        }),
      });

      if (response.ok) {
        setMessage(
          `Successfully ${
            action === "buy" ? "bought" : "sold"
          } ${quantity} ${crypto.symbol} at $${price} each.`
        );
      } else {
        setMessage("Failed to execute the transaction.");
      }
    } catch (error) {
      console.error("Error executing trade:", error);
      setMessage("An error occurred while processing your request.");
    }
  };

  if (!crypto) return null;

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <button
        onClick={onBack}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-6"
      >
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Crypto Details */}
        <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-1">
          <h1 className="text-2xl font-bold mb-4">{crypto.symbol}</h1>
          <p className="text-xl font-semibold mb-4 text-green-500">
            ${crypto.price.toLocaleString()}{" "}
            <span>({crypto.change.toFixed(2)}%)</span>
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p>
                <strong>High (24h):</strong>
              </p>
              <p>${crypto.highPrice.toLocaleString()}</p>
            </div>
            <div>
              <p>
                <strong>Low (24h):</strong>
              </p>
              <p>${crypto.lowPrice.toLocaleString()}</p>
            </div>
            <div>
              <p>
                <strong>Volume (24h):</strong>
              </p>
              <p>{crypto.volume.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Buy/Sell Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
          <h2 className="text-lg font-bold mb-4">Trade {crypto.symbol}</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-bold mb-2">Action</label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setAction("buy")}
                  className={`px-4 py-2 rounded ${
                    action === "buy"
                      ? "bg-green-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  Buy
                </button>
                <button
                  onClick={() => setAction("sell")}
                  className={`px-4 py-2 rounded ${
                    action === "sell"
                      ? "bg-red-500 text-white"
                      : "bg-gray-200"
                  }`}
                >
                  Sell
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full border rounded px-3 py-2"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Quantity</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full border rounded px-3 py-2"
                step="0.01"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Total</label>
              <p className="text-lg font-bold">
                ${(quantity * price).toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={handleTrade}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full"
          >
            Confirm {action === "buy" ? "Purchase" : "Sale"}
          </button>
          {message && (
            <p className="mt-4 text-center text-gray-700">{message}</p>
          )}
        </div>
      </div>

      {/* Chart Section */}
      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-bold mb-4">{crypto.symbol} Price Chart</h2>
        {chartData ? (
          <div style={{ height: "400px" }}>
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    min: yAxisRange?.min,
                    max: yAxisRange?.max,
                  },
                },
              }}
            />
          </div>
        ) : (
          <p>Loading chart...</p>
        )}
      </div>
    </div>
  );
};

export default TradePage;
