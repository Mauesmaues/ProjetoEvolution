const dotenv = require('dotenv');
const SaldoModel = require('../models/SaldoModel');
const fetch = require('../utils/httpClient');

dotenv.config();
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

class MetaAdsSaldo {
    async getSaldo(contaDeAnuncio){
        try{
            console.log('[MetaAdsSaldo] Buscando saldo para conta:', contaDeAnuncio);
            
            const response = await fetch(`https://graph.facebook.com/v20.0/act_${contaDeAnuncio}?fields=funding_source_details&access_token=${ACCESS_TOKEN}`);
            const data = await response.json();
            
            console.log('[MetaAdsSaldo] Resposta da API:', data);

            if (data.error) {
                throw new Error(JSON.stringify(data.error));
            }

            let saldo = "Cartão";
            
            // Usa apenas funding_source_details
            if(data.funding_source_details && data.funding_source_details.display_string){
                console.log('[MetaAdsSaldo] Display string:', data.funding_source_details.display_string);
                const match = data.funding_source_details.display_string.match(/\(([^)]+)\)/);
                if(match && match[1]){
                    saldo = match[1];
                    console.log('[MetaAdsSaldo] Saldo extraído do display_string:', saldo);
                } else {
                    console.log('[MetaAdsSaldo] Não foi possível extrair saldo do display_string');
                }
            } else {
                console.log('[MetaAdsSaldo] funding_source_details não encontrado ou sem display_string');
            }
            
            console.log('[MetaAdsSaldo] Saldo final:', saldo);
            
            return new SaldoModel(saldo);

        }catch(error){
            console.error('[MetaAdsSaldo] Erro ao obter saldo:', error);
            throw error;
        }
    }
}

module.exports = new MetaAdsSaldo();