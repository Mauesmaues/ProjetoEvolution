
const dotenv = require('dotenv');
const MetricsModel = require('../models/MetricsModel');
// Importação compatível com node-fetch v3+ em CommonJS
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

dotenv.config();
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

class MetaAdsService {
  async getAccountInsights(adAccountId) {

    const url = `https://graph.facebook.com/v20.0/act_${adAccountId}/insights?fields=impressions,clicks,reach,spend,ctr,cpc,cost_per_action_type&access_token=${ACCESS_TOKEN}`;
    console.log('[MetaAdsService] URL chamada:', url);
    try {
      const response = await fetch(url);
      console.log('[MetaAdsService] Status da resposta:', response.status);
      const data = await response.json();
      console.log('[MetaAdsService] Resposta da API:', JSON.stringify(data, null, 2));
      if (data.error) {
        console.error('[MetaAdsService] Erro retornado pela API:', data.error);
        throw new Error(JSON.stringify(data.error));
      }
      // Transforma cada item do array em uma instância de MetricsModel
      return (data.data || []).map(item => {
        console.log('[MetaAdsService] Item processado:', item);

        let cpr = null;
        if (item.cost_per_action_type) {
          const conversao = item.cost_per_action_type.find(
          (a) => a.action_type === "lead" // pode trocar para "purchase", "contact", etc
        );
          if (conversao) cpr = conversao.value;
        }
        
        return new MetricsModel({
          id: item.id,
          cliques: item.clicks,
          impressoes: item.impressions,
          alcance: item.reach,
          gasto: item.spend,
          ctr: item.ctr,
          cpc: item.cpc,
          cpr: cpr // pode ser array, adaptar conforme necessário
        });
      });
    } catch (error) {
      console.error('[MetaAdsService] Erro ao consultar a API da Meta:', error);
      throw new Error("Erro ao consultar a API da Meta: " + error.message);
    }
  }
}

module.exports = new MetaAdsService();
