import React, { useState, useEffect } from "react";

const TopLosers = () => {
  const [timeframe, setTimeframe] = useState("daily");
  const [losersData, setLosersData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLosers = async (tf) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/losers?timeframe=${tf}`
      );
      const result = await response.json();
      setLosersData(result.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching losers:", error.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLosers(timeframe);
  }, [timeframe]);

  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
  };

  if (loading) return <p className="text-gray-600 dark:text-gray-400">Loading...</p>;

  return (
    <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Top 5 {timeframe} Losers</h2>

      <div className="mb-4">
        <select
          value={timeframe}
          onChange={handleTimeframeChange}
          className="border px-3 py-2 rounded dark:bg-gray-700 dark:text-white dark:border-gray-600"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <table className="table-auto w-full text-left text-sm">
        <thead>
          <tr className="text-gray-600 dark:text-gray-300">
            <th className="px-4 py-2">Symbol</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Change (%)</th>
          </tr>
        </thead>
        <tbody>
          {losersData
            .filter((coin) => coin.change < 0)
            .map((coin, index) => (
              <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                <td className="px-4 py-2">{coin.symbol}</td>
                <td className="px-4 py-2">
                  ${coin.price ? coin.price.toLocaleString() : "N/A"}
                </td>
                <td className="px-4 py-2 text-red-500">
                  {coin.change ? coin.change.toFixed(2) : 0}%
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopLosers;
