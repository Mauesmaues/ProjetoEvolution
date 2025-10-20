class PaginaModel{
  constructor(nome, id, token) {
    this.nome = nome;
    this.id = id;
    this.token = token;
  }

  getNome() {
    return this.nome;
  }

  getToken() {
    return this.token;
  }

  getId() {
    return this.id;
  }
}

module.exports = PaginaModel;
