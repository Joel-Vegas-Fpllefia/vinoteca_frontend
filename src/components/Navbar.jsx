import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-red-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo - Al pulsar vuelve al inicio del catálogo */}
        <Link to="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2 hover:scale-105 transition-transform">
          <span className="text-3xl">🍷</span> VINOTECA JOEL
        </Link>

        {/* Enlaces Principales */}
        <div className="hidden md:flex items-center space-x-8 font-medium">
          {/* Quitamos target="_blank" para que no abra pestañas nuevas */}
          <a href="#vinos-section" className="hover:text-red-200 transition">Vinos</a>
          <a href="#cervezas-section" className="hover:text-red-200 transition">Cervezas</a>
          
          <Link to="/carrito" className="flex items-center gap-1 hover:text-red-200 transition bg-red-800 px-3 py-1 rounded-lg">
            🛒 <span className="font-bold">Carrito</span>
          </Link>
        </div>

        {/* Usuario / Auth */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden sm:inline text-sm bg-red-800 px-3 py-1 rounded-full border border-red-700">
                Hola, <span className="font-bold">{user.nom || user.nombre || 'Usuario'}</span>
              </span>
              <button 
                onClick={handleLogout}
                className="bg-white text-red-900 px-4 py-2 rounded-md font-bold text-sm hover:bg-gray-100 transition active:scale-95"
              >
                Salir
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="hover:text-red-200 font-medium">Login</Link>
              <Link to="/registro" className="bg-white text-red-900 px-4 py-2 rounded-md font-bold text-sm hover:bg-gray-100 transition">
                Registro
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;