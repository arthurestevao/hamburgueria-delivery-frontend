import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { CarrinhoContext } from '../../context/CarrinhoContext';

export default function Carrinho() {
  const { itens, removerItem, limparCarrinho } = useContext(CarrinhoContext);
  const { usuario } = useContext(AuthContext);
  const [tipoPedido, setTipoPedido] = useState('ENTREGA');
  const [formaPagamento, setFormaPagamento] = useState('PIX');
  const [enderecoEntrega, setEnderecoEntrega] = useState(usuario?.endereco || '');
  const [codigoCupom, setCodigoCupom] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  
  const [pedidoFinalizado, setPedidoFinalizado] = useState(null);

  const total = itens.reduce((acc, item) => acc + Number(item.preco) * item.quantidade, 0);

  async function finalizarPedido() {
    setErro('');

    if (!usuario?.id) {
      setErro('Entre ou crie uma conta para finalizar o pedido.');
      return;
    }

    if (!itens.length) {
      setErro('Adicione pelo menos um item ao carrinho.');
      return;
    }

    if (tipoPedido === 'ENTREGA' && !enderecoEntrega.trim()) {
      setErro('Informe o endereco de entrega.');
      return;
    }

    const produtoIds = itens.flatMap(item =>
      Array.from({ length: item.quantidade }, () => item.id)
    );

    try {
      setEnviando(true);
      const response = await api.post('/pedidos', {
        usuarioId: usuario.id,
        tipoPedido,
        formaPagamento,
        enderecoEntrega: tipoPedido === 'ENTREGA' ? enderecoEntrega : '',
        codigoCupom,
        produtoIds
      });

      limparCarrinho();
      setPedidoFinalizado(response.data);
      
    } catch (error) {
      setErro(error.response?.data?.mensagem || 'nao foi possível criar o pedido');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <span className="brand-kicker">Hamburgueria Delivery</span>
          <h1>Carrinho</h1>
        </div>

        <nav className="nav-actions">
          <Link to="/">Voltar ao cardapio</Link>
          {!usuario?.id && <Link to="/login">Entrar</Link>}
        </nav>
      </header>

      {pedidoFinalizado ? (
        <main style={{ maxWidth: 600, margin: '60px auto', textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
          <h2 style={{ fontSize: '2rem', marginBottom: '8px', color: '#22c55e' }}>
            Pedido realizado com sucesso!
          </h2>
          <p style={{ fontSize: '1.1rem', color: '#555', marginBottom: '32px' }}>
            O seu pedido <strong>#{pedidoFinalizado.id}</strong> já foi enviado para a nossa cozinha.
          </p>
          
          <Link 
            to="/historico" 
            style={{
              display: 'inline-block',
              background: '#d64724',
              color: '#fff',
              padding: '14px 28px',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              boxShadow: '0 4px 6px rgba(214, 71, 36, 0.2)'
            }}
          >
            Acompanhar meu pedido
          </Link>
        </main>
      ) : (
        <main className="cart-layout">
          <section className="cart-list">
            {itens.length === 0 ? (
              <div className="empty-state">
                <h2>Seu carrinho esta vazio</h2>
                <p>Volte ao cardapio e escolha seu burger, combo ou acompanhamento.</p>
                <Link className="primary-link" to="/">Ver cardapio</Link>
              </div>
            ) : (
              itens.map(item => (
                <article className="cart-item" key={item.id}>
                  <div>
                    <h3>{item.nome}</h3>
                    <p>Quantidade: {item.quantidade}</p>
                  </div>

                  <div className="cart-item-actions">
                    <strong>
                      {(Number(item.preco) * item.quantidade).toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      })}
                    </strong>

                    <button type="button" onClick={() => removerItem(item.id)}>
                      Remover
                    </button>
                  </div>
                </article>
              ))
            )}
          </section>

          <aside className="summary">
            <h2>Resumo</h2>

            {!usuario?.id && (
              <p className="summary-note">
                Para fazer o pedido, entre ou crie uma conta.
              </p>
            )}

            <div>
              <span>Subtotal</span>
              <strong>
                {total.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </strong>
            </div>

            <label>
              Tipo do pedido
              <select value={tipoPedido} onChange={(e) => setTipoPedido(e.target.value)}>
                <option value="ENTREGA">Entrega</option>
                <option value="RETIRADA">Retirada</option>
              </select>
            </label>

            <label>
              Pagamento
              <select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
                <option value="PIX">Pix</option>
                <option value="CARTAO">Cartao</option>
                <option value="DINHEIRO">Dinheiro</option>
              </select>
            </label>

            {tipoPedido === 'ENTREGA' && (
              <label>
                Endereco
                <input
                  type="text"
                  value={enderecoEntrega}
                  onChange={(e) => setEnderecoEntrega(e.target.value)}
                  placeholder="Rua, numero e bairro"
                />
              </label>
            )}

            <label>
              Cupom
              <input
                type="text"
                value={codigoCupom}
                onChange={(e) => setCodigoCupom(e.target.value)}
                placeholder="Opcional"
              />
            </label>

            {erro && <p className="form-error">{erro}</p>}

            <button type="button" disabled={!itens.length || enviando} onClick={finalizarPedido}>
              {enviando ? 'Enviando pedido...' : 'Finalizar pedido'}
            </button>
          </aside>
        </main>
      )}
    </div>
  );
}