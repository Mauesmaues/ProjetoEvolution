class MetricsModel {
  constructor({ id, cliques, impressoes, alcance, gasto, ctr, cpc, cpr }) {
    this.id = id;
    this.cliques = cliques;
    this.impressoes = impressoes;
    this.alcance = alcance;
    this.gasto = gasto;
    this.ctr = ctr;
    this.cpc = cpc;
    this.cpr = cpr;
  }
}

module.exports = MetricsModel;
