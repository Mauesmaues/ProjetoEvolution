const dotenv = require('dotenv');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const PaginaModel = require('../models/PaginaModel');
const FormModel = require('../models/FormModel');
const RespostasModel = require('../models/RespostasModel');

dotenv.config();

// Cache simples para evitar múltiplas requisições
let paginasCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

class PaginaService {
    async buscarPaginas() {
        try {
            // Verifica se há cache válido
            if (paginasCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_DURATION)) {
                console.log('[PaginaService] Retornando páginas do cache');
                return paginasCache;
            }

            console.log('[PaginaService] Buscando páginas da API do Facebook...');
            const response = await fetch(`https://graph.facebook.com/v20.0/me/accounts?access_token=${process.env.META_PAGINA_TOKEN}`);
            const data = await response.json();
            
            if (data.error) {
                throw new Error(JSON.stringify(data.error));
            }
            
            // Mapeia cada página para uma instância de PaginaModel
            const paginas = (data.data || []).map(pagina => {
                return new PaginaModel(pagina.name, pagina.id, pagina.access_token);
            });

            // Atualiza o cache
            paginasCache = paginas;
            cacheTimestamp = Date.now();
            
            return paginas;
            
        } catch (error) {
            console.error('[PaginaService] Erro ao buscar páginas:', error);
            throw error;
        }       
    }

    async buscarFormPagina(idPagina, tokenPagina) {
        try {
            const response = await fetch(`https://graph.facebook.com/v20.0/${idPagina}/leadgen_forms?access_token=${tokenPagina}`);
            const data = await response.json();

            if(data.error) {
                throw new Error(JSON.stringify(data.error));
            }

            return (data.data || []).map(form => {
                return new FormModel(form.id, form.name);
            });

        } catch (error) {
            console.error('[PaginaService] Erro ao buscar formulários da página:', error);
            throw error;
        }
    }

    async buscarRespostasForm(idForm, tokenPagina) {
        try {
            const response = await fetch(`https://graph.facebook.com/v20.0/${idForm}/leads?access_token=${tokenPagina}`);
            const data = await response.json();

            if (data.error) {
                throw new Error(JSON.stringify(data.error));
            }

            // Mapeia cada resposta para uma instância de RespostasModel
            return (data.data || []).map(resposta => {
                // Converte field_data array em um objeto de respostas mais organizado
                const respostasFormatadas = {};
                resposta.field_data.forEach(field => {
                    respostasFormatadas[field.name] = field.values || [];
                });

                return new RespostasModel(
                    resposta.id,
                    resposta.created_time,
                    respostasFormatadas
                );
            });

        } catch (error) {
            console.error('[PaginaService] Erro ao buscar respostas do formulário:', error);
            throw error;
        }
    }
}

module.exports = new PaginaService();
