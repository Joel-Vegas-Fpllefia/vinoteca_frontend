import { useEffect, useState } from 'react';
import api from '../api/axios';

const AdminDashboard = () => {
  const [productos, setProductos] = useState({ vinos: [], cervezas: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('vinos');
  
  // Estados para el Modal (Añadir/Editar)
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ nom: '', price: '', graduacio: '', foto: '', tipus: '', descripcio: '' });
  const [selectedId, setSelectedId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resVinos, resCervezas] = await Promise.all([
        api.get('/vinos/'),
        api.get('/cervezas/')
      ]);
      setProductos({
        vinos: resVinos.data?.data || [],
        cervezas: resCervezas.data?.data || []
      });
    } catch (err) {
      console.error("Error al cargar:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- FUNCION ELIMINAR ---
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminarlo?")) return;
    try {
      await api.delete(`/${tab}/id/${id}`);
      fetchData(); // Recargamos la lista
    } catch (err) {
      alert("Error al eliminar el producto");
    }
  };

  // --- FUNCION AÑADIR / EDITAR (SUBMIT) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        // PUT /cervezas/id/123
        await api.put(`/${tab}/id/${selectedId}`, formData);
      } else {
        // POST /cervezas/
        await api.post(`/${tab}/`, formData);
      }
      setShowModal(false);
      setFormData({ nom: '', price: '', graduacio: '', foto: '', tipus: '', descripcio: '' });
      fetchData();
    } catch (err) {
      alert("Error al guardar: " + err.response?.data?.error);
    }
  };

  // Preparar Modal para Editar
  const openEdit = (prod) => {
    setEditMode(true);
    setSelectedId(prod._id);
    setFormData({ ...prod }); // Cargamos los datos del producto en el form
    setShowModal(true);
  };

  // Preparar Modal para Añadir
  const openAdd = () => {
    setEditMode(false);
    setFormData({ nom: '', price: '', graduacio: '', foto: '', tipus: '', descripcio: '' });
    setShowModal(true);
  };

  const listaActual = (tab === 'vinos' ? productos.vinos : productos.cervezas) || [];

  if (loading) return <div className="p-10 text-center font-bold">Cargando...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen relative">
      
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black uppercase">Gestión de {tab}</h1>
        <button onClick={openAdd} className="bg-emerald-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-md">
          + Nuevo {tab === 'vinos' ? 'Vino' : 'Cerveza'}
        </button>
      </header>

      {/* TABS */}
      <div className="flex gap-4 mb-6">
        <button onClick={() => setTab('vinos')} className={`px-6 py-2 rounded-lg font-bold ${tab === 'vinos' ? 'bg-red-800 text-white' : 'bg-gray-200'}`}>Vinos</button>
        <button onClick={() => setTab('cervezas')} className={`px-6 py-2 rounded-lg font-bold ${tab === 'cervezas' ? 'bg-amber-600 text-white' : 'bg-gray-200'}`}>Cervezas</button>
      </div>

      {/* TABLA */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-900 text-white text-xs">
            <tr>
              <th className="p-4">Producto</th>
              <th className="p-4">Precio</th>
              <th className="p-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {listaActual.map((prod) => (
              <tr key={prod._id} className="border-b hover:bg-gray-50">
                <td className="p-4 flex items-center gap-3">
                  <img src={prod.foto} className="w-10 h-10 object-cover rounded" alt="" />
                  <span className="font-bold">{prod.nom}</span>
                </td>
                <td className="p-4 font-black">{prod.price}€</td>
                <td className="p-4">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openEdit(prod)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">✎</button>
                    <button onClick={() => handleDelete(prod._id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">🗑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MODAL FORMULARIO --- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-black mb-6">{editMode ? 'Editar' : 'Añadir'} {tab}</h2>
            
            <div className="space-y-4">
              <input type="text" placeholder="Nombre del producto" className="w-full p-3 border rounded-xl" value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} required />
              
              <div className="flex gap-4">
                <input type="number" step="0.01" placeholder="Precio (€)" className="w-1/2 p-3 border rounded-xl" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                <input type="number" step="0.1" placeholder="Graduación %" className="w-1/2 p-3 border rounded-xl" value={formData.graduacio} onChange={e => setFormData({...formData, graduacio: e.target.value})} required />
              </div>

              <input type="text" placeholder="URL de la Foto" className="w-full p-3 border rounded-xl" value={formData.foto} onChange={e => setFormData({...formData, foto: e.target.value})} />
              
              <textarea placeholder="Descripción" className="w-full p-3 border rounded-xl h-24" value={formData.descripcio} onChange={e => setFormData({...formData, descripcio: e.target.value})}></textarea>
            </div>

            <div className="flex gap-3 mt-8">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 font-bold text-gray-500 bg-gray-100 rounded-xl">Cancelar</button>
              <button type="submit" className="flex-1 py-3 font-bold text-white bg-gray-900 rounded-xl shadow-lg">Guardar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;