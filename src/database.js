const { Sequelize, DataTypes } = require('sequelize');

// Configuração da conexão com o banco SQLite local
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false // Desativa logs de SQL no terminal para ficar mais limpo
});

/* ==========================================
   MÓDULO 1: ESTOQUE (Existente)
   ========================================== */
const Produto = sequelize.define('Produto', {
  nome: { type: DataTypes.STRING, allowNull: false },
  preco: { type: DataTypes.FLOAT, allowNull: false },
  quantidade: { type: DataTypes.INTEGER, allowNull: false }
});

/* ==========================================
   MÓDULO 2: CLIENTES (Novo)
   ========================================== */
const Cliente = sequelize.define('Cliente', {
  nome: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  telefone: { type: DataTypes.STRING, allowNull: true },
  endereco: { type: DataTypes.STRING, allowNull: true }
});

/* ==========================================
   MÓDULO 3: ORÇAMENTOS (Novo)
   ========================================== */
const Orcamento = sequelize.define('Orcamento', {
  // Vincula o orçamento a um cliente
  clienteId: { type: DataTypes.INTEGER, allowNull: false },
  // Armazena a lista de produtos como uma string JSON (ex: "[{id:1, qtd:2}]")
  itensJson: { type: DataTypes.TEXT, allowNull: false },
  valorTotal: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.STRING, defaultValue: 'Pendente' } // Pendente, Aprovado, Cancelado
});

// Define as relações (Um Orçamento PERTENCE a um Cliente)
Orcamento.belongsTo(Cliente, { foreignKey: 'clienteId' });

module.exports = { sequelize, Produto, Cliente, Orcamento };