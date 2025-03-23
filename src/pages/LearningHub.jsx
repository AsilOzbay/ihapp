import React from "react";
import VideoSection from "../components/VideoSection";
import QuizSection from "../components/QuizSection";
import InfoSection from "../components/InfoSection";
import ChartQuizSection from "../components/ChartQuizSection";

export default function LearningHub() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-700">Welcome to the Learning Hub</h1>
        <p className="text-gray-600 mt-2">
          Explore cryptocurrencies and blockchain through videos, quizzes, and educational articles.
        </p>
      </header>

      {/* İçerikleri Alt Alta Sıralama */}
      <div className="flex flex-col gap-8 items-center">
        {/* Video Bölümü */}
        <div className="w-full max-w-3xl">
          <VideoSection />
        </div>

        {/* Quiz, Bilgi ve Grafik Bölümü */}
        <div className="w-full max-w-3xl flex flex-col gap-6">
          <QuizSection />
          <InfoSection />
          <ChartQuizSection />
        </div>
      </div>
    </div>
  );
}
