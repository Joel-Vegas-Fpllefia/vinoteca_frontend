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
      const fetchVinos = api.get('/vinos/').catch(() => ({ data: { data: [] } }));
      const fetchCervezas = api.get('/cervezas/').catch(() => ({ data: { data: [] } }));
      
      let fetchUsers = Promise.resolve({ data: [] });
      if (currentUser?.rol === 'admin') {
        fetchUsers = api.get('/auth/users').catch(err => {
          console.error("Error cargando usuarios (404/401):", err);
          return { data: [] }; 
        });
      }

      const [resVinos, resCervezas, resUsers] = await Promise.all([fetchVinos, fetchCervezas, fetchUsers]);
      
      setProductos({
        vinos: resVinos.data?.data || [],
        cervezas: resCervezas.data?.data || [],
        usuarios: Array.isArray(resUsers.data) ? resUsers.data : (resUsers.data?.data || [])
      });
    } catch (err) {
      console.error("Error en la carga:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [currentUser]);

  // --- ELIMINAR ---
  const handleDelete = async (id) => {
    if (tab === 'usuarios' && id === (currentUser?._id || currentUser?.id)) {
        return alert("Error: No puedes eliminar tu propia cuenta.");
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
          // PUT /auth/admin/users/:id
          await api.put(`/auth/admin/users/${selectedId}`, formData);
        } else {
          // POST /auth/registro
          await api.post('/auth/registro', formData);
        }
      } else {
        // Lógica para Vinos/Cervezas
        editMode 
          ? await api.put(`/${tab}/id/${selectedId}`, formData)
          : await api.post(`/${tab}/`, formData);
      }
      setShowModal(false);
      fetchData();
      alert("Operación completada con éxito");
    } catch (err) {
      // Aquí capturamos el error de "Nombre, mail y password requeridos"
      alert("Error en la operación: " + (err.response?.data?.error || "Revisa los datos enviados"));
    }
  };

  const openEdit = (item) => {
    setEditMode(true);
    setSelectedId(item._id || item.id);
    setFormData({ ...item }); // Carga los datos actuales (incluyendo .mail)
    setShowModal(true);
  };

  const listaActual = Array.isArray(productos[tab]) ? productos[tab] : [];

  if (loading) return <div className="flex items-center justify-center h-screen font-black text-gray-400 uppercase tracking-widest animate-pulse">Sincronizando...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter">Panel Maestro</h1>
        <button 
          onClick={() => { setEditMode(false); setFormData({ rol: 'editor' }); setShowModal(true); }} 
          className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-700 shadow-lg"
        >
          + Añadir {tab.slice(0,-1)}
        </button>
      </header>

      {/* SELECTOR DE PESTAÑAS */}
      <div className="flex gap-2 mb-8 bg-gray-200 p-1.5 rounded-2xl w-fit">
        <button onClick={() => setTab('vinos')} className={`px-8 py-2.5 rounded-xl font-bold transition-all ${tab === 'vinos' ? 'bg-white text-red-900 shadow-sm' : 'text-gray-500'}`}>🍷 Vinos</button>
        <button onClick={() => setTab('cervezas')} className={`px-8 py-2.5 rounded-xl font-bold transition-all ${tab === 'cervezas' ? 'bg-white text-amber-600 shadow-sm' : 'text-gray-500'}`}>🍺 Cervezas</button>
        {currentUser?.rol === 'admin' && (
          <button onClick={() => setTab('usuarios')} className={`px-8 py-2.5 rounded-xl font-bold transition-all ${tab === 'usuarios' ? 'bg-white text-blue-800 shadow-sm' : 'text-gray-500'}`}>👥 Usuarios</button>
        )}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-6 uppercase text-[10px] font-black text-gray-400 tracking-widest">{tab === 'usuarios' ? 'Identidad' : 'Producto'}</th>
              <th className="p-6 uppercase text-[10px] font-black text-gray-400 tracking-widest">{tab === 'usuarios' ? 'Permisos' : 'Precio'}</th>
              <th className="p-6 uppercase text-[10px] font-black text-gray-400 tracking-widest text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {listaActual.length > 0 ? (
              listaActual.map((item) => (
                <tr key={item._id || item.id} className="hover:bg-gray-50/50 border-b border-gray-50 last:border-0 transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      {tab !== 'usuarios' && <img src={item.foto} className="w-12 h-12 object-cover rounded-xl bg-gray-100 shadow-sm" />}
                      <div>
                        <p className="font-black text-gray-800">{item.nom || item.nombre}</p>
                        <p className="text-gray-400 text-xs">{item.mail || item.email || item.tipus}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    {tab === 'usuarios' ? (
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.rol === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {item.rol}
                      </span>
                    ) : (
                      <span className="text-xl font-black text-gray-900">{item.price}€</span>
                    )}
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => openEdit(item)} className="p-2 text-gray-400 hover:text-blue-600 transition-all">✎</button>
                      <button onClick={() => handleDelete(item._id || item.id)} className="p-2 text-gray-400 hover:text-red-600 transition-all">🗑</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="3" className="p-20 text-center text-gray-400 font-bold italic">No se han encontrado registros en {tab}.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL ADAPTATIVO */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl">
            <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter">{editMode ? 'Actualizar' : 'Registrar'} {tab.slice(0,-1)}</h2>
            
            <div className="space-y-4">
              {tab === 'usuarios' ? (
                <>
                  <input type="text" placeholder="Nombre completo" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none" value={formData.nombre || ''} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
                  {/* AQUÍ ESTÁ EL CAMBIO CLAVE: .mail en lugar de .email */}
                  <input type="email" placeholder="Correo electrónico (mail)" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none" value={formData.mail || ''} onChange={e => setFormData({...formData, mail: e.target.value})} required />
                  {!editMode && <input type="password" placeholder="Contraseña segura" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} required />}
                  <select className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-bold" value={formData.rol || 'editor'} onChange={e => setFormData({...formData, rol: e.target.value})}>
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
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-bold bg-gray-50 rounded-2xl">Cancelar</button>
              <button type="submit" className="flex-1 py-4 text-white font-bold bg-gray-900 rounded-2xl shadow-lg">Confirmar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;