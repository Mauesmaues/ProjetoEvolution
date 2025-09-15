const express = require('express');
const router = express.Router();
const { insightsByAccountController, getSaldoController } = require('../controllers/MetricsController');
const PaginaController = require('../controllers/PaginaController');
const cacheMiddleware = require('../utils/cacheMiddleware');

// Rotas para insights de conta com cache
router.get('/metrics/account/:accountId/insights', 
  cacheMiddleware(300), // 5 min cache
  insightsByAccountController
);
router.get('/metrics/account/:accountId/:filter/insights', 
  cacheMiddleware(300), // 5 min cache
  insightsByAccountController
);
router.get('/metrics/account/:accountId/saldo', 
  cacheMiddleware(600), // 10 min cache para saldo
  getSaldoController
);

// Novas rotas para páginas com cache
router.get('/paginas', 
  cacheMiddleware(300), // 5 min cache
  PaginaController.buscarPaginas
);
router.get('/paginas/:id/forms', 
  cacheMiddleware(300), // 5 min cache
  PaginaController.buscarFormPagina
);
router.get('/paginas/:idPagina/respostas', 
  cacheMiddleware(120), // 2 min cache para respostas
  PaginaController.buscarRespostasForm
);

module.exports = router;
