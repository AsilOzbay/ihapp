import React, { useEffect, useState } from 'react';

const WelcomeBanner = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // localStorage'dan kullanıcı bilgilerini çek
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <div className="w-full bg-blue-500 text-white text-center py-4">
      {user ? (
        <h1 className="text-xl font-bold">Welcome {user.firstName}!</h1>
      ) : (
        <h1 className="text-xl font-bold">Welcome!</h1>
      )}
    </div>
  );
};

export default WelcomeBanner;
