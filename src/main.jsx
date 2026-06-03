import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CarrinhoProvider } from './context/CarrinhoContext';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <CarrinhoProvider>
        <App />
      </CarrinhoProvider>
    </AuthProvider>
  </React.StrictMode>
);
