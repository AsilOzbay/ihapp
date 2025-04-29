import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const SelectedCoinsContext = createContext();

export const SelectedCoinsProvider = ({ children }) => {
  const [selectedCoins, setSelectedCoins] = useState([]);

  const fetchSelectedCoins = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      try {
        const res = await axios.get(`http://localhost:5000/settings/${user.id}`);
        if (res.data.selectedCoins) {
          setSelectedCoins(res.data.selectedCoins);
        }
      } catch (error) {
        console.error('Error fetching selected coins:', error.message);
      }
    } else {
      // Guest kullanıcı için localStorage oku
      const guestCoins = localStorage.getItem('guest_selectedCoins');
      if (guestCoins) {
        setSelectedCoins(JSON.parse(guestCoins));
      }
    }
  };

  useEffect(() => {
    fetchSelectedCoins();
  }, []);

  const saveSelectedCoins = async (newSelectedCoins) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      try {
        await axios.put(`http://localhost:5000/settings/${user.id}`, { selectedCoins: newSelectedCoins });
      } catch (error) {
        console.error('Error saving selected coins:', error.message);
      }
    } else {
      // Guest için localStorage'a kaydet
      localStorage.setItem('guest_selectedCoins', JSON.stringify(newSelectedCoins));
    }
    setSelectedCoins(newSelectedCoins);
  };

  const toggleCoin = (coin) => {
    const updatedCoins = selectedCoins.includes(coin)
      ? selectedCoins.filter((c) => c !== coin)
      : [...selectedCoins, coin];
    saveSelectedCoins(updatedCoins);
  };

  const clearSelectedCoins = () => {
    setSelectedCoins([]);
    localStorage.removeItem('guest_selectedCoins'); // Guest localStorage temizle
  };

  return (
    <SelectedCoinsContext.Provider value={{ selectedCoins, setSelectedCoins: saveSelectedCoins, toggleCoin, clearSelectedCoins }}>
      {children}
    </SelectedCoinsContext.Provider>
  );
};

export const useSelectedCoins = () => useContext(SelectedCoinsContext);
