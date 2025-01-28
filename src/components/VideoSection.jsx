import React from "react";

const videos = [
  {
    id: 1,
    title: "What is Cryptocurrency?",
    url: "https://www.youtube.com/embed/SSo_EIwHSd4",
  },
  {
    id: 2,
    title: "How Blockchain Works",
    url: "https://www.youtube.com/embed/3xGLc-zz9cA",
  },
  {
    id: 3,
    title: "Understanding Smart Contracts",
    url: "https://www.youtube.com/embed/ZE2HxTmxfrI",
  },
];

const VideoSection = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between h-full">
      <h2 className="text-2xl font-bold mb-4 text-blue-600">Educational Videos</h2>
      {videos.map((video) => (
        <div key={video.id} className="flex-1 mb-6">
          <h3 className="font-semibold text-gray-700 mb-2">{video.title}</h3>
          <iframe
            src={video.url}
            title={video.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-56 rounded-lg"
          ></iframe>
        </div>
      ))}
    </div>
  );
};

export default VideoSection;
