import { useEffect, useState } from 'react';
import api from '../api/axios';

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart'); // Según tu router.get("/")
      setCart(res.data);
    } catch (err) {
      console.error("Error al obtener carrito", err);
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
      // Según tu router.put("/edit")
      await api.put('/cart/edit', { id_product, amount: newAmount });
      fetchCart(); // Recargamos los datos
    } catch (err) {
      alert("Error al actualizar");
    }
  };

  const removeItem = async (id_product) => {
    try {
      // Según tu router.delete("/remove")
      await api.delete('/cart/remove', { data: { id_product } });
      fetchCart();
    } catch (err) {
      alert("Error al eliminar");
    }
  };

  if (loading) return <p className="text-center mt-10">Cargando carrito...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-red-800 mb-6">Tu Carrito</h2>
      
      {!cart || cart.productes.length === 0 ? (
        <p className="text-gray-500">El carrito está vacío.</p>
      ) : (
        <div className="space-y-4">
          {cart.productes.map((item) => (
            <div key={item._id} className="flex items-center justify-between bg-white p-4 shadow rounded-lg border">
              <div>
                <p className="font-bold text-gray-800">Producto ID: {item.articleId}</p>
                <p className="text-sm text-gray-400 uppercase">{item.tipus_article}</p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded">
                  <button 
                    onClick={() => updateQuantity(item.articleId, item.quantitat - 1)}
                    className="px-3 py-1 hover:bg-gray-100">-</button>
                  <span className="px-4 font-bold">{item.quantitat}</span>
                  <button 
                    onClick={() => updateQuantity(item.articleId, item.quantitat + 1)}
                    className="px-3 py-1 hover:bg-gray-100">+</button>
                </div>
                
                <button 
                  onClick={() => removeItem(item.articleId)}
                  className="text-red-600 font-semibold hover:underline">
                  Eliminar
                </button>
              </div>
            </div>
          ))}
          
          <div className="mt-8 border-t pt-4 flex justify-between items-center">
             <button className="bg-red-800 text-white px-8 py-3 rounded-lg font-bold hover:bg-red-900 transition">
               Finalizar Compra (Checkout)
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;