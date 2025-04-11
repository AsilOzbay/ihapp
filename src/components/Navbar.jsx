import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const { theme, setTheme } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null); // Ref tanımı
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/auth');
  };

  // ✅ Click-outside kapatma davranışı
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div className="flex items-center">
        <img
          src="https://i.hizliresim.com/bmkwbe4.png"
          alt="Logo"
          className="h-12 w-12 mr-2"
        />
        <h1 className="text-lg font-bold">INVESTING HUB v2</h1>
      </div>

      <div className="space-x-6 flex items-center">
        <Link to="/" className="hover:text-gray-400">Home</Link>
        <Link to="/portfolio" className="hover:text-gray-400">Portfolio</Link>
        <Link to="/learning-hub" className="hover:text-gray-400">Learning Hub</Link>

        {user ? (
          <div className="flex items-center space-x-4">
            <span className="text-gray-200">{user.firstName} {user.lastName}</span>
            <button onClick={handleLogout} className="hover:text-red-400">
              Logout
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            state={{ from: location.pathname }}
            className="hover:text-gray-400"
          >
            Login/Register
          </Link>
        )}
      </div>

      {/* ⚙️ Tema Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="bg-gray-700 px-2 py-1 rounded"
        >
          ⚙️
        </button>
        {showDropdown && (
          <div className="absolute right-0 mt-2 bg-white dark:bg-gray-800 text-black dark:text-white shadow-md rounded w-40 z-50">
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                setTheme('light');
                setShowDropdown(false);
              }}
            >
              ☀️ Light Mode
            </button>
            <button
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => {
                setTheme('dark');
                setShowDropdown(false);
              }}
            >
              🌙 Dark Mode
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
