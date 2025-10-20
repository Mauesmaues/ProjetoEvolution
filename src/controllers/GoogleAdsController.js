const GoogleAdsService = require('../services/GoogleAdsService');
const responseFormatter = require('../utils/responseFormatter');

class GoogleAdsController {
    // Buscar saldo das contas Google Ads
    async getSaldoContas(req, res) {
        try {
            const { customerAccountId } = req.params;
            
            if (!customerAccountId) {
                return res.status(400).json(
                    responseFormatter.error('Customer Account ID é obrigatório')
                );
            }

            console.log('[GoogleAdsController] Buscando saldo para conta:', customerAccountId);
            
            const saldos = await GoogleAdsService.getSaldoContas(customerAccountId);
            
            if (!saldos || saldos.length === 0) {
                return res.status(404).json(
                    responseFormatter.error('Nenhum saldo encontrado para esta conta')
                );
            }

            console.log('[GoogleAdsController] ✅ Saldos encontrados:', saldos.length);
            res.json(responseFormatter.success(saldos));

        } catch (error) {
            console.error('[GoogleAdsController] Erro ao buscar saldos:', error.message);
            res.status(500).json(
                responseFormatter.error('Erro ao buscar saldos do Google Ads', error.message)
            );
        }
    }

    // Buscar informações básicas do cliente
    async getCustomerInfo(req, res) {
        try {
            const { customerAccountId } = req.params;
            
            if (!customerAccountId) {
                return res.status(400).json(
                    responseFormatter.error('Customer Account ID é obrigatório')
                );
            }

            const customerInfo = await GoogleAdsService.getCustomerInfo(customerAccountId);
            
            if (!customerInfo) {
                return res.status(404).json(
                    responseFormatter.error('Cliente não encontrado')
                );
            }

            res.json(responseFormatter.success(customerInfo));

        } catch (error) {
            console.error('[GoogleAdsController] Erro ao buscar info do cliente:', error.message);
            res.status(500).json(
                responseFormatter.error('Erro ao buscar informações do cliente', error.message)
            );
        }
    }

    // Endpoint de teste para verificar conectividade
    async testConnection(req, res) {
        try {
            const { customerAccountId } = req.params;
            
            if (!customerAccountId) {
                return res.status(400).json(
                    responseFormatter.error('Customer Account ID é obrigatório')
                );
            }

            const customerInfo = await GoogleAdsService.getCustomerInfo(customerAccountId);
            
            const connectionStatus = {
                status: 'connected',
                customer: customerInfo,
                timestamp: new Date().toISOString()
            };

            res.json(responseFormatter.success(connectionStatus));

        } catch (error) {
            console.error('[GoogleAdsController] Erro no teste de conexão:', error.message);
            res.status(500).json(
                responseFormatter.error('Falha no teste de conexão', error.message)
            );
        }
    }
}

module.exports = new GoogleAdsController();