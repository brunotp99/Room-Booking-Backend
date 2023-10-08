const express = require('express')
const PedidosController = require('../controllers/PedidosController');
const middleware = require('../middleware/jsonWebToken')
const routes = express.Router();

routes.get('/list/:nestabelecimento', PedidosController.list)
routes.post('/tipo/:nestabelecimento', PedidosController.listType)
routes.get('/get/:npedido', PedidosController.get)
routes.get('/atual/:nestabelecimento', PedidosController.necessidadeAtual)
routes.post('/create', middleware.checkToken, PedidosController.novoPedido)
routes.post('/finish', PedidosController.terminarPedido)
routes.delete('/delete/:npedido', PedidosController.removerPedido)
routes.put('/update/:npedido', PedidosController.alterarPedido)

module.exports = routes;