import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  const fetchTheme = async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      try {
        const res = await axios.get(`http://localhost:5000/settings/${user.id}`);
        if (res.data.theme) {
          setTheme(res.data.theme);
          document.documentElement.classList.toggle('dark', res.data.theme === 'dark');
        }
      } catch (error) {
        console.error('Error fetching theme:', error.message);
      }
    } else {
      const guestTheme = localStorage.getItem('guest_theme');
      if (guestTheme) {
        setTheme(guestTheme);
        document.documentElement.classList.toggle('dark', guestTheme === 'dark');
      }
    }
  };

  useEffect(() => {
    fetchTheme();
  }, []);

  const saveTheme = async (newTheme) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      try {
        await axios.put(`http://localhost:5000/settings/${user.id}`, { theme: newTheme });
      } catch (error) {
        console.error('Error saving theme:', error.message);
      }
    } else {
      localStorage.setItem('guest_theme', newTheme);
    }
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: saveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
