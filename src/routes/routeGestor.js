const express = require('express')
const GestorController = require('../controllers/GestorController');
const routes = express.Router();
const middleware = require('../middleware/jsonWebToken')

routes.get('/get/:nutilizador', GestorController.list)
routes.get('/decoded', middleware.checkToken, GestorController.listDecoded)
routes.get('/gestores', GestorController.listAll)
routes.post('/:nutilizador/gestores', GestorController.store)

module.exports = routes;