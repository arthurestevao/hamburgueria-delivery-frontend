import { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

export default function Login() {
  const [modoCadastro, setModoCadastro] = useState(false);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  function redirecionarPorPerfil(perfil) {
    if (perfil === 'ADMINISTRADOR') return navigate('/admin');
    if (perfil === 'ENTREGADOR') return navigate('/entregador');
    return navigate('/');
  }

  async function enviarFormulario(e) {
    e.preventDefault();
    setErro('');
    setEnviando(true);

    try {
      const response = modoCadastro
        ? await api.post('/usuarios/registro', {
            nome,
            email,
            senha,
            endereco,
            telefone
          })
        : await api.post('/usuarios/login', { email, senha });

      login(response.data);
      redirecionarPorPerfil(response.data.perfil);
    } catch (error) {
      setErro(error.response?.data?.mensagem || 'Erro de comunicação com o backend. Verifique se está rodando na porta 8080.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={enviarFormulario}>
        <span className="brand-kicker">Hamburgueria Delivery</span>
        <h1>{modoCadastro ? 'Criar conta' : 'Entrar'}</h1>
        <p>
          {modoCadastro
            ? 'Cadastre seus dados para finalizar pedidos.'
            : 'Acesse sua conta para repetir seus burgers favoritos e acompanhar pedidos.'}
        </p>

        {modoCadastro && (
          <input
            type="text"
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          minLength="6"
          required
        />

        {modoCadastro && (
          <>
            <input
              type="text"
              placeholder="Endereço"
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
            />
          </>
        )}

        {erro && <p className="form-error">{erro}</p>}

        <button type="submit" disabled={enviando}>
          {enviando ? 'Enviando...' : modoCadastro ? 'Cadastrar' : 'Entrar'}
        </button>

        <button className="ghost-button" type="button" onClick={() => setModoCadastro(!modoCadastro)}>
          {modoCadastro ? 'Já tenho conta' : 'Criar nova conta'}
        </button>

        <Link to="/">Continuar sem login</Link>
      </form>
    </div>
  );
}