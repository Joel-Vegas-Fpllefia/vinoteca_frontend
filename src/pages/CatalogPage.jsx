import { useEffect, useState } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const CatalogPage = () => {
  const [vinos, setVinos] = useState([]);
  const [cervezas, setCervezas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resVinos, resCervezas] = await Promise.all([
          api.get('/vinos'),
          api.get('/cervezas')
        ]);
        setVinos(resVinos.data);
        setCervezas(resCervezas.data);
      } catch (err) {
        console.error("Error cargando productos", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center py-20 font-bold text-red-800">Cargando nuestra bodega...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* SECCIÓN VINOS */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-red-900 mb-6 border-b-2 border-red-100 pb-2 italic">Nuestros Vinos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {vinos.map(v => <ProductCard key={v._id} producto={v} tipo="vino" />)}
        </div>
      </section>

      {/* SECCIÓN CERVEZAS */}
      <section>
        <h2 className="text-3xl font-bold text-yellow-700 mb-6 border-b-2 border-yellow-100 pb-2 italic">Cervezas Artesanales</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cervezas.map(c => <ProductCard key={c._id} producto={c} tipo="cerveza" />)}
        </div>
      </section>
    </div>
  );
};

export default CatalogPage;