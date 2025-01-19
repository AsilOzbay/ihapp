import React, { useState, useEffect } from "react";

const TopExchanges = () => {
  const [exchangesData, setExchangesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExchanges = async () => {
      try {
        const response = await fetch("http://localhost:5000/top-exchanges");
        const result = await response.json();
        setExchangesData(result.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching top exchanges:", error.message);
      }
    };

    fetchExchanges();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Top Exchanges</h2>
      <table className="table-auto w-full text-left text-sm">
        <thead>
          <tr>
            <th className="px-4 py-2">Rank</th>
            <th className="px-4 py-2">Exchange</th>
            <th className="px-4 py-2">Volume</th>
            <th className="px-4 py-2">Change</th>
          </tr>
        </thead>
        <tbody>
          {exchangesData.map((exchange, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{exchange.rank}</td>
              <td className="px-4 py-2">{exchange.exchange}</td>
              <td className="px-4 py-2">{exchange.volume}</td>
              <td
                className={`px-4 py-2 ${
                  exchange.change.startsWith("+") ? "text-green-500" : "text-red-500"
                }`}
              >
                {exchange.change}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopExchanges;
