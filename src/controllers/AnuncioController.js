const AnuncioService = require("../services/AnuncioService");
const responseFormatter = require('../utils/responseFormatter');

async function BuscarAnunciosController(req, resp, next) {
    try {
        const { accountId } = req.params;
        const anuncios = await AnuncioService.getAnuncios(accountId);
        resp.json(responseFormatter.success(anuncios));
    }catch (error) {
        console.error('[BuscarAnunciosController] Erro ao buscar anúncios:', error);
        resp.status(500).json(responseFormatter.error('Erro ao buscar anúncios'));
    }
}

module.exports = { BuscarAnunciosController };