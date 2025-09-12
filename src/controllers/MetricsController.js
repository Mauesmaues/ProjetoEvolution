const metaAdsService = require('../services/MetaAdsService');
const responseFormatter = require('../utils/responseFormatter');
const metaAdsSaldo = require('../services/MetaAdsSaldo');

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
      // Para filtros como "2024-01-01,2024-01-31" ou "maximum"
      if(filter === 'maximum'){
        insights = await metaAdsService.getAccountInsights(accountId, { date_preset: 'maximum' });
      } else {
        const [dateStart, dateEnd] = filter.split(',');
        insights = await metaAdsService.getAccountInsights(accountId, { 
          date_preset: dateStart, 
          time_increment: dateEnd 
        });
      }
    }else{
      insights = await metaAdsService.getAccountInsights(accountId);
    }

    res.json(responseFormatter.success(insights));

  } catch (error) {
    next(error);
  }
}

async function getSaldoController(req, res, next) {
  const { accountId } = req.params;
  try {
    const saldo = await metaAdsSaldo.getSaldo(accountId);
    res.json(responseFormatter.success(saldo));
  } catch (error) {
    next(error);
  }
}



module.exports = { insightsByAccountController, getSaldoController };
