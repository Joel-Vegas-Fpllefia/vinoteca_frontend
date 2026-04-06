import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// ESTA ES LA LÍNEA CRÍTICA QUE TE FALTA:
import { useAuth } from './context/AuthContext'; 

import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Componente temporal para que no de error de "Home is not defined"
const Home = () => <h1 className="p-10 text-3xl font-bold text-red-800">🍷 Bienvenido a la Vinacoteca</h1>;

function App() {
  const { user, loading } = useAuth(); // Línea 7: Ahora ya funcionará

  if (loading) return <div className="p-10 text-center">Cargando bodega...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-stone-50 text-gray-900">
        {user && <Navbar />}
        <main className="container mx-auto">
          <Routes>
            <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
            <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;