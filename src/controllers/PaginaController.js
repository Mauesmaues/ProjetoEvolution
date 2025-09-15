const PaginaService = require("../services/PaginaService");
const responseFormatter = require('../utils/responseFormatter');

class PaginaController {
  async buscarPaginas(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (parseInt(page) - 1) * parseInt(limit);
      
      const todasPaginas = await PaginaService.buscarPaginas();
      const totalItens = todasPaginas.length;
      const paginasFiltradas = todasPaginas.slice(offset, offset + parseInt(limit));
      
      const resultado = {
        data: paginasFiltradas,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalItens,
          totalPages: Math.ceil(totalItens / parseInt(limit)),
          hasNext: offset + parseInt(limit) < totalItens,
          hasPrev: parseInt(page) > 1
        }
      };
      
      res.json(responseFormatter.success(resultado));
    } catch (error) {
      console.error('[PaginaController] Erro ao buscar páginas:', error);
      res.status(500).json(responseFormatter.error('Erro ao buscar páginas', error.message));
    }
  }

  async buscarFormPagina(req, res) {
    const { id } = req.params;
    try {
      const paginas = await PaginaService.buscarPaginas();
      const pagina = paginas.find(p => p.id === id);

      if (!pagina) {
        return res.status(404).json(responseFormatter.error('Página não encontrada'));
      }

      const response = await PaginaService.buscarFormPagina(id, pagina.token);
      res.json(responseFormatter.success(response));
    } catch(error) {
      console.error('[PaginaController] Erro ao buscar formulários da página:', error);
      res.status(500).json(responseFormatter.error('Erro ao buscar formulários da página', error.message));
    }
  }

  async buscarRespostasForm(req, res) {
    const { idPagina } = req.params;
    try {
      const paginas = await PaginaService.buscarPaginas();
      const pagina = paginas.find(p => p.id === idPagina);

      if (!pagina) {
        return res.status(404).json(responseFormatter.error('Página não encontrada'));
      }

      // Busca todos os formulários da página
      const formularios = await PaginaService.buscarFormPagina(pagina.id, pagina.token);
      
      if (!formularios || formularios.length === 0) {
        return res.status(404).json(responseFormatter.error('Nenhum formulário encontrado para esta página'));
      }

      // Busca respostas de todos os formulários
      const todasRespostas = [];
      for (const form of formularios) {
        const respostas = await PaginaService.buscarRespostasForm(form.id, pagina.token);
        todasRespostas.push({
          formulario: form,
          respostas: respostas
        });
      }

      res.json(responseFormatter.success(todasRespostas));
    } catch(error) {
      console.error('[PaginaController] Erro ao buscar respostas do formulário:', error);
      res.status(500).json(responseFormatter.error('Erro ao buscar respostas do formulário', error.message));
    }
  }
}

module.exports = new PaginaController();
