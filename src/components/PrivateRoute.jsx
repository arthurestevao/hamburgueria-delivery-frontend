import { Navigate } from 'react-router-dom';

export default function PrivateRoute({ children, perfil }) {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (!usuario) {
    return <Navigate to="/login" />;
  }

  if (perfil && usuario.tipo !== perfil) {
    return <Navigate to="/" />;
  }

  return children;
}