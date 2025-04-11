import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState('register'); // "register" or "verify"

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await axios.post('http://localhost:5000/register', {
        firstName,
        lastName,
        email,
        password,
      });
      alert('Please check your email for the verification code.');
      setStep('verify'); // Move to verification step
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || 'Registration failed'));
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/verify', {
        email,
        verificationCode,
      });
      alert(res.data.message);
      setIsLogin(true); // Switch to login mode
      setStep('register'); // Reset step
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || 'Verification failed'));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/login', {
        email,
        password,
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      alert(`Login successful! Welcome, ${res.data.user.firstName} ${res.data.user.lastName}`);
      if (from === "/portfolio") {
        navigate(from);
        window.location.reload();
      } else {
        navigate("/");
        window.location.reload();
      }
    } catch (err) {
      alert('Error: ' + (err.response?.data?.message || 'Login failed'));
    }
  };

  return (
    <div className="auth-container flex flex-col items-center justify-center w-full h-screen bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
      <div className="auth-box bg-white dark:bg-gray-800 p-8 rounded-md shadow-md w-96">
        <div className="tabs flex justify-between border-b border-gray-300 dark:border-gray-600 mb-6">
          <button
            className={`text-lg font-semibold pb-2 ${
              isLogin
                ? "border-b-2 border-blue-500 text-black dark:text-white"
                : "text-gray-500 dark:text-gray-400"
            }`}
            onClick={() => setIsLogin(true)}
          >
            Log In
          </button>
          <button
            className={`text-lg font-semibold pb-2 ${
              !isLogin
                ? "border-b-2 border-blue-500 text-black dark:text-white"
                : "text-gray-500 dark:text-gray-400"
            }`}
            onClick={() => {
              setIsLogin(false);
              setStep("register");
            }}
          >
            Sign Up
          </button>
        </div>
  
        {isLogin ? (
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password..."
                className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md">
              Log In
            </button>
          </form>
        ) : step === "register" ? (
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name..."
                className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name..."
                className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password..."
                className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password..."
                className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md">
              Sign Up
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyEmail}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Verification Code</label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter the verification code sent to your email..."
                className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md">
              Verify Email
            </button>
          </form>
        )}
      </div>
    </div>
  );  
};

export default Auth;
