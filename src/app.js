const express = require('express');
const cors = require('cors');
const { Produto, Cliente, Orcamento } = require('./database');

const app = express();
app.use(cors());
app.use(express.json());
// Serve os arquivos da pasta 'public' (HTML, CSS, JS do frontend)
app.use(express.static('public'));

/* ==========================================
   MÓDULO 1: PRODUTOS & VENDAS (Ajustado para não duplicar)
   ========================================== */
app.get('/produtos', async (req, res) => {
    res.json(await Produto.findAll());
});

app.post('/produtos', async (req, res) => {
    try {
        const { nome, preco, quantidade } = req.body;

        // 1. Verifica se já existe um produto com o mesmo nome no banco
        let produtoExistente = await Produto.findOne({ where: { nome } });

        if (produtoExistente) {
            // 2. Se já existe, atualiza a quantidade somando ao estoque atual e atualiza o preço
            produtoExistente.quantidade = Number(produtoExistente.quantidade) + Number(quantidade || 0);
            produtoExistente.preco = preco || produtoExistente.preco;
            await produtoExistente.save();
            
            return res.json({ message: 'Produto já cadastrado. Estoque atualizado com sucesso!', produto: produtoExistente });
        } else {
            // 3. Se não existe, cria um novo normalmente
            const novoProduto = await Produto.create(req.body);
            return res.status(201).json(novoProduto);
        }
    } catch (e) { 
        res.status(400).json({ error: e.message }); 
    }
});

app.post('/vendas', async (req, res) => {
    const { produtoId, quantidadeVendida } = req.body;
    const produto = await Produto.findByPk(produtoId);
    if (!produto || produto.quantidade < quantidadeVendida) {
        return res.status(400).json({ error: 'Estoque insuficiente' });
    }
    produto.quantidade -= quantidadeVendida;
    await produto.save();
    res.json({ message: 'Venda registrada', produto });
});

/* ==========================================
   MÓDULO 2: CLIENTES
   ========================================== */
app.get('/clientes', async (req, res) => {
    res.json(await Cliente.findAll());
});

app.post('/clientes', async (req, res) => {
    try {
        res.status(201).json(await Cliente.create(req.body));
    } catch (e) { res.status(400).json({ error: e.message }); }
});

/* ==========================================
   MÓDULO 3: ORÇAMENTOS
   ========================================== */
app.get('/orcamentos', async (req, res) => {
    res.json(await Orcamento.findAll());
});

app.post('/orcamentos', async (req, res) => {
    try {
        res.status(201).json(await Orcamento.create(req.body));
    } catch (e) { res.status(400).json({ error: e.message }); }
});

/* ==========================================
   MÓDULO 4: RELATÓRIOS
   ========================================== */
app.get('/relatorios/resumo', async (req, res) => {
    const totalProdutos = await Produto.count();
    const totalClientes = await Cliente.count();
    const totalOrcamentos = await Orcamento.count();
    res.json({ totalProdutos, totalClientes, totalOrcamentos });
});

/* ==========================================
   MÓDULO 5: CONFIGURAÇÕES
   ========================================== */
let configMock = { nomeEmpresa: 'Minha Empresa QA', tema: 'Dark' };
app.get('/configuracoes', (req, res) => res.json(configMock));
app.post('/configuracoes', (req, res) => {
    configMock = { ...configMock, ...req.body };
    res.json({ message: 'Configurações salvas', config: configMock });
});

module.exports = app;