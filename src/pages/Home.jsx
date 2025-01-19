import React from "react";
import TrendingCoins from "../components/TrendingCoins";
import TopExchanges from "../components/TopExchanges";
import CryptoPricesTable from "../components/CryptoPricesTable";
import WelcomeBanner from "../components/WelcomeBanner";

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <WelcomeBanner />
      <h1 className="text-3xl font-bold text-center mb-8">Crypto Dashboard</h1>

      {/* Trending Coins and Top Exchanges at the top */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <TrendingCoins />
        <TopExchanges />
      </div>

      {/* Crypto Prices Table */}
      <CryptoPricesTable />
    </div>
  );
};

export default Home;