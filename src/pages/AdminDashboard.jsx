import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user: currentUser } = useAuth();
  const [productos, setProductos] = useState({ vinos: [], cervezas: [], usuarios: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('vinos');
  
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
        fetchUsers = api.get('/auth/users').catch(() => ({ data: [] }));
      }

      const [resVinos, resCervezas, resUsers] = await Promise.all([fetchVinos, fetchCervezas, fetchUsers]);
      
      setProductos({
        vinos: resVinos.data?.data || [],
        cervezas: resCervezas.data?.data || [],
        usuarios: Array.isArray(resUsers.data) ? resUsers.data : (resUsers.data?.data || [])
      });
    } catch (err) {
      console.error("Error al refrescar:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [tab]);

  // --- PREPARAR DATOS ---
  const openEdit = (item) => {
    setEditMode(true);
    setSelectedId(item._id || item.id);
    
    // Mapeamos los campos para que el formulario siempre tenga 'nom' y 'email'
    if (tab === 'usuarios') {
      setFormData({
        nom: item.nom || item.nombre || '',
        email: item.email || item.mail || '',
        rol: item.rol || 'editor'
      });
    } else {
      setFormData({ ...item });
    }
    setShowModal(true);
  };

  const openAdd = () => {
    setEditMode(false);
    setSelectedId(null);
    setFormData(tab === 'usuarios' ? { nom: '', email: '', password: '', rol: 'editor' } : {});
    setShowModal(true);
  };

  // --- GUARDAR (POST / PUT) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (tab === 'usuarios') {
        if (editMode) {
          // Edición de usuario
          await api.put(`/auth/admin/users/${selectedId}`, formData);
        } else {
          // Registro de nuevo usuario (Coincide con tu Backend: nom, email, password)
          await api.post('/auth/registro', {
            nom: formData.nom,
            email: formData.email,
            password: formData.password,
            rol: formData.rol
          });
        }
      } else {
        // Productos
        editMode 
          ? await api.put(`/${tab}/id/${selectedId}`, formData)
          : await api.post(`/${tab}/`, formData);
      }
      
      setShowModal(false);
      fetchData(); 
      alert("¡Operación realizada con éxito!");
    } catch (err) {
      const msg = err.response?.data?.error || "Error en el servidor";
      alert("Error: " + msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este registro?")) return;
    try {
      const url = tab === 'usuarios' ? `/auth/${id}` : `/${tab}/id/${id}`;
      await api.delete(url);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Error al borrar");
    }
  };

  const listaActual = Array.isArray(productos[tab]) ? productos[tab] : [];

  if (loading) return <div className="p-20 text-center font-black animate-pulse">CARGANDO...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen font-sans">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter text-gray-900">Admin Panel</h1>
        <button onClick={openAdd} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all active:scale-95">
          + Añadir {tab.slice(0,-1)}
        </button>
      </header>

      {/* SELECTOR DE PESTAÑAS */}
      <div className="flex gap-2 mb-8 bg-gray-200 p-1 rounded-2xl w-fit shadow-inner">
        {['vinos', 'cervezas', 'usuarios'].map(t => (
          (t !== 'usuarios' || currentUser?.rol === 'admin') && (
            <button key={t} onClick={() => setTab(t)} className={`px-8 py-2 rounded-xl font-black text-[10px] uppercase transition-all ${tab === t ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>
              {t}
            </button>
          )
        ))}
      </div>

      {/* TABLA DE DATOS */}
      <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-gray-100">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Información</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Valor</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {listaActual.map((item) => (
              <tr key={item._id || item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    {tab !== 'usuarios' && <img src={item.foto} className="w-12 h-12 object-cover rounded-2xl bg-gray-100" />}
                    <div>
                      <p className="font-black text-gray-800 text-lg leading-tight">{item.nom || item.nombre}</p>
                      <p className="text-gray-400 text-xs font-medium">{item.email || item.mail || item.tipus}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6">
                  <span className="font-black text-gray-900 uppercase text-sm">
                    {tab === 'usuarios' ? item.rol : `${item.price}€`}
                  </span>
                </td>
                <td className="p-6">
                  <div className="flex justify-center gap-3">
                    <button onClick={() => openEdit(item)} className="p-3 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">✎</button>
                    <button onClick={() => handleDelete(item._id || item.id)} className="p-3 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all">🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {listaActual.length === 0 && <div className="p-20 text-center text-gray-300 font-bold italic">No hay registros disponibles.</div>}
      </div>

      {/* MODAL PARA FORMULARIO */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl border border-white/20">
            <h2 className="text-3xl font-black mb-8 uppercase tracking-tighter text-gray-900">
              {editMode ? 'Actualizar' : 'Crear Nuevo'} {tab.slice(0,-1)}
            </h2>
            
            <div className="space-y-4">
              {tab === 'usuarios' ? (
                <>
                  {/* Coincide con backend: nom */}
                  <input type="text" placeholder="Nombre (nom)" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.nom || ''} onChange={e => setFormData({...formData, nom: e.target.value})} required />
                  
                  {/* Coincide con backend: email */}
                  <input type="email" placeholder="Email" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} required />
                  
                  {/* Coincide con backend: password */}
                  {!editMode && <input type="password" placeholder="Password" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} required />}
                  
                  <select className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none font-bold" value={formData.rol || 'editor'} onChange={e => setFormData({...formData, rol: e.target.value})}>
                    <option value="editor">Rol: Editor</option>
                    <option value="admin">Rol: Administrador</option>
                  </select>
                </>
              ) : (
                <>
                  <input type="text" placeholder="Nombre" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500" value={formData.nom || ''} onChange={e => setFormData({...formData, nom: e.target.value})} required />
                  <div className="flex gap-4">
                    <input type="number" step="0.01" placeholder="Precio" className="w-1/2 p-4 bg-gray-100 rounded-2xl outline-none" value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} required />
                    <input type="number" step="0.1" placeholder="Graduación" className="w-1/2 p-4 bg-gray-100 rounded-2xl outline-none" value={formData.graduacio || ''} onChange={e => setFormData({...formData, graduacio: e.target.value})} required />
                  </div>
                  <input type="text" placeholder="URL Foto" className="w-full p-4 bg-gray-100 rounded-2xl outline-none" value={formData.foto || ''} onChange={e => setFormData({...formData, foto: e.target.value})} />
                </>
              )}
            </div>

            <div className="flex gap-4 mt-10">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-bold bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all">Cancelar</button>
              <button type="submit" className="flex-1 py-4 text-white font-bold bg-gray-900 rounded-2xl shadow-lg hover:shadow-gray-300 transition-all">Guardar Cambios</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;