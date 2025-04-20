// TradePage.jsx
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

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const TradePage = ({ crypto, onBack }) => {
  const [quantity, setQuantity] = useState(0);
  const [price, setPrice] = useState(crypto?.price || 0);
  const [action, setAction] = useState("");
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 16));
  const [message, setMessage] = useState("");
  const [portfolios, setPortfolios] = useState([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState("");
  const [timeframe, setTimeframe] = useState("1M");
  const [chartData, setChartData] = useState(null);
  const [yAxisRange, setYAxisRange] = useState(null);

  useEffect(() => {
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
    const fetchGraphData = async () => {
      try {
        const response = await fetch(`http://localhost:5000/graph-data/${crypto.symbol}?timeframe=${timeframe}`);
        const data = await response.json();
        const prices = data.map((point) => point.price);
        const times = data.map((point) => point.time);
        const min = Math.min(...prices) * 0.95;
        const max = Math.max(...prices) * 1.05;
        setYAxisRange({ min, max });
        setChartData({
          labels: times,
          datasets: [
            {
              label: `${crypto.symbol} Price`,
              data: prices,
              borderColor: "rgba(75,192,192,1)",
              backgroundColor: "rgba(75,192,192,0.2)",
              tension: 0.3,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };
    fetchGraphData();
  }, [crypto.symbol, timeframe]);

  const handleTrade = async () => {
    if (!action || !selectedPortfolioId || quantity <= 0 || price <= 0) {
      setMessage("Please fill all fields correctly.");
      return;
    }
    const total = quantity * price;
    try {
      const response = await fetch(`http://localhost:5000/portfolio/${selectedPortfolioId}/transaction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: crypto.symbol,
          action,
          quantity,
          price,
          total,
          transactionDate,
        }),
      });
      const result = await response.json();
      setMessage(response.ok ? "Trade successful!" : result.message);
    } catch (error) {
      setMessage("Error occurred while processing the trade.");
    }
  };

  if (!crypto) return null;

  return (
    <div className="bg-gray-100 dark:bg-gray-900 text-black dark:text-white min-h-screen p-6">
      <button onClick={onBack} className="bg-blue-500 text-white px-4 py-2 rounded mb-6">Back</button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-4">{crypto.symbol}</h1>
          <p className="text-green-500 text-xl font-semibold">
            ${crypto.price.toLocaleString()} ({crypto.change?.toFixed(2)}%)
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm mt-4">
            {[
              ["High (1h)", crypto.hourlyHigh],
              ["Low (1h)", crypto.hourlyLow],
              ["High (1d)", crypto.dailyHigh],
              ["Low (1d)", crypto.dailyLow],
              ["High (1w)", crypto.weeklyHigh],
              ["Low (1w)", crypto.weeklyLow],
              ["High (1M)", crypto.monthlyHigh],
              ["Low (1M)", crypto.monthlyLow],
              ["Volume (24h)", crypto.volume],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="font-bold">{label}</p>
                <p>{typeof value === "number" ? `$${value.toLocaleString()}` : "Loading..."}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold mb-4">Trade {crypto.symbol}</h2>

          <select className="w-full mb-4 px-3 py-2 border rounded dark:bg-gray-700 dark:text-white" value={selectedPortfolioId} onChange={(e) => setSelectedPortfolioId(e.target.value)}>
            <option value="">-- Select Portfolio --</option>
            {portfolios.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>

          <div className="flex gap-4 mb-4">
            {["buy", "sell"].map((value) => (
              <button
                key={value}
                onClick={() => setAction(value)}
                className={`flex-1 px-4 py-2 rounded ${
                  action === value ? (value === "buy" ? "bg-green-500 text-white" : "bg-red-500 text-white") : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                {value.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700"
              placeholder="Price"
            />
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700"
              placeholder="Quantity"
            />
            <input
              type="datetime-local"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              className="col-span-2 px-3 py-2 border rounded dark:bg-gray-700"
            />
          </div>

          <p className="text-lg font-bold mb-2">Total: ${(price * quantity).toFixed(2)}</p>
          <button onClick={handleTrade} className="w-full bg-blue-500 text-white py-2 rounded">
            Submit Trade
          </button>
          {message && <p className="mt-2 text-center">{message}</p>}
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        {["1m", "15m", "1h", "1d", "1M"].map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-4 py-2 rounded ${timeframe === tf ? "bg-blue-500 text-white" : "bg-gray-300 dark:bg-gray-600"}`}
          >
            {tf}
          </button>
        ))}
      </div>

      <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-bold mb-2">Price Chart</h3>
        <div className="relative h-[400px] w-full overflow-hidden">
        {chartData ? (
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: { y: { min: yAxisRange?.min, max: yAxisRange?.max } },
              plugins: {
                tooltip: {
                  callbacks: {
                    title: (items) => `Time: ${new Date(items[0].label).toLocaleString()}`,
                    label: (item) => `Price: $${item.raw?.toFixed(2)}`,
                  },
                },
              },
            }}
            height={400}
          />
        ) : (
          <p>Loading chart...</p>
        )}
        </div>
      </div>
    </div>
  );
};

export default TradePage;
