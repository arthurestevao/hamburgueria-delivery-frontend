import { useEffect, useState, useContext, useRef } from 'react';
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
  
  const pedidosRef = useRef([]);

  useEffect(() => {
    if (!usuario?.id) {
      navigate('/login');
      return;
    }
    
    buscarHistorico();

    const intervaloAtualizacao = setInterval(() => {
      buscarHistoricoSilencioso();
    }, 1000);

    return () => clearInterval(intervaloAtualizacao);
  }, [usuario, navigate]);

  async function buscarHistorico() {
    try {
      const response = await api.get(`/pedidos/usuario/${usuario.id}`);
      pedidosRef.current = response.data; 
      setPedidos(response.data); 
    } catch {
      setErro('Não foi possível carregar o histórico.');
    } finally {
      setCarregando(false);
    }
  }

  async function buscarHistoricoSilencioso() {
    try {
      const response = await api.get(`/pedidos/usuario/${usuario.id}`);
      const pedidosNovos = response.data;
      const pedidosAntigos = pedidosRef.current; 
      
      if (pedidosAntigos.length > 0) {
        pedidosNovos.forEach(pedidoNovo => {
          const pedidoAntigo = pedidosAntigos.find(p => p.id === pedidoNovo.id);
          
          if (pedidoAntigo && pedidoAntigo.statusPedido !== pedidoNovo.statusPedido) {
            if (pedidoNovo.statusPedido === 'EM_PREPARO') {
              alert(`👨‍🍳 O seu pedido #${pedidoNovo.id} começou a ser preparado!`);
            } else if (pedidoNovo.statusPedido === 'SAIU_PARA_ENTREGA') {
              alert(`🛵 Oba! O seu pedido #${pedidoNovo.id} acabou de sair para entrega!`);
            } else if (pedidoNovo.statusPedido === 'PRONTO') {
              alert(`📦 O seu pedido #${pedidoNovo.id} está pronto! Pode vir retirar na loja.`);
            } else if (pedidoNovo.statusPedido === 'ENTREGUE') {
              alert(`✅ O seu pedido #${pedidoNovo.id} foi finalizado. Bom apetite!`);
            }
          }
        });
      }
      
      pedidosRef.current = pedidosNovos;
      setPedidos(pedidosNovos);
      
    } catch (error) {
      console.error("Erro na atualização automática:", error);
    }
  }

  async function confirmarRecebimento(pedidoId) {
    if (!window.confirm('Você confirma que já recebeu o pedido em seu endereço?')) return;
    
    try {
      await api.patch(`/pedidos/${pedidoId}/status`, { status: 'ENTREGUE' });
      
      const pedidosAtualizados = pedidos.map(p => 
        p.id === pedidoId ? { ...p, statusPedido: 'ENTREGUE' } : p
      );
      
      pedidosRef.current = pedidosAtualizados; 
      setPedidos(pedidosAtualizados);
      
    } catch (error) {
      console.error("Erro ao confirmar recebimento", error);
      alert('Erro ao confirmar recebimento.');
    }
  }

  const formatarMoeda = (valor) => {
    return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

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

        {pedidos.map(pedido => {
          const subtotalItens = pedido.itens?.reduce((acc, item) => acc + Number(item.subtotal), 0) || 0;
          const taxaDeEntrega = pedido.tipoPedido === 'ENTREGA' ? Number(pedido.taxaEntrega || 0) : 0;
          const totalSemDesconto = subtotalItens + taxaDeEntrega;
          
          let valorDesconto = totalSemDesconto - Number(pedido.valorTotal);
          if (valorDesconto < 0.01) valorDesconto = 0; // Limpeza de casas decimais

          return (
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
                  fontSize: '0.8rem',
                  transition: 'all 0.3s ease'
                }}>
                  {STATUS_LABEL[pedido.statusPedido] || pedido.statusPedido}
                </span>
              </div>

              <ul style={{ margin: '4px 0', padding: '0 0 0 16px', fontSize: '0.9rem', width: '100%' }}>
                {pedido.itens?.map(item => (
                  <li key={item.id} style={{ marginBottom: '4px' }}>
                    {item.quantidade}× {item.nomeProduto}
                    <span style={{ float: 'right', color: '#555' }}>
                      {formatarMoeda(item.subtotal)}
                    </span>
                  </li>
                ))}
              </ul>

              <div style={{ 
                width: '100%', 
                marginTop: 8, 
                paddingTop: 12, 
                paddingBottom: 12, 
                borderTop: '1px dashed #ccc', 
                borderBottom: '1px solid #eee', 
                fontSize: '0.85rem', 
                color: '#555' 
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span>Subtotal</span>
                  <span>{formatarMoeda(subtotalItens)}</span>
                </div>
                
                {pedido.tipoPedido === 'ENTREGA' && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span>Taxa de Entrega</span>
                    <span>{formatarMoeda(taxaDeEntrega)}</span>
                  </div>
                )}

                {pedido.codigoCupom && valorDesconto > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, color: '#22c55e' }}>
                    <span>🏷️ Desconto (Cupom: {pedido.codigoCupom})</span>
                    <span>- {formatarMoeda(valorDesconto)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: '1rem', color: '#111' }}>
                  <strong>Total Final</strong>
                  <strong>{formatarMoeda(pedido.valorTotal)}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginTop: 4 }}>
                  <p style={{ margin: 0, fontSize: '0.78rem', color: '#999' }}>
                  {new Date(pedido.criadoEm).toLocaleString('pt-BR')}
                  </p>
                  
                  {pedido.statusPedido === 'SAIU_PARA_ENTREGA' && pedido.tipoPedido === 'ENTREGA' && (
                    <button 
                      onClick={() => confirmarRecebimento(pedido.id)}
                      style={{ 
                        background: '#22c55e', 
                        color: '#fff', 
                        padding: '8px 16px', 
                        borderRadius: '8px', 
                        border: 'none', 
                        fontWeight: 'bold', 
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        boxShadow: '0 2px 4px rgba(34, 197, 94, 0.2)'
                      }}
                    >
                      Confirmar Recebimento
                    </button>
                  )}
              </div>
            </article>
          );
        })}
      </main>
    </div>
  );
}