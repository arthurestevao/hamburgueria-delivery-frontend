import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

import Login from '../pages/auth/Login';
import Home from '../pages/cliente/Home';
import Carrinho from '../pages/cliente/Carrinho';
import Historico from '../pages/cliente/Historico';
import AdminDashboard from '../pages/admin/AdminDashboard';
import EntregadorPainel from '../pages/entregador/EntregadorPainel';

function PrivateRoute({ children, perfil }) {
  const { usuario } = useContext(AuthContext);

  if (!usuario) return <Navigate to="/login" />;
  if (perfil && usuario.perfil !== perfil) return <Navigate to="/" />;

  return children;
}

function RedirecionarHome() {
  const { usuario } = useContext(AuthContext);

  if (usuario?.perfil === 'ADMINISTRADOR') return <Navigate to="/admin" />;
  if (usuario?.perfil === 'ENTREGADOR') return <Navigate to="/entregador" />;

  return <Home />;
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<RedirecionarHome />} />
        <Route path="/carrinho" element={<Carrinho />} />

        {/* Cliente autenticado */}
        <Route
          path="/historico"
          element={
            <PrivateRoute perfil="CLIENTE">
              <Historico />
            </PrivateRoute>
          }
        />

        {/* Administrador */}
        <Route
          path="/admin"
          element={
            <PrivateRoute perfil="ADMINISTRADOR">
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Entregador */}
        <Route
          path="/entregador"
          element={
            <PrivateRoute perfil="ENTREGADOR">
              <EntregadorPainel />
            </PrivateRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}