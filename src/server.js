const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const db = new sqlite3.Database('./banco.sqlite', (err) => {
  if (err) {
    console.error('Erro ao abrir o banco de dados', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite.');
  }
});

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    preco REAL NOT NULL,
    quantidade INTEGER NOT NULL
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS clientes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT
  )`);
});

// Listar Clientes
app.get('/clientes', (req, res) => {
  db.all("SELECT * FROM clientes", [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

// Cadastrar Cliente
app.post('/clientes', (req, res) => {
  const { nome, email, telefone } = req.body;
  db.run("INSERT INTO clientes (nome, email, telefone) VALUES (?, ?, ?)", [nome, email, telefone], function(err) {
    if (err) return res.status(500).json({ erro: err.message });
    res.status(201).json({ id: this.lastID, nome, email, telefone });
  });
});

// EXCLUIR Cliente por ID (Novo)
app.delete('/clientes/:id', (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM clientes WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ mensagem: "Cliente excluído com sucesso!" });
  });
});

// Rotas de Produtos e Vendas
app.get('/produtos', (req, res) => {
  db.all("SELECT * FROM produtos", [], (err, rows) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json(rows);
  });
});

app.post('/produtos', (req, res) => {
  const { nome, preco, quantidade } = req.body;
  db.run("INSERT INTO produtos (nome, preco, quantidade) VALUES (?, ?, ?)", [nome, preco, quantidade], function(err) {
    if (err) return res.status(500).json({ erro: err.message });
    res.status(201).json({ id: this.lastID, nome, preco, quantidade });
  });
});

app.post('/vendas', (req, res) => {
  const { produtoId, quantidadeVendida } = req.body;
  db.get("SELECT * FROM produtos WHERE id = ?", [produtoId], (err, produto) => {
    if (err || !produto) return res.status(404).json({ error: "Produto não encontrado" });
    
    if (produto.quantidade < quantidadeVendida) {
      return res.status(400).json({ error: "Estoque insuficiente" });
    }

    const novaQtd = produto.quantidade - quantidadeVendida;
    db.run("UPDATE produtos SET quantidade = ? WHERE id = ?", [novaQtd, produtoId], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: "Venda realizada com sucesso!" });
    });
  });
});

app.get('/relatorios/resumo', (req, res) => {
  db.get("SELECT COUNT(*) as total FROM produtos", (err, rowProd) => {
    db.get("SELECT COUNT(*) as total FROM clientes", (err, rowCli) => {
      res.json({
        totalProdutos: rowProd ? rowProd.total : 0,
        totalClientes: rowCli ? rowCli.total : 0
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});