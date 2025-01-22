import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // Kullanıcının mevcut konumunu takip eder

  useEffect(() => {
    // localStorage'dan kullanıcı bilgilerini çek
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/auth'); // Çıkış yaptıktan sonra login sayfasına yönlendir
  };

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
          <Link to="/auth"
                state={{ from: location.pathname }} // Auth sayfasına geldiği yer bilgisini aktar
                className="hover:text-gray-400">Login/Register
          </Link>
          
        )}
      </div>
    </nav>
  );
}
