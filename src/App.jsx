import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CatalogPage from './pages/CatalogPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import AdminDashboard from './pages/AdminDashboard';

// --- COMPONENTE DE PROTECCIÓN ---
const ProtectedRoute = ({ user, loading, children }) => {
  // 1. Si aún estamos leyendo el localStorage, no hagas nada (espera)
  if (loading) return null; 

  // 2. DEBUG: Verifica que ahora sí salga 'editor'
  console.log("Rol detectado en App.js:", user?.rol);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // CORRECCIÓN: Usamos 'rol' (sin E) porque así viene de tu Backend/LocalStorage
  const rolActual = user.rol?.toLowerCase();
  const esAutorizado = rolActual === 'admin' || rolActual === 'editor';

  if (!esAutorizado) {
    console.warn("Acceso denegado. Tu rol es:", rolActual);
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Añadimos estado de carga

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false); // Ya hemos terminado de mirar el localStorage
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-stone-50">
        <Navbar user={user} />
        
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/carrito" element={<CartPage />} />
          
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute user={user} loading={loading}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes> 
      </div>
    </Router>
  );
}

export default App;