const express = require('express')
const SalaController = require('../controllers/SalaController');
const routes = express.Router();
const middleware = require('../middleware/jsonWebToken')

/* Routes Aplicação Mobile */
routes.get('/estabelecimento/:nestabelecimento', SalaController.salasEstabelecimento)
routes.get('/get/:nsala', SalaController.getSalaById)
routes.get('/state/:nsala', SalaController.getCurrentState)
routes.get('/next_reserva/:nsala', SalaController.proximaReserva)
routes.post('/update/estado', SalaController.updateEstado)
routes.post('/update', SalaController.updateSala)
routes.get('/list', SalaController.list)

/* Routes Aplicação Web */
routes.post('/create/:nestabelecimento', SalaController.store)
routes.get('/count/salas/:nestabelecimento', SalaController.getSalas)
routes.post('/adicionar', middleware.checkToken, SalaController.createSala)
routes.put('/atualizar/estado/:nsala', SalaController.atualizarEstado)
routes.put('/atualizar/sala/:nsala', SalaController.editarSala)
routes.delete('/remover/:nsala', SalaController.apagarSala)


module.exports = routes;