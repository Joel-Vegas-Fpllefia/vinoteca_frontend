import { useEffect, useState } from 'react';
import api from '../api/axios';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart'); 
      console.log("Datos recibidos:", res.data);
      setCart(res.data);
    } catch (err) {
      console.error("Error al obtener el carrito:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (id_product, newAmount) => {
    if (newAmount < 1) return;
    try {
      // Enviamos exactamente lo que tu destructuring espera: { id_product, amount }
      await api.put('/cart/edit', { 
        id_product: id_product, 
        amount: Number(newAmount) 
      });
      fetchCart(); 
    } catch (err) {
      console.error("Error al editar:", err.response?.data);
      alert("Error al actualizar: " + (err.response?.data?.error || "Error interno"));
    }
  };

  const removeItem = async (id_product) => {
    try {
      // Algunos backends para DELETE necesitan el body dentro de 'data' en Axios
      await api.delete('/cart/remove', { 
        data: { id_product: id_product } 
      });
      fetchCart();
    } catch (err) {
      console.error("Error al eliminar:", err.response?.data);
      alert("No se pudo eliminar el producto");
    }
  };

  if (loading) return <div className="text-center p-10 font-bold">Cargando tu selección...</div>;

  // Adaptado a tu nueva estructura: res.data.productos
  const tieneProductos = cart && cart.productos && cart.productos.length > 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-red-800 mb-8 border-b pb-4 text-center">Mi Bodega 🍷</h2>
      
      {!tieneProductos ? (
        <div className="bg-gray-50 p-10 rounded-xl text-center border-2 border-dashed">
          <p className="text-gray-500 text-lg italic">El carrito está vacío. ¡Añade algún Reserva!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cart.productos.map((item, index) => (
            <div key={index} className="flex items-center gap-4 bg-white p-4 shadow-sm rounded-xl border border-gray-100">
              {/* Imagen del producto */}
              <img 
                src={item.imagen} 
                alt={item.nom} 
                className="w-20 h-20 object-cover rounded-lg bg-gray-50"
              />

              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">{item.nom}</h3>
                <p className="text-sm text-gray-500">{item.preu_unitari}€ / unidad</p>
                <p className="text-red-700 font-bold">Subtotal: {item.subtotal}€</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button 
                    onClick={() => updateQuantity(item.articleId, item.quantitat - 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:text-red-600">-</button>
                  <span className="px-4 font-black text-gray-700">{item.quantitat}</span>
                  <button 
                    onClick={() => updateQuantity(item.articleId, item.quantitat + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:text-red-600">+</button>
                </div>
                
                <button 
                  onClick={() => removeItem(item.articleId)}
                  className="text-gray-300 hover:text-red-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          
          {/* TOTAL FINAL */}
          <div className="mt-8 bg-gray-900 p-6 rounded-2xl shadow-xl flex justify-between items-center text-white">
             <div>
               <p className="text-gray-400 text-sm uppercase tracking-widest">Total a pagar</p>
               <p className="text-4xl font-black">{cart.granTotal}€</p>
             </div>
             <button className="bg-red-700 text-white px-10 py-4 rounded-xl font-black hover:bg-red-600 transition-all transform active:scale-95 shadow-lg">
               FINALIZAR PEDIDO
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;