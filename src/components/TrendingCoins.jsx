import React, { useState } from "react";

const TrendingCoins = () => {
  const [page, setPage] = useState(1);

  const data = {
    1: {
      title: "Trending Coins",
      coins: [
        { rank: 1, name: "TRUMP", price: "$26.89", change: "314.64%", positive: true },
        { rank: 2, name: "SOL", price: "$256.09", change: "16.75%", positive: true },
        { rank: 3, name: "ANDY", price: "$0.064847", change: "2.98%", positive: true },
        { rank: 4, name: "ETH", price: "$3,339.68", change: "3.91%", positive: false },
        { rank: 5, name: "JUP", price: "$1.13", change: "32.90%", positive: true },
      ],
    },
    2: {
      title: "Top Gainers",
      coins: [
        { rank: 1, name: "BTC", price: "$30,000", change: "5.10%", positive: true },
        { rank: 2, name: "ADA", price: "$1.23", change: "12.23%", positive: true },
        { rank: 3, name: "DOGE", price: "$0.067", change: "1.21%", positive: false },
        { rank: 4, name: "MATIC", price: "$2.50", change: "7.30%", positive: true },
        { rank: 5, name: "XRP", price: "$0.50", change: "0.89%", positive: false },
      ],
    },
    3: {
      title: "Top Losers",
      coins: [
        { rank: 1, name: "LTC", price: "$130.50", change: "10.34%", positive: true },
        { rank: 2, name: "SHIB", price: "$0.000008", change: "8.76%", positive: true },
        { rank: 3, name: "DOT", price: "$6.78", change: "3.25%", positive: false },
        { rank: 4, name: "AVAX", price: "$12.34", change: "4.56%", positive: true },
        { rank: 5, name: "BNB", price: "$300.12", change: "2.78%", positive: false },
      ],
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-80">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">{data[page].title}</h2>
        <div className="flex space-x-2">
          {[1, 2, 3].map((num) => (
            <button
              key={num}
              className={`px-3 py-1 rounded-full ${
                page === num ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setPage(num)}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th>#</th>
            <th>Coin</th>
            <th>Price</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          {data[page].coins.map((coin) => (
            <tr key={coin.rank} className="border-t">
              <td>{coin.rank}</td>
              <td>{coin.name}</td>
              <td>{coin.price}</td>
              <td
                className={coin.positive ? "text-green-500" : "text-red-500"}
              >
                {coin.change}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrendingCoins;
