const { oauth2Client } = require('./generateRefreshToken');
require('dotenv').config();

/**
 * Script para trocar código por refresh token
 * Execute: node src/utils/exchangeCodeForToken.js SEU_CODIGO
 */

async function exchangeCodeForToken(code) {
  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    console.log('✅ Tokens gerados com sucesso!');
    console.log('\n📝 Adicione esta linha ao seu arquivo .env:');
    console.log(`GOOGLE_REFRESH_TOKEN="${tokens.refresh_token}"`);
    
    console.log('\n🔄 Agora execute o teste novamente:');
    console.log('node src/utils/testGoogleAds.js');
    
    return tokens;
  } catch (error) {
    console.error('❌ Erro ao trocar código por tokens:', error.message);
  }
}

// Pegar código da linha de comando
const code = process.argv[2];
if (!code) {
  console.log('❌ Por favor, forneça o código:');
  console.log('node src/utils/exchangeCodeForToken.js SEU_CODIGO');
  process.exit(1);
}

exchangeCodeForToken(code);