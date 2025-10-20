class AnuncioModel {

    constructor(campanha, grupo, nome, img, visualizacoes, alcance, cpl, convs) {
        this.campanha = campanha;
        this.grupo = grupo;
        this.nome = nome;
        this.img = img;
        this.visualizacoes = visualizacoes;
        this.alcance = alcance;
        this.cpl = cpl;
        this.convs = convs;
    }

}

module.exports = AnuncioModel;