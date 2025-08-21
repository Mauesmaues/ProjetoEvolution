# Meta Ads BI

Business Intelligence para análise de dados do Meta Ads, seguindo padrão MVC e orientação a objetos.

## Como rodar

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o arquivo `.env` com seu token do Meta Ads.
3. Inicie o servidor em modo desenvolvimento:
   ```bash
   npm run dev
   ```
   Ou em modo produção:
   ```bash
   npm start
   ```

## Estrutura

- `/src/config` — configurações e variáveis de ambiente
- `/src/controllers` — controladores das requisições
- `/src/models` — classes e regras de negócio
- `/src/services` — integração com API do Meta Ads
- `/src/routes` — rotas da aplicação
- `/src/utils` — funções auxiliares
- `server.js` — ponto de entrada

## Endpoints

- `GET /api/v1/metrics/campaigns` — métricas de campanhas
- `GET /api/v1/metrics/adsets` — métricas de conjuntos de anúncios
- `GET /api/v1/metrics/ads` — métricas de anúncios individuais

## Pronto para expansão

Estrutura modular para adicionar novos provedores (Google Ads, etc).
