import React from "react";
import TrendingCoins from "../components/TrendingCoins";
import TopExchanges from "../components/TopExchanges.jsx";

function Home() {
  return (
    <div className="flex justify-around items-start p-8 bg-gray-100">
      <TrendingCoins />       
      <TopExchanges />

    </div>
  );
}

export default Home;
