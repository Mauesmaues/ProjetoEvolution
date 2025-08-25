const express = require('express');
const router = express.Router();
const { insightsByAccountController, getSaldoController } = require('../controllers/MetricsController');

// Exemplo de rota para insights de conta
router.get('/metrics/account/:accountId/insights', insightsByAccountController);
router.get('/metrics/account/:accountId/:filter/insights', insightsByAccountController);
router.get('/metrics/account/:accountId/saldo', getSaldoController);

module.exports = router;
