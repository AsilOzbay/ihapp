import React from "react";

const TradePage = ({ crypto, onBack }) => {
  if (!crypto) return null;

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      <button
        onClick={onBack}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-6"
      >
        Back
      </button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-1">
          <h1 className="text-2xl font-bold mb-4">{crypto.symbol}</h1>
          <p className="text-xl font-semibold mb-4 text-green-500">
            ${crypto.price.toLocaleString()} <span>({crypto.change.toFixed(2)}%)</span>
          </p>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p><strong>High (24h):</strong></p>
              <p>${crypto.highPrice.toLocaleString()}</p>
            </div>
            <div>
              <p><strong>Low (24h):</strong></p>
              <p>${crypto.lowPrice.toLocaleString()}</p>
            </div>
            <div>
              <p><strong>Volume (24h):</strong></p>
              <p>{crypto.volume.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex space-x-4">
            <button className="bg-green-500 text-white px-4 py-2 rounded w-full">
              Buy {crypto.symbol}
            </button>
            <button className="bg-red-500 text-white px-4 py-2 rounded w-full">
              Sell {crypto.symbol}
            </button>
          </div>
        </div>

        {/* Placeholder for Chart */}
        <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
          <h2 className="text-lg font-bold mb-4">Price Chart</h2>
          <div className="h-64 bg-gray-200 flex items-center justify-center">
            <p className="text-gray-500">Chart Placeholder</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradePage;
