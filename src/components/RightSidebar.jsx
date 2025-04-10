// RightSidebar.jsx (button inside WelcomeBanner area)
import React, { useState, useEffect } from "react";
import axios from "axios";

const RightSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [newsType, setNewsType] = useState("cryptoPanic");
  const [cryptoPanicNews, setCryptoPanicNews] = useState([]);
  const [dailyAnalysis, setDailyAnalysis] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const togglePanel = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const fetchAllNews = async () => {
      try {
        setLoading(true);
        const [cryptoPanicRes, geminiRes] = await Promise.all([
          axios.get("http://localhost:5000/crypto-news"),
          axios.get("http://localhost:5000/geminicrypto-news?lang=en"),
        ]);

        setCryptoPanicNews(cryptoPanicRes.data.news || []);
        setDailyAnalysis(geminiRes.data.news || "No analysis available.");
        setLastUpdated(
          geminiRes.data.lastUpdated
            ? new Date(geminiRes.data.lastUpdated).toLocaleString()
            : "N/A"
        );
      } catch (err) {
        console.error("Error fetching news:", err);
        setError("Failed to load news.");
      } finally {
        setLoading(false);
      }
    };

    fetchAllNews();
  }, []);

  return (
    <>
      {/* Button positioned relative to WelcomeBanner section */}
      <div className="absolute top-[72px] right-4 z-50">
        <button
          onClick={togglePanel}
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 shadow-lg"
          title="Toggle News"
        >
          📰
        </button>
      </div>

      {/* Sliding Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[400px] bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out overflow-y-auto p-4 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <h2 className="text-xl font-semibold mb-4">📢 Crypto News</h2>

        <div className="mb-4 flex">
          <button
            onClick={() => setNewsType("cryptoPanic")}
            className={`px-4 py-2 mr-2 rounded ${
              newsType === "cryptoPanic" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            CryptoPanic News
          </button>
          <button
            onClick={() => setNewsType("dailyAnalysis")}
            className={`px-4 py-2 rounded ${
              newsType === "dailyAnalysis" ? "bg-blue-600 text-white" : "bg-gray-200"
            }`}
          >
            Daily Analysis
          </button>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <div className="text-gray-700">
            {newsType === "cryptoPanic" ? (
              <ul className="space-y-2">
                {cryptoPanicNews.length > 0 ? (
                  cryptoPanicNews.map((item, index) => (
                    <li key={index} className="border-b pb-2 mb-2">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {item.title}
                      </a>
                    </li>
                  ))
                ) : (
                  <p>No news available.</p>
                )}
              </ul>
            ) : (
              <p>{dailyAnalysis}</p>
            )}
          </div>
        )}
        <p className="text-sm text-gray-400 mt-2">🕒 Last updated: {lastUpdated}</p>
      </div>
    </>
  );
};

export default RightSidebar;