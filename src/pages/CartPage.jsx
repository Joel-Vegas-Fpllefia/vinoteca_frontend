import { useEffect, useState } from 'react';
import api from '../api/axios';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Obtener los datos del carrito
  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      console.log("📦 Datos del carrito (con IDs):", res.data);
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

  // 2. Editar cantidad (Suma o Resta)
  const updateQuantity = async (id_product, newAmount) => {
    if (!id_product) {
      alert("Error: No se ha detectado el ID del producto.");
      return;
    }
    if (newAmount < 1) return;

    try {
      // Enviamos exactamente lo que tu destructuring espera: { id_product, amount }
      await api.put('/cart/edit', { 
        id_product: id_product, 
        amount: Number(newAmount) 
      });
      
      // Refrescamos los datos inmediatamente
      await fetchCart(); 
    } catch (err) {
      console.error("❌ Error al editar:", err.response?.data);
      alert("No se pudo actualizar la cantidad");
    }
  };

  // 3. Eliminar producto
  const removeItem = async (id_product) => {
  if (!id_product) return;

  try {
    // 1. Llamada al backend para borrar
    await api.delete('/cart/remove', { 
      data: { id_product: id_product } 
    });

    // 2. ACTUALIZACIÓN MANUAL DEL ESTADO (Para que desaparezca de la vista YA)
    setCart(prevCart => ({
      ...prevCart,
      productos: prevCart.productos.filter(item => item.articleId !== id_product)
    }));

    // 3. Opcional: Recargar datos reales del servidor para actualizar el Gran Total
    await fetchCart();

    console.log("Producto eliminado y vista actualizada");
  } catch (err) {
    console.error("❌ Error al eliminar:", err);
    alert("No se pudo eliminar el producto de la base de datos");
  }
};

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-xl font-bold text-red-800 animate-pulse">Cargando tu selección...</p>
    </div>
  );

  const tieneProductos = cart && cart.productos && cart.productos.length > 0;

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-10 min-h-screen">
      <header className="mb-10 text-center">
        <h2 className="text-4xl font-black text-red-900 uppercase tracking-tighter">Tu Carrito 🍷</h2>
      </header>
      
      {!tieneProductos ? (
        <div className="bg-gray-50 p-20 rounded-3xl text-center border-2 border-dashed">
          <p className="text-gray-400 text-lg italic mb-6">Aún no has añadido nada a tu bodega personal.</p>
          <a href="/" className="bg-red-800 text-white px-10 py-3 rounded-full font-bold hover:bg-red-700 transition">
            Seguir comprando
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* LISTADO DE PRODUCTOS */}
          <div className="lg:col-span-2 space-y-4">
            {cart.productos.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row items-center gap-6 bg-white p-6 shadow-sm rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                
                {/* Imagen del producto */}
                <img 
                  src={item.imagen} 
                  alt={item.nom} 
                  className="w-24 h-24 object-contain rounded-xl bg-gray-50 p-2"
                />

                {/* Detalles (Nombres y Precios) */}
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-extrabold text-gray-900 text-xl">{item.nom}</h3>
                  <p className="text-sm text-gray-500">{item.preu_unitari}€ / unidad</p>
                  <p className="text-red-700 font-bold mt-2">Subtotal: {item.subtotal}€</p>
                </div>
                
                {/* Controles de Cantidad */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-gray-100 rounded-xl p-1 border">
                    <button 
                      onClick={() => updateQuantity(item.articleId, item.quantitat - 1)}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-red-700 font-bold">-</button>
                    
                    <span className="px-5 font-black text-gray-800 text-lg">
                      {item.quantitat}
                    </span>
                    
                    <button 
                      onClick={() => updateQuantity(item.articleId, item.quantitat + 1)}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:text-red-700 font-bold">+</button>
                  </div>

                  {/* Botón Eliminar */}
                  <button 
                    onClick={() => removeItem(item.articleId)}
                    className="text-gray-300 hover:text-red-600 transition-colors p-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RESUMEN DE PAGO */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-2xl sticky top-10">
               <h4 className="text-gray-400 uppercase text-xs font-black tracking-widest mb-6 border-b border-gray-800 pb-4">
                 Resumen del pedido
               </h4>
               
               <div className="flex justify-between items-baseline mb-10">
                 <span className="text-gray-400">Total:</span>
                 <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black">{cart.granTotal}</span>
                    <span className="text-xl font-bold text-red-500">€</span>
                 </div>
               </div>

               <button className="w-full bg-red-700 text-white py-5 rounded-2xl font-black text-lg hover:bg-red-600 transition-all transform active:scale-95 shadow-xl">
                 FINALIZAR COMPRA
               </button>
               
               <p className="text-center text-gray-500 text-[10px] mt-6 uppercase tracking-widest">
                 Envío garantizado en 24/48h
               </p>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default CartPage;