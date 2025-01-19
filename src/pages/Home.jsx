import React, { useState } from "react";

const Home = () => {
  const [cryptoData, setCryptoData] = useState([
    { id: 1, name: "Bitcoin", symbol: "BTC", price: 3715669.07, change: 0.39, marketCap: 73500000000000, volume: 2000000000000 },
    { id: 2, name: "Ethereum", symbol: "ETH", price: 119409.50, change: 1.89, marketCap: 14400000000000, volume: 1400000000000 },
    { id: 3, name: "XRP", symbol: "XRP", price: 111.63, change: -2.07, marketCap: 6400000000000, volume: 402200000000 },
    { id: 4, name: "Tether", symbol: "USDT", price: 35.40, change: 0.12, marketCap: 4900000000000, volume: 6400000000000 },
    { id: 5, name: "Solana", symbol: "SOL", price: 9619.80, change: 11.62, marketCap: 4700000000000, volume: 1100000000000 },
    { id: 6, name: "BNB", symbol: "BNB", price: 24735.65, change: 1.04, marketCap: 3600000000000, volume: 86500000000 },
    { id: 7, name: "Dogecoin", symbol: "DOGE", price: 13.71, change: -3.82, marketCap: 2000000000000, volume: 263000000000 },
    { id: 8, name: "USDC", symbol: "USDC", price: 35.45, change: 0.00, marketCap: 1700000000000, volume: 757700000000 },
  ]);

  const [sortField, setSortField] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const handleSort = (field) => {
    const order = sortField === field && sortOrder === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortOrder(order);

    const sortedData = [...cryptoData].sort((a, b) => {
      if (field === "name" || field === "symbol") {
        return order === "asc"
          ? a[field].localeCompare(b[field])
          : b[field].localeCompare(a[field]);
      } else {
        return order === "asc" ? a[field] - b[field] : b[field] - a[field];
      }
    });

    setCryptoData(sortedData);
  };

  return (
    <div className="bg-gray-100 min-h-screen p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Crypto Prices</h1>
        <input
          type="text"
          placeholder="Search for an asset"
          className="border rounded-lg p-2 w-1/3"
        />
      </header>

      {/* Table */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">18,063 Assets</h2>
          <p>
            The overall crypto market capitalization is{" "}
            <strong>TRY 123.02 trillion</strong>, representing a{" "}
            <strong>10.40% increase</strong> from last week.
          </p>
        </div>

        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("name")}
              >
                Asset {sortField === "name" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("price")}
              >
                Price {sortField === "price" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("change")}
              >
                Change {sortField === "change" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("marketCap")}
              >
                Mkt Cap {sortField === "marketCap" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
              <th
                className="px-4 py-2 cursor-pointer"
                onClick={() => handleSort("volume")}
              >
                Volume {sortField === "volume" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
              </th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cryptoData.map((crypto) => (
              <tr key={crypto.id} className="border-t border-gray-300">
                <td className="px-4 py-2 flex items-center">
                  <div className="flex items-center space-x-2">
                    <span>{crypto.name}</span>
                    <span className="text-gray-500 text-sm">({crypto.symbol})</span>
                  </div>
                </td>
                <td className="px-4 py-2">{crypto.price.toLocaleString("en-US", { style: "currency", currency: "TRY" })}</td>
                <td
                  className={`px-4 py-2 font-bold ${
                    crypto.change > 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {crypto.change > 0 ? `+${crypto.change}%` : `${crypto.change}%`}
                </td>
                <td className="px-4 py-2">
                  {crypto.marketCap.toLocaleString("en-US", {
                    style: "currency",
                    currency: "TRY",
                  })}
                </td>
                <td className="px-4 py-2">
                  {crypto.volume.toLocaleString("en-US", {
                    style: "currency",
                    currency: "TRY",
                  })}
                </td>
                <td className="px-4 py-2">
                  <button className="bg-blue-500 text-white px-4 py-2 rounded-lg">
                    Trade
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Home;
