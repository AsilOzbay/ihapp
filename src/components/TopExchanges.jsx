import React from "react";

const TopExchanges = () => {
  const data = [
    { rank: 1, exchange: "Binance", volume: "$20B", change: "2.1%" },
    { rank: 2, exchange: "Coinbase", volume: "$12B", change: "1.5%" },
    { rank: 3, exchange: "Kraken", volume: "$8B", change: "0.8%" },
    { rank: 4, exchange: "Bitfinex", volume: "$5B", change: "-1.2%" },
    { rank: 5, exchange: "KuCoin", volume: "$4B", change: "0.5%" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Top Exchanges</h2>
      <table className="table-auto w-full text-left text-sm">
        <thead>
          <tr>
            <th className="px-4 py-2">#</th>
            <th className="px-4 py-2">Exchange</th>
            <th className="px-4 py-2">Volume</th>
            <th className="px-4 py-2">Change</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-t">
              <td className="px-4 py-2">{item.rank}</td>
              <td className="px-4 py-2">{item.exchange}</td>
              <td className="px-4 py-2">{item.volume}</td>
              <td
                className={`px-4 py-2 ${
                  item.change.startsWith("+") ? "text-green-500" : "text-red-500"
                }`}
              >
                {item.change}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TopExchanges;
