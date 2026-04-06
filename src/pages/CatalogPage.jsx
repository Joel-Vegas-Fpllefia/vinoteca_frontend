import { useEffect, useState } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const CatalogPage = () => {
  // Mantenemos los estados siempre como arrays vacíos por defecto
  const [vinos, setVinos] = useState([]);
  const [cervezas, setCervezas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Cargamos vinos
      try {
        const resVinos = await api.get('/vinos');
        // REVISIÓN AQUÍ: Accedemos a .data.data porque tu API devuelve un objeto con la lista dentro
        const listaVinos = resVinos.data.data || resVinos.data; 
        setVinos(Array.isArray(listaVinos) ? listaVinos : []);
      } catch (err) {
        console.error("Error cargando vinos:", err);
      }

      // Cargamos cervezas
      try {
        const resCervezas = await api.get('/cervezas');
        // REVISIÓN AQUÍ: Lo mismo para las cervezas
        const listaCervezas = resCervezas.data.data || resCervezas.data;
        setCervezas(Array.isArray(listaCervezas) ? listaCervezas : []);
      } catch (err) {
        console.error("Error cargando cervezas:", err);
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-20 font-bold text-red-800 italic">Cargando nuestra bodega...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      
      {/* SECCIÓN VINOS - Añadimos id para que el Navbar haga scroll */}
      <section id="vinos-section" className="mb-12 scroll-mt-24">
        <h2 className="text-3xl font-bold text-red-900 mb-6 border-b-2 border-red-100 pb-2 italic">
          Nuestros Vinos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {vinos.length > 0 ? (
            vinos.map(v => <ProductCard key={v._id} producto={v} tipo="vino" />)
          ) : (
            <p className="text-gray-500 col-span-full text-center py-10">No hay vinos disponibles en este momento.</p>
          )}
        </div>
      </section>

      {/* SECCIÓN CERVEZAS - Añadimos id para que el Navbar haga scroll */}
      <section id="cervezas-section" className="scroll-mt-24">
        <h2 className="text-3xl font-bold text-yellow-700 mb-6 border-b-2 border-yellow-100 pb-2 italic">
          Cervezas Artesanales
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cervezas.length > 0 ? (
            cervezas.map(c => <ProductCard key={c._id} producto={c} tipo="cerveza" />)
          ) : (
            <p className="text-gray-500 col-span-full text-center py-10">
              {/* Si sigue dando 401, este mensaje aparecerá en lugar de romper la web */}
              No se han podido cargar las cervezas. Revisa los permisos del Backend.
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default CatalogPage;