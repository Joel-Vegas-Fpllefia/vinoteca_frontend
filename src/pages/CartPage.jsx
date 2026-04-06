import { useEffect, useState } from 'react';
import api from '../api/axios';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Cargar el carrito desde el Backend
  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      console.log("Datos del carrito recibidos:", res.data);
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

  // 2. Editar cantidad (Suma o Resta)
  const updateQuantity = async (id_del_articulo, newAmount) => {
    if (!id_del_articulo) {
      console.error("Error: ID del artículo no encontrado en el objeto");
      return;
    }
    if (newAmount < 1) return;

    console.log("Enviando a editar:", { id_product: id_del_articulo, amount: newAmount });

    try {
      await api.put('/cart/edit', { 
        id_product: id_del_articulo, 
        amount: Number(newAmount) 
      });
      
      await fetchCart(); 
    } catch (err) {
      console.error("Error al editar:", err.response?.data);
      alert("Error al actualizar la cantidad: " + (err.response?.data?.message || "Error del servidor"));
    }
  };

  // 3. Eliminar producto
  const removeItem = async (id_del_articulo) => {
    if (!id_del_articulo) return;
    try {
      await api.delete('/cart/remove', { 
        data: { id_product: id_del_articulo } 
      });
      await fetchCart();
    } catch (err) {
      console.error("Error al eliminar:", err.response?.data);
      alert("No se pudo eliminar el producto");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto mb-4"></div>
        <p className="text-xl font-bold text-red-800">Cargando tu selección...</p>
      </div>
    </div>
  );

  // Validación robusta de los datos del carrito
  const tieneProductos = cart && cart.productos && cart.productos.length > 0;

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 min-h-screen bg-white">
      <header className="mb-12 text-center">
        <h2 className="text-5xl font-black text-red-900 uppercase tracking-tighter mb-2">Mi Bodega</h2>
        <div className="h-1 w-20 bg-red-800 mx-auto rounded-full"></div>
      </header>
      
      {!tieneProductos ? (
        <div className="bg-gray-50 p-20 rounded-3xl text-center border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-xl italic mb-6">Tu carrito está vacío.</p>
          <button 
            onClick={() => window.location.href = '/'} 
            className="bg-red-800 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition"
          >
            Ir a la tienda
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* COLUMNA IZQUIERDA: PRODUCTOS */}
          <div className="lg:col-span-2 space-y-6">
            {cart.productos.map((item, index) => {
              // DETECCIÓN DINÁMICA DEL ID:
              // Intentamos articleId, si no existe probamos _id o productoId
              const idReal = item.articleId || item._id || item.productoId;

              return (
                <div key={index} className="flex flex-col md:flex-row items-center gap-6 bg-white p-6 shadow-sm rounded-3xl border border-gray-100 hover:shadow-lg transition-all duration-300">
                  
                  {/* Imagen del Vino/Cerveza */}
                  <img 
                    src={item.imagen || 'https://via.placeholder.com/150?text=Vino'} 
                    alt={item.nom} 
                    className="w-28 h-28 object-contain rounded-2xl bg-gray-50 p-2 shadow-inner"
                  />

                  {/* Información */}
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-black text-gray-900 text-2xl mb-1">{item.nom}</h3>
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                      <span className="bg-red-50 text-red-700 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">
                        {item.tipus_article || 'Premium'}
                      </span>
                      <span className="text-gray-400 text-sm">Precio: {item.preu_unitari}€</span>
                    </div>
                    <p className="text-red-900 text-lg font-extrabold">Subtotal: {item.subtotal}€</p>
                  </div>
                  
                  {/* Controles */}
                  <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center bg-gray-100 rounded-2xl p-1.5 shadow-inner">
                      <button 
                        onClick={() => updateQuantity(idReal, item.quantitat - 1)}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-red-700 hover:scale-110 active:scale-90 transition-all font-bold">
                        -
                      </button>
                      <span className="px-6 font-black text-gray-800 text-xl">
                        {item.quantitat}
                      </span>
                      <button 
                        onClick={() => updateQuantity(idReal, item.quantitat + 1)}
                        className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-red-700 hover:scale-110 active:scale-90 transition-all font-bold">
                        +
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeItem(idReal)}
                      className="text-gray-400 hover:text-red-600 text-xs font-bold uppercase tracking-widest flex items-center gap-2 group transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* COLUMNA DERECHA: RESUMEN TOTAL */}
          <div className="lg:col-span-1">
            <div className="bg-red-950 text-white p-8 rounded-[2rem] shadow-2xl sticky top-10 overflow-hidden relative">
               {/* Decoración de fondo */}
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-900 rounded-full opacity-20"></div>
               
               <h4 className="text-red-400 uppercase text-xs font-black tracking-[0.2em] mb-10 relative">Detalle de compra</h4>
               
               <div className="flex flex-col gap-2 mb-10 relative">
                 <span className="text-red-200 text-sm">Importe total a pagar</span>
                 <div className="flex items-baseline gap-1">
                   <span className="text-6xl font-black">{cart.granTotal}</span>
                   <span className="text-2xl font-bold text-red-400">€</span>
                 </div>
               </div>

               <button className="w-full bg-white text-red-950 py-5 rounded-2xl font-black text-xl hover:bg-gray-100 transition-all transform active:scale-95 shadow-lg flex justify-center items-center gap-3 group">
                 <span>PAGAR AHORA</span>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
               </button>
               
               <div className="mt-8 pt-8 border-t border-red-900 flex items-center justify-center gap-4">
                 <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 opacity-50 grayscale hover:grayscale-0 transition cursor-pointer" />
                 <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-3 opacity-50 grayscale hover:grayscale-0 transition cursor-pointer" />
               </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default CartPage;