import React from "react";
import VideoSection from "../components/VideoSection";
import QuizSection from "../components/QuizSection";

export default function LearningHub() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-700">
          Welcome to the Learning Hub
        </h1>
        <p className="text-gray-600 mt-2">
          Explore cryptocurrencies and blockchain through videos, quizzes, and coding exercises.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Video Section */}
        <VideoSection />

        {/* Quiz Section */}
        <QuizSection />

    

      </div>


    </div>
  );
}
