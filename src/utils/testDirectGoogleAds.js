const GoogleAdsServiceDirect = require('../services/GoogleAdsServiceDirect');
require('dotenv').config();

/**
 * Teste direto usando requisições HTTP para Google Ads API
 */
async function testDirectGoogleAds() {
    console.log('🚀 Testando Google Ads API com requisições HTTP diretas...\n');

    if (!process.env.GOOGLE_ADS_CUSTOMER_ID || process.env.GOOGLE_ADS_CUSTOMER_ID === 'YOUR_CUSTOMER_ID_HERE') {
        console.log('❌ GOOGLE_ADS_CUSTOMER_ID não configurado');
        return;
    }

    if (!process.env.GOOGLE_DEVELOPER_TOKEN || process.env.GOOGLE_DEVELOPER_TOKEN === 'YOUR_DEVELOPER_TOKEN_HERE') {
        console.log('❌ GOOGLE_DEVELOPER_TOKEN não configurado');
        return;
    }

    try {
        // Teste 1: Conectividade básica
        console.log('1️⃣ Testando conectividade básica...');
        const connectionTest = await GoogleAdsServiceDirect.testConnection(process.env.GOOGLE_ADS_CUSTOMER_ID);
        
        if (connectionTest.success) {
            console.log('✅ Conectividade funcionando!');
            console.log(`   Customer ID verificado: ${connectionTest.customer_id}`);
        }

        // Teste 2: Informações do cliente
        console.log('\n2️⃣ Buscando informações do cliente...');
        const customerInfo = await GoogleAdsServiceDirect.getCustomerInfo(process.env.GOOGLE_ADS_CUSTOMER_ID);
        
        if (customerInfo) {
            console.log('✅ Informações obtidas:');
            console.log(`   Nome: ${customerInfo.customer?.descriptiveName || 'N/A'}`);
            console.log(`   ID: ${customerInfo.customer?.id || 'N/A'}`);
            console.log(`   Moeda: ${customerInfo.customer?.currencyCode || 'N/A'}`);
        }

        // Teste 3: Saldos
        console.log('\n3️⃣ Buscando saldos...');
        const saldos = await GoogleAdsServiceDirect.getSaldoContas(process.env.GOOGLE_ADS_CUSTOMER_ID);
        
        if (saldos && saldos.length > 0) {
            console.log(`✅ ${saldos.length} saldo(s) encontrado(s):`);
            saldos.forEach((saldo, index) => {
                console.log(`   ${index + 1}. ${saldo.customerName}`);
                console.log(`      Saldo: ${saldo.getFormattedBalance()}`);
                console.log(`      Tipo: ${saldo.isPrepaid() ? 'Pré-pago' : 'Cartão'}`);
            });
        } else {
            console.log('⚠️ Nenhum saldo encontrado (normal se não houver budgets ativos)');
        }

        console.log('\n🎉 Teste concluído com sucesso!');
        console.log('🎯 A integração direta com Service Account está funcionando!');

    } catch (error) {
        console.error('\n❌ Erro durante o teste:', error.message);
        
        if (error.message.includes('DEVELOPER_TOKEN_NOT_APPROVED')) {
            console.log('💡 Developer Token precisa ser aprovado pelo Google');
        } else if (error.message.includes('PERMISSION_DENIED')) {
            console.log('💡 Verifique as permissões do Service Account');
        } else if (error.message.includes('401')) {
            console.log('💡 Problema de autenticação - verifique o Service Account');
        } else if (error.message.includes('403')) {
            console.log('💡 Acesso negado - verifique permissões e Developer Token');
        }
    }
}

// Executar teste se chamado diretamente
if (require.main === module) {
    testDirectGoogleAds();
}

module.exports = testDirectGoogleAds;