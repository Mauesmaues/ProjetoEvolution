const { GoogleAuth } = require('google-auth-library');
const SaldoGadsModel = require('../models/SaldoGadsModel');
const path = require('path');
const https = require('https');
require('dotenv').config();

class GoogleAdsServiceDirect {
    constructor() {
        this.authCache = new Map();
        this.cacheExpiry = new Map();
        this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutos
    }

    // Obter access token usando Service Account
    async getAccessToken() {
        const cacheKey = 'access_token';
        
        if (this.authCache.has(cacheKey) && this.cacheExpiry.get(cacheKey) > Date.now()) {
            console.log('[GoogleAdsServiceDirect] Usando access token do cache');
            return this.authCache.get(cacheKey);
        }

        try {
            const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH || 
                path.join(__dirname, '../config/google-service-account.json');
            
            console.log('[GoogleAdsServiceDirect] Obtendo access token via Service Account');

            const auth = new GoogleAuth({
                scopes: ['https://www.googleapis.com/auth/adwords'],
                keyFilename: serviceAccountPath
            });

            const authClient = await auth.getClient();
            const accessTokenResponse = await authClient.getAccessToken();
            const accessToken = accessTokenResponse.token;

            if (!accessToken) {
                throw new Error('Não foi possível obter access token');
            }

            // Salvar no cache
            this.authCache.set(cacheKey, accessToken);
            this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

            console.log('[GoogleAdsServiceDirect] ✅ Access token obtido com sucesso');
            return accessToken;

        } catch (error) {
            console.error('[GoogleAdsServiceDirect] ❌ Erro ao obter access token:', error.message);
            throw error;
        }
    }

    // Fazer requisição HTTP direta para Google Ads API
    async makeRequest(customerAccountId, query) {
        const accessToken = await this.getAccessToken();
        
        // Remover hífens do Customer ID se existirem
        const cleanCustomerId = customerAccountId.toString().replace(/-/g, '');
        
        console.log('[GoogleAdsServiceDirect] Customer ID limpo:', cleanCustomerId);
        console.log('[GoogleAdsServiceDirect] Developer Token:', process.env.GOOGLE_DEVELOPER_TOKEN ? 'Presente' : 'Ausente');
        
        const postData = JSON.stringify({ 
            query: query,
            validateOnly: false
        });
        
        const options = {
            hostname: 'googleads.googleapis.com',
            port: 443,
            path: `/v16/customers/${cleanCustomerId}/googleAds:search`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'developer-token': process.env.GOOGLE_DEVELOPER_TOKEN,
                'login-customer-id': cleanCustomerId,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'google-ads-nodejs/1.0'
            }
        };
        
        console.log('[GoogleAdsServiceDirect] Fazendo requisição para:', `https://${options.hostname}${options.path}`);
        console.log('[GoogleAdsServiceDirect] Headers:', JSON.stringify(options.headers, null, 2));

        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    console.log(`[GoogleAdsServiceDirect] Status: ${res.statusCode}`);
                    console.log(`[GoogleAdsServiceDirect] Headers:`, res.headers);
                    console.log(`[GoogleAdsServiceDirect] Resposta raw:`, data.substring(0, 500));
                    
                    try {
                        const response = JSON.parse(data);
                        
                        if (res.statusCode === 200) {
                            resolve(response);
                        } else {
                            reject(new Error(`HTTP ${res.statusCode}: ${JSON.stringify(response)}`));
                        }
                    } catch (error) {
                        // Se não for JSON, retornar a resposta raw para diagnóstico
                        reject(new Error(`Resposta não é JSON (Status ${res.statusCode}): ${data.substring(0, 200)}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(postData);
            req.end();
        });
    }

    // Testar conectividade
    async testConnection(customerAccountId) {
        try {
            console.log('[GoogleAdsServiceDirect] Testando conectividade direta...');

            const query = `SELECT customer.id FROM customer WHERE customer.id = ${customerAccountId} LIMIT 1`;
            
            const response = await this.makeRequest(customerAccountId, query);
            
            console.log('[GoogleAdsServiceDirect] ✅ Teste de conectividade bem-sucedido');
            console.log('[GoogleAdsServiceDirect] Resposta:', JSON.stringify(response, null, 2));

            return {
                success: true,
                customer_id: customerAccountId,
                response_count: response.results ? response.results.length : 0
            };

        } catch (error) {
            console.error('[GoogleAdsServiceDirect] ❌ Teste falhou:', error.message);
            throw error;
        }
    }

    // Buscar informações do cliente
    async getCustomerInfo(customerAccountId) {
        try {
            console.log('[GoogleAdsServiceDirect] Buscando informações do cliente...');

            const query = `
                SELECT
                    customer.id,
                    customer.descriptive_name,
                    customer.currency_code,
                    customer.time_zone,
                    customer.status
                FROM customer
                WHERE customer.id = ${customerAccountId}
            `;

            const response = await this.makeRequest('search', customerAccountId, query);
            
            console.log('[GoogleAdsServiceDirect] ✅ Informações obtidas');
            
            return response.results && response.results.length > 0 ? response.results[0] : null;

        } catch (error) {
            console.error('[GoogleAdsServiceDirect] ❌ Erro ao buscar info:', error.message);
            throw error;
        }
    }

    // Buscar saldos das contas
    async getSaldoContas(customerAccountId) {
        try {
            console.log('[GoogleAdsServiceDirect] Buscando saldos...');

            const query = `
                SELECT
                    customer.id,
                    customer.descriptive_name,
                    customer.currency_code,
                    account_budget.id,
                    account_budget.name,
                    account_budget.amount_served_micros,
                    account_budget.approved_spending_limit_micros,
                    account_budget.total_adjustments_micros,
                    account_budget.status
                FROM account_budget
                WHERE account_budget.status = 'APPROVED'
            `;

            const response = await this.makeRequest('search', customerAccountId, query);
            
            if (!response.results || response.results.length === 0) {
                console.log('[GoogleAdsServiceDirect] ⚠️ Nenhum budget encontrado');
                return [];
            }

            return response.results.map(row => {
                const amountServed = SaldoGadsModel.convertFromMicros(row.accountBudget.amountServedMicros);
                const spendingLimit = SaldoGadsModel.convertFromMicros(row.accountBudget.approvedSpendingLimitMicros);
                const adjustments = SaldoGadsModel.convertFromMicros(row.accountBudget.totalAdjustmentsMicros);
                
                const saldoRestante = spendingLimit - amountServed + adjustments;
                const accountType = spendingLimit > 0 ? 'prepaid' : 'credit_card';
                
                return new SaldoGadsModel(
                    row.customer.id,
                    row.customer.descriptiveName,
                    row.customer.currencyCode,
                    saldoRestante,
                    accountType
                );
            });

        } catch (error) {
            console.error('[GoogleAdsServiceDirect] ❌ Erro ao buscar saldos:', error.message);
            throw error;
        }
    }
}

module.exports = new GoogleAdsServiceDirect();