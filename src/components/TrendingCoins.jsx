import React, { useState, useEffect } from "react";

const TrendingCoins = () => {
  const [trendingData, setTrendingData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingCoins = async () => {
      try {
        const response = await fetch("http://localhost:5000/trending-coins");
        const result = await response.json();
        setTrendingData(result.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching trending coins:", error.message);
      }
    };

    fetchTrendingCoins();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
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
          {trendingData.map((coin, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{coin.symbol}</td>
              <td className="px-4 py-2">${coin.price.toLocaleString()}</td>
              <td
                className={`px-4 py-2 ${
                  coin.change > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {coin.change.toFixed(2)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrendingCoins;
