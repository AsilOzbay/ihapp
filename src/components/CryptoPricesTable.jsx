import React, { useState, useEffect } from "react";
import axios from "axios";
import TradePage from "./TradePage"; // Import the TradePage component

const CryptoPricesTable = () => {
  const [cryptoData, setCryptoData] = useState([]);
  const [rows, setRows] = useState(30);
  const [loading, setLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState(null); // State for selected crypto

  useEffect(() => {
    // Fetch data from Binance API
    const fetchCryptoData = async () => {
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
          volume: parseFloat(response.data.volume),
          highPrice: parseFloat(response.data.highPrice),
          lowPrice: parseFloat(response.data.lowPrice),
        }));

        setCryptoData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data from Binance API:", error);
      }
    };

    fetchCryptoData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (selectedCrypto) {
    // Render the TradePage if a cryptocurrency is selected
    return <TradePage crypto={selectedCrypto} onBack={() => setSelectedCrypto(null)} />;
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Crypto Prices</h2>
      <table className="table-auto w-full text-left text-sm">
        <thead>
          <tr>
            <th className="px-4 py-2">Symbol</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Change (%)</th>
            <th className="px-4 py-2">Volume</th>
            <th className="px-4 py-2">High (24h)</th>
            <th className="px-4 py-2">Low (24h)</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {cryptoData.slice(0, rows).map((item, index) => (
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
              <td className="px-4 py-2">{item.volume.toLocaleString()}</td>
              <td className="px-4 py-2">${item.highPrice.toLocaleString()}</td>
              <td className="px-4 py-2">${item.lowPrice.toLocaleString()}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => setSelectedCrypto(item)} // Set selected crypto
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
