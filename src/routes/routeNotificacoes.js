const express = require('express');
const NotificacaoController = require('../controllers/NotificacaoController');
const routes = express.Router();

routes.get('/user/:nutilizador', NotificacaoController.list)
routes.post('/update/:nnotificacao', NotificacaoController.update)
routes.post('/send/oneuser', NotificacaoController.one_user)

module.exports = routes;