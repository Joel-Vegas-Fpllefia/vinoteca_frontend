import { useEffect, useState } from 'react';
import api from '../api/axios';

const AdminDashboard = () => {
  // 1. Mantenemos el estado inicial como arrays vacíos
  const [productos, setProductos] = useState({ vinos: [], cervezas: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('vinos');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resVinos, resCervezas] = await Promise.all([
        api.get('/vinos/'),
        api.get('/cervezas/')
      ]);

      // 2. BLINDAJE: Verificamos si la data es un array. 
      // Si tu backend envía { vinos: [...] }, usa resVinos.data.vinos
      const listaVinos = Array.isArray(resVinos.data) ? resVinos.data : (resVinos.data.vinos || []);
      const listaCervezas = Array.isArray(resCervezas.data) ? resCervezas.data : (resCervezas.data.cervezas || []);

      setProductos({ 
        vinos: listaVinos, 
        cervezas: listaCervezas 
      });

    } catch (err) {
      console.error("Error cargando datos de admin", err);
      // En caso de error, reseteamos a arrays vacíos para que .map no explote
      setProductos({ vinos: [], cervezas: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id, tipo) => {
    if (!window.confirm("¿Estás seguro de eliminar este producto?")) return;
    try {
      const ruta = tipo === 'vinos' ? `/vinos/id/${id}` : `/cervezas/id/${id}`;
      await api.delete(ruta);
      alert("Producto eliminado");
      fetchData(); 
    } catch (err) {
      alert("Error al eliminar");
    }
  };

  if (loading) return <div className="p-10 text-center font-bold">Cargando panel de control...</div>;

  // 3. ASEGURAMOS QUE listaActual SIEMPRE SEA UN ARRAY
  const listaActual = (tab === 'vinos' ? productos.vinos : productos.cervezas) || [];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900 uppercase">Panel de Gestión</h1>
          <p className="text-gray-500">Administración de Inventario Vinacoteca</p>
        </div>
        <button 
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 shadow-lg transition-all"
          onClick={() => alert("Función no implementada todavía")}
        >
          + Añadir Nuevo Producto
        </button>
      </header>

      {/* TABS */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setTab('vinos')}
          className={`px-8 py-2 rounded-full font-bold transition-all ${tab === 'vinos' ? 'bg-red-800 text-white shadow-md' : 'bg-white text-gray-400 border'}`}
        >
          Vinos
        </button>
        <button 
          onClick={() => setTab('cervezas')}
          className={`px-8 py-2 rounded-full font-bold transition-all ${tab === 'cervezas' ? 'bg-yellow-600 text-white shadow-md' : 'bg-white text-gray-400 border'}`}
        >
          Cervezas
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="p-4 uppercase text-xs font-bold">Imagen</th>
              <th className="p-4 uppercase text-xs font-bold">Nombre</th>
              <th className="p-4 uppercase text-xs font-bold">Precio</th>
              <th className="p-4 uppercase text-xs font-bold">Stock</th>
              <th className="p-4 uppercase text-xs font-bold text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {/* 4. MAP SEGURO con Optional Chaining */}
            {listaActual?.map((prod) => (
              <tr key={prod._id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <img src={prod.foto} className="w-12 h-12 object-contain bg-gray-100 rounded-lg" alt="" />
                </td>
                <td className="p-4 font-bold text-gray-800">{prod.nom}</td>
                <td className="p-4 font-mono">{prod.price || prod.precio}€</td>
                <td className="p-4">
                   <span className={`px-3 py-1 rounded-full text-xs font-bold ${prod.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                    {prod.stock || 0} uds
                   </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-3">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(prod._id, tab)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {listaActual.length === 0 && (
          <div className="p-20 text-center text-gray-400 italic">No hay productos disponibles.</div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;