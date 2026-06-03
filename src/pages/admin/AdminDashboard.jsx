import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const STATUS_OPTIONS = [
    'PENDENTE', 'EM_PREPARO', 'PRONTO', 'SAIU_PARA_ENTREGA', 'ENTREGUE', 'CANCELADO'
];

const STATUS_LABEL = {
    PENDENTE: 'Pendente',
    EM_PREPARO: 'Em preparo',
    PRONTO: 'Pronto',
    SAIU_PARA_ENTREGA: 'Saiu p/ entrega',
    ENTREGUE: 'Entregue',
    CANCELADO: 'Cancelado',
};

export default function AdminDashboard() {
    const { usuario, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [aba, setAba] = useState('pedidos');

    // Produtos
    const [produtos, setProdutos] = useState([]);
    const [nomeProduto, setNomeProduto] = useState('');
    const [precoProduto, setPrecoProduto] = useState('');
    const [descProduto, setDescProduto] = useState('');
    const [erroProduto, setErroProduto] = useState('');
    const [msgProduto, setMsgProduto] = useState('');
    const [editando, setEditando] = useState(null);
    const [nomeEdit, setNomeEdit] = useState('');
    const [precoEdit, setPrecoEdit] = useState('');
    const [descEdit, setDescEdit] = useState('');
    const [dispEdit, setDispEdit] = useState(true);

    // Cupons
    const [cupons, setCupons] = useState([]);
    const [codigoCupom, setCodigoCupom] = useState('');
    const [descontoCupom, setDescontoCupom] = useState('');
    const [freteGratis, setFreteGratis] = useState(false);
    const [validadeCupom, setValidadeCupom] = useState('');
    const [erroCupom, setErroCupom] = useState('');
    const [msgCupom, setMsgCupom] = useState('');

    // Entregadores
    const [entregadores, setEntregadores] = useState([]);
    const [novoEnt, setNovoEnt] = useState({ nome: '', email: '', senha: '', telefone: '', endereco: '', veiculo: '' });
    const [erroEnt, setErroEnt] = useState('');
    const [msgEnt, setMsgEnt] = useState('');

    // Clientes
    const [clientes, setClientes] = useState([]);

    useEffect(() => {
        if (!usuario || usuario.perfil !== 'ADMINISTRADOR') {
            navigate('/login');
            return;
        }
        carregarDados();
    }, []);

    async function carregarDados() {
        try {
            const [p, c, e, cl] = await Promise.all([
                api.get('/produtos'),
                api.get('/cupons'),
                api.get('/admin/entregadores'),
                api.get('/admin/clientes'),
            ]);
            setProdutos(p.data);
            setCupons(c.data);
            setEntregadores(e.data);
            setClientes(cl.data);
        } catch { /* continua com arrays vazios */ }
    }

    // ---- Produtos ----
    async function criarProduto(e) {
        e.preventDefault();
        setErroProduto(''); setMsgProduto('');
        try {
            const res = await api.post('/produtos', {
                nome: nomeProduto,
                preco: parseFloat(precoProduto),
                descricao: descProduto,
                disponivel: true
            });
            setProdutos(prev => [...prev, res.data]);
            setNomeProduto(''); setPrecoProduto(''); setDescProduto('');
            setMsgProduto('Produto cadastrado!');
        } catch (err) {
            setErroProduto(err.response?.data?.mensagem || 'Erro ao cadastrar produto.');
        }
    }

    async function removerProduto(id) {
        if (!confirm('Remover produto?')) return;
        try {
            await api.delete(`/produtos/${id}`);
            setProdutos(prev => prev.filter(p => p.id !== id));
        } catch { alert('Erro ao remover produto.'); }
    }

    function abrirEdicao(produto) {
        setEditando(produto.id);
        setNomeEdit(produto.nome);
        setPrecoEdit(produto.preco);
        setDescEdit(produto.descricao || '');
        setDispEdit(produto.disponivel);
    }

    async function salvarEdicao(id) {
        try {
            const res = await api.put(`/produtos/${id}`, {
                nome: nomeEdit,
                preco: parseFloat(precoEdit),
                descricao: descEdit,
                disponivel: dispEdit
            });
            setProdutos(prev => prev.map(p => p.id === id ? res.data : p));
            setEditando(null);
            setMsgProduto('Produto atualizado!');
        } catch (err) {
            setErroProduto(err.response?.data?.mensagem || 'Erro ao atualizar produto.');
        }
    }

    // ---- Cupons ----
    async function criarCupom(e) {
        e.preventDefault();
        setErroCupom(''); setMsgCupom('');
        try {
            const res = await api.post('/cupons', {
                codigo: codigoCupom,
                desconto: parseFloat(descontoCupom),
                freteGratis,
                validade: new Date(validadeCupom).toISOString().replace('Z', '')
            });
            setCupons(prev => [...prev, res.data]);
            setCodigoCupom(''); setDescontoCupom(''); setValidadeCupom(''); setFreteGratis(false);
            setMsgCupom('Cupom criado!');
        } catch (err) {
            setErroCupom(err.response?.data?.mensagem || 'Erro ao criar cupom.');
        }
    }

    async function desativarCupom(id) {
        try {
            await api.delete(`/cupons/${id}`);
            setCupons(prev => prev.filter(c => c.id !== id));
        } catch { alert('Erro ao desativar cupom.'); }
    }

    // ---- Entregadores ----
    async function cadastrarEntregador(e) {
        e.preventDefault();
        setErroEnt(''); setMsgEnt('');
        try {
            const res = await api.post('/admin/entregadores', novoEnt);
            setEntregadores(prev => [...prev, res.data]);
            setNovoEnt({ nome: '', email: '', senha: '', telefone: '', endereco: '', veiculo: '' });
            setMsgEnt('Entregador cadastrado!');
        } catch (err) {
            setErroEnt(err.response?.data?.mensagem || 'Erro ao cadastrar entregador.');
        }
    }

    async function removerEntregador(id) {
        if (!confirm('Remover entregador?')) return;
        try {
            await api.delete(`/admin/entregadores/${id}`);
            setEntregadores(prev => prev.filter(e => e.id !== id));
        } catch { alert('Erro ao remover entregador.'); }
    }

    const abas = [
        { key: 'pedidos', label: '📋 Produtos' },
        { key: 'cupons', label: '🏷 Cupons' },
        { key: 'entregadores', label: '🛵 Entregadores' },
        { key: 'clientes', label: '👥 Clientes' },
    ];

    return (
        <div className="app-shell">
            <header className="topbar">
                <div>
                    <span className="brand-kicker">Admin</span>
                    <h1>Painel Administrativo</h1>
                </div>
                <nav className="nav-actions">
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>Olá, {usuario?.nome}</span>
                    <button className="ghost-button" onClick={() => { logout(); navigate('/login'); }}>Sair</button>
                </nav>
            </header>

            {/* Abas */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
                {abas.map(a => (
                    <button
                        key={a.key}
                        type="button"
                        onClick={() => setAba(a.key)}
                        style={{
                            padding: '8px 18px',
                            borderRadius: 8,
                            background: aba === a.key ? '#d64724' : '#fff',
                            color: aba === a.key ? '#fff' : '#211917',
                            border: '1px solid #e3d8cc',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        {a.label}
                    </button>
                ))}
            </div>

            {/* ---- Produtos ---- */}
            {aba === 'pedidos' && (
                <div>
                    <form onSubmit={criarProduto} style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 28, border: '1px solid #e3d8cc', maxWidth: 500 }}>
                        <h2 style={{ marginBottom: 16 }}>Novo produto</h2>
                        <input
                            placeholder="Nome do produto"
                            value={nomeProduto}
                            onChange={e => setNomeProduto(e.target.value)}
                            required
                            style={{ display: 'block', width: '100%', marginBottom: 10, padding: 10, borderRadius: 8, border: '1px solid #e3d8cc' }}
                        />
                        <input
                            type="number"
                            step="0.01"
                            placeholder="Preço (ex: 32.90)"
                            value={precoProduto}
                            onChange={e => setPrecoProduto(e.target.value)}
                            required
                            style={{ display: 'block', width: '100%', marginBottom: 10, padding: 10, borderRadius: 8, border: '1px solid #e3d8cc' }}
                        />
                        <input
                            placeholder="Descrição (opcional)"
                            value={descProduto}
                            onChange={e => setDescProduto(e.target.value)}
                            style={{ display: 'block', width: '100%', marginBottom: 10, padding: 10, borderRadius: 8, border: '1px solid #e3d8cc' }}
                        />
                        {erroProduto && <p className="form-error">{erroProduto}</p>}
                        {msgProduto && <p className="form-success">{msgProduto}</p>}
                        <button type="submit" style={{ background: '#d64724', color: '#fff', padding: '10px 24px', borderRadius: 8, border: 'none', fontWeight: 700 }}>
                            Cadastrar produto
                        </button>
                    </form>

                    <h2>Produtos cadastrados ({produtos.length})</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 16 }}>
                        {produtos.map(p => (
                            <article key={p.id} className="product-card">
                                {editando === p.id ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        <input
                                            value={nomeEdit}
                                            onChange={e => setNomeEdit(e.target.value)}
                                            style={{ padding: 8, borderRadius: 6, border: '1px solid #e3d8cc' }}
                                        />
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={precoEdit}
                                            onChange={e => setPrecoEdit(e.target.value)}
                                            style={{ padding: 8, borderRadius: 6, border: '1px solid #e3d8cc' }}
                                        />
                                        <input
                                            value={descEdit}
                                            onChange={e => setDescEdit(e.target.value)}
                                            placeholder="Descrição"
                                            style={{ padding: 8, borderRadius: 6, border: '1px solid #e3d8cc' }}
                                        />
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' }}>
                                            <input type="checkbox" checked={dispEdit} onChange={e => setDispEdit(e.target.checked)} />
                                            Disponível
                                        </label>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button
                                                type="button"
                                                onClick={() => salvarEdicao(p.id)}
                                                style={{ background: '#22c55e', color: '#fff', padding: '6px 14px', borderRadius: 6, border: 'none', flex: 1 }}
                                            >
                                                Salvar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditando(null)}
                                                style={{ background: '#6b7280', color: '#fff', padding: '6px 14px', borderRadius: 6, border: 'none', flex: 1 }}
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <span>{p.disponivel ? '✅ Disponível' : '❌ Indisponível'}</span>
                                            <h3>{p.nome}</h3>
                                            <p>{p.descricao || '—'}</p>
                                        </div>
                                        <footer style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <strong>{Number(p.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong>
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <button
                                                    type="button"
                                                    onClick={() => abrirEdicao(p)}
                                                    style={{ background: '#3b82f6', color: '#fff', padding: '6px 14px', borderRadius: 6, border: 'none' }}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => removerProduto(p.id)}
                                                    style={{ background: '#ef4444', color: '#fff', padding: '6px 14px', borderRadius: 6, border: 'none' }}
                                                >
                                                    Remover
                                                </button>
                                            </div>
                                        </footer>
                                    </>
                                )}
                            </article>
                        ))}
                    </div>
                </div>
            )}

            {/* ---- Cupons ---- */}
            {aba === 'cupons' && (
                <div>
                    <form onSubmit={criarCupom} style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 28, border: '1px solid #e3d8cc', maxWidth: 500 }}>
                        <h2 style={{ marginBottom: 16 }}>Novo cupom</h2>
                        <input
                            placeholder="Código do cupom"
                            value={codigoCupom}
                            onChange={e => setCodigoCupom(e.target.value)}
                            required
                            style={{ display: 'block', width: '100%', marginBottom: 10, padding: 10, borderRadius: 8, border: '1px solid #e3d8cc' }}
                        />
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="Desconto em % (ex: 10)"
                            value={descontoCupom}
                            onChange={e => setDescontoCupom(e.target.value)}
                            required
                            style={{ display: 'block', width: '100%', marginBottom: 10, padding: 10, borderRadius: 8, border: '1px solid #e3d8cc' }}
                        />
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <input type="checkbox" checked={freteGratis} onChange={e => setFreteGratis(e.target.checked)} />
                            Frete grátis
                        </label>
                        <label style={{ display: 'block', marginBottom: 10, fontSize: '0.9rem' }}>
                            Validade
                            <input
                                type="datetime-local"
                                value={validadeCupom}
                                onChange={e => setValidadeCupom(e.target.value)}
                                required
                                style={{ display: 'block', width: '100%', marginTop: 4, padding: 10, borderRadius: 8, border: '1px solid #e3d8cc' }}
                            />
                        </label>
                        {erroCupom && <p className="form-error">{erroCupom}</p>}
                        {msgCupom && <p className="form-success">{msgCupom}</p>}
                        <button type="submit" style={{ background: '#d64724', color: '#fff', padding: '10px 24px', borderRadius: 8, border: 'none', fontWeight: 700 }}>
                            Criar cupom
                        </button>
                    </form>

                    <h2>Cupons ativos ({cupons.length})</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 600 }}>
                        {cupons.map(c => (
                            <div key={c.id} style={{ background: '#fff', border: '1px solid #e3d8cc', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong>{c.codigo}</strong>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#666' }}>
                                        {c.desconto}% de desconto{c.freteGratis ? ' · Frete grátis' : ''}
                                        {' · Válido até '}{new Date(c.validade).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => desativarCupom(c.id)}
                                    style={{ background: '#ef4444', color: '#fff', padding: '6px 14px', borderRadius: 6, border: 'none' }}
                                >
                                    Desativar
                                </button>
                            </div>
                        ))}
                        {cupons.length === 0 && <p style={{ color: '#999' }}>Nenhum cupom ativo.</p>}
                    </div>
                </div>
            )}

            {/* ---- Entregadores ---- */}
            {aba === 'entregadores' && (
                <div>
                    <form onSubmit={cadastrarEntregador} style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 28, border: '1px solid #e3d8cc', maxWidth: 500 }}>
                        <h2 style={{ marginBottom: 16 }}>Cadastrar entregador</h2>
                        {['nome', 'email', 'senha', 'telefone', 'endereco', 'veiculo'].map(campo => (
                            <input
                                key={campo}
                                type={campo === 'senha' ? 'password' : campo === 'email' ? 'email' : 'text'}
                                placeholder={campo.charAt(0).toUpperCase() + campo.slice(1)}
                                value={novoEnt[campo]}
                                onChange={e => setNovoEnt(prev => ({ ...prev, [campo]: e.target.value }))}
                                required
                                style={{ display: 'block', width: '100%', marginBottom: 10, padding: 10, borderRadius: 8, border: '1px solid #e3d8cc' }}
                            />
                        ))}
                        {erroEnt && <p className="form-error">{erroEnt}</p>}
                        {msgEnt && <p className="form-success">{msgEnt}</p>}
                        <button type="submit" style={{ background: '#d64724', color: '#fff', padding: '10px 24px', borderRadius: 8, border: 'none', fontWeight: 700 }}>
                            Cadastrar entregador
                        </button>
                    </form>

                    <h2>Entregadores ({entregadores.length})</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 600 }}>
                        {entregadores.map(e => (
                            <div key={e.id} style={{ background: '#fff', border: '1px solid #e3d8cc', borderRadius: 10, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong>{e.nome}</strong>
                                    <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#666' }}>{e.email} · {e.telefone} · {e.veiculo}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removerEntregador(e.id)}
                                    style={{ background: '#ef4444', color: '#fff', padding: '6px 14px', borderRadius: 6, border: 'none' }}
                                >
                                    Remover
                                </button>
                            </div>
                        ))}
                        {entregadores.length === 0 && <p style={{ color: '#999' }}>Nenhum entregador cadastrado.</p>}
                    </div>
                </div>
            )}

            {/* ---- Clientes ---- */}
            {aba === 'clientes' && (
                <div>
                    <h2>Clientes cadastrados ({clientes.length})</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 700 }}>
                        {clientes.map(c => (
                            <div key={c.id} style={{ background: '#fff', border: '1px solid #e3d8cc', borderRadius: 10, padding: '14px 18px' }}>
                                <strong>{c.nome}</strong>
                                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: '#666' }}>
                                    {c.email} · {c.telefone}
                                </p>
                                <p style={{ margin: '4px 0 0', fontSize: '0.82rem', color: '#999' }}>{c.endereco}</p>
                            </div>
                        ))}
                        {clientes.length === 0 && <p style={{ color: '#999' }}>Nenhum cliente cadastrado.</p>}
                    </div>
                </div>
            )}
        </div>
    );
}