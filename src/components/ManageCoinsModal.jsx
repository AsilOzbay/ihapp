import React, { useState, useEffect } from 'react';
import { useSelectedCoins } from '../context/SelectedCoinsContext';

const AVAILABLE_COINS = [
  'BTC', 'ETH', 'BNB', 'XRP', 'ADA', 'DOGE', 'MATIC', 'SOL', 'DOT', 'SHIB',
  'TRX', 'LTC', 'LINK', 'AVAX', 'UNI', 'ATOM', 'ETC', 'XLM', 'BCH', 'APT',
  'APE', 'FIL', 'NEAR', 'QNT', 'AAVE', 'AXS', 'SAND', 'VET', 'EGLD', 'EOS'
];

const ManageCoinsModal = ({ onClose }) => {
  const { selectedCoins, setSelectedCoins } = useSelectedCoins();
  const [localSelectedCoins, setLocalSelectedCoins] = useState([]);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setLocalSelectedCoins(selectedCoins);
  }, [selectedCoins]);

  const handleToggle = (coin) => {
    if (localSelectedCoins.includes(coin)) {
      setLocalSelectedCoins(localSelectedCoins.filter(c => c !== coin));
    } else {
      setLocalSelectedCoins([...localSelectedCoins, coin]);
    }
  };

  const handleSave = async () => {
    await setSelectedCoins(localSelectedCoins);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  const handleSelectAll = () => {
    setLocalSelectedCoins([...AVAILABLE_COINS]);
  };

  const handleClearAll = () => {
    setLocalSelectedCoins([]);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white dark:bg-gray-800 text-black dark:text-white p-6 rounded-lg w-96 max-h-[90vh] overflow-y-auto relative">
        
        <h2 className="text-2xl font-bold mb-4">Select Your Coins</h2>

        {/* Select All / Clear All */}
        <div className="flex justify-between mb-4">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            Select All
          </button>
          <button
            onClick={handleClearAll}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Clear All
          </button>
        </div>

        {/* Coin List */}
        <div className="grid grid-cols-2 gap-2">
          {AVAILABLE_COINS.map((coin) => (
            <label key={coin} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={localSelectedCoins.includes(coin)}
                onChange={() => handleToggle(coin)}
                className="form-checkbox"
              />
              <span>{coin}</span>
            </label>
          ))}
        </div>

        {/* Bottom Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>

        {/* Toast */}
        {saveSuccess && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-3 py-1 rounded shadow-lg animate-pulse">
            Saved Successfully!
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCoinsModal;
