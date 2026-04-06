const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth(); // Usamos el hook del contexto

  if (loading) return <div>Cargando...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Comprobamos el campo 'rol' que viene de tu base de datos
  const esAutorizado = user.rol === 'admin' || user.rol === 'editor';

  if (!esAutorizado) {
    console.warn("Acceso denegado. Rol detectado:", user.rol);
    return <Navigate to="/" replace />;
  }

  return children;
};