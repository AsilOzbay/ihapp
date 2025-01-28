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
  // State for trade actions
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(crypto?.price || 0);
  const [action, setAction] = useState("");
  const [timeframe, setTimeframe] = useState("1M");
   // Default to 1-day interval
  const [message, setMessage] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().slice(0, 16) // Default to current date and time
  );
  
  
  // State for portfolio management
  const [portfolios, setPortfolios] = useState([]); // List of portfolios
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(""); // Selected portfolio ID

  // Chart state
  const [chartData, setChartData] = useState(null);
  const [yAxisRange, setYAxisRange] = useState(null); // Fixed y-axis range

  if (!crypto) {
  console.log("No crypto selected. `crypto` is:", crypto);
  return null;
}
console.log("TradePage received crypto:", crypto);
  // Fetch Portfolios
  useEffect(() => {
    // Fetch user's portfolios from the server
    const fetchPortfolios = async () => {
      try {
        const userId = JSON.parse(localStorage.getItem("user")).id;
        const response = await fetch(`http://localhost:5000/portfolios?userId=${userId}`);
        const data = await response.json();
        setPortfolios(data);
      } catch (error) {
        console.error("Error fetching portfolios:", error);
      }
    };

    fetchPortfolios();
  }, []);

  useEffect(() => {
    // Fetch chart data for the crypto
    const fetchGraphData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/graph-data/${crypto.symbol}?timeframe=${timeframe}`
        );
        const data = await response.json();
  
        const prices = data.map((point) => point.price);
        const times = data.map((point) => point.time);
  
        const minPrice = Math.min(...prices) * 0.9; // 10% below the lowest price
        const maxPrice = Math.max(...prices) * 1.1; // 10% above the highest price
        setYAxisRange({ min: minPrice, max: maxPrice });
  
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
        console.error("Error fetching graph data:", error);
      }
    };
  
    fetchGraphData();
  }, [crypto.symbol, timeframe]); // <== Add `timeframe` here

  // Handle Trade
  const handleTrade = async () => {
    if (!action) {
      setMessage("Please select Buy or Sell.");
      return;
    }

    if (!selectedPortfolioId) {
      setMessage("Please select a portfolio.");
      return;
    }

    if (quantity <= 0 || price <= 0) {
      setMessage("Please enter valid quantity and price.");
      return;
    }

    const total = (quantity * price).toFixed(2);
    try {
      const response = await fetch(
        `http://localhost:5000/portfolio/${selectedPortfolioId}/transaction`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symbol: crypto.symbol,
            action, // Buy or sell
            quantity, // Number of units
            price, // Price per unit
            total, // Calculated total = quantity * price
            transactionDate, // Date and time of the transaction
          }),
        }
      );

      if (response.ok) {
        setMessage(
          `Successfully ${action === "buy" ? "bought" : "sold"} ${quantity} ${
            crypto.symbol
          } at $${price} each on ${transactionDate}.`
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
        {/* Crypto Details Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-1">
          <h1 className="text-2xl font-bold mb-4">{crypto.symbol}</h1>
          <p className="text-xl font-semibold mb-4 text-green-500">
            ${crypto.price.toLocaleString()}{" "}
            <span
  className={`${
    crypto.change > 0 ? "text-green-500" : "text-red-500"
  }`}
>
  ({crypto.change.toFixed(2)}%)
</span>
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

        {/* Portfolio Selection and Trade Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
          <h2 className="text-lg font-bold mb-4">Trade {crypto.symbol}</h2>

          {/* Portfolio Selection Dropdown */}
          <label className="block text-sm font-bold mb-2">Select Portfolio</label>
          <select
            className="border rounded px-3 py-2 mb-4 w-full"
            value={selectedPortfolioId}
            onChange={(e) => setSelectedPortfolioId(e.target.value)}
          >
            <option value="">-- Select Portfolio --</option>
            {portfolios.map((portfolio) => (
              <option key={portfolio._id} value={portfolio._id}>
                {portfolio.name}
              </option>
            ))}
          </select>

          {/* Trade Input Fields */}
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
  <div className="flex items-center space-x-2">
    <input
      type="number"
      value={price}
      onChange={(e) => setPrice(Number(e.target.value))}
      className="w-full border rounded px-3 py-2"
      step="0.01"
      min="0"
    />
    <button
      onClick={() => setPrice(crypto.price)}
      className="bg-gray-200 text-sm px-3 py-2 rounded"
    >
      Use Real-Time Price
    </button>
  </div>
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
  <label className="block text-sm font-bold mb-2">Transaction Date & Time</label>
  <input
    type="datetime-local"
    value={transactionDate}
    onChange={(e) => setTransactionDate(e.target.value)}
    className="w-full border rounded px-3 py-2"
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
           <p>Add To Portfolio As {action === "buy" ? "Purchase" : action === "sell" ? "Sale" : "Action"}</p>

          </button>
          {message && (
            <p className="mt-4 text-center text-gray-700">{message}</p>
          )}
        </div>
      </div>
      <div className="flex space-x-4 mb-4">
  {[
    { label: "15 Minutes", value: "15m" },
    { label: "Hourly", value: "1h" },
    { label: "Daily", value: "1d" },
    { label: "Monthly", value: "1M" },
  ].map(({ label, value }) => (
    <button
      key={value}
      onClick={() => setTimeframe(value)}
      className={`px-4 py-2 rounded ${
        timeframe === value ? "bg-blue-500 text-white" : "bg-gray-200"
      }`}
    >
      {label}
    </button>
  ))}
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
    interaction: {
      mode: "index", // Shows tooltip for the x-axis position, even between points
      intersect: false, // Allows hovering anywhere on the line, not just on points
      axis: "x", // Forces tracking along the x-axis continuously
    },
    plugins: {
      tooltip: {
        position: "nearest", // Positions tooltip nearest to mouse cursor
        callbacks: {
          title: function (tooltipItems) {
            if (!tooltipItems.length) return "";
            const index = tooltipItems[0].dataIndex;
            const dateLabel = chartData.labels[index];

            const formattedDate = new Date(dateLabel).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            });

            return `Date: ${formattedDate}`;
          },
          label: function (tooltipItem) {
            const price = tooltipItem.raw?.toFixed(2) || "N/A";
            return `Price: $${price}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          callback: function (value, index) {
            const dateLabel = chartData.labels[index];
            if (!dateLabel) return "N/A";

            const formattedTime = new Date(dateLabel).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return formattedTime;
          },
        },
      },
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