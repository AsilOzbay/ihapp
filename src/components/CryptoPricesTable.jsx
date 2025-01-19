import React, { useState } from "react";

const CryptoPricesTable = () => {
  const [timeframe, setTimeframe] = useState("1D");
  const [currency, setCurrency] = useState("TRY");
  const [rows, setRows] = useState(30);

  const data = [
    { asset: "Bitcoin", symbol: "BTC", price: 3715669, chart: "↗️", change: "+0.39%", mktCap: 73500000000, volume: 2000000000 },
    { asset: "Ethereum", symbol: "ETH", price: 119409.50, chart: "↗️", change: "+1.89%", mktCap: 14400000000, volume: 1400000000 },
    { asset: "XRP", symbol: "XRP", price: 111.63, chart: "↘️", change: "-2.07%", mktCap: 6400000000, volume: 402200000 },
    { asset: "Tether", symbol: "USDT", price: 35.40, chart: "→", change: "+0.12%", mktCap: 4900000000, volume: 640000000 },
    { asset: "Solana", symbol: "SOL", price: 9619.80, chart: "↗️", change: "+11.62%", mktCap: 4700000000, volume: 1100000000 },
  ];

  const currencySymbols = {
    TRY: "₺",
    USD: "$",
    EUR: "€",
  };

  // Adjust price for selected currency (dummy conversion rates)
  const conversionRates = { TRY: 1, USD: 0.036, EUR: 0.033 };

  const displayedData = data
    .map((item) => ({
      ...item,
      price: (item.price * conversionRates[currency]).toFixed(2),
      mktCap: (item.mktCap * conversionRates[currency]).toFixed(2),
      volume: (item.volume * conversionRates[currency]).toFixed(2),
    }))
    .slice(0, rows);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Crypto Prices</h2>
        <div className="flex space-x-4">
          {/* Timeframe Dropdown */}
          <div className="relative">
            <button className="border px-3 py-1 rounded" onClick={() => document.getElementById("timeframe-menu").classList.toggle("hidden")}>
              {timeframe} ⌄
            </button>
            <div id="timeframe-menu" className="absolute bg-white border rounded mt-1 hidden">
              {["1H", "1D", "1W", "1M", "1Y"].map((option) => (
                <div
                  key={option}
                  className={`px-3 py-1 cursor-pointer ${timeframe === option ? "bg-gray-200" : ""}`}
                  onClick={() => {
                    setTimeframe(option);
                    document.getElementById("timeframe-menu").classList.add("hidden");
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>

          {/* Currency Dropdown */}
          <div className="relative">
            <button className="border px-3 py-1 rounded" onClick={() => document.getElementById("currency-menu").classList.toggle("hidden")}>
              {currency} ⌄
            </button>
            <div id="currency-menu" className="absolute bg-white border rounded mt-1 hidden">
              {["TRY", "USD", "EUR"].map((option) => (
                <div
                  key={option}
                  className={`px-3 py-1 cursor-pointer ${currency === option ? "bg-gray-200" : ""}`}
                  onClick={() => {
                    setCurrency(option);
                    document.getElementById("currency-menu").classList.add("hidden");
                  }}
                >
                  {option}
                </div>
              ))}
            </div>
          </div>

          {/* Rows Dropdown */}
          <div className="relative">
            <button className="border px-3 py-1 rounded" onClick={() => document.getElementById("rows-menu").classList.toggle("hidden")}>
              {rows} rows ⌄
            </button>
            <div id="rows-menu" className="absolute bg-white border rounded mt-1 hidden">
              {[5, 10, 30].map((option) => (
                <div
                  key={option}
                  className={`px-3 py-1 cursor-pointer ${rows === option ? "bg-gray-200" : ""}`}
                  onClick={() => {
                    setRows(option);
                    document.getElementById("rows-menu").classList.add("hidden");
                  }}
                >
                  {option} rows
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <table className="table-auto w-full text-left">
        <thead>
          <tr>
            <th className="px-2 py-2">Asset</th>
            <th className="px-2 py-2">Price ({currencySymbols[currency]})</th>
            <th className="px-2 py-2">Chart</th>
            <th className="px-2 py-2">Change</th>
            <th className="px-2 py-2">Mkt Cap ({currencySymbols[currency]})</th>
            <th className="px-2 py-2">Volume ({currencySymbols[currency]})</th>
            <th className="px-2 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedData.map((item, index) => (
            <tr key={index} className="border-t">
              <td className="px-2 py-2">{item.asset}</td>
              <td className="px-2 py-2">{item.price}</td>
              <td className="px-2 py-2">{item.chart}</td>
              <td
                className={`px-2 py-2 ${
                  item.change.startsWith("+") ? "text-green-500" : "text-red-500"
                }`}
              >
                {item.change}
              </td>
              <td className="px-2 py-2">{item.mktCap}</td>
              <td className="px-2 py-2">{item.volume}</td>
              <td className="px-2 py-2">
                <button className="bg-blue-500 text-white rounded px-3 py-1">Trade</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CryptoPricesTable;
