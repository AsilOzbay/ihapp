import React, { useEffect, useState } from 'react';
import axios from 'axios';

const WelcomeBanner = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await axios.get('http://localhost:5000/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.user);
      } catch (err) {
        console.error('Error fetching user data', err);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="w-full bg-blue-500 text-white text-center py-4">
      {user ? (
        <h1 className="text-xl font-bold">Hoşgeldiniz, {user.firstName} {user.lastName}!</h1>
      ) : (
        <h1 className="text-xl font-bold">Hoşgeldiniz!</h1>
      )}
    </div>
  );
};

export default WelcomeBanner;
