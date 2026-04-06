import { useState } from 'react';
import api from '../api/axios';

const ProductCard = ({ producto, tipo }) => {
  const [cantidad, setCantidad] = useState(1);

  const handleAddToCart = async () => {
    try {
      // Ajusta la ruta según tu backend (ej: /cart/add o /cart)
      await api.post('/cart', {
        productoId: producto._id,
        tipo: tipo, // 'vino' o 'cerveza'
        cantidad: Number(cantidad)
      });
      alert(`¡${producto.nombre} añadido al carrito!`);
    } catch (err) {
      console.error("Error al añadir al carrito", err);
      alert("Debes iniciar sesión para añadir productos");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow p-4 flex flex-col">
      <img 
        src={producto.imagen || producto.foto || 'https://via.placeholder.com/150'} 
        alt={producto.nombre} 
        className="w-full h-48 object-contain mb-4"
      />
      <h3 className="text-lg font-bold text-red-900 truncate">{producto.nombre}</h3>
      <p className="text-sm text-gray-500 mb-2 italic">{producto.bodega || producto.marca}</p>
      
      <div className="mt-auto">
        <p className="text-2xl font-black text-gray-800 mb-4">{producto.precio}€</p>
        
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            min="1" 
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="w-16 p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
          />
          <button 
            onClick={handleAddToCart}
            className="flex-1 bg-red-700 text-white py-2 rounded-lg font-bold hover:bg-red-800 transition-colors active:scale-95"
          >
            Añadir 🛒
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;