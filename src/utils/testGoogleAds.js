const GoogleAdsService = require('../services/GoogleAdsService');
require('dotenv').config();

/**
 * Script de teste para validar a integração com Google Ads API
 */
async function testGoogleAdsIntegration() {
    console.log('🚀 Iniciando teste da integração Google Ads...\n');

    // Verificar variáveis de ambiente
    console.log('📋 Verificando configurações:');
    console.log('✓ GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Configurado' : '❌ Não configurado');
    console.log('✓ GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Configurado' : '❌ Não configurado');
    console.log('✓ GOOGLE_SERVICE_ACCOUNT_PATH:', process.env.GOOGLE_SERVICE_ACCOUNT_PATH ? 'Configurado' : '❌ Não configurado');
    console.log('✓ GOOGLE_DEVELOPER_TOKEN:', 
        process.env.GOOGLE_DEVELOPER_TOKEN && process.env.GOOGLE_DEVELOPER_TOKEN !== 'YOUR_DEVELOPER_TOKEN_HERE' 
            ? 'Configurado' : '❌ Não configurado');
    console.log('✓ GOOGLE_ADS_CUSTOMER_ID:', 
        process.env.GOOGLE_ADS_CUSTOMER_ID && process.env.GOOGLE_ADS_CUSTOMER_ID !== 'YOUR_CUSTOMER_ID_HERE' 
            ? 'Configurado' : '❌ Não configurado');

    if (!process.env.GOOGLE_ADS_CUSTOMER_ID || process.env.GOOGLE_ADS_CUSTOMER_ID === 'YOUR_CUSTOMER_ID_HERE') {
        console.log('\n❌ GOOGLE_ADS_CUSTOMER_ID é obrigatório para o teste');
        console.log('💡 Encontre seu Customer ID em: https://ads.google.com/');
        console.log('💡 Adicione no .env: GOOGLE_ADS_CUSTOMER_ID="1234567890"');
        console.log('💡 Formato: apenas números, sem traços (ex: 1234567890)');
        return;
    }

    if (!process.env.GOOGLE_DEVELOPER_TOKEN || process.env.GOOGLE_DEVELOPER_TOKEN === 'YOUR_DEVELOPER_TOKEN_HERE') {
        console.log('\n❌ GOOGLE_DEVELOPER_TOKEN é obrigatório');
        console.log('💡 Obtenha em: https://developers.google.com/google-ads/api/docs/first-call/dev-token');
        console.log('💡 Adicione no .env: GOOGLE_DEVELOPER_TOKEN="SEU_TOKEN_AQUI"');
        return;
    }

    try {
        console.log('\n🔍 Testando conectividade...');
        
        // Teste 0: Teste de conectividade básico
        console.log('\n0️⃣ Teste de conectividade básico...');
        const connectionTest = await GoogleAdsService.testConnection(process.env.GOOGLE_ADS_CUSTOMER_ID);
        
        if (connectionTest.success) {
            console.log('✅ Conectividade básica funcionando');
            console.log(`   - Customer ID verificado: ${connectionTest.customer_id}`);
        }
        
        // Teste 1: Informações do cliente
        console.log('\n1️⃣ Buscando informações do cliente...');
        const customerInfo = await GoogleAdsService.getCustomerInfo(process.env.GOOGLE_ADS_CUSTOMER_ID);
        
        if (customerInfo) {
            console.log('✅ Cliente encontrado:');
            console.log(`   - ID: ${customerInfo.customer.id}`);
            console.log(`   - Nome: ${customerInfo.customer.descriptive_name}`);
            console.log(`   - Moeda: ${customerInfo.customer.currency_code}`);
            console.log(`   - Fuso: ${customerInfo.customer.time_zone}`);
        }

        // Teste 2: Saldos das contas
        console.log('\n2️⃣ Buscando saldos das contas...');
        const saldos = await GoogleAdsService.getSaldoContas(process.env.GOOGLE_ADS_CUSTOMER_ID);
        
        if (saldos && saldos.length > 0) {
            console.log(`✅ ${saldos.length} conta(s) encontrada(s):`);
            saldos.forEach((saldo, index) => {
                console.log(`   ${index + 1}. ${saldo.customerName}`);
                console.log(`      - Saldo: ${saldo.getFormattedBalance()}`);
                console.log(`      - Tipo: ${saldo.isPrepaid() ? 'Pré-pago' : 'Cartão de Crédito'}`);
            });
        } else {
            console.log('⚠️ Nenhum saldo encontrado (pode ser normal se não houver budgets ativos)');
        }

        console.log('\n🎉 Teste concluído com sucesso!');
        console.log('\n📌 Endpoints disponíveis:');
        console.log('   GET /api/v1/google-ads/{customerAccountId}/info');
        console.log('   GET /api/v1/google-ads/{customerAccountId}/saldo');
        console.log('   GET /api/v1/google-ads/{customerAccountId}/test');

    } catch (error) {
        console.error('\n❌ Erro durante o teste:', error.message);
        
        // Diagnósticos mais específicos
        if (error.message.includes('DEVELOPER_TOKEN_NOT_APPROVED')) {
            console.log('\n💡 Seu Developer Token precisa ser aprovado pelo Google');
            console.log('   Solicite aprovação em: https://developers.google.com/google-ads/api/docs/first-call/dev-token');
        } else if (error.message.includes('DEVELOPER_TOKEN_NOT_ON_ALLOWLIST')) {
            console.log('\n💡 Developer Token não está na allowlist');
            console.log('   Entre em contato com o suporte do Google Ads API');
        } else if (error.message.includes('authentication') || error.message.includes('refresh token')) {
            console.log('\n💡 Problema de autenticação:');
            console.log('   1. Verifique se o Service Account está configurado corretamente');
            console.log('   2. Ou configure o GOOGLE_REFRESH_TOKEN para OAuth');
            console.log('   3. Verifique se o arquivo google-service-account.json existe');
        } else if (error.message.includes('CUSTOMER_NOT_FOUND')) {
            console.log('\n💡 Customer ID não encontrado:');
            console.log('   1. Verifique se o GOOGLE_ADS_CUSTOMER_ID está correto');
            console.log('   2. Remova traços e use apenas números');
        } else {
            console.log('\n💡 Erro genérico - detalhes:');
            console.log('   ', error);
        }
    }
}

// Executar teste se chamado diretamente
if (require.main === module) {
    testGoogleAdsIntegration();
}

module.exports = testGoogleAdsIntegration;