const express = require('express')
const EstabelecimentosController = require('../controllers/EstabelecimentoController');
const routes = express.Router();

//Estabelecimentos
routes.get('/get/:nestabelecimento', EstabelecimentosController.get)
routes.post('/adicionar', EstabelecimentosController.store)
routes.put('/atualizar/estabelecimento/:nestabelecimento', EstabelecimentosController.atualizarEstabelecimento)
routes.put('/atualizar/estado/:nestabelecimento', EstabelecimentosController.atualizarEstado)
routes.delete('/remover/:nestabelecimento', EstabelecimentosController.apagarEstabelecimento)
routes.post('/estabelecimentos/:nutilizador', EstabelecimentosController.associate)
routes.get('/estabelecimentos/check/', EstabelecimentosController.checkEstabelecimento)
routes.get('/disponiveis', EstabelecimentosController.listDisponiveis)
routes.get('/', EstabelecimentosController.list)
//routes.post('/users/:nutilizador/estabelecimentos', EstController.associate)

module.exports = routes;