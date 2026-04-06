import { useEffect, useState } from 'react';
import api from '../api/axios';

const AdminDashboard = () => {
  const [productos, setProductos] = useState({ vinos: [], cervezas: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('vinos');

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Probamos las peticiones. 
      // Si tu backend usa /api, cambia estas líneas a api.get('/api/vinos/')
      const [resVinos, resCervezas] = await Promise.all([
        api.get('/vinos/'),
        api.get('/cervezas/')
      ]);

      // DEBUG: Para que veas en la consola si llegan datos reales
      console.log("Vinos:", resVinos.data);
      console.log("Cervezas:", resCervezas.data);

      setProductos({
        // 2. Validamos que lo que llegue sea un Array. Si no, ponemos []
        vinos: Array.isArray(resVinos.data) ? resVinos.data : (resVinos.data.vinos || []),
        cervezas: Array.isArray(resCervezas.data) ? resCervezas.data : (resCervezas.data.cervezas || [])
      });
    } catch (err) {
      console.error("Error cargando datos:", err.response || err);
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
      // Ajustado a tu endpoint: /cervezas/id/{id}
      const ruta = `/${tipo}/id/${id}`;
      await api.delete(ruta);
      alert("Eliminado correctamente");
      fetchData(); 
    } catch (err) {
      alert("No se pudo eliminar. Revisa los permisos.");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mb-4"></div>
      <p className="font-bold text-gray-600">Cargando inventario...</p>
    </div>
  );

  const listaActual = (tab === 'vinos' ? productos.vinos : productos.cervezas) || [];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase">Panel de Gestión</h1>
          <p className="text-gray-500 font-medium">Control de stock y productos</p>
        </div>
        <button 
          className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 shadow-lg transition-all active:scale-95"
          onClick={() => alert("Formulario de creación en desarrollo")}
        >
          + Añadir {tab === 'vinos' ? 'Vino' : 'Cerveza'}
        </button>
      </header>

      {/* SELECTOR DE CATEGORÍA */}
      <div className="flex gap-2 mb-8 bg-gray-200 p-1 rounded-2xl w-fit">
        <button 
          onClick={() => setTab('vinos')}
          className={`px-10 py-2.5 rounded-xl font-bold transition-all ${tab === 'vinos' ? 'bg-white text-red-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          🍷 Vinos
        </button>
        <button 
          onClick={() => setTab('cervezas')}
          className={`px-10 py-2.5 rounded-xl font-bold transition-all ${tab === 'cervezas' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          🍺 Cervezas
        </button>
      </div>

      {/* TABLA DE PRODUCTOS */}
      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-5 uppercase text-[10px] font-black text-gray-400 tracking-widest">Producto</th>
              <th className="p-5 uppercase text-[10px] font-black text-gray-400 tracking-widest">Precio</th>
              <th className="p-5 uppercase text-[10px] font-black text-gray-400 tracking-widest">Graduación</th>
              <th className="p-5 uppercase text-[10px] font-black text-gray-400 tracking-widest text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {listaActual.map((prod) => (
              <tr key={prod._id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="p-5">
                  <div className="flex items-center gap-4">
                    <img 
                      src={prod.foto} 
                      className="w-14 h-14 object-cover rounded-xl bg-gray-100 group-hover:scale-110 transition-transform shadow-sm" 
                      alt="" 
                      onError={(e) => e.target.src = 'https://placehold.co/100x100?text=No+Imagen'}
                    />
                    <span className="font-bold text-gray-800 text-lg">{prod.nom}</span>
                  </div>
                </td>
                <td className="p-5">
                  <span className="text-xl font-black text-gray-900">{prod.price}€</span>
                </td>
                <td className="p-5">
                  <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-black italic">
                    {prod.graduacio || prod.graduacion || '0'}% VOL
                  </span>
                </td>
                <td className="p-5">
                  <div className="flex justify-center gap-2">
                    <button className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => handleDelete(prod._id, tab)}
                      className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
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
          <div className="py-24 text-center">
             <span className="text-5xl block mb-4 opacity-20">📭</span>
             <p className="text-gray-400 font-medium italic">No se han encontrado productos en la categoría {tab}.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;