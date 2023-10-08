const express = require('express')
const EstadoController = require('../controllers/EstadoController');
const routes = express.Router();

routes.get('/', EstadoController.list)
routes.post('/', EstadoController.store)

module.exports = routes;