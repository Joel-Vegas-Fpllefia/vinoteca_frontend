import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [productos, setProductos] = useState({ vinos: [], cervezas: [], usuarios: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('vinos');
  
  // Estados para Modales
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedId, setSelectedId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Definimos las promesas de forma segura
      const fetchVinos = api.get('/vinos/').catch(err => ({ data: { data: [] } }));
      const fetchCervezas = api.get('/cervezas/').catch(err => ({ data: { data: [] } }));
      
      let fetchUsers = Promise.resolve({ data: [] });
      if (currentUser?.rol === 'admin') {
        // Si da 404, el .catch evita que la app explote
        fetchUsers = api.get('/auth/users').catch(err => {
          console.error("Error en /auth/users (Ruta no encontrada o sin permiso):", err);
          return { data: [] }; 
        });
      }

      const [resVinos, resCervezas, resUsers] = await Promise.all([fetchVinos, fetchCervezas, fetchUsers]);
      
      // 2. Mapeo de datos según la estructura de tu Backend
      setProductos({
        vinos: resVinos.data?.data || [],
        cervezas: resCervezas.data?.data || [],
        // Algunos backends devuelven el array directo, otros en .data
        usuarios: Array.isArray(resUsers.data) ? resUsers.data : (resUsers.data?.data || [])
      });
    } catch (err) {
      console.error("Error crítico de carga:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [currentUser]);

  // --- ELIMINAR ---
  const handleDelete = async (id) => {
    if (tab === 'usuarios' && id === (currentUser?._id || currentUser?.id)) {
        return alert("No puedes eliminar tu propia cuenta administrativa.");
    }
    if (!window.confirm(`¿Seguro que quieres eliminar este ${tab.slice(0,-1)}?`)) return;

    try {
      const url = tab === 'usuarios' ? `/auth/${id}` : `/${tab}/id/${id}`;
      await api.delete(url);
      alert("Eliminado con éxito");
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Error al eliminar");
    }
  };

  // --- GUARDAR (CREAR/EDITAR) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (tab === 'usuarios') {
        if (editMode) {
          await api.put(`/auth/admin/users/${selectedId}`, formData);
        } else {
          await api.post('/auth/registro', formData);
        }
      } else {
        editMode 
          ? await api.put(`/${tab}/id/${selectedId}`, formData)
          : await api.post(`/${tab}/`, formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert("Error en la operación: " + (err.response?.data?.error || "Revisa los campos"));
    }
  };

  const openEdit = (item) => {
    setEditMode(true);
    setSelectedId(item._id || item.id);
    setFormData({ ...item });
    setShowModal(true);
  };

  // 3. ASEGURAMOS QUE listaActual SIEMPRE SEA UN ARRAY (EVITA ERROR .MAP)
  const listaActual = Array.isArray(productos[tab]) ? productos[tab] : [];

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-xl font-bold text-gray-400 animate-pulse uppercase tracking-widest">Sincronizando Inventario...</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen font-sans">
      
      <header className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Panel Maestro</h1>
          <p className="text-gray-400 text-sm font-bold">Sesión como: {currentUser?.rol}</p>
        </div>
        <button 
          onClick={() => { setEditMode(false); setFormData({}); setShowModal(true); }} 
          className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-emerald-700 shadow-xl transition-all active:scale-95 uppercase text-xs"
        >
          + Añadir {tab.slice(0,-1)}
        </button>
      </header>

      {/* SELECTOR DE PESTAÑAS */}
      <div className="flex gap-2 mb-8 bg-gray-200 p-1.5 rounded-2xl w-fit">
        <button onClick={() => setTab('vinos')} className={`px-8 py-2.5 rounded-xl font-black text-xs uppercase transition-all ${tab === 'vinos' ? 'bg-white text-red-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>🍷 Vinos</button>
        <button onClick={() => setTab('cervezas')} className={`px-8 py-2.5 rounded-xl font-black text-xs uppercase transition-all ${tab === 'cervezas' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>🍺 Cervezas</button>
        
        {currentUser?.rol === 'admin' && (
          <button onClick={() => setTab('usuarios')} className={`px-8 py-2.5 rounded-xl font-black text-xs uppercase transition-all ${tab === 'usuarios' ? 'bg-white text-blue-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            👥 Usuarios
          </button>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-6 uppercase text-[10px] font-black text-gray-400 tracking-widest">{tab === 'usuarios' ? 'Identidad' : 'Producto'}</th>
              <th className="p-6 uppercase text-[10px] font-black text-gray-400 tracking-widest">{tab === 'usuarios' ? 'Permisos' : 'Precio'}</th>
              <th className="p-6 uppercase text-[10px] font-black text-gray-400 tracking-widest text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {listaActual.length > 0 ? (
              listaActual.map((item) => (
                <tr key={item._id || item.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      {tab !== 'usuarios' && (
                        <img src={item.foto} className="w-14 h-14 object-cover rounded-2xl bg-gray-100 shadow-sm group-hover:scale-110 transition-transform" />
                      )}
                      <div>
                        <p className="font-black text-gray-800 text-lg">{item.nom || item.nombre}</p>
                        <p className="text-gray-400 text-xs">{item.email || item.tipus || 'Sin categoría'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    {tab === 'usuarios' ? (
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${item.rol === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {item.rol}
                      </span>
                    ) : (
                      <span className="text-xl font-black text-gray-900">{item.price}€</span>
                    )}
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openEdit(item)} className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">✎</button>
                      <button onClick={() => handleDelete(item._id || item.id)} className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">🗑</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-20 text-center">
                  <p className="text-gray-300 font-bold italic">No se han encontrado registros en {tab}.</p>
                  {tab === 'usuarios' && <p className="text-xs text-red-400 mt-2">Verifica que la ruta /auth/users sea correcta en el Backend.</p>}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL ADAPTATIVO */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl border border-white/20">
            <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter text-gray-900">
              {editMode ? 'Actualizar' : 'Registrar'} {tab.slice(0,-1)}
            </h2>
            
            <div className="space-y-5">
              {tab === 'usuarios' ? (
                <>
                  <input type="text" placeholder="Nombre completo" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.nombre || ''} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
                  <input type="email" placeholder="Correo electrónico" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} required />
                  {!editMode && <input type="password" placeholder="Contraseña segura" className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" onChange={e => setFormData({...formData, password: e.target.value})} required />}
                  <select className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none" value={formData.rol || 'editor'} onChange={e => setFormData({...formData, rol: e.target.value})}>
                    <option value="editor">Rol: Editor</option>
                    <option value="admin">Rol: Administrador</option>
                  </select>
                </>
              ) : (
                <>
                  <input type="text" placeholder="Nombre" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none" value={formData.nom || ''} onChange={e => setFormData({...formData, nom: e.target.value})} required />
                  <div className="flex gap-4">
                    <input type="number" step="0.01" placeholder="Precio €" className="w-1/2 p-4 bg-gray-50 border-none rounded-2xl outline-none" value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} required />
                    <input type="number" step="0.1" placeholder="Graduación %" className="w-1/2 p-4 bg-gray-50 border-none rounded-2xl outline-none" value={formData.graduacio || ''} onChange={e => setFormData({...formData, graduacio: e.target.value})} required />
                  </div>
                  <input type="text" placeholder="URL Imagen" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none" value={formData.foto || ''} onChange={e => setFormData({...formData, foto: e.target.value})} />
                </>
              )}
            </div>

            <div className="flex gap-4 mt-10">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-bold bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all">Cerrar</button>
              <button type="submit" className="flex-1 py-4 text-white font-bold bg-gray-900 rounded-2xl shadow-lg hover:shadow-gray-300 transition-all">Confirmar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;