import React, { useState, useEffect } from "react";
import { PieChart, Pie, Tooltip, Cell } from "recharts";

const PortfolioDetails = ({ portfolioId, onBack }) => {
  const [portfolio, setPortfolio] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [holdings, setHoldings] = useState([]);

  useEffect(() => {
    const fetchPortfolioDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/portfolio/${portfolioId}`);
        if (!response.ok) throw new Error("Failed to fetch portfolio details");
        const data = await response.json();
        setPortfolio(data);

        const calculatedHoldings = {};
        data.transactions.forEach((transaction) => {
          const { symbol, action, quantity, price } = transaction;
          if (!calculatedHoldings[symbol]) {
            calculatedHoldings[symbol] = { quantity: 0, totalCost: 0 };
          }

          if (action === "buy") {
            calculatedHoldings[symbol].quantity += quantity;
            calculatedHoldings[symbol].totalCost += quantity * price;
          } else if (action === "sell") {
            calculatedHoldings[symbol].quantity -= quantity;
            calculatedHoldings[symbol].totalCost -= quantity * price;
          }
        });

        const holdingsArray = Object.keys(calculatedHoldings).map((symbol) => ({
          symbol,
          quantity: calculatedHoldings[symbol].quantity,
          totalCost: calculatedHoldings[symbol].totalCost,
        }));

        const pricesResponse = await fetch(`http://localhost:5000/crypto-data`);
        const pricesData = await pricesResponse.json();
        const updatedHoldings = holdingsArray.map((holding) => {
          const currentPrice = pricesData.data.find(
            (crypto) => crypto.symbol === holding.symbol
          )?.price;
          const currentValue = holding.quantity * (currentPrice || 0);
          const profitLoss = currentValue - holding.totalCost;

          return {
            ...holding,
            currentPrice: currentPrice || 0,
            currentValue,
            profitLoss,
          };
        });

        setHoldings(updatedHoldings);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPortfolioDetails();
  }, [portfolioId]);

  const totalInvested = holdings.reduce((sum, h) => sum + h.totalCost, 0);
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalProfitLoss = totalValue - totalInvested;

  const chartData = holdings.map((h) => ({
    name: h.symbol,
    value: h.currentValue,
  }));

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a4de6c"];

  if (isLoading) return <p>Loading portfolio details...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <button
        onClick={onBack}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-6"
      >
        Back
      </button>
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h3 className="text-xl font-bold mb-4">Portfolio Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-gray-600">Total Value</p>
            <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Total Invested</p>
            <p className="text-2xl font-bold">${totalInvested.toFixed(2)}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Profit/Loss</p>
            <p
              className={`text-2xl font-bold ${
                totalProfitLoss >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              ${totalProfitLoss.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h3 className="text-xl font-bold mb-4">Holdings Distribution</h3>
        <PieChart width={400} height={400}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#8884d8"
            label
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-2xl font-bold mb-4">{portfolio.name}</h2>
        <img
          src={portfolio.avatar}
          alt={`${portfolio.name} avatar`}
          className="w-16 h-16 rounded-full mb-4"
        />
        <p className="text-gray-600">Created on: {new Date(portfolio.createdAt).toLocaleDateString()}</p>
        <p className="text-gray-600">Number of Transactions: {portfolio.transactions.length}</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h3 className="text-xl font-bold mb-4">Transaction History</h3>
        <table className="w-full table-auto">
          <thead>
            <tr>
              <th className="text-left">Date</th>
              <th className="text-left">Action</th>
              <th className="text-right">Asset</th>
              <th className="text-right">Quantity</th>
              <th className="text-right">Price</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {portfolio.transactions.map((transaction) => (
              <tr key={transaction._id}>
                <td>{new Date(transaction.date).toLocaleDateString()}</td>
                <td
                  className={`${
                    transaction.action === "buy" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {transaction.action.toUpperCase()}
                </td>
                <td className="text-right">{transaction.symbol}</td>
                <td className="text-right">{transaction.quantity.toFixed(2)}</td>
                <td className="text-right">${transaction.price.toFixed(2)}</td>
                <td className="text-right">
                  ${(transaction.quantity * transaction.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PortfolioDetails;
