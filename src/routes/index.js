const express = require('express');
const router = express.Router();
const { insightsByAccountController } = require('../controllers/MetricsController');

// Exemplo de rota para insights de conta
router.get('/metrics/account/:accountId/insights', insightsByAccountController);

module.exports = router;
