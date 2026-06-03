import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const STATUS_LABEL = {
    PENDENTE: 'Pendente',
    EM_PREPARO: 'Em preparo',
    PRONTO: 'Pronto',
    SAIU_PARA_ENTREGA: 'Saiu p/ entrega',
    ENTREGUE: 'Entregue',
    CANCELADO: 'Cancelado',
};

export default function EntregadorPainel() {
    const { usuario, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [pedidos, setPedidos] = useState([]);

    useEffect(() => {
        if (!usuario || usuario.perfil !== 'ENTREGADOR') {
            navigate('/login');
            return;
        }
        
        carregarPedidos();

        const intervaloAtualizacao = setInterval(() => {
            carregarPedidos();
        }, 300);

        return () => clearInterval(intervaloAtualizacao);
    }, [usuario, navigate]);

    async function carregarPedidos() {
        try {
            const response = await api.get('/pedidos'); 
            
            const pedidosFiltrados = response.data.filter(p => 
                p.statusPedido === 'SAIU_PARA_ENTREGA' || p.statusPedido === 'ENTREGUE'
            );
            
            pedidosFiltrados.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
            
            setPedidos(pedidosFiltrados);
        } catch (error) {
            console.error("Erro ao carregar pedidos", error);
        }
    }

    return (
        <div className="app-shell">
            <header className="topbar">
                <div>
                    <span className="brand-kicker">Entregador</span>
                    <h1>Relatório de Entregas</h1>
                </div>
                <nav className="nav-actions">
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>Olá, {usuario?.nome}</span>
                    <button className="ghost-button" onClick={() => { logout(); navigate('/login'); }}>Sair</button>
                </nav>
            </header>

            <div style={{ padding: '0 24px', paddingBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <h2 style={{ margin: 0 }}>Suas Entregas ({pedidos.length})</h2>
                    <span style={{ fontSize: '0.8rem', color: '#888' }}></span>
                </div>

                <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 12, padding: 16, border: '1px solid #e3d8cc', maxWidth: 1200 }}>
                    {pedidos.length === 0 ? (
                        <p style={{ color: '#999' }}>Nenhuma entrega registrada no momento.</p>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '12px 8px' }}>ID</th>
                                    <th style={{ padding: '12px 8px' }}>Informações do Cliente</th>
                                    <th style={{ padding: '12px 8px' }}>Pedido e Pagamento</th>
                                    <th style={{ padding: '12px 8px' }}>Total a Receber</th>
                                    <th style={{ padding: '12px 8px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pedidos.map(pedido => (
                                    <tr key={pedido.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px 8px', verticalAlign: 'top' }}>
                                            <strong>#{pedido.id}</strong>
                                        </td>
                                        
                                        <td style={{ padding: '12px 8px', verticalAlign: 'top' }}>
                                            <strong style={{ fontSize: '1.05rem', color: '#111' }}>
                                                👤 {pedido.usuario?.nome || pedido.cliente?.nome || pedido.nomeUsuario || 'Cliente não identificado'}
                                            </strong>
                                            <div style={{ fontSize: '0.9rem', color: '#555', marginTop: 6, lineHeight: '1.4' }}>
                                                <strong>📍 Endereço:</strong><br/>
                                                {pedido.enderecoEntrega || 'Retirada na Loja'}<br/>
                                            </div>
                                        </td>

                                        <td style={{ padding: '12px 8px', verticalAlign: 'top', maxWidth: '280px' }}>
                                            <div style={{ fontSize: '0.9rem', color: '#333', marginBottom: 6 }}>
                                                <strong>💳 Cobrar em:</strong> {pedido.formaPagamento}
                                            </div>
                                            <strong style={{ fontSize: '0.85rem', color: '#666' }}>Pacote contém:</strong>
                                            <ul style={{ margin: '4px 0 0', paddingLeft: '20px', fontSize: '0.85rem', color: '#555' }}>
                                                {pedido.itens?.map(item => (
                                                    <li key={item.id}>{item.quantidade}x {item.nomeProduto}</li>
                                                ))}
                                            </ul>
                                        </td>

                                        <td style={{ padding: '12px 8px', verticalAlign: 'top', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                            R$ {pedido.valorTotal?.toFixed(2)}
                                        </td>

                                        <td style={{ padding: '12px 8px', verticalAlign: 'top' }}>
                                            <span style={{ 
                                                fontWeight: 'bold', 
                                                color: pedido.statusPedido === 'ENTREGUE' ? '#10b981' : '#f97316',
                                                background: pedido.statusPedido === 'ENTREGUE' ? '#d1fae5' : '#ffedd5',
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                fontSize: '0.85rem',
                                                display: 'inline-block'
                                            }}>
                                                {STATUS_LABEL[pedido.statusPedido] || pedido.statusPedido}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}