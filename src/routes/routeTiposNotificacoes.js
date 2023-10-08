const express = require('express')
const TipoNotificacaoController = require('../controllers/TipoNotificacaoController');
const routes = express.Router();

routes.get('/', TipoNotificacaoController.list)
routes.post('/', TipoNotificacaoController.store)

module.exports = routes;