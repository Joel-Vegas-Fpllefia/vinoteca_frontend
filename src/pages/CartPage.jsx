import { useEffect, useState } from 'react';
import api from '../api/axios';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Cargar el carrito desde el Backend
  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      console.log("📦 Datos actualizados:", res.data);
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

  // 2. Editar cantidad (con actualización visual inmediata)
  const updateQuantity = async (id_product, newAmount) => {
    if (!id_product || newAmount < 1) return;

    try {
      // Actualización optimista: cambiamos el número en pantalla antes de esperar al server
      setCart(prev => ({
        ...prev,
        productos: prev.productos.map(item => 
          item.articleId === id_product ? { ...item, quantitat: newAmount } : item
        )
      }));

      await api.put('/cart/edit', { id_product, amount: Number(newAmount) });
      await fetchCart(); // Sincronizamos totales reales
    } catch (err) {
      alert("No se pudo actualizar la cantidad");
      fetchCart(); // Revertimos si falla
    }
  };

  // 3. Eliminar producto (desaparece al instante)
  const removeItem = async (id_product) => {
    if (!id_product) return;

    try {
      // Eliminamos visualmente de inmediato
      setCart(prev => ({
        ...prev,
        productos: prev.productos.filter(item => item.articleId !== id_product)
      }));

      await api.delete('/cart/remove', { data: { id_product } });
      await fetchCart(); // Sincronizamos el Gran Total
    } catch (err) {
      console.error("Error al eliminar:", err);
      alert("No se pudo eliminar el producto");
      fetchCart();
    }
  };

  // 4. Finalizar Compra (Checkout)
  const handleCheckout = async () => {
    try {
      const res = await api.post('/cart/checkout');
      
      // Si el backend responde bien
      alert(res.data.message || "¡Pedido realizado con éxito!");
      
      // Limpiamos y redirigimos
      setCart(null);
      window.location.href = "/"; 
      
    } catch (err) {
      console.error("❌ Error en el checkout:", err.response?.data);
      alert("Error al finalizar compra: " + (err.response?.data?.message || "Inténtalo de nuevo"));
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-white">
      <div className="animate-pulse text-red-800 font-black text-2xl uppercase tracking-tighter">
        Abriendo Bodega...
      </div>
    </div>
  );

  const tieneProductos = cart && cart.productos && cart.productos.length > 0;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12 min-h-screen bg-white font-sans">
      <header className="mb-12 text-center">
        <h2 className="text-5xl font-black text-red-900 uppercase tracking-tighter italic">Tu Carrito</h2>
        <div className="h-1.5 w-24 bg-red-800 mx-auto mt-2 rounded-full"></div>
      </header>
      
      {!tieneProductos ? (
        <div className="bg-gray-50 p-20 rounded-[3rem] text-center border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-xl mb-8 font-medium">Parece que tu bodega personal está vacía.</p>
          <a href="/" className="inline-block bg-red-800 text-white px-12 py-4 rounded-full font-black hover:bg-red-700 transition-all shadow-lg active:scale-95">
            EXPLORAR VINOS
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* COLUMNA PRODUCTOS */}
          <div className="lg:col-span-2 space-y-6">
            {cart.productos.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row items-center gap-8 bg-white p-6 shadow-sm rounded-[2rem] border border-gray-100 hover:shadow-xl transition-all duration-300">
                
                <img 
                  src={item.imagen} 
                  alt={item.nom} 
                  className="w-32 h-32 object-contain rounded-2xl bg-gray-50 p-3 shadow-inner"
                />

                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-black text-gray-900 text-2xl mb-1">{item.nom}</h3>
                  <p className="text-gray-400 font-medium mb-3">{item.preu_unitari}€ / unidad</p>
                  <div className="inline-block bg-red-50 text-red-800 px-4 py-1 rounded-full text-sm font-bold">
                    Subtotal: {item.subtotal}€
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center bg-gray-100 rounded-2xl p-1.5 shadow-inner border border-gray-200">
                    <button 
                      onClick={() => updateQuantity(item.articleId, item.quantitat - 1)}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-red-700 font-black transition-transform active:scale-90">-</button>
                    
                    <span className="px-6 font-black text-gray-800 text-xl">
                      {item.quantitat}
                    </span>
                    
                    <button 
                      onClick={() => updateQuantity(item.articleId, item.quantitat + 1)}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-red-700 font-black transition-transform active:scale-90">+</button>
                  </div>

                  <button 
                    onClick={() => removeItem(item.articleId)}
                    className="text-gray-300 hover:text-red-600 transition-colors"
                    title="Eliminar del carrito"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* COLUMNA PAGO */}
          <div className="lg:col-span-1">
            <div className="bg-gray-950 text-white p-10 rounded-[2.5rem] shadow-2xl sticky top-10 overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-red-800 rounded-full opacity-10 -mr-16 -mt-16"></div>
               
               <h4 className="text-gray-500 uppercase text-xs font-black tracking-widest mb-10 border-b border-gray-800 pb-4">
                 Resumen de bodega
               </h4>
               
               <div className="flex flex-col gap-2 mb-12">
                 <span className="text-gray-400 text-sm">Total Final (IVA inc.)</span>
                 <div className="flex items-baseline gap-2">
                   <span className="text-7xl font-black">{cart.granTotal}</span>
                   <span className="text-3xl font-bold text-red-600">€</span>
                 </div>
               </div>

               <button 
                 onClick={handleCheckout}
                 className="w-full bg-red-700 text-white py-6 rounded-2xl font-black text-xl hover:bg-red-600 transition-all transform active:scale-95 shadow-[0_0_20px_rgba(185,28,28,0.4)] flex justify-center items-center gap-3 group"
               >
                 <span>PAGAR AHORA</span>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
               </button>
               
               <div className="mt-10 flex flex-col items-center gap-4 opacity-40">
                 <p className="text-[10px] uppercase tracking-widest font-bold">Métodos Seguros</p>
                 <div className="flex gap-4 grayscale">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" alt="PayPal" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-3" alt="Visa" />
                 </div>
               </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default CartPage;