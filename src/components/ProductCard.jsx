import { useState } from 'react';
import api from '../api/axios';

const ProductCard = ({ producto, tipo }) => {
  const [cantidad, setCantidad] = useState(1);

  const handleAddToCart = async () => {
    try {
      await api.post('/cart', {
        productoId: producto._id,
        tipo: tipo,
        cantidad: Number(cantidad)
      });
      alert(`¡${producto.nom} añadido al carrito!`);
    } catch (err) {
      console.error("Error al añadir al carrito", err);
      alert("Debes iniciar sesión para añadir productos");
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all p-4 flex flex-col h-full">
      {/* IMAGEN (foto) */}
      <div className="h-48 w-full flex items-center justify-center mb-4 bg-gray-50 rounded-lg p-2">
        <img 
          src={producto.foto || 'https://via.placeholder.com/150'} 
          alt={producto.nom} 
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {/* TÍTULO (nom) */}
      <h3 className="text-lg font-bold text-red-900 truncate mb-1">
        {producto.nom}
      </h3>

      {/* TIPO Y GRADUACIÓN (tipus y graduacio) */}
      <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider font-semibold">
        {producto.tipus} • {producto.graduacio}% vol.
      </p>

      {/* DESCRIPCIÓN (descripcio) */}
      <p className="text-sm text-gray-600 mb-4 h-10 overflow-hidden leading-tight italic">
        {producto.descripcio || "Sin descripción disponible."}
      </p>
      
      <div className="mt-auto border-t pt-4">
        {/* PRECIO (Cambiado a 'price' que es lo que devuelve tu JSON) */}
        <p className="text-2xl font-black text-gray-800 mb-4">
          {producto.price}€
        </p>
        
        <div className="flex items-center gap-2">
          <input 
            type="number" 
            min="1" 
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
            className="w-16 p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-center font-bold"
          />
          <button 
            onClick={handleAddToCart}
            className="flex-1 bg-red-700 text-white py-2 rounded-lg font-bold hover:bg-red-800 transition-colors active:scale-95 shadow-md"
          >
            Añadir 🛒
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;