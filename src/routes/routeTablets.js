const express = require('express')
const TabletsController = require('../controllers/TabletController');
const routes = express.Router();

/* Routes Aplicação Mobile */
routes.get('/list/estabelecimento/:nestabelecimento', TabletsController.listEstabelecimento)
routes.get('/get/:ntablet', TabletsController.get)
routes.delete('/remover/:ntablet', TabletsController.apagarTablet)
routes.post('/update', TabletsController.updateDispositivo)
routes.post('/adicionar/:nsala', TabletsController.store)
routes.post('/validar/pin/:ntablet', TabletsController.validatePin)
routes.get('/exists/:ntablet', TabletsController.tabletExists)

/* Routes Aplicação Web */
routes.put('/atualizar/:ntablet', TabletsController.atualizarTablet) /* Atualizar Web */

routes.get('/', TabletsController.list)

module.exports = routes;