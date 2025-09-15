
const dotenv = require('dotenv');
const MetricsModel = require('../models/MetricsModel');
// Cliente HTTP otimizado
const fetch = require('../utils/httpClient');

dotenv.config();
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

// Cache simples para evitar requisições repetitivas
const cache = new Map();
const cacheExpiry = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

class MetaAdsService {
  getCacheKey(adAccountId, options = {}) {
    return `insights_${adAccountId}_${JSON.stringify(options)}`;
  }

  isCacheValid(key) {
    return cache.has(key) && cacheExpiry.get(key) > Date.now();
  }

  setCache(key, data) {
    cache.set(key, data);
    cacheExpiry.set(key, Date.now() + CACHE_DURATION);
  }

  async getAccountInsights(adAccountId, options = {}) {
    const cacheKey = this.getCacheKey(adAccountId, options);
    
    // Verifica cache primeiro
    if (this.isCacheValid(cacheKey)) {
      console.log('[MetaAdsService] Retornando do cache:', cacheKey);
      return cache.get(cacheKey);
    }

    console.log('[MetaAdsService] Fazendo nova requisição para API do Facebook');
    const { date_preset, time_increment } = options;

    let url = `https://graph.facebook.com/v20.0/act_${adAccountId}/insights?fields=impressions,clicks,reach,spend,ctr,cpc,cost_per_action_type`;

    // Adiciona filtros de data se fornecidos
    if (date_preset) {
      if (date_preset === 'maximum') {
        url += `&date_preset=maximum`;
      } else if (time_increment) {
        // Formato correto para time_range
        const timeRange = JSON.stringify({
          since: date_preset,
          until: time_increment
        });
        url += `&time_range=${encodeURIComponent(timeRange)}`;
      }
    }

    url += `&access_token=${ACCESS_TOKEN}`;
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
      const result = (data.data || []).map(item => {
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

      // Salva no cache
      this.setCache(cacheKey, result);
      console.log('[MetaAdsService] Resultado salvo no cache');
      
      return result;
    } catch (error) {

      console.error('[MetaAdsService] Erro ao consultar a API da Meta:', error);

      throw new Error("Erro ao consultar a API da Meta: " + error.message);
      
    }
  }
}

module.exports = new MetaAdsService();
