import React from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from "react";
import PortfolioCustomization from "../components/PortfolioCustomization";

export default function Portfolio() {

  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null); // Kullanıcı bilgisi
  const [isCustomizationVisible, setCustomizationVisible] = useState(false); // Render kontrolü

  useEffect(() => {
    // localStorage'dan kullanıcı bilgilerini çek
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Kullanıcıyı state'e ata
    }
  }, []);

  const handleCreatePortfolio = () => {
    if (user) {
      // Kullanıcı giriş yapmışsa özelleştirme sayfasını göster
      setCustomizationVisible(true);
    } else {
      // Giriş yapılmamışsa yönlendirme yap
      navigate("/auth", { state: { from: location.pathname } }) // Ya da navigate ile yönlendirin
    }
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
                Create Your Portfolio
              </button>
            </div>
          </div>
        ) : (
          <PortfolioCustomization /> // Kullanıcı giriş yaptıysa bu bileşeni göster
        )}
      </main>
    </div>
  );
}