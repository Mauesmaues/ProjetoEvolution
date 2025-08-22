const metaAdsService = require('../services/MetaAdsService');
const responseFormatter = require('../utils/responseFormatter');

// Controller → camada intermediária que liga a rota ao service
// Responsável por:
// - Receber parâmetros da requisição (ex.: accountId)
// - Chamar o service correspondente
// - Tratar erros e retornar a resposta HTTP no formato certo
async function insightsByAccountController(req, res, next) {
  const { accountId, filter } = req.params;
  try {
    let insights;
    
    if(filter){
      const [date_preset, time_increment] = filter.split(',');
      insights = await metaAdsService.getAccountInsights(accountId, { date_preset, time_increment });
    }else{
      insights = await metaAdsService.getAccountInsights(accountId);
    }

    res.json(responseFormatter.success(insights));

  } catch (error) {

    next(error);
    
  }
}

module.exports = { insightsByAccountController };
