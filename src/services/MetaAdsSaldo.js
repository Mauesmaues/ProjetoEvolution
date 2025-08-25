const dotenv = require('dotenv');
const SaldoModel = require('../models/SaldoModel');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

dotenv.config();
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

class MetaAdsSaldo {
    async getSaldo(contaDeAnuncio){
        try{
            const response = await fetch(`https://graph.facebook.com/v20.0/act_${contaDeAnuncio}?fields=balance&access_token=${ACCESS_TOKEN}`);
            const data = await response.json();

            if (data.error) {
                throw new Error(JSON.stringify(data.error));
            }

            let saldo = "nullo";
            if(data.balance){
                saldo = data.balance;
            }
            console.log('[MetaAdsSaldo] Saldo obtido:', saldo);
            return new SaldoModel(saldo);

        }catch(error){
            console.error('[MetaAdsSaldo] Erro ao obter saldo:', error);
            throw error;
        }
    }
}

module.exports = new MetaAdsSaldo();