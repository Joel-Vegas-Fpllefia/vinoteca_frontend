const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // 1. Mientras estemos cargando el localStorage, no hacemos nada
  if (loading) {
    return <div className="flex justify-center items-center h-screen text-red-800 font-bold">Verificando credenciales...</div>;
  }

  // 2. DEBUG: Mira esto en la consola cuando te rebote
  console.log("Guardia verificando usuario:", user);

  // 3. Verificamos si hay usuario y si tiene el ROL adecuado
  const esAutorizado = user?.rol === 'admin' || user?.rol === 'editor';

  if (!user || !esAutorizado) {
    console.warn("Acceso denegado: No hay usuario o el rol no es válido. Rol actual:", user?.rol);
    return <Navigate to="/login" replace />;
  }

  // 4. Si todo está bien, adelante
  return children;
};