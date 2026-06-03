import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const STATUS_LABEL = {
  PENDENTE: 'Pendente',
  EM_PREPARO: 'Em preparo',
  PRONTO: 'Pronto para retirar',
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

export default function EntregadorPainel() {
  const { usuario, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [pedidosProximos, setPedidosProximos] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [atualizando, setAtualizando] = useState(null);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    if (!usuario || usuario.perfil !== 'ENTREGADOR') {
      navigate('/login');
      return;
    }
    buscarPedidos();
  }, []);

  /**
   * Busca pedidos com status PRONTO (prontos para sair para entrega)
   * e SAIU_PARA_ENTREGA (em trânsito, aguardando confirmação).
   * A API retorna todos os pedidos do usuário; aqui filtramos no frontend
   * por não ter um endpoint de listagem geral de pedidos por status ainda.
   */
  async function buscarPedidos() {
    setCarregando(true);
    try {
      // Usa o id do usuário vinculado ao entregador para buscar seus pedidos em andamento.
      // Em projetos futuros, um endpoint GET /entregas/pendentes seria mais correto.
      const res = await api.get(`/pedidos/usuario/${usuario.id}`);
      const ativos = res.data.filter(p =>
        ['PRONTO', 'SAIU_PARA_ENTREGA'].includes(p.statusPedido)
      );
      setPedidosProximos(ativos);
    } catch {
      // Silencioso; sem pedidos para mostrar
    } finally {
      setCarregando(false);
    }
  }

  async function sairParaEntrega(pedidoId) {
    setAtualizando(pedidoId);
    setMensagem('');
    try {
      await api.patch(`/entregas/${pedidoId}/sair`);
      setMensagem(`Pedido #${pedidoId} marcado como saiu para entrega.`);
      await buscarPedidos();
    } catch (err) {
      setMensagem(err.response?.data?.mensagem || 'Erro ao atualizar pedido.');
    } finally {
      setAtualizando(null);
    }
  }

  async function confirmarEntrega(pedidoId) {
    setAtualizando(pedidoId);
    setMensagem('');
    try {
      await api.patch(`/entregas/${pedidoId}/confirmar`);
      setMensagem(`Pedido #${pedidoId} confirmado como entregue!`);
      await buscarPedidos();
    } catch (err) {
      setMensagem(err.response?.data?.mensagem || 'Erro ao confirmar entrega.');
    } finally {
      setAtualizando(null);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <span className="brand-kicker">Entregador</span>
          <h1>Minhas Entregas</h1>
        </div>
        <nav className="nav-actions">
          <span style={{ fontSize: '0.9rem', color: '#666' }}>Olá, {usuario?.nome}</span>
          <button className="ghost-button" onClick={() => { logout(); navigate('/login'); }}>
            Sair
          </button>
        </nav>
      </header>

      {mensagem && (
        <p style={{
          background: mensagem.includes('Erro') ? '#fee2e2' : '#dcfce7',
          color: mensagem.includes('Erro') ? '#991b1b' : '#166534',
          padding: '10px 16px',
          borderRadius: 8,
          marginBottom: 20
        }}>
          {mensagem}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Pedidos em andamento ({pedidosProximos.length})</h2>
        <button
          type="button"
          onClick={buscarPedidos}
          style={{ background: '#fff', border: '1px solid #e3d8cc', padding: '8px 16px', borderRadius: 8, cursor: 'pointer' }}
        >
          🔄 Atualizar
        </button>
      </div>

      {carregando && <p className="status">Carregando...</p>}

      {!carregando && pedidosProximos.length === 0 && (
        <div className="empty-state">
          <h2>Nenhuma entrega pendente</h2>
          <p>Quando pedidos estiverem prontos para sair, eles aparecerão aqui.</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 640 }}>
        {pedidosProximos.map(pedido => (
          <article
            key={pedido.id}
            style={{
              background: '#fff',
              borderRadius: 12,
              padding: 20,
              border: '1px solid #e3d8cc',
              display: 'flex',
              flexDirection: 'column',
              gap: 12
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0 }}>Pedido #{pedido.id}</h3>
              <span style={{
                background: (STATUS_COLOR[pedido.statusPedido] || '#999') + '22',
                color: STATUS_COLOR[pedido.statusPedido] || '#999',
                borderRadius: 20,
                padding: '4px 12px',
                fontWeight: 700,
                fontSize: '0.8rem'
              }}>
                {STATUS_LABEL[pedido.statusPedido] || pedido.statusPedido}
              </span>
            </div>

            <div style={{ fontSize: '0.9rem' }}>
              <p style={{ margin: '0 0 4px' }}><strong>Cliente:</strong> {pedido.nomeUsuario}</p>
              {pedido.enderecoEntrega && (
                <p style={{ margin: '0 0 4px' }}><strong>Endereço:</strong> {pedido.enderecoEntrega}</p>
              )}
              <p style={{ margin: 0 }}><strong>Pagamento:</strong> {pedido.formaPagamento}</p>
            </div>

            <ul style={{ margin: 0, padding: '0 0 0 16px', fontSize: '0.88rem' }}>
              {pedido.itens?.map(item => (
                <li key={item.id}>{item.quantidade}× {item.nomeProduto}</li>
              ))}
            </ul>

            <div style={{ display: 'flex', gap: 10 }}>
              {pedido.statusPedido === 'PRONTO' && (
                <button
                  type="button"
                  disabled={atualizando === pedido.id}
                  onClick={() => sairParaEntrega(pedido.id)}
                  style={{ background: '#f97316', color: '#fff', padding: '10px 18px', borderRadius: 8, border: 'none', fontWeight: 700, flex: 1 }}
                >
                  {atualizando === pedido.id ? 'Atualizando...' : '🛵 Saiu para entrega'}
                </button>
              )}
              {pedido.statusPedido === 'SAIU_PARA_ENTREGA' && (
                <button
                  type="button"
                  disabled={atualizando === pedido.id}
                  onClick={() => confirmarEntrega(pedido.id)}
                  style={{ background: '#22c55e', color: '#fff', padding: '10px 18px', borderRadius: 8, border: 'none', fontWeight: 700, flex: 1 }}
                >
                  {atualizando === pedido.id ? 'Confirmando...' : '✅ Confirmar entrega'}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}