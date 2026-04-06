import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user: currentUser } = useAuth(); // Para saber si somos admin o editor
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
      const requests = [api.get('/vinos/'), api.get('/cervezas/')];
      
      // Solo pedimos usuarios si somos ADMIN
      if (currentUser?.rol === 'admin') {
        requests.push(api.get('/auth/users'));
      }

      const responses = await Promise.all(requests);
      
      setProductos({
        vinos: responses[0].data?.data || [],
        cervezas: responses[1].data?.data || [],
        usuarios: responses[2]?.data || [] // La ruta /auth/users suele devolver el array directo
      });
    } catch (err) {
      console.error("Error al cargar datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [tab]);

  // --- ELIMINAR ---
  const handleDelete = async (id) => {
    if (tab === 'usuarios' && id === currentUser.id) {
        return alert("¡No puedes eliminarte a ti mismo!");
    }
    if (!window.confirm(`¿Seguro que quieres eliminar este ${tab.slice(0,-1)}?`)) return;

    try {
      const url = tab === 'usuarios' ? `/auth/${id}` : `/${tab}/id/${id}`;
      await api.delete(url);
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
        // Lógica de Vinos/Cervezas
        editMode 
          ? await api.put(`/${tab}/id/${selectedId}`, formData)
          : await api.post(`/${tab}/`, formData);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || "Operación fallida"));
    }
  };

  const openEdit = (item) => {
    setEditMode(true);
    setSelectedId(item._id || item.id);
    setFormData({ ...item });
    setShowModal(true);
  };

  const listaActual = productos[tab] || [];

  if (loading) return <div className="p-10 text-center font-bold">Cargando panel...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black uppercase">Panel de Control</h1>
        <button onClick={() => { setEditMode(false); setFormData({}); setShowModal(true); }} 
                className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold">
          + Añadir {tab.slice(0,-1)}
        </button>
      </header>

      {/* SELECTOR DE PESTAÑAS */}
      <div className="flex gap-4 mb-6">
        <button onClick={() => setTab('vinos')} className={`px-6 py-2 rounded-lg font-bold ${tab === 'vinos' ? 'bg-red-800 text-white' : 'bg-gray-200'}`}>Vinos</button>
        <button onClick={() => setTab('cervezas')} className={`px-6 py-2 rounded-lg font-bold ${tab === 'cervezas' ? 'bg-amber-600 text-white' : 'bg-gray-200'}`}>Cervezas</button>
        
        {/* PESTAÑA SOLO PARA ADMINS */}
        {currentUser?.rol === 'admin' && (
          <button onClick={() => setTab('usuarios')} className={`px-6 py-2 rounded-lg font-bold ${tab === 'usuarios' ? 'bg-blue-800 text-white' : 'bg-gray-200'}`}>
            👥 Usuarios
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-900 text-white text-xs">
            <tr>
              <th className="p-4">{tab === 'usuarios' ? 'Usuario' : 'Producto'}</th>
              <th className="p-4">{tab === 'usuarios' ? 'Rol' : 'Precio'}</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {listaActual.map((item) => (
              <tr key={item._id || item.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {tab !== 'usuarios' && <img src={item.foto} className="w-8 h-8 rounded" />}
                    <span className="font-bold">{item.nom || item.email || item.nombre}</span>
                  </div>
                </td>
                <td className="p-4 uppercase text-sm font-mono">
                  {tab === 'usuarios' ? (
                    <span className={`px-2 py-1 rounded ${item.rol === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {item.rol}
                    </span>
                  ) : `${item.price}€`}
                </td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openEdit(item)} className="p-2 text-blue-600">✎</button>
                    <button onClick={() => handleDelete(item._id || item.id)} className="p-2 text-red-600">🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL ADAPTATIVO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black mb-6 uppercase">{editMode ? 'Editar' : 'Añadir'} {tab}</h2>
            
            <div className="space-y-4">
              {tab === 'usuarios' ? (
                <>
                  <input type="text" placeholder="Nombre" className="w-full p-3 border rounded-xl" value={formData.nombre || ''} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
                  <input type="email" placeholder="Email" className="w-full p-3 border rounded-xl" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} required />
                  {!editMode && <input type="password" placeholder="Contraseña" className="w-full p-3 border rounded-xl" onChange={e => setFormData({...formData, password: e.target.value})} required />}
                  <select className="w-full p-3 border rounded-xl" value={formData.rol || 'editor'} onChange={e => setFormData({...formData, rol: e.target.value})}>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </>
              ) : (
                <>
                  <input type="text" placeholder="Nombre" className="w-full p-3 border rounded-xl" value={formData.nom || ''} onChange={e => setFormData({...formData, nom: e.target.value})} required />
                  <input type="number" placeholder="Precio" className="w-full p-3 border rounded-xl" value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} required />
                  <input type="text" placeholder="URL Foto" className="w-full p-3 border rounded-xl" value={formData.foto || ''} onChange={e => setFormData({...formData, foto: e.target.value})} />
                </>
              )}
            </div>

            <div className="flex gap-3 mt-8">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 text-gray-500 font-bold bg-gray-100 rounded-xl">Cancelar</button>
              <button type="submit" className="flex-1 py-3 text-white font-bold bg-gray-900 rounded-xl">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;