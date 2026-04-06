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
    <nav className="bg-red-900 text-white shadow-lg">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2">
          <span>🍷</span> VINOTECA JOEL
        </Link>

        {/* Enlaces Principales */}
        <div className="hidden md:flex items-center space-x-8 font-medium">
          <Link target="_blank" to="/vinos" className="hover:text-red-200 transition">Vinos</Link>
          <Link to="/cervezas" className="hover:text-red-200 transition">Cervezas</Link>
          <Link target="_blank" to="/carrito" className="flex items-center gap-1 hover:text-red-200 transition">
            🛒 Carrito
          </Link>
        </div>

        {/* Usuario / Auth */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="hidden sm:inline text-sm bg-red-800 px-3 py-1 rounded-full border border-red-700">
                Hola, {user.nombre || 'Usuario'}
              </span>
              <button 
                onClick={handleLogout}
                className="bg-white text-red-900 px-4 py-2 rounded-md font-bold text-sm hover:bg-gray-100 transition"
              >
                Salir
              </button>
            </>
          ) : (
            <div className="space-x-2">
              <Link to="/login" className="hover:underline">Login</Link>
              <Link to="/register" className="bg-white text-red-900 px-4 py-2 rounded-md font-bold text-sm">
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