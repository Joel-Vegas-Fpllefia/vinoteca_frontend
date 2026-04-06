import { useEffect, useState } from 'react';
import api from '../api/axios';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      // PROBEMOS: Si /cart te da 404, intenta con /api/cart o mira tu backend
      const res = await api.get('/cart'); 
      console.log("Datos recibidos del carrito:", res.data);
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
      await api.put('/cart/edit', { id_product, amount: newAmount });
      fetchCart(); 
    } catch (err) {
      alert("No se pudo actualizar la cantidad");
    }
  };

  const removeItem = async (id_product) => {
    try {
      await api.delete('/cart/remove', { data: { id_product } });
      fetchCart();
    } catch (err) {
      alert("No se pudo eliminar el producto");
    }
  };

  if (loading) return <div className="text-center p-10 font-bold">Cargando tu selección...</div>;

  // El truco aquí es usar "cart?.productes?.length" con interrogantes
  // para que si no existe, simplemente devuelva "false" en lugar de fallar.
  const tieneProductos = cart && cart.productes && cart.productes.length > 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-red-800 mb-8 border-b pb-4">Tu Carrito 🛒</h2>
      
      {!tieneProductos ? (
        <div className="bg-gray-50 p-10 rounded-xl text-center border-2 border-dashed">
          <p className="text-gray-500 text-lg italic">Tu carrito está esperando ser llenado con buen vino.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cart.productes.map((item) => (
            <div key={item._id} className="flex items-center justify-between bg-white p-5 shadow-sm rounded-xl border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex-1">
                <p className="font-bold text-gray-900 text-lg">ID Artículo: {item.articleId}</p>
                <span className="inline-block px-2 py-1 rounded-md bg-red-50 text-red-700 text-xs font-bold uppercase tracking-tighter">
                  {item.tipus_article}
                </span>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button 
                    onClick={() => updateQuantity(item.articleId, item.quantitat - 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors">-</button>
                  <span className="px-5 font-black text-gray-700">{item.quantitat}</span>
                  <button 
                    onClick={() => updateQuantity(item.articleId, item.quantitat + 1)}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-red-50 hover:text-red-600 transition-colors">+</button>
                </div>
                
                <button 
                  onClick={() => removeItem(item.articleId)}
                  className="text-gray-400 hover:text-red-600 transition-colors p-2"
                  title="Eliminar producto"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
          
          <div className="mt-10 bg-red-900 p-6 rounded-2xl shadow-xl flex justify-between items-center text-white">
             <div>
               <p className="text-red-200 text-sm">Listo para disfrutar</p>
               <p className="text-xl font-bold italic">Selección Premium Vinacoteca</p>
             </div>
             <button className="bg-white text-red-900 px-10 py-3 rounded-full font-black hover:bg-gray-100 transition-all transform active:scale-95 shadow-lg">
               Pagar Ahora
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;