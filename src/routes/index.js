const express = require('express');
const router = express.Router();
const { insightsByAccountController, getSaldoController } = require('../controllers/MetricsController');
const PaginaController = require('../controllers/PaginaController');
const GoogleAdsController = require('../controllers/GoogleAdsController');
const cacheMiddleware = require('../utils/cacheMiddleware');
const {BuscarAnunciosController} = require('../controllers/AnuncioController');

// Rotas para insights de conta com cache
router.get('/metrics/account/:accountId/insights', 
  cacheMiddleware(1800), // 30 min cache
  insightsByAccountController
);
router.get('/metrics/account/:accountId/:filter/insights', 
  cacheMiddleware(1800), // 30 min cache
  insightsByAccountController
);
router.get('/metrics/account/:accountId/saldo', 
  cacheMiddleware(1800), // 30 min cache para saldo
  getSaldoController
);
router.get('/anuncios/:accountId', 
  cacheMiddleware(1800), // 30 min cache
  BuscarAnunciosController
);

// Novas rotas para páginas com cache
router.get('/paginas', 
  cacheMiddleware(1800), // 30 min cache
  PaginaController.buscarPaginas
);
router.get('/paginas/:id/forms', 
  cacheMiddleware(1800), // 30 min cache
  PaginaController.buscarFormPagina
);
router.get('/paginas/:idPagina/respostas', 
  cacheMiddleware(1800), // 30 min cache para respostas
  PaginaController.buscarRespostasForm
);

// Rotas para Google Ads
router.get('/google-ads/:customerAccountId/saldo', 
  cacheMiddleware(1800), // 30 min cache para saldo
  GoogleAdsController.getSaldoContas
);
router.get('/google-ads/:customerAccountId/info', 
  cacheMiddleware(1800), // 30 min cache
  GoogleAdsController.getCustomerInfo
);
router.get('/google-ads/:customerAccountId/test', 
  GoogleAdsController.testConnection
);

module.exports = router;
