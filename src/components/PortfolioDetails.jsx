import React, { useState, useEffect } from "react";

const PortfolioDetails = ({ portfolioId, onBack }) => {console.log("Portfolio ID:", portfolioId);
  const [portfolio, setPortfolio] = useState(null); // Portfolio data
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState(""); // Error state
  const [holdings, setHoldings] = useState([]); // Holdings breakdown
  console.log("Portfolio ID:", portfolioId);
  useEffect(() => {
    // Fetch portfolio details and calculate holdings
    const fetchPortfolioDetails = async () => {
      try {
        console.log("Portfolio ID:", portfolioId);
        const response = await fetch(`http://localhost:5000/portfolio/${portfolioId}`);
        if (!response.ok) throw new Error("Failed to fetch portfolio details");
        const data = await response.json();

        setPortfolio(data);

        // Calculate holdings from transactions
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

        // Convert holdings object into an array and fetch current prices
        const holdingsArray = Object.keys(calculatedHoldings).map((symbol) => ({
          symbol,
          quantity: calculatedHoldings[symbol].quantity,
          totalCost: calculatedHoldings[symbol].totalCost,
        }));

        // Fetch current prices
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

      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">{portfolio.name}</h2>
        <img
          src={portfolio.avatar}
          alt={`${portfolio.name} avatar`}
          className="w-16 h-16 rounded-full mb-4"
        />
        <p className="text-gray-600">Created on: {new Date(portfolio.createdAt).toLocaleDateString()}</p>
        <p className="text-gray-600">Number of Transactions: {portfolio.transactions.length}</p>
      </div>

      {/* Holdings Breakdown */}
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-4">Holdings Breakdown</h3>
        <div className="bg-white rounded-lg shadow-lg p-4">
          {holdings.length === 0 ? (
            <p>No holdings to display.</p>
          ) : (
            <table className="w-full table-auto">
              <thead>
                <tr>
                  <th className="text-left">Asset</th>
                  <th className="text-right">Quantity</th>
                  <th className="text-right">Current Price</th>
                  <th className="text-right">Value</th>
                  <th className="text-right">Profit/Loss</th>
                </tr>
              </thead>
              <tbody>
                {holdings.map((holding) => (
                  <tr key={holding.symbol}>
                    <td>{holding.symbol}</td>
                    <td className="text-right">{holding.quantity.toFixed(2)}</td>
                    <td className="text-right">${holding.currentPrice.toFixed(2)}</td>
                    <td className="text-right">${holding.currentValue.toFixed(2)}</td>
                    <td
                      className={`text-right ${
                        holding.profitLoss >= 0 ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      ${holding.profitLoss.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-xl font-bold mb-4">Transaction History</h3>
        <div className="bg-white rounded-lg shadow-lg p-4">
          {portfolio.transactions.length === 0 ? (
            <p>No transactions available.</p>
          ) : (
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
                        transaction.action === "buy"
                          ? "text-green-500"
                          : "text-red-500"
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
          )}
        </div>
      </div>


    </div>
  );
};

export default PortfolioDetails;
