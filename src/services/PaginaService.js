const dotenv = require('dotenv');

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const PaginaModel = require('../models/PaginaModel');

dotenv.config();

class PaginaService {
    async buscarPaginas() {
        try {
            const response = await fetch(`https://graph.facebook.com/v20.0/me/accounts?access_token=${process.env.META_PAGINA_TOKEN}`);
            const data = await response.json();
            
            if (data.error) {
                throw new Error(JSON.stringify(data.error));
            }
            
            // Mapeia cada página para uma instância de PaginaModel
            return (data.data || []).map(pagina => {
                return new PaginaModel(pagina.name, pagina.id, pagina.access_token);
            });
            
        } catch (error) {
            console.error('[PaginaService] Erro ao buscar páginas:', error);
            throw error;
        }       
    }
}

module.exports = new PaginaService();
