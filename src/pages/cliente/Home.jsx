import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { CarrinhoContext } from '../../context/CarrinhoContext';
import { AuthContext } from '../../context/AuthContext';


export default function Home() {
  const [produtos, setProdutos] = useState([]);
  const [busca, setBusca] = useState('');
  const [categoria, setCategoria] = useState('Todos');
  const [carregando, setCarregando] = useState(true);

  const { itens, adicionarItem } = useContext(CarrinhoContext);
  const { usuario, logout } = useContext(AuthContext);

  useEffect(() => { buscarProdutos(); }, []);

  async function buscarProdutos() {
  try {
    const response = await api.get('/produtos');
    setProdutos(response.data);
  } catch {
    setProdutos([]);
  } finally {
    setCarregando(false);
  }
}

  const categorias = ['Todos', ...new Set(produtos.map(p => p.categoria).filter(Boolean))];

  const produtosFiltrados = produtos.filter(p => {
    const nome = p.nome.toLowerCase().includes(busca.toLowerCase());
    const cat = categoria === 'Todos' || p.categoria === categoria;
    return nome && cat;
  });

  const totalItens = itens.reduce((acc, item) => acc + item.quantidade, 0);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <span className="brand-kicker">Delivery</span>
          <h1>Hamburgueria</h1>
        </div>

        <nav className="nav-actions">
          {usuario ? (
            <>
              <span style={{ fontSize: '0.88rem' }}>Olá, {usuario.nome?.split(' ')[0]}</span>
              {usuario.perfil === 'ADMINISTRADOR'
                ? <Link to="/admin">Dashboard</Link>
                : <Link to="/historico">Meus pedidos</Link>
              }
              <button className="ghost-button" style={{ padding: '6px 14px' }} onClick={logout}>Sair</button>
            </>
          ) : (
            <Link to="/login">Entrar</Link>
          )}
          <Link className="cart-link" to="/carrinho">Carrinho ({totalItens})</Link>
        </nav>
      </header>

      <section className="hero">
        <div>
          <p className="eyebrow">Hamburgueria artesanal</p>
          <h2>Burgers na chapa, batata crocante e molho da casa.</h2>
          <p>Escolha seu burger ou combo favorito e mate a sua fome!</p>
        </div>
      </section>

      <section className="toolbar">
        <input
          type="search"
          placeholder="Buscar burger, combo ou bebida"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <div className="category-list">
          {categorias.map(item => (
            <button
              className={categoria === item ? 'active' : ''}
              key={item}
              type="button"
              onClick={() => setCategoria(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {carregando && <p className="status">Carregando cardápio...</p>}

      <main className="product-grid">
        {produtosFiltrados.map(produto => (
          <article className="product-card" key={produto.id}>
            <div>
              <span>{produto.categoria || 'Burger'}</span>
              <h3>{produto.nome}</h3>
              <p>{produto.descricao || 'Preparado na chapa e montado na hora.'}</p>
            </div>
            <footer>
              <strong>
                {Number(produto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </strong>
              <button type="button" onClick={() => adicionarItem(produto)}>
                Adicionar
              </button>
            </footer>
          </article>
        ))}
      </main>
    </div>
  );
}