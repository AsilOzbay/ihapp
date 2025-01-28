import React, { useState, useEffect } from "react";
import axios from "axios";

const RightSidebar = () => {
  const [news, setNews] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [language, setLanguage] = useState("en"); // Default to English

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:5000/crypto-news?lang=${language}`);
      setNews(response.data.news);
      setLastUpdated(new Date(response.data.lastUpdated).toLocaleString());
    } catch (err) {
      setError("Failed to load crypto news. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [language]);

  return (
    <div className="bg-white shadow-lg rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">📢 Crypto News</h2>

      {/* Language Switch */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setLanguage("en")}
          className={`px-3 py-1 rounded-l ${language === "en" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Crypto Panic News
        </button>
        
      </div>

      {/* Loading & Error Handling */}
      {loading ? (
        <p className="text-gray-500">Loading crypto news...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <ul className="text-gray-700 space-y-2">
            {news.map((item, index) => (
              <li key={index} className="border-b pb-2 mb-2">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-400 mt-2">🕒 Last updated: {lastUpdated}</p>
        </>
      )}
    </div>
  );
};

export default RightSidebar;
