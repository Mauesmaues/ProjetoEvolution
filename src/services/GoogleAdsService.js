const { GoogleAdsApi } = require('google-ads-api');
const { GoogleAuth, JWT } = require('google-auth-library');
const SaldoGadsModel = require('../models/SaldoGadsModel');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

class GoogleAdsService {
    constructor() {
        // Cache para evitar múltiplas autenticações
        this.authCache = new Map();
        this.cacheExpiry = new Map();
        this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutos
        
        // Carregar credenciais do arquivo
        const serviceAccountPath = path.join(__dirname, '../config/google-service-account.json');
        this.serviceAccountKey = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    }

    // Criar cliente JWT com Service Account
    async createJWTClient() {
        try {
            const jwtClient = new JWT({
                email: this.serviceAccountKey.client_email,
                key: this.serviceAccountKey.private_key,
                scopes: ['https://www.googleapis.com/auth/adwords'],
            });

            await jwtClient.authorize();
            console.log('[GoogleAdsService] ✅ JWT Client autenticado');
            
            return jwtClient;
        } catch (error) {
            console.error('[GoogleAdsService] ❌ Erro JWT:', error.message);
            throw error;
        }
    }

    // Cliente usando Service Account
    async getClient(customerAccountId) {
        const cacheKey = `client_${customerAccountId}`;
        
        // Verifica cache válido
        if (this.authCache.has(cacheKey) && this.cacheExpiry.get(cacheKey) > Date.now()) {
            console.log('[GoogleAdsService] Usando cliente do cache');
            return this.authCache.get(cacheKey);
        }

        console.log('[GoogleAdsService] Criando novo cliente para:', customerAccountId);

        // Verificar configurações obrigatórias
        if (!process.env.GOOGLE_DEVELOPER_TOKEN || process.env.GOOGLE_DEVELOPER_TOKEN === 'YOUR_DEVELOPER_TOKEN_HERE') {
            throw new Error('GOOGLE_DEVELOPER_TOKEN não configurado corretamente');
        }

        if (!customerAccountId || customerAccountId === 'YOUR_CUSTOMER_ID_HERE') {
            throw new Error('GOOGLE_ADS_CUSTOMER_ID não configurado corretamente');
        }

        try {
            // Criar JWT client
            const jwtClient = await this.createJWTClient();
            const accessToken = jwtClient.credentials.access_token;

            if (!accessToken) {
                throw new Error('Não foi possível obter access token');
            }

            console.log('[GoogleAdsService] ✅ Access token obtido');

            // Usar a biblioteca google-ads-api com o access token
            const client = new GoogleAdsApi({
                developer_token: process.env.GOOGLE_DEVELOPER_TOKEN,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                refresh_token: accessToken, // Usar access token como refresh token
            });

            const customer = client.Customer({
                customer_account_id: customerAccountId,
            });

            // Salva no cache
            this.authCache.set(cacheKey, customer);
            this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

            console.log('[GoogleAdsService] ✅ Cliente Google Ads criado');
            return customer;

        } catch (error) {
            console.error('[GoogleAdsService] ❌ Erro ao criar cliente:', error.message);
            throw new Error(`Falha na autenticação: ${error.message}`);
        }
    }

    // Buscar saldo das contas
    async getSaldoContas(customerAccountId) {
        try {
            console.log('[GoogleAdsService] Buscando saldo para conta:', customerAccountId);
            
            const customer = await this.getClient(customerAccountId);
            
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

            const response = await customer.query(query);
            console.log('[GoogleAdsService] ✅ Resposta recebida:', response.length, 'registros');
            
            return response.map(row => {
                const amountServed = SaldoGadsModel.convertFromMicros(row.account_budget.amount_served_micros);
                const spendingLimit = SaldoGadsModel.convertFromMicros(row.account_budget.approved_spending_limit_micros);
                const adjustments = SaldoGadsModel.convertFromMicros(row.account_budget.total_adjustments_micros);
                
                // Calcular saldo restante (limite - gasto + ajustes)
                const saldoRestante = spendingLimit - amountServed + adjustments;
                
                // Determinar tipo de conta baseado no limite
                const accountType = spendingLimit > 0 ? 'prepaid' : 'credit_card';
                
                return new SaldoGadsModel(
                    row.customer.id,
                    row.customer.descriptive_name,
                    row.customer.currency_code,
                    saldoRestante,
                    accountType
                );
            });

        } catch (error) {
            console.error('[GoogleAdsService] ❌ Erro ao buscar saldos:', error.message);
            throw new Error(`Erro ao consultar Google Ads: ${error.message}`);
        }
    }

    // Buscar informações básicas do cliente
    async getCustomerInfo(customerAccountId) {
        try {
            console.log('[GoogleAdsService] Buscando info do cliente:', customerAccountId);
            const customer = await this.getClient(customerAccountId);
            
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

            console.log('[GoogleAdsService] Executando query...');
            const response = await customer.query(query);
            console.log('[GoogleAdsService] ✅ Resposta recebida:', response.length, 'registros');
            
            return response[0] || null;

        } catch (error) {
            console.error('[GoogleAdsService] ❌ Erro ao buscar info do cliente:', error.message);
            throw error;
        }
    }

    // Método de teste simples para verificar conectividade
    async testConnection(customerAccountId) {
        try {
            console.log('[GoogleAdsService] Testando conectividade...');
            
            const customer = await this.getClient(customerAccountId);
            
            // Query mais simples para teste
            const query = `SELECT customer.id FROM customer WHERE customer.id = ${customerAccountId} LIMIT 1`;
            
            const response = await customer.query(query);
            
            return {
                success: true,
                customer_id: customerAccountId,
                response_count: response.length
            };

        } catch (error) {
            console.error('[GoogleAdsService] ❌ Teste de conectividade falhou:', error.message);
            throw error;
        }
    }
}

module.exports = new GoogleAdsService();