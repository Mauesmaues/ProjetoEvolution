const path = require('path');

module.exports = {
    // Credenciais OAuth
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
    
    // Developer Token (obrigatório)
    GOOGLE_DEVELOPER_TOKEN: process.env.GOOGLE_DEVELOPER_TOKEN,
    
    // Service Account
    GOOGLE_SERVICE_ACCOUNT_PATH: process.env.GOOGLE_SERVICE_ACCOUNT_PATH || path.join(__dirname, 'google-service-account.json'),
    
    // Customer ID padrão (opcional)
    GOOGLE_ADS_CUSTOMER_ID: process.env.GOOGLE_ADS_CUSTOMER_ID,
    
    // Configurações da API
    GOOGLE_ADS_API_VERSION: 'v16',
    GOOGLE_ADS_API_URL: 'https://googleads.googleapis.com',
    
    // Configurações de cache
    CACHE_DURATION: {
        AUTHENTICATION: 30 * 60 * 1000, // 30 minutos
        ACCOUNT_BUDGET: 30 * 60 * 1000,  // 30 minutos
        CUSTOMER_INFO: 30 * 60 * 1000,    // 30 minutos
    },
    
    // Escopos necessários
    SCOPES: ['https://www.googleapis.com/auth/adwords'],
    
    // Configurações de retry
    RETRY_CONFIG: {
        attempts: 3,
        delay: 1000, // 1 segundo
        backoff: 2   // multiplicador
    }
};