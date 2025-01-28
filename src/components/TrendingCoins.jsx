import React, { useState, useEffect } from "react";

const TopGainers = () => {
  // 1) Add a new piece of state to store the timeframe
  const [timeframe, setTimeframe] = useState("daily");

  // 2) Data + loading states
  const [gainersData, setGainersData] = useState([]);
  const [loading, setLoading] = useState(true);

  // 3) Fetch function that hits /gainers?timeframe=XYZ
  const fetchGainers = async (tf) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/gainers?timeframe=${tf}`
      );
      const result = await response.json();
      // result.data should be the top 5 for that timeframe
      setGainersData(result.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching gainers:", error.message);
      setLoading(false);
    }
  };

  // 4) useEffect that calls fetchGainers whenever timeframe changes
  useEffect(() => {
    fetchGainers(timeframe);
  }, [timeframe]);

  // 5) Handler for timeframe changes (if using a dropdown)
  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Top 5 {timeframe} Gainers</h2>

      {/* 6) Render a dropdown or button group for timeframe selection */}
      <div className="mb-4">
        <select value={timeframe} onChange={handleTimeframeChange}>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <table className="table-auto w-full text-left text-sm">
        <thead>
          <tr>
            <th className="px-4 py-2">Symbol</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Change (%)</th>
          </tr>
        </thead>
        <tbody>
          {gainersData
            .filter((coin) => coin.change > 0) // Exclude coins with non-positive changes
            .map((coin, index) => (
              <tr key={index} className="border-t">
                <td className="px-4 py-2">{coin.symbol}</td>
                <td className="px-4 py-2">
                  ${coin.price ? coin.price.toLocaleString() : "N/A"}
                </td>
                <td className="px-4 py-2 text-green-500">
                  {coin.change ? coin.change.toFixed(2) : 0}%
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopGainers;
