const { GoogleAdsApi } = require('google-ads-api');
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

/**
 * Script de diagnóstico completo para Google Ads API
 * Verifica todos os pontos mencionados no guia de solução de problemas
 */

class GoogleAdsValidation {
    constructor() {
        this.issues = [];
        this.warnings = [];
        this.success = [];
    }

    log(type, message) {
        const timestamp = new Date().toISOString();
        const formatted = `[${timestamp}] ${message}`;
        
        switch (type) {
            case 'error':
                this.issues.push(formatted);
                console.log('❌', message);
                break;
            case 'warning':
                this.warnings.push(formatted);
                console.log('⚠️ ', message);
                break;
            case 'success':
                this.success.push(formatted);
                console.log('✅', message);
                break;
            case 'info':
                console.log('ℹ️ ', message);
                break;
        }
    }

    // 1. Verificar credenciais válidas
    validateCredentials() {
        this.log('info', 'Verificando credenciais...');

        // Verificar OAuth credenciais
        if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
            this.log('success', 'Credenciais OAuth encontradas');
            
            // Verificar formato do Client ID
            if (process.env.GOOGLE_CLIENT_ID.includes('.apps.googleusercontent.com')) {
                this.log('success', 'Formato do Client ID correto');
            } else {
                this.log('warning', 'Formato do Client ID pode estar incorreto');
            }
        } else {
            this.log('error', 'Credenciais OAuth não encontradas no .env');
        }

        // Verificar Service Account
        const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH || 
            path.join(__dirname, '../config/google-service-account.json');
        
        if (fs.existsSync(serviceAccountPath)) {
            try {
                const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
                if (serviceAccount.type === 'service_account') {
                    this.log('success', 'Service Account válido encontrado');
                    this.log('info', `Email: ${serviceAccount.client_email}`);
                    this.log('info', `Projeto: ${serviceAccount.project_id}`);
                } else {
                    this.log('error', 'Arquivo Service Account inválido');
                }
            } catch (error) {
                this.log('error', `Erro ao ler Service Account: ${error.message}`);
            }
        } else {
            this.log('warning', 'Service Account não encontrado');
        }

        // Verificar Developer Token
        if (process.env.GOOGLE_DEVELOPER_TOKEN && 
            process.env.GOOGLE_DEVELOPER_TOKEN !== 'YOUR_DEVELOPER_TOKEN_HERE') {
            this.log('success', 'Developer Token configurado');
        } else {
            this.log('error', 'Developer Token não configurado');
        }

        // Verificar Customer ID
        if (process.env.GOOGLE_ADS_CUSTOMER_ID && 
            process.env.GOOGLE_ADS_CUSTOMER_ID !== 'YOUR_CUSTOMER_ID_HERE') {
            this.log('success', 'Customer ID configurado');
            
            // Verificar formato (apenas números)
            if (/^\d+$/.test(process.env.GOOGLE_ADS_CUSTOMER_ID)) {
                this.log('success', 'Formato do Customer ID correto');
            } else {
                this.log('warning', 'Customer ID deve conter apenas números');
            }
        } else {
            this.log('error', 'Customer ID não configurado');
        }
    }

    // 2. Verificar APIs habilitadas
    async validateAPIs() {
        this.log('info', 'Verificando se as APIs estão habilitadas...');
        
        try {
            // Esta verificação seria feita via Service Usage API, mas requer configuração adicional
            // Por enquanto, vamos apenas validar se conseguimos fazer uma requisição básica
            this.log('info', 'Para verificar APIs habilitadas, acesse:');
            this.log('info', 'https://console.cloud.google.com/apis/library');
            this.log('info', 'Certifique-se de que "Google Ads API" está habilitada');
            
        } catch (error) {
            this.log('warning', `Não foi possível verificar APIs automaticamente: ${error.message}`);
        }
    }

    // 3. Testar autenticação OAuth
    async testOAuthAuthentication() {
        this.log('info', 'Testando autenticação OAuth...');
        
        if (!process.env.GOOGLE_REFRESH_TOKEN) {
            this.log('warning', 'Refresh Token não configurado - OAuth não disponível');
            return false;
        }

        try {
            const oauth2Client = new google.auth.OAuth2(
                process.env.GOOGLE_CLIENT_ID,
                process.env.GOOGLE_CLIENT_SECRET
            );

            oauth2Client.setCredentials({
                refresh_token: process.env.GOOGLE_REFRESH_TOKEN
            });

            // Tentar obter um novo access token
            const { credentials } = await oauth2Client.refreshAccessToken();
            this.log('success', 'OAuth refresh token válido');
            return true;

        } catch (error) {
            this.log('error', `OAuth falhou: ${error.message}`);
            return false;
        }
    }

    // 4. Testar Google Ads API
    async testGoogleAdsAPI() {
        this.log('info', 'Testando Google Ads API...');
        
        if (!process.env.GOOGLE_ADS_CUSTOMER_ID || !process.env.GOOGLE_DEVELOPER_TOKEN) {
            this.log('error', 'Configurações obrigatórias não encontradas');
            return false;
        }

        try {
            let client;
            
            // Tentar OAuth primeiro se disponível
            if (process.env.GOOGLE_REFRESH_TOKEN) {
                client = new GoogleAdsApi({
                    client_id: process.env.GOOGLE_CLIENT_ID,
                    client_secret: process.env.GOOGLE_CLIENT_SECRET,
                    developer_token: process.env.GOOGLE_DEVELOPER_TOKEN,
                });

                const customer = client.Customer({
                    customer_account_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
                    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
                });

                // Teste simples de query
                const query = `SELECT customer.id FROM customer WHERE customer.id = ${process.env.GOOGLE_ADS_CUSTOMER_ID} LIMIT 1`;
                await customer.query(query);
                
                this.log('success', 'Google Ads API funcionando com OAuth');
                return true;
            }

            this.log('warning', 'Não foi possível testar Google Ads API - configure GOOGLE_REFRESH_TOKEN');
            return false;

        } catch (error) {
            this.log('error', `Google Ads API falhou: ${error.message}`);
            
            // Análise específica dos erros
            if (error.message.includes('DEVELOPER_TOKEN_NOT_APPROVED')) {
                this.log('error', 'Developer Token precisa ser aprovado pelo Google');
                this.log('info', 'Solicite aprovação em: https://developers.google.com/google-ads/api/docs/first-call/dev-token');
            } else if (error.message.includes('CUSTOMER_NOT_FOUND')) {
                this.log('error', 'Customer ID não encontrado - verifique se está correto');
            } else if (error.message.includes('PERMISSION_DENIED')) {
                this.log('error', 'Permissões insuficientes - verifique as permissões da conta');
            }
            
            return false;
        }
    }

    // 5. Gerar relatório final
    generateReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📊 RELATÓRIO DE DIAGNÓSTICO');
        console.log('='.repeat(60));

        if (this.success.length > 0) {
            console.log('\n✅ SUCESSOS:');
            this.success.forEach(item => console.log(`   ${item.split('] ')[1]}`));
        }

        if (this.warnings.length > 0) {
            console.log('\n⚠️  AVISOS:');
            this.warnings.forEach(item => console.log(`   ${item.split('] ')[1]}`));
        }

        if (this.issues.length > 0) {
            console.log('\n❌ PROBLEMAS ENCONTRADOS:');
            this.issues.forEach(item => console.log(`   ${item.split('] ')[1]}`));
        }

        console.log('\n' + '='.repeat(60));
        
        if (this.issues.length === 0) {
            console.log('🎉 Configuração parece estar correta!');
        } else {
            console.log('🔧 Resolva os problemas acima para continuar');
            console.log('\n💡 PRÓXIMOS PASSOS:');
            console.log('1. Configure GOOGLE_REFRESH_TOKEN executando:');
            console.log('   node src/utils/generateRefreshToken.js');
            console.log('2. Verifique se as APIs estão habilitadas no Google Cloud Console');
            console.log('3. Confirme se o Developer Token está aprovado');
        }

        console.log('='.repeat(60));
    }

    // Executar todos os testes
    async runDiagnostics() {
        console.log('🔍 Iniciando diagnóstico completo do Google Ads API...\n');

        this.validateCredentials();
        await this.validateAPIs();
        await this.testOAuthAuthentication();
        await this.testGoogleAdsAPI();
        
        this.generateReport();
    }
}

// Executar diagnóstico se chamado diretamente
if (require.main === module) {
    const validator = new GoogleAdsValidation();
    validator.runDiagnostics().catch(error => {
        console.error('❌ Erro durante diagnóstico:', error.message);
    });
}

module.exports = GoogleAdsValidation;