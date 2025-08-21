const metaAdsService = require('../services/MetaAdsService');
const responseFormatter = require('../utils/responseFormatter');

// Controller → camada intermediária que liga a rota ao service
// Responsável por:
// - Receber parâmetros da requisição (ex.: accountId)
// - Chamar o service correspondente
// - Tratar erros e retornar a resposta HTTP no formato certo
async function insightsByAccountController(req, res, next) {
  const { accountId } = req.params;
  try {
    const insights = await metaAdsService.getAccountInsights(accountId);
    res.json(responseFormatter.success(insights));
  } catch (error) {
    next(error);
  }
}

module.exports = { insightsByAccountController };
