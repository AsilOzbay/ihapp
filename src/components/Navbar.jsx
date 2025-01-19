import { Link } from 'react-router-dom';


export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      {/* Logo */}
      <div className="flex items-center">
        <img
          src="https://i.hizliresim.com/bmkwbe4.png"
          alt="Logo"
          className="h-12 w-12 mr-2"
        />
        <h1 className="text-lg font-bold">INVESTING HUB v2</h1>
      </div>

      {/* Navigation Links */}
      <div className="space-x-6">
        <Link to="/" className="hover:text-gray-400">
          Home
        </Link>
        <Link to="/portfolio" className="hover:text-gray-400">
          Portfolio
        </Link>
        <Link to="/learning-hub" className="hover:text-gray-400">
          Learning Hub
        </Link>
        <Link to="/auth" className="hover:text-gray-400">
          Login/Register
        </Link>
      </div>
    </nav>
  );
}

