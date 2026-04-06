import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CatalogPage from './pages/CatalogPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import AdminDashboard from './pages/AdminDashboard'; // Importa tu nuevo panel

// --- COMPONENTE DE PROTECCIÓN ---
const ProtectedRoute = ({ user, children }) => {
  const rolesPermitidos = ['admin', 'editor'];
  
  // Si aún no sabemos si hay usuario (cargando), podrías retornar un loader
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si el rol no es el adecuado, lo mandamos al catálogo
  if (!rolesPermitidos.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  // Estado para guardar el usuario logueado (puedes usar Context API si el proyecto crece)
  const [user, setUser] = useState(null);

  // Efecto para recuperar el usuario del localStorage al recargar la página
  useEffect(() => {
    const savedUser = localStorage.getItem('user'); // Asegúrate de guardar 'user' al hacer login
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-stone-50">
        {/* Pasamos el usuario a la Navbar para mostrar/ocultar botones */}
        <Navbar user={user} />
        
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/carrito" element={<CartPage />} />
          
          {/* RUTA PROTEGIDA PARA ADMIN/EDITOR */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute user={user}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Redirección por si entran a una ruta que no existe */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes> 
      </div>
    </Router>
  );
}

export default App;