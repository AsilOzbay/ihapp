import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import PortfolioCustomization from "../components/PortfolioCustomization";

export default function Portfolio() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null); // User information
  const [isCustomizationVisible, setCustomizationVisible] = useState(false); // Toggle customization view
  const [portfolios, setPortfolios] = useState([]); // List of portfolios
  const [selectedPortfolio, setSelectedPortfolio] = useState(null); // Selected portfolio for customization

  useEffect(() => {
    // Fetch user info from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      // Fetch portfolios for the logged-in user
      fetch(`http://localhost:5000/portfolios?userId=${user.id}`)
        .then((response) => response.json())
        .then((data) => setPortfolios(data))
        .catch((error) => console.error("Error fetching portfolios:", error));
    }
  }, [user]);

  const handleCreatePortfolio = () => {
    if (user) {
      setSelectedPortfolio(null); // Ensure no portfolio is selected
      setCustomizationVisible(true); // Show customization view
    } else {
      navigate("/auth", { state: { from: location.pathname } }); // Redirect to login
    }
  };

  const handleEditPortfolio = (portfolio) => {
    setSelectedPortfolio(portfolio);
    setCustomizationVisible(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow"></header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {!isCustomizationVisible ? (
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Crypto Portfolio Tracker
            </h2>
            <p className="text-gray-600 mb-8">
              Keep track of your profits, losses, and portfolio valuation with our easy-to-use platform.
            </p>
            <div className="space-x-4">
              <button
                onClick={handleCreatePortfolio}
                className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
              >
                Create New Portfolio
              </button>
            </div>
            <div className="mt-12">
              <h3 className="text-2xl font-bold mb-6">Your Portfolios</h3>
              <div className="space-y-4">
                {portfolios.map((portfolio) => (
                  <div
                    key={portfolio._id}
                    className="bg-white shadow rounded-lg p-4 flex justify-between items-center"
                  >
                    <div>
                      <h4 className="text-lg font-bold">{portfolio.name}</h4>
                      <p className="text-gray-600">Transactions: {portfolio.transactions.length}</p>
                    </div>
                    <button
                      onClick={() => handleEditPortfolio(portfolio)}
                      className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                      Edit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <PortfolioCustomization
            portfolio={selectedPortfolio}
            userId={user.id}
            onBack={() => setCustomizationVisible(false)}
          />
        )}
      </main>
    </div>
  );
}
