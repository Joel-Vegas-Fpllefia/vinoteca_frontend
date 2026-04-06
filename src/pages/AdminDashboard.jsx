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
      console.error("Error al refrescar datos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [tab]);

  // --- PREPARAR DATOS PARA EDITAR ---
  const openEdit = (item) => {
    setEditMode(true);
    setSelectedId(item._id || item.id);
    
    // IMPORTANTE: Mapeamos los campos del objeto de la DB a lo que el Formulario espera
    if (tab === 'usuarios') {
      setFormData({
        nombre: item.nombre || item.nom || '',
        mail: item.mail || item.email || '',
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
    setFormData(tab === 'usuarios' ? { nombre: '', mail: '', rol: 'editor', password: '' } : {});
    setShowModal(true);
  };

  // --- GUARDAR (POST / PUT) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (tab === 'usuarios') {
        if (editMode) {
          await api.put(`/auth/admin/users/${selectedId}`, formData);
        } else {
          // Si el backend pide "Nombre, mail y password" enviamos exactamente eso
          const dataToExtra = {
            nombre: formData.nombre,
            mail: formData.mail,
            password: formData.password,
            rol: formData.rol
          };
          await api.post('/auth/registro', dataToExtra);
        }
      } else {
        editMode 
          ? await api.put(`/${tab}/id/${selectedId}`, formData)
          : await api.post(`/${tab}/`, formData);
      }
      
      setShowModal(false);
      // Forzamos la actualización de la lista
      await fetchData(); 
      alert("¡Guardado correctamente!");
    } catch (err) {
      alert("Error: " + (err.response?.data?.error || "Error de validación"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar permanentemente?")) return;
    try {
      const url = tab === 'usuarios' ? `/auth/${id}` : `/${tab}/id/${id}`;
      await api.delete(url);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Error al borrar");
    }
  };

  const listaActual = Array.isArray(productos[tab]) ? productos[tab] : [];

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen font-sans">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black uppercase tracking-tighter">Admin {tab}</h1>
        <button onClick={openAdd} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-emerald-700 transition-all">
          + Nuevo {tab.slice(0,-1)}
        </button>
      </header>

      {/* TABS */}
      <div className="flex gap-2 mb-8 bg-gray-200 p-1 rounded-2xl w-fit">
        {['vinos', 'cervezas', 'usuarios'].map(t => (
          (t !== 'usuarios' || currentUser?.rol === 'admin') && (
            <button key={t} onClick={() => setTab(t)} className={`px-6 py-2 rounded-xl font-bold text-xs uppercase transition-all ${tab === t ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}>
              {t}
            </button>
          )
        ))}
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-5 text-[10px] font-black text-gray-400 uppercase">Detalle</th>
              <th className="p-5 text-[10px] font-black text-gray-400 uppercase">Valor</th>
              <th className="p-5 text-[10px] font-black text-gray-400 uppercase text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {listaActual.map((item) => (
              <tr key={item._id || item.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    {tab !== 'usuarios' && <img src={item.foto} className="w-10 h-10 object-cover rounded-lg bg-gray-100" />}
                    <div>
                      <p className="font-bold text-gray-800">{item.nom || item.nombre}</p>
                      <p className="text-gray-400 text-xs">{item.mail || item.email || item.tipus}</p>
                    </div>
                  </div>
                </td>
                <td className="p-5">
                  <span className="font-black">{tab === 'usuarios' ? item.rol : `${item.price}€`}</span>
                </td>
                <td className="p-5 text-center">
                  <button onClick={() => openEdit(item)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-2">✎</button>
                  <button onClick={() => handleDelete(item._id || item.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-black mb-6 uppercase tracking-tight">{editMode ? 'Editar' : 'Añadir'} {tab}</h2>
            
            <div className="space-y-4">
              {tab === 'usuarios' ? (
                <>
                  <input type="text" placeholder="Nombre" className="w-full p-4 bg-gray-100 rounded-2xl outline-none" value={formData.nombre || ''} onChange={e => setFormData({...formData, nombre: e.target.value})} required />
                  <input type="email" placeholder="Mail" className="w-full p-4 bg-gray-100 rounded-2xl outline-none" value={formData.mail || ''} onChange={e => setFormData({...formData, mail: e.target.value})} required />
                  {!editMode && <input type="password" placeholder="Password" className="w-full p-4 bg-gray-100 rounded-2xl outline-none" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} required />}
                  <select className="w-full p-4 bg-gray-100 rounded-2xl outline-none font-bold" value={formData.rol || 'editor'} onChange={e => setFormData({...formData, rol: e.target.value})}>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </>
              ) : (
                <>
                  <input type="text" placeholder="Nombre" className="w-full p-4 bg-gray-100 rounded-2xl outline-none" value={formData.nom || ''} onChange={e => setFormData({...formData, nom: e.target.value})} required />
                  <input type="number" step="0.01" placeholder="Precio" className="w-full p-4 bg-gray-100 rounded-2xl outline-none" value={formData.price || ''} onChange={e => setFormData({...formData, price: e.target.value})} required />
                  <input type="text" placeholder="URL Foto" className="w-full p-4 bg-gray-100 rounded-2xl outline-none" value={formData.foto || ''} onChange={e => setFormData({...formData, foto: e.target.value})} />
                </>
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-gray-400 font-bold bg-gray-50 rounded-2xl">Cancelar</button>
              <button type="submit" className="flex-1 py-4 text-white font-bold bg-gray-900 rounded-2xl">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;