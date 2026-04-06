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
  // 2. Editar cantidad (Suma o Resta)
const updateQuantity = async (id_del_articulo, newAmount) => {
  if (newAmount < 1) return;

  // IMPORTANTE: Asegúrate de que id_del_articulo no sea undefined
  console.log("ID que enviamos al backend:", id_del_articulo);

  try {
    const res = await api.put('/cart/edit', { 
      id_product: id_del_articulo, // Este debe ser el 'articleId'
      amount: Number(newAmount) 
    });
    
    await fetchCart(); 
  } catch (err) {
    // Si sale el error 500, aquí veremos qué dice el servidor
    console.error("Error 500 detalles:", err.response?.data);
    alert("Error al editar: " + (err.response?.data?.message || "Error interno"));
  }
};

  // 3. Eliminar producto
  const removeItem = async (id_del_articulo) => {
    try {
      // El método DELETE en Axios requiere pasar el body dentro de la propiedad 'data'
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
    <div className="flex justify-center items-center h-64">
      <p className="text-xl font-bold text-red-800 animate-pulse">Cargando tu bodega...</p>
    </div>
  );

  // Validación de seguridad para evitar el error de 'length'
  const tieneProductos = cart && cart.productos && cart.productos.length > 0;

  return (
    <div className="max-w-5xl mx-auto p-6 min-h-screen">
      <h2 className="text-4xl font-black text-red-900 mb-10 text-center uppercase tracking-tighter">
        Mi Selección 🍷
      </h2>
      
      {!tieneProductos ? (
        <div className="bg-white p-16 rounded-3xl text-center shadow-inner border-2 border-dashed border-gray-200">
          <p className="text-gray-400 text-lg">Tu carrito está vacío actualmente.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LISTA DE PRODUCTOS */}
          <div className="lg:col-span-2 space-y-4">
            {cart.productos.map((item, index) => (
              <div key={index} className="flex items-center gap-6 bg-white p-5 shadow-sm rounded-2xl border border-gray-100 hover:shadow-md transition-all">
                
                {/* Imagen */}
                <img 
                  src={item.imagen} 
                  alt={item.nom} 
                  className="w-24 h-24 object-cover rounded-xl bg-gray-50 border border-gray-100"
                />

                {/* Detalles */}
                <div className="flex-1">
                  <h3 className="font-extrabold text-gray-900 text-xl leading-tight">{item.nom}</h3>
                  <p className="text-sm text-gray-500 mb-2">{item.preu_unitari}€ / unidad</p>
                  <p className="text-red-700 font-bold bg-red-50 inline-block px-2 py-1 rounded-md text-sm">
                    Subtotal: {item.subtotal}€
                  </p>
                </div>
                
                {/* Controles de cantidad */}
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200">
                    <button 
                        onClick={() => updateQuantity(item.articleId, item.quantitat - 1)}
                        className="..."> - </button>

                      <span className="px-5 font-black text-gray-800 text-lg">
                        {item.quantitat}
                      </span>

                      <button 
                        onClick={() => updateQuantity(item.articleId, item.quantitat + 1)}
                        className="..."> + </button>
                  </div>
                  
                  <button 
                    onClick={() => removeItem(item.articleId)}
                    className="text-gray-400 hover:text-red-600 text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* RESUMEN DE PAGO */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-2xl sticky top-6">
               <h4 className="text-gray-400 uppercase text-xs font-black tracking-widest mb-6">Resumen del pedido</h4>
               
               <div className="flex justify-between items-end mb-8">
                 <span className="text-gray-400">Total a pagar:</span>
                 <span className="text-5xl font-black text-white">{cart.granTotal}€</span>
               </div>

               <button className="w-full bg-red-700 text-white py-5 rounded-2xl font-black text-lg hover:bg-red-600 transition-all transform active:scale-95 shadow-xl flex justify-center items-center gap-2">
                 <span>FINALIZAR PEDIDO</span>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                   <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                 </svg>
               </button>
               
               <p className="text-gray-500 text-[10px] text-center mt-6 uppercase">Pago seguro 100% garantizado</p>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default CartPage;