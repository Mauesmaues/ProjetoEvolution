# Meta Ads BI

Business Intelligence para análise de dados do Meta Ads e Google Ads, seguindo padrão MVC e orientação a objetos.

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o arquivo `.env` com seus tokens do Meta Ads e Google Ads.
3. Inicie o servidor em modo desenvolvimento:
   ```bash
   npm run dev
   ```
   Ou em modo produção:
   ```bash
   npm start
   ```

## Configuração Google Ads

1. **Service Account (Recomendado):**
   - Crie uma Service Account no Google Cloud Console
   - Baixe o arquivo JSON e salve em `src/config/google-service-account.json`
   - Configure `GOOGLE_SERVICE_ACCOUNT_PATH` no .env

2. **Developer Token:**
   - Obtenha em: https://developers.google.com/google-ads/api/docs/first-call/dev-token
   - Configure `GOOGLE_DEVELOPER_TOKEN` no .env

3. **Customer ID:**
   - Configure `GOOGLE_ADS_CUSTOMER_ID` no .env

## Estrutura

- `/src/config` — configurações e variáveis de ambiente
- `/src/controllers` — controladores das requisições
- `/src/models` — classes e regras de negócio
- `/src/services` — integração com APIs (Meta Ads, Google Ads)
- `/src/routes` — rotas da aplicação
- `/src/utils` — funções auxiliares
- `server.js` — ponto de entrada

## Endpoints

### Meta Ads
- `GET /api/v1/metrics/campaigns` — métricas de campanhas
- `GET /api/v1/metrics/adsets` — métricas de conjuntos de anúncios
- `GET /api/v1/metrics/ads` — métricas de anúncios individuais
- `GET /api/v1/metrics/account/:accountId/saldo` — saldo da conta Meta Ads

### Google Ads
- `GET /api/v1/google-ads/:customerAccountId/saldo` — saldo das contas Google Ads
- `GET /api/v1/google-ads/:customerAccountId/info` — informações do cliente
- `GET /api/v1/google-ads/:customerAccountId/test` — teste de conectividade

### Páginas e Formulários
- `GET /api/v1/paginas` — listar páginas
- `GET /api/v1/paginas/:id/forms` — formulários da página
- `GET /api/v1/paginas/:idPagina/respostas` — respostas dos formulários

## Teste da Integração

Execute o teste para verificar a configuração:
```bash
node src/utils/testGoogleAds.js
```

## Pronto para expansão

Estrutura modular para adicionar novos provedores e funcionalidades.
