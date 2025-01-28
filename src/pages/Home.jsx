import React from "react";
import TrendingCoins from "../components/TrendingCoins";
import TopExchanges from "../components/TopExchanges";
import CryptoPricesTable from "../components/CryptoPricesTable";
import WelcomeBanner from "../components/WelcomeBanner";
import RightSidebar from "../components/RightSidebar"; // New Sidebar Component

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6 flex">
      {/* Main Content (80%) */}
      <div className="w-4/5 pr-4">
        <WelcomeBanner />
        <h1 className="text-3xl font-bold text-center mb-8">Crypto Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <TrendingCoins />
          <TopExchanges />
        </div>
        <CryptoPricesTable />
      </div>

      {/* Right Sidebar (20%) */}
      <div className="w-1/5 bg-white shadow-lg rounded-lg p-4">
        <RightSidebar />
      </div>
    </div>
  );
};

export default Home;
