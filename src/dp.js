// Este é um módulo fictício que representa nossa camada de persistência.
// Em um cenário real, aqui ficaria a conexão com o PostgreSQL, MongoDB, etc.
module.exports = {
  users: {
    create: async (data) => {
      return { id: Math.floor(Math.random() * 1000), ...data };
    }
  }
};