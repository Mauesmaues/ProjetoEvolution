const { JWT } = require('google-auth-library');
const https = require('https');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Carregar credenciais do arquivo
const serviceAccountPath = path.join(__dirname, '../config/google-service-account.json');
const serviceAccountKey = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

async function getAccessToken() {
    try {
        const jwtClient = new JWT({
            email: serviceAccountKey.client_email,
            key: serviceAccountKey.private_key,
            scopes: ['https://www.googleapis.com/auth/adwords'],
        });

        await jwtClient.authorize();
        return jwtClient.credentials.access_token;
    } catch (error) {
        throw new Error(`Erro ao obter token: ${error.message}`);
    }
}

async function testCustomersEndpoint() {
    try {
        console.log('🔍 Testando endpoint de listagem de contas acessíveis...');
        
        const accessToken = await getAccessToken();
        console.log('✅ Token obtido');

        // Tentar listar contas acessíveis primeiro
        const listOptions = {
            hostname: 'googleads.googleapis.com',
            port: 443,
            path: '/v16/customers:listAccessibleCustomers',
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'developer-token': process.env.GOOGLE_DEVELOPER_TOKEN,
                'Content-Type': 'application/json'
            }
        };

        console.log('📡 Fazendo requisição para:', `https://${listOptions.hostname}${listOptions.path}`);

        return new Promise((resolve, reject) => {
            const req = https.request(listOptions, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    console.log('📊 Status da resposta:', res.statusCode);
                    console.log('📊 Headers da resposta:', res.headers);
                    console.log('📊 Dados recebidos:', data.substring(0, 1000));

                    if (res.statusCode === 200) {
                        try {
                            const response = JSON.parse(data);
                            console.log('✅ Contas acessíveis:', response);
                            resolve(response);
                        } catch (parseError) {
                            reject(new Error(`Erro ao parsear JSON: ${parseError.message}`));
                        }
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.end();
        });

    } catch (error) {
        console.error('❌ Erro:', error.message);
        throw error;
    }
}

async function testSpecificCustomer() {
    try {
        console.log('\n🎯 Testando acesso a customer específico...');
        
        const accessToken = await getAccessToken();
        const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
        
        const query = 'SELECT customer.id, customer.descriptive_name FROM customer LIMIT 1';
        const postData = JSON.stringify({ query });

        const options = {
            hostname: 'googleads.googleapis.com',
            port: 443,
            path: `/v16/customers/${customerId}/googleAds:search`,
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'developer-token': process.env.GOOGLE_DEVELOPER_TOKEN,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        console.log('📡 URL:', `https://${options.hostname}${options.path}`);

        return new Promise((resolve, reject) => {
            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    console.log('📊 Status:', res.statusCode);
                    console.log('📊 Resposta:', data.substring(0, 500));

                    if (res.statusCode === 200) {
                        try {
                            const response = JSON.parse(data);
                            resolve(response);
                        } catch (parseError) {
                            reject(new Error(`Parse error: ${parseError.message}`));
                        }
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(error);
            });

            req.write(postData);
            req.end();
        });

    } catch (error) {
        console.error('❌ Erro:', error.message);
        throw error;
    }
}

async function main() {
    try {
        console.log('🚀 Diagnóstico completo da Google Ads API\n');
        
        // Teste 1: Listar contas acessíveis
        await testCustomersEndpoint();
        
        // Teste 2: Tentar acessar customer específico
        await testSpecificCustomer();
        
    } catch (error) {
        console.error('💥 Erro geral:', error.message);
    }
}

main();