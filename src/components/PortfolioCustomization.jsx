import React, { useState } from "react";
import boyAvatar from "../assets/images/boy_3984629.png";
import girlAvatar from "../assets/images/girl_3984664.png";

const PortfolioCustomization = () => {
  const [isModalOpen, setModalOpen] = useState(false); // Modal durumu
  const [portfolioName, setPortfolioName] = useState(""); // Portfolio adı durumu
  const [selectedAvatar, setSelectedAvatar] = useState(boyAvatar); // Başlangıç avatarı
  const [isChangeAvatar, setChangeAvatar] = useState(false); // Avatar değiştirme durumu
  const [isPortfolioCreated, setPortfolioCreated] = useState(false); // Portföy oluşturma durumu
  const [createdPortfolioName, setCreatedPortfolioName] = useState(""); // Oluşturulan portföy adı

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setPortfolioName(""); // Modal kapatıldığında input temizlenir
    setChangeAvatar(false);
  };

  const handleNameChange = (e) => {
    setPortfolioName(e.target.value);
  };

  const handleAvatarChange = (avatar) => {
    setSelectedAvatar(avatar);
    setChangeAvatar(false);
  };

  const createPortfolio = () => {
    if (portfolioName.trim()) {
      setPortfolioCreated(true); // Portföyün oluşturulmuş olduğunu işaretle
      setCreatedPortfolioName(portfolioName); // Oluşturulan portföy adını kaydet
      closeModal(); // Modalı kapat
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12">
      {!isPortfolioCreated ? (
        <>
          {/* Portföy oluşturma giriş ekranı */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">
              Let’s get started with your first portfolio!
            </h1>
            <p className="text-gray-600">
              Track profits, losses, and valuation all in one place.
            </p>
            <div className="mt-8 w-full max-w-xl">
              <div className="bg-white rounded-lg shadow-md p-4">
                <h2 className="text-lg font-semibold mb-2">Add Transactions Manually</h2>
                <p className="text-sm text-gray-600">
                  Enter all transaction details at your own pace to track your portfolio.
                </p>
                <button
                  onClick={openModal}
                  className="mt-4 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Add Transactions
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        // Portföy detay ekranı
        <div className="w-full max-w-5xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">My Portfolio</h1>
            <button
              onClick={openModal}
              className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600"
            >
              + Create Another Portfolio
            </button>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-6">
              <img
                src={selectedAvatar}
                alt="Avatar"
                className="w-16 h-16 rounded-full mr-4"
              />
              <div>
                <h2 className="text-2xl font-bold">{createdPortfolioName}</h2> {/* Oluşturulan portföy adı */}
                <p className="text-gray-600">$0</p>
              </div>
            </div>
            <p className="text-gray-600">
              This portfolio needs some final touches...
            </p>
            <button className="mt-4 bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600">
              + Add Transaction
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            >
              &times;
            </button>
            {!isChangeAvatar ? (
              // İlk modal - Avatar seçme
              <>
                <h2 className="text-2xl font-bold mb-4">Create Portfolio</h2>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Portfolio Avatar</label>
                  <div className="flex items-center">
                    <img
                      src={selectedAvatar}
                      alt="Avatar"
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <button
                      onClick={() => setChangeAvatar(true)} // Avatar değiştirme ekranını aç
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Change
                    </button>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Portfolio Name</label>
                  <input
                    type="text"
                    placeholder="Enter your portfolio name"
                    value={portfolioName}
                    onChange={handleNameChange}
                    className="w-full border rounded px-3 py-2"
                    maxLength={24}
                  />
                  <p className="text-gray-500 text-sm mt-1">
                    {portfolioName.length}/24 characters
                  </p>
                </div>
                <button
                  onClick={createPortfolio}
                  className={`px-4 py-2 rounded w-full ${
                    portfolioName.trim()
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                  disabled={!portfolioName.trim()}
                >
                  Create Portfolio
                </button>
              </>
            ) : (
              // Avatar değiştirme ekranı
              <>
                <h2 className="text-2xl font-bold mb-4">Change Avatar</h2>
                <p className="text-gray-600 mb-4">
                  How are you feeling about this portfolio?
                </p>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {/* Avatar seçim butonları */}
                  <img
                    src={boyAvatar}
                    alt="Boy Avatar"
                    className={`w-16 h-16 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-500 ${
                      selectedAvatar === boyAvatar ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => handleAvatarChange(boyAvatar)}
                  />
                  <img
                    src={girlAvatar}
                    alt="Girl Avatar"
                    className={`w-16 h-16 rounded-full cursor-pointer hover:ring-2 hover:ring-blue-500 ${
                      selectedAvatar === girlAvatar ? "ring-2 ring-blue-500" : ""
                    }`}
                    onClick={() => handleAvatarChange(girlAvatar)}
                  />
                </div>
                <button
                  onClick={() => setChangeAvatar(false)}
                  className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
                >
                  Save
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioCustomization;