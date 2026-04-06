import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // DEBUG: Borra esto cuando confirmes que funciona. 
  // Te dirá en la consola qué rol tiene el usuario actual.
  console.log("Usuario actual en Navbar:", user);

  // Verificamos si el usuario tiene permisos (usamos 'rol' que viene del backend)
  // Añadimos .toLowerCase() para evitar errores si en la DB está en mayúsculas
  const esStaff = user?.rol?.toLowerCase() === 'admin' || user?.rol?.toLowerCase() === 'editor';

  return (
    <nav className="bg-red-900 text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold tracking-tighter flex items-center gap-2 hover:scale-105 transition-transform">
          <span className="text-3xl">🍷</span> VINOTECA JOEL
        </Link>

        {/* Enlaces Principales */}
        <div className="hidden md:flex items-center space-x-6 font-medium">
          <a href="/#vinos-section" className="hover:text-red-200 transition text-sm uppercase tracking-wider">Vinos</a>
          <a href="/#cervezas-section" className="hover:text-red-200 transition text-sm uppercase tracking-wider">Cervezas</a>
          
          {/* --- BOTÓN PANEL ADMIN (Solo si esStaff es true) --- */}
          {esStaff && (
            <Link 
              to="/admin" 
              className="flex items-center gap-2 bg-amber-500 text-amber-950 px-4 py-1.5 rounded-lg hover:bg-amber-400 transition shadow-md font-black text-xs uppercase tracking-tighter border-2 border-amber-600"
            >
              ⚙️ <span>Panel Gestión</span>
            </Link>
          )}

          <Link to="/carrito" className="flex items-center gap-1 hover:text-red-200 transition bg-red-800 px-4 py-1.5 rounded-lg border border-red-700 shadow-sm">
            🛒 <span className="font-bold">Carrito</span>
          </Link>
        </div>

        {/* Usuario / Auth */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end leading-none">
                <span className="text-xs text-red-200 font-bold">
                  {user.email}
                </span>
                <span className="text-[10px] uppercase opacity-70 font-black tracking-widest text-amber-400">
                  [{user.rol}]
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-white text-red-900 px-4 py-2 rounded-md font-bold text-sm hover:bg-gray-100 transition active:scale-95 shadow-sm"
              >
                Salir
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="hover:text-red-200 font-medium text-sm">Login</Link>
              <Link to="/registro" className="bg-white text-red-900 px-4 py-2 rounded-md font-bold text-sm hover:bg-gray-100 transition shadow-sm border border-gray-200">
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