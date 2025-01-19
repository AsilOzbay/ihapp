import React, { useState, useEffect } from "react";
import TradePage from "./TradePage";

const CryptoPricesTable = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [filters, setFilters] = useState({
    assetType: "All assets",
    timeframe: "1D",
    currency: "TRY",
    rowCount: 30,
  });
  const [sortField, setSortField] = useState("mktCap");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        const response = await fetch("http://localhost:5000/crypto-data"); // Backend endpoint
        const result = await response.json();
        setCryptoData(result.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching crypto data from backend:", error.message);
      }
    };

    fetchCryptoData();
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);

    const sortedData = [...cryptoData].sort((a, b) => {
      if (typeof a[field] === "string") {
        return order === "asc"
          ? a[field].localeCompare(b[field])
          : b[field].localeCompare(a[field]);
      } else {
        return order === "asc" ? a[field] - b[field] : b[field] - a[field];
      }
    });

    setCryptoData(sortedData);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (selectedCrypto) {
    return <TradePage crypto={selectedCrypto} onBack={() => setSelectedCrypto(null)} />;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        {/* Filters */}
        <div className="flex space-x-4">
          <select
            value={filters.assetType}
            onChange={(e) => handleFilterChange("assetType", e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option>All assets</option>
            <option>Tradeable</option>
            <option>New</option>
            <option>Gainers</option>
            <option>Losers</option>
          </select>
          <select
            value={filters.timeframe}
            onChange={(e) => handleFilterChange("timeframe", e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option>1D</option>
            <option>1H</option>
            <option>1W</option>
            <option>1M</option>
            <option>1Y</option>
          </select>
          <select
            value={filters.currency}
            onChange={(e) => handleFilterChange("currency", e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option>TRY</option>
            <option>USD</option>
          </select>
          <select
            value={filters.rowCount}
            onChange={(e) => handleFilterChange("rowCount", parseInt(e.target.value))}
            className="border px-3 py-2 rounded"
          >
            <option>10 rows</option>
            <option>30 rows</option>
            <option>50 rows</option>
          </select>
        </div>
      </div>
      <table className="table-auto w-full text-left text-sm">
        <thead>
          <tr>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("symbol")}
            >
              Asset
            </th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Chart</th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("change")}
            >
              Change (%)
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("mktCap")}
            >
              Mkt Cap
            </th>
            <th
              className="px-4 py-2 cursor-pointer"
              onClick={() => handleSort("volume")}
            >
              Volume
            </th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {cryptoData.slice(0, filters.rowCount).map((item, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{item.symbol}</td>
              <td className="px-4 py-2">${item.price.toLocaleString()}</td>
              <td className="px-4 py-2">Chart Placeholder</td>
              <td
                className={`px-4 py-2 ${
                  item.change > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {item.change.toFixed(2)}%
              </td>
              <td className="px-4 py-2">{item.mktCap?.toLocaleString()}</td>
              <td className="px-4 py-2">{item.volume.toLocaleString()}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => setSelectedCrypto(item)}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  Trade
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CryptoPricesTable;
