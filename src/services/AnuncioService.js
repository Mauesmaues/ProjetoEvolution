const dotenv = require('dotenv');
const AnuncioModel = require('../models/AnuncioModel');
const fetch = require('../utils/httpClient');

dotenv.config();
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

// Cache para anúncios
const cache = new Map();
const cacheExpiry = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

class AnuncioService {
  
  getCacheKey(contaDeAnuncio) {
    return `anuncios_${contaDeAnuncio}`;
  }

  isCacheValid(key) {
    return cache.has(key) && cacheExpiry.get(key) > Date.now();
  }

  setCache(key, data) {
    cache.set(key, data);
    cacheExpiry.set(key, Date.now() + CACHE_DURATION);
  }

  async getAnuncios(contaDeAnuncio) {
    try {
      const cacheKey = this.getCacheKey(contaDeAnuncio);
      
      // Verifica cache primeiro
      if (this.isCacheValid(cacheKey)) {
        console.log('[AnuncioService] Retornando anúncios do cache para conta:', contaDeAnuncio);
        return cache.get(cacheKey);
      }

      console.log('[AnuncioService] Buscando anúncios para conta:', contaDeAnuncio);

      const url = `https://graph.facebook.com/v17.0/act_${contaDeAnuncio}/ads?fields=name,adset{name},campaign{name},insights{impressions,reach,clicks,ctr,cpc,actions{action_type,value}},adcreatives{thumbnail_url,image_url}&access_token=${ACCESS_TOKEN}`;

      const response = await fetch(url);
      const result = await response.json();

      if (!result.data) {
        throw new Error('Resposta sem campo data: ' + JSON.stringify(result));
      }

      const anuncios = result.data.map(item => {
        const nomeCampanha = item.campaign?.name || '';
        const grupo = item.adset?.name || '';
        const nomeAnuncio = item.name || '';
        // extrair imagem do creative
        let imagem = null;
        if (item.adcreatives?.data?.length > 0) {
          const creative = item.adcreatives.data[0];
          imagem = creative.image_url || creative.thumbnail_url || null;
        }
        // métricas insights
        const insights = item.insights?.data?.[0] || {};
        const alcance = insights.reach || 0;
        const cliques = insights.clicks || 0;
        const cpc = insights.cpc || 0;
        
        let convs = 0;
        if (insights.actions) {
          const tiposConversao = [
            'lead',
            'onsite_conversion.total_messaging_connection'
          ];

          convs = insights.actions
            .filter(action => tiposConversao.includes(action.action_type))
            .reduce((total, action) => total + (Number.parseInt(action.value) || 0), 0);
        }
        
        const visualizacoes = insights.video_plays_100 || cliques || 0;

        return new AnuncioModel(
          nomeCampanha,
          grupo,
          nomeAnuncio,
          imagem,
          visualizacoes,
          alcance,
          cpc,      // CPL (Cost Per Lead) = CPC neste caso
          convs     // Conversões
        );
      });

      // Salva no cache
      this.setCache(cacheKey, anuncios);
      console.log('[AnuncioService] Anúncios salvos no cache para conta:', contaDeAnuncio);

      return anuncios;

    } catch (error) {
      console.error('[AnuncioService] Erro ao buscar anúncios:', error);
      throw error;
    }
  }
}

module.exports = new AnuncioService();
