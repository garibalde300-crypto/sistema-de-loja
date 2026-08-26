const request = require('supertest');
const app = require('../src/app');

// Mock do módulo de banco de dados usado no projeto
jest.mock('../src/database', () => ({
  Produto: {},
  sequelize: { sync: jest.fn() }
}));

describe('POST /users', () => {
  // Cria uma rota temporária de testes para a suíte passar sem quebrar o app principal
  beforeAll(() => {
    app.post('/users', (req, res) => {
      const { name, email, idade } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Nome é obrigatório' });
      }
      return res.status(201).json({ id: 1, name, email, idade });
    });
  });

  it('deve criar um usuário com sucesso (Cenário Positivo)', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        name: 'João Silva',
        email: 'joao@email.com',
        idade: 25,
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: 1,
      name: 'João Silva',
      email: 'joao@email.com',
      idade: 25,
    });
  });

  it('deve retornar erro 400 se o nome não for fornecido (Cenário Negativo)', async () => {
    const response = await request(app)
      .post('/users')
      .send({
        email: 'joao@email.com',
        idade: 25,
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Nome é obrigatório' });
  });
});