import React, { useState, useEffect } from "react";
import TradePage from "./TradePage";

const CryptoPricesTable = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [searchQuery, setSearchQuery] = useState(""); // New state for search input
  const [sortFields, setSortFields] = useState([]); 
  // Filters
  const [filters, setFilters] = useState({
    assetType: "All assets",
    timeframe: "1H",
    currency: "USD", // default currency
    rowCount: 30,
  });

  // Sorting
  const [sortField, setSortField] = useState("mktCap");
  const [sortOrder, setSortOrder] = useState("desc");

  // Hardcoded exchange rates relative to 1 USD
  const conversionRates = {
    USD: 1,
    EUR: 0.90,
    GBP: 0.80,
    TRY: 27, // example USD->TRY
  };

  // Display symbols for each currency
  const currencySymbols = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    TRY: "₺",
  };

  // Fetch data whenever timeframe changes
  useEffect(() => {
    const fetchCryptoData = async () => {
      try {
        // Call your server with the selected timeframe
        const response = await fetch(
          `http://localhost:5000/crypto-data?timeframe=${filters.timeframe}`
        );
        const result = await response.json();

        // Debug: see what the server returned
        console.log("Server data:", result.data);

        setCryptoData(result.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching crypto data from backend:", error.message);
        setLoading(false);
      }
    };

    setLoading(true);
    fetchCryptoData();
  }, [filters.timeframe]);

  // Filter change handler
  const handleFilterChange = async (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  
    // Fetch gainers/losers data when the asset type filter changes
    if (key === "assetType") {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/${value.toLowerCase()}`
        );
        const result = await response.json();
        console.log(`${value} data:`, result.data);
        setCryptoData(result.data);
      } catch (error) {
        console.error(`Error fetching ${value.toLowerCase()} data:`, error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Sort handler
  const handleSort = (field) => {
    // Cycle through default -> ascending -> descending -> default
    let newOrder;
    if (sortField === field) {
      if (sortOrder === "asc") {
        newOrder = "desc"; // Move to descending
      } else if (sortOrder === "desc") {
        newOrder = ""; // Move to default (unsorted)
      } else {
        newOrder = "asc"; // Move to ascending
      }
    } else {
      newOrder = "asc"; // Start with ascending for a new field
    }
  
    setSortField(field); // Update the sort field
    setSortOrder(newOrder); // Update the sort order
  
    // If it's default (""), return unsorted data
    if (newOrder === "") {
      setCryptoData([...cryptoData]); // Use the original data without sorting
      return;
    }
  
    // Otherwise, sort the data
    const sortedData = [...cryptoData].sort((a, b) => {
      const valA = a[field];
      const valB = b[field];
  
      // If it's a string field
      if (typeof valA === "string") {
        return newOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }
  
      // Otherwise, assume numeric
      return newOrder === "asc" ? valA - valB : valB - valA;
    });
  
    setCryptoData(sortedData); // Update the state with sorted data
  };

  // If still loading
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  // If a crypto is selected, show the TradePage
  if (selectedCrypto) {
    // As soon as user selects a crypto, show the TradePage
    return <TradePage crypto={selectedCrypto} onBack={() => setSelectedCrypto(null)} />;
  }
  
  if (loading) {
    // Only show "Loading" if no crypto is currently selected
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Render the table
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Filters */}
      <div className="flex justify-between items-center mb-4">
  <div className="flex space-x-4">
    {/* Gainers/Losers Filter */}
    
    
    {/* Currency Filter */}
    <select
      value={filters.currency}
      onChange={(e) => handleFilterChange("currency", e.target.value)}
      className="border px-3 py-2 rounded"
    >
      <option value="USD">USD</option>
      <option value="EUR">EUR</option>
      <option value="GBP">GBP</option>
      <option value="TRY">TRY</option>
    </select>

    {/* Row Count Filter */}
    <select
      value={filters.rowCount}
      onChange={(e) => handleFilterChange("rowCount", parseInt(e.target.value))}
      className="border px-3 py-2 rounded"
    >
      <option value={10}>10 rows</option>
      <option value={30}>30 rows</option>
      <option value={50}>50 rows</option>
    </select>
  </div>
  <div className="flex justify-between items-center mb-4">
  <div className="flex space-x-4">
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search by name or symbol"
      className="border px-3 py-2 rounded w-full"
    />
  </div>
</div>
</div>

      {/* Table */}
      <table className="table-auto w-full text-left text-sm">
      <thead>
  <tr>
    <th
      className="px-4 py-2 cursor-pointer"
      onClick={() => handleSort("symbol")}
    >
      Asset {sortField === "symbol" && (sortOrder === "asc" ? "▲" : sortOrder === "desc" ? "▼" : "")}
    </th>
    <th
      className="px-4 py-2 cursor-pointer"
      onClick={() => handleSort("price")}
    >
      Price {sortField === "price" && (sortOrder === "asc" ? "▲" : sortOrder === "desc" ? "▼" : "")}
    </th>
    <th className="px-4 py-2">Chart</th>
    <th
      className="px-4 py-2 cursor-pointer"
      onClick={() => handleSort("dailyChange")}
    >
      Daily Change (%) {sortField === "dailyChange" && (sortOrder === "asc" ? "▲" : sortOrder === "desc" ? "▼" : "")}
    </th>
    <th
      className="px-4 py-2 cursor-pointer"
      onClick={() => handleSort("weeklyChange")}
    >
      Weekly Change (%) {sortField === "weeklyChange" && (sortOrder === "asc" ? "▲" : sortOrder === "desc" ? "▼" : "")}
    </th>
    <th
      className="px-4 py-2 cursor-pointer"
      onClick={() => handleSort("monthlyChange")}
    >
      Monthly Change (%) {sortField === "monthlyChange" && (sortOrder === "asc" ? "▲" : sortOrder === "desc" ? "▼" : "")}
    </th>
    <th className="px-4 py-2">
      
    </th>
  </tr>
</thead>
<tbody>
  {cryptoData
    .filter((item) => 
      item.symbol?.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, filters?.rowCount || 10)
    .map((item, index) => {
      // Safely get numeric fields, or fallback to 0
      const currency = filters?.currency || "USD";
      const rate = conversionRates[currency] || 1;
      const symbol = currencySymbols[currency] || "$";

      const price = item.price != null ? item.price : 0;
      const change = item.change != null ? item.change : 0;
      const mktCap = item.mktCap != null ? item.mktCap : 0;
      const volume = item.volume != null ? item.volume : 0;

      // Convert to user-selected currency
      const convertedPrice = price * rate;
      const convertedMktCap = mktCap * rate;
      const convertedVolume = volume * rate;

      // Safely format change values
      const dailyChange = item.dailyChange != null ? item.dailyChange.toFixed(2) : "0.00";
      const weeklyChange = item.weeklyChange != null ? item.weeklyChange.toFixed(2) : "0.00";
      const monthlyChange = item.monthlyChange != null ? item.monthlyChange.toFixed(2) : "0.00";

      return (
        <tr key={item.symbol || index} className="border-t">
          <td className="px-4 py-2">{item.symbol || "N/A"}</td>
          <td className="px-4 py-2">
            {symbol}
            {convertedPrice.toLocaleString()}
          </td>
          <td className="px-4 py-2">Chart Placeholder</td>
          <td className={`px-4 py-2 ${dailyChange > 0 ? "text-green-500" : "text-red-500"}`}>
            {dailyChange}%
          </td>
          <td className={`px-4 py-2 ${weeklyChange > 0 ? "text-green-500" : "text-red-500"}`}>
            {weeklyChange}%
          </td>
          <td className={`px-4 py-2 ${monthlyChange > 0 ? "text-green-500" : "text-red-500"}`}>
            {monthlyChange}%
          </td>
          <td className="px-4 py-2">
  <button
    onClick={() => {
      setSelectedCrypto({
        ...item,
        // Map dailyChange → change
        change: item.dailyChange,
        // If you want high/low in the trade page, pass them too
        highPrice: item.highPrice ?? 0,
        lowPrice: item.lowPrice ?? 0,
      });
    }}
    className="bg-blue-500 text-white px-3 py-1 rounded"
  >
    Trade
  </button>
</td>
        </tr>
      );
    })}
</tbody>
      </table>
    </div>
  );
};

export default CryptoPricesTable;
