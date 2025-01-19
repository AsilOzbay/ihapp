import React, { useState } from "react";

const TopExchanges = () => {
  const [page, setPage] = useState(1);

  const data = {
    1: {
      title: "Top Exchanges",
      exchanges: [
        { rank: 1, name: "Binance", volume: "$20B", change: "2.1%", positive: true },
        { rank: 2, name: "Coinbase", volume: "$12B", change: "1.5%", positive: true },
        { rank: 3, name: "Kraken", volume: "$8B", change: "0.8%", positive: true },
        { rank: 4, name: "Bitfinex", volume: "$5B", change: "-1.2%", positive: false },
        { rank: 5, name: "KuCoin", volume: "$4B", change: "0.5%", positive: true },
      ],
    },
    2: {
      title: "Top Decentralized Exchanges",
      exchanges: [
        { rank: 1, name: "Uniswap", volume: "$3B", change: "2.5%", positive: true },
        { rank: 2, name: "SushiSwap", volume: "$2B", change: "1.8%", positive: true },
        { rank: 3, name: "PancakeSwap", volume: "$1.5B", change: "-0.6%", positive: false },
        { rank: 4, name: "Balancer", volume: "$1.2B", change: "0.4%", positive: true },
        { rank: 5, name: "Curve", volume: "$1B", change: "-1.0%", positive: false },
      ],
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md w-80">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">{data[page].title}</h2>
        <div className="flex space-x-2">
          {[1, 2].map((num) => (
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
            <th>Exchange</th>
            <th>Volume</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          {data[page].exchanges.map((exchange) => (
            <tr key={exchange.rank} className="border-t">
              <td>{exchange.rank}</td>
              <td>{exchange.name}</td>
              <td>{exchange.volume}</td>
              <td
                className={exchange.positive ? "text-green-500" : "text-red-500"}
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
