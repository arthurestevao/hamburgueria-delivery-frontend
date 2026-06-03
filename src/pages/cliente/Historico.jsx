import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const STATUS_LABEL = {
  PENDENTE: 'Pendente',
  EM_PREPARO: 'Em preparo',
  PRONTO: 'Pronto',
  SAIU_PARA_ENTREGA: 'Saiu para entrega',
  ENTREGUE: 'Entregue',
  CANCELADO: 'Cancelado',
};

const STATUS_COLOR = {
  PENDENTE: '#f59e0b',
  EM_PREPARO: '#3b82f6',
  PRONTO: '#8b5cf6',
  SAIU_PARA_ENTREGA: '#f97316',
  ENTREGUE: '#22c55e',
  CANCELADO: '#ef4444',
};

export default function Historico() {
  const { usuario } = useContext(AuthContext);
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    if (!usuario?.id) {
      navigate('/login');
      return;
    }
    buscarHistorico();
  }, []);

  async function buscarHistorico() {
    try {
      const response = await api.get(`/pedidos/usuario/${usuario.id}`);
      setPedidos(response.data);
    } catch {
      setErro('Não foi possível carregar o histórico.');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <span className="brand-kicker">Hamburgueria Delivery</span>
          <h1>Meus Pedidos</h1>
        </div>
        <nav className="nav-actions">
          <Link to="/">Cardápio</Link>
          <Link to="/carrinho">Carrinho</Link>
        </nav>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto' }}>
        {carregando && <p className="status">Carregando pedidos...</p>}
        {erro && <p className="form-error">{erro}</p>}

        {!carregando && pedidos.length === 0 && (
          <div className="empty-state">
            <h2>Nenhum pedido ainda</h2>
            <p>Faça seu primeiro pedido e ele aparecerá aqui.</p>
            <Link className="primary-link" to="/">Ver cardápio</Link>
          </div>
        )}

        {pedidos.map(pedido => (
          <article key={pedido.id} className="cart-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
              <div>
                <h3 style={{ marginBottom: 4 }}>Pedido #{pedido.id}</h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>
                  {pedido.tipoPedido === 'ENTREGA' ? '🛵 Entrega' : '🏠 Retirada'} · {pedido.formaPagamento}
                </p>
              </div>
              <span style={{
                background: STATUS_COLOR[pedido.statusPedido] + '22',
                color: STATUS_COLOR[pedido.statusPedido],
                borderRadius: 20,
                padding: '4px 12px',
                fontWeight: 700,
                fontSize: '0.8rem'
              }}>
                {STATUS_LABEL[pedido.statusPedido] || pedido.statusPedido}
              </span>
            </div>

            <ul style={{ margin: '4px 0', padding: '0 0 0 16px', fontSize: '0.9rem' }}>
              {pedido.itens?.map(item => (
                <li key={item.id}>
                  {item.quantidade}× {item.nomeProduto}
                  {' — '}
                  {Number(item.subtotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </li>
              ))}
            </ul>

            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              {pedido.codigoCupom && (
                <span style={{ fontSize: '0.82rem', color: '#22c55e' }}>🏷 Cupom: {pedido.codigoCupom}</span>
              )}
              <strong style={{ marginLeft: 'auto' }}>
                Total: {Number(pedido.valorTotal).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </strong>
            </div>

            <p style={{ margin: 0, fontSize: '0.78rem', color: '#999' }}>
              {new Date(pedido.criadoEm).toLocaleString('pt-BR')}
            </p>
          </article>
        ))}
      </main>
    </div>
  );
}