const PaginaService = require("../services/PaginaService");
class PaginaController {
  async buscarPaginas(req, res) {
    try {
      const paginas = await PaginaService.buscarPaginas();
      res.json(paginas);
    } catch (error) {
      console.error('[PaginaController] Erro ao buscar páginas:', error);
      res.status(500).json({ error: 'Erro ao buscar páginas' });
    }
  }
}
