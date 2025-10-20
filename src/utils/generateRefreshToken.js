const { google } = require('googleapis');
require('dotenv').config();

/**
 * Script para gerar refresh token usando OAuth
 * Execute: node src/utils/generateRefreshToken.js
 */

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'http://localhost:3002/callback' // Usar URI que já está configurado
);

// Gerar URL de autorização
const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: ['https://www.googleapis.com/auth/adwords'],
  prompt: 'consent'
});

console.log('🔗 Para resolver o problema de autenticação, precisamos gerar um refresh token');
console.log('🔗 Acesse esta URL:');
console.log(authUrl);
console.log('\n📋 Após autorizar:');
console.log('1. Você será redirecionado para localhost:3002/callback?code=...');
console.log('2. Copie o código da URL (depois de "code=")');
console.log('3. Execute: node src/utils/exchangeCodeForToken.js SEU_CODIGO');

module.exports = { oauth2Client };