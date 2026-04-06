import { useEffect, useState } from 'react';
import api from '../api/axios';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      console.log("📦 Datos íntegros del carrito:", res.data);
      setCart(res.data);
    } catch (err) {
      console.error("❌ Error al obtener el carrito:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (id_product, newAmount) => {
    if (!id_product) {
      alert("Error: No se encuentra el ID del producto en este objeto.");
      return;
    }
    
    try {
      // Enviamos id_product y amount tal cual pide tu controlador
      await api.put('/cart/edit', { 
        id_product: id_product, 
        amount: Number(newAmount) 
      });
      await fetchCart(); 
    } catch (err) {
      console.error("❌ Error 500 al editar:", err.response?.data);
      alert("Error del servidor al editar cantidad");
    }
  };

  const removeItem = async (id_product) => {
    if (!id_product) return;
    try {
      await api.delete('/cart/remove', { data: { id_product } });
      await fetchCart();
    } catch (err) {
      alert("No se pudo eliminar el producto");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50 text-red-800 font-bold">
      Cargando bodega...
    </div>
  );

  const tieneProductos = cart && cart.productos && cart.productos.length > 0;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <h2 className="text-4xl font-black text-red-900 mb-10 text-center uppercase tracking-tighter">Mi Carrito</h2>
      
      {!tieneProductos ? (
        <div className="bg-gray-50 p-20 rounded-3xl text-center border-2 border-dashed">
          <p className="text-gray-400 text-xl italic mb-6">Tu carrito está vacío.</p>
          <a href="/" className="bg-red-800 text-white px-8 py-3 rounded-full font-bold">Volver a la tienda</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          <div className="lg:col-span-2 space-y-6">
            {cart.productos.map((item, index) => {
              
              // --- LÓGICA DE DETECCIÓN DE ID ---
              // Tu backend puede estar enviando el ID en articleId, _id o productoId.
              // Esta línea intenta encontrarlos todos.
              const idParaEnviar = item.articleId || item._id || item.id_product || item.productoId;

              return (
                <div key={index} className="flex flex-col md:flex-row items-center gap-6 bg-white p-6 shadow-sm rounded-3xl border border-gray-100">
                  
                  {/* Imagen */}
                  <img 
                    src={item.imagen} 
                    alt={item.nom} 
                    className="w-24 h-24 object-contain rounded-xl bg-gray-50 p-2"
                  />

                  {/* Info */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-black text-gray-900 text-xl">{item.nom}</h3>
                    <p className="text-sm text-gray-500">{item.preu_unitari}€ / ud.</p>
                    <p className="text-red-700 font-bold mt-1">Subtotal: {item.subtotal}€</p>
                    {/* Debug visual: Si esto sale vacío, el backend no envía el ID */}
                    <p className="text-[10px] text-gray-300 mt-2 uppercase tracking-widest">ID: {idParaEnviar || 'No detectado'}</p>
                  </div>
                  
                  {/* Controles */}
                  <div className="flex items-center bg-gray-100 rounded-2xl p-1 shadow-inner">
                    <button 
                      onClick={() => updateQuantity(idParaEnviar, item.quantitat - 1)}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-red-700 font-bold">-</button>
                    
                    <span className="px-6 font-black text-gray-800 text-lg">
                      {item.quantitat}
                    </span>
                    
                    <button 
                      onClick={() => updateQuantity(idParaEnviar, item.quantitat + 1)}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-red-700 font-bold">+</button>
                  </div>

                  <button 
                    onClick={() => removeItem(idParaEnviar)}
                    className="text-gray-300 hover:text-red-600 p-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* TOTAL */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 text-white p-8 rounded-[2rem] shadow-2xl sticky top-10">
               <h4 className="text-gray-400 uppercase text-xs font-black tracking-widest mb-6">Total Pedido</h4>
               <div className="flex items-baseline gap-2 mb-8">
                 <span className="text-6xl font-black">{cart.granTotal}</span>
                 <span className="text-2xl font-bold text-red-500">€</span>
               </div>
               <button className="w-full bg-red-700 text-white py-5 rounded-2xl font-black text-lg hover:bg-red-600 transition-all transform active:scale-95 shadow-xl">
                 PAGAR AHORA
               </button>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default CartPage;