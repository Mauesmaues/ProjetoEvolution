const express = require('express');
const router = express.Router();
const { insightsByAccountController, getSaldoController } = require('../controllers/MetricsController');
const PaginaController = require('../controllers/PaginaController');

// Exemplo de rota para insights de conta
router.get('/metrics/account/:accountId/insights', insightsByAccountController);
router.get('/metrics/account/:accountId/:filter/insights', insightsByAccountController);
router.get('/metrics/account/:accountId/saldo', getSaldoController);

// Novas rotas para páginas
router.get('/paginas', PaginaController.buscarPaginas);
router.get('/paginas/:id/forms', PaginaController.buscarFormPagina);
router.get('/paginas/:idPagina/respostas', PaginaController.buscarRespostasForm);

module.exports = router;
