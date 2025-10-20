const { GoogleAuth } = require('google-auth-library');
const path = require('path');
require('dotenv').config();

/**
 * Teste direto do Service Account sem usar google-ads-api
 */

async function testServiceAccountDirect() {
    try {
        console.log('🔍 Testando Service Account diretamente...');
        
        const serviceAccountPath = process.env.GOOGLE_SERVICE_ACCOUNT_PATH || 
            path.join(__dirname, '../config/google-service-account.json');
        
        console.log('📁 Arquivo Service Account:', serviceAccountPath);
        
        // Configurar autenticação
        const auth = new GoogleAuth({
            keyFilename: serviceAccountPath,
            scopes: ['https://www.googleapis.com/auth/adwords'],
        });

        console.log('🔑 Obtendo cliente autenticado...');
        const authClient = await auth.getClient();
        
        console.log('🎫 Obtendo access token...');
        const accessToken = await authClient.getAccessToken();
        
        if (accessToken.token) {
            console.log('✅ Service Account funcionando!');
            console.log('🎫 Access Token obtido:', accessToken.token.substring(0, 20) + '...');
            
            // Testar uma requisição HTTP direta para Google Ads API
            console.log('🌐 Testando requisição direta para Google Ads API...');
            
            const https = require('https');
            const querystring = require('querystring');
            
            const query = `SELECT customer.id, customer.descriptive_name FROM customer WHERE customer.id = ${process.env.GOOGLE_ADS_CUSTOMER_ID}`;
            
            const postData = JSON.stringify({
                query: query
            });
            
            const options = {
                hostname: 'googleads.googleapis.com',
                port: 443,
                path: `/v16/customers/${process.env.GOOGLE_ADS_CUSTOMER_ID}/googleAds:search`,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken.token}`,
                    'developer-token': process.env.GOOGLE_DEVELOPER_TOKEN,
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };
            
            return new Promise((resolve, reject) => {
                const req = https.request(options, (res) => {
                    let data = '';
                    
                    res.on('data', (chunk) => {
                        data += chunk;
                    });
                    
                    res.on('end', () => {
                        console.log('📊 Status da resposta:', res.statusCode);
                        console.log('📋 Headers da resposta:', res.headers);
                        
                        try {
                            const response = JSON.parse(data);
                            console.log('✅ Resposta da API:', JSON.stringify(response, null, 2));
                            resolve(response);
                        } catch (error) {
                            console.log('📄 Resposta raw:', data);
                            resolve(data);
                        }
                    });
                });
                
                req.on('error', (error) => {
                    console.error('❌ Erro na requisição:', error);
                    reject(error);
                });
                
                req.write(postData);
                req.end();
            });
            
        } else {
            console.log('❌ Não foi possível obter access token');
        }
        
    } catch (error) {
        console.error('❌ Erro no teste:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Executar teste
if (require.main === module) {
    testServiceAccountDirect();
}

module.exports = testServiceAccountDirect;