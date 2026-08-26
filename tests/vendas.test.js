const request = require('supertest');
const app = require('../src/app');
const { Produto } = require('../src/database');

describe('Testes de Vendas', () => {
  // Prepara o banco de dados antes de rodar o teste
  beforeEach(async () => {
    await Produto.destroy({ where: {}, truncate: true });
    // Cria um produto com ID inicial e 20 unidades em estoque
    await Produto.create({
      id: 1,
      nome: 'Produto de Teste',
      preco: 10.00,
      quantidade: 20
    });
  });

  test('Deve realizar uma venda e atualizar o estoque restante corretamente', async () => {
    // 1. Executa a requisição enviando quantidadeVendida
    const resposta = await request(app)
      .post('/vendas')
      .send({
        produtoId: 1,
        quantidadeVendida: 5
      });

    // 2. Asserções do teste
    expect(resposta.status).toBe(201);
    expect(resposta.body).toHaveProperty('venda');
    expect(resposta.body.venda.estoqueRestante).toBe(15);
  });
});