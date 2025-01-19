import React, { useState } from 'react';
import axios from 'axios';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      // Kullanıcı giriş işlemi
      try {
        const res = await axios.post('http://localhost:5000/login', {
          email,
          password,
        });
        alert('Login successful! Token: ' + res.data.token);
      } catch (err) {
        alert('Error: ' + (err.response?.data?.message || 'Login failed'));
      }
    } else {
      // Kullanıcı kayıt işlemi
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      try {
        await axios.post('http://localhost:5000/register', {
          email,
          password,
        });
        alert('Registration successful!');
        setIsLogin(true); // Başarılı kayıt sonrası giriş ekranına geç
      } catch (err) {
        alert('Error: ' + (err.response?.data?.message || 'Registration failed'));
      }
    }
  };

  return (
    <div className="auth-container flex flex-col items-center justify-center w-full h-screen bg-gray-100">
      <div className="auth-box bg-white p-8 rounded-md shadow-md w-96">
        <div className="tabs flex justify-between border-b mb-6">
          <button
            className={`text-lg font-semibold pb-2 ${isLogin ? 'border-b-2 border-blue-500 text-black' : 'text-gray-500'}`}
            onClick={() => setIsLogin(true)}
          >
            Log In
          </button>
          <button
            className={`text-lg font-semibold pb-2 ${!isLogin ? 'border-b-2 border-blue-500 text-black' : 'text-gray-500'}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email..."
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password..."
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>

          {!isLogin && (
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password..."
                className="w-full px-4 py-2 border rounded-md"
                required
              />
            </div>
          )}

          <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md">
            {isLogin ? 'Log In' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
