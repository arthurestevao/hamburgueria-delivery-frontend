import { createContext, useState } from 'react';

export const CarrinhoContext = createContext();

export function CarrinhoProvider({ children }) {
  const [itens, setItens] = useState([]);

  function adicionarItem(produto) {
    setItens(prev => {
      const itemExistente = prev.find(item => item.id === produto.id);

      if (itemExistente) {
        return prev.map(item =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      }

      return [...prev, { ...produto, quantidade: 1 }];
    });
  }

  function removerItem(id) {
    setItens(prev =>
      prev
        .map(item =>
          item.id === id
            ? { ...item, quantidade: item.quantidade - 1 }
            : item
        )
        .filter(item => item.quantidade > 0)
    );
  }

  function limparCarrinho() {
    setItens([]);
  }

  return (
    <CarrinhoContext.Provider
      value={{ itens, adicionarItem, removerItem, limparCarrinho }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
}
