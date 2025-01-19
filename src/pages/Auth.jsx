import React, { useState } from 'react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true); // State to toggle between Login and Sign Up

  return (
    <div className="auth-container flex flex-col items-center justify-center w-full h-screen bg-gray-100">
      <div className="auth-box bg-white p-8 rounded-md shadow-md w-96">
        <div className="tabs flex justify-between border-b mb-6">
          <button
            className={`text-lg font-semibold pb-2 ${
              isLogin ? 'border-b-2 border-blue-500 text-black' : 'text-gray-500'
            }`}
            onClick={() => setIsLogin(true)}
          >
            Log In
          </button>
          <button
            className={`text-lg font-semibold pb-2 ${
              !isLogin ? 'border-b-2 border-blue-500 text-black' : 'text-gray-500'
            }`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        {isLogin ? (
          <form className="login-form">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email address..."
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="Enter your password..."
                  className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                >
                  👁️
                </button>
              </div>
              <a href="#" className="text-sm text-blue-500 hover:underline mt-2 inline-block">
                Forgot password?
              </a>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
            >
              Log In
            </button>
          </form>
        ) : (
          <form className="signup-form">
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your email address..."
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Create a password..."
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="Confirm your password..."
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-200"
            >
              Sign Up
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Auth;
