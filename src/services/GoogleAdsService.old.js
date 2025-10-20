const { GoogleAdsApi } = require('google-ads-api');
const { GoogleAuth } = require('google-auth-library');
const SaldoGadsModel = require('../models/SaldoGadsModel');
const path = require('path');
require('dotenv').config();

class GoogleAdsService {
    constructor() {
        // Cache para evitar múltiplas autenticações
        this.authCache = new Map();
        this.cacheExpiry = new Map();
        this.CACHE_DURATION = 30 * 60 * 1000; // 30 minutos
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
            // Caminho para o Service Account
            const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH || 
                path.join(__dirname, '../config/google-service-account.json');
            
            const fs = require('fs');
            if (!fs.existsSync(serviceAccountPath)) {
                throw new Error(`Arquivo Service Account não encontrado: ${serviceAccountPath}`);
            }

            console.log('[GoogleAdsService] Usando Service Account:', serviceAccountPath);

            // Configurar autenticação com Service Account
            const auth = new GoogleAuth({
                keyFilename: serviceAccountPath,
                scopes: ['https://www.googleapis.com/auth/adwords'],
            });

            // Obter cliente autenticado
            const authClient = await auth.getClient();
            console.log('[GoogleAdsService] ✅ Service Account autenticado');

            // Criar cliente Google Ads com autenticação
            const client = new GoogleAdsApi({
                developer_token: process.env.GOOGLE_DEVELOPER_TOKEN,
            });

            // Usar o authClient diretamente
            const customer = client.Customer({
                customer_account_id: customerAccountId,
                auth_client: authClient,
            });

            // Salva no cache
            this.authCache.set(cacheKey, customer);
            this.cacheExpiry.set(cacheKey, Date.now() + this.CACHE_DURATION);

            console.log('[GoogleAdsService] ✅ Cliente criado com Service Account');
            return customer;

        } catch (error) {
            console.error('[GoogleAdsService] ❌ Erro ao criar cliente:', error.message);
            throw new Error(`Falha na autenticação com Service Account: ${error.message}`);
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
            
            // Log mais detalhado do erro
            if (error.details) {
                console.error('[GoogleAdsService] Detalhes do erro:', error.details);
            }
            
            throw error;
        }
    }

    // Método de teste simples para verificar conectividade
    async testConnection(customerAccountId) {
        try {
            console.log('[GoogleAdsService] Testando conectividade...');
            
            // Verificar se as credenciais básicas estão configuradas
            if (!process.env.GOOGLE_DEVELOPER_TOKEN) {
                throw new Error('GOOGLE_DEVELOPER_TOKEN não configurado');
            }

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