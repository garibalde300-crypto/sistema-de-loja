const request = require('supertest');
const app = require('../src/app');

describe('POST /produtos - Testes de Cadastro de Produtos', () => {
    it('Deve cadastrar um produto com sucesso', async () => {
        const resposta = await request(app)
            .post('/produtos')
            .send({
                nome: 'Arroz 5kg',
                preco: 25.90,
                quantidade: 30
            });

        expect(resposta.statusCode).toBe(201);
        expect(resposta.body).toHaveProperty('id');
        expect(resposta.body.nome).toBe('Arroz 5kg');
    });

    it('Deve rejeitar o cadastro com quantidade negativa', async () => {
        const resposta = await request(app)
            .post('/produtos')
            .send({
                nome: 'Feijão 1kg',
                preco: 8.50,
                quantidade: -10
            });

        expect(resposta.statusCode).toBe(400);
        expect(resposta.body.error).toBe('A quantidade inicial do estoque não pode ser negativa.');
    });
});