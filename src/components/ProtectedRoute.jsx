import { Navigate } from 'react-router-dom';

const ProtectedAdminRoute = ({ children, user }) => {
  const rolesPermitidos = ['admin', 'editor'];
  if (!user || !rolesPermitidos.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};