import React, { useState, useEffect } from "react";
import axios from "axios";

const TrendingCoins = () => {
  const [trendingData, setTrendingData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from Binance API
    const fetchTrendingData = async () => {
      try {
        const symbols = ["BTCUSDT", "ETHUSDT", "XRPUSDT", "SOLUSDT", "DOGEUSDT"];
        const requests = symbols.map((symbol) =>
          axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
        );

        const responses = await Promise.all(requests);
        const data = responses.map((response) => ({
          symbol: response.data.symbol.replace("USDT", ""),
          price: parseFloat(response.data.lastPrice),
          change: parseFloat(response.data.priceChangePercent),
        }));

        setTrendingData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching trending coins:", error);
      }
    };

    fetchTrendingData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Trending Coins</h2>
      <table className="table-auto w-full text-left text-sm">
        <thead>
          <tr>
            <th className="px-4 py-2">Symbol</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Change (%)</th>
          </tr>
        </thead>
        <tbody>
          {trendingData.map((item, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{item.symbol}</td>
              <td className="px-4 py-2">${item.price.toLocaleString()}</td>
              <td
                className={`px-4 py-2 ${
                  item.change > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {item.change.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrendingCoins;
