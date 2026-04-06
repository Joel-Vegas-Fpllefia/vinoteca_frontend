import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CatalogPage from './pages/CatalogPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage'
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-stone-50">
        <Navbar />
        {/* El contenedor de las rutas debe estar bien cerrado */}
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/carrito" element={<CartPage />} />
        </Routes> 
      </div>
    </Router>
  );
}

export default App;