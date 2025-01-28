import React, { useState, useEffect } from "react";
import axios from "axios";

const RightSidebar = () => {
  const [newsType, setNewsType] = useState("cryptoPanic"); // Default to CryptoPanic news
  const [cryptoPanicNews, setCryptoPanicNews] = useState([]);
  const [dailyAnalysis, setDailyAnalysis] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch both CryptoPanic and Gemini data simultaneously
  const fetchAllNews = async () => {
    try {
      setLoading(true);
      setError(null);

      const cryptoPanicEndpoint = "http://localhost:5000/crypto-news";
      const geminiEndpoint = "http://localhost:5000/geminicrypto-news?lang=en";

      // Fetch both API responses in parallel
      const [cryptoPanicResponse, geminiResponse] = await Promise.all([
        axios.get(cryptoPanicEndpoint),
        axios.get(geminiEndpoint),
      ]);

      // Set the state for CryptoPanic news
      setCryptoPanicNews(cryptoPanicResponse.data.news || []);

      // Set the state for Gemini daily analysis
      setDailyAnalysis(geminiResponse.data.news || "No analysis available.");

      // Set the last updated timestamp
      setLastUpdated(
        geminiResponse.data.lastUpdated
          ? new Date(geminiResponse.data.lastUpdated).toLocaleString()
          : "N/A"
      );
    } catch (err) {
      console.error("Error fetching news:", err);
      setError("Failed to load news. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch news when the component mounts
  useEffect(() => {
    fetchAllNews();
  }, []);

  return (
    <div className="bg-white shadow-lg rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">📢 Crypto News</h2>

      {/* Buttons to switch between news types */}
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

      {/* Loading & Error Handling */}
      {loading ? (
        <p className="text-gray-500">Loading news...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {/* Display news or analysis */}
          <div className="text-gray-700">
            {newsType === "cryptoPanic" ? (
              // Render CryptoPanic news
              <ul className="space-y-2">
                {Array.isArray(cryptoPanicNews) && cryptoPanicNews.length > 0 ? (
                  cryptoPanicNews.map((item, index) => (
                    <li key={index} className="border-b pb-2 mb-2">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500"
                      >
                        {item.title}
                      </a>
                    </li>
                  ))
                ) : (
                  <p>No CryptoPanic news available.</p>
                )}
              </ul>
            ) : (
              // Render Daily Analysis
              <p>{dailyAnalysis}</p>
            )}
          </div>
          <p className="text-sm text-gray-400 mt-2">🕒 Last updated: {lastUpdated}</p>
        </>
      )}
    </div>
  );
};

export default RightSidebar;
